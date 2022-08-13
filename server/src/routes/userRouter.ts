import express, { Request, Response } from "express";
import axios from "axios";
import { auth } from "express-oauth2-jwt-bearer";

import { userCollection } from "../services/userConnection";
import User from "../models/user";

import { auth0Domain, clientId, clientSecret, apiIdentifier } from "../../env_variables.json";
import { ObjectId } from "mongodb";

export const userRouter = express.Router();
userRouter.use(express.json());

/**
 * Middleware to be attached to any route that requires a valid authorization
 */
const checkJwt = auth({
    audience: apiIdentifier,
    issuerBaseURL: `https://${auth0Domain}/`
})

/**
 * When a user logins in, return their public data in MongoDB, creating a document for the user
 * if they aren't in the database
 * req: contains the user's auth0_id
 */
userRouter.post("/loadProfile", checkJwt, async (req: Request, res: Response) => {
    try {
        if (req.auth.payload.sub === req.body.id) {
            const mgmtOptions = {
                method: 'POST',
                url: `https://${auth0Domain}/oauth/token`,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                data: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: `${clientId}`,
                    client_secret: `${clientSecret}`,
                    audience: `https://${auth0Domain}/api/v2/`
                })
            }
            const mgmtResponse = await axios.request(mgmtOptions);
            const mgmtToken = mgmtResponse.data.access_token;
            const auth0_id = req.body.id;

            const userInfoOptions = {
                method: "GET",
                url: `https://${auth0Domain}/api/v2/users/${auth0_id}`,
                headers: { authorization: `Bearer ${mgmtToken}` }
            };
            const userInfoResponse = await axios.request(userInfoOptions);
            const username = userInfoResponse.data.username;
            const name = userInfoResponse.data.name;

            let dbUser = await userCollection.findOne({ username: username });
            if (!dbUser) {
                const newUser: User = {
                    username: username,
                    name: name,
                    playlistIDs: [],
                    profilePicHostID: "https://res.cloudinary.com/projectd/image/upload/v1659199898/ProfilePicture_rv3oah",
                    bio: ""
                }
                await userCollection.insertOne(newUser)
                dbUser = await userCollection.findOne({ username: username });
            }

            res.json({ message: "Success", profileInfo: dbUser })
        } else {
            res.json({ message: "Failure: Mismatched IDs" })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})

/**
 * If found, returns the user with a certain ObjectId
 */
userRouter.post("/getUser", async (req: Request, res: Response) => {
    try {
        const userResult = await userCollection.findOne({ _id: new ObjectId(req.body.id) });
        if (userResult) {
            res.json({ message: "Success", userInfo: userResult });
        } else {
            res.json({ message: `Failure: Couldn't find playlist with id ${req.body.id}` });
        }
    } catch (error) {
        res.json({ message: "Failure: " + error });
    }
})