import axios from "axios";

import { getAccessToken, refreshTokens } from "./authService";
import { expressDomain } from "../env_variables.json"

import { ChapterType } from "../models/chapterTypes";

/**
 * Returns the Chapter List with the id
 * @param listID: string of the ObjectId of the Chapter List to find
 * @returns: all the data mongodb of the chapter list if found
 */
const getChapterListInfo = async (listID: string) => {
    const getChapterListOptions = {
        method: "GET",
        url: `${expressDomain}/chapterList/getChapterList`,
        data: {
            id: listID
        }
    }

    const chapterListResult = await axios(getChapterListOptions);
    if (chapterListResult.data.message === "Success") {
        return chapterListResult.data.chapterListInfo;
    } else {
        console.log(`Something went wrong when getting chapter list with id ${listID}`);
        console.log(chapterListResult.data.message);
    }
}

/**
 * Inserts a brand new ChapterList document associated with the user
 */
const insertNewChapterList = async (userId: string) => {
    const chapterListResult = await insertNewChapterListBody(userId);
    if (chapterListResult.data.message === "Success") {
        return chapterListResult.data.listId;
    } else {
        refreshTokens();
        const chapterListResult = await insertNewChapterListBody(userId);
        if (chapterListResult.data.message === "Success") {
            return chapterListResult.data.listId;
        } else {
            console.log("Failed to insert new chapter list")
            console.log(chapterListResult.data.message);
        }
    }
}

const insertNewChapterListBody = async (userId: string) => {
    const accessToken = getAccessToken();
    const insertNewChapterListOptions = {
        method: "POST",
        url: `${expressDomain}/chapterList/createNewChapterList`,
        headers: { "Authorization": `Bearer ${accessToken}` },
        data: {
            userId: userId
        }
    }

    const chapterListResult = await axios(insertNewChapterListOptions);
    return chapterListResult;
}

/**
 * Modifies an existing chapter list's curMaxID
 */
const modifyChapterCurMaxID = async (userId: string, listId: string, newMaxId: number) => {
    const result = await modifyChapterCurMaxIDBody(userId, listId, newMaxId);
    if (result.data.message === "Success") {
        console.log("Successfully updated ChapterList CurMaxID");
    } else {
        refreshTokens();
        const result = await modifyChapterCurMaxIDBody(userId, listId, newMaxId);
        if (result.data.message === "Success") {
            console.log("Successfully updated ChapterList CurMaxID")
        } else {
            console.log("ModifyCurMax: No access");
            console.log(result.data.message);
        }
    }
}

const modifyChapterCurMaxIDBody = async (userId: string, listId: string, newMaxId: number) => {
    const accessToken = getAccessToken();
    const modifyOptions = {
        method: "PUT",
        url: `${expressDomain}/chapterList/modifyChapterCurMaxID`,
        headers: { "Authorization": `Bearer ${accessToken}` },
        data: {
            userId: userId,
            listId: listId,
            newMaxId: newMaxId
        }
    }

    const result = await axios(modifyOptions);
    return result;
}

/**
 * Modifies the chapters in a ChapterList
 */
const modifyChapterList = async (userId: string, listId: string, newChapters: ChapterType[]) => {
    const result = await modifyChapterListBody(userId, listId, newChapters);
    if (result.data.message === "Success") {
        console.log("Succesfully updated chapters")
    } else {
        refreshTokens();
        const result = await modifyChapterListBody(userId, listId, newChapters);
        if (result.data.message === "Success") {
            console.log("Successfully updated chapters");
        } else {
            console.log("ModifyChapterList: No access");
            console.log(result.data.message);
        }
    }
}

const modifyChapterListBody = async (userId: string, listId: string, newChapters: ChapterType[]) => {
    const accessToken = getAccessToken();
    const modifyOptions = {
        method: "PUT",
        url: `${expressDomain}/chapterList/modifyChapterList`,
        headers: { "Authorization": `Bearer ${accessToken}` },
        data: {
            userId: userId,
            listId: listId,
            newChapters: newChapters
        }
    }

    const result = await axios(modifyOptions);
    return result;
}

export { getChapterListInfo, insertNewChapterList, modifyChapterCurMaxID, modifyChapterList }