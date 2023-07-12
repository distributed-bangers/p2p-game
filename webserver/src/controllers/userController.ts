import User from "../model/userModel";
import {createUserAsync, loginUserAsync} from "../services/userServices";
import {Request, Response} from "express";
import * as crypto from "crypto";


// export  async function createUserAsyncare(req:Request, res: Response):Promise<void> {
//     try {
//         const user = new User({
//             username: req.body.username,
//             password: crypto.createHash("sha256",).update(req.body.password,"utf-8").digest("hex"),
//             createdDate: new Date()
//         })
//         await user.save();
//
//         res.status(201).json({
//             status: "success",
//             token: generateJWT(user.username)
//         });
//     } catch (error: any) {
//         res.status(400).json({
//             status: "fail",
//             message: error.message,
//         }
//         );
//     }
// }

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