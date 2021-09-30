import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import Game from "./class/game";

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
  money: number = 1000;
  game: any;
  
  storeTowers = [
    {
        name: 'Spicy Milk',
        price: 100
    },
    {
        name: 'Banana Milk',
        price: 85
    },
    {
        name: 'Choco Milk',
        price: 150
    },
    {
        name: 'Strawberry Milk',
        price: 125
    },
    {
        name: 'Almond Milk',
        price: 50
    }
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
  }
  
  ngOnInit(): void {
    
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
  }

  sendChat() {
    if(this.message.length == 0) 
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
            text: serverMessage.data.username + " has joined the game"
          };
          this.chatMessages.push(tempMessage);
          break;
        case 'GAMESTATE_INIT':
          this.loadGame(serverMessage.data.map);
          
          this.money = serverMessage.data.money;
          this.game.updateMap(serverMessage.data.map);

          tempMessage = {
            username: "Server",
            text: "You have joined the game"
          };
          this.chatMessages.push(tempMessage);

          this.shownScreen = 'game';
          break;
        case 'GAMESTATE_UPDATE':
          this.money = serverMessage.data.money;
          this.game.updateMap(serverMessage.data.map);
          break;
        case 'CHAT_SEND':
          tempMessage = serverMessage.data;
          this.chatMessages.push(tempMessage);
          break;
        case 'TOWER_PURCHASE':
          this.money -= serverMessage.data.change;
          break;
        case 'TOWER_BUILD':
          this.game.placeTurretFromServer(serverMessage.data.x, serverMessage.data.y)
          break;
        default:
    }
  }

  purchase(i: integer) {
    let message = {
      type: 'TOWER_PURCHASE',
      data: {
          change: this.storeTowers[i].price
      }
    };

    this.connection.send('clientMessage', JSON.stringify(message));
  }
}