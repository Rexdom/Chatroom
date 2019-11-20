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
  User.findByIdAndUpdate(req.params.id, {user_name:req.body.user_name}, {}, function (err) {
    if (err) { return next(err); }
    session.loginUser=req.body.user_name;
    res.redirect('/');
  });
});

router.post('/:id/password', function(req,res,next) {
  User.findByIdAndUpdate(req.params.id, {password: req.body.new_password}, {}, function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
