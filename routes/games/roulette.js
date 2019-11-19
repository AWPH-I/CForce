var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');
var ui = require('../../common/ui')

const Roulette = {};
Roulette.lastSpin = {};
Roulette.bets = {};

Roulette.bets.green = [];
Roulette.bets.red = [];
Roulette.bets.black = [];

Roulette.publicBets = [];

Roulette.history = [];

Roulette.getColor = function(roll) {
    if(roll === 0) return 'green';
    return (roll % 2 === 0) ? 'black' : 'red';
};

Roulette.bets.reward = async function(io, roll) {
    const winner = Roulette.getColor(roll);
    console.log('Winner: ' + roll + ' ' + winner);

    if(Roulette.bets[winner].length === 0) return;

    for(let i = 0; i < Roulette.bets[winner].length; i ++) {
        var socket = Roulette.bets[winner][i].socket;
        socket.request.session.user.balance += Roulette.bets[winner][i].amount * (winner === 'green' ? 14 : 2);
        socket.request.session.user.save().then((updatedUser) => {
            ui.update(socket);
        });
    }

    Roulette.bets.clear();
};

Roulette.bets.clear = function() {
    Roulette.bets.green = [];
    Roulette.bets.red = [];
    Roulette.bets.black = [];

    Roulette.publicBets = [];
};

router.get('/', function(req, res, next) {
    const injections = {lastSpin: Roulette.lastSpin, injTime: new Date().getTime(), history: Roulette.history, bets: Roulette.publicBets};
    res.render('roulette', {title: 'Roulette', session: req.session, injections: injections});
});


module.exports = function(io) {
    Roulette.spin = function() {
        console.log('Spun at ' + new Date());
        Roulette.lastSpin.result = Math.floor(Math.random() * (14 + 1));
        Roulette.lastSpin.time = new Date().getTime();

        if(Roulette.history.length === 16) Roulette.history.shift();
        Roulette.history.push(Roulette.lastSpin.result);

        io.emit('roulette-roll', Roulette.lastSpin);

        Roulette.bets.reward(io, Roulette.lastSpin.result);
    };

    Roulette.interval = setInterval(Roulette.spin, 30000);
    Roulette.spin();

    io.on('connection', function(socket) {
        socket.on('roulette-bet-send', async function(data) {
            data.amount = Number(data.amount);

            if(isNaN(data.amount)) {
                return socket.emit('err', {title: 'Invalid bet!', body:'Please try placing your bet again.', type:'warning'});
            }

            if(socket.request.session.user == null) {
                return socket.emit('err', {title: 'Not logged in!', body:'Please create an account and/or login to bet.', type:'warning'});
            }
            
            if(data.bet !== 'red' && data.bet !== 'green' && data.bet !== 'black' || data.amount <= 0 || data.amount % 1 !== 0) {
                return socket.emit('err', {title:'Invalid bet placed!', body:'Please try again after refreshing the page.', type:'danger'});
            }
            
            if(socket.request.session.user.balance - data.amount < 0) {
                return socket.emit('err', {title:'Invalid bet placed!', body:'You have insufficient funds to place a bet of ' + data.amount + ' tokens.', type:'warning'});
            }


            socket.request.session.user.balance -= data.amount;

            socket.request.session.user.save().then((updatedUser) => {
                const lookup = Roulette.bets[data.bet].find((y) => { return String(y.id) === String(socket.request.session.userId); });
                if(lookup != null) {
                    var index = Roulette.bets[data.bet].indexOf(lookup);
                    Roulette.bets[data.bet][index].amount += data.amount;
                    var entry = Roulette.publicBets.find((y) => {
                        return y.username === socket.request.session.user.username;
                    });
                    Roulette.publicBets[Roulette.publicBets.indexOf(entry)].amount += data.amount;
                } else {
                    Roulette.bets[data.bet].push({id: updatedUser._id, amount: data.amount, socket: socket});
                    Roulette.publicBets.push({username: updatedUser.username, amount: data.amount, bet: data.bet});
                }

                io.emit('roulette-bet', {username: updatedUser.username, amount: data.amount, bet: data.bet});
                socket.emit('roulette-bet-approve', data.bet);
                ui.update(socket);
                return;
            });
        });
    });

    return router;
};
