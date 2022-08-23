export class Timer {
  public delay: number;
  public running: boolean;
  public remaining: number;

  public started?: number;
  public timeout?: NodeJS.Timeout;

  public callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.delay = delay;
    this.running = false;
    this.callback = callback;
    this.remaining = this.delay;
  }

  public start(): void {
    this.running = true;
    this.started = new Date().getTime();
    this.timeout = setTimeout(this.callback, this.delay);
  }

  public reset(): void {
    this.stop();
    this.remaining = this.delay;
  }

  public stop(): void {
    this.running = false;
    this.remaining = this.delay - (new Date().getTime() - (this.started || 0));
    if (this.timeout) clearTimeout(this.timeout);
  }

  public getTimeLeft(): number {
    if (this.running) {
      this.remaining =
        this.delay - (new Date().getTime() - (this.started || 0));
    }

    if (this.remaining < 0) this.remaining = 0;

    return this.remaining;
  }
}
