import TeChClipboard from '../src/js/tech-clipboard'

describe("TeChClipboard.onKeyEvent", function () {

    const fakeEvent = function (key) {
        return {key};
    };

    beforeEach(function () {
        this.clipboard = new TeChClipboard({enabled: true});
        this.keyHandlers = jasmine.createSpyObj('keyHandlers', ['keydown', 'keyup', 'keypress']);
        spyOn(this.clipboard, 'prepareHiddenInput');
        this.onKeyEvent = function (type, event) {
            return this.clipboard.onKeyEvent(this.keyHandlers, type, event);
        };
        this.checkState = function (event) {
            expect(this.clipboard._ctrlKeyEvent).toBe(event || null);
        }
    });

    it("does not forward ctrl key", function () {
        const event = fakeEvent('Control');
        this.onKeyEvent('keydown', event);
        expect(this.keyHandlers.keydown).not.toHaveBeenCalled();
        this.checkState(event);
    });

    it("does forward c key", function () {
        const event = fakeEvent('c');
        this.onKeyEvent('keydown', event);
        expect(this.keyHandlers.keydown).toHaveBeenCalledWith(event);
        this.checkState();
    });

    it("detects ctrl c", function () {
        const cEvent = fakeEvent('c');
        const ctrlEvent = fakeEvent('Control');
        this.onKeyEvent('keydown', ctrlEvent);
        this.onKeyEvent('keydown', cEvent);
        this.checkState(ctrlEvent);
        this.onKeyEvent('keyup', cEvent);
        this.onKeyEvent('keyup', ctrlEvent);
        expect(this.keyHandlers.keydown).toHaveBeenCalledTimes(1);
        expect(this.keyHandlers.keydown).toHaveBeenCalledWith(ctrlEvent);
        expect(this.keyHandlers.keyup).toHaveBeenCalledTimes(1);
        expect(this.keyHandlers.keyup).toHaveBeenCalledWith(ctrlEvent);
        expect(this.keyHandlers.keypress).not.toHaveBeenCalled();
        this.checkState();
    });
});