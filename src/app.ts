import express from 'express';
const cors = require('cors');
const { uuidv4 } = require('uuidv4');
const app = express();
app.use(cors());
const port = process.env.port || 8080;
const http = require('http').Server(app);

interface player {
  id: string;
  name: string;
  hunter: boolean;
  x: number;
  y: number;
  alive: boolean;
}

//Hej

let players = [] as player[];

const socketIO = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
});

socketIO.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('init', players);
  let id = null;

  socket.on('createPlayer', (payload) => {
    console.log('Creating player');
    let index = -1;
    for (let i = 0; i < players.length; i++) {
      if (players[i].id == payload.id) index = i;
    }

    if (index === -1) {
      id = payload.id;
      socketIO.emit('createPlayer', payload);
      players.push(payload);
    } else {
      players[index] = payload;
      socketIO.emit('updatePlayer', players[index]);
    }
  });

  socket.on('updatePlayer', (payload) => {
    const index = players.findIndex((player) => player.id == payload.id);
    if (players[index]) {
      players[index].x = payload.x;
      players[index].y = payload.y;

      socketIO.emit('updatePlayer', players[index]);
    }
  });

  socket.on('deletePlayer', (payload) => {
    console.log('delete player', payload.name);
    payload.alive = false;
    socketIO.emit('updatePlayer', payload);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (player.id == payload.id) {
        players[i].alive = false;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', id);

    socketIO.emit('deletePlayer', { id: id, name: '', x: 0, y: 0 });
    players = players.filter((player) => player.id != id);
  });
});

app.get('/', (req, res) => {
  console.log('home page accessed');
  res.send(players);
});

http.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
