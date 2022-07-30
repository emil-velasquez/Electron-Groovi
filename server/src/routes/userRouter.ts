import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/contentConnection";

export const userRouter = express.Router();
userRouter.use(express.json());