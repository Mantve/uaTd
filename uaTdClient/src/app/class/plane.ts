import { constants, LaserTurret, MultiTurret, WaveTurret } from ".";
import Turret from "./turret";

export interface Visitor { //Visitor

    visitLaser(e: LaserTurret)
    visitWave(e: WaveTurret)
    visitMulti(e: MultiTurret)

}

export class Plane extends Phaser.GameObjects.Image implements Visitor { //ConcreteVisitor
    target: Turret;
    follower;
    path;
    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'shooter');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() }
    }

    visit() {
        this.path = this.scene.add.path(this.x, this.y);
        this.path.lineTo(this.target.x, this.target.y);
    }

    update(time, delta) {
        this.follower.t += constants.ENEMY_SPEED *10* delta;
        if (this.path) {
            if (this.follower.t >= 1 && this.target) {
                (this.target as LaserTurret).changeMultiplier(100);
                this.target = null;
            }
            console.log(this.follower.vec)
            this.path.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.follower.vec.x, this.follower.vec.y);
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
