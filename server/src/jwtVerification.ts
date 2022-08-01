//https://github.com/SalarC123/Classius/blob/main/src/server/verifyJWT.js
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response } from "express";
import { IUserAuthRequest } from "./interfaces/IUserAuthRequest";

const verifyJWT = (req: IUserAuthRequest, res: Response, next: any) => {
    const token = (req.headers["x-access-token"] as string)?.split(" ")[1];

    if (token) {
        jwt.verify(token, process.env.PASSPORT_SECRET, (err, decoded) => {
            if (err) {
                return res.json({ message: "Failed to Authenticate", isLoggedIn: false });
            }
            req.user = { id: "", username: "" };
            req.user.id = (decoded as JwtPayload).id;
            req.user.username = (decoded as JwtPayload).username;
            next();
        })
    } else {
        res.json({ message: "Incorrect token given", isLoggedIn: false })
    }
}

export default verifyJWT;