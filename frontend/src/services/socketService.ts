import { io, Socket } from 'socket.io-client';
import { get } from 'svelte/store';
import userState from '../../state/user';
import type { User } from '../models/user';

export class socketService {
  private static instance: socketService = null;
  private static socket: Socket = null;

  private static client = {
    username: <string>null,
    userid: <string>null,
  };

  private static socketServer = import.meta.env.VITE_SOCKET_URL;

  private constructor(gameName: string) {
    if (!socketService.socket) {
      socketService.socket = io(socketService.socketServer, {
        extraHeaders: { gameId: gameName },
      });
    }
    if (!socketService.client.userid && !socketService.client.username) {
      socketService.client.userid = get(userState).userid;
      socketService.client.username = get(userState).username;
    }

    socketService.socket.on('join', (data: User) => {
      userState.update((u) => {
        if (u.game) u.game.players.push(data);
        return u;
      });
    });

    socketService.socket.on('leave', (data: User) => {
      userState.update((u) => {
        if (u.game)
          u.game.players = u.game.players.filter(
            (p) => p.userid != data.userid,
          );
        return u;
      });
    });

    socketService.socket.on('endConnection', () => {
      userState.update((u) => {
        console.log('ENDCONNECTION');
        if (u.game) {
          u.isInGame = false;
          alert('Host left the game');
        }
        return u;
      });
    });
  }

  private static async getInstance(gameName: string) {
    if (!this.instance) this.instance = new socketService(gameName);
  }

  //* Jeder Spieler (auch Host) teilt seine Informationen beim Beitritt/Austritt
  public static joinGame(gameName: string) {
    if (!this.instance) this.getInstance(gameName);
    this.socket.emit('join', this.client);
  }

  public static leaveGame(gameName: string) {
    if (this.instance) this.getInstance(gameName);
    this.socket.emit('leave', this.client);
  }

  public static endConnection(gameName: string) {
    if (this.instance) this.getInstance(gameName);
    this.socket.emit('endConnection');
  }
}
