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
    console.log('SOCKETSERVICE INSTANCE CREATED');

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
      console.log('JOIN', data);
      userState.update((u) => {
        if (u.game) u.game.players.push(data);
        return u;
      });
    });

    socketService.socket.on('leave', (data: User) => {
      console.log('LEAVE', data);
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
      socketService.resetSocketService();
    });
  }

  private static async getInstance(gameName: string) {
    if (!socketService.instance)
      socketService.instance = new socketService(gameName);
  }

  //* Jeder Spieler (auch Host) teilt seine Informationen beim Beitritt/Austritt
  public static joinGame(gameName: string) {
    if (!socketService.instance) socketService.getInstance(gameName);
    socketService.socket.emit('join', socketService.client);
  }

  public static leaveGame(gameName: string) {
    if (socketService.instance) socketService.getInstance(gameName);
    socketService.socket.emit('leave', socketService.client);
    socketService.resetSocketService();
  }

  public static endConnection(gameName: string) {
    if (socketService.instance) socketService.getInstance(gameName);
    socketService.socket.emit('endConnection');
    socketService.resetSocketService();
  }

  private static resetSocketService() {
    socketService.instance = null;
    socketService.socket = null;
    socketService.client.userid = null;
    socketService.client.username = null;
  }
}
