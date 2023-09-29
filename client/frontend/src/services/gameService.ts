import { get } from 'svelte/store';
import { jwt } from '../../state/user';
import { errorMessages, jrestStatus } from '../shared/constants';
import { socketService } from './socketService';
import type { ResponseGame, ResponseGames } from '../models/api';

const gameAPI =
  import.meta.env.VITE_GAME_API + import.meta.env.VITE_API_VERSION + '/games';

const bearer = 'Bearer ';

//* open/!closed => Offene Spiele in der Lobby, !open/closed => Beendete Spiele für Highscore
//* Defaultmässig sind beide Werte false ==> Alle Einträge von DB
export async function getAllGames({
  open = false,
  closed = false,
}): Promise<ResponseGames> {
  try {
    let authorizationHeader = bearer + get(jwt);
    let queryParam = '';
    if (open && closed) throw new Error(errorMessages.clientError);
    if (open && !closed) queryParam = '?open=true';
    if (!open && closed) queryParam = '?closed=true';

    const response = await fetch(gameAPI + queryParam, {
      method: 'GET',
      mode: 'cors',
      headers: { Authorization: authorizationHeader },
    });

    const result: ResponseGames = await response.json();
    if (result.status != jrestStatus.success) {
      if (result.message) throw new Error(result.message);
      else throw new Error(errorMessages.serverError);
    }

    return result;
  } catch (error) {
    throw error;
  }
}

export async function createGame(gameName: string): Promise<ResponseGame> {
  try {
    let authorizationHeader = bearer + get(jwt);

    const response = await fetch(gameAPI, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: gameName }),
    });

    const result: ResponseGame = await response.json();
    if (result.status != jrestStatus.success) {
      if (result.message) throw new Error(result.message);
      else throw new Error(errorMessages.serverError);
    }

    socketService.joinGame(result.data.game._id, result.data.game.host);

    return result;
  } catch (error) {
    throw error;
  }
}

export async function joinGame(gameId: string): Promise<ResponseGame> {
  try {
    let authorizationHeader = bearer + get(jwt);

    const response = await fetch(`${gameAPI}/${gameId}/join`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
    });

    const result: ResponseGame = await response.json();
    if (result.status != jrestStatus.success) {
      if (result.message) throw new Error(result.message);
      else throw new Error(errorMessages.serverError);
    }

    socketService.joinGame(result.data.game._id, result.data.game.host);

    return result;
  } catch (error) {
    throw error;
  }
}

export async function leaveGame(gameId: string): Promise<ResponseGame> {
  try {
    let authorizationHeader = bearer + get(jwt);

    const response = await fetch(`${gameAPI}/${gameId}/leave`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
    });

    const result: ResponseGame = await response.json();
    if (result.status != jrestStatus.success) {
      if (result.message) throw new Error(result.message);
      else throw new Error(errorMessages.serverError);
    }

    socketService.leaveLobby(result.data.game._id, result.data.game.host);

    return result;
  } catch (error) {
    throw error;
  }
}

export async function deleteGame(gameId: string): Promise<ResponseGame> {
  try {
    let authorizationHeader = bearer + get(jwt);

    const response = await fetch(`${gameAPI}/${gameId}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
    });

    const result: ResponseGame = await response.json();
    if (result.status != jrestStatus.success) {
      if (result.message) throw new Error(result.message);
      else throw new Error(errorMessages.serverError);
    }

    socketService.hostLeft(result.data.game._id, result.data.game.host);

    return result;
  } catch (error) {
    throw error;
  }
}

export async function startGame(gameId: string): Promise<ResponseGame> {
  try {
    let authorizationHeader = bearer + get(jwt);

    const response = await fetch(`${gameAPI}/${gameId}/start`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
    });

    const result: ResponseGame = await response.json();
    if (result.status != jrestStatus.success) {
      if (result.message) throw new Error(result.message);
      else throw new Error(errorMessages.serverError);
    }

    socketService.startGame(
      result.data.game._id,
      result.data.game.host,
      result.data.game.players,
    );

    return result;
  } catch (error) {
    throw error;
  }
}
