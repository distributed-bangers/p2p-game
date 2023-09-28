//* gets called from game client, when a player dies

import { get } from "svelte/store";
import type { ResponseGame } from "../models/api";
import { jwt, leaveRunningGame } from "../../state/user";
import { errorMessages, jrestStatus } from "./constants";
import userState from '../../state/user';
import { socketService } from "../services/socketService";


const gameAPI =
    import.meta.env.VITE_GAME_API + import.meta.env.VITE_API_VERSION + '/games';

const bearer = 'Bearer ';

//* gets called from game client, when the player himself dies
//* all other players are notified via socket-events
export async function loseGame(): Promise<ResponseGame> {
    try {
        let authorizationHeader = bearer + get(jwt);
        const gameId = get(userState).game._id;

        const response = await fetch(`${gameAPI}/${gameId}/lose`, {
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

        //* Calls the socketService to notify all remaining players, that the player lost
        socketService.loseGame(result.data.game._id, result.data.game.host);

        //* Calls the socketService to notify the only remaining player, that he won
        if (result.data.game.playersInGame.length == 1) {
            socketService.winGame(result.data.game._id, result.data.game.host);
        }

        alert('You lost the game! Returning to lobby now...');
        leaveRunningGame();

        return result;
    } catch (error) {
        throw error;
    }
}