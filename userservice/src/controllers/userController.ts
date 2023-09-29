import {
    createUserAsync,
    getOneUserAsync,
    loginUserAsync,
    logoutOneUserAsync,
} from '../services/userServices.js'
import { Response } from 'express'
import {
    IUser,
    SignUpUser,
    TypedRequestBody,
    TypedRequestQuery,
    CustomReq,
} from '../index.js'


/**
 * SignUp Endpoint to create new user
 * @param req - is a modified request
 * @param res - is HTTP Response
 */
export const signUp = async (
    req: TypedRequestBody<SignUpUser>,
    res: Response
) => {
    try {
        const token = await createUserAsync(req.body)
        res.status(201).json({
            status: 'success',
            token: token,
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

/**
 * Log in Endpoint to log in a user
 * @param req - is a modified HTTP Request
 * @param res - is HTTP Response
 */
export const login = async (
    req: TypedRequestBody<SignUpUser>,
    res: Response
) => {
    try {
        const token = await loginUserAsync(req.body)
        res.status(201).json({
            status: 'success',
            token: token,
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

/**
 * Endpoint to get one single user
 * @param req - is a modified request
 * @param res - is a HTTP Response
 */
export const getOneUser = async (
    req: TypedRequestQuery<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const user: IUser = <IUser>await getOneUserAsync(req.query.id)
        res.status(201).json({
            status: 'success',
            user: {
                id: user._id,
                username: user.username,
                createdDate: user.createdDate,
            },
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

/**
 * Endpoint for logout process, it also adds the jwt for revocation
 * @param req - is a modified request
 * @param res - is a HTTP Response
 */
export const logoutUser = async (
    req: CustomReq,
    res: Response
): Promise<void> => {
    try {
        await logoutOneUserAsync(req.t_payload!)
        res.status(201).json({
            status: 'success',
            message: 'Token Invalidated',
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}
