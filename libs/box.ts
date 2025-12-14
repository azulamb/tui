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
