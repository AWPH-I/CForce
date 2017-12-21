var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('imprint', {title: 'CForce Imprint', session: req.session})
});

module.exports = router;
