import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
dotenv.config({ path: '../../src/config.env' })
import jwt from 'jsonwebtoken'
import { Token } from '..'
import { IUser } from '../models/models'

export function extractUserFromToken(req: Request) {
    if (req.headers.authorization) {
        const jwtSecret = process.env.TOKEN_SECRET!
        const encToken = req.headers.authorization.split(' ')[1]
        const decToken = <Token>jwt.verify(encToken, jwtSecret)
        return <IUser>{ userid: decToken.userid, username: decToken.username }
    } else throw new Error('Authorization header empty')
}
