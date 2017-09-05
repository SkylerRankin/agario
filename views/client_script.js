$(function() {

  var socket = io();
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  var dv = {x:0, y:0};
  var position;

  var canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height= height;

  $('#canvas').on('mousemove', function(event) {
    //var temp = {x: (event.clientX - ($('#canvas').width() / 2)), y: (event.clientY - ($('#canvas').height() / 2))};
    var temp = {x: (event.clientX - (width / 2)), y: (event.clientY - (height / 2))};
    var mag = Math.sqrt((temp.x*temp.x)+(temp.y*temp.y));
    dv.x = temp.x / mag;
    dv.y = temp.y / mag;
  });

  socket.on('interval', function() {
    socket.emit('send_dv', {direction: dv, id: socket.id});
  });

  function drawGrid(ctx, focus) {
    ctx.beginPath();
    for (var i=0; i<500; i+=25) {
      ctx.moveTo(i - focus.x, 0 - focus.y);
      ctx.lineTo(i - focus.x, height - focus.y);
      ctx.moveTo(0 - focus.x, i - focus.y);
      ctx.lineTo(width - focus.x, i - focus.y);
    }
    ctx.stroke();
  };  

  socket.on('update', function(data) {
    //console.log('update call received');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var absolute_focus;
    for (var i=0; i<data.players.length; ++i)
      if (data.players[i].id === socket.id) {
        absolute_focus = {x: data.players[i].x, y: data.players[i].y};
        break;
      }
    if (absolute_focus) {
      ctx.clearRect(0, 0, width, height);
      //drawGrid(ctx, absolute_focus);
      data.food.forEach(function(blob) {
        ctx.beginPath();
        ctx.arc(blob.x - absolute_focus.x + (width/2), blob.y - absolute_focus.y + (height/2), 5, 0, 2*Math.PI);
        ctx.fillStyle = blob.color;
        ctx.fill();
      });
      data.players.forEach(function(player) {
        ctx.beginPath();
        ctx.arc(player.x - absolute_focus.x + (width/2), player.y - absolute_focus.y + (height/2), player.size, 0, 2*Math.PI);
        ctx.stroke();
      });
    }

  });

});
