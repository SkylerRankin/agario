var express = require('express');
var body_parser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require('ejs');
var url = require('url');


var player = require('./player.js')

var players = [];
var clients = [];
var food = [];
var dimensions = {x: 1000, y: 1000};
var player_count = 0;

//GAME STATE SETUP

function randomBrightColor() {
  var rgb = [];
  rgb[Math.floor(Math.random()*3)] = 255;

  var temp = Math.floor(Math.random()*3);
  while (rgb[temp] != undefined) temp = Math.floor(Math.random()*3);
  rgb[temp] = 0;

  temp = Math.floor(Math.random()*3);
  while (rgb[temp] != undefined) temp = Math.floor(Math.random()*3);
  rgb[temp] = Math.floor(Math.random()*255);

  return 'rgb('+rgb[0]+', '+rgb[1]+', '+rgb[2]+')';
}

for (var i=0; i<100; ++i) food.push({x: Math.floor(Math.random()*dimensions.x), y: Math.floor(Math.random()*dimensions.y), color: randomBrightColor()});

//SERVER SETUP

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/views'));

app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());

app.get('/', function(req, res) {
  res.render('login');
});

app.get('/agario', function(req, res) {
  res.render('game');
});

app.post('/', function(req, res) {
  var query = '/agario?n='+encodeURIComponent(req.body.name)+'&c='+encodeURIComponent(req.body.color);
  res.redirect(query);
});

io.on('connection', function(socket) {

  if (!socket.handshake.headers.referer.match('agario')) {
    console.log('new login access');
    return;
  }

  var query = url.parse(socket.handshake.headers.referer).query;
  var decoded = decodeURIComponent(query);
  var a = decoded.indexOf('&c=');
  var name = decoded.substring(2, a);
  var color = decoded.substring(a+3, decoded.length);

  console.log('new player '+name+' joined');

  players.push(new player(socket.id, name, color, Math.floor(Math.random()*150)+100));
  clients.push(socket.id);

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected');
    var index = clients.indexOf(socket);
    players.splice(index, 1);
    clients.splice(index, 1);
    console.log('remaining players = '+players.length);
    if (players.length !== clients.length) console.error('Client array does not match player array.');
  });

  socket.on('send_dv', function(client_info) {
    var index = clients.indexOf(client_info.id);
    if (index !== -1) players[index].update_position(client_info.direction);
  });

});

http.listen(3000, function() {
  console.log('started on port 3000');
});

//TODO: implement reliable timing
setInterval(function() {
  collisions();
  io.emit('update', {players: players, food: food});
  io.emit('interval');
}, 30);

function collisions() {
  if (players.length < 2) return;
  players.forEach(function(player1) {
    players.forEach(function(player2) {
      if (player1 != player2 && Math.sqrt(Math.pow(player2.x - player1.x, 2) + Math.pow(player2.y - player1.y, 2)) < (player1.size + player2.size))
        console.log('collision');
    });
  });
}
