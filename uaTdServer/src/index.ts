import "./css/reset.css";
import "./css/game.css";
import "./game.ts";

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
    console.log(data);

    switch (data.type) {
        case 0:
            chatServerMessage(`${data.data.username} has joined the game.`);
            break;
        case 1:
            chatServerMessage(`You have joined the game.`);
            switchScreen("game");
            break;
        case 2:
            sendChatMessage(data.data);
            break;
        case 100:
            updateCashBalance(data.data);
            break;
        default:
    }
}

// Game stuff

let storeTowers = [
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

let cashBalance = 1000;

// Chat related functions

const divChatMessages: HTMLDivElement = divGameContainer.querySelector(".chat-messages");

function chatServerMessage(messageData: any) {
    let newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');
    newMessage.classList.add('message-new-player');

    newMessage.innerHTML = messageData;

    divChatMessages.appendChild(newMessage);
}

function sendChatMessage(messageData: any) {
    let newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');

    newMessage.innerHTML = `<div class="author">${messageData.username}</div><div class="message">${messageData.message}</div>`;

    divChatMessages.appendChild(newMessage);
}

// Cash related functions

function updateCashBalance(data) {
    cashBalance -= data.change;
    updateCashBalanceUI();
}

// UI stuff

const inputMeetUsername: HTMLInputElement = document.querySelector("#meet-form-username");
const inputChatMessage: HTMLTextAreaElement = document.querySelector("#chat-form-chat-message");

const btnMeetEnter: HTMLButtonElement = document.querySelector("#meet-form-enter");
const btnChatMessageSend: HTMLButtonElement = document.querySelector("#chat-form-send");

const divCashBalance: HTMLDivElement = document.querySelector("#cash-balance");
const divPlayerName: HTMLDivElement = document.querySelector("#player-name");

btnMeetEnter.addEventListener("click", meet);
inputMeetUsername.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        meet();
    }
});
function meet() {
    let newUsername = inputMeetUsername.value;

    if (newUsername.length > 3) {
        username = newUsername;

        let message = {
            type: 0,
            data: {
                username: username
            }
        };

        connection.send('clientMessage', JSON.stringify(message))
            .then(() => {
                //switchScreen('game');
                updatePlayerNameUI();
            });
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

const divTowersStore: HTMLDivElement = document.querySelector("#towers-store");
storeTowers.forEach(st => {
    let stItem = document.createElement('button');
    stItem.classList.add('item');

    stItem.innerHTML = `<div><b>${st.name}</b></div><div>${st.price} Pinigų</div>`;
    stItem.onclick = function () {
        if (st.price <= cashBalance) {
            let message = {
                type: 100,
                data: {
                    change: st.price
                }
            };

            connection.send('clientMessage', JSON.stringify(message))
                .then(() => switchScreen('game'));
        }
    }

    divTowersStore.appendChild(stItem);
})

function updateCashBalanceUI() {
    divCashBalance.innerHTML = `${cashBalance} Pinigų`;
}

function updatePlayerNameUI() {
    divPlayerName.innerHTML = `${username}`;
}

switchScreen("meet");
updateCashBalanceUI();
updatePlayerNameUI();