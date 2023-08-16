import User from '../model/userModel.js'
import { createHash, generateJWT } from '../middleware/auth.js'
import { IPayload, IUser, SignUpUser } from '../index.js'
import crypto from 'crypto'
import { redis_connection } from '../middleware/redis.js'

export async function loginUserAsync(body: SignUpUser): Promise<string> {
    let { username, password } = body
    if (!username || !password) {
        throw new Error('Bad request')
    }
    const user = await checkUserExistence(username)
    if (!user) {
        throw new Error("User doesn't exists!")
    } else if (user.password == createHash(user.salt, password)) {
        try {
            return generateJWT(user)
        } catch (error) {
            throw error
        }
    } else {
        throw new Error("Password doesn't match")
    }
}

export async function createUserAsync(body: SignUpUser): Promise<string> {
    let { username, password } = body
    if (!username || !password) {
        throw new Error('Bad request')
    }
    const userExistence = await checkUserExistence(username)
    if (userExistence) {
        throw new Error('User with this username already exists}')
    } else {
        try {
            let salt = crypto.randomUUID()
            const user = new User({
                username: username,
                salt: salt,
                password: createHash(salt, password),
                createdDate: new Date(),
            })
            await user.save()
            return generateJWT(user)
        } catch (error) {
            throw error
        }
    }
}

export async function getOneUserAsync(username: string): Promise<object> {
    if (!username) {
        throw new Error('Bad request')
    }
    const user = await checkUserExistence(username)
    if (!user) {
        throw new Error("User doesn't exists!")
    } else {
        return user
    }
}

async function checkUserExistence(username: string): Promise<null | IUser> {
    let existingUser
    try {
        existingUser = <IUser>await User.findOne({ username: username })
    } catch (error) {
        throw error
    }
    if (!existingUser) {
        return null
    } else {
        return existingUser
    }
}

export async function logoutOneUserAsync(payload: IPayload): Promise<void> {
    const { username, token } = payload
    if (username == null) {
        throw new Error('Bad request')
    }
    const userExistence = checkUserExistence(username)
    if (!userExistence) {
        throw new Error("User doesn't exist!")
    } else {
        const key = `key_${token}`
        await redis_connection.set(key, token!)
    }
}
