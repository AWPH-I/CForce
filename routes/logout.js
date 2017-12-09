var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session) {
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    } else {
        return res.redirect('/');
    }
});

module.exports = router;