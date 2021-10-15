import * as Phaser from 'phaser';
import { constants } from './_constants';

export class Enemy {
    bacteria: Bacteria;

    createBacteria(scene, creator: BacteriaCreator) {
        this.bacteria = creator.createBacteria(scene);
    }
}

abstract class Bacteria extends Phaser.GameObjects.Image {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }
}

class BacteriaBlue extends Bacteria {
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
        this.follower.t += constants.ENEMY_SPEED * delta * 0.5;

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
        this.hp = 10;

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

class BacteriaPink extends Bacteria {
    follower;
    hp;
    path;

    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'enemy_pink');
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
        this.hp = 10 * .5;

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

abstract class BacteriaCreator {
    abstract createBacteria(scene): Bacteria;
};

export class BacteriaBlueCreator implements BacteriaCreator {
    createBacteria(scene): Bacteria {
        return new BacteriaBlue(scene);
    }
}

export class BacteriaPinkCreator implements BacteriaCreator {
    createBacteria(scene): Bacteria {
        return new BacteriaPink(scene);
    }
}