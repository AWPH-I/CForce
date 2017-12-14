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

io.on('connection', function(socket){
    //Server receiving a chat message
    socket.on('chat-send', function(msg){
        if(socket.isLoggedIn) {
            msg = sanitiseMessage(msg);
            if(msg == '') return;
            io.emit('chat-receive', {from: socket.username, message: msg});
        } else {
            console.log('sending no chat err');
            socket.emit('error-receive', {title: 'Not logged in!', body: 'Please create an account and login to chat.', type:'warning'});
        }

    });
});

module.exports = router;
