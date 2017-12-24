var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session.user != null) {
        res.render('profile', {title: 'Profile', session: req.session});
    } else {
        res.redirect('/login');
    }
});

module.exports = router;