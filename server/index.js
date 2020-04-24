const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    const roomId = data.roomId;
    socket.join(roomId);
    socket.room = roomId;
    const sockets = io.of('/').in().adapter.rooms[roomId];

    if (sockets.length === 1) {
      socket.emit('init');
    }
    else {
      if (sockets.length <= 5) {
        io.to(roomId).emit('ready');
      }
      else {
        socket.room = null;
        socket.leave(roomId);
        socket.emit('full');
      }
    }

  });
  socket.on('signal', (data) => {
    io.to(data.room).emit('desc', data.desc);
  });

  socket.on('disconnect', () => {
    if (socket.room) {
      io.to(socket.room).emit('disconnected');
    }
  })
});




