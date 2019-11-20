var express = require('express');
var router = express.Router();

router.get('/', function(req,res) {
    var session = req.session;
    var loginUser = session.loginUser;
    var url = session.url;
    res.render('chatroom', {user: loginUser?loginUser:null, url: url?url:null, page:"Chat", title:"Chat Room"})
});
  
module.exports = router;