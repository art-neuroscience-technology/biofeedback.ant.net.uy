const path = require('path')
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.use(express.static('public'))

server.listen(8080, function() {
   console.log("Server listening");
});

//websockets
io.on('connection', function(argument) {
  console.log('new connection');
});

