var User = require('mongoose').model('user');

module.exports = function(io, sess) {
    io.use(function(socket, next) {
        sess(socket.request, socket.request.res, next);
    });

    //On new socket connection:
    io.on('connection', async function(socket){
        try {
            socket.request.session.user = await User.findOne({ _id: socket.request.session.userId }).exec();
        } catch(e) {
            delete socket.request.session.user;
        }
        socket.request.session.save();
    });

    return io;
};