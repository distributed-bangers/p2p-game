import User from '../model/userModel.js'
import { createHash, generateJWT } from '../middleware/auth.js'
import { IPayload, IUser, SignUpUser } from '../index.js'
import crypto from 'crypto'
import { redis_connection } from '../middleware/redis.js'

/**
 * checks for the valid credentials and return token if everything is okay
 * @param body - user object from the Request body
 */
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

/**
 * creates a new user if everything is okay
 * @param body - user object from Request body
 * @return Promise<srting> - returns token
 */
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

/**
 * returns the userdata for specific username
 * @param username - username of user to get the object
 */
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

/**
 * checks if the user with username already does exist
 * @param username - user's username
 * @return existingUser - returns user if there exists one
 */
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

/**
 * revokes the given token
 * @param payload - payload from the token
 */
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
