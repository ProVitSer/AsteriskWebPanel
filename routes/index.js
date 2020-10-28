const express = require('express'),
    router = express.Router(),
    passport = require(`passport`);


const authenticationMiddleware = () => {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        return res.redirect('/login')
    };
};

router.get('/login', (req, res, next) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log(req.isAuthenticated());
    res.redirect('/index');
});

router.get('/', authenticationMiddleware(), function(req, res, next) {
    res.render('index');
});

router.get('/index', authenticationMiddleware(), (req, res, next) => {
    res.render('index');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;