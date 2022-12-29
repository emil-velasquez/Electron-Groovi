import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { chapterListCollection } from "../services/chapterListsConnection";

export const chapterListRouter = express.Router();
chapterListRouter.use(express.json());

/**
 * If found, returns the chapter list with a certain ObjectId
 */
chapterListRouter.get("/getChapterList", async (req: Request, res: Response) => {
    try {
        const chapterListResult = await chapterListCollection.findOne({ _id: new ObjectId(req.body.id) });
        if (chapterListResult) {
            res.json({ message: "Success", chapterListInfo: chapterListResult });
        } else {
            res.json({ message: `Failure: Couldn't find chapter list with id ${req.body.id}` })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})