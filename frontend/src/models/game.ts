import type { User } from './user';

export interface Game {
  name: string;
  host: User;
  players: User[];
  started: boolean;
  finished: boolean;
  highscore?: number;
}
