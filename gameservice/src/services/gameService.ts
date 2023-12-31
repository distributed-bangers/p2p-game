import { NextFunction, Request, Response } from 'express'
import { extractUserFromToken } from './tokenService.js'
import Game, { IGame, IUser } from '../models/models.js'
import { maxNumberOfPlayers } from '../constants/constants.js'

//* two query params: ?open=true/false and ?closed=true/false
//* enter no query params to get all games, either use open=true or closed=true
export async function getAllGames(req: Request) {
    const open = req.query.open
    const closed = req.query.closed
    let games: IGame[] = []

    if (
        (open === 'true' && closed === 'true') ||
        (open === undefined && closed === undefined)
    )
        games = await Game.find()
    //* Open Games => Spiele, die in der Lobby zu finden sind
    else if (open && !closed)
        games = await Game.find({ started: 'false', finished: 'false' })
    //* Closed Games => Vergangene Spiele, die als Highscore angezeigt werden können
    else if (!open && closed)
        games = await Game.find({ started: 'true', finished: 'true' })
    return games
}

export async function getGameById(id: string) {
    return await Game.findById(id)
}

export async function deleteGameById(id: string) {
    return await Game.findByIdAndRemove(id)
}

export async function replaceGame(game: IGame) {
    return await Game.replaceOne({ _id: game._id }, game)
}

export async function createGame(req: Request) {
    if (req.body.name) {
        const host = extractUserFromToken(req)

        return await Game.create({
            name: req.body.name,
            host: host,
            players: [host],
        })
    } else throw new Error('Game name not found')
}

export async function joinGame(req: Request) {
    const gameId = req.params.id
    if (gameId) {
        const game = await getGameById(gameId)
        const player = extractUserFromToken(req)
        if (player) {
            if (game && !game.started) {
                if (game.players.length < maxNumberOfPlayers) {
                    //* checks if player is already in game
                    if (game.players.every((p) => p.userid !== player.userid)) {
                        game.players.push(player)
                        await Game.replaceOne({ _id: game._id }, game)
                        return game
                    } else return game
                } else throw new Error('Game is already full')
            } else
                throw new Error(
                    `Game with id ${gameId} not found or already started`
                )
        } else throw new Error('Token not valid')
    } else throw new Error('No GameId found')
}

export async function leaveGame(req: Request) {
    const gameId = req.params.id
    if (gameId) {
        const game = await getGameById(gameId)
        const player = extractUserFromToken(req)
        if (player) {
            if (game && !game.started && !game.finished) {
                if (game.players.some((p) => p.userid == player.userid)) {
                    if (game.host.userid !== player.userid) {
                        game.players = game.players.filter(
                            (p) => p.userid !== player.userid
                        )
                        await Game.replaceOne({ _id: game._id }, game)
                        return game
                    } else
                        throw new Error(
                            'Host cannot leave game. Delete game instead.'
                        )
                } else return game
            } else
                throw new Error(
                    `Game with id ${gameId} not found or already started`
                )
        } else throw new Error('Token not valid')
    } else throw new Error('No GameId found')
}

export async function removeGame(req: Request) {
    const gameId = req.params.id
    if (gameId) {
        const game = await getGameById(gameId)
        const host = extractUserFromToken(req)
        if (host) {
            if (game && !game.started) {
                if (game.host.userid == host.userid) {
                    return await Game.findByIdAndRemove(gameId)
                } else throw new Error('This Player is not host of this game.')
            } else
                throw new Error(
                    `Game with id ${gameId} not found or already started`
                )
        } else throw new Error('Token not valid')
    } else throw new Error('No GameId found')
}

export async function startGame(req: Request) {
    const gameId = req.params.id
    if (gameId) {
        const game = await getGameById(gameId)
        const host = extractUserFromToken(req)
        if (host) {
            if (game?.players.length == maxNumberOfPlayers) {
                if (game && !game.started && !game.finished) {
                    if (game.host.userid == host.userid) {
                        //* updates game state in the database (playersInGame, started)
                        game.playersInGame = game.players
                        game.started = true
                        await Game.replaceOne({ _id: game._id }, game)
                        return game
                    } else throw new Error('This Player is not host of this game.')
                } else
                    throw new Error(
                        `Game with id ${gameId} not found or already started/finished`
                    )
            } else throw new Error('Game is not full yet. Wait for more players.')
        } else throw new Error('Token not valid')
    } else throw new Error('No GameId found')
}

//* called when a player loses the game, winner never calls an endpoint
export async function loseGame(req: Request) {
    const gameId = req.params.id
    if (gameId) {
        const game = await getGameById(gameId)
        const player = extractUserFromToken(req)
        if (player) {
            if (game && !game.finished && game.started) {
                if (game.playersInGame.some((p) => p.userid == player.userid)) {
                    game.playersInGame = game.playersInGame.filter((p) => p.userid != player.userid)

                    if (game.playersInGame.length == 1) {
                        game.finished = true
                        game.winner = game.playersInGame[0];
                        game.playersInGame = [];
                    }

                    await replaceGame(game);
                    return game

                } else throw new Error('This Player is not in this game.')
            } else
                throw new Error(
                    `Game with id ${gameId} not found or already finished/not started`
                )
        } else throw new Error('Token not valid')
    } else throw new Error('No GameId found')
}   
