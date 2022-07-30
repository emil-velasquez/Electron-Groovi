import { ObjectId } from "mongodb";

export default interface User {
    id: ObjectId,
    name: string,
    playlistIDs: ObjectId[],
    profilePicHostID: string
}