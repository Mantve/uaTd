import * as Phaser from 'phaser';
import { constants } from './_constants';

export class Enemy {
    bacteria: Bacteria;

    createBacteria(scene, creator: BacteriaCreator, t, vec, type, id) {
        this.bacteria = creator.createBacteria(scene, t, vec, type, id);
    }
}

export abstract class Bacteria extends Phaser.GameObjects.Image {
    id: number;
    follower: {
        t: number,
        vec: Phaser.Math.Vector2
    };
    hp;
    hitCount;
    path;
    type;
    isRunning;

    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }

    getBacteriaId() {
        return this.id;
    }

    stop() {}

    run() {}
}

class BacteriaBlue extends Bacteria {
    constructor(scene, t: number = 0, vec = [], type: number = 0, id: number) {
        super(scene, 0, 0, 'sprites', 'enemy');
        this.follower = { t: t, vec: vec ? new Phaser.Math.Vector2(vec[0], vec[1]) : new Phaser.Math.Vector2() };
        this.id = id;
        //this.follower = { t: t, vec: new Phaser.Math.Vector2() };
        this.type = type;
        this.isRunning = true;
    }

    setPath(path) {
        this.path = path;
    }

    update(time, delta) {
        // move the t point along the path, 0 is the start and 0 is the end
        if(this.isRunning) {
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

    stop() {
        this.isRunning = false;
    }

    run() {
        this.isRunning = true;
    }
};

class BacteriaPink extends Bacteria {
    constructor(scene, t: number = 0, vec = [], type: number = 0, id: number) {
        super(scene, 0, 0, 'sprites', 'enemy_pink');
        this.follower = { t: t, vec: vec ? new Phaser.Math.Vector2(vec[0], vec[1]) : new Phaser.Math.Vector2() };
        this.id = id;
        //this.follower = { t: t, vec: new Phaser.Math.Vector2() };
        this.type = type;
    }

    setPath(path) {
        this.path = path;
    }

    update(time, delta) {
        if(this.isRunning) {
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
    }

    startOnPath() {
        // set the t parameter at the start of the path
        this.follower.t = 0;

        // get x and y of the given t point            
        this.path.getPoint(this.follower.t, this.follower.vec);

        // set the x and y of our enemy to the received from the previous step
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
        this.hp = 100 * .5;

    }

    receiveDamage(damage) {
        this.hp -= damage;

        // if hp drops below 0 we deactivate this enemy
        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    stop() {
        this.isRunning = false;
    }

    run() {
        this.isRunning = true;
    }
};

abstract class BacteriaCreator {
    abstract createBacteria(scene, t, vec, type, id): Bacteria;
};

export class BacteriaBlueCreator implements BacteriaCreator {
    createBacteria(scene, t, vec, type, id): Bacteria {
        return new BacteriaBlue(scene, t, vec, type, id);
    }
}

export class BacteriaPinkCreator implements BacteriaCreator {
    createBacteria(scene, t, vec, type, id): Bacteria {
        return new BacteriaPink(scene, t, vec, type, id);
    }
}