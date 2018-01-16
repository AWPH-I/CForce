var Chat = {};


Chat.box = $('#chat-box');
Chat.content = $('#chat-content');
Chat.input = $('#chat-input');

Chat.messageReceive = function(data) {
    const msg = document.createElement('li');
    msg.className = 'chat-message';

    const img = document.createElement('img');
    img.className = 'chat-avatar rounded-border';
    $(img).attr('src','/images/placeholder-user.png');
    $(msg).append(img);

    const div = document.createElement('div');
    div.className = 'flex-column';
    $(msg).append(div);

    let p = document.createElement('p');
    p.className = 'chat-text chat-username';
    $(p).text(data.from);
    $(div).append(p);

    p = document.createElement('p');
    p.className = 'chat-text chat-content';
    $(p).text(data.message);
    $(div).append(p);

    Chat.content.append(msg);

    Chat.box.scroll(0, Chat.box.scrollHeight);
}

Chat.messageSend = function() {
    socket.emit('chat-send', Chat.input.val());
    Chat.input.val('');
}

socket.on('chat-receive', function (data) {
    Chat.messageReceive(data);
});

