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
    return (String(text)).substring(0,255) + '...';
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'CForce Roulette'})
});

global.io.on('connection', function(socket){
    var address = socket.handshake.address;
    
    //Server receiving a chat message
    socket.on('chat-send', function(msg){
        if(!socket.handshake.session.userId) {
            //Add 1 to the cooldown and blacklist their IP soon
            return;
        }

        User.findOne({_id: socket.handshake.session.userId}, function(err, user) {
            if(err) {
                //Invalid userId was given - add 1 to cooldown and blacklist their IP soon
                return next(err);
            } else {
                msg = sanitiseMessage(msg);
                if(msg == '') return;
                io.emit('chat-receive', {from: user.username, message: msg});
            }
        });
    });
});

module.exports = router;
