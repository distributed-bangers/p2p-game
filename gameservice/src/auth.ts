import { NextFunction, Request, Response } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import { jrestStatus, responseStatus } from './constants/constants.js'
import config from 'config'

export async function authenticateJWT(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization
    const accessTokenSecret: Secret = <string>config.get('token_secret')

    try {
        if (authHeader) {
            const token = authHeader.split(' ')[1]
            await jwt.verify(token, accessTokenSecret)
            next()
        } else throw new Error('No authorization header found')
    } catch (error: any) {
        return res.status(responseStatus.Unauthorized).json({
            status: jrestStatus.fail,
            message: error.message,
        })
    }
}
