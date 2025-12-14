/**
 * String utilities.
 */
export class StringEx {
  /**
   * Split a string into an array of characters.
   * @param data The string to split.
   * @returns An array of characters.
   */
  static split(data: string): string[] {
    return [...data];
  }

  /**
   * Split a string into lines of a specified width.
   * @param data The string to split.
   * @param width The width of each line.
   * @returns An array of lines.
   */
  static splitLines(data: string, width: number): string[] {
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

  /**
   * Get the number of characters in a string.
   * @param data The string to measure.
   * @returns The number of characters.
   */
  static size(data: string): number {
    return this.split(data).length;
  }

  /**
   * Get the width of a string.
   * @param data The string to measure.
   * @returns The width of the string.
   */
  static width(data: string): number {
    return this.split(data).map((char) => {
      return this.isWide(char) ? 2 : 1;
    }).reduce((total, current) => {
      return total + current;
    }, 0);
  }

  /**
   * Check if a character is wide (full-width).
   * @param char The character to check.
   * @returns True if the character is wide, false otherwise.
   */
  static isWide(char: string): boolean {
    // deno-lint-ignore no-control-regex
    return !!char.match(/^[^\x01-\x7E\xA1-\xDF]+$/);
  }
}
