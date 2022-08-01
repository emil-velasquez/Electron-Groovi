import { ObjectId } from "mongodb";

export default interface Video {
    id?: ObjectId,
    videoName: string,
    choreographerID: ObjectId,
    songName: string,
    artistName: string,
    videoHostID: string,
    thumbnailHostID: string
}