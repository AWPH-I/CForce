var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(!req.isLoggedIn) {
        res.redirect('/login');
    } else {
        res.render('profile', {title: 'Profile', isLoggedIn: req.isLoggedIn})
    }
});

module.exports = router;