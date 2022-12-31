//inspired by: https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm

import { ObjectId } from "mongodb";
import User from "../../models/user"
import ChapterMap from "../../models/chapterMap";

type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
    } : {
        type: Key;
        payload: M[Key];
    }
};

export enum Types {
    Login = "USER_LOGIN",
    UpdateMap = "UPDATE_CHAPTER_MAP"
}

type UserPayload = {
    [Types.Login]: {
        _id?: ObjectId,
        username: string,
        name: string,
        playlistIDs: ObjectId[],
        profilePicHostID: string,
        bio: string,
        chapterMap: ChapterMap
    }
}

export type UserActions = ActionMap<UserPayload>[keyof ActionMap<UserPayload>];

export const userReducer = (state: User, action: UserActions) => {
    switch (action.type.toString()) {
        case Types.Login:
            return ({
                ...state,
                _id: action.payload._id,
                username: action.payload.username,
                name: action.payload.name,
                playlistIDs: action.payload.playlistIDs,
                profilePicHostID: action.payload.profilePicHostID,
                bio: action.payload.bio,
                chapterMap: action.payload.chapterMap
            })
        case Types.UpdateMap:
            return ({
                ...state,
                chapterMap: action.payload.chapterMap
            })
        default:
            return state;
    }
}