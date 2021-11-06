import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import Game, { IGame } from "./class/game";
import { Bacteria, GameState } from './class';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

interface ChatMessage {
  username: string,
  text: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'uaTdClient';
  shownScreen: string = 'meet';
  connection: any;
  username: string = new Date().getTime().toString();
  message: string = '';
  chatMessages: ChatMessage[] = [];
  selectedIndex = -1;

  gameState: GameState;

  game: any;
  initFlag: boolean = false;

  storeTowers = [
    {
      name: 'Shooter',
      price: 100,
      image: 'milk.png'
    },
    {
      name: 'Village',
      price: 200,
      image: 'milk.png'
    }
  ]

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5001/hub")
      .build();

    this.connection.start().catch(err => document.write(err));
    this.connection.on("serverDataMessage", (data: string) => {
      this.processServerMessage(data);
    });

    this.gameState = new GameState();
  }

  ngOnInit(): void {
    this.game = new Game(this.connection);
  }

  join() {
    if (this.username.length > 3) {
      this.connection.send('clientMessage', JSON.stringify({
        type: 'JOIN',
        data: {
          username: this.username
        }
      }));
    }
  }

  loadGame(map) {
    this.game = new Game(this.connection, map);
  }

  startGame() {
    if(this.gameState.health <= 0) {
      this.resetGame();
      return;
    }

    if(!this.gameState.gameIsOver) {
      this.connection.send('clientMessage', JSON.stringify({
        type: 'GAME_RUN_STOP',
        data: {}
      }));
    }
  }

  resetGame() {
    this.connection.send('clientMessage', JSON.stringify({
      type: 'RESET_GAME',
      data: {}
    }))
  }

  resetRound() {
    let message = {
      type: 'RESET_ROUND',
      data: {}
    };

    this.connection.send('clientMessage', JSON.stringify(message));
  }

  sendChat() {
    if (this.message.length == 0)
      return;

    this.connection.send('clientMessage', JSON.stringify({
      type: 'CHAT_SEND',
      data: {
        username: this.username,
        text: this.message
      }
    })).then(x => {
      this.message = "";
    });
  }

  processServerMessage(encodedData: string) {
    const serverMessage = JSON.parse(encodedData);
    console.log(serverMessage);

    switch (serverMessage.type) {
      case 'JOIN':
        this.chatMessages.push({
          username: "Server",
          text: serverMessage.data.username + " prisijungė prie žaidimo"
        });
        break;

      case 'GAMESTATE_INIT':
        this.gameState = serverMessage.data;
        this.gameState.gameActiveState ? this.game.runGame() : this.game.stopGame();

        this.game.updateMap(serverMessage.data.map);
        this.game.populateMapWithTowers();

        this.chatMessages.push({
          username: "Server",
          text: "Prisijungei prie žaidimo"
        });

        let initialBacterias = serverMessage.data.bacterias as Bacteria[];
        this.game.spawnNewBacterias(initialBacterias);
        this.shownScreen = 'game';
        break;

      case 'GAMESTATE_UPDATE':
        this.gameState = serverMessage.data;
        this.gameState.gameActiveState ? this.game.runGame() : this.game.stopGame();

        if(this.gameState.gameActiveState) {
          let bacteriasFromServer = serverMessage.data.bacterias as Bacteria[];

          let newBacterias = bacteriasFromServer.filter(nb => !this.game.bacteria.some(b => b.id == nb.id));
          let oldBacterias = this.game.bacteria.filter(nb => !bacteriasFromServer.some(b => b.id == nb.id));

          this.game.spawnNewBacterias(newBacterias);
          this.game.removeOldBacterias(oldBacterias);
        }

        this.game.updateMap(serverMessage.data.map);
        break;

      case 'CHAT_SEND':
        this.chatMessages.push(serverMessage.data);
        break;

      case 'TOWER_PURCHASE':
        this.gameState.money -= serverMessage.data.change;
        break;

      case 'TOWER_BUILD':
        this.game.placeTowerFromServer(serverMessage.data.x, serverMessage.data.y, serverMessage.data.type)
        this.game.subscribeShooters(); //Should be called on tower changes
        break;

      case 'TOWER_UPGRADE':
        this.game.upgradeTower(serverMessage.data.x, serverMessage.data.y)
        this.game.subscribeShooters(); //Should be called on tower changes
        break;

      case 'TOWER_DOWNGRADE':
        this.game.downgradeTower(serverMessage.data.x, serverMessage.data.y)
        this.game.subscribeShooters(); //Should be called on tower changes
        break;

      case 'GAME_OVER':
        this.gameState.gameIsOver = true;
        this.game.gameOver();
        break;

      case 'RESET_GAME':
        this.gameState = serverMessage.data;
        this.game.updateMap(serverMessage.data.map);
        this.game.initializeNewGame();
        break;

      case 'RESET_ROUND':
        this.gameState = serverMessage.data;
        this.game.updateMap(serverMessage.data.map);
        this.game.initializePreviousRound();
        break;

      case 'SPAWN_ENEMY':
        let serverEnemy = serverMessage.data as Bacteria;
        this.game.spawnNewBacteria(serverEnemy)
        break;

      case 'ROUND_OVER':
        this.gameState = serverMessage.data;
        break;
      default:
    }
  }

  purchase(i: integer) {
    if(i == -2) {
      if(this.selectedIndex == -2) {
        this.selectedIndex = -1;
        return;
      }
      this.selectedIndex = -2;
      this.game.setForDowngrade();
    }
    else if (this.selectedIndex != -1 && this.selectedIndex == i) {
      this.selectedIndex = -1;
      this.game.cancelPurchase();
    }
    else {
      this.selectedIndex = i;
      var price = this.storeTowers[i - 1].price;
      this.game.setForPurchase(i, price);
    }
  }
}
