import { Request } from "express";

export interface IUserAuthRequest extends Request {
    user: {
        id: string,
        username: string
    }
}