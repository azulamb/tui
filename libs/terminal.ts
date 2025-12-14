interface ClearMode {
  BEFORE: number;
  AFTER: number;
  ALL: number;
}

type Writer = {
  write(p: Uint8Array): Promise<number>;
  writeSync(p: Uint8Array): number;
  close(): void;
  isTerminal(): boolean;
};

export class Terminal {
  static CLEAR: ClearMode = {
    BEFORE: 0,
    AFTER: 1,
    ALL: 2,
  };

  public syncMode = true;

  protected esc = '\u001B[';
  protected encoder: TextEncoder = new TextEncoder();
  protected writer: Writer = Deno.stdout;
  private w: number = 0;
  private h: number = 0;
  private onSigwinch: null | (() => unknown) = null;

  constructor() {
    this.setWriter(Deno.stdout);
  }

  public get isWindows() {
    return Deno.build.os === 'windows';
  }

  public set onResize(callback: () => unknown) {
    this.stopMonitorSignal();
    this.onSigwinch = () => {
      this.updateSize();

      callback();
    };
    if (!this.isWindows) {
      Deno.addSignalListener('SIGWINCH', this.onSigwinch);
    }
  }

  public stopMonitorSignal() {
    if (this.onSigwinch) {
      if (!this.isWindows) {
        Deno.removeSignalListener('SIGWINCH', this.onSigwinch);
      }
      this.onSigwinch = null;
    }
  }

  protected enc(str: string) {
    return this.encoder.encode(str);
  }

  public setWriter(writer: Writer) {
    this.writer = writer;

    this.updateSize();

    return this;
  }

  private updateSize() {
    const size = Deno.consoleSize();
    this.w = size.columns;
    this.h = size.rows;
  }

  public get width() {
    return this.w;
  }
  public get columns() {
    return this.w;
  }
  public get height() {
    return this.h;
  }
  public get rows() {
    return this.h;
  }

  public write(buf: Uint8Array) {
    return this.syncMode ? this.writeSync(buf) : this.writeAsync(buf);
  }
  public writeSync(buf: Uint8Array) {
    return this.writer.writeSync(buf);
  }
  public writeAsync(buf: Uint8Array) {
    return this.writer.write(buf);
  }

  protected _reset() {
    return `${this.esc}0m`;
  }
  public reset() {
    return this[this.syncMode ? 'resetSync' : 'resetAsync']();
  }
  public resetSync() {
    return this.writeSync(this.enc(this._reset()));
  }
  public resetAsync() {
    return this.write(this.enc(this._reset()));
  }

  protected _clear(mode: number) {
    return `${this.esc}${mode}J`;
  }
  public clear(mode = Terminal.CLEAR.ALL) {
    return this[this.syncMode ? 'clearSync' : 'clearAsync'](mode);
  }
  public clearSync(mode = Terminal.CLEAR.ALL) {
    return this.writeSync(this.enc(this._clear(mode)));
  }
  public clearAsync(mode = Terminal.CLEAR.ALL) {
    return this.write(this.enc(this._clear(mode)));
  }

  protected _scroll(scroll: number) {
    return `${this.esc}${Math.abs(scroll)}${scroll < 0 ? 'T' : 'S'}`;
  }
  public scroll(scroll: number) {
    return this[this.syncMode ? 'scrollSync' : 'scrollAsync'](scroll);
  }
  public scrollSync(scroll: number) {
    return this.writeSync(this.enc(this._scroll(scroll)));
  }
  public scrollAsync(scroll: number) {
    return this.write(this.enc(this._scroll(scroll)));
  }

  protected _showCursor(show: boolean) {
    return `${this.esc}?25${show ? 'h' : 'l'}`;
  }
  public showCursor(show: boolean) {
    return this[this.syncMode ? 'showCursorSync' : 'showCursorAsync'](show);
  }
  public showCursorSync(show: boolean) {
    return this.write(this.enc(this._showCursor(show)));
  }
  public showCursorAsync(show: boolean) {
    return this.write(this.enc(this._showCursor(show)));
  }

  protected _move(x: number, y: number) {
    return `${this.esc}${y};${x}H`;
  }
  public move(x: number = 1, y: number = 1) {
    return this[this.syncMode ? 'moveSync' : 'moveAsync'](x, y);
  }
  public moveSync(x: number = 1, y: number = 1) {
    return this.writeSync(this.enc(this._move(x, y)));
  }
  public moveAsync(x: number = 1, y: number = 1) {
    return this.write(this.enc(this._move(x, y)));
  }

  protected _enableMouse(enable: boolean) {
    return `${this.esc}?1000;1006;1015${enable ? 'h' : 'l'}`;
  }
  public enableMouse(enable: boolean) {
    return this[this.syncMode ? 'enableMouseSync' : 'enableMouseAsync'](enable);
  }
  public enableMouseSync(enable: boolean) {
    return this.writeSync(this.enc(this._enableMouse(enable)));
  }
  public enableMouseAsync(enable: boolean) {
    return this.write(this.enc(this._enableMouse(enable)));
  }
}
