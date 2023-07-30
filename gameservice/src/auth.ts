import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
dotenv.config({ path: '../../src/config.env' })
import jwt, { Secret } from 'jsonwebtoken'
import { jrestStatus, responseStatus } from './constants/constants'
import { error } from 'console'

export async function authenticateJWT(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization
    const accessTokenSecret: Secret = process.env.TOKEN_SECRET!

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
