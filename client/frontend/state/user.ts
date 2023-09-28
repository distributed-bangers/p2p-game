import { writable } from 'svelte/store';
import type { Game } from '../src/models/game';
import { authenticateJWT } from '../src/shared/auth';
import { disposeGameClient, gameClient } from '../src/main';
import { socketService } from '../src/services/socketService';

const token = document.cookie;

const payload = await authenticateJWT(token);

interface IUser {
  userid: string;
  username: string;
  authenticated: boolean;
  game: Game;
  isInGameLobby: boolean;
  isInGame: boolean;
}
const user = writable<IUser>({
  userid: payload ? payload.userid : null,
  username: payload ? payload.username : null,
  authenticated: !!payload,
  game: null,
  isInGameLobby: false,
  isInGame: false,
});

export const jwt = writable<string>(token ? token : '');

jwt.subscribe(async (value) => {
  document.cookie = value;
  try {
    const { userid, username } = await authenticateJWT(value);
    user.update((user) => ({ ...user, userid, username, authenticated: true }));
  } catch (e) { }
});

export const leaveRunningGame = () => {
  user.update((u) => {
    u.game = null;
    u.isInGame = false;
    u.isInGameLobby = false;
    return u;
  });
  socketService.resetSocketService();
};

export default user;
