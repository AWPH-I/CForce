var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Sign Up', isLoggedIn: req.session.isLoggedIn})
});

router.post('/', function (req, res, next) {
    if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
        if(req.body.passwordConf !== req.body.password) return res.json({err:{title:'Passwords don\'t match!', body:'The passwords you have entered are not the same.', type:'warning'}});

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        }

        User.create(userData, function(error, user) {
            if(error) return res.json({title:'Received error ' + error.name + '!', body:'Please contact us with this code: ' + error.code +'.', type:'danger'});
            req.session.userId = user._id;
            res.json({redirect:'/profile'});
            
        });

    } else {
        res.json({err:{title: 'Empty fields!', body:'Please provide all necessary information to login.', type:'warning'}});
    }
});


module.exports = router;