var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

const Roulette = new RouletteObj();

function RouletteObj() {
    this.current = null;
    this.spin = function() {
        this.current = Math.floor(Math.random() * 37);
    } 
    this.interval = setInterval(this.spin, 2000);
}

function sanitiseMessage(text) {
    text = (String(text));
    if(text.length > 256) {
        text = text.substring(0,255) + '...';
    }
    return text;
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'CForce Roulette', isLoggedIn: req.isLoggedIn });
});

global.io.on('connection', function(socket){
    console.log('Connected');
    var address = socket.handshake.address;
    User.validateId(socket.handshake.session.userId, function(error, user) {
        if(error || !user) {
            socket.isLoggedIn = false;
        } else {
            socket.isLoggedIn = true;
        }
    });

    //Server receiving a chat message
    socket.on('chat-send', function(msg){
        if(socket.isLoggedIn) {
            msg = sanitiseMessage(msg);
            if(msg == '') return;
            io.emit('chat-receive', {from: user.username, message: msg});
        } else {
            socket.emit('chat-receive', {from: 'Server', message: 'Please create an account and login to chat!'});
        }

    });
});

module.exports = router;
