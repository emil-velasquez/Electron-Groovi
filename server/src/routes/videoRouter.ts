import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { videoCollection } from "../services/videoConnection";

export const videoRouter = express.Router();
videoRouter.use(express.json());

/**
 * If found, returns the video with a certain ObjectId
 */
videoRouter.get("/getVideo", async (req: Request, res: Response) => {
    try {
        const videoResult = await videoCollection.findOne({ _id: new ObjectId(req.body.id) });
        if (videoResult) {
            res.json({ message: "Success", videoInfo: videoResult });
        } else {
            res.json({ message: `Failure: Couldn't find video with id ${req.body.id}` });
        }
    } catch (error) {
        res.json({ message: "Failure: " + error });
    }
})