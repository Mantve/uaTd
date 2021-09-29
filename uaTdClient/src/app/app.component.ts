import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import { getDataDetail } from '@microsoft/signalr/dist/esm/Utils';
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
  game: any;
  money: number = 1000;
  
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

  meet() {
    if (this.username.length > 3) {
        let message = {
            type: 0,
            data: {
                username: this.username
            }
        };

        this.connection.send('clientMessage', JSON.stringify(message));
    }
  }

  loadGame() {
    let tgame = new Game;
    this.game = tgame.game;
  }

  sendChat() {
    if(this.message.length == 0) 
      return;

    let message = {
      type: 2,
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
    const data = JSON.parse(encodedData);
    console.log(data);

    switch (data.type) {
        case 0:
          let userHasJoinedMessage: ChatMessage = {
            username: "Server",
            text: data.data.username + " has joined the game"
          };
          this.chatMessages.push(userHasJoinedMessage);
          break;
        case 1:
          this.loadGame();
          this.shownScreen = 'game';
          let youHaveJoinedMessage: ChatMessage = {
            username: "Server",
            text: "You have joined the game"
          };
          this.money = data.data.money;
          this.chatMessages.push(youHaveJoinedMessage);
          break;
        case 2:
          let newChatMessage: ChatMessage = data.data;
          this.chatMessages.push(newChatMessage);
          break;
        case 3:
          this.money = data.data.money;
          break;
        case 100:
          this.money -= data.data.change;
          break;
        default:
    }
  }

  purchase(i: integer) {
    let message = {
      type: 100,
      data: {
          change: this.storeTowers[i].price
      }
    };

    this.connection.send('clientMessage', JSON.stringify(message));
  }
}
