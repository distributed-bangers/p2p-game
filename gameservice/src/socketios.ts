import httpServer from './app.js'
import { DisconnectReason, Server } from 'socket.io'
import { IUser } from './models/models.js'
import { socketio } from './constants/constants.js'
import Game from '../src/models/models.js'
import config, { get } from 'config'
import { deleteGameById, getGameById, replaceGame } from './services/gameService.js'

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
        try {
            const game = await getGameById(gameId);
            //* This is called when a user closes the tab
            if (reason === 'transport close') {
                //* Handling of Disconnects if game is not started yet
                if (!game?.started) {
                    //* Case: Host lost connection
                    if (hostId == JSON.parse(player).userid) {
                        socket.to(gameId).emit(socketio.hostLeft)
                        cleanUpRoom()
                        await deleteGameById(gameId);
                        //* Case: Regular player lost connection
                    } else {
                        socket.to(gameId).emit(socketio.leave, player)
                    }
                    //* Handling of Disconnects if game is started and not finished yet
                } else if (!game?.finished) {
                    //* Case: User in game has lost connection
                    if (game.playersInGame.some((p) => p.userid == JSON.parse(player).userid)) {
                        game.playersInGame = game.playersInGame.filter((p) => p.userid != JSON.parse(player).userid);
                        //* Case: User in game has lost connection and the remaining user is the last player
                        if (game.playersInGame.length == 1) {
                            game.finished = true;
                            game.winner = game.playersInGame[0];
                            game.playersInGame = [];
                        }
                        await replaceGame(game);
                        socket.to(gameId).emit(socketio.leave, player);
                        //* Case: User not in the game has lost the connection
                    } else {
                        return;
                    }

                }
            }
        } catch (error) {
            console.log(error)
        }
    })

    //* start is send by the host: all other players get the information of all players
    socket.on(socketio.startGame, (playerIds: String[]) => {
        socket.to(gameId).emit(socketio.startGame, playerIds)
    })

    //* only host sends this: disconnects all members of a group
    //* should get called if game gets cancelled before starting
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
