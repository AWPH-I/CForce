var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
    } else {
        res.render('profile', {title: 'Profile', session: req.session})
    }
});

module.exports = router;