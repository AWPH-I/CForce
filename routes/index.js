module.exports = function(io) {
    var express = require('express');
    var router = express.Router();
    var User = require('mongoose').model('user');

    const Roulette = {};
    Roulette.lastSpin = {};
    Roulette.bets = [];
    Roulette.history = [];

    Roulette.spin = function() {
        Roulette.lastSpin.result = Math.floor(Math.random() * (14 - 0 + 1));
        Roulette.lastSpin.time = new Date().getTime();

        if(Roulette.history.length === 16) Roulette.history.shift();
        Roulette.history.push(Roulette.lastSpin.result);

        io.emit('roll-receive', Roulette.lastSpin);
        //Work out winners etc.
    }

    Roulette.interval = setInterval(Roulette.spin, 20000);
    Roulette.spin();

    function sanitiseMessage(text) {
        text = (String(text));
        if(text.length > 256) {
            text = text.substring(0,255) + '...';
        }
        return text;
    }

    /* GET home page. */
    router.get('/', function(req, res, next) {
        const injections = {lastSpin: Roulette.lastSpin, injTime: new Date().getTime(), history: Roulette.history}
        res.render('index', {title: 'CForce Roulette', session: req.session, injections: injections});
    });

    io.on('connection', function(socket){
        //Server receiving a chat message
        socket.on('chat-send', function(msg){
            if(socket.request.session.isLoggedIn) {
                msg = sanitiseMessage(msg);
                if(msg == '') return;
                io.emit('chat-receive', {from: socket.request.session.username, message: msg});
            } else {
                socket.emit('error-receive', {title: 'Not logged in!', body:'Please create an account and/or login to chat.', type:'warning'});
            }

        });

        socket.on('bet-send', function(data) {
            if(!socket.request.session.isLoggedIn) {
                socket.emit('error-receive', {title: 'Not logged in!', body:'Please create an account and/or login to bet.', type:'warning'});
                return;
            }

            if(data.bet !== 'red' && data.bet !== 'green' && data.bet !== 'black') {
                socket.emit('error-receive', {title:'Invalid bet placed!', body:'Please try again after refreshing the page.', type:'danger'});
                return;
            };

            User.getBalance(socket.request.session.userId, function(err, balance) {
                if(err || balance == null) {
                    socket.emit('error-receive', {title:'Received error ' + error.name + '!', body:'Please contact us with this code: ' + error.code +'.', type:'danger'});
                    return;
                }

                if(balance - data.amount < 0) {
                    socket.emit('error-receive', {title:'Invalid bet placed!', body:'You have insufficient funds to place a bet of ' + data.amount + ' tokens.', type:'warning'});
                    return;
                }
            });
        });
    });

    return router;
}
