import { NextFunction, Request, Response } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import crypto from 'crypto'
import { CustomRequest, IUser } from './index.js'
import c from 'config'

export const authenticateJWT = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization
    const accessTokenSecret: Secret = c.get("token_secret")!
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, accessTokenSecret!, (err, payload) => {
            if (err) {
                return res.sendStatus(401)
            }
            ;(req as CustomRequest).tokenPayload = payload
            next()
        })
    } else {
        res.sendStatus(401)
    }
}

export const generateJWT = (user: IUser): string => {
    const accessTokenSecret: Secret =c.get("token_secret")!
    return jwt.sign(
        { userid: user._id.toString(), username: user.username },
        accessTokenSecret,
        {
            expiresIn: '1 days',
        }
    )
}

export function createHash(salt: string, password: string): string {
    return crypto
        .createHash('sha256')
        .update(salt.concat(password), 'utf-8')
        .digest('hex')
}
