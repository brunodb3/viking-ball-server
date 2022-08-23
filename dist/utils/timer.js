"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    constructor(callback, delay) {
        Object.defineProperty(this, "delay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "running", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "remaining", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "started", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "callback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.delay = delay;
        this.running = false;
        this.callback = callback;
        this.remaining = this.delay;
    }
    start() {
        this.running = true;
        this.started = new Date().getTime();
        this.timeout = setTimeout(this.callback, this.delay);
    }
    reset() {
        this.stop();
        this.remaining = this.delay;
    }
    stop() {
        this.running = false;
        this.remaining = this.delay - (new Date().getTime() - (this.started || 0));
        if (this.timeout)
            clearTimeout(this.timeout);
    }
    getTimeLeft() {
        if (this.running) {
            this.remaining =
                this.delay - (new Date().getTime() - (this.started || 0));
        }
        if (this.remaining < 0)
            this.remaining = 0;
        return this.remaining;
    }
}
exports.Timer = Timer;
//# sourceMappingURL=timer.js.map