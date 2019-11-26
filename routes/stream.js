var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

var User = require('../models/user');
var Game = require('../models/game')

router.get('/watch/:id', async function(req, res, next) {
  const url = 'https://api.twitch.tv/helix/users?id='+req.params.id;
  const watch_result = await fetch(url, {
      method: 'GET', 
      headers: {'Client-ID':'rorlgler8hzzqhqof3l93edydugwya'},
  });
  const watch_json = await watch_result.json();
  const watch_url = 'https://www.twitch.tv/'+watch_json.data[0].login
  res.json({url:watch_url});
});

router.get('/game/:id', async function(req, res, next) {
  const url = 'https://api.twitch.tv/helix/streams?game_id='+req.params.id;
  const game_result = await fetch(url, {
      method: 'GET', 
      headers: {'Client-ID':'rorlgler8hzzqhqof3l93edydugwya'},
  });
  const game_json = await game_result.json();
  res.json({data:game_json.data});
});

router.get('/browse', async function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  var url = session.url;
  let top_game = await fetch('https://api.twitch.tv/helix/games/top?first=100', {
    method: 'GET', 
    headers: {'Client-ID':'rorlgler8hzzqhqof3l93edydugwya'},
  });
  let top_game_json = await top_game.json();
  for (i=0;i<top_game_json.data.length;i++){
    top_game_json.data[i].box_art_url=top_game_json.data[i].box_art_url.replace("{width}","91").replace("{height}","121");
  }
  res.render('browse', {user: loginUser?loginUser:null, url: url?url:null, page:"Stream", game_list:top_game_json.data, title:"Stream - Browse"});
});

router.get('/browse/top', function(req, res, next) {
  Game.find().exec(async function(err, gameList){
    if (err) return next(err);
    let result = await fetch('https://api.twitch.tv/helix/streams?first=20', {
      method: 'GET', 
      headers: {'Client-ID':'rorlgler8hzzqhqof3l93edydugwya'},
    });
    let json = await result.json();
    json.game=gameList;
    res.json(json);
  });
});

router.get('/browse/list', function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  if (loginUser){
    User.findOne({ user_name: loginUser }, 'streams').exec(function(err, result){
      if (err) return next(err);
      res.json(result);
    });
  }else res.json({streams:[]});
});

router.get('/following', function(req, res, next) {
    var session = req.session;
    var loginUser = session.loginUser;
    var url = session.url;
    if (!loginUser)
      res.render('login');
    else
      res.render('following', {user: loginUser?loginUser:null, url: url?url:null, page:"Stream", title:"Stream - Following"});
});

router.get('/following/list', function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  if (!loginUser) {
    res.json({data:[]})
  } else {
    User.findOne({ user_name: loginUser }, 'streams').exec(async function(err, result){
      if (err) return next(err);
      if (result.streams.length==0) res.json({data:[]});
      let user_url='https://api.twitch.tv/helix/streams?'
      for (i=0;i<result.streams.length;i++) {
        user_url+='user_id='+result.streams[i]+"&";
      }
      let following_result = await fetch(user_url, {
        method: 'GET', 
        headers: {'Client-ID':'rorlgler8hzzqhqof3l93edydugwya'},
      });
      let following_json = await following_result.json();
      Game.find().exec( function(err, result){
        if (err) return next(err);
        following_json.game=result;
        res.json(following_json);
      });
    });
  };
});

router.post('/follow', function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  if (loginUser){
    User.findOneAndUpdate(
      { user_name: loginUser }, 
      { $push: { streams: req.body.user_id  } },
      function (error) {
        if (error) {
          res.json({message:"Error occured, please try again"});
        } else {
          res.json({message:"success"});
        }
      });
  }else {
    res.json({message:"Please login to follow streamer"});
  }
});

router.post('/unfollow', function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  if (loginUser){
    User.findOneAndUpdate(
      { user_name: loginUser }, 
      { $pull:{ streams: req.body.user_id } },
      function (error) {
        if (error) {
          res.json({message:"Error occured, please try again"});
        } else {
          res.json({message:"success"});
        }
      });
  }else {
    res.json({message:"Please login to follow streamer"});
  }
});

router.post('/untrack_gameid', async function(req, res, next) {
  console.log(req.body.game_list);
  var untrack_url = 'https://api.twitch.tv/helix/games?';
  for (i=0;i<req.body.game_list.length;i++) {
    untrack_url+='id='+req.body.game_list[i]+'&'
  }
  let game_result = await fetch(untrack_url, {
    method: 'GET', 
    headers: {'Client-ID':'rorlgler8hzzqhqof3l93edydugwya'},
  });
  let game_json = await game_result.json();
  for (i=0;i<game_json.data.length;i++) {
    var game = new Game(
      {
        url: game_json.data[i].box_art_url,
        id: game_json.data[i].id,
        name: game_json.data[i].name,
      });
    game.save(function (err) {
        if (err) { return next(err); }
    });
  };
  res.send('success');
});

module.exports = router;