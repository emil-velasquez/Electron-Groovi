import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ChapterType } from "../models/chapterList";
import { chapterListCollection } from "../services/chapterListsConnection";
import { userCollection } from "../services/userConnection";

import { checkJwt } from "./middleware";

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

/**
 * Creates a brand new ChapterList document for the user
 */
chapterListRouter.post("/createNewChapterList", checkJwt, async (req: Request, res: Response) => {
    try {
        const posUser = await userCollection.findOne({ authId: req.auth.payload.sub })
        if (posUser._id.toString() === req.body.userId) {
            const newChapterList = {
                ownerId: new ObjectId(req.body.userId),
                curMaxID: 0,
                chapters: [] as ChapterType[]
            }
            const newId = await chapterListCollection.insertOne(newChapterList);
            res.json({ message: "Success", listId: newId.insertedId.toString() })
        } else {
            res.json({ message: "Failure: No permission to make this document" })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})

/**
 * Modifies the ChapterList at listId to contain a new maxID
 */
chapterListRouter.put("/modifyChapterCurMaxID", checkJwt, async (req: Request, res: Response) => {
    try {
        const posUser = await userCollection.findOne({ authId: req.auth.payload.sub });
        if (posUser._id.toString() === req.body.userId) {
            const filter = { _id: new ObjectId(req.body.listId) };
            const update = {
                $set: {
                    curMaxID: req.body.newMaxId
                }
            };
            const result = await chapterListCollection.updateOne(filter, update);
            res.json({ message: "Success" })
        } else {
            res.json({ message: "Failure: No permission to modify this document" })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})

/**
 * Modifies the ChapterList at listId to contain a new chapters array
 */
chapterListRouter.put("/modifyChapterList", checkJwt, async (req: Request, res: Response) => {
    try {
        const posUser = await userCollection.findOne({ authId: req.auth.payload.sub });
        if (posUser._id.toString() === req.body.userId) {
            const filter = { _id: new ObjectId(req.body.listId) };
            const update = {
                $set: {
                    chapters: req.body.newChapters
                }
            };

            const result = await chapterListCollection.updateOne(filter, update);
            res.json({ message: "Success" })
        } else {
            res.json({ message: "Failure: No permission to modify this document" })
        }
    } catch (error) {
        res.json({ message: "Failure: " + error })
    }
})