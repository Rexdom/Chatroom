var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  var url = session.url;
  if (!url.includes(req.params.id))
    res.render('');
  else
    res.render('user', {user: loginUser?loginUser:null, url:url?url:null, page:"User", title:"User information"});
});

router.post('/:id/user_name', function(req,res,next) {
  var session = req.session;
  if (req.body.user_name.length>20) {
    res.render('user', {user: session.loginUser, url:session.url, page:"User", title:"User information", warning:`User name should be no longer than 20 characters`});
  } else {
    User.findOne({user_name:req.body.user_name})
    .exec(function(err, result){
        if (err) return next(err);
        if (result) {
        res.render('user', {user: session.loginUser, url:session.url, page:"User", title:"User information", warning:`User name: "`+req.body.user_name+ `" already exist`});
        } else {
          User.findByIdAndUpdate(req.params.id, {user_name:req.body.user_name}, {}, function (err) {
            if (err) { return next(err); }
            session.loginUser=req.body.user_name;
            res.redirect('/');
          });
        }
    })
  }
});

router.post('/:id/password', function(req,res,next) {
  User.findByIdAndUpdate(req.params.id, {password: req.body.new_password}, {}, function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
