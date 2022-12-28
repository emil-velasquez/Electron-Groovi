import { ObjectId } from "mongodb";
import ChapterMap from "./chapterMap";

export default interface User {
    id?: ObjectId,
    authId: string,
    username: string,
    name: string,
    playlistIDs: ObjectId[],
    profilePicHostID: string,
    bio: string,
    chapterMap: ChapterMap
}