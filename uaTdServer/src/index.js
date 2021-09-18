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
/* legacy code

connection.on("messageReceived", (username: string, message: string) => {
    let m = document.createElement("div");

    m.innerHTML =
        `<div class="message-author">${username}</div><div>${message}</div>`;

    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});

connection.start().catch(err => document.write(err));
tbMessage.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
        send();
    }
});

btnSend.addEventListener("click", send);

function send() {
    connection.send("newMessage", username, tbMessage.value)
        .then(() => tbMessage.value = "");
}

*/
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
        default:
    }
}
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
// UI stuff
var inputMeetUsername = document.querySelector("#meet-form-username");
var inputChatMessage = document.querySelector("#chat-form-chat-message");
var btnMeetEnter = document.querySelector("#meet-form-enter");
var btnChatMessageSend = document.querySelector("#chat-form-send");
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
            .then(function () { return switchScreen('game'); });
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
switchScreen("meet");
