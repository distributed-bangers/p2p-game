import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import userState from '../../state/user';
import type { User } from '../models/user';
import { socketMessageType } from '../shared/constants';
import type { Game } from '../models/game';

console.log('ATTENTION', import.meta.env.VITE_SOCKET_URL!);

export class socketService {
  private static instance: socketService = null;
  private static socket: Socket = null;

  private static socketServer = import.meta.env.VITE_SOCKET_URL;

  private constructor(gameId: string, gameHost: User) {
    console.log('SOCKETSERVICE INSTANCE CREATED');

    const client = <User>{
      username: get(userState).username,
      userid: get(userState).userid,
    };

    if (!socketService.socket) {
      socketService.socket = io(socketService.socketServer, {
        path: import.meta.env.VITE_SOCKET_VERSION,
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

    socketService.socket.on(socketMessageType.leave, (data: string) => {
      console.log('LEAVE', data);
      const player: User = JSON.parse(data);
      userState.update((u) => {
        if (u.game && u.isInGameLobby)
          u.game.players = u.game.players.filter(
            (p) => p.userid != player.userid,
          );
        return u;
      });
    });

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

    socketService.socket.on(
      socketMessageType.startGame,
      (playerIds: String[]) => {
        console.log('CLIENT RECEIVED', playerIds);
        //! So, this is actually the HOOK every player (except the host) receives on game startup
        userState.update((u) => {
          if (u.game) {
            u.isInGameLobby = false;
            u.isInGame = true;
          }
          return u;
        });
      },
    );
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

  public static leaveGame(gameName: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.leave);
    socketService.resetSocketService();
  }

  public static hostLeft(gameName: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.hostLeft);
    socketService.resetSocketService();
  }

  public static startGame(
    gameName: string,
    gameHost: User,
    playerIds: String[],
  ) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit(socketMessageType.startGame, playerIds);
  }

  private static resetSocketService() {
    socketService.instance = null;
    socketService.socket = null;
  }
}
