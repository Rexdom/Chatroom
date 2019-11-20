var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  var url = session.url;
  res.render('index', { title: 'Chat Room', user: loginUser?loginUser:null, url: url, page: 'Home' });
});

module.exports = router;
