import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import Game from "./class/game";
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
    }/*,
    {
      name: 'Choco Milk',
      price: 150
    },
    {
      name: 'Berry Milk',
      price: 125
    },
    {
      name: 'Almond Milk',
      price: 50
    }*/
  ]

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5001/hub")
      .build();

    this.connection.start().catch(err => document.write(err));

    // Server messages processing

    this.connection.on("serverDataMessage", (data: string) => {
      this.processServerMessage(data);
    });

    this.gameState = new GameState();
  }

  ngOnInit(): void {
    this.game = new Game(this.connection, [])
  }

  join() {
    if (this.username.length > 3) {
      let message = {
        type: 'JOIN',
        data: {
          username: this.username
        }
      };

      this.connection.send('clientMessage', JSON.stringify(message));
    }
  }

  loadGame(map) {
    this.game = new Game(this.connection, map);
    //this.initFlag = true;
  }

  startGame() {
    let message = {
      type: 'GAME_RUN_STOP',
      data: {}
    };

    this.connection.send('clientMessage', JSON.stringify(message));
  }

  resetGame() {
    let message = {
      type: 'RESET_GAME',
      data: {}
    };

    this.connection.send('clientMessage', JSON.stringify(message)).then(x => { this.game.initializeNewGame() })
    this.gameState.gameActiveState = false;
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

    let message = {
      type: 'CHAT_SEND',
      data: {
        username: this.username,
        text: this.message
      }
    };

    this.connection.send('clientMessage', JSON.stringify(message)).then(x => {
      this.message = "";
    });
  }

  processServerMessage(encodedData: string) {
    const serverMessage = JSON.parse(encodedData);
    console.log(serverMessage);
    let tempMessage;

    switch (serverMessage.type) {
      case 'JOIN':
        tempMessage = {
          username: "Server",
          text: serverMessage.data.username + " prisijungė prie žaidimo"
        };
        this.chatMessages.push(tempMessage);
        break;
      case 'GAMESTATE_INIT':
        this.gameState = serverMessage.data;
        this.gameState.gameActiveState ? this.game.runEnemies() : this.game.stopEnemies();
        
        this.game.updateMap(serverMessage.data.map);
        this.game.populateMapWithTowers();

        tempMessage = {
          username: "Server",
          text: "Prisijungei prie žaidimo"
        };
        this.chatMessages.push(tempMessage);
        this.game.runEnemies();
        let initialBacterias = serverMessage.data.bacterias as Bacteria[];
        console.log(serverMessage);
        console.log(initialBacterias);
        this.game.spawnNewBacterias(initialBacterias);
        console.log("***")
        this.shownScreen = 'game';
        break;
      case 'GAMESTATE_UPDATE':
        this.gameState = serverMessage.data;
        this.gameState.gameActiveState ? this.game.runEnemies() : this.game.stopEnemies();
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
        tempMessage = serverMessage.data;
        this.chatMessages.push(tempMessage);
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
      case 'GAME_OVER':
        this.gameState.gameIsOver = true;
        //this.gameState.gameActiveState = false; 
        this.game.gameOver();
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
    if (this.selectedIndex != -1 && this.selectedIndex == i) {
      this.selectedIndex = -1;
      this.game.cancelPurchase();
    }
    else {
      this.selectedIndex = i;
      var price = this.storeTowers[i - 1].price;
      this.game.setForPurchase(i, price);
    }


    /*let message = {
      type: 'TOWER_PURCHASE',
      data: {
        change: this.storeTowers[i].price
      }
    };

    this.connection.send('clientMessage', JSON.stringify(message));*/
  }
}
