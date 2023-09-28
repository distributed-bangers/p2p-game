import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import userState, { leaveRunningGame } from '../../state/user';
import type { User } from '../models/user';
import { socketMessageType } from '../shared/constants';
import { disposeGameClient, gameClient } from '../main';

export class socketService {
  private static instance: socketService = null;
  private static socket: Socket = null;

  private static socketServer = import.meta.env.VITE_SOCKET_URL;

  private constructor(gameId: string, gameHost: User) {

    console.log('creating socketService')
    const client = <User>{
      username: get(userState).username,
      userid: get(userState).userid,
    };

    if (!socketService.socket) {
      socketService.socket = io(socketService.socketServer, {
        path: import.meta.env.VITE_SOCKET_VERSION,
        //* when a player connects to the socketService, he sends the gameId, hostId and his own player object
        extraHeaders: {
          gameid: gameId,
          hostid: gameHost.userid,
          player: JSON.stringify(client),
        },
      });
    }

    //* These are the socket events that are received from the server
    socketService.socket.on(socketMessageType.playerJoinsLobby, (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {
        if (u.game && u.isInGameLobby) u.game.players.push(player);
        return u;
      });
    });

    //* Other player leaves lobby
    socketService.socket.on(socketMessageType.playerLeavesLobby, (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {
        u.game.players = u.game.players.filter(
          (p) => p.userid != player.userid,
        );
        return u;
      });
    });

    //* Other player leaves running game
    socketService.socket.on(socketMessageType.playerLeavesGame, (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {

        u.game.playersInGame = u.game.playersInGame.filter(
          (p) => p.userid != player.userid,
        );
        //* Update the gameClient: Disconnect WebRTC-Connection
        gameClient.onPlayerDisconnect(player.userid);
        //* Double check if I am the last player ==> I won the game by the other player leaving
        if (u.game.playersInGame.length == 1)
          if (u.game.playersInGame[0].userid == u.userid) {
            alert('All other players have left.. So, you won the game! 🦝');
            u.game = null;
            u.isInGame = false;
            u.isInGameLobby = false;
            socketService.resetSocketService();
          }
        return u;
      });
    })

    //* Host leaves lobby, I return to the game 
    socketService.socket.on(socketMessageType.hostLeavesLobby, () => {
      userState.update((u) => {
        if (u.game) {
          u.isInGameLobby = false;
          alert('Host left the game');
        }
        return u;
      });
      socketService.resetSocketService();
    });

    //* Host started game: Hook up the gameClient
    socketService.socket.on(socketMessageType.hostStartsGame, (players: User[]) => {
      userState.update((u) => {
        if (u.game) {
          //* Syncing the game state (players) with the server
          u.game.players = players;
          u.game.playersInGame = players;
          u.isInGameLobby = false;
          u.isInGame = true;
        }
        return u;
      });
    });

    //* Other player loses game
    socketService.socket.on(socketMessageType.playerLosesGame, (data: string) => {
      const losingPlayer: User = JSON.parse(data);
      userState.update((u) => {
        u.game.playersInGame = u.game.playersInGame.filter((p) => p.userid != losingPlayer.userid);
        gameClient.onPlayerDisconnect(losingPlayer.userid);
        return u;
      });
    });

    //* I win the game
    socketService.socket.on(socketMessageType.playerWinsGame, () => {
      alert('You won the game! 🦝');
      leaveRunningGame();
    });
  }

  private static async getInstance(gameId: string, gameHost: User) {
    if (!socketService.instance)
      socketService.instance = new socketService(gameId, gameHost);
  }

  //* These functions are used to send socket messages to the server
  public static joinGame(gameId: string, gameHost: User) {
    if (!socketService.instance) socketService.getInstance(gameId, gameHost);
    socketService.socket.emit(socketMessageType.playerJoinsLobby);
  }

  public static leaveLobby(gameId: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameId, gameHost);
    socketService.socket.emit(socketMessageType.playerLeavesGame);
    socketService.resetSocketService();
  }

  public static hostLeft(gameId: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameId, gameHost);
    socketService.socket.emit(socketMessageType.hostLeavesLobby);
    socketService.resetSocketService();
  }

  public static startGame(gameId: string, gameHost: User, players: User[]) {
    if (socketService.instance) socketService.getInstance(gameId, gameHost);
    socketService.socket.emit(socketMessageType.hostStartsGame, players);
  }

  public static loseGame(gameId: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameId, gameHost);
    socketService.socket.emit(socketMessageType.playerLosesGame);
  }

  public static winGame(gameId: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameId, gameHost);
    socketService.socket.emit(socketMessageType.playerWinsGame);
  }

  public static resetSocketService() {
    console.log('resetting socketService')
    socketService.socket.disconnect();
    socketService.instance = null;
    socketService.socket = null;
  }
}
