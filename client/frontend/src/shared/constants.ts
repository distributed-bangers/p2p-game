export const apiURL = '/api/v1';

export const maxNumberOfPlayers = 2;

export enum jrestStatus {
  success = 'success',
  fail = 'fail',
  error = 'error',
}

export enum errorMessages {
  serverError = 'Server error: Something went wrong.',
  clientError = 'Client error: Something went wrong.',
}

export enum socketMessageType {
  playerJoinsLobby = 'playerJoinsLobby',
  playerLeavesLobby = 'playerLeavesLobby',
  playerLeavesGame = 'playerLeavesGame',
  hostStartsGame = 'hostStartsGame',
  hostLeavesLobby = 'hostLeavesLobby',
  playerLosesGame = 'playerLosesGame',
  playerWinsGame = 'playerWinsGame',
  disconnect = 'disconnect',
}
