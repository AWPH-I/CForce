var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

router.get('/', function(req, res, next) {
    res.render('imprint', {title: 'CForce Imprint', isLoggedIn: User.validateId(req.session.userId)})
});

module.exports = router;
