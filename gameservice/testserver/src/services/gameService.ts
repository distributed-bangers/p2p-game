import { NextFunction, Request, Response } from 'express';

import { jrestStatus, responseStatus } from '../constants/constants.js';
import { Game } from '../models/models.js';

export function checkBodyPostGame(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body.name || !req.body.founder) {
    return res.status(responseStatus.BadRequest).json({
      status: jrestStatus.fail,
      message: 'Missing game name or game founder',
    });
  }
  next();
}

export function checkBodyJoinLeaveGame(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body.player) {
    return res.status(responseStatus.BadRequest).json({
      status: jrestStatus.fail,
      message: 'Missing player name',
    });
  }
  next();
}

export async function getAllGames() {
  return await Game.find();
}

export async function getGameById(id: string) {
  return await Game.findById(id);
}

export async function createGame(req: Request) {
  return await Game.create({
    name: req.body.name,
    host: req.body.host,
    players: [req.body.host],
    started: false,
    finished: false,
  });
}
