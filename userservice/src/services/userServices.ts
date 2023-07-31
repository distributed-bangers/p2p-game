import User from '../model/userModel.js'
import { createHash, generateJWT } from '../middleware/auth.js'
import { IPayload, IUser } from '../index.js'
import crypto from 'crypto'
import { redis_connection } from '../middleware/redis.js'

export async function loginUserAsync(body: any) {
    let { username, password } = body
    if (!username || !password) {
        throw new Error('Bad request')
    }
    const user = await checkUserExistence({ username: username })
    if (!user) {
        throw new Error("User doesn't exists!")
    } else if (user.password == createHash(user.salt, password)) {
        try {
            const token = generateJWT(user)
            return token!
        } catch (error) {
            throw error
        }
    } else {
        throw new Error("Password doesn't match")
    }
}

export async function createUserAsync(body: any): Promise<string> {
    let { username, password } = body
    console.log(body)
    if (!username || !password) {
        throw new Error('Bad request')
    }
    const userExistence = await checkUserExistence({ username: username })
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
            const token = generateJWT(user)
            return token!
        } catch (error) {
            throw error
        }
    }
}

export async function getOneUserAsync(id: string): Promise<object> {
    if (!id) {
        throw new Error('Bad request')
    }
    const user = await checkUserExistence({ _id: id })
    if (!user) {
        throw new Error("User doesn't exist!")
    } else {
        return user
    }
}

async function checkUserExistence(obj: object): Promise<null | IUser> {
    let existingUser
    try {
        existingUser = <IUser>await User.findOne(obj)
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
    const { userId, token } = payload
    if (userId == null) {
        throw new Error('Bad request')
    }
    const userExistence = checkUserExistence({ _id: userId })
    if (!userExistence) {
        throw new Error("User doesn't exist!")
    } else {
        const key = `key_${token}`
        await redis_connection.set(key, token!)
    }
}
