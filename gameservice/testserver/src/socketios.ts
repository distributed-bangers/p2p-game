import httpServer from './app.js'
import { Server } from 'socket.io'
import { IUser } from './models/models.js'
import { socketio } from './constants/constants.js'

export const io = new Server(httpServer)

io.on('connection', (socket) => {
    const gameId = <string>socket.handshake.headers.gameid

    //* both join and leave are send by the players (not the host) after calling join/leave endpoint
    //* client attaches the list of all players as data to the emit (in order to sync with backend)
    socket.on(socketio.join, (data: IUser[]) => {
        socket.join(gameId)
        socket.to(gameId).emit(socketio.join, data)
    })

    socket.on(socketio.leave, (data: IUser[]) => {
        socket.leave(gameId)
        socket.to(gameId).emit(socketio.leave, data)
    })

    //* start is send by the host: all other players get the information of all players
    socket.on(socketio.startGame, (data: IUser[]) => {
        socket.to(gameId).emit(socketio.startGame, data)
    })

    //* who can send this?
    //* disconnects all members of a group
    //* should get called if game gets cancelled before starting, breaks during playing or ends successfully
    socket.on(socketio.endConnection, () => {
        const roomClients = io.sockets.adapter.rooms.get(gameId)
        roomClients?.forEach((client) => {
            const clientSocket = io.sockets.sockets.get(client)
            clientSocket?.leave(gameId)
            clientSocket?.disconnect()
        })
    })
})
export default httpServer
