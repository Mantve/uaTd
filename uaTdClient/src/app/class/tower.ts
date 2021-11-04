import * as Phaser from 'phaser';
import { constants } from './_constants';

// ################### Command #####################

interface Command {
    execute(tower: Tower): void;
}

class NearShootingCommand implements Command {

    public execute(tower: Tower): void {
        if (tower instanceof Shooter) {
            tower.setStrategy(new NearShootingStrategy());
        }
    }
}

class FarShootingCommand implements Command {

    public execute(tower: Tower): void {
        if (tower instanceof Shooter && tower.parts.includes('SNIPER')) {
            tower.setStrategy(new FarShootingStrategy());
        }
    }
}

class DoNotShootCommand implements Command {

    public execute(tower: Tower): void {
        tower.setStrategy(new DoNotShootShootingStrategy());
    }
}

class CannonShootingCommand implements Command {

    public execute(tower: Tower): void {
        if (tower.parts.includes('CANNON')) {
            tower.setStrategy(new CannonShootingStrategy());
        }
    }
}

class Invoker {
    public executeCommand(command: Command, tower: Tower) {
        command.execute(tower);
    }

    public undoCommand(tower: Tower) {
      tower.parts = tower.parts.slice(0, -1);
      let command = tower.parts.slice(-1)[0];

      if(tower instanceof Shooter) {
        switch (command) {
          case 'CANNON':
            this.executeCommand(new FarShootingCommand(), tower);
            break;

          case 'SNIPER':
            this.executeCommand(new NearShootingCommand(), tower);
            break;
        }
      }
      else if(tower instanceof Village && command == 'CANNON') {
        this.executeCommand(new DoNotShootCommand(), tower);
      }
    }
}
// ################### OBSERVER ####################

export interface Publisher {
    subscribe(observer: Subscriber);
    unsubscribe(observer: Subscriber);
    cloneSubsribers(publisher: Publisher);
    setSubsribers(Subscribers: Subscriber[]);
    notify();
}

export interface Subscriber {
    getNotified(subject: Publisher);
}

// ##################################################

export default class Tower extends Phaser.GameObjects.Image {
    nextTic;
    enemies;
    bullets;
    towers;
    i;
    j;

    modifier: 1;

    parts: string[];
    shootingStrategy: ShootingStrategy;
    //dtype: Phaser.GameObjects.Text;

    label: Phaser.GameObjects.Text;

    constructor(scene, type) {
        super(scene, 0, 0, 'sprites', type);
        this.nextTic = 0;
        this.parts = [];

        /*
        this.label = new Phaser.GameObjects.Text(scene, this.x, this.y, "", {});
        scene.children.add(this.label);
        this.label.setVisible(true);
        this.label.setStroke('0x000000', 3);
        */
    }

    setGameData(enemies, bullets, towers) {
        this.enemies = enemies;
        this.bullets = bullets;
        this.towers = towers;
    }

    place(i, j) {
        this.i = i,
            this.j = j;

        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;

        /*
        this.label.y = i * 64 + 64 / 2 + 16;
        this.label.x = j * 64 + 64 / 2;
        this.label.setText(`${this.i} ${this.j}`);
        */
    }

    setStrategy(strategy: ShootingStrategy) {
        this.shootingStrategy = strategy;
    }
}

export class Village extends Tower implements Publisher {
    private observers: Subscriber[] = [];
    setModifier: number = 1;
    notifiedFor = this.setModifier;

    constructor(scene, strategy?: ShootingStrategy) {
        super(scene, 'village');
    }

    place(i, j) {
        super.place(i, j);
    }

    update(time, delta) {
        if (this.parts.includes('CANNON')) {
            this.setModifier = 1.15;

            if (time > this.nextTic) {
                this.shootingStrategy.shoot(this.enemies, this.bullets, this.x, this.y, 1);
                this.nextTic = time + 2000;
            }
        }

        if (this.parts.includes('WALLS')) {
            this.setModifier = 1.25;
        }

        if (this.notifiedFor != this.setModifier) {
            this.notify();
            this.notifiedFor = this.setModifier;
        }
    }

    subscribe(observer: Subscriber) {
        this.observers.push(observer);
    }

    cloneSubsribers(publisher: Publisher) {
        publisher.setSubsribers(this.observers);
    }

    setSubsribers(observers: Subscriber[]) {
        this.observers = observers;
    }

    unsubscribe(observer: Subscriber) {
        const observerIndex = this.observers.indexOf(observer);
        this.observers.splice(observerIndex, 1);
    }

    notify() {
        for (let observer of this.observers) {
            observer.getNotified(this);
        }
    }

    resetObservers() {
        this.observers = [];
    }
}

export class Shooter extends Tower implements Subscriber {
    private multiplier = 1;

    constructor(scene, strategy?: ShootingStrategy) {
        super(scene, 'shooter');
        //this.shootingStrategy = strategy;
    }

    place(i, j) {
        super.place(i, j);
        //this.subToVillages();
    }

    update(time, delta) {
        if (time > this.nextTic) {
            this.angle = this.shootingStrategy.shoot(this.enemies, this.bullets, this.x, this.y, this.multiplier);
            this.nextTic = time + 1000;
        }
    }

    getNotified(publisher: Publisher) {
        let village = publisher as Village;
        this.multiplier = village.setModifier;
        console.log("i've been notified")
    }
}

// ################### BUILDER ####################

export interface Builder {
    buildMainPart();
    buildCannon();

    buildRadar();
    buildWalls();
    buildSniper();

    undo();
}

export class VillageBuilder implements Builder {
    private village: Village;
    scene;
    private invoker = new Invoker();

    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.village = new Village(this.scene);
        this.invoker.executeCommand(new DoNotShootCommand(), this.village);
    }

    buildMainPart() {
        this.village.parts.push('VILLAGE');
    }

    buildCannon() {
        this.village.parts.push('CANNON');
        this.invoker.executeCommand(new CannonShootingCommand(), this.village);
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

    buildFromParts(village: Village) {
      this.village = village;
    }

    undo() {
      this.invoker.undoCommand(this.village);
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
    private invoker = new Invoker();

    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.shooter = new Shooter(this.scene);
        this.invoker.executeCommand(new NearShootingCommand(), this.shooter);
    }

    buildMainPart() {
        this.shooter.parts.push('SHOOTER');
    }

    buildCannon() {
        this.shooter.parts.push('CANNON');
        this.invoker.executeCommand(new CannonShootingCommand(), this.shooter);
    }

    buildSniper() {
        this.shooter.parts.push('SNIPER');
        this.invoker.executeCommand(new FarShootingCommand(), this.shooter);
    }

    buildRadar() {
        console.log('Shooter can not have a radar.');
    }

    buildWalls() {
        console.log('Shooter can not have walls.');
    }

    buildFromParts(shooter: Shooter) {
      this.shooter = shooter;
    }

    undo() {
      this.invoker.undoCommand(this.shooter);
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

    public undo(): void {
      this.builder.undo();
    }
}

// ################### STRATEGY ####################

export interface ShootingStrategy {
    shoot(enemies, bullets, x, y, multiplier);
}

export class DoNotShootShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y, multiplier = 1) { }
}

export class NearShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y, multiplier = 1) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 125 * multiplier);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(bullets, x, y, angle, multiplier);
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

    addBullet(bullets, x, y, angle, multiplier = 1) {
        var bullet = bullets.get();
        if (bullet) {
            bullet.lifespan = bullet.lifespan * multiplier;
            bullet.damage = constants.BULLET_DAMAGE * multiplier;
            bullet.speed = bullet.speed * multiplier;
            bullet.fire(x, y, angle);
        }
    }
}

export class FarShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y, multiplier = 1) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 200 * multiplier);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(bullets, x, y, angle, multiplier);
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

    addBullet(bullets, x, y, angle, multiplier = 1) {
        var bullet = bullets.get();
        if (bullet) {
            bullet.damage = constants.BULLET_DAMAGE * 0.75 * multiplier;
            bullet.lifespan = bullet.lifespan * 1.25 * multiplier;
            bullet.speed = bullet.speed * multiplier;
            bullet.fire(x, y, angle);
        }
    }
}

export class CannonShootingStrategy implements ShootingStrategy {
    shoot(enemies, bullets, x, y, multiplier = 1) {
        var enemy;
        var angle;

        enemy = this.getEnemy(enemies, x, y, 100 * multiplier);
        if (enemy) {
            angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
            this.addBullet(bullets, x, y, angle, multiplier);
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

    addBullet(bullets, x, y, angle, multiplier = 1) {
        var bullet = bullets.get();
        if (bullet) {
            bullet.damage = constants.CANNON_DAMAGE * multiplier;
            bullet.lifespan = bullet.lifespan * multiplier;
            bullet.speed = bullet.speed * 0.75 * multiplier;
            bullet.fire(x, y, angle);
        }
    }
}
