/**
 * Represents a box with position, size, and associated data.
 */
export class Box {
  /** The x-coordinate of the box's position. */
  public x: number = 0;
  /** The y-coordinate of the box's position. */
  public y: number = 0;
  /** The width of the box, or 'auto' for automatic sizing. */
  public width: number | 'auto' = 'auto';
  /** The height of the box, or 'auto' for automatic sizing. */
  public height: number | 'auto' = 'auto';
  /** The data or content associated with the box. */
  public data: string = '';

  /**
   * Creates a new Box instance.
   * @param data Optional data or content for the box.
   */
  constructor(data?: string) {
    this.data = data || '';
  }
}
