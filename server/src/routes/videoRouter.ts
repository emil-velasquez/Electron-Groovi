import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/contentConnection";

export const videoRouter = express.Router();
videoRouter.use(express.json());