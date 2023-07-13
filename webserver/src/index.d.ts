import {Request} from "express";
import {JwtPayload} from "jsonwebtoken";
import { Query } from 'express-serve-static-core';


export interface TypedRequest<T extends Query, U> extends Express.Request {
    body: U,
    query: T
}
export interface TypedRequestQuery<T extends Query> extends Request {
    query: T
}

export interface TypedRequestBody<T> extends Request {
    body: T
}
export interface CustomRequest extends Request {
    tokenPayload: string | JwtPayload | undefined;
}

export interface IUser {
    username: string;
    password: string;
    createdDate: Date;
}
