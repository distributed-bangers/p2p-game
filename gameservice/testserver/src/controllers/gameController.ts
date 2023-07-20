import { NextFunction, Request, Response } from 'express';
import { responseStatus, jrestStatus } from '../constants/constants.js';
import {
  NotFoundError,
  PlayerFoundError,
  PlayerNotFoundError,
} from '../errors/errors.js';
import { createGame, getAllGames } from '../services/gameService.js';

export async function getGames(req: Request, res: Response) {
  try {
    const games = await getAllGames();
    res.status(responseStatus.OK).json({
      status: jrestStatus.success,
      results: games.length,
      data: { games: games },
    });
  } catch (error: any) {
    //* Hier kann auf unterschiedliche Exceptions unterschiedlich eingegangen werden
    res.status(responseStatus.NotFound).json({
      status: jrestStatus.fail,
      message: error.message,
    });
  }
}

export async function postGames(req: Request, res: Response) {
  try {
    //* TODO: Überprüfen, ob der Spieler bereits ein Spiel offen hat
    //* SOCKET Verbindung zum Host aufbauen

    const newGame = await createGame(req);

    res.status(responseStatus.OK).json({
      status: jrestStatus.success,
      data: {
        game: newGame,
      },
    });
  } catch (error: any) {
    res.status(responseStatus.BadRequest).json({
      status: jrestStatus.fail,
      message: error.message,
    });
  }
}

// export async function joinGame(req: Request, res: Response) {
//   try {
//     //* TODO: Send all players messages, when another player joins
//     //* WEBSOCKET needed
//     const gameId = req.params.id;
//     const playername: string = req.body.player;
//     const indexToReplace = games.findIndex((game) => game.id === gameId);

//     const playerIsInGame = games.some((game) =>
//       game.players.includes(playername)
//     );

//     if (playerIsInGame)
//       throw new PlayerFoundError(
//         `Player with the name ${playername} is already in the game`
//       );

//     if (indexToReplace !== -1 && indexToReplace !== undefined) {
//       games[indexToReplace].players.push(playername);
//       res.status(responseStatus.OK).json({
//         status: jrestStatus.success,
//         data: { game: games[indexToReplace] },
//       });
//     } else throw new NotFoundError(`Game with id ${gameId} not found`);
//   } catch (error: any) {
//     res.status(responseStatus.BadRequest).json({
//       status: jrestStatus.fail,
//       message: error.message,
//     });
//   }
// }

// export async function leaveGame(req: Request, res: Response) {
//   try {
//     const gameId = req.params.id;
//     const playername: string = req.body.player;
//     const indexToReplace = games.findIndex((game) => game.id === gameId);

//     const playerIsInGame = games.some((game) =>
//       game.players.includes(playername)
//     );

//     if (!playerIsInGame)
//       throw new PlayerNotFoundError(
//         `Player with the name ${playername} was not found in the game`
//       );

//     if (indexToReplace !== -1 && indexToReplace !== undefined) {
//       games[indexToReplace].players = games[indexToReplace].players.filter(
//         (player) => player !== playername
//       );
//       res.status(responseStatus.OK).json({
//         status: jrestStatus.success,
//         data: { game: games[indexToReplace] },
//       });
//     } else throw new NotFoundError(`Game with id ${gameId} not found`);
//   } catch (error: any) {
//     res.status(responseStatus.BadRequest).json({
//       status: jrestStatus.fail,
//       message: error.message,
//     });
//   }
// }

// export async function deleteGame(req: Request, res: Response) {
//   try {
//     //* save deletes games somewhere as well?
//     //* TODO: Send all players messages, that the game was deleted
//     //* WEBSOCKET needed

//     const gameId = req.params.id;
//     const indexToReplace = games.findIndex((game) => game.id === gameId);
//     if (indexToReplace !== -1 && indexToReplace !== undefined) {
//       const gameToDelete = games.find((game) => game.id == gameId);
//       games = games.filter((game) => game.id != gameId);

//       res.status(responseStatus.OK).json({
//         status: jrestStatus.success,
//         data: { game: gameToDelete },
//       });
//     } else throw new NotFoundError(`Game with id ${gameId} not found`);
//   } catch (error: any) {
//     res.status(responseStatus.BadRequest).json({
//       status: jrestStatus.fail,
//       message: error.message,
//     });
//   }
// }

// export async function startGame(req: Request, res: Response) {
//   try {
//     //* TODO: Some kind of authentication needed to know that the founder send this request

//     const gameId = req.params.id;
//     const indexToReplace = games.findIndex((game) => game.id === gameId);
//     if (indexToReplace !== -1 && indexToReplace !== undefined) {
//       //! HERE: Actually start the game, initiate all connections
//       //* Remove started game from array
//       const gameToStart = games.find((game) => game.id == gameId);
//       games = games.filter((game) => game.id != gameId);

//       res.status(responseStatus.OK).json({
//         status: jrestStatus.success,
//         data: { game: gameToStart },
//       });
//     } else throw new NotFoundError(`Game with id ${gameId} not found`);
//   } catch (error: any) {
//     res.status(responseStatus.BadRequest).json({
//       status: jrestStatus.fail,
//       message: error.message,
//     });
//   }
// }
