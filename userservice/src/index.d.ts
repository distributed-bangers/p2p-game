import { Request } from 'express'
import { Query } from 'express-serve-static-core'
import mongoose from 'mongoose'

export {}
export interface TypedRequest<T extends Query, U> extends CustomReq {
    body: U
    query: T
}

export interface TypedRequestQuery<T extends Query> extends CustomReq {
    query: T
}

export interface TypedRequestBody<T> extends CustomReq {
    body: T
}

export interface CustomReq extends Request {
    t_payload?: IPayload
}

export interface IUser {
    _id: mongoose.Types.ObjectId
    username: string
    salt: string
    password: string
    createdDate: Date
}
export interface IPayload {
    userId: string
    username: string
    iat: number
    exp: number
    token?: string
}
