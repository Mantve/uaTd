import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import * as Phaser from 'phaser';
import { constants } from './_constants';
import Tower, { Builder, Director, Publisher, Shooter, ShooterBuilder, Subscriber, Village, VillageBuilder } from './tower';
import Bullet from './bullet';
import { Obstacle, SmallObstacleFactory, MediumObstacleFactory, BigObstacleFactory } from './obstacle';
import { Enemy, BacteriaBlueCreator, BacteriaPinkCreator } from './enemy';

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

    placeTowerFromServer(x, y, type) {
        return placeTowerFromServer(x, y, type, this.scene.scenes[0])
    }

    populateMapWithTowers() {
        return populateMapWithTowers(this.scene.scenes[0]);
    }

    setForPurchase(i: number) {
        setForPurchase(i);
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

var purchasePreview: Phaser.GameObjects.Image;
var selectedIndex: number = -1;

function setForPurchase(i: number) {
    purchasePreview.setFrame(i == 1 ? 'tower' : 'village')
    purchasePreview.visible = true;
    selectedIndex = i;
}

function cancelPurchase() {
    purchasePreview.visible = false;
    selectedIndex = -1;
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

    enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
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

function damageEnemy(enemy, bullet) {
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
        // we remove the bullet right away
        bullet.setActive(false);
        bullet.setVisible(false);

        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(bullet.damage);
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
                change: Math.floor(enemy.hp)
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
}

function populateMapWithTowers(scene) {
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
                type: selectedIndex
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
    else if (selectedIndex != -1 && selectedIndex == map[y][x]) {

        let message = {
            type: 'TOWER_UPGRADE',
            data: {
                x: x,
                y: y
            }
        };

        connection.send('clientMessage', JSON.stringify(message));
    }
}

function subscribeShooters() {
    var villageTowers = towers.getChildren();
    console.log(villageTowers);
    console.log(map);
    villageTowers.forEach(tower => {
        if(tower instanceof Village) {
            villageTowers.forEach(shooter => {
                console.log(Phaser.Math.Distance.Between(tower.x, tower.y, shooter.x, shooter.y))
                if(shooter instanceof Shooter && Phaser.Math.Distance.Between(tower.x, tower.y, shooter.x, shooter.y) <= 64) {
                    tower.subscribe(shooter);
                }
            });
            console.log("YES")
        }
        console.log(tower);
    });

    console.log(towers);
}

function placeTowerFromServer(x, y, type, scene) {
    let director = new Director();
    let tower: Tower;

    switch (type) {
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
}

function upgradeTower(x, y, scene) {
    let tower = towers.getChildren().filter(c => c.j == x && c.i == y)[0];
    //console.log(tower);
    var director = new Director();
    var newTower;

    if(tower instanceof Shooter) {
        let shooterBuilder = new ShooterBuilder(scene);

        director.setBuilder(shooterBuilder);
        if(!tower.parts.includes('SNIPER')) {
            director.buildShooterWithSniper();
        }
        else {
            director.buildShooterWithEverything();
        }
        
        //Sitoj vietoj reiketu surast kam subscribines, pasalint is priskirto village ir newTower pridet tam paciam village
        newTower = shooterBuilder.get();
    }
    else if(tower instanceof Village) {
        let villageBuilder = new VillageBuilder(scene);

        if(tower.parts.includes('WALLS'))
            return;

        director.setBuilder(villageBuilder);
        if(!tower.parts.includes('CANNON')) {
            director.buildVillageWithCannon();
        }
        else if(!tower.parts.includes('RADAR')) {
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

        var enemy = new Enemy();
        let bacteria;
        if(eType === 0) {
            enemy.createBacteria(this, new BacteriaBlueCreator());
            if (enemy) {
                bacteria = enemy.bacteria;
                eType = 1; 
            }
        }
        else {
            enemy.createBacteria(this, new BacteriaPinkCreator());
            if (enemy) {
                bacteria = enemy.bacteria;
                eType = 0; 
            }
        }
        //var enemy = enemies.get();
        if (bacteria) {
            bacteria.setPath(path);
            bacteria.setActive(true);
            bacteria.setVisible(true);
            
            // place the enemy at the start of the path
            bacteria.startOnPath();
            
            this.nextBacteria = time + 2000;

            enemies.add(bacteria);
            this.children.add(bacteria);
        }
    }

    let ix = Math.floor(this.input.activePointer.x / 64);
    let iy = Math.floor(this.input.activePointer.y / 64);

    indicator.x = ix * 64 + 32;
    indicator.y = iy * 64 + 32;

    if(purchasePreview != undefined) {
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