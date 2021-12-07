import { constants, LaserTurret, MultiTurret, TurretIterator, WaveTurret } from ".";
import Turret, { PlaneElement } from "./turret";

export interface Visitor { //Visitor

    visitLaser(e: LaserTurret)
    visitWave(e: WaveTurret)
    visitMulti(e: MultiTurret)

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
        this.setAngle((angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG-45);
        console.log((angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG -45)
    }

    update(time, delta) {
        this.follower.t += constants.ENEMY_SPEED *10* delta;
        if (this.path) {
            this.visible=true;
            if (this.follower.t >= 1 && this.target) {
                (this.target as LaserTurret).changeMultiplier(100);
                this.target=null;
            }
            this.path.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.follower.vec.x, this.follower.vec.y);
        }
        else{
            this.visible=false;
        }
    }

    visitLaser(e: LaserTurret) {
        if (!this.target) {
            this.target = e;
            this.visit();
        }
    }
    visitWave(e: WaveTurret) {
        if (!this.target) {
            this.target = e;
            this.visit();
        }
    }
    visitMulti(e: MultiTurret) {
        if (!this.target) {
            this.target = e;
            this.visit();
        }
    }
}
