import httpServer from './app.js'
import { DisconnectReason, Server } from 'socket.io'
import { IUser } from './models/models.js'
import { socketio } from './constants/constants.js'
import Game from '../src/models/models.js'
import config from 'config'

const clientURL = <string>config.get('client.url')

const io = new Server(httpServer, {
    path: '/socketio/v1',
    cors: {
        origin: clientURL,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    const player = <string>socket.handshake.headers.player
    const gameId = <string>socket.handshake.headers.gameid
    const hostId = <string>socket.handshake.headers.hostid

    //* both join and leave are send by the players (not the host) after calling join/leave endpoint
    //* client attaches sends his own information after joining/leaving (data)
    socket.on(socketio.join, async () => {
        await socket.join(gameId)
        socket.to(gameId).emit(socketio.join, player)
    })

    socket.on(socketio.leave, async () => {
        console.log('SOCKETIO-LEAVE', player)
        socket.to(gameId).emit(socketio.leave, player)
        await socket.leave(gameId)
        socket.disconnect()
    })

    socket.on(socketio.disconnect, async (reason: DisconnectReason) => {
        if (reason === 'transport close') {
            //* This is the reason if the client loses the connection (browser closes, no answer to ping)
            if (hostId == JSON.parse(player).userid) {
                //* Case: Host lost connection
                socket.to(gameId).emit(socketio.hostLeft)
                cleanUpRoom()
                await Game.findByIdAndRemove(gameId)
            } else {
                //* Case: Player lost connection
                socket.to(gameId).emit(socketio.leave, player)
            }
        }
    })

    //* start is send by the host: all other players get the information of all players
    socket.on(socketio.startGame, () => {
        console.log('SOCKETIO-START', player)
        socket.to(gameId).emit(socketio.startGame, player)
    })

    //* only host sends this: disconnects all members of a group
    //* should get called if game gets cancelled before starting, breaks during playing or ends successfully
    socket.on(socketio.hostLeft, () => {
        socket.to(gameId).emit(socketio.hostLeft)
        cleanUpRoom()
    })

    const cleanUpRoom = async () => {
        const roomClients = io.sockets.adapter.rooms.get(gameId)
        roomClients?.forEach(async (client) => {
            const clientSocket = io.sockets.sockets.get(client)
            await clientSocket?.leave(gameId)
            clientSocket?.disconnect()
        })
    }
})
export default httpServer
