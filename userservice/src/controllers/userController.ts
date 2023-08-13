import {
    createUserAsync,
    getOneUserAsync,
    loginUserAsync,
    logoutOneUserAsync,
} from '../services/userServices.js'
import { Request, Response } from 'express'
import { IUser, TypedRequestQuery, CustomReq } from '../index.js'

export const signIn = async (req: Request, res: Response) => {
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

export const login = async (req: Request, res: Response) => {
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
