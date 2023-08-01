const ioclient = require('socket.io-client');

const client = { username: 'client1', userid: '1' };

//* Adding gameId in order to group clients together
//* Client joins a game
const io = ioclient.io('http://localhost:3001', {
  extraHeaders: { gameId: '1234' },
});

//* Logging what information come in
io.on('join', (data) => console.log(data));
io.on('leave', (data) => console.log(data));
io.on('disconnect', (data) => console.log(data));

//* Client shares his information when joining a room

const game = await api.put()
io.emit('join', client);

// io.emit('leave', client);

// io.emit('message', 'Hello from client');

// io.on('message', (data) => console.log(data));
