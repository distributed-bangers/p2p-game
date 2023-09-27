import type { jrestStatus } from '../shared/constants';
import type { User } from './user';

export interface Game {
  _id: string;
  name: string;
  host: User;
  players: User[];
  playersInGame?: User[];
  winner?: User;
  started: boolean;
  finished: boolean;
}
