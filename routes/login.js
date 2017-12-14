var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

router.get('/', function(req, res, next) {
    res.render('login', {title: 'Login', isLoggedIn: req.isLoggedIn});
    io.to(req.session.sock).emit('error-receive', {title: 'Empty fields!', body:'Please fill in all required information to login.', type:'danger'});
    console.log('x');
});

router.post('/', function (req, res, next) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function(error, user) {
            if(error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        io.to(req.session.sock).emit('error-receive', {title: 'Empty fields!', body:'Please fill in all required information to login.', type:'danger'});
        return;
    }
});

module.exports = router;