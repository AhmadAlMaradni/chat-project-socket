var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var routes = require('./routes');
var socket = require('./routes/socket.js');

var io = require('socket.io').listen(server);



// Heroku config
if(process.env.PORT) {
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });  
}



var config = require('./config')(app, express);

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);


io.sockets.on('connection', socket);

var port = process.env.PORT || 5000;

server.listen(port);