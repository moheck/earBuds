$(function () {
  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $users = $('.users');
  var $musicUrl = $('.musicUrl');
  var $loadButton = $('#loadButton');
  var $playButton = $('#playButton');
  var $pauseButton = $('#pauseButton');
  var $audioPlayer = $('.audioPlayer');
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  $chatPage.hide();
  $audioPlayer.hide();
  $playButton.disabled = true;
  $pauseButton.disabled = true;
  var socket = io();

  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  // Sets the client's username
  function setUsername() {
    username = $usernameInput.val().trim();

    // If the username is valid
    if (username) {
      $loginPage.hide();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage() {
    var message = $inputMessage.val();
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      // tell server to execute 'new message' and send along one parameter
      $inputMessage.val('');
      socket.emit('new message', message);
    }
  }

  //adds the user's message to the messages ul
  function addToMessages(data){
    $messages.append('<li> <strong>' + data.username + "</strong>: " + data.message + '</li>');
  }
  
  function updateUsers(users){
    console.log(users);
    $users.empty();
    for(var name in users){
      $users.append('<li>' + name + '</li>');
    };
  }

  // Keyboard events
  $window.keydown(function (event) {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
      } else {
        setUsername();
      }
    }
  });

  // CLICK EVENTS

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  $musicUrl.click(function () {
    $musicUrl.focus();
  });

  $loadButton.click(function(){
    var message = $musicUrl.val();
    $musicUrl.val('');
    console.log(message);
    socket.emit('load song', message);
  });

  $playButton.click(function(){
    var msg = "play the song!";
    socket.emit('play song', msg);
  });

  $pauseButton.click(function() {
    console.log("pause clicked");
    var msg = "pause the song";
    socket.emit('pause song', msg);
  });

  // SOCKET EVENTS

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    console.log("client on 'login'");
    console.log(data);
    updateUsers(data.users);
    connected = true;
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    console.log("client on 'new message'");
    console.log(data);
    addToMessages(data);
  });

  socket.on('load song', function(song){
    console.log("loading song " + song);
    $("#audioSource").attr("src", song);
    $audioPlayer[0].pause();
    $audioPlayer[0].load();
    $audioPlayer[0].oncanplaythrough = socket.emit('load complete', "message");
  });

  socket.on('load complete', function(msg){
    console.log("all clients loaded");
    //make play and pause available
    $playButton.disabled = false;
    $pauseButton.disabled = false;
  });

  socket.on('play song', function(song){
    $audioPlayer[0].play();
  });
 
  socket.on('pause song', function(song){
    console.log("pausing song on client")
    $audioPlayer[0].pause();
  });
});