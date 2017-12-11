var socket = io.connect(window.location.href);
var Chat;

function ChatObj() {
    this.box = document.getElementById('chat-box');
    this.content = document.getElementById('chat-content');
    this.input = document.getElementById('chat-input');
    
    this.messageReceive = function(data) {
        const markup = `
        <img class="chat-avatar" src="/images/MW.svg"></img>
        <div style="display: flex; flex-direction: column;">
            <p class="chat-text chat-username">${data.from}</p>
            <p class="chat-text">${data.message}</p>
        </div>
        `;
        const msg = document.createElement('li');
        msg.className = 'chat-message';
        msg.innerHTML = markup;
        this.content.appendChild(msg);

        this.box.scrollTo(0, this.box.scrollHeight);
    }
    
    this.messageSend = function() {
        socket.emit('chat-send', this.input.value);
        this.input.value = '';
    }
}

$(document).ready(function() {
    Chat = new ChatObj();
});

socket.on('chat-receive', function (data) {
    Chat.messageReceive(data);
});

