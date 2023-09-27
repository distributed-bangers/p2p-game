import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import userState from '../../state/user';
import type { User } from '../models/user';
import { socketMessageType } from '../shared/constants';

export class socketService {
  private static instance: socketService = null;
  private static socket: Socket = null;

  private static socketServer = import.meta.env.VITE_SOCKET_URL;

  private constructor(gameId: string, gameHost: User) {
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

    socketService.socket.on(socketMessageType.join, (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {
        if (u.game && u.isInGameLobby) u.game.players.push(player);
        return u;
      });
    });

    //* Other player leaves lobby
    socketService.socket.on(socketMessageType.leaveLobby, (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {
        u.game.players = u.game.players.filter(
          (p) => p.userid != player.userid,
        );
        console.log('after update leave', u);
        return u;
      });
    });

    //* Other player leaves running game
    socketService.socket.on(socketMessageType.leaveGame, (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {

        u.game.playersInGame = u.game.playersInGame.filter(
          (p) => p.userid != player.userid,
        );
        // gameCient(player.userid);
        //! HERE; delete player from client
        //* Double check if I am the last player ==> Win-Api is not getting called
        if (u.game.playersInGame.length == 1)
          if (u.game.playersInGame[0].userid == u.userid) {
            alert('All other players have left.. So, you won the game! 🦝');
            u.game = null;
            u.isInGame = false;
            u.isInGameLobby = false;
          }

        console.log('after update leave', u);
        return u;
      });
    })

    socketService.socket.on(socketMessageType.hostLeft, () => {
      userState.update((u) => {
        console.log('hostLeft');
        if (u.game) {
          u.isInGameLobby = false;
          alert('Host left the game');
        }
        return u;
      });
      socketService.resetSocketService();
    });

    socketService.socket.on(socketMessageType.startGame, (players: User[]) => {
      //*This is the starting point of the game for the players, not the host (for him it's in GameLobby.svelte)
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
  }

  private static async getInstance(gameName: string, gameHost: User) {
    if (!socketService.instance)
      socketService.instance = new socketService(gameName, gameHost);
  }

  //* Jeder Spieler (auch Host) teilt seine Informationen beim Beitritt/Austritt
  public static joinGame(gameName: string, gameHost: User) {
    if (!socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.join);
  }

  public static leaveLobby(gameName: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.leaveLobby);
    socketService.resetSocketService();
  }

  public static hostLeft(gameName: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.hostLeft);
    socketService.resetSocketService();
  }

  public static startGame(gameName: string, gameHost: User, players: User[]) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.startGame, players);
  }

  private static resetSocketService() {
    socketService.instance = null;
    socketService.socket = null;
  }
}
