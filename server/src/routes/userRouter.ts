import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { userCollection } from "../services/userConnection";

export const userRouter = express.Router();
userRouter.use(express.json());