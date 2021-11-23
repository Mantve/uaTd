import * as Phaser from 'phaser';

export default class Crystal extends Phaser.GameObjects.Image {
    h1 = new Crystal1Handler();
    h2 = new Crystal2Handler();
    h3 = new Crystal3Handler();
    h4 = new Crystal4Handler();
    currentFrame: number;
    i: number;
    j: number;

    nextTic = 0;
    
    constructor(scene) {
        super(scene, 0, 0, 'sprites', 'small_rock');
        this.currentFrame = 0;
        this.h1.setNext(this.h2)
        this.h2.setNext(this.h3)
        this.h3.setNext(this.h4)
    }

    update(time, delta) {
        if (time > this.nextTic) {
            this.h1.handle(this.currentFrame.toString(), this);
            this.nextTic = time + 2000;
        }
    }

    place(i, j) {
        this.i = i,
            this.j = j;
    
        this.y = i * 64 + 64 / 2;
        this.x = j * 64 + 64 / 2;
      }
}

interface IHandler 
{
    setNext(handler: IHandler): IHandler;
    handle(request: string, crystal: Crystal): string;    
}

abstract class AbstractHandler implements IHandler
{
    private nextHandler: IHandler;
    protected frameType = 0;

    public setNext(handler: IHandler): IHandler {
        this.nextHandler = handler;

        return handler
    }
    handle(request: string, crystal: Crystal): string {
        if(this.nextHandler) {
            return this.nextHandler.handle(request, crystal);
        }

        return null;
    }
}

class Crystal1Handler extends AbstractHandler {
    public handle(request: string, crystal: Crystal) {
        if(request == '0') {
            crystal.setFrame('level1crystal')
            this.frameType++;
            crystal.currentFrame++;
        }

        return super.handle(request, crystal);
    }
}

class Crystal2Handler extends AbstractHandler {
    public handle(request: string, crystal: Crystal) {
        if(request == '1') {
            crystal.setFrame('level2crystal')
            this.frameType++;
            crystal.currentFrame++;
        }

        return super.handle(request, crystal);
    }
}

class Crystal3Handler extends AbstractHandler {
    public handle(request: string, crystal: Crystal) {
        if(request == '2') {
            crystal.setFrame('level3crystal')
            this.frameType++;
            crystal.currentFrame++;
        }

        return super.handle(request, crystal);
    }
}

class Crystal4Handler extends AbstractHandler {
    public handle(request: string, crystal: Crystal) {
        if(request == '3') {
            crystal.setFrame('level4crystal')
            this.frameType = 0;
            crystal.currentFrame = 0;
        }

        return super.handle(request, crystal);
    }
}