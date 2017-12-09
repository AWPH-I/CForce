var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(!req.session.userId) {
        res.redirect('/');
    } else {
        res.render('profile', {title: 'Profile'})
    }
});

module.exports = router;