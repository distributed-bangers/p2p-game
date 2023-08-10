import { writable } from 'svelte/store';
import type { Game } from '../src/models/game';

const user = writable({
  userid: <string>null,
  username: <string>null,
  authenticated: <boolean>null,
  jwt: <string>null,
  game: <Game>null,
  isInGame: <boolean>false,
});

export default user;
