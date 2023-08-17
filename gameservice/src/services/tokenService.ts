import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Token } from '..'
import { IUser } from '../models/models'
import config from 'config'

export function extractUserFromToken(req: Request) {
    if (req.headers.authorization) {
        const jwtSecret = <string>config.get('token_secret')
        const encToken = req.headers.authorization.split(' ')[1]
        const decToken = <Token>jwt.verify(encToken, jwtSecret)
        return <IUser>{ userid: decToken.userid, username: decToken.username }
    } else throw new Error('Authorization header empty')
}
