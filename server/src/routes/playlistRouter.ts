import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/contentConnection";

export const playlistRouter = express.Router();
playlistRouter.use(express.json());