const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('./config/config');

let users = [];
let messages = [];

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
  socket.on('login', data => {
    const isUserExist = users.find(user => user === data);

    if (!isUserExist) {
      if (data.length < 4) return io.sockets.emit('login', { status: 'Nickname must have from 4 to 10 characters.' });

      users.push(data);
      socket.nickname = data;

      io.sockets.emit('users', users);
      return io.sockets.emit('login', { nickname: data, status: 'OK', messages });
    } else {
      return io.sockets.emit('login', { status: `Nickname "${data}" is not available.` });
    }
  });

  socket.on('sendMessage', data => {
    const date = new Date();

    let message = {
      nickname: socket.nickname,
      message: data,
      time: `${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${
        date.getMinutes() < 10 ? '0' : ''
      }${date.getMinutes()} ${date.getDate() < 10 ? '0' : ''}${date.getDate()}.${
        date.getMonth() < 10 ? '0' : ''
      }${date.getMonth()}`,
    };

    messages.push(message);

    io.sockets.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    users = users.filter(user => user !== socket.nickname);
    io.sockets.emit('users', users);
  });
});

server.listen(process.env.PORT || config.port, () => {
  const date = new Date();
  console.log(
    `It works on port ${process.env.PORT || config.port}. ${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${
      date.getMinutes() < 10 ? '0' : ''
    }${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()} ${
      date.getDate() < 10 ? '0' : ''
    }${date.getDate()}.${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}.${date.getFullYear()}`
  );
});
