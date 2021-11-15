import * as Phaser from 'phaser';
import { constants } from './_constants';

export class EnemyClient {
    bacteria: Bacteria;

    createBacteria(scene, creator: BacteriaCreator) {
        this.bacteria = creator.createBacteria(scene);
    }
}

export abstract class Bacteria extends Phaser.GameObjects.Image {
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
    damage: string[];
    spawnTime: number;

    constructor(scene, x, y, spriteFile, sprite) {
        super(scene, x, y, spriteFile, sprite);
        this.damage = [];
    }

    setBacteriaData(t, vec, id, type, spawnTime) {
        this.follower = { t: t, vec: vec ? new Phaser.Math.Vector2(vec[0], vec[1]) : new Phaser.Math.Vector2() };
        this.id = id;
        this.type = type;
        this.spawnTime = spawnTime;
    }

    getBacteriaId() {
        return this.id;
    }

    addDamageDecoration(decorator: BacteriaDamageDecorator) {
        decorator.addDamageDecoration(this);
    }

    setSprite() {
        let bacteriaType = this.type ? 'bacteriapink' : 'bacteriablue';
        if (this.damage.length > 0) {       // if not true, means that there is no damage, so no need to change sprite, default is suitable
            this.setFrame(bacteriaType + this.damage.join('') + 'damaged');
        }
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
        this.follower.t += constants.ENEMY_SPEED * delta;

        // ----------------------------------------------
        // SYNCED MOVEMENT IN MAP, BUT HEALTH DOESNT SYNC
        // ----------------------------------------------
        //this.follower.t = 1 - ((35 - ((Date.now() / 1000) - this.spawnTime)) / 100) * 3;

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
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
        this.hp = constants.ENEMY_HP;

    }

    receiveDamage(damage) {
        this.hp -= damage;

        // if hp drops below 0 we deactivate this enemy
        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
        else if (this.hp <= constants.ENEMY_HP * 0.5 && this.hp > constants.ENEMY_HP * 0.3) {
            this.addDamageDecoration(new SemiDamagedDecorator(this.scene));
        }
        else if (this.hp <= constants.ENEMY_HP * 0.3) {
            if (this.damage.includes('semi')) {
                this.addDamageDecoration(new CriticalDamagedDecorator(this.scene));
            }
            else {
                this.addDamageDecoration(new SemiDamagedDecorator(this.scene));
                this.addDamageDecoration(new CriticalDamagedDecorator(this.scene));
            }
        }
    }

    addDamageDecoration(decorator: BacteriaDamageDecorator) {
        super.addDamageDecoration(decorator);
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
        this.follower.t += constants.ENEMY_SPEED * delta * 2;

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
        else if (this.hp <= constants.ENEMY_HP * 0.5 * 0.5 && this.hp > constants.ENEMY_HP * 0.3 * 0.5) {
            this.addDamageDecoration(new SemiDamagedDecorator(this.scene));
        }
        else if (this.hp <= constants.ENEMY_HP * 0.3 * 0.5) {
            if (this.damage.includes('semi')) {
                this.addDamageDecoration(new CriticalDamagedDecorator(this.scene));
            }
            else {
                this.addDamageDecoration(new SemiDamagedDecorator(this.scene));
                this.addDamageDecoration(new CriticalDamagedDecorator(this.scene));
            }
        }
    }

    addDamageDecoration(decorator: BacteriaDamageDecorator) {
        super.addDamageDecoration(decorator);
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

// ******************** Decorator *************************
/*
    possible Bacteria damage options:

    1.	(empty string)		+ implemented
    2.	semi			    + implemented
    3.	critical		    not possible, if there is no semi damage when the 
                            critical one is added, both are added in bulk,
                            resulting in semicritical damage
    4.	semi critical		+ implemented
    5.	critical semi		not possible, as hp is not increased in any way
*/

abstract class BacteriaDamageDecorator extends Bacteria {
    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'enemy');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    }

    abstract addDamageDecoration(bacteria: Bacteria);
}

class SemiDamagedDecorator extends BacteriaDamageDecorator {
    public addDamageDecoration(bacteria: Bacteria) {
        if (!bacteria.damage.includes('semi')) {
            bacteria.damage.push('semi');
        }
        bacteria.setSprite();
    }
}

class CriticalDamagedDecorator extends BacteriaDamageDecorator {
    public addDamageDecoration(bacteria: Bacteria) {
        if (!bacteria.damage.includes('critical')) {
            bacteria.damage.push('critical');
        }
        bacteria.setSprite();
    }
}