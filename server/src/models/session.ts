import { ObjectId } from "mongodb";

export default interface Session {
    id?: ObjectId,
    sessionToken: string,
    userID: ObjectId
}