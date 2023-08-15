import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { Query } from 'express-serve-static-core'
import mongoose from 'mongoose'

export interface TypedRequest<T extends Query, U> extends Express.Request {
    body: U
    query: T
}

export interface TypedRequestQuery<T extends Query> extends Request {
    query: T
}

export interface TypedRequestBody<T> extends Request {
    body: T
}

export interface CustomRequest extends Request {
    tokenPayload: string | JwtPayload | undefined
}

export interface IUser {
    _id: mongoose.Types.ObjectId
    username: string
    salt: string
    password: string
    createdDate: Date
}

export interface SignUpUser {
    username: string
    password: string
}
