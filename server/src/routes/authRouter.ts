//https://github.com/SalarC123/Classius/blob/main/src/server/routes/authRoutes.js
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import { ObjectId } from "mongodb";
import { userCollection } from "../services/userConnection";
import User from "../models/user";

import verifyJWT from "../jwtVerification";

export const authRouter = express.Router();

/**
 * Allows the user to make an account 
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
 */
authRouter.post("/login", (req: Request, res: Response) => {
    const userLoggingIn = req.body;

    if (!userLoggingIn) {
        return res.status(500).send("Server Error")
    }

    userCollection.findOne({ username: userLoggingIn.username.toLowerCase() })
        .then(dbUser => {
            if (!dbUser) {
                return res.status(400).send("Invalid Username or Password")
            }
            bcrypt.compare(userLoggingIn.password, dbUser.password)
                .then(isCorrect => {
                    if (isCorrect) {
                        const payload = {
                            id: dbUser._id,
                            username: dbUser.username,
                        }
                        jwt.sign(
                            payload,
                            process.env.PASSPORT_SECRET,
                            { expiresIn: 86400 },
                            (err, token) => {
                                return res.json({ message: "Success", token: "Bearer " + token })
                            }
                        )
                    } else {
                        return res.status(400).send("Invalid Username or Password")
                    }
                })
        })
})

/**
 * Check if a user is logged in
 */
authRouter.get("/isUserAuth", verifyJWT, (req: Request, res: Response) => {
    return res.json({ isLoggedIn: true, username: req.body.username })
})