import type { jrestStatus } from '../shared/constants';
import type { Game } from './game';
import type { JWTPayload } from 'jose';

//* Model for multiple Games API-Reponse
export interface ResponseGames {
  status: jrestStatus;
  results: number;
  data: { games: Game[] };
  //* error message in case of fail/error
  message?: string;
}
//* Model for single Game API-Reponse

export interface ResponseGame {
  status: jrestStatus;
  data: { game: Game };
  //* error message in case of fail/error
  message?: string;
}
export interface Payload extends JWTPayload {
  userid: string;
  username: string;
}
