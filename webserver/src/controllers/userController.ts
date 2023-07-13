import {createUserAsync, getOneUserAsync, loginUserAsync} from "../services/userServices";
import {Request, Response} from "express";
import {IUser, TypedRequestQuery} from "../index";


export const signIn = async (req:Request, res: Response) => {
    try {
        const token = await createUserAsync(req.body);
        res.status(201).json({
            status: "success",
            token: token
        });
    } catch (error: any) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        })
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const token = await loginUserAsync(req.body);
        res.status(201).json({
            status: "success",
            token: token
        });
    } catch (error: any) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        })}
};

export const getOneUser = async(req :TypedRequestQuery<{id:string}>, res: Response):Promise<void> => {
    try {
        console.log(req.query.id)
        const user: IUser = <IUser>await getOneUserAsync(req.query.id);
        res.status(201).json({
            status: "success",
            username: user.username
        });
    } catch (error: any) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        })}
};