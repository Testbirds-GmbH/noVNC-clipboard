export default class TeChClipboard {
    constructor(options = {}) {
        this.target = options.target;
        this.onPaste = options.onPaste;
        this.onCopy = options.onCopy;
        this._handlers = {};
        ['cut', 'copy', 'paste'].forEach((type) => {
            this._handlers[type] = this._handler.bind(this, type);
        });
        if (options.enabled) {
            this.enable();
        } else {
            this.active = false;
        }
        this._isMac = window.navigator.platform.toUpperCase().startsWith('MAC');
        this._ctrlKeyEvent = null;
    }

    _handler(type, event) {
        console.log(type, event);
        if (this.active) {
            let clipboardData;
            let clipboardType;
            let ie = false;
            // Getting clipboard Data
            if (event.clipboardData) {
                clipboardData = event.clipboardData;
                clipboardType = 'text/plain';
            } else {
                // IE is more complicated -.-
                clipboardData = window.clipboardData;
                clipboardType = 'Text';
                ie = true;
            }
            if (clipboardData) {
                switch (type) {
                    case 'cut':
                    case 'copy':
                        clipboardData.setData(clipboardType, this.onCopy());
                        break;
                    case 'paste':
                        const clipboardText = clipboardData.getData(clipboardType);
                        if (!ie) {
                            this.onPaste(clipboardText);
                        } else {
                            setTimeout(this.onPaste, 100, clipboardText); // IE -.-
                        }
                        break;
                }
            } else {
                // Often clipboardData is empty when it does not contain text, or in case the string is empty
                console.log('clipboardData undefined');
            }
            event.preventDefault();
        }
    };

    enable() {
        this.active = true;
        ['cut', 'copy', 'paste'].forEach((type) => {
            document.addEventListener(type, this._handlers[type]);
        });
    }

    disable() {
        this.active = false;
        ['cut', 'copy', 'paste'].forEach((type) => {
            document.removeEventListener(type, this._handlers[type]);
        });
        this.target.blur();
    }

    /**
     * This method decides whether to stop the event or not.
     */
    onKeyEvent(eventHandlers, type, e) {
        console.log(type, e.key);
        let forward = true;
        if (this.active) {
            const isControl = (!this._isMac && e.key === 'Control') || (this._isMac && e.key === 'Meta');
            if (type === 'keydown' && isControl) {
                // First: ctrl key down
                this._ctrlKeyEvent = e;
                // forward = false;
            } else if (this._ctrlKeyEvent !== null) {
                // Next: ctrl is pressed, prepare for copy/paste
                if (e.key === 'c' || e.key === 'x' || e.key === 'v') {
                    this._prepareHiddenInput();
                    forward = false;
                } else {
                    // user presses some other combination, forward to remote and cancel ctrl
                    // This also is executed when ctrl up
                    this._ctrlKeyEvent = null;
                }
            }
        }

        if (forward && eventHandlers) {
            // forward the event to noVNC
            eventHandlers[type](e);
        }
    }

    _prepareHiddenInput() {
        this.target.value = ' ';
        this.target.focus();
        this.target.select();
    }
}