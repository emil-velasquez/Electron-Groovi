import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { playlistCollection } from "../services/playlistConnection";

export const playlistRouter = express.Router();
playlistRouter.use(express.json());