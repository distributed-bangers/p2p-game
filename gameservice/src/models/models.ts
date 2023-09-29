import { prop, getModelForClass } from '@typegoose/typegoose'

import mongoose, { Document } from 'mongoose'


export interface IUser {
    userid: string
    username: string
}

export interface IGame extends Document {
    name: string
    host: IUser
    players: IUser[]
    playersInGame: IUser[]
    winner: IUser
    started: boolean
    finished: boolean
}

const gameSchema = new mongoose.Schema<IGame>(
    {
        name: {
            type: String,
            required: true,
        },
        host: {
            type: Object,
            required: true,
        },
        players: {
            type: [Object],
            required: true,
        },
        playersInGame: {
            type: [Object],
            default: [],
        },
        winner: {
            type: Object,
            default: null,
        },
        started: {
            type: Boolean,
            default: false,
        },
        finished: {
            type: Boolean,
            default: false,
        },
    },
    { collection: 'games' }
)

//! Here: String is used to define the collection

export default mongoose.model<IGame>('Game', gameSchema)
