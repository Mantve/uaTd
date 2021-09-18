import "./css/reset.css";
import "./css/game.css";
import * as signalR from "@microsoft/signalr";
import { connect } from "net";

const divGameContainer: HTMLDivElement = document.querySelector(".game-container");

let username = new Date().getTime().toString();
let shownScreen = 'init';

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

connection.start().catch(err => document.write(err));

// Server messages processing

connection.on("serverDataMessage", (data: string) => {
    processServerMessage(data);
});

function processServerMessage(encodedData: string) {
    const data = JSON.parse(encodedData);

    switch (data.type) {
        case 1:
            notifyOfJoinedPlayer(data.data)
            break;
        case 2:
            sendChatMessage(data.data)
            break;
        default:
    }
}

// Chat related functions

const divChatMessages: HTMLDivElement = divGameContainer.querySelector(".chat-messages");

function notifyOfJoinedPlayer(messageData: any) {
    let newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');
    newMessage.classList.add('message-new-player');

    newMessage.innerHTML = `${messageData.username} has joined the game.`;

    divChatMessages.appendChild(newMessage);
}

function sendChatMessage(messageData: any) {
    let newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');

    newMessage.innerHTML = `<div class="author">${messageData.username}</div><div class="message">${messageData.message}</div>`;

    divChatMessages.appendChild(newMessage);
}

// UI stuff

const inputMeetUsername: HTMLInputElement = document.querySelector("#meet-form-username");
const inputChatMessage: HTMLTextAreaElement = document.querySelector("#chat-form-chat-message");

const btnMeetEnter: HTMLButtonElement = document.querySelector("#meet-form-enter");
const btnChatMessageSend: HTMLButtonElement = document.querySelector("#chat-form-send");

btnMeetEnter.addEventListener("click", meet);
function meet() {
    let newUsername = inputMeetUsername.value;

    if (newUsername.length > 3) {
        username = newUsername;

        let message = {
            type: 1,
            data: {
                username: username
            }
        };

        connection.send('clientMessage', JSON.stringify(message))
            .then(() => switchScreen('game'));
    }
}

btnChatMessageSend.addEventListener("click", sendChat);
function sendChat() {
    let chatMessage = inputChatMessage.value;

    let message = {
        type: 2,
        data: {
            username: username,
            message: chatMessage
        }
    };

    connection.send('clientMessage', JSON.stringify(message));
}

function switchScreen(newScreen: string) {
    if (newScreen != shownScreen) {
        let divShownScreen: HTMLDivElement = divGameContainer.querySelector(`div[screen=${shownScreen}]`);
        let divNewScreen: HTMLDivElement = divGameContainer.querySelector(`div[screen=${newScreen}]`);

        if (divNewScreen) {
            shownScreen = newScreen;

            divNewScreen.classList.add('shown');
            if (divShownScreen) {
                divShownScreen.classList.remove('shown');
            }
        }
    }
}

switchScreen("meet");