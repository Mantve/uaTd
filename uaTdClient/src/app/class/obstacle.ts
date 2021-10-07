import * as Phaser from 'phaser';

export abstract class Obstacle extends Phaser.GameObjects.Image {
    constructor(scene, x, y, spriteFile, sprite){
        super(scene, x, y, spriteFile, sprite);
    }

    place(i, j) {
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
    }

    update(time, delta) { }
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
}

export class MediumPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'medium_plant');
    }
}

export class BigPlant extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'big_plant');
    }
}

export class SmallRock extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'small_rock');
    }
}

export class MediumRock extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'medium_rock');
    }
}

export class BigRock extends PlantObstacle {
    constructor(scene){
        super(scene, 0, 0, 'sprites', 'big_rock');
    }
}

export class ObstacleFactory {
    createPlantObstacle(scene, size): PlantObstacle {
        var obstacle;
        switch(size) {
            case 'small': {
                obstacle = new SmallObstacleFactory().createPlantObstacle(scene);
                break;
            }
            case 'medium': {
                obstacle = new MediumObstacleFactory().createPlantObstacle(scene);
                break;
            }
            case 'big': {
                obstacle = new BigObstacleFactory().createPlantObstacle(scene);
                break;
            }
        }
        return obstacle;
    };

    createRockObstacle(scene, size): RockObstacle {
        var obstacle;
        switch(size) {
            case 'small': {
                obstacle = new SmallObstacleFactory().createRockObstacle(scene);
                break;
            }
            case 'medium': {
                obstacle = new MediumObstacleFactory().createRockObstacle(scene);
                break;
            }
            case 'big': {
                obstacle = new BigObstacleFactory().createRockObstacle(scene);
                break;
            }
        }
        return obstacle;
    };
};

export class SmallObstacleFactory implements ObstacleFactory {
    createPlantObstacle(scene): PlantObstacle {
        return new SmallPlant(scene);
    }
    
    createRockObstacle(scene): RockObstacle {
        return new SmallRock(scene);
    }
}

export class MediumObstacleFactory implements ObstacleFactory {
    createPlantObstacle(scene): PlantObstacle {
        return new MediumPlant(scene);
    }
    
    createRockObstacle(scene): RockObstacle {
        return new MediumRock(scene);
    }
}

export class BigObstacleFactory implements ObstacleFactory {
    createPlantObstacle(scene): PlantObstacle {
        return new BigPlant(scene);
    }
    
    createRockObstacle(scene): RockObstacle {
        return new BigRock(scene);
    }
}