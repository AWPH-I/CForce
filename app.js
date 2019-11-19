//Standard middleware
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');

//Sessioning
const session = require('express-session');

//Create app to export
const app = express();

const IS_DEV = process.env.NODE_ENV == null ? false : process.env.NODE_ENV.trim() === 'dev';

app.set('trust proxy', true);

//Mongoose
const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

const options = {
    useMongoClient: true,
    autoIndex: IS_DEV,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 128, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};

mongoose.connect('mongodb://localhost:27017/CForce', options, err => {
    if(err) {
        console.log(err);
    } else {
        console.log('Connected to mongoDB');
    }
});

const sess = session({
    secret: 'seOOOSPAPSDwag167321320sdmSKRRRgucciGAngGG,',
    cookie: {httpOnly: true, secure: !IS_DEV},
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

const User = require('./models/user.js');

//Helmet (security stuff)
const helmet = require('helmet');
app.use(helmet());

//Useragent grabbing
const userAgent = require('express-useragent');
app.use(userAgent.express());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, IS_DEV ? 'public' : 'dist')));

//On every page req verify their login
app.get('*', async (req, res, next) => {
    if(req.useragent.browser === 'IE') {
        return res.render('blocked');
    }

    try {
        req.session.user = await User.findOne({ _id: req.session.userId }).exec();
    } catch(e) {
        delete req.session.user;
    }

    next();
});

const io = require('socket.io')();

require('./sockets/main')(io, sess);
require('./sockets/page')(io.of('/page'), sess);
app.io = io;

// Socketed Routes
app.use('/', require('./routes/games/roulette')(io.of('/page/roulette')));
app.use('/dice', require('./routes/games/dice')(io.of('/page/dice')));

// Non-socketed Routes
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/profile', require('./routes/profile'));
app.use('/signup', require('./routes/signup'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = IS_DEV ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
