import express, { Request, Response } from "express";
import axios from "axios";

import { userCollection } from "../services/userConnection";
import User from "../models/user";

import { auth0Domain, clientId, clientSecret } from "../../env_variables.json";
import { checkJwt } from "./middleware";
import { ObjectId } from "mongodb";

export const userRouter = express.Router();
userRouter.use(express.json());


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
                    authId: req.auth.payload.sub,
                    username: username,
                    name: name,
                    playlistIDs: [],
                    profilePicHostID: "https://res.cloudinary.com/projectd/image/upload/v1659199898/ProfilePicture_rv3oah",
                    bio: "",
                    chapterMap: {}
                }
                await userCollection.insertOne(newUser)
                dbUser = await userCollection.findOne({ username: username });
            }

            delete dbUser.authId;
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
userRouter.get("/getUser", async (req: Request, res: Response) => {
    try {
        const userResult = await userCollection.findOne({ _id: new ObjectId(req.body.id) });
        if (userResult) {
            delete userResult.authId;
            res.json({ message: "Success", userInfo: userResult });
        } else {
            res.json({ message: `Failure: Couldn't find user with id ${req.body.id}` });
        }
    } catch (error) {
        res.json({ message: "Failure: " + error });
    }
})

/**
 * If found and validated, modify a user's chapterMap
 */
userRouter.put("/modifyChapterMap", checkJwt, async (req: Request, res: Response) => {
    try {
        const posUser = await userCollection.findOne({ authId: req.auth.payload.sub })
        if (posUser._id.toString() === req.body.userId) {
            const filter = { _id: new ObjectId(req.body.userId) };
            const update = {
                $set: {
                    chapterMap: req.body.newMap
                }
            };
            const result = await userCollection.updateOne(filter, update);
            res.json({ message: "Success" })
        } else {
            res.json({ message: "Failure: No permission to modify this document" })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})