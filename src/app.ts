import express from 'express';
const cors = require('cors');
const { uuidv4 } = require('uuidv4');
const app = express();
app.use(cors());
const port = process.env.port || 8080;
const http = require('http').Server(app);

interface player {
  name: string;
  hunter: boolean;
  x: number;
  y: number;
}

let players = [] as player[];

const socketIO = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
});

socketIO.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('init', players);
  let name = null;

  socket.on('createPlayer', (payload) => {
    console.log('Creating player');

    name = payload.name;

    socketIO.emit('createPlayer', payload);
    players.push(payload);
  });

  socket.on('updatePlayer', (payload) => {
    players = players.filter((player) => player.name != payload.name);
    players.push(payload);

    socketIO.emit('updatePlayer', payload);
  });

  socket.on('deletePlayer', (payload) => {
    socketIO.emit('deletePlayer', { name: name, x: 0, y: 0 });
    players = players.filter((player) => player.name != name);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', name);
    socketIO.emit('deletePlayer', { name: name, x: 0, y: 0 });
    players = players.filter((player) => player.name != name);
  });
});

app.get('/', (req, res) => {
  console.log('home page accessed');
  res.send(players);
});

http.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
