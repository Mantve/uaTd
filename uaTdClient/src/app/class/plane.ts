import { constants, LaserTurret, MultiTurret, TurretIterator, WaveTurret } from ".";
import Turret, { PlaneElement } from "./turret";

export interface Visitor { //Visitor

    visitTurret(e: (LaserTurret | WaveTurret | MultiTurret)); 
}

export class Plane extends Phaser.GameObjects.Image implements Visitor { //ConcreteVisitor
    target: PlaneElement;
    follower;
    path;
    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'plane');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() }
    }

    visit() {
        let tempTarget = this.target as unknown as Turret;
        this.path = this.scene.add.path(this.x, this.y);
        this.path.lineTo(tempTarget.x, tempTarget.y);
        let angle = Phaser.Math.Angle.Between(this.x, this.y, tempTarget.x, tempTarget.y);
        this.setAngle((angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG - 45);
    }

    update(time, delta) {
        this.follower.t += constants.ENEMY_SPEED * 10 * delta;
        if (this.path) {
            this.visible = true;
            if (this.follower.t >= 1 && this.target) {
                if (this.target instanceof LaserTurret)
                    (this.target as LaserTurret).changeMultiplier(this);
                else if (this.target instanceof WaveTurret)
                    (this.target as WaveTurret).changeMultiplier(this);
                else if (this.target instanceof MultiTurret)
                    (this.target as MultiTurret).changeMultiplier(this);
                this.target = null;
            }
            this.path.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.follower.vec.x, this.follower.vec.y);
        }
        else {
            this.visible = false;
        }
    }

    visitTurret(e: (LaserTurret | WaveTurret | MultiTurret)) {
        if (!this.target) {
            this.target = e;
            this.visit();
        }
    }
}
