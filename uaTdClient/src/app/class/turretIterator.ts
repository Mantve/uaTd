import Tower from "./tower";
import Turret from "./turret";

export interface Iterator {
  getNext();
  hasMore();
}


export interface IterableCollection {
  clear();

  getItems(): Turret[];

  getCount(): number;

  addItem(item: Turret): void;
}

export class TurretIterator implements Iterator {
  iterationState = 0;
  collection: IterableCollection;
  constructor(collection: IterableCollection) {
    this.collection = collection;
  }
  hasMore(): boolean {
    return this.iterationState < this.collection.getCount();
  }
  getNext() {
    if (!this.hasMore())
      this.iterationState = 0
    let item = this.collection.getItems()[this.iterationState];
    this.iterationState++;
    return item
  }
}

export class TurretColection implements IterableCollection {
  turrets: Turret[] = [];
  constructor() {

  }

  public clear(){
    this.turrets=[];
  }

  public getItems(): Turret[] {
    return this.turrets;
  }

  public getCount(): number {
    return this.turrets.length;
  }

  public addItem(item: Turret): void {
    this.turrets.push(item);
  }
}