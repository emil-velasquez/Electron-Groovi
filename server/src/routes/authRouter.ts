//Inspired by https://github.com/SalarC123/Classius/blob/main/src/server/routes/authRoutes.js
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

import { ObjectId } from "mongodb";
import { userCollection } from "../services/userConnection";
import User from "../models/user";
import { sessionCollection } from "../services/sessionConnection";
import Session from "../models/session";

import verifySession from "../sessionVerification";
import { IUserAuthRequest } from "../interfaces/IUserAuthRequest";

export const authRouter = express.Router();

/**
 * Allows the user to try to register
 * input: req.body = {username: string, password: string, name: string}
 * output: new user object inserted into userCollection
 */
authRouter.post("/register", async (req: Request, res: Response) => {
    const user = req.body;
    const takenUsername = await userCollection.findOne({ username: user.username.toLowerCase() })

    if (takenUsername) {
        return res.json({ message: "Username has already been taken" });
    } else {
        try {
            user.password = await bcrypt.hash(req.body.password, 10);

            const newUser: User = {
                username: user.username.toLowerCase(),
                password: user.password,
                name: user.name,
                playlistIDs: [],
                profilePicHostID: "ProfilePicture_rv3oah",
                bio: ""
            }

            const result = await userCollection.insertOne(newUser);

            result
                ? res.status(201).send(`Successfully created new user with id ${result.insertedId}`)
                : res.status(500).send("Failed to create new user");
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    }
})

/**
 * Allow the user to try to login
 * input: req.body = {username: string, password: string}
 * output: if successful, insert new session with unique id and username into sessionCollection
 * and return the sessionID to user
 */
authRouter.post("/login", (req: Request, res: Response) => {
    const userLoggingIn = req.body;

    if (!userLoggingIn) {
        return res.status(500).send("Server Error")
    }

    const sessionQuery = { username: userLoggingIn.username.toLowerCase() };
    userCollection.findOne(sessionQuery)
        .then(dbUser => {
            if (!dbUser) {
                return res.status(400).send("Invalid Username or Password")
            }
            bcrypt.compare(userLoggingIn.password, dbUser.password)
                .then(isCorrect => {
                    if (isCorrect) {
                        sessionCollection.findOne(sessionQuery)
                            .then(async (dbSession) => {
                                const newSessionToken = uuidv4();
                                if (!dbSession) {
                                    const newSession: Session = {
                                        sessionToken: newSessionToken,
                                        userID: dbUser._id
                                    }
                                    const result = await sessionCollection.insertOne(newSession);
                                    result
                                        ? res.json({ message: "Success", token: "Bearer " + newSessionToken })
                                        : res.status(500).send("Failed to create new session");

                                } else {
                                    const newValues = { $set: { sessionToken: newSessionToken } };
                                    const result = await sessionCollection.updateOne(sessionQuery, newValues);
                                    result
                                        ? res.json({ message: "Success", token: "Bearer " + newSessionToken })
                                        : res.status(500).send("Failed to create new session");
                                }
                            })
                    } else {
                        return res.status(400).send("Invalid Username or Password")
                    }
                })
        })
})

/**
 * Check if a user is logged in and authorized
 */
authRouter.get("/isUserAuth", verifySession, (req: IUserAuthRequest, res: Response) => {
    return res.json({ isLoggedIn: true, username: req.user.username })
})