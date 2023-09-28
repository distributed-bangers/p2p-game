export const apiURL = '/api/v1'

export const maxNumberOfPlayers = 3;

export enum socketio {
    playerJoinsLobby = 'playerJoinsLobby',
    playerLeavesLobby = 'playerLeavesLobby',
    playerLeavesGame = 'playerLeavesGame',
    hostStartsGame = 'hostStartsGame',
    hostLeavesLobby = 'hostLeavesLobby',
    playerLosesGame = 'playerLosesGame',
    playerWinsGame = 'playerWinsGame',
    disconnect = 'disconnect',
}

export enum responseStatus {
    /** Success: OK */
    OK = 200,

    /** Success: Created */
    Created = 201,

    /** Success: No Content */
    NoContent = 204,

    /** Unauthorized */

    Unauthorized = 401,
    /** Bad Request */
    BadRequest = 400,

    /** Not Found */
    NotFound = 404,

    /** Internal Server Error */
    InternalServerError = 500,
}

export enum jrestStatus {
    success = 'success',
    fail = 'fail',
    error = 'error',
}
