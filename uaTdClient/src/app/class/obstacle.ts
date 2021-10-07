import * as Phaser from 'phaser';

export class Obstacle {
    plantObstacle: PlantObstacle;
    rockObstacle: RockObstacle;

    createPlantObstacle(scene, factory: AbstractObstacleFactory) {
        this.plantObstacle = factory.createPlantObstacle(scene);
    }

    createRockObstacle(scene, factory: AbstractObstacleFactory) {
        this.rockObstacle = factory.createRockObstacle(scene);
    }
};

abstract class PlantObstacle extends Phaser.GameObjects.Image {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) { }
}

abstract class RockObstacle extends Phaser.GameObjects.Image {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) { }
}

class SmallPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'small_plant');
    }
}

class MediumPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'medium_plant');
    }
}

class BigPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'big_plant');
    }
}

class SmallRock extends RockObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'small_rock');
    }
}

class MediumRock extends RockObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'medium_rock');
    }
}

class BigRock extends RockObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'big_rock');
    }
}

abstract class AbstractObstacleFactory {
    abstract createPlantObstacle(scene): PlantObstacle;
    abstract createRockObstacle(scene): RockObstacle;
};

export class SmallObstacleFactory implements AbstractObstacleFactory {
    createPlantObstacle(scene): PlantObstacle {
        return new SmallPlant(scene);
    }
    
    createRockObstacle(scene): RockObstacle {
        return new SmallRock(scene);
    }
}

export class MediumObstacleFactory implements AbstractObstacleFactory {
    createPlantObstacle(scene): PlantObstacle {
        return new MediumPlant(scene);
    }
    
    createRockObstacle(scene): RockObstacle {
        return new MediumRock(scene);
    }
}

export class BigObstacleFactory implements AbstractObstacleFactory {
    createPlantObstacle(scene): PlantObstacle {
        return new BigPlant(scene);
    }
    
    createRockObstacle(scene): RockObstacle {
        return new BigRock(scene);
    }
}