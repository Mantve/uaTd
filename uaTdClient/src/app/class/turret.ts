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
    multiplier;
    multiplierUntil;
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
            this.angle = this.shoot(this.enemies, this.rockets, this.x, this.y, this.multiplier);
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

export interface PlaneElement {
    changeMultiplier(mul: number)
}

export class LaserTurret extends Turret implements PlaneElement{
    constructor(scene) {
        super(scene, 'laserTurret');
    }

    changeMultiplier(mul: number) {
        this.multiplier = mul;
        this.multiplierUntil = this.nextTic + 2000;
    }

    override update(time, delta) {
        if (this.multiplierUntil < time) {
            this.multiplier = 1;
        }
        if (time > this.nextTic) {
            this.angle = this.shoot(this.enemies, this.rockets, this.x, this.y, this.multiplier);
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

export class WaveTurret extends Turret implements PlaneElement {
    shot: number = 0
    constructor(scene) {
        super(scene, 'waveTurret');
    }

    changeMultiplier(mul: number) {
        this.multiplier = mul;
        this.multiplierUntil = this.nextTic + 2000;
    }

    override update(time, delta) {
        if (this.multiplierUntil < time) {
            this.multiplier = 1;
        }
        if (time > this.nextTic) {
            if (time - this.nextTic >= 1000)
                this.shot = 0;
            this.angle = this.shoot(this.enemies, this.rockets, this.x, this.y, this.multiplier);
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

export class MultiTurret extends Turret implements PlaneElement{
    shootingState: ShootingState;
    public currentState: number = 3;
    constructor(scene) {
        super(scene, 'multiTurret');
        this.shootingState = new LaserShooting();
    }

    changeMultiplier(mul: number) {
        this.multiplier = mul;
        this.multiplierUntil = this.nextTic + 2000;
    }

    override update(time, delta) {
        if (this.multiplierUntil < time) {
            this.multiplier = 1;
        }
        this.shootingState.action(time, delta, this)
    }

    override shoot(enemies, rockets, x, y, multiplier = 1) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 125 * multiplier);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.shootingState.addBullet(rockets, x, y, angle, multiplier, this);
            return (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
        }
        return 0;
    }

    changeState(state: number) {
        this.currentState = state;
        switch (state) {
            case 3:
                {
                    this.shootingState = new NoShooting();
                    break;
                }
            case 0:
                {
                    this.shootingState = new SimpleShooting();
                    break;
                }
            case 1:
                {
                    this.shootingState = new LaserShooting();
                    break;
                }
            case 2:
                {
                    this.shootingState = new WaveShooting();
                }
        }
    }
}

export interface ShootingState {
    action(time, delta, turret: Turret): void
    addBullet(rockets, x, y, angle, multiplier, turret: Turret): void
}

class LaserShooting implements ShootingState {
    action(time, delta, turret: Turret) {
        if (time > turret.nextTic) {
            turret.shoot(turret.enemies, turret.rockets, turret.x, turret.y, turret.multiplier);
            turret.nextTic = time + 10;
        }
    }
    addBullet(rockets, x, y, angle, multiplier, turret: Turret) {
        var rocket = rockets.get();

        if (rocket) {
            var rocketType = turret.getBulletType(3000, constants.BULLET_DAMAGE / 50, 0.2)
            rocket.rocket = rocketType;
            rocket.fire(x, y, angle);
        }
    }

}

class SimpleShooting implements ShootingState {
    action(time, delta, turret: Turret) {
        if (time > turret.nextTic) {
            turret.shoot(turret.enemies, turret.rockets, turret.x, turret.y, turret.multiplier);
            turret.nextTic = time + 1000;
        }
    }
    addBullet(rockets, x, y, angle, multiplier, turret: Turret) {
        var rocket = rockets.get();

        if (rocket) {
            var rocketType = turret.getBulletType(1000, constants.BULLET_DAMAGE, 0.6)
            rocket.rocket = rocketType;
            rocket.fire(x, y, angle);
        }
    }
}

class WaveShooting implements ShootingState {
    shot: number = 0

    action(time, delta, turret: Turret) {
        if (time > turret.nextTic) {

            if (time - turret.nextTic >= 1000)
                this.shot = 0;
            turret.shoot(turret.enemies, turret.rockets, turret.x, turret.y, turret.multiplier);
            this.shot++
            if (this.shot == 3) {
                this.shot = 0;
                turret.nextTic = time + 1000;
            }
            else {
                turret.nextTic = time + 50;
            }
        }
    }

    addBullet(rockets, x, y, angle, multiplier, turret: Turret) {
        var rocket = rockets.get();

        if (rocket) {
            var rocketType = turret.getBulletType(1000, constants.BULLET_DAMAGE / 3, 0.6)
            rocket.rocket = rocketType;
            rocket.fire(x, y, angle);
        }
    }
}

class NoShooting implements ShootingState {
    shot: number = 0

    action(time, delta, turret: Turret) {
    }

    addBullet(rockets, x, y, angle, multiplier, turret: Turret) {
    }
}