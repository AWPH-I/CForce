var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('imprint', {title: 'CForce Imprint', isLoggedIn: req.session.isLoggedIn})
});

module.exports = router;
