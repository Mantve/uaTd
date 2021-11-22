import { MapData, Bacteria } from '.';

export class GameState {
    map: MapData;
    money: number;
    score: number;
    health: number;
    wave: number;
    bacterias: Bacteria[];
    gameActiveState: boolean;
    gameIsOver: boolean;
    roundIsActive: boolean;
    stage: number;
}
