var app = require('express').createServer();
var io = require('socket.io').listen(app);
var express = require('express');

app.listen(8080);

app.configure(function() {
    app.set("view options", { layout: false, pretty: true });
    app.use(express.favicon());
	app.use(express.static(__dirname + '/public'));
});

// routing
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var players = {};

io.sockets.on('connection', function (socket) {

	socket.on('add-player', function (name) {
		var lowerName = name.toLowerCase();
		if(typeof(players[lowerName]) == 'undefined') {
			// Add player
			players[lowerName] = {
				name:name,
				points:0
			};
		}
		socket.username = lowerName;
		io.sockets.emit('update-users', players);
		//socket.broadcast.emit('update-song', uri, name);
	});

	socket.on('new-response', function (playerName, response) {
		io.sockets.emit('response-given', playerName, response);
		//socket.broadcast.emit('update-song', uri, name);
	});

	socket.on('good-response-given', function (playerName) {
		io.sockets.emit('good-response', playerName);
		//socket.broadcast.emit('update-song', uri, name);
	});

	socket.on('bad-response-given', function (playerName) {
		io.sockets.emit('bad-response', playerName);
		//socket.broadcast.emit('update-song', uri, name);
	});

	socket.on('change-song', function () {
		io.sockets.emit('new-song');
		//socket.broadcast.emit('update-song', uri, name);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		delete players[socket.username];
		io.sockets.emit('update-users', players);
		//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});