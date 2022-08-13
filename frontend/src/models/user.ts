import { ObjectId } from "mongodb";

export default interface User {
    _id?: ObjectId,
    username: string,
    name: string,
    playlistIDs: ObjectId[],
    profilePicHostID: string,
    bio: string
}