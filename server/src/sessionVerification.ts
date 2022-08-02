//https://github.com/SalarC123/Classius/blob/main/src/server/verifyJWT.js
import { Response } from "express";
import { IUserAuthRequest } from "./interfaces/IUserAuthRequest";

import { sessionCollection } from "./services/sessionConnection";

const verifySession = (req: IUserAuthRequest, res: Response, next: any) => {
    const sessToken = (req.cookies["x-access-token"] as string)?.split(" ")[1];

    if (sessToken) {
        sessionCollection.findOne({ sessionToken: sessToken })
            .then(session => {
                if (!session) {
                    return res.json({ message: "Incorrect token given", isLoggedIn: false })
                }
                req.user = { userID: session.userID };
                next();
            })
    } else {
        res.json({ message: "Incorrect token given", isLoggedIn: false })
    }
}

export default verifySession;