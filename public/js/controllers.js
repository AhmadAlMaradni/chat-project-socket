'use strict';
var current_username;

function AppCtrl($scope, socket) {

  // ================

  socket.on('init', function (data) {
    current_username =  data.name;
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    var mention, me;
    mention = getMention(message.text);
    if(mention) {
      me = "active"
    } else {
      me = null;
    }
    $scope.messages.push({
      user: message.user,
      text: message.text,
      me: me
      });
  });


  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
  });


    socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });

  $(function(){
    $('#changeNameModal').modal('show')
  })

  // =======================

  var retrieveUsername = function() {
    var username;
    username = (localStorage.getItem("username") || false);
    if (!username) { return false; }
    return username;
  }

  var getMention = function(message) {
    var text,pattern,mention;
    text = message;
    pattern = /\B\@([\w\-]+)/gim;
    mention = text.match(pattern);

    if(mention){
      mention = String(mention).split("@")[1];
      if(mention === current_username) return mention;
    }

    return false;
  }

  var changeName = function (oldName, newName, member) {
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }
    localStorage.setItem("username",newName);
    current_username = newName;

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // ======================================

  $scope.mention = function (name) {
      $scope.message = '@' + name + ' ';
      $('.input-message').focus()
  };

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
        $('#changeNameModal').modal('hide')
      }
    });
  };

  $scope.messages = [];

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });


    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });



    $scope.message = '';
  };

}
