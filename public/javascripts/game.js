const Chat = {};

Chat.box = $('#chat-box');
Chat.content = $('#chat-content');
Chat.input = $('#chat-input');

Chat.messageReceive = data => {
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

    Chat.box[0].scrollTop = Chat.box[0].scrollHeight;
};

Chat.messageSend = () => {
    gamesSocket.emit('chat-send', Chat.input.val());
    Chat.input.val('');
};

$('#chat-button')[0].onclick = () => Chat.messageSend();

gamesSocket.on('chat-receive', data => {
    Chat.messageReceive(data);
});

