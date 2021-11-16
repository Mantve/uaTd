import { Bacteria } from './enemy'

export class GameState {
    map: number[][];
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
