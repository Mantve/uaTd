import * as Phaser from 'phaser';

export class RocketType {
    lifespan;
    speed;
    damage;

    constructor(lifespan, speed, damage) {
        this.lifespan = lifespan
        this.speed = speed
        this.damage = damage
    }
}

export default class Rocket extends Phaser.GameObjects.Image {
    dx;
    dy;
    rocket: RocketType

    constructor(scene) {
        super(scene, 0, 0, 'bullet');
        this.dx = 0;
        this.dy = 0;
        //this.rocket.lifespan = 0;
        //this.rocket.speed = Phaser.Math.GetSpeed(600, 1);
    }

    fire(x, y, angle) {
        this.setActive(true);
        this.setVisible(true);
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
        //  we don't need to rotate the bullets as they are round
        //  this.setRotation(angle);
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
    }

    update(time, delta) {
        this.rocket.lifespan -= delta;
        this.x += this.dx * (this.rocket.speed * delta);
        this.y += this.dy * (this.rocket.speed * delta);

        if (this.rocket.lifespan <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
};