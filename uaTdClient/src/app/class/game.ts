import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import * as Phaser from 'phaser';
import { constants } from './_constants';
import Tower from './tower';
import Bullet from './bullet';
import { Obstacle, SmallObstacleFactory, MediumObstacleFactory, BigObstacleFactory } from './obstacle';
import { Enemy, BacteriaBlueCreator, BacteriaPinkCreator } from './enemy';
import { Bacteria } from '.';

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

    runEnemies() {
        runEnemies = true;
    }

    printMap() {
        console.log(map)
    }

    placeTowerFromServer(x, y) {
        return placeTowerFromServer(x, y)
    }

    populateMapWithTowers() {
        return populateMapWithTowers(this.scene.scenes[0]);
    }

    spawnNewBacterias(bacterias: Bacteria[]) {
        return spawnNewBacterias(this.scene.scenes[0], this.scene.scenes[0].time, bacterias);
    }

    removeOldBacterias(newBacterias: Bacteria[]) {
        return removeOldBacterias(this.scene.scenes[0], newBacterias);
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
var eType = 0;

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

    enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.nextBacteria = 0;
    towers = this.add.group({ classType: Tower, runChildUpdate: true });
    this.input.on('pointerdown', placeTower);
    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.physics.add.overlap(enemies, bullets, damageEnemy);
    obstacles = this.add.group({ classType: Obstacle, runChildUpdate: true });

    indicator = new Phaser.GameObjects.Rectangle(this, 0, 0, 64, 64, 0x00ff00, 0.25);
    this.children.add(indicator);
    
    finTile = this.physics.add.group({ classType: Phaser.GameObjects.Rectangle, runChildUpdate: true });
    let ft = new Phaser.GameObjects.Rectangle(this, 64 * 11 - 32, 64 * 11, 64, 64, 0xff0000, 0.25);
    ft.setActive(true);
    ft.setVisible(true);
    finTile.add(ft);
    this.physics.add.overlap(enemies, finTile, updateHealth);
}

function damageEnemy(enemy, bullet) {
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
        // we remove the bullet right away
        bullet.setActive(false);
        bullet.setVisible(false);

        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(constants.BULLET_DAMAGE);

    }
}

function updateHealth(enemy, finTile) {
    // only if both enemy and bullet are alive
    let bacteriaEnemy = enemy as Bacteria
    if (enemy.active === true && finTile.active === true) {
        // we remove the bullet right away
        //console.log(enemy.bacteria);
        //console.log(bacteriaEnemy.getBacteriaId());
        //console.log(enemy.getBacteria())
        enemy.setActive(false);
        enemy.setVisible(false);
        //enemies

        let message = {
            type: 'HEALTH_UPDATE',
            data: {
                change: Math.floor(enemy.hp),
                removeEnemy: bacteriaEnemy.getBacteriaId()
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
}

function populateMapWithTowers(scene) {
    map.forEach((row, j) => {
        row.forEach((col, i) => {
            if (row[i] === 1) {
                placeTowerFromServer(i, j);
            }
            else if ([-2, -3, -4, -5, -6, -7].includes(row[i])) {
                placeObstacleFromServer(scene, i, j, row[i]);
            }
        });
    })
}

function placeTower(pointer) {
    var i = Math.floor(pointer.y / 64);
    var j = Math.floor(pointer.x / 64);

    if (canPlaceTower(i, j)) {

        let message = {
            type: 'TOWER_BUILD',
            data: {
                x: j,
                y: i
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
}

function placeTowerFromServer(j, i) {
    var tower = towers.get();
    if (tower) {
        tower.setGameData(enemies, bullets, map);
        tower.setActive(true);
        tower.setVisible(true);
        tower.place(i, j);
    }
}

function canPlaceTower(i, j) {
    if (!map || map.length == 0 || map[i] === undefined || map[i][j] === undefined)
        return false;

    return map[i][j] === 0;
}

function placeObstacleFromServer(scene, j, i, type) {
    var obstacle = new Obstacle();

    switch(type) {
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

function update(time, delta) {
    // if its time for the next enemy
    if (runEnemies && time > this.nextBacteria) {
        //console.log(eType)
        let message = {
            type: 'SPAWN_BACTERIA',
            data: {
                health: (eType ? 50 : 100),
                t: 0,
                vec: [0, 0],
                type: eType
            }
        };

        this.nextBacteria = time + 2000;
        eType = eType == 0 ? 1 : 0;

        connection.send('clientMessage', JSON.stringify(message));
    }

    let ix = Math.floor(this.input.activePointer.x / 64);
    let iy = Math.floor(this.input.activePointer.y / 64);

    indicator.x = ix * 64 + 32;
    indicator.y = iy * 64 + 32;
    if (!canPlaceTower(iy, ix)) {
        indicator.fillColor = 0xff0000;
    }
    else {
        indicator.fillColor = 0x00ff00;
    }
}

function spawnNewBacterias(scene, time, bacterias: Bacteria[]) {
    bacterias.forEach(b => {
        spawnBacteria(scene, time, b.type, b.follower.t, [b.follower.vec.x, b.follower.vec.y], b.id);
    })
}

function spawnBacteria(scene, time, bacteriaType: number, t: number, vec: number[], id: number) {
    //console.log("SPAWNING", time, bacteriaType, t, vec)

    var enemy = new Enemy();
    let bacteria;

    if(bacteriaType == 0) {
        enemy.createBacteria(scene, new BacteriaBlueCreator(), t, vec, bacteriaType, id);
        if (enemy) {
            bacteria = enemy.bacteria;
        }
    }
    else {
        enemy.createBacteria(scene, new BacteriaPinkCreator(), t, vec, bacteriaType, id);
        if (enemy) {
            bacteria = enemy.bacteria;
        }
    }
    
    if (bacteria) {
        bacteria.setPath(path);
        bacteria.setActive(true);
        bacteria.setVisible(true);
        
        bacteria.startOnPath();

        enemies.add(bacteria);
        scene.children.add(bacteria);
    }
}

function removeOldBacterias(scene, oldBacterias: Bacteria[]) {
    oldBacterias.forEach(ob => {
        removeBacteria(scene, ob);
    })
}

function removeBacteria(scene, oldBacteria: Bacteria) {
    oldBacteria.setActive(false);
    oldBacteria.setVisible(false);
    enemies.splice(enemies.indexOf(oldBacteria), 1);
    scene.children.splice(scene.children.indexOf(oldBacteria), 1);
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