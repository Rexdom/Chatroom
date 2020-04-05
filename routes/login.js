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
        .exec(async function(err, result){
            if (err) return next(err);
            if (!result) res.render('login', {title:"Log in"});
            else {
                req.session.account=await req.body.account;
                req.session.loginUser=await result.user_name;
                req.session.url=await result.url;
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

router.post('/signup', async function(req,res,next) {
    if (req.body.user_name.length>20 || req.body.user_name.length<1) {
        res.render('signup', {title:"Sign up", warning:`User name should be within 1 to 20 characters`});
    }else if (req.body.account.length==0 || req.body.password.length==0){
        res.render('signup', {title:"Sign up", warning:`Account and password should not be empty`});
    }else{
        User.findOne({account:req.body.account})
        .exec(async function(err, result){
            if (err) return next(err);
            if (result) {
                res.render('signup', {title:"Sign up", warning:"Account already exist"});
            } else {
                User.findOne({user_name:req.body.user_name})
                .exec(function(err, result){
                    if (err) return next(err);
                    if (result) {
                    res.render('signup', {title:"Sign up", warning:`User name: "`+req.body.user_name+ `" already exist`});
                    }else {
                        var user = new User(
                            {
                                account: req.body.account,
                                password: req.body.password,
                                user_name: req.body.user_name,
                            });
                        user.save(function (err) {
                            if (err) { return next(err); }
                            User.findOne({account:req.body.account})
                            .exec(async function(err, result){
                                if (err) return next(err)
                                else {
                                    req.session.account=await req.body.account;
                                    req.session.loginUser=await result.user_name;
                                    req.session.url=await result.url;
                                    res.redirect('/');
                                }
                            })
                        });
                    }
                })
            }
        })
    }
    
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
