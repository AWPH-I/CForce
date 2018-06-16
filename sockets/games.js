function sanitiseMessage(text) {
    text = (String(text));
    if(text.length > 256) {
        text = text.substring(0,255) + '...';
    }
    return text;
}

module.exports = (io, sess) => {
    io.use((socket, next) => {
        sess(socket.request, socket.request.res, next);
    });

    io.on('connection' , socket => {
        socket.on('chat-send', msg => {
            if(socket.request.session.user != null) {
                msg = sanitiseMessage(msg);
                if(msg === '') return;
                io.emit('chat-receive', {from: socket.request.session.user.username, message: msg});
            } else {
                socket.emit('error-receive', {title: 'Not logged in!', body:'Please create an account and/or login to chat.', type:'warning'});
            }

        });
    });

    return io;
};