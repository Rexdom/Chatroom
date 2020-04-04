#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./app').app;
var debug = require('debug')('chatroom:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('./app').io;
io.attach(server);
let userList=[];
let accountSet={};
io.on('connection', (socket) => {

  socket.on('getMessage', () => {
    let user=socket.handshake.session.loginUser;
    let account=socket.handshake.session.account;
    if (!account) socket.disconnect();
    if (!accountSet[account]) {
      userList.push(user);
      accountSet[account]={user:user,socket:[socket]};
      socket.broadcast.emit('getMessageExcept', {list: userList, message: user + ' has entered the chatroom'});
    } else if (accountSet[account].user === user) {
      accountSet[account].socket.push(socket);
    } else {
      accountSet[account].socket.push(socket);
      accountSet[account].user=user;
      accountSet[account].socket.forEach((oldSocket)=>{
        oldSocket.emit("getMessage", {message: 'You username has changed, please re-enter the chatroom '});
        oldSocket.disconnect();
      })
      socket.broadcast.emit('getMessageExcept', {list: userList, message: user + ' has entered the chatroom'});
    }
    socket.emit("getMessage", {list: userList, message: user + ', Welcome to the chatroom!'});
  });
  
  socket.on('getMessageAll', message => {
    let user=socket.handshake.session.loginUser;
    if (!user) socket.disconnect();
    io.sockets.emit('getMessageAll', {user:user, message:user + ' : ' + message});
  });

  socket.on('disconnecting', () => {
    let user=socket.handshake.session.loginUser;
    let account=socket.handshake.session.account;
    let index = accountSet[account].socket.indexOf(socket);
    accountSet[account].socket.splice(index,1);
    if (accountSet[account].socket.length == 0) {
      delete accountSet[account];
      userList.splice(userList.indexOf(user));
      socket.broadcast.emit('getMessageExcept', {list: userList, message: user + ' has leaved the chatroom'});
    }
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

