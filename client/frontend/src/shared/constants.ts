export const apiURL = '/api/v1';

export const maxNumberOfPlayers = 3;

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
  join = 'join',
  leave = 'leave',
  startGame = 'startGame',
  hostLeft = 'hostLeft',
  disconnect = 'disconnect',
}
