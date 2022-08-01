//https://github.com/SalarC123/Classius/blob/main/src/server/verifyJWT.js
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

const verifyJWT = (req: Request, res: Response, next: any) => {
    const token = (req.headers["x-access-token"] as string)?.split(" ")[1];

    if (token) {
        jwt.verify(token, process.env.PASSPORT_SECRET, (err, decoded) => {
            if (err) {
                return res.json({ message: "Failed to Authenticate", isLoggedIn: false });
            }
            req.body = {};
            req.body.id = (decoded as JwtPayload).id;
            req.body.username = (decoded as JwtPayload).username;
            next();
        })
    } else {
        res.json({ message: "Incorrect token given", isLoggedIn: false })
    }
}

export default verifyJWT;