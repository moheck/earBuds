// Setup basic express server
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

// Chatroom
var numUsers = 0;
var usersLoaded = 0;
var lobbyUsers = {};

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    console.log("server on 'new message'");
    console.log(data);
    // we tell the client to execute 'new message'
    io.sockets.emit('new message', {
      username: socket.userId,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (userId) {
    console.log("server on 'add user'");
    console.log(userId);
    socket.userId = userId;

    if (!lobbyUsers[userId]) {
      console.log('creating new user');
      lobbyUsers[userId] = {userId: socket.userId};
    } else {
      console.log('user found!');
    }
    
    // we store the username in the socket session for this client
    ++numUsers;
    io.sockets.emit('login', { numUsers: numUsers, users: lobbyUsers });
  });

  socket.on('load song', function(song){
    io.sockets.emit('load song', song);
  });

  socket.on('play song', function(song){
    io.sockets.emit('play song', song);
  });

  socket.on('pause song', function(song){
    console.log("server pause song")
    io.sockets.emit('pause song', song);
  });

  socket.on('load complete', function(load){
    ++usersLoaded;
    console.log("load complete, " + usersLoaded + " users loaded");
    if(usersLoaded == numUsers){
      usersLoaded = 0;
      io.sockets.emit('load complete', "message");
    }
  });
});