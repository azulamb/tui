/**
 * Input loop for handling keyboard and mouse events in the terminal.
 */
export interface OnInputEvent {
  (buf: Uint8Array): void | Promise<unknown>;
}

/**
 * Mouse event callback type.
 */
export interface OnMouseEvent {
  (event: MouseEventData): void | Promise<unknown>;
}

/**
 * Mouse event data.
 */
export interface MouseEventData {
  x: number; // x position.
  y: number; // y position.
  click: boolean; // Pressed = true, Released = false
  button: number; // Left click = 1, Wheel click = 2, Right click = 3
  wheel: -1 | 1 | 0; // No wheel = 0, Up = -1, Down = 1
  buffer: Uint8Array; // raw buffer data.
}

/**
 * InputLoop class
 */
export class InputLoop {
  private exitKey: Uint8Array = Uint8Array.from([27]); // ESC
  private onInputCallback: OnInputEvent = () => {};
  private onMouseCallback: OnMouseEvent | null = null;
  private alive = false;

  private setRaw(raw: boolean, option?: Deno.SetRawOptions) {
    return Deno.stdin.setRaw(raw, option);
  }

  private isExit(buf: Uint8Array, length: number) {
    if (this.exitKey.length !== length) {
      return false;
    }

    for (let i = 0; i < length; ++i) {
      if (buf[i] !== this.exitKey[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Set the key sequence that will cause the input loop to exit.
   * @param exitKey The key sequence to exit on.
   */
  public setExit(exitKey: Uint8Array): this {
    this.exitKey = exitKey;
    return this;
  }

  /**
   * Set input event callback.
   * @param onInput The input event callback.
   */
  public set onInput(onInput: OnInputEvent) {
    this.onInputCallback = onInput;
  }

  /**
   * Set mouse event callback.
   * @param onMouse The mouse event callback.
   */
  public set onMouse(onMouse: OnMouseEvent) {
    this.onMouseCallback = onMouse;
  }

  /**
   * Start the input loop.
   * @returns A promise that resolves when the loop ends.
   */
  public start(): Promise<void> {
    return this.loop().catch((error) => {
      this.end();
      throw error;
    });
  }

  private end() {
    if (!this.alive) {
      return;
    }

    this.alive = false;

    this.setRaw(false);
  }

  /**
   * Exit the input loop.
   */
  public exit(): void {
    this.end();

    Deno.stdin.close();
  }

  private async loop(): Promise<void> {
    this.setRaw(true);

    const readBuf = new Uint8Array(32);

    this.alive = true;
    while (this.alive) {
      const length = await Deno.stdin.read(readBuf);
      if (length === null) {
        throw new Error('Read error.');
      }
      const exit = await this.onInputEvent(readBuf, length);
      if (exit) {
        break;
      }
    }

    this.end();
  }

  private async onInputEvent(buffer: Uint8Array, length: number) {
    if (this.isExit(buffer, length)) {
      return true;
    }
    const buf = buffer.slice(0, length);

    const mouse = this.onMouseCallback && this.isMouse(buf);
    if (mouse) {
      await (<OnMouseEvent> this.onMouseCallback)(mouse) || Promise.resolve();
    } else {
      await this.onInputCallback(buf) || Promise.resolve();
    }

    return false;
  }

  private isMouse(buffer: Uint8Array) {
    if (
      buffer.length < 9 || buffer[0] !== 27 || buffer[1] !== 91 ||
      buffer[2] !== 60
    ) {
      return null;
    }
    const mouse: MouseEventData = {
      x: 0,
      y: 0,
      click: false,
      button: 0,
      wheel: 0,
      buffer: buffer,
    };

    if (48 <= buffer[3] && buffer[3] <= 50) {
      // Click.
      if (buffer[buffer.length - 1] === 77) {
        mouse.click = true;
      } else if (buffer[buffer.length - 1] !== 109) {
        return null;
      }
      mouse.button = buffer[3] - 47;
      const position = this.mousePosition(buffer.slice(5, buffer.length - 1));
      mouse.x = position.x;
      mouse.y = position.y;
    } else if (buffer[3] === 54 && buffer[buffer.length - 1] === 77) {
      // Wheel.
      if (buffer[4] === 52) {
        // Up
        mouse.wheel = -1;
      } else if (buffer[4] === 53) {
        // Down
        mouse.wheel = 1;
      } else {
        return null;
      }
      const position = this.mousePosition(buffer.slice(6, buffer.length - 1));
      mouse.x = position.x;
      mouse.y = position.y;
    }

    return Number.isInteger(mouse.x) && Number.isInteger(mouse.y)
      ? mouse
      : null;
  }

  private mousePosition(buffer: Uint8Array) {
    const values = (new TextDecoder()).decode(buffer).split(';');
    return { x: parseInt(values[0]), y: parseInt(values[1]) };
  }
}
