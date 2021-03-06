var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MemoryStore = require('session-memory-store')(session);
var io = require('socket.io')();
var sharedsession = require("express-socket.io-session");

var User = require('./models/user');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var chatroomRouter = require('./routes/chatroom');
var loginRouter = require('./routes/login');
var streamRouter = require('./routes/stream');

var app = express();

var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://rexdom123:a1234567@chatroom-6uftz.gcp.mongodb.net/chatroom?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

sessionInfo=session({
  name: 'identityKey', 
  secret: 'secret', 
  saveUninitialized: false, 
  resave: false,
  store: new MemoryStore()
});
app.use(sessionInfo);
io.use(sharedsession(sessionInfo));

app.use(async function(req, res, next) {
  var session = req.session;
  var loginUser = session.loginUser;
  var account = session.account;
  if (account){
    const result = await User.findOne({account:account})
    if (result && loginUser !== result.user_name) {
      req.session.loginUser = await result.user_name;
    }
    return next();
  } else next();
})

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/chatroom', chatroomRouter);
app.use('/', loginRouter);
app.use('/stream', streamRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  var session = req.session;
  var loginUser = session.loginUser;
  // render the error page
  res.status(err.status || 500);
  res.render('error', {user: loginUser?loginUser:null});
});

module.exports = {
  app:app,
  io:io
};

