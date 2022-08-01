import { ObjectId } from "mongodb";

export default interface Playlist {
    id?: ObjectId,
    name: string,
    ownerID: ObjectId,
    pictureHostID: string,
    videoIDs: ObjectId[]
}