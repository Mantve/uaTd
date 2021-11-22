export class MapObject {
  x: number;
  y: number;
  value: number;

  constructor(x: number, y: number, value: number) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
}

export class MapData {
  budget: number;
  name: string;
  size: number[];
  objects: MapObject[] = [];

  public objectsFromCoords(x, y): MapObject[] {
    return this.objects.filter(o => o.x == x && o.y == y);
  }
}
