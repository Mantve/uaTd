import * as Phaser from 'phaser';
import { constants } from './_constants';

class Enemy extends  Phaser.GameObjects.Image {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }
}

export class Bacteria extends Enemy {
    follower;
    hp;
    path;

    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'enemy');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    }

    setPath(path) {
        this.path = path;
    }

    update(time, delta) {
        // move the t point along the path, 0 is the start and 0 is the end
        this.follower.t += constants.ENEMY_SPEED * delta;

        // get the new x and y coordinates in vec
        this.path.getPoint(this.follower.t, this.follower.vec);

        // update enemy x and y to the newly obtained x and y
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
        // if we have reached the end of the path, remove the enemy
        if (this.follower.t >= 1) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    startOnPath() {
        // set the t parameter at the start of the path
        this.follower.t = 0;

        // get x and y of the given t point            
        this.path.getPoint(this.follower.t, this.follower.vec);

        // set the x and y of our enemy to the received from the previous step
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
        this.hp = 100;

    }

    receiveDamage(damage) {
        this.hp -= damage;

        // if hp drops below 0 we deactivate this enemy
        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
};

abstract class EnemyCreator {
    abstract createBacteria(scene);
};

export default class BacteriaCreator extends EnemyCreator {
    createBacteria(scene) {
        return new Bacteria(scene);
    }
}