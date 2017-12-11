var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

router.get('/', function(req, res, next) {
    if(!req.session.userId) {
        res.redirect('/');
    } else {
        res.render('profile', {title: 'Profile', isLoggedIn: User.validateId(req.session.userId)})
    }
});

module.exports = router;