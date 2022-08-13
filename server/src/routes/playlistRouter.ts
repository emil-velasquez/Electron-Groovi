import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { playlistCollection } from "../services/playlistConnection";

export const playlistRouter = express.Router();
playlistRouter.use(express.json());

/**
 * If found, returns the playlist with a certain ObjectId
 */
playlistRouter.post("/getPlaylist", async (req: Request, res: Response) => {
    try {
        const playlistResult = await playlistCollection.findOne({ _id: new ObjectId(req.body.id) });
        if (playlistResult) {
            res.json({ message: "Success", playlistInfo: playlistResult })
        } else {
            res.json({ message: `Failure: Couldn't find playlist with id ${req.body.id}` })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})