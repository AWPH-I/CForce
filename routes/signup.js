var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Sign Up'})
});

router.post('/', function (req, res, next) {
    console.log('POST received');
    if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
        console.log(require('mongoose').connection.readyState);
        if(req.body.passwordConf == req.body.password) {
            var userData = {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            }

            User.create(userData, function(error, user) {
                console.log(error + ' ' + user);
                if(error) {
                    return next(error);
                } else {
                    req.session.userId = user._id;
                    return res.redirect('/profile');
                }
            });
        } else {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);   
        }
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});


module.exports = router;