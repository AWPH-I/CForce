var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

router.get('/', function(req, res, next) {
    if(req.session.isLoggedIn) {
        res.redirect('/profile');
    } else {
        res.render('login', {title: 'Login', session: req.session});
    }
});

router.post('/', function (req, res, next) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function(error, user) {
            if(error || !user) {
                res.json({ err:{title: 'Invalid credentials!', body:'The details you have provided are invalid.', type:'danger' } });
            } else {
                req.session.userId = user._id;
                res.json({redirect:'/profile'});
            }
        });
    } else {
        res.json({ err:{title: 'Empty fields!', body:'Please provide all necessary information to login.', type:'warning'} });
    }
});

module.exports = router;