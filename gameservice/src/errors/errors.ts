export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class PlayerFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerFoundError';
  }
}

export class PlayerNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerNotFoundError';
  }
}
