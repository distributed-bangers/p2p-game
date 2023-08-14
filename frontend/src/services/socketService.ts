import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import userState from '../../state/user';
import type { User } from '../models/user';

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
        extraHeaders: {
          gameid: gameId,
          hostid: gameHost.userid,
          player: JSON.stringify(client),
        },
      });
    }

    socketService.socket.on('join', (data: string) => {
      const player: User = JSON.parse(data);
      userState.update((u) => {
        if (u.game && u.isInGame) u.game.players.push(player);
        return u;
      });
    });

    socketService.socket.on('leave', (data: string) => {
      console.log('LEAVE', data);
      const player: User = JSON.parse(data);
      userState.update((u) => {
        if (u.game && u.isInGame)
          u.game.players = u.game.players.filter(
            (p) => p.userid != player.userid,
          );
        return u;
      });
    });

    socketService.socket.on('hostLeft', () => {
      userState.update((u) => {
        console.log('hostLeft');
        if (u.game) {
          u.isInGame = false;
          alert('Host left the game');
        }
        return u;
      });
      socketService.resetSocketService();
    });
  }

  private static async getInstance(gameName: string, gameHost: User) {
    if (!socketService.instance)
      socketService.instance = new socketService(gameName, gameHost);
  }

  //* Jeder Spieler (auch Host) teilt seine Informationen beim Beitritt/Austritt
  public static joinGame(gameName: string, gameHost: User) {
    if (!socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit('join');
  }

  public static leaveGame(gameName: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit('leave');
    socketService.resetSocketService();
  }

  public static hostLeft(gameName: string, gameHost: User) {
    if (socketService.instance) socketService.getInstance(gameName, gameHost);
    socketService.socket.emit('hostLeft');
    socketService.resetSocketService();
  }

  private static resetSocketService() {
    socketService.instance = null;
    socketService.socket = null;
  }
}
