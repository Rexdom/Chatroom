var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET home page. */
router.get('/login', function(req, res, next) {
    var session = req.session;
    var loginUser = session.loginUser;
    if (!loginUser)
        res.render('login', {title:"Log in"});
    else
        res.redirect('/');
});

router.post('/login', function(req,res,next) {
    User.findOne({account:req.body.account, password:req.body.password})
        .exec(function(err, result){
            if (err) return next(err);
            if (!result) res.render('login');
            else {
                req.session.loginUser=result.user_name;
                req.session.url=result.url;
                res.redirect('/');
            }
        })

});

router.get('/signup', function(req, res, next) {
    var session = req.session;
    var loginUser = session.loginUser;
    if (!loginUser)
        res.render('signup', {title:"Sign up"});
    else
        res.redirect('/')
});

router.post('/signup', function(req,res,next) {
    var user = new User(
        {
            account: req.body.account,
            password: req.body.password,
            user_name: req.body.user_name,
        });
    user.save(function (err) {
        if (err) { return next(err); }
        req.session.loginUser=req.body.user_name
        req.session.url=result.url;
        res.redirect('/')
    });
});

router.get('/logout', function(req,res,next) {
    req.session.destroy(function(err) {
        if(err){
            return next(err);
        }
        
        // req.session.loginUser = null;
        res.clearCookie('identityKey');
        res.redirect('/');
    });
});

router.get('/loginUser', function(req, res, next) {
    var session = req.session;
    var loginUser = session.loginUser;
    res.json({user: loginUser?loginUser:''})
});

module.exports = router;
