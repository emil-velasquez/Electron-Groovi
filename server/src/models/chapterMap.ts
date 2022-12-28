import { ObjectId } from "mongodb";

export default interface ChapterMap {
    [key: string]: ObjectId;
}