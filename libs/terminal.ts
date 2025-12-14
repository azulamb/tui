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

/**
 * Terminal class
 */
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

  /**
   * Check if the OS is Windows.
   */
  public get isWindows(): boolean {
    return Deno.build.os === 'windows';
  }

  /**
   * Set resize event callback.
   */
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

  /**
   * Stop monitoring resize signal.
   */
  public stopMonitorSignal(): void {
    if (this.onSigwinch) {
      if (!this.isWindows) {
        Deno.removeSignalListener('SIGWINCH', this.onSigwinch);
      }
      this.onSigwinch = null;
    }
  }

  protected enc(str: string): Uint8Array {
    return this.encoder.encode(str);
  }

  /**
   * Set writer instance.
   * @param writer Writer instance to set.
   */
  public setWriter(writer: Writer): this {
    this.writer = writer;

    this.updateSize();

    return this;
  }

  private updateSize() {
    const size = Deno.consoleSize();
    this.w = size.columns;
    this.h = size.rows;
  }

  /**
   * Get terminal width.
   */
  public get width(): number {
    return this.w;
  }

  /**
   * Get terminal width.
   */
  public get columns(): number {
    return this.w;
  }

  /**
   * Get terminal height.
   */
  public get height(): number {
    return this.h;
  }

  /**
   * Get terminal height.
   */
  public get rows(): number {
    return this.h;
  }

  /**
   * Write data to the terminal.
   * @param buf Data buffer to write.
   * @returns Number of bytes written or a promise that resolves to it.
   */
  public write(buf: Uint8Array): number | Promise<number> {
    return this.syncMode ? this.writeSync(buf) : this.writeAsync(buf);
  }

  /**
   * Write data to the terminal synchronously.
   * @param buf Data buffer to write.
   * @returns Number of bytes written.
   */
  public writeSync(buf: Uint8Array): number {
    return this.writer.writeSync(buf);
  }

  /**
   * Write data to the terminal asynchronously.
   * @param buf Data buffer to write.
   * @returns Promise that resolves to the number of bytes written.
   */
  public writeAsync(buf: Uint8Array): Promise<number> {
    return this.writer.write(buf);
  }

  protected _reset(): string {
    return `${this.esc}0m`;
  }

  public reset(): number | Promise<number> {
    return this[this.syncMode ? 'resetSync' : 'resetAsync']();
  }

  /**
   * Reset terminal formatting synchronously.
   * @returns Number of bytes written.
   */
  public resetSync(): number {
    return this.writeSync(this.enc(this._reset()));
  }

  /**
   * Reset terminal formatting asynchronously.
   * @returns Promise that resolves to the number of bytes written.
   */
  public resetAsync(): Promise<number> {
    return this.writeAsync(this.enc(this._reset()));
  }

  protected _clear(mode: number): string {
    return `${this.esc}${mode}J`;
  }

  /**
   * Clear the terminal.
   * @param mode Clear mode. Default is Terminal.CLEAR.ALL.
   * @returns Number of bytes written or a promise that resolves to it.
   */
  public clear(mode = Terminal.CLEAR.ALL): number | Promise<number> {
    return this[this.syncMode ? 'clearSync' : 'clearAsync'](mode);
  }

  /**
   * Clear the terminal synchronously.
   * @param mode Clear mode. Default is Terminal.CLEAR.ALL.
   * @returns Number of bytes written.
   */
  public clearSync(mode = Terminal.CLEAR.ALL): number {
    return this.writeSync(this.enc(this._clear(mode)));
  }

  /**
   * Clear the terminal asynchronously.
   * @param mode Clear mode. Default is Terminal.CLEAR.ALL.
   * @returns Promise that resolves to the number of bytes written.
   */
  public clearAsync(mode = Terminal.CLEAR.ALL): Promise<number> {
    return this.writeAsync(this.enc(this._clear(mode)));
  }

  protected _scroll(scroll: number): string {
    return `${this.esc}${Math.abs(scroll)}${scroll < 0 ? 'T' : 'S'}`;
  }

  /**
   * Scroll the terminal.
   * @param scroll Number of lines to scroll. Positive to scroll down, negative to scroll up.
   * @returns Number of bytes written or a promise that resolves to it.
   */
  public scroll(scroll: number): number | Promise<number> {
    return this[this.syncMode ? 'scrollSync' : 'scrollAsync'](scroll);
  }

  /**
   * Scroll the terminal synchronously.
   * @param scroll Number of lines to scroll. Positive to scroll down, negative to scroll up.
   * @returns Number of bytes written.
   */
  public scrollSync(scroll: number): number {
    return this.writeSync(this.enc(this._scroll(scroll)));
  }

  /**
   * Scroll the terminal asynchronously.
   * @param scroll Number of lines to scroll. Positive to scroll down, negative to scroll up.
   * @returns Promise that resolves to the number of bytes written.
   */
  public scrollAsync(scroll: number): Promise<number> {
    return this.writeAsync(this.enc(this._scroll(scroll)));
  }

  protected _showCursor(show: boolean): string {
    return `${this.esc}?25${show ? 'h' : 'l'}`;
  }

  /**
   * Set cursor visibility.
   * @param show Whether to show the cursor.
   * @returns Number of bytes written or a promise that resolves to it.
   */
  public showCursor(show: boolean): number | Promise<number> {
    return this[this.syncMode ? 'showCursorSync' : 'showCursorAsync'](show);
  }

  /**
   * Set cursor visibility synchronously.
   * @param show Whether to show the cursor.
   * @returns Number of bytes written.
   */
  public showCursorSync(show: boolean): number {
    return this.writeSync(this.enc(this._showCursor(show)));
  }

  /**
   * Set cursor visibility asynchronously.
   * @param show Whether to show the cursor.
   * @returns Promise that resolves to the number of bytes written.
   */
  public showCursorAsync(show: boolean): Promise<number> {
    return this.writeAsync(this.enc(this._showCursor(show)));
  }

  protected _move(x: number, y: number): string {
    return `${this.esc}${y};${x}H`;
  }

  /**
   * Move the cursor to a specific position.
   * @param x The column number (1-based).
   * @param y The row number (1-based).
   * @returns Number of bytes written or a promise that resolves to it.
   */
  public move(x: number = 1, y: number = 1): number | Promise<number> {
    return this[this.syncMode ? 'moveSync' : 'moveAsync'](x, y);
  }

  /**
   * Move the cursor to a specific position synchronously.
   * @param x The column number (1-based).
   * @param y The row number (1-based).
   * @returns Number of bytes written.
   */
  public moveSync(x: number = 1, y: number = 1): number {
    return this.writeSync(this.enc(this._move(x, y)));
  }

  /**
   * Move the cursor to a specific position asynchronously.
   * @param x The column number (1-based).
   * @param y The row number (1-based).
   * @returns Promise that resolves to the number of bytes written.
   */
  public moveAsync(x: number = 1, y: number = 1): Promise<number> {
    return this.writeAsync(this.enc(this._move(x, y)));
  }

  protected _enableMouse(enable: boolean): string {
    return `${this.esc}?1000;1006;1015${enable ? 'h' : 'l'}`;
  }

  /**
   * Enable or disable mouse support.
   * @param enable Whether to enable mouse support.
   * @returns Number of bytes written or a promise that resolves to it.
   */
  public enableMouse(enable: boolean): number | Promise<number> {
    return this[this.syncMode ? 'enableMouseSync' : 'enableMouseAsync'](enable);
  }

  /**
   * Enable or disable mouse support synchronously.
   * @param enable Whether to enable mouse support.
   * @returns Number of bytes written.
   */
  public enableMouseSync(enable: boolean): number {
    return this.writeSync(this.enc(this._enableMouse(enable)));
  }

  /**
   * Enable or disable mouse support asynchronously.
   * @param enable Whether to enable mouse support.
   * @returns Promise that resolves to the number of bytes written.
   */
  public enableMouseAsync(enable: boolean): Promise<number> {
    return this.writeAsync(this.enc(this._enableMouse(enable)));
  }
}
