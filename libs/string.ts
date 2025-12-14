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
