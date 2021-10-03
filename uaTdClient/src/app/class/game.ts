import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import * as Phaser from 'phaser';
import { constants } from './_constants';
import Bacteria from './enemy';
import Tower from './tower';
import Bullet from './bullet';
import { BigObstacleFactory, MediumObstacleFactory, Obstacle, SmallObstacleFactory } from './obstacle';
import BacteriaCreator from './enemy';

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
var scene: Phaser.Scene;

export default class Game extends Phaser.Game {

    constructor(connection1, map1) {
        super(config);
        connection = connection1;
        map = map1;
        game = this;
        scene = game.scene;
    }

    updateMap(map1) {
        map = map1;
    }

    printMap() {
        console.log(map)
    }

    placeTowerFromServer(x, y) {
        return placeTowerFromServer(x, y)
    }

    populateMapWithTowers() {
        return populateMapWithTowers();
    };
}

var graphics;
var path;
var enemies;
var towers;
var bullets;
var obstacles;
var map = [];
var indicator;

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
    this.nextEnemy = 0;
    towers = this.add.group({ classType: Tower, runChildUpdate: true });
    this.input.on('pointerdown', placeTower);
    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.physics.add.overlap(enemies, bullets, damageEnemy);
    obstacles = this.add.group({ classType: Obstacle, runChildUpdate: true });

    indicator = new Phaser.GameObjects.Rectangle(this, 0, 0, 64, 64, 0x00ff00, 0.25);
    this.children.add(indicator);
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

function populateMapWithTowers() {
    map.forEach((row, j) => {
        row.forEach((col, i) => {
            if (row[i] === 1) {
                placeTowerFromServer(i, j);
            }
            else if (row[i] === -2) {
                placeObstacleFromServer(i, j, row[i]);
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

    /*if (canPlaceTower(i, j)) {
        var tower = towers.get();
        if (tower) {
            tower.setActive(true);
            tower.setVisible(true);
            tower.place(i, j);
        }
    }*/
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

function placeObstacleFromServer(j, i, type) {
    var smallObstacleFactory = new SmallObstacleFactory();
    var mediumObstacleFactory = new MediumObstacleFactory();
    var bigObstacleFactory = new BigObstacleFactory();
    var obstacle;

    console.log(j, i, type);

    switch(type) {
        case -2: {
            obstacle = smallObstacleFactory.createPlantObstacle(this);
            break;
        }
        case -3: {
            obstacle = mediumObstacleFactory.createPlantObstacle(this);
            break;
        }
        case -4: {
            obstacle = bigObstacleFactory.createPlantObstacle(this);
            break;
        }
        case -5: {
            obstacle = smallObstacleFactory.createRockObstacle(this);
            break;
        }
        case -6: {
            obstacle = mediumObstacleFactory.createRockObstacle(this);
            break;
        }
        case -7: {
            obstacle = bigObstacleFactory.createRockObstacle(this);
            break;
        }
        default: {
            break;
        }
    }

    if (obstacle) {
        obstacle.setActive(true);
        obstacle.setVisible(true);
        obstacle.place(i, j);
        obstacles.add(obstacle);
        this.children.add(obstacle);
    }
}

function update(time, delta) {
    // if its time for the next enemy
    if (time > this.nextEnemy) {
        var enemy = new BacteriaCreator().createBacteria(this);
        //var enemy = enemies.get();
        if (enemy) {
            enemy.setPath(path);
            enemy.setActive(true);
            enemy.setVisible(true);
            
            // place the enemy at the start of the path
            enemy.startOnPath();
            
            this.nextEnemy = time + 2000;

            enemies.add(enemy);
            this.children.add(enemy);
        }
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