import { NextFunction, Request, Response } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import crypto from 'crypto'
import { CustomReq, IPayload, IUser } from '../index.js'
import c from 'config'
import { redis_connection } from './redis.js'

/**
 * Checks if the JWT is valid and jwt is not in the list of revoked JWT
 * @param req - is a modified request
 * @param res - is a HTTP Response
 * @param next - next function of Express
 */
export async function authenticateJWT(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization
    const accessTokenSecret: Secret = c.get('token_secret')!
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        const inDenyList = await redis_connection.get(`key_${token}`)
        if (inDenyList) {
            res.status(401).send({
                message: 'JWT rejected',
            })
        }
        try {
            const payload: IPayload = jwt.verify(
                token,
                accessTokenSecret!
            ) as IPayload
            payload.token = token
            ;(req as CustomReq).t_payload = payload
            next()
        } catch (err: any) {
            return res.status(401).send({
                message: err.message,
            })
        }
    } else {
        res.status(401).send({
            message: 'No token provided',
        })
    }
}

/**
 * generates the JWT for the logged-in and just signed-in users
 * @param user - user object
 */
export const generateJWT = (user: IUser): string => {
    const accessTokenSecret: Secret = c.get('token_secret')!
    return jwt.sign(
        { userid: user._id.toString(), username: user.username },
        accessTokenSecret,
        {
            expiresIn: '1 days',
        }
    )
}

/**
 * creates a hash with the salt process
 * @param salt - salt for the user
 * @param password - password of the user
 */
export function createHash(salt: string, password: string): string {
    return crypto
        .createHash('sha256')
        .update(salt.concat(password), 'utf-8')
        .digest('hex')
}
