var socket = io.connect(window.location.href);
var Chat;

function ChatObj() {
    this.box = document.getElementById('chat-box');
    this.content = document.getElementById('chat-content');
    this.messageReceive = function(data) {
        //data.from = senders username
        //data.message = the text they sent
        console.log(data.from + ' ' + data.message);

        this.box.scrollTo(0, this.box.scrollHeight);
    }
    this.messageSend = function(msg) {
        socket.emit('chat-send', msg);
    }
}

$(document).ready(function() {
    //init chat on doc ready
    Chat = new ChatObj();
});

socket.on('chat-receive', function (data) {
    Chat.messageReceive(data);
});

