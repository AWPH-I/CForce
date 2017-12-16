var Chat = {};


$(document).ready(function() {
    Chat.box = $('#chat-box');
    Chat.content = $('#chat-content');
    Chat.input = $('#chat-input');

    Chat.messageReceive = function(data) {
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
        Chat.content.append(msg);

        Chat.box.scroll(0, Chat.box.scrollHeight);
    }

    Chat.messageSend = function() {
        socket.emit('chat-send', Chat.input.val());
        Chat.input.val('');
    }
});

socket.on('chat-receive', function (data) {
    Chat.messageReceive(data);
});

