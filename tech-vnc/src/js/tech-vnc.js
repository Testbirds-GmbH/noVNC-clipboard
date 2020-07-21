import RFB from "@novnc/novnc/core/rfb" //../../node_modules/@novnc/novnc/core/rfb";
import TeChClipboard from "tech-clipboard";
import * as browser from "@novnc/novnc/core/util/browser";
import * as Log from '@novnc/novnc/core/util/logging';

export class TeChVNC {
    constructor(target, url, options) {
        this._options = options;
        this._target = target;
        this._url = url;
        this._active = true;
        if (options.logLevel) {
            Log.init_logging(options.logLevel);
        }
        this.clipboard = new TeChClipboard(options.clipboard);
        this._connect();
    }

    disconnect() {
        this._active = false;
        this.deactivate();
        this.rfb.disconnect();
    }

    activate() {
        this.rfb.focus();
    }

    deactivate() {
        this.rfb.blur();
    }

    sendCtrlAltDel() {
        this.rfb.sendCtrlAltDel();
    }

    _connect() {
        Log.Debug('Connecting to', this._url);
        this.rfb = new RFB(this._target, this._url, this._options.rfb);
        this.rfb.addEventListener('disconnect', () => {
            if (this._active) {
                // reconnect
                setTimeout(() => {
                    this._connect();
                }, 10000);
            }
        });
        this._customizeKeyboard();
        this._customizeFocus();
        if (this._options.onResize) {
            this._addResizeHandler();
        }
        if (this._options.onMouseMove) {
            this._addMouseMoveHandler();
        }
    };

    _addResizeHandler() {
        const originalHandler = this.rfb._resize.bind(this.rfb);
        this.rfb._resize = (width, height) => {
            originalHandler(width, height);
            this._options.onResize(width, height);
        }
    }

    _addMouseMoveHandler() {
        const originalHandler = this.rfb._mouse._updateMousePosition.bind(this.rfb._mouse);
        this.rfb._mouse._updateMousePosition = (event) => {
            originalHandler(event);
            this._options.onMouseMove(event);
        }
    }

    _customizeFocus() {
        this.rfb.focus = () => {
            this.rfb._canvas.focus({preventScroll: true});
        }
    }

    _customizeKeyboard() {
        const keyboard = this.rfb._keyboard;
        const _keyHandlers = {
            keydown: this.clipboard.onKeyEvent.bind(this.clipboard, keyboard._eventHandlers, 'keydown'),
            keyup: this.clipboard.onKeyEvent.bind(this.clipboard, keyboard._eventHandlers, 'keyup'),
            keypress: this.clipboard.onKeyEvent.bind(this.clipboard, keyboard._eventHandlers, 'keypress')
        };
        keyboard.grab = () => {
            // replace the grab to add our handlers instead of theirs
            ['keydown', 'keyup', 'keypress'].forEach((type) => {
                this._target.addEventListener(type, _keyHandlers[type]);
            });

            // We have to redo everything noVNC does in the grab function
            // Release (key up) if window loses focus
            window.addEventListener('blur', keyboard._eventHandlers.blur);

            // Firefox has broken handling of Alt, so we need to poll as
            // best we can for releases (still doesn't prevent the menu
            // from popping up though as we can't call preventDefault())
            if (browser.isWindows() && browser.isFirefox()) {
                const handler = keyboard._eventHandlers.checkalt;
                ['mousedown', 'mouseup', 'mousemove', 'wheel',
                    'touchstart', 'touchend', 'touchmove',
                    'keydown', 'keyup'].forEach(type =>
                    document.addEventListener(type, handler,
                        {
                            capture: true,
                            passive: true
                        }));
            }
        };

        keyboard.ungrab = () => {
            if (browser.isWindows() && browser.isFirefox()) {
                const handler = keyboard._eventHandlers.checkalt;
                ['mousedown', 'mouseup', 'mousemove', 'wheel',
                    'touchstart', 'touchend', 'touchmove',
                    'keydown', 'keyup'].forEach(type => document.removeEventListener(type, handler));
            }

            ['keydown', 'keyup', 'keypress'].forEach((type) => {
                this._target.removeEventListener(type, _keyHandlers[type]);
            });
            window.removeEventListener('blur', keyboard._eventHandlers.blur);
            // Release (key up) all keys that are in a down state
            keyboard._allKeysUp();
        }
    }
}
