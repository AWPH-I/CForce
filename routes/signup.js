const express = require('express');
const router = express.Router();
const User = require('mongoose').model('user');

router.get('/', (req, res, next) => {
    res.render('signup', { title: 'Sign Up', session: req.session})
});

router.post('/', async (req, res, next) => {
    if (!(req.body.email && req.body.username && req.body.password && req.body.passwordConf)) {
        return res.json({
            err: {
                title: 'Empty fields!',
                body: 'Please provide all necessary information to login.',
                type: 'warning'
            }
        });
    }

    if(req.body.passwordConf !== req.body.password) {
        return res.json({err:{title:'Passwords don\'t match!', body:'The passwords you have entered are not the same.', type:'warning'}});
    }

    if(await User.findOne({email: req.body.email}).exec() != null) {
        return res.json({err:{title:'Email in use!', body:'That email is already registered to another user\'s account.', type:'danger'}});
    }

    if(await User.findOne({email: req.body.email}).exec() != null) {
        return res.json({err:{title:'Email in use!', body:'That email is already registered to another user\'s account.', type:'danger'}});
    }

    const userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    };

    User.create(userData, (error, user) => {
        if(error) {
            return res.json({title:'Received error ' + error.name + '!', body:'Please contact us with this code: ' + error.code +'.', type:'danger'});
        }

        req.session.userId = user._id;
        res.json({redirect:'/profile'});
    });
});


module.exports = router;