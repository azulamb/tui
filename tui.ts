import {
  InputLoop,
  MouseEventData,
  OnInputEvent,
  OnMouseEvent,
} from './input_loop.ts';
import { Terminal } from './terminal.ts';

export interface OnMouseClick {
  (event: MouseClickData): void | Promise<unknown>;
}
export interface MouseClickData {
  x: number;
  y: number;
  startX: number;
  startY: number;
  button: number;
  msec: number;
}
export interface OnMouseWheel {
  (event: MouseWheelData): void | Promise<unknown>;
}
export interface MouseWheelData {
  x: number;
  y: number;
  wheel: -1 | 1;
}
export interface OnResize {
  (): unknown;
}

export class StringEx {
  static split(data: string) {
    return [...data];
  }

  static splitLines(data: string, width: number) {
    const lines: string[] = [];

    if (width < 1) {
      return lines;
    }

    lines.push('');

    let w = 0;
    this.split(data).forEach((char) => {
      const l = this.isWide(char) ? 2 : 1;

      if (w + l <= width) {
        w += l;
        lines[lines.length - 1] += char;
      } else {
        w = l;
        lines.push(char);
      }
    });

    return lines;
  }

  static size(data: string) {
    return this.split(data).length;
  }

  static width(data: string) {
    return this.split(data).map((char) => {
      return this.isWide(char) ? 2 : 1;
    }).reduce((total, current) => {
      return total + current;
    }, 0);
  }

  static isWide(char: string) {
    // deno-lint-ignore no-control-regex
    return !!char.match(/^[^\x01-\x7E\xA1-\xDF]+$/);
  }
}

export class Box {
  public x: number = 0;
  public y: number = 0;
  public width: number | 'auto' = 'auto';
  public height: number | 'auto' = 'auto';
  public data: string = '';

  constructor(data?: string) {
    this.data = data || '';
  }
}

export class Tui {
  private input: InputLoop = new InputLoop();
  private term: Terminal = new Terminal();
  private mouse: { click?: OnMouseEvent; wheel?: OnMouseEvent } = {};

  public get terminal() {
    return this.term;
  }

  public setTerminal(terminal: Terminal) {
    this.term = terminal;
  }

  public setExit(exitKey: Uint8Array) {
    this.input.setExit(exitKey);

    return this;
  }

  public enableMouse(enable: boolean = true) {
    this.term.enableMouseSync(enable);
  }

  public set onInput(onInput: OnInputEvent) {
    this.input.onInput = onInput;
  }

  public set onMouse(onMouse: OnMouseEvent) {
    this.input.onMouse = onMouse;
  }

  private onMouseEvent() {
    return async (event: MouseEventData) => {
      if (0 < event.button) {
        if (!this.mouse.click) {
          return;
        }
        return this.mouse.click(event);
      } else if (event.wheel) {
        if (!this.mouse.wheel) {
          return;
        }
        return this.mouse.wheel(event);
      }
    };
  }

  public set onClick(onClick: OnMouseClick) {
    this.mouse.click = OnClick(onClick);

    this.onMouse = this.onMouseEvent();
  }

  public set onWheel(onWheel: OnMouseWheel) {
    this.mouse.wheel = OnWheel(onWheel);

    this.onMouse = this.onMouseEvent();
  }

  public set onResize(onResize: OnResize) {
    this.term.onResize = onResize;
  }

  public start(init?: () => unknown) {
    this.term.clearSync();
    this.term.moveSync();

    if (init) {
      init();
    }

    return this.input.start().then((result) => {
      this.cleanUpTerminal();
      return result;
    }).catch((error) => {
      this.cleanUpTerminal();
      throw error;
    });
  }

  private cleanUpTerminal() {
    this.term.enableMouseSync(false);
    this.term.stopMonitorSignal();
  }

  public exit() {
    return this.input.exit();
  }

  public createBox(data?: string) {
    return new Box(data);
  }

  public drawBox(box: Box) {
    const width = this.terminal.width - box.x + 1;
    const strings = StringEx.splitLines(box.data, width);
    const height = box.height === 'auto' ? strings.length : box.height;
    for (let y = 0; y < height; ++y) {
      this.terminal.moveSync(box.x, box.y + y);
      this.terminal.writeSync((new TextEncoder()).encode(strings[y] || ''));
    }
  }
}

function OnClick(onClick: OnMouseClick) {
  const clicks: { [keys: number]: MouseClickData } = {};
  return async (event: MouseEventData) => {
    if (event.click) {
      clicks[event.button] = {
        x: event.x,
        y: event.y,
        startX: event.x,
        startY: event.y,
        button: event.button,
        msec: Date.now(),
      };
    } else if (clicks[event.button]) {
      const data = clicks[event.button];
      data.x = event.x;
      data.y = event.y;
      data.msec = Date.now() - data.msec;
      delete clicks[event.button];

      return onClick(data);
    }
  };
}

function OnWheel(onWheel: OnMouseWheel) {
  return async (event: MouseEventData) => {
    if (!event.wheel) {
      return;
    }
    return onWheel(
      {
        x: event.x,
        y: event.y,
        wheel: event.wheel,
      },
    );
  };
}
