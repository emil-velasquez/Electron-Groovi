import { ObjectId } from "mongodb";
import ChapterMap from "./chapterMap";

export default interface User {
    _id?: ObjectId,
    username: string,
    name: string,
    playlistIDs: ObjectId[],
    profilePicHostID: string,
    bio: string,
    chapterMap: ChapterMap
}