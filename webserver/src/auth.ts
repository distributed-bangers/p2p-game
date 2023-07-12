import {NextFunction, Request, Response} from "express";
import  jwt, {Secret,JwtPayload} from "jsonwebtoken";
import crypto from "crypto";

interface CustomRequest extends Request {
    payload: string | JwtPayload | undefined;
}
 export const authenticateJWT = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    const accessTokenSecret:Secret = process.env.TOKEN_SECRET!
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, accessTokenSecret!, (err, payload) => {
            if (err) {
                return res.sendStatus(403);
            }
            (req as CustomRequest).payload = payload;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export const generateJWT = (username:string) : string =>{
    const accessTokenSecret:Secret = process.env.TOKEN_SECRET!
    return jwt.sign({username: username},accessTokenSecret,{
        expiresIn: "1 days"
    })
}

export function createHash(password:string):string{
    return crypto.createHash("sha256",).update(password,"utf-8").digest("hex")
}