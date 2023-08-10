import httpServer from './app.js'
import { Server } from 'socket.io'
import { IUser } from './models/models.js'
import { socketio } from './constants/constants.js'
import dotenv from 'dotenv'
dotenv.config({ path: './src/config.env' })

const clientURL = process.env.CLIENTURL

const io = new Server(httpServer, {
    cors: {
        origin: clientURL,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    const gameId = <string>socket.handshake.headers.gameid
    //* actually, each player (even the host) joins the room upon connection

    //* both join and leave are send by the players (not the host) after calling join/leave endpoint
    //* client attaches sends his own information after joining/leaving (data)
    socket.on(socketio.join, (data: IUser) => {
        console.log('SOCKETIO-JOIN', data)
        socket.join(gameId)
        socket.to(gameId).emit(socketio.join, data)
    })

    socket.on(socketio.leave, (data: IUser) => {
        console.log('SOCKETIO-LEAVE', data)
        socket.leave(gameId)
        socket.to(gameId).emit(socketio.leave, data)
    })

    //* start is send by the host: all other players get the information of all players
    socket.on(socketio.startGame, (data: IUser[]) => {
        console.log('SOCKETIO-START', data)
        socket.to(gameId).emit(socketio.startGame, data)
    })

    //* who can send this?
    //* disconnects all members of a group
    //* should get called if game gets cancelled before starting, breaks during playing or ends successfully
    socket.on(socketio.endConnection, () => {
        socket.to(gameId).emit(socketio.endConnection)
        const roomClients = io.sockets.adapter.rooms.get(gameId)
        roomClients?.forEach((client) => {
            const clientSocket = io.sockets.sockets.get(client)
            clientSocket?.leave(gameId)
            clientSocket?.disconnect()
        })
    })
})
export default httpServer
