var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

const Roulette = {};

Roulette.lastSpin = new Date().getTime();
Roulette.bets = [];

Roulette.spin = function() {
    this.current = Math.floor(Math.random() * 14);
    io.emit('roll-receive', {roll: this.current});
    Roulette.lastSpin = new Date().getTime();
}

Roulette.interval = setInterval(Roulette.spin, 15000);

function sanitiseMessage(text) {
    text = (String(text));
    if(text.length > 256) {
        text = text.substring(0,255) + '...';
    }
    return text;
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'CForce Roulette', isLoggedIn: req.session.isLoggedIn });
});

io.on('connection', function(socket){
    //Server receiving a chat message
    socket.on('chat-send', function(msg){
        if(socket.handshake.session.isLoggedIn) {
            msg = sanitiseMessage(msg);
            if(msg == '') return;
            io.emit('chat-receive', {from: socket.handshake.session.username, message: msg});
        } else {
            socket.emit('error-receive', {title: 'Not logged in!', body:'Please create an account and/or login to chat.', type:'warning'});
        }

    });

    socket.on('bet-send', function(data) {
        if(!socket.handshake.session.isLoggedIn) {
            socket.emit('error-receive', {title: 'Not logged in!', body:'Please create an account and/or login to bet.', type:'warning'});
            return;
        }

        if(data.bet !== 'red' && data.bet !== 'green' && data.bet !== 'black ') {
            socket.emit('error-receive', {title:'Invalid bet placed!', body:'Please try again after refreshing the page.', type:'danger'});
            return;
        };

        User.getBalance(socket.handshake.session.userId, function(error, balance) {
            if(err || !balance) {
                socket.emit('error-receive', {title:'Received error #BGE4!', body:'Please report this to aWpH--.', type:'danger'});
                return;
            }

            console.log(balance);
        });
    });
});

module.exports = router;
