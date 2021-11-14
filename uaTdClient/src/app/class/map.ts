export default class Map extends Phaser.GameObjects.Image {
  scene;
  pathPoints;
  paths;

  constructor(scene, sprite, pathPoints) {
    let gameWidth = <number><unknown>scene.game.config.width;
    let gameHeight = <number><unknown>scene.game.config.height;

    super(scene, gameWidth / 2, gameHeight / 2, sprite);

    this.scene = scene;
    this.pathPoints = pathPoints;

    this.paths = [];
  }

  drawPath(graphics, finTiles) {
    this.pathPoints.forEach(path => {
      let newPath = this.scene.add.path(path[0][0], -32);
      path.forEach(
        point => newPath.lineTo(point[0], point[1]));

      graphics.lineStyle(3, 0xffffff, 1);
      newPath.draw(graphics);

      let last = path.slice(-1)[0];

      let ft = new Phaser.GameObjects.Rectangle(this.scene, last[0], last[1], 64, 64, 0xff0000, 0.25);
      ft.setActive(true);
      ft.setVisible(true);
      finTiles.add(ft);

      this.paths.push(newPath);
    });
  }

  drawGrid(graphics) {
    let gameWidth = <number><unknown>this.scene.game.config.width;
    let gameHeight = <number><unknown>this.scene.game.config.height;

      graphics.lineStyle(1, 0xffffff, 0.15);
      for (var i = 0; i <= gameWidth / 64; i++) {
        graphics.moveTo(i * 64, 0);
        graphics.lineTo(i * 64, gameHeight);
      }
      for (var j = 0; j <= gameHeight / 64; j++) {
        graphics.moveTo(0, j * 64);
        graphics.lineTo(gameWidth, j * 64);
      }
      graphics.strokePath();
  }
}
