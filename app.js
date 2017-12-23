//Standard middleware
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Sessioning
var session = require('express-session');

//Create app to export
var app = express();

app.set('trust proxy', true);

var sess = session({
    secret: 'seOOOSPAPSDwag167321320sdmSKRRRgucciGAngGG,',
    //Change cookie to {httpOnly: true, secure: false} for test and {httpOnly: true, secure: true} for prod
    cookie: {httpOnly: true, secure: true},
    proxy: true,
    resave: true,
    saveUninitialized: true,
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

//Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/CForce', function(err) {
    console.log('Connected to mongoDB');
});
const db = mongoose.connection;

require('./models/user');
var User = mongoose.model('user');

//Helmet (security stuff)
var helmet = require('helmet');
app.use(helmet());

//Useragent grabbing
var useragent = require('express-useragent');
app.use(useragent.express());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//On every page req:
app.get('*', function(req, res, next) {
    if(req.useragent.browser === 'IE') {
        return res.render('blocked');
    };

    User.validateId(req.session.userId, function(err, user) {
        if(err || !user) {
            req.session.isLoggedIn = false;
            next(); 
        } else {
            req.session.isLoggedIn = true;
            User.getBalance(req.session.userId, function(err, balance) {
                if(err || !user) {
                    req.session.balance = null;
                    next(); 
                } else {
                    req.session.balance = balance;
                    next();
                }
            });
        }
    });
});

//Create socketIO server
var io = require('socket.io')();
io.use(function(socket, next) {
    sess(socket.request, socket.request.res, next);
});

//On new socket connection:
io.on('connection', function(socket){
    User.validateId(socket.request.session.userId, function(err, user) {
        if(err || !user) {
            socket.request.session.isLoggedIn = false;
        } else {
            socket.request.session.isLoggedIn = true;
            socket.request.session.username = user.username;
        }
        socket.request.session.save();
    });
});

app.io = io;


// routes
app.use('/', require('./routes/index')(io));
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
