var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var sharedsession = require("express-socket.io-session");

var mongoose = require('mongoose');

var app = express();

//Create socketIO server
var server = require('http').Server(app);
global.io = require('socket.io')(server);
server.listen(8081);

// connect to db
mongoose.connect('mongodb://localhost:27017/CForce', function(err) {
    console.log('Connected to mongoDB');
});

const db = mongoose.connection;

//sort out mongoose models
require('./models/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sess = session({
    secret: 'seOOOSPAPSDwag167321320sdmSKRRRgucciGAngGG,',
    resave: true,
    saveUninitialized: false,
    store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, 
        host: 'localhost',
        port: 27017,
        db: 'CForce', 
        collection: 'sessions',
        expire: 86400
    })
});

app.use(sess);

io.use(sharedsession(sess, {
    autoSave:true
}));

io.on('connection', function(socket){
    socket.handshake.session.socket = socket;
    console.log('New conn: ' + socket.handshake.session.socket);
    User.findOne({ _id: socket.handshake.session.userId }).exec(function(err, user) {
        if(err || !user) {
            socket.isLoggedIn = false;
        } else {
            socket.isLoggedIn = true;
            socket.username = user.username;
        }
    });
});

var User = mongoose.model('user');
// check logged in on every page req
app.use(function(req, res, next) {
    User.validateId(req.session.userId, function(error, user) {
        if(error || !user) {
            req.isLoggedIn = false;
            next(); 
        } else {
            req.isLoggedIn = true;
            next();
        }
    });
});


// routes
app.use('/', require('./routes/index'));
app.use('/imprint', require('./routes/imprint'));

app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/profile', require('./routes/profile'));
app.use('/signup', require('./routes/signup'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
