export abstract class PoolTile extends Phaser.GameObjects.Image {
  parent: PoolTile;
  i: number;
  j: number;

  constructor(scene, frame) {
    super(scene, 0, 0, 'pool', frame);
  }

  setParent(parent: PoolTile) {
    this.parent = parent;
  }

  getParent(): PoolTile {
    return this.parent;
  }

  public add(poolTile: PoolTile): void { }

  public remove(poolTile: PoolTile): void { }

  public isPool(): boolean {
    return false;
  }

  place(i, j) {
    this.i = i,
        this.j = j;

    this.y = i * 64 + 64 / 2;
    this.x = j * 64 + 64 / 2;
  }
}

export class Pool extends PoolTile {
  protected poolTiles: PoolTile[] = [];

  public add(poolTile: PoolTile): void {
    this.poolTiles.push(poolTile);
    poolTile.depth = -1;
    this.scene.children.add(poolTile);
  }

  public remove(poolTile: PoolTile): void {
    const poolTileIndex = this.poolTiles.indexOf(poolTile);
    this.poolTiles.splice(poolTileIndex, 1);

    poolTile.setParent(null);
  }

  public isComposite(): boolean {
    return true;
  }
}

export class LavaPoolTile extends PoolTile {
  constructor(scene) {
    super(scene, 'lava');
  }
}

export class WaterPoolTile extends PoolTile {
  constructor(scene) {
    super(scene, 'water');
  }
}

