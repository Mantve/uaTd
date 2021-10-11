import * as Phaser from 'phaser';
import { constants } from './_constants';

export interface Builder {
    buildMainPart();
    buildCannon();

    buildRadar();
    buildWalls();
    buildSniper();
}

export class VillageBuilder implements Builder {
    private village: Village;
    scene;

    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.village = new Village(this.scene, new DoNotShootShootingStrategy())
    }

    buildMainPart() {
        this.village.parts.push('VILLAGE');
    }

    buildCannon() {
        this.village.parts.push('CANNON');
        this.village.setStrategy(new CannonShootingStrategy());
    }

    buildRadar() {
        this.village.parts.push('RADAR');
    }

    buildWalls() {
        this.village.parts.push('WALLS');
    }

    buildSniper() {
        console.log('Village can not have a sniper.');
    }

    public get(): Village {
        const result = this.village;
        this.reset();
        return result;
    }
}

export class ShooterBuilder implements Builder {
    private shooter: Shooter;
    scene;

    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.shooter = new Shooter(this.scene, new NearShootingStrategy());
    }

    buildMainPart() {
        this.shooter.parts.push('SHOOTER');
    }

    buildCannon() {
        this.shooter.parts.push('CANNON');
        this.shooter.setStrategy(new CannonShootingStrategy());
    }

    buildSniper() {
        this.shooter.parts.push('SNIPER');
        this.shooter.setStrategy(new FarShootingStrategy());
    }

    buildRadar() {
        console.log('Shooter can not have a radar.');
    }

    buildWalls() {
        console.log('Shooter can not have walls.');
    }

    public get(): Shooter {
        const result = this.shooter;
        this.reset();
        return result;
    }
}

export class Director {
    private builder: Builder;
    
    public setBuilder(builder: Builder): void {
        this.builder = builder;
    }
    
    public buildVillage(): void {
        this.builder.buildMainPart();
    }
    
    public buildVillageWithCannon(): void {
        this.builder.buildMainPart();
        this.builder.buildCannon();
    }
    
    public buildVillageWithCannonAndRadar(): void {
        this.builder.buildMainPart();
        this.builder.buildCannon();
        this.builder.buildRadar();
    }
    
    public buildVillageWithEverything(): void {
        this.builder.buildMainPart();
        this.builder.buildCannon();
        this.builder.buildRadar();
        this.builder.buildWalls();
    }

    public buildShooter(): void {
        this.builder.buildMainPart();
    }

    public buildShooterWithSniper(): void {
        this.builder.buildMainPart();
        this.builder.buildSniper();
    }

    public buildShooterWithEverything(): void {
        this.builder.buildMainPart();
        this.builder.buildSniper();
        this.builder.buildCannon();
    }
}

export default class Tower extends Phaser.GameObjects.Image {
    nextTic;
    enemies;
    bullets;
    i;
    j;

    mainPart;
    cannon;
    parts: string[];
    shootingStrategy: ShootingStrategy;
    //dtype: Phaser.GameObjects.Text;

    constructor(scene, type) {
        super(scene, 0, 0, 'sprites', type);
        this.nextTic = 0;
        this.parts = [];
    }

    setGameData(enemies, bullets) {
        this.enemies = enemies;
        this.bullets = bullets;
    }

    place(i, j) {
        this.i = i,
        this.j = j;

        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }
    
    getEnemy(x, y, distance) {
        var enemyUnits = this.enemies.getChildren();
        for (var i = 0; i < enemyUnits.length; i++) {
            if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                return enemyUnits[i];
        }
        return false;
    }
    
    setStrategy(strategy: ShootingStrategy) {
        this.shootingStrategy = strategy;
    }
}

export class Village extends Tower {
    constructor(scene, strategy: ShootingStrategy) {
        super(scene, 'village');
        this.shootingStrategy = strategy;
    }

    update(time, delta) {
        if (this.parts.includes('CANNON') && time > this.nextTic) {
            this.shootingStrategy.shoot(this.enemies, this.bullets, this.x, this.y);
            this.nextTic = time + 2000;
        }
    }
}

export class Shooter extends Tower {
    constructor(scene, strategy: ShootingStrategy) {
        super(scene, 'shooter');
        this.shootingStrategy = strategy;
    }

    update(time, delta) {
        if (time > this.nextTic) {
            this.angle = this.shootingStrategy.shoot(this.enemies, this.bullets, this.x, this.y);
            this.nextTic = time + 1000;
        }
    }
}

export interface ShootingStrategy {
    shoot(enemies, bullets, x, y);
}

export class DoNotShootShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y) {}
}

export class NearShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 125);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(bullets, x, y, angle);
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

    addBullet(bullets, x, y, angle) {
        var bullet = bullets.get();
        if (bullet) {
            bullet.damage = constants.BULLET_DAMAGE;
            bullet.fire(x, y, angle);
        }
    }
}

export class FarShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 200);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(bullets, x, y, angle);
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

    addBullet(bullets, x, y, angle) {
        var bullet = bullets.get();
        if (bullet) {
            bullet.damage = constants.BULLET_DAMAGE * 0.75;
            bullet.lifespan = bullet.lifespan * 1.25;
            bullet.fire(x, y, angle);
        }
    }
}

export class CannonShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 100);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(bullets, x, y, angle);
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

    addBullet(bullets, x, y, angle) {
        var bullet = bullets.get();
        if (bullet) {
            bullet.damage = constants.CANNON_DAMAGE;
            bullet.speed = bullet.speed * 0.75;
            bullet.fire(x, y, angle);
        }
    }
}