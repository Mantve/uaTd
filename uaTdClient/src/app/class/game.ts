import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import * as Phaser from 'phaser';
import { constants } from './_constants';
import Tower, { Builder, Director, Publisher, Shooter, ShooterBuilder, Subscriber, Village, VillageBuilder } from './tower';
import Bullet from './bullet';
import { ObstacleClient, Obstacle, SmallObstacleFactory, MediumObstacleFactory, BigObstacleFactory } from './obstacle';
import { EnemyClient, BacteriaBlueCreator, BacteriaPinkCreator, Bacteria } from './enemy';
import { GameState } from '.';

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 832,
    height: 704,
    physics: {
        default: 'arcade'
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

let connection;
var game;

export default class Game extends Phaser.Game {

    constructor(connection1, map1) {
        super(config);
        connection = connection1;
        map = map1;
        game = this;
    }

    updateMap(map1) {
        map = map1;
    }

    runGame() {
        isRunning = true;
        bacterias.forEach(enemy => {
            enemy.run();
        });
        towers.children.entries.forEach(tower => {
            tower.run();
        });
    }

    stopGame() {
        isRunning = false;
        bacterias.forEach(enemy => {
            enemy.stop();
        });
        towers.children.entries.forEach(tower => {
            tower.stop();
        });
    }

    printMap() {
        console.log(map)
    }

    placeTowerFromServer(x, y, type) {
        return placeTowerFromServer(x, y, type, this.scene.scenes[0])
    }

    populateMapWithTowers() {
        return populateMapWithTowers(this.scene.scenes[0]);
    }

    setForPurchase(i: number, price: number) {
        setForPurchase(i, price);
    }

    cancelPurchase() {
        cancelPurchase();
    }

    upgradeTower(x, y) {
        return upgradeTower(x, y, this.scene.scenes[0]);
    }

    subscribeShooters() {
        return subscribeShooters();
    }

    gameOver()
    {
        return gameOver(this.scene);
        //return gameOver();
    }

    spawnNewBacteria(bacteria: Bacteria) {
        return spawnBacteria(this.scene.scenes[0], this.scene.scenes[0].time, bacteria.type, bacteria.follower.t, [bacteria.follower.vec.x, bacteria.follower.vec.y], bacteria.id);
    }

    spawnNewBacterias(bacterias: Bacteria[]) {
        return spawnNewBacterias(this.scene.scenes[0], this.scene.scenes[0].time, bacterias);
    }

    removeOldBacterias(newBacterias: Bacteria[]) {
        return removeOldBacterias(this.scene.scenes[0], newBacterias);
    }

    initializeNewGame() {
        return initializeGame(this.scene.scenes[0]);
    }

    initializePreviousRound() {
        return initializePreviousRound(this.scene.scenes[0]);
    }
}

var graphics;
var path;
var enemies;
var towers;
var bullets;
var obstacles;
var map = [];
var indicator;
var finTile;
var runEnemies: boolean = false;
var runTowers: boolean = false;
var eType = 0;
var isRunning = false;
//var towers: Tower[] = [];
var bacterias: Bacteria[] = [];

var purchasePreview: Phaser.GameObjects.Image;
var selectedIndex: number = -1;
var selectedPrice: number = 0;

function setForPurchase(i: number, price: number) {
    purchasePreview.setFrame(i == 1 ? 'tower' : 'village')
    purchasePreview.visible = true;
    selectedIndex = i;
    selectedPrice = price;
}

function cancelPurchase() {
    purchasePreview.visible = false;
    selectedIndex = -1;
    selectedPrice = 0;
}

function preload() {
    // load the game assets – enemy and tower atlas
    this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('map', 'assets/map.png');
}

function create() {
    let map = new Phaser.GameObjects.Image(this, this.game.config.width / 2, this.game.config.height / 2, 'map');
    this.children.add(map); // https://blurymind.github.io/tilemap-editor/
    // this graphics element is only for visualization, 
    // its not related to our path
    var graphics = this.add.graphics();
    drawGrid(graphics);
    // the path for our enemies
    // parameters are the start x and y of our path
    path = this.add.path(96, -32);
    path.lineTo(96, 160);
    path.lineTo(352, 160);
    path.lineTo(352, 288);
    path.lineTo(544, 288);
    path.lineTo(544, 96);
    path.lineTo(736, 96);
    path.lineTo(736, 416);
    path.lineTo(160, 416);
    path.lineTo(160, 608);
    path.lineTo(352, 608);
    path.lineTo(352, 544);
    path.lineTo(672, 544);
    path.lineTo(672, 736);

    graphics.lineStyle(3, 0xffffff, 1);
    // visualize the path
    path.draw(graphics);

    enemies = this.physics.add.group({ classType: Bacteria, runChildUpdate: true });
    this.nextBacteria = 0;
    towers = this.add.group({ classType: Tower, runChildUpdate: true });
    this.input.on('pointerdown', placeTower);
    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.physics.add.overlap(enemies, bullets, damageEnemy);
    obstacles = this.add.group({ classType: Obstacle, runChildUpdate: true });

    indicator = new Phaser.GameObjects.Rectangle(this, 0, 0, 64, 64, 0x00ff00, 0.25);
    this.children.add(indicator);

    purchasePreview = new Phaser.GameObjects.Image(this, 0, 0, 'sprites', 'tower');
    this.children.add(purchasePreview);
    purchasePreview.visible = false;

    finTile = this.physics.add.group({ classType: Phaser.GameObjects.Rectangle, runChildUpdate: true });
    let ft = new Phaser.GameObjects.Rectangle(this, 64 * 11 - 32, 64 * 11, 64, 64, 0xff0000, 0.25);
    ft.setActive(true);
    ft.setVisible(true);
    finTile.add(ft);
    this.physics.add.overlap(enemies, finTile, updateHealth);
}

function initializeGame(scene) {
    //scene.children.destroy();
    removeAllBacterias(scene, bacterias);
    scene.nextBacteria = 0;
    removeAllTowers(scene, towers);
    enemies.clear();
    towers.clear();
    bullets.clear();
}

function initializePreviousRound(scene) {
    //scene.children.destroy();
    removeAllBacterias(scene, bacterias);
    scene.nextBacteria = 0;
    enemies.clear();
    bullets.clear();
    removeAllTowers(scene, towers);
    towers.clear();
    populateMapWithTowers(scene);
}


function damageEnemy(enemy, bullet) {
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
        // we remove the bullet right away
        bullet.setActive(false);
        bullet.setVisible(false);

        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(bullet.damage);
        if(enemy.hp <= 0) {
            console.log("enemy died");
            let message = {
                type: 'ENEMY_DEATH',
                data: {
                    bacteriaID: enemy.id
                }
            };

            connection.send('clientMessage', JSON.stringify(message));
        }
    }
}

function updateHealth(enemy, finTile) {
    // only if both enemy and bullet are alive
    if (enemy.active === true && finTile.active === true) {
        // we remove the bullet right away
        enemy.setActive(false);
        enemy.setVisible(false);

        let message = {
            type: 'HEALTH_UPDATE',
            data: {
                change: Math.floor(enemy.hp),
                bacteriaID: enemy.id
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
}

function populateMapWithTowers(scene) {
    console.log(map);
    map.forEach((row, j) => {
        row.forEach((col, i) => {
            if (row[i] > 0) {
                placeTowerFromServer(i, j, row[i], scene);
            }
            else if (row[i] < 0) {
                placeObstacleFromServer(scene, i, j, row[i]);
            }
        });
    })
}

function placeTower(pointer) {
    var x = Math.floor(pointer.x / 64);
    var y = Math.floor(pointer.y / 64);

    //console.log([x, y], selectedIndex, map[y][x]);

    if (selectedIndex != -1 && canPlaceTower(y, x)) {

        let message = {
            type: 'TOWER_BUILD',
            data: {
                x: x,
                y: y,
                type: selectedIndex,
                price: selectedPrice
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
    else if (selectedIndex != -1 && selectedIndex == Math.floor(map[y][x] / 10)) {
        if ((selectedIndex == 1 && map[y][x] % 10 < 2) || (selectedIndex == 2 && map[y][x] % 10 < 3)) {
            let message = {
                type: 'TOWER_UPGRADE',
                data: {
                    x: x,
                    y: y,
                    price: selectedPrice
                }
            };

            connection.send('clientMessage', JSON.stringify(message));
        }
    }
}

function subscribeShooters() {
    var villageTowers = towers.getChildren();
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

function spawnNewBacterias(scene, time, bacterias: Bacteria[]) {
    if(bacterias) {
        bacterias.forEach(b => {
            spawnBacteria(scene, time, b.type, b.t, [b.follower.vec.x, b.follower.vec.y], b.id);
        })
    }
}

function spawnBacteria(scene, time, bacteriaType: number, t: number, vec: number[], id: number) {
    //console.log("SPAWNING", bacteriaType, t, vec, id)

    var enemyClient = new EnemyClient();
    let bacteria;

    if(bacteriaType == 0) {
        enemyClient.createBacteria(scene, new BacteriaBlueCreator());
        enemyClient.bacteria.setBacteriaData(t, vec, id, bacteriaType);
        if (enemyClient) {
            bacteria = enemyClient.bacteria;
        }
    }
    else {
        enemyClient.createBacteria(scene, new BacteriaPinkCreator());
        enemyClient.bacteria.setBacteriaData(t, vec, id, bacteriaType);
        if (enemyClient) {
            bacteria = enemyClient.bacteria;
        }
    }
    if (bacteria) {
        bacteria.setPath(path);
        bacteria.setActive(true);
        bacteria.setVisible(true);
        
        bacteria.startOnPath();
        
        enemies.add(bacteria);
        scene.children.add(bacteria);
        bacterias.push(bacteria);
        
        !isRunning ? bacteria.stop() : bacteria.run();
    }
}

function removeOldBacterias(scene, oldBacterias: Bacteria[]) {
    oldBacterias.forEach(ob => {
        removeBacteria(scene, ob);
    })
}

function removeBacteria(scene, oldBacteria) {
    oldBacteria.setActive(false);
    oldBacteria.setVisible(false);
    enemies.remove(oldBacteria);
    bacterias.splice(bacterias.indexOf(oldBacteria), 1);
    scene.children.remove(oldBacteria);
}

function removeAllBacterias(scene, bacterias: Bacteria[]) {
    bacterias.forEach(bacteria => {
        scene.children.remove(bacteria);
    });
    bacterias = [];
}

function removeAllTowers(scene, towers) {
    towers.children.entries.forEach(tower => {
        scene.children.remove(tower);
    });
}

/*
function subscribeShooter(shooter: Shooter) {
    var villageTowers = towers.getChildren();
    console.log(villageTowers);
    console.log(map);
    villageTowers.forEach(tower => {
        if(tower instanceof Village) {
                console.log(Phaser.Math.Distance.Between(tower.x, tower.y, shooter.x, shooter.y))
                if(shooter instanceof Shooter && Phaser.Math.Distance.Between(tower.x, tower.y, shooter.x, shooter.y) <= 64) {
                    tower.subscribe(shooter);
                }
            console.log("YES")
        }
        console.log(tower);
    });

    console.log(towers);
}
*/

function placeTowerFromServer(x, y, type, scene) {

    let director = new Director();
    let tower: Tower;
    let towerType = Math.floor(type / 10);
    switch (towerType) {
        case 1:
            let shooterBuilder = new ShooterBuilder(scene);
            director.setBuilder(shooterBuilder);
            director.buildShooter();

            tower = shooterBuilder.get();
            break;
        case 2:
            let villageBuilder = new VillageBuilder(scene);
            director.setBuilder(villageBuilder);

            tower = villageBuilder.get();
            break;
    }

    towers.add(tower);

    //var tower = towers.get();
    if (tower) {
        map[y][x] = type;
        tower.setGameData(enemies, bullets, towers);
        tower.setActive(true);
        tower.setVisible(true);
        tower.place(y, x);
    }

    scene.children.add(tower)
    let upgrades = type % 10
    console.log(upgrades);

    for (let i = 0; i < upgrades; i++) {
        upgradeTower(x, y, scene);
    }
}

function upgradeTower(x, y, scene) {

    let tower = towers.getChildren().filter(c => c.j == x && c.i == y)[0];
    //console.log(tower);
    var director = new Director();
    var newTower;

    if (tower instanceof Shooter) {
        let shooterBuilder = new ShooterBuilder(scene);

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
        let villageBuilder = new VillageBuilder(scene);

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

    towers.remove(tower);
    scene.children.remove(tower);

    towers.add(newTower);
    newTower.setGameData(enemies, bullets);
    newTower.setActive(true);
    newTower.setVisible(true);
    newTower.setFrame(newTower.parts.join('').toLowerCase())
    newTower.place(y, x);

    scene.children.add(newTower);
}

function canPlaceTower(y, x) {
    if (!map || map.length == 0 || map[y] === undefined || map[y][x] === undefined)
        return false;

    return map[y][x] === 0;
}

function placeObstacleFromServer(scene, j, i, type) {
    var obstacle = new ObstacleClient();

    switch (type) {
        case -2: {
            obstacle.createPlantObstacle(scene, new SmallObstacleFactory());
            let spo = obstacle.plantObstacle;
            if (spo) {
                spo.setActive(true);
                spo.setVisible(true);
                spo.place(i, j);
                obstacles.add(spo);
                scene.children.add(spo);
            }
            break;
        }
        case -3: {
            obstacle.createPlantObstacle(scene, new MediumObstacleFactory());
            let mpo = obstacle.plantObstacle;
            if (mpo) {
                mpo.setActive(true);
                mpo.setVisible(true);
                mpo.place(i, j);
                obstacles.add(mpo);
                scene.children.add(mpo);
            }
            break;
        }
        case -4: {
            obstacle.createPlantObstacle(scene, new BigObstacleFactory());
            let bpo = obstacle.plantObstacle;
            if (bpo) {
                bpo.setActive(true);
                bpo.setVisible(true);
                bpo.place(i, j);
                obstacles.add(bpo);
                scene.children.add(bpo);
            }
            break;
        }
        case -5: {
            obstacle.createRockObstacle(scene, new SmallObstacleFactory());
            let smo = obstacle.rockObstacle;
            if (smo) {
                smo.setActive(true);
                smo.setVisible(true);
                smo.place(i, j);
                obstacles.add(smo);
                scene.children.add(smo);
            }
            break;
        }
        case -6: {
            obstacle.createRockObstacle(scene, new MediumObstacleFactory());
            let mmo = obstacle.rockObstacle;
            if (mmo) {
                mmo.setActive(true);
                mmo.setVisible(true);
                mmo.place(i, j);
                obstacles.add(mmo);
                scene.children.add(mmo);
            }
            break;
        }
        case -7: {
            obstacle.createRockObstacle(scene, new BigObstacleFactory());
            let bmo = obstacle.rockObstacle;
            if (bmo) {
                bmo.setActive(true);
                bmo.setVisible(true);
                bmo.place(i, j);
                obstacles.add(bmo);
                scene.children.add(bmo);
            }
            break;
        }
        default: {
            break;
        }
    }
}

function update(scene, time, bacteriaType: number, t: number, vec: number[], id: number) {
    let ix = Math.floor(this.input.activePointer.x / 64);
    let iy = Math.floor(this.input.activePointer.y / 64);

    indicator.x = ix * 64 + 32;
    indicator.y = iy * 64 + 32;

    if (purchasePreview != undefined) {
        purchasePreview.x = ix * 64 + 32;
        purchasePreview.y = iy * 64 + 32;
    }

    if (!canPlaceTower(iy, ix)) {
        indicator.fillColor = 0xff0000;
    }
    else {
        indicator.fillColor = 0x00ff00;
    }
}

function gameOver(scene)
{
    console.log('stop');
    scene.scene.stop();
}

function drawGrid(graphics) {
    graphics.lineStyle(1, 0xffffff, 0.15);
    for (var i = 0; i <= config.width / 64; i++) {
        graphics.moveTo(i * 64, 0);
        graphics.lineTo(i * 64, config.height);
    }
    for (var j = 0; j <= config.height / 64; j++) {
        graphics.moveTo(0, j * 64);
        graphics.lineTo(config.width, j * 64);
    }
    graphics.strokePath();
}