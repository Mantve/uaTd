import * as Phaser from 'phaser';
import Tower, { Director, Shooter, ShooterBuilder, Village, VillageBuilder } from './tower';
import Bullet from './bullet';
import { ObstacleClient, Obstacle, SmallObstacleFactory, MediumObstacleFactory, BigObstacleFactory } from './obstacle';
import { EnemyClient, BacteriaBlueCreator, BacteriaPinkCreator, Bacteria } from './enemy';
import Map from './map';
import Turret from './turret';

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 832,
    height: 704,
    physics: {
        default: 'arcade'
    }
};

export interface IGame {
    updateMap(map);
    setForPurchase(i: number, price: number);
    setForDowngrade();
    cancelPurchase();
    runGame();
    stopGame();
    placeTowerFromServer(x, y, type);
    populateMapWithTowers();
    upgradeTower(x, y);
    downgradeTower(x, y);
    subscribeShooters();
    gameOver();
    spawnNewBacteria(bacteria: Bacteria);
    spawnNewBacterias(bacterias: Bacteria[]);
    removeOldBacterias(newBacterias: Bacteria[]);
    initializeNewGame();
    initializePreviousRound();
    getBacterias();
    checkStage(stage: number);
}

export default class Game extends Phaser.Game implements IGame {
    gameScene: Scene;

    constructor(connection, map: number[] = []) {
        super(config);
        connection = connection;

        this.gameScene = new Scene({
            key: 'main',
            active: true,
            visible: true
        });

        this.gameScene.connection = connection;
        this.scene.add('main', this.gameScene);
        this.updateMap(map);
    }

    updateMap(map) {
        this.gameScene.map = map;
    }

    setForPurchase(i: number, price: number) {
        this.gameScene.setForPurchase(i, price);
    }

    setForDowngrade() {
        this.gameScene.setForDowngrade();
    }

    cancelPurchase() {
        this.gameScene.cancelPurchase();
    }

    runGame() {
        this.gameScene.enemies.runChildUpdate = true;
        this.gameScene.towers.runChildUpdate = true;
        this.gameScene.bullets.runChildUpdate = true;
    }

    stopGame() {
        this.gameScene.enemies.runChildUpdate = false;
        this.gameScene.towers.runChildUpdate = false;
        this.gameScene.bullets.runChildUpdate = false;
    }

    printMap() {
        console.log(this.gameScene.map)
    }

    placeTowerFromServer(x, y, type) {
        this.gameScene.placeTowerFromServer(x, y, type)
    }

    populateMapWithTowers() {
        this.gameScene.populateMapWithTowers();
    }

    upgradeTower(x, y) {
        this.gameScene.upgradeTower(x, y);
    }

    downgradeTower(x, y) {
        this.gameScene.downgradeTower(x, y);
    }

    subscribeShooters() {
        return this.gameScene.subscribeShooters();
    }

    gameOver() {
        return this.gameScene.gameOver();
    }

    spawnNewBacteria(bacteria: Bacteria) {
        return this.gameScene.spawnBacteria(bacteria);
    }

    spawnNewBacterias(bacterias: Bacteria[]) {
        return this.gameScene.spawnNewBacterias(0, bacterias);
    }

    removeOldBacterias(newBacterias: Bacteria[]) {
        return this.gameScene.removeOldBacterias(newBacterias);
    }

    initializeNewGame() {
        return this.gameScene.initializeGame();
    }

    initializePreviousRound() {
        return this.gameScene.initializePreviousRound();
    }

    getBacterias() {
        return this.gameScene.bacterias;
    }

    checkStage(stage: number) {
        this.gameScene.children.remove(this.gameScene.gameMap);
        this.gameScene.createMap(stage);
        this.initializeNewGame();
    }
}

export class Scene extends Phaser.Scene {
    connection;
    graphics;

    map = [];
    gameMap: Map;
    path;

    enemies;
    towers;
    bullets;
    obstacles;

    bacterias: Bacteria[] = [];
    nextBacteria: number = 0;

    purchasePreview: Phaser.GameObjects.Image;
    selectedIndex: number = -1;
    selectedPrice: number = 0;

    indicator;
    finTiles;
    stage: number = 0;

    constructor(config) {
        super(config);
    }

    preload() {
        this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('map', 'assets/map.png');
        this.load.image('map_stage_2', 'assets/map_stage_2.png');
    }

    create() {
        this.graphics = this.add.graphics();
        this.finTiles = this.physics.add.group({ classType: Phaser.GameObjects.Rectangle, runChildUpdate: true });

        //this.createMap(this.stage);

        //this.gameMap.drawPath(this.graphics, this.finTiles);
        //this.gameMap.drawGrid(this.graphics);

        //this.children.add(this.gameMap);

        this.enemies = this.physics.add.group({ classType: Bacteria, runChildUpdate: true });
        this.nextBacteria = 0;

        this.towers = this.add.group({ classType: Tower, runChildUpdate: true });
        this.input.on('pointerdown', this.placeTower);
        this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.physics.add.overlap(this.enemies, this.bullets, this.damageEnemy);
        this.obstacles = this.add.group({ classType: Obstacle, runChildUpdate: true });

        this.indicator = new Phaser.GameObjects.Rectangle(this, 0, 0, 64, 64, 0x00ff00, 0.25);
        this.children.add(this.indicator);

        this.purchasePreview = new Phaser.GameObjects.Image(this, 0, 0, 'sprites', 'tower');
        this.children.add(this.purchasePreview);
        this.purchasePreview.visible = false;

        this.physics.add.overlap(this.enemies, this.finTiles, this.updateHealth);
    }

    createMap(stage) {
        let points = [];

        switch (stage) {
            case 1:
                points = [
                    [[288, 224], [96, 224], [96, 416], [224, 416], [224, 608], [288, 608], [288, 704]],
                    [[544, 224], [736, 224], [736, 416], [608, 416], [608, 608], [544, 608], [544, 704]]
                ]

                this.gameMap = new Map(this, 'map_stage_2', points);
                break;

            default:
                points = [
                    [[96, 160], [352, 160], [352, 288], [544, 288], [544, 96], [736, 96], [736, 416], [160, 416], [160, 608], [352, 608], [352, 544], [672, 544], [672, 736]]
                ]

                this.gameMap = new Map(this, 'map', points);
                break;
        }
        this.gameMap.drawPath(this.graphics, this.finTiles);
        this.gameMap.drawGrid(this.graphics);
        this.gameMap.depth = -1;
        this.children.add(this.gameMap);
    }

    update() {
        let ix = Math.floor(this.input.activePointer.x / 64);
        let iy = Math.floor(this.input.activePointer.y / 64);

        let gridX = ix * 64 + 32;
        let gridY = iy * 64 + 32;

        this.indicator.x = gridX;
        this.indicator.y = gridY;

        if (this.purchasePreview != undefined) {
            this.purchasePreview.x = gridX;
            this.purchasePreview.y = gridY;
        }

        !this.canPlaceTower(iy, ix) ? this.indicator.fillColor = 0xff0000 : this.indicator.fillColor = 0x00ff00;
    }

    initializeGame() {
        this.removeAllBacterias(this.bacterias);
        this.nextBacteria = 0;
        this.removeAllTowers(this.towers);

        this.enemies.clear();
        this.towers.clear();
        this.bullets.clear();
    }

    initializePreviousRound() {
        this.removeAllBacterias(this.bacterias);
        this.nextBacteria = 0;

        this.enemies.clear();
        this.bullets.clear();
        this.removeAllTowers(this.towers);
        this.towers.clear();
        this.populateMapWithTowers();
    }

    removeOldBacterias(oldBacterias: Bacteria[]) {
        oldBacterias.forEach(ob => {
            this.removeBacteria(ob);
        })
    }

    removeBacteria(oldBacteria) {
        oldBacteria.setActive(false);
        oldBacteria.setVisible(false);
        this.enemies.remove(oldBacteria);
        this.bacterias.splice(this.bacterias.indexOf(oldBacteria), 1);
        this.children.remove(oldBacteria);
    }

    removeAllBacterias(bacterias: Bacteria[]) {
        bacterias.forEach(bacteria => {
            this.children.remove(bacteria);
        });
        bacterias = [];
    }

    removeAllTowers(towers) {
        towers.children.entries.forEach(tower => {
            this.children.remove(tower);
        });
    }

    setForPurchase(i: number, price: number) {
        this.purchasePreview.setFrame(i == 1 ? 'tower' : 'village')
        this.purchasePreview.visible = true;
        this.selectedIndex = i;
        this.selectedPrice = price;
    }

    setForDowngrade() {
        this.purchasePreview.visible = false;
        this.selectedIndex = -2;
    }

    cancelPurchase() {
        this.purchasePreview.visible = false;
        this.selectedIndex = -1;
        this.selectedPrice = 0;
    }

    canPlaceTower(y, x) {
        if (!this.map || this.map.length == 0 || this.map[y] === undefined || this.map[y][x] === undefined)
            return false;

        return this.map[y][x] === 0;
    }

    placeTower(pointer) {
        var x = Math.floor(pointer.x / 64);
        var y = Math.floor(pointer.y / 64);

        let gameScene = <Scene><unknown>this.scene.scene.scene;

        if (gameScene.selectedIndex == -2) {
            if ([10, 20].includes(gameScene.map[y][x])) {
                return;
            }

            if (gameScene.map[y][x] >= 1 && gameScene.map[y][x] % 10 <= 3) {
                gameScene.connection.send('clientMessage', JSON.stringify({
                    type: 'TOWER_DOWNGRADE',
                    data: {
                        x: x,
                        y: y
                    }
                }));
            }
        }
        else if (gameScene.selectedIndex != -1 && gameScene.canPlaceTower(y, x)) {
            gameScene.connection.send('clientMessage', JSON.stringify({
                type: 'TOWER_BUILD',
                data: {
                    x: x,
                    y: y,
                    type: gameScene.selectedIndex,
                    price: gameScene.selectedPrice
                }
            }));
        }
        else if (gameScene.selectedIndex != -1 && gameScene.selectedIndex == Math.floor(gameScene.map[y][x] / 10)) {
            if ((gameScene.selectedIndex == 1 && gameScene.map[y][x] % 10 < 2) || (gameScene.selectedIndex == 2 && gameScene.map[y][x] % 10 < 3)) {
                gameScene.connection.send('clientMessage', JSON.stringify({
                    type: 'TOWER_UPGRADE',
                    data: {
                        x: x,
                        y: y,
                        price: gameScene.selectedPrice
                    }
                }));
            }
        }
    }

    damageEnemy(enemy, bullet) {
        if (enemy.active === true && bullet.active === true) {
            bullet.setActive(false);
            bullet.setVisible(false);

            enemy.receiveDamage(bullet.damage);
            if (enemy.hp <= 0) {
                let gameScene = <Scene><unknown>enemy.scene;
                gameScene.connection.send('clientMessage', JSON.stringify({
                    type: 'ENEMY_DEATH',
                    data: {
                        bacteriaID: enemy.id
                    }
                }));
            }
        }
    }

    updateHealth(enemy, finTile) {
        if (enemy.active === true && finTile.active === true) {
            enemy.setActive(false);
            enemy.setVisible(false);

            let gameScene = <Scene><unknown>enemy.scene;
            gameScene.connection.send('clientMessage', JSON.stringify({
                type: 'HEALTH_UPDATE',
                data: {
                    change: Math.floor(enemy.hp),
                    bacteriaID: enemy.id
                }
            }));
        }
    }

    populateMapWithTowers() {
        this.map.forEach((row, j) => {
            row.forEach((col, i) => {
                if (row[i] > 0) {
                    this.placeTowerFromServer(i, j, row[i]);
                }
                else if (row[i] < 0) {
                    this.placeObstacleFromServer(i, j, row[i]);
                }
            });
        })
    }

    placeTowerFromServer(x, y, type) {
        let director = new Director();
        let tower: Tower;
        let towerType = Math.floor(type / 10);
        console.log(towerType);

        switch (towerType) {
            case 1:
                let shooterBuilder = new ShooterBuilder(this);
                director.setBuilder(shooterBuilder);
                director.buildShooter();

                tower = shooterBuilder.get();
                this.towers.add(tower);
                break;
            case 2:
                let villageBuilder = new VillageBuilder(this);
                director.setBuilder(villageBuilder);

                tower = villageBuilder.get();
                this.towers.add(tower);
                break;
            case 3:
                tower = new Turret(this);
                console.log("made it");

                this.towers.add(tower);
                break;
        }
console.log(this.towers);
        if (tower) {
            this.map[y][x] = type;
            tower.setGameData(this.enemies, this.bullets, this.towers);
            tower.setActive(true);
            tower.setVisible(true);
            tower.place(y, x);
        }
        this.children.add(tower)
        let upgrades = type % 10;

        for (let i = 0; i < upgrades; i++) {
            this.upgradeTower(x, y);
        }

    }

    placeObstacleFromServer(j, i, type) {
        var obstacle = new ObstacleClient();

        switch (type) {
            case -2: {
                obstacle.createPlantObstacle(this, new SmallObstacleFactory());
                let spo = obstacle.plantObstacle;
                if (spo) {
                    spo.setActive(true);
                    spo.setVisible(true);
                    spo.place(i, j);
                    this.obstacles.add(spo);
                    this.children.add(spo);
                }
                break;
            }
            case -3: {
                obstacle.createPlantObstacle(this, new MediumObstacleFactory());
                let mpo = obstacle.plantObstacle;
                if (mpo) {
                    mpo.setActive(true);
                    mpo.setVisible(true);
                    mpo.place(i, j);
                    this.obstacles.add(mpo);
                    this.children.add(mpo);
                }
                break;
            }
            case -4: {
                obstacle.createPlantObstacle(this, new BigObstacleFactory());
                let bpo = obstacle.plantObstacle;
                if (bpo) {
                    bpo.setActive(true);
                    bpo.setVisible(true);
                    bpo.place(i, j);
                    this.obstacles.add(bpo);
                    this.children.add(bpo);
                }
                break;
            }
            case -5: {
                obstacle.createRockObstacle(this, new SmallObstacleFactory());
                let smo = obstacle.rockObstacle;
                if (smo) {
                    smo.setActive(true);
                    smo.setVisible(true);
                    smo.place(i, j);
                    this.obstacles.add(smo);
                    this.children.add(smo);
                }
                break;
            }
            case -6: {
                obstacle.createRockObstacle(this, new MediumObstacleFactory());
                let mmo = obstacle.rockObstacle;
                if (mmo) {
                    mmo.setActive(true);
                    mmo.setVisible(true);
                    mmo.place(i, j);
                    this.obstacles.add(mmo);
                    this.children.add(mmo);
                }
                break;
            }
            case -7: {
                obstacle.createRockObstacle(this, new BigObstacleFactory());
                let bmo = obstacle.rockObstacle;
                if (bmo) {
                    bmo.setActive(true);
                    bmo.setVisible(true);
                    bmo.place(i, j);
                    this.obstacles.add(bmo);
                    this.children.add(bmo);
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    upgradeTower(x, y) {

        let tower = this.towers.getChildren().filter(c => c.j == x && c.i == y)[0];
        var director = new Director();
        var newTower;

        if (tower instanceof Shooter) {
            let shooterBuilder = new ShooterBuilder(this);

            director.setBuilder(shooterBuilder);
            if (!tower.parts.includes('SNIPER')) {
                director.buildShooterWithSniper();
            }
            else {
                director.buildShooterWithEverything();
            }
            newTower = shooterBuilder.get();
        }
        else if (tower instanceof Village) {
            let villageBuilder = new VillageBuilder(this);

            if (tower.parts.includes('WALLS'))
                return;

            director.setBuilder(villageBuilder);
            if (!tower.parts.includes('CANNON')) {
                director.buildVillageWithCannon();
            }
            else if (!tower.parts.includes('RADAR')) {
                director.buildVillageWithCannonAndRadar();
            }
            else {
                director.buildVillageWithEverything();
            }

            newTower = villageBuilder.get();
            newTower.cloneSubsribers(tower);
        }

        this.towers.remove(tower);
        this.children.remove(tower);

        this.towers.add(newTower);
        newTower.setGameData(this.enemies, this.bullets);
        newTower.setActive(true);
        newTower.setVisible(true);
        newTower.setFrame(newTower.parts.join('').toLowerCase());
        newTower.place(y, x);

        this.children.add(newTower);
    }

    downgradeTower(x, y) {
        let tower = this.towers.getChildren().filter(c => c.j == x && c.i == y)[0];
        var newTower;

        if (tower instanceof Shooter) {
            let shooterBuilder = new ShooterBuilder(this);
            shooterBuilder.buildFromParts(tower);
            shooterBuilder.undo();

            newTower = shooterBuilder.get();
        }
        else if (tower instanceof Village) {
            let villageBuilder = new VillageBuilder(this);
            villageBuilder.buildFromParts(tower);
            villageBuilder.undo();

            newTower = villageBuilder.get();
            newTower.cloneSubsribers(tower);
        }

        this.towers.remove(tower);
        this.children.remove(tower);

        this.towers.add(newTower);
        newTower.setGameData(this.enemies, this.bullets);
        newTower.setActive(true);
        newTower.setVisible(true);
        newTower.setFrame(newTower.parts.join('').toLowerCase());
        newTower.place(y, x);

        this.children.add(newTower);
    }

    subscribeShooters() {
        var villageTowers = this.towers.getChildren();
        villageTowers.forEach(tower => {
            if (tower instanceof Village) {
                tower.resetObservers();
                villageTowers.forEach(shooter => {
                    if (shooter instanceof Shooter && Phaser.Math.Distance.Between(tower.x, tower.y, shooter.x, shooter.y) <= 100) {
                        tower.subscribe(shooter);
                    }
                });
            }
        });
    }

    spawnNewBacterias(time, bacterias: Bacteria[]) {
        if (bacterias) {
            bacterias.forEach(b => {
                this.spawnBacteria(b);
            })
        }
    }

    spawnBacteria(bacteriaData) {
        var enemyClient = new EnemyClient();
        let bacteria;

        if (bacteriaData.type == 0) {
            enemyClient.createBacteria(this, new BacteriaBlueCreator());
            enemyClient.bacteria.setBacteriaData(bacteriaData.t, bacteriaData.vec, bacteriaData.id, bacteriaData.type, bacteriaData.spawnTime);
            if (enemyClient) {
                bacteria = enemyClient.bacteria;
            }
        }
        else {
            enemyClient.createBacteria(this, new BacteriaPinkCreator());
            enemyClient.bacteria.setBacteriaData(bacteriaData.t, bacteriaData.vec, bacteriaData.id, bacteriaData.type, bacteriaData.spawnTime);
            if (enemyClient) {
                bacteria = enemyClient.bacteria;
            }
        }
        if (bacteria) {
            bacteria.setPath(this.gameMap.paths[bacteria.id % this.gameMap.paths.length]);
            bacteria.setActive(true);
            bacteria.setVisible(true);

            bacteria.startOnPath();

            this.enemies.add(bacteria);
            this.children.add(bacteria);
            this.bacterias.push(bacteria);
        }
    }

    gameOver() {
        //this.scene.pause();
    }
}
