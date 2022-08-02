//https://github.com/SalarC123/Classius/blob/main/src/server/verifyJWT.js
import { Response } from "express";
import { IUserAuthRequest } from "./interfaces/IUserAuthRequest";

const verifySession = (req: IUserAuthRequest, res: Response, next: any) => {
    const sessionToken = (req.cookies["x-access-token"] as string)?.split(" ")[1];

    if (sessionToken) {
        // jwt.verify(token, process.env.PASSPORT_SECRET, (err, decoded) => {
        //     if (err) {
        //         return res.json({ message: "Failed to Authenticate", isLoggedIn: false });
        //     }
        //     req.user = { id: "", username: "" };
        //     req.user.id = (decoded as JwtPayload).id;
        //     req.user.username = (decoded as JwtPayload).username;
        //     next();
        // })

        //check if the session token is in the sessionCollection

        //if it is, set the username inside the user 
    } else {
        res.json({ message: "Incorrect token given", isLoggedIn: false })
    }
}

export default verifySession;