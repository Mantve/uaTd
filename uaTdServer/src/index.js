"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./css/reset.css");
require("./css/game.css");
var signalR = require("@microsoft/signalr");
var divGameContainer = document.querySelector(".game-container");
var username = new Date().getTime().toString();
var shownScreen = 'init';
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();
connection.start().catch(function (err) { return document.write(err); });
// Server messages processing
connection.on("serverDataMessage", function (data) {
    processServerMessage(data);
});
function processServerMessage(encodedData) {
    var data = JSON.parse(encodedData);
    switch (data.type) {
        case 1:
            notifyOfJoinedPlayer(data.data);
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
var storeTowers = [
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
];
var cashBalance = 1000;
// Chat related functions
var divChatMessages = divGameContainer.querySelector(".chat-messages");
function notifyOfJoinedPlayer(messageData) {
    var newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');
    newMessage.classList.add('message-new-player');
    newMessage.innerHTML = messageData.username + " has joined the game.";
    divChatMessages.appendChild(newMessage);
}
function sendChatMessage(messageData) {
    var newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');
    newMessage.innerHTML = "<div class=\"author\">" + messageData.username + "</div><div class=\"message\">" + messageData.message + "</div>";
    divChatMessages.appendChild(newMessage);
}
// Cash related functions
function updateCashBalance(data) {
    cashBalance -= data.change;
    updateCashBalanceUI();
}
// UI stuff
var inputMeetUsername = document.querySelector("#meet-form-username");
var inputChatMessage = document.querySelector("#chat-form-chat-message");
var btnMeetEnter = document.querySelector("#meet-form-enter");
var btnChatMessageSend = document.querySelector("#chat-form-send");
var divCashBalance = document.querySelector("#cash-balance");
var divPlayerName = document.querySelector("#player-name");
btnMeetEnter.addEventListener("click", meet);
function meet() {
    var newUsername = inputMeetUsername.value;
    if (newUsername.length > 3) {
        username = newUsername;
        var message = {
            type: 1,
            data: {
                username: username
            }
        };
        connection.send('clientMessage', JSON.stringify(message))
            .then(function () {
            switchScreen('game');
            updatePlayerNameUI();
        });
    }
}
btnChatMessageSend.addEventListener("click", sendChat);
function sendChat() {
    var chatMessage = inputChatMessage.value;
    var message = {
        type: 2,
        data: {
            username: username,
            message: chatMessage
        }
    };
    connection.send('clientMessage', JSON.stringify(message));
}
function switchScreen(newScreen) {
    if (newScreen != shownScreen) {
        var divShownScreen = divGameContainer.querySelector("div[screen=" + shownScreen + "]");
        var divNewScreen = divGameContainer.querySelector("div[screen=" + newScreen + "]");
        if (divNewScreen) {
            shownScreen = newScreen;
            divNewScreen.classList.add('shown');
            if (divShownScreen) {
                divShownScreen.classList.remove('shown');
            }
        }
    }
}
var divTowersStore = document.querySelector("#towers-store");
storeTowers.forEach(function (st) {
    var stItem = document.createElement('button');
    stItem.classList.add('item');
    stItem.innerHTML = "<div><b>" + st.name + "</b></div><div>" + st.price + " Pinig\u0173</div>";
    stItem.onclick = function () {
        if (st.price <= cashBalance) {
            var message = {
                type: 100,
                data: {
                    change: st.price
                }
            };
            connection.send('clientMessage', JSON.stringify(message))
                .then(function () { return switchScreen('game'); });
        }
    };
    divTowersStore.appendChild(stItem);
});
function updateCashBalanceUI() {
    divCashBalance.innerHTML = cashBalance + " Pinig\u0173";
}
function updatePlayerNameUI() {
    divPlayerName.innerHTML = "" + username;
}
switchScreen("meet");
updateCashBalanceUI();
updatePlayerNameUI();
