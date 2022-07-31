import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { videoCollection } from "../services/videoConnection";

export const videoRouter = express.Router();
videoRouter.use(express.json());