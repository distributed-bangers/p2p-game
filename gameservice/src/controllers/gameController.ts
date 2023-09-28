import { NextFunction, Request, Response } from 'express'
import { responseStatus, jrestStatus } from '../constants/constants.js'
import {
    NotFoundError,
    PlayerFoundError,
    PlayerNotFoundError,
} from '../errors/errors.js'
import {
    createGame,
    getAllGames,
    joinGame,
    leaveGame,
    loseGame,
    removeGame,
    startGame,
} from '../services/gameService.js'

export async function getGames(req: Request, res: Response) {
    try {
        const games = await getAllGames(req)
        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            results: games.length,
            data: { games: games },
        })
    } catch (error: any) {
        res.status(responseStatus.NotFound).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}

export async function postGames(req: Request, res: Response) {
    try {
        const newGame = await createGame(req)

        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            data: {
                game: newGame,
            },
        })
    } catch (error: any) {
        res.status(responseStatus.BadRequest).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}

export async function putGameJoin(req: Request, res: Response) {
    try {
        //* TODO: Send all players messages, when another player joins
        //* WEBSOCKET needed
        const updatedGame = await joinGame(req)

        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            data: {
                game: updatedGame,
            },
        })
    } catch (error: any) {
        res.status(responseStatus.BadRequest).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}

export async function putGameLeave(req: Request, res: Response) {
    try {
        //* TODO: Send all players messages, when another player joins
        const updatedGame = await leaveGame(req)

        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            data: {
                game: updatedGame,
            },
        })
    } catch (error: any) {
        res.status(responseStatus.BadRequest).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}

export async function deleteGame(req: Request, res: Response) {
    //* Wird gecallt, wenn der Host absichtlich ein Spiel beendet
    //* TODO: Send all players messages, that the game was deleted
    //* WEBSOCKET needed
    try {
        const gameToDelete = await removeGame(req)

        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            data: { game: gameToDelete },
        })
    } catch (error: any) {
        res.status(responseStatus.BadRequest).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}

export async function putGameStart(req: Request, res: Response) {
    try {
        const gameToStart = await startGame(req)

        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            data: { game: gameToStart },
        })
    } catch (error: any) {
        res.status(responseStatus.BadRequest).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}

export async function putGameLose(req: Request, res: Response) {
    try {
        const gameToLose = await loseGame(req)

        res.status(responseStatus.OK).json({
            status: jrestStatus.success,
            data: { game: gameToLose },
        })
    } catch (error: any) {
        res.status(responseStatus.BadRequest).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}