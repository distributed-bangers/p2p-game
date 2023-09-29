import httpServer from './app.js'
import { DisconnectReason, Server } from 'socket.io'
import { IUser } from './models/models.js'
import { socketio } from './constants/constants.js'
import Game from '../src/models/models.js'
import config, { get } from 'config'
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { deleteGameById, getGameById, replaceGame } from './services/gameService.js'

const clientURL = <string>config.get('client.url')

const io = new Server(httpServer, {
    path: '/socketio/v1',
})

const pubClient = createClient({ url: config.get('redis.url') });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    console.log('Redis connected')
    io.adapter(createAdapter(pubClient, subClient));
});

io.on('connection', (socket) => {
    const player = <string>socket.handshake.headers.player
    const gameId = <string>socket.handshake.headers.gameid
    const hostId = <string>socket.handshake.headers.hostid

    const leaveAndCleanUp = async (leaveReason: string) => {
        socket.to(gameId).emit(leaveReason, player)
        await socket.leave(gameId)
        socket.disconnect()
    }

    const cleanUpRoom = async () => {
        const roomClients = io.sockets.adapter.rooms.get(gameId)
        roomClients?.forEach(async (client) => {
            const clientSocket = io.sockets.sockets.get(client)
            await clientSocket?.leave(gameId)
            clientSocket?.disconnect()
        })
    }

    //* both join and leave are send by the players (not the host) after calling join/leave endpoint
    socket.on(socketio.playerJoinsLobby, async () => {
        await socket.join(gameId)
        socket.to(gameId).emit(socketio.playerJoinsLobby, player)
    })

    socket.on(socketio.playerLeavesLobby, async () => {
        await leaveAndCleanUp(socketio.playerLeavesLobby);
    });

    //* Here, only the disconnects by closing the tab are handled
    socket.on(socketio.disconnect, async (reason: DisconnectReason) => {
        try {
            if (reason === 'transport close') {
                const game = await getGameById(gameId);
                //* Handling of Disconnects if game is not started yet (lobby-phase)
                if (!game?.started) {
                    //* Case: Host lost connection
                    if (hostId == JSON.parse(player).userid) {
                        socket.to(gameId).emit(socketio.hostLeavesLobby)
                        cleanUpRoom()
                        await deleteGameById(gameId);
                        //* Case: Regular player lost connection
                    } else {
                        await leaveAndCleanUp(socketio.playerLeavesLobby);
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
                        await leaveAndCleanUp(socketio.playerLeavesGame);
                        if (game.finished) cleanUpRoom()
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

    //* start is send by the host: all other players get the data of all players
    socket.on(socketio.hostStartsGame, (playerIds: String[]) => {
        socket.to(gameId).emit(socketio.hostStartsGame, playerIds)
    })

    //* only host can send this within lobby: disconnects all members of a group
    socket.on(socketio.hostLeavesLobby, async () => {
        socket.to(gameId).emit(socketio.hostLeavesLobby)
        await cleanUpRoom()
    })

    //* player sends this when he loses game => cleans up own socket and sends to other players
    socket.on(socketio.playerLosesGame, async () => {
        await leaveAndCleanUp(socketio.playerLosesGame)
    })

    //* last losing player sends this when he loses game
    //* no need the cleanup, because the player will send loseGame-event as well
    socket.on(socketio.playerWinsGame, async () => {
        socket.to(gameId).emit(socketio.playerWinsGame)
    })
})
export default httpServer
