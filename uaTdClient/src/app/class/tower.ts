import * as Phaser from 'phaser';

export default class Tower extends Phaser.GameObjects.Image {
    nextTic;
    enemies;
    bullets;
    map;

    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'tower');
        this.nextTic = 0;
    }

    setGameData(enemies, bullets, map) {
        this.enemies = enemies;
        this.bullets = bullets;
        this.map = map;
    }

    // we will place the tower according to the grid
    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
        this.map[i][j] = 1;
    }

    fire() {
        var enemy = this.getEnemy(this.x, this.y, 100);
        if (enemy) {
            var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
            this.addBullet(this.x, this.y, angle);
            this.angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
        }
    }

    update(time, delta) {
        if (time > this.nextTic) {
            this.fire();
            this.nextTic = time + 1000;
        }
    }

    addBullet(x, y, angle) {
        var bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(x, y, angle);
        }
    }
    
    getEnemy(x, y, distance) {
        var enemyUnits = this.enemies.getChildren();
        for (var i = 0; i < enemyUnits.length; i++) {
            if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                return enemyUnits[i];
        }
        return false;
    }
};