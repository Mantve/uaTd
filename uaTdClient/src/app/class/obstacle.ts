import * as Phaser from 'phaser';

export abstract class Obstacle extends Phaser.GameObjects.Image {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }
};

export abstract class PlantObstacle extends Obstacle {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }
}

export abstract class RockObstacle extends Obstacle {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }
}

export class SmallPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'small_plant');
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) {
    }
}

export class MediumPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'medium_plant');
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) {
    }
}

export class BigPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'big_plant');
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) {
    }
}

export class SmallRock extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'small_rock');
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) {
    }
}

export class MediumRock extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'medium_rock');
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) {
    }
}

export class BigRock extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'big_rock');
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) {
    }
}

abstract class ObstacleFactory {
    abstract createPlantObstacle(scene);
    abstract createRockObstacle(scene);
};

export class SmallObstacleFactory extends ObstacleFactory {
    createPlantObstacle(scene) {
        return new SmallPlant(scene);
    }
    
    createRockObstacle(scene) {
        return new SmallRock(scene);
    }
}

export class MediumObstacleFactory extends ObstacleFactory {
    createPlantObstacle(scene) {
        return new MediumPlant(scene);
    }
    
    createRockObstacle(scene) {
        return new MediumRock(scene);
    }
}

export class BigObstacleFactory extends ObstacleFactory {
    createPlantObstacle(scene) {
        return new BigPlant(scene);
    }
    
    createRockObstacle(scene) {
        return new BigRock(scene);
    }
}