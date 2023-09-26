const { PeerServer } = require("peer");
require('dotenv').config();

const port = process.env.PORT;
const origin = process.env.ORIGIN;
const path = '/'+process.env.INTERNALPATH;

const peerServer = PeerServer({ port: port, corsOptions: { origin: origin }, proxied: true, path: path});

peerServer.listen(()=> {
    console.log(`Peer server is running on port ${port} and path ${path}`)
});