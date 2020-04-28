const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


let rooms = {};

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    const roomId = data.roomId;
    const name = data.username;
    socket.join(roomId);
    socket.room = roomId;
    const sockets = io.of('/').in().adapter.rooms[roomId];

    if (!(roomId in rooms)) {
      rooms[roomId] = []
    }

    rooms[roomId].push(name)
    console.log(rooms)

    if (sockets.length === 1) {
      socket.emit('init');
      console.log("Host connected / Room created with id : " + roomId)
    }
    else {
      if (sockets.length <= 5) {
        io.to(roomId).emit('ready', rooms[roomId]);
        console.log("Someone connected to room " + roomId);
      }
      else {
        socket.room = null;
        socket.leave(roomId);
        socket.emit('full');
      }
    }

  });
  socket.on('signal', (data) => {
    console.log(data)
    io.to(data.room).emit('desc', data);
  });

  socket.on('disconnect', () => {
    if (socket.room) {
      io.to(socket.room).emit('disconnected');
    }
  })
});




