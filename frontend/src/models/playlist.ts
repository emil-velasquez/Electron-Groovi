import { ObjectId } from "mongodb";

export default interface Playlist {
    _id?: ObjectId,
    name: string,
    ownerID: ObjectId,
    pictureHostID: string,
    videoIDs: ObjectId[]
}