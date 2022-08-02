import { Request } from "express";
import { ObjectId } from "mongodb";

export interface IUserAuthRequest extends Request {
    user: {
        userID: ObjectId
    }
}