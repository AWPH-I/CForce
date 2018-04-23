var express = require('express');
var router = express.Router();
var User = require('mongoose').model('user');

const Dice = {};

router.get('/', function(req, res, next) {
    const injections = {};
    res.render('dice', {title: 'Dice', session: req.session, injections: injections});
});

module.exports = function(io) {
    return router;
}