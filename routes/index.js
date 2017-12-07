var express = require('express');
var router = express.Router();

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8081);


io.on('connection',function(socket){  
    console.log('A user is connected');
});

const Roulette = new RouletteObj();

function RouletteObj() {
    this.current = null;
    this.spin = function() {
        this.current = Math.floor(Math.random() * 37);
        io.emit('test','this is a test');
    } 
    this.interval = setInterval(this.spin, 2000);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'CSForce Roulette'})
});

module.exports = router;
