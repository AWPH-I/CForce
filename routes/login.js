const express = require('express');
const router = express.Router();
const User = require('mongoose').model('user');

router.get('/', (req, res, next) => {
    if(req.session.user != null) {
        res.redirect('/profile');
    } else {
        res.render('login', {title: 'Login', session: req.session});
    }
});

router.post('/', async (req, res, next) => {
    if (req.body.email && req.body.password) {
        const user = await User.authenticate(req.body.email, req.body.password);

        if(user) {
            req.session.userId = user._id;
            return res.json({redirect:'/profile'});
        } else {
            return res.json({err:{title: 'Invalid credentials!', body:'The details you have provided are invalid.', type:'danger'}});
        }
    } else {
        return res.json({err:{title: 'Empty fields!', body:'Please provide all necessary information to login.', type:'warning'}});
    }
});

module.exports = router;