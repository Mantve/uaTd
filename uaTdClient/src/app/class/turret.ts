import * as Phaser from 'phaser';
import { constants } from './_constants';
import Bullet, { RocketType } from './rocket';
import Tower from './tower';

export default class Turret extends Tower {
    nextTic;
    enemies;
    rockets;
    towers;
    i;
    j;
    rocketTypes: RocketType[] = [];

    modifier: 1;

    parts: string[];
    //dtype: Phaser.GameObjects.Text;

    label: Phaser.GameObjects.Text;

    constructor(scene, sprite = 'turret') {
        super(scene, sprite);

        /*
        this.label = new Phaser.GameObjects.Text(scene, this.x, this.y, "", {});
        scene.children.add(this.label);
        this.label.setVisible(true);
        this.label.setStroke('0x000000', 3);
        */
    }

    override setGameData(enemies, rockets, towers) {
        this.enemies = enemies;
        this.rockets = rockets;
        this.towers = towers;
    }

    update(time, delta) {
        if (time > this.nextTic) {
            this.angle = this.shoot(this.enemies, this.rockets, this.x, this.y);
            this.nextTic = time + 1000;
        }
    }

    shoot(enemies, rockets, x, y, multiplier = 1) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 125 * multiplier);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(rockets, x, y, angle, multiplier);
            return (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
        }
        return 0;
    }

    getEnemy(enemies, x, y, distance) {
        var enemyUnits = enemies.getChildren();
        for (var i = 0; i < enemyUnits.length; i++) {
            if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                return enemyUnits[i];
        }
        return false;
    }

    addBullet(rockets, x, y, angle, multiplier = 1) {
        var rocket = rockets.get();

        if (rocket) {
            var rocketType = this.getBulletType(300, constants.BULLET_DAMAGE, 0.6)
            rocket.rocket = rocketType;
            rocket.fire(x, y, angle);
        }
    }


    public getBulletType(lifespan, damage, speed): RocketType {
        let something = this.rocketTypes.find(x => x.damage == damage && x.lifespan == lifespan && x.speed == speed);
        if (something != null) {
            return something;
        }
        else {
            let rocket = new RocketType(lifespan, speed, damage)
            this.rocketTypes.push(rocket)
            return rocket;
        }
    }
}

export class LaserTurret extends Turret {
    constructor(scene) {
        super(scene, 'laserTurret');
    }
    override update(time, delta) {
        if (time > this.nextTic) {
            this.angle = this.shoot(this.enemies, this.rockets, this.x, this.y);
            this.nextTic = time + 10;
        }
    }

    addBullet(rockets, x, y, angle, multiplier = 1) {
        var rocket = rockets.get();

        if (rocket) {
            var rocketType = this.getBulletType(3000, constants.BULLET_DAMAGE / 50, 0.2)
            rocket.rocket = rocketType;
            rocket.fire(x, y, angle);
        }
    }
}

export class WaveTurret extends Turret {
    shot: number = 0
    constructor(scene) {
        super(scene, 'waveTurret');
    }

    override update(time, delta) {
        if (time > this.nextTic) {
            if (time - this.nextTic >= 1000)
                this.shot = 0;
            this.angle = this.shoot(this.enemies, this.rockets, this.x, this.y);
            this.shot++
            if (this.shot == 3) {
                this.shot = 0;
                this.nextTic = time + 1000;
            }
            else {
                this.nextTic = time + 50;
            }
        }
    }

    addBullet(rockets, x, y, angle, multiplier = 1) {
        var rocket = rockets.get();

        if (rocket) {
            var rocketType = this.getBulletType(300, constants.BULLET_DAMAGE / 3, 0.6)
            rocket.rocket = rocketType;
            rocket.fire(x, y, angle);
        }
    }
}
