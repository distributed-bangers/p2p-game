import { prop, getModelForClass } from '@typegoose/typegoose'


import mongoose, { Document } from 'mongoose'



// class User {
//     @prop()
//     public userid?: string

//     @prop()
//     public username?: string
// }

// export class Game {
//     @prop({ required: true })
//     public name?: string

//     @prop({ required: true })
//     public host?: User

//     @prop({ required: true })
//     public players?: User[]

//     @prop({ required: true })
//     public started?: boolean

//     @prop({ required: true })
//     public finished?: boolean

//     @prop()
//     public highscore?: number
// }

// const GameModel = getModelForClass(Game)

// export default GameModel

export interface IUser {
    userid: string
    username: string
}

export interface IGame extends Document {
    name: string
    host: IUser
    players: IUser[]
    started: boolean
    finished: boolean
    highscore: number
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
        started: {
            type: Boolean,
            default: false,
        },
        finished: {
            type: Boolean,
            default: false,
        },
        highscore: Number,
    },
    { collection: 'games' }
)

//! Here: String is used to define the collection

export default mongoose.model<IGame>('Game', gameSchema)
