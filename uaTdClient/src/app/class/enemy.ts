import * as Phaser from 'phaser';
import { constants } from './_constants';

export class EnemyClient {
    bacteria: Bacteria;

    createBacteria(scene, creator: BacteriaCreator) {
        this.bacteria = creator.createBacteria(scene);
    }
}

export abstract class Bacteria extends Phaser.GameObjects.Image implements Decorator {
    id: number;
    follower: {
        t: number,
        vec: Phaser.Math.Vector2
    };
    t;
    hp;
    hitCount;
    path;
    type;
    isRunning;

    constructor(scene, x, y, spriteFile, sprite) {
        super(scene, x, y, spriteFile, sprite);
    }
    public setSprite(decorator: Decorator) {
        decorator.setSprite(this);
    }

    setBacteriaData(t, vec, id, type) {
        this.follower = { t: t, vec: vec ? new Phaser.Math.Vector2(vec[0], vec[1]) : new Phaser.Math.Vector2() };
        this.id = id;
        //this.follower = { t: t, vec: new Phaser.Math.Vector2() };
        this.type = type;
        this.isRunning = false;
    }

    getBacteriaId() {
        return this.id;
    }

    stop() {
        this.isRunning = false;
    }

    run() {
        this.isRunning = true;
    }

}

interface Decorator {
    setSprite(bacteria: Bacteria);
}

class CriticalDamagedDecorator implements Decorator {

    public setSprite(bacteria: Bacteria) {
        bacteria.setFrame('village');
    }
}

class SemiDamagedDecorator implements Decorator {

    public setSprite(bacteria: Bacteria) {
        bacteria.setFrame('shooter');
    }
}

class BacteriaBlue extends Bacteria {

    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'enemy');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
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
            //this.label.setPosition(this.follower.vec.x - 32, this.follower.vec.y + 25);
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
        this.hp = constants.ENEMY_HP;

    }

    receiveDamage(damage) {
        this.hp -= damage;

        // if hp drops below 0 we deactivate this enemy
        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
        else if(this.hp <= constants.ENEMY_HP*0.3)
        {
            (this as Bacteria).setSprite(new CriticalDamagedDecorator())
        }
        else if(this.hp <= constants.ENEMY_HP*0.5)
        {
            (this as Bacteria).setSprite(new SemiDamagedDecorator())
        }

    }
};

class BacteriaPink extends Bacteria {

    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'enemy_pink');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    }

    setPath(path) {
        this.path = path;
    }

    update(time, delta) {
        if(this.isRunning) {
            this.follower.t += constants.ENEMY_SPEED * delta * 0.5;
    
            // get the new x and y coordinates in vec
            this.path.getPoint(this.follower.t, this.follower.vec);
    
            // update enemy x and y to the newly obtained x and y
            this.setPosition(this.follower.vec.x, this.follower.vec.y);
            //this.label.setPosition(this.follower.vec.x - 32, this.follower.vec.y + 25);
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
        this.hp = constants.ENEMY_HP * .5;

    }

    receiveDamage(damage) {
        this.hp -= damage;

        // if hp drops below 0 we deactivate this enemy
        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
        else if(this.hp <= constants.ENEMY_HP*0.3*0.5)
        {
            (this as Bacteria).setSprite(new CriticalDamagedDecorator())
        }
        else if(this.hp <= constants.ENEMY_HP*0.5*0.5)
        {
            (this as Bacteria).setSprite(new SemiDamagedDecorator())
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