import axios from "axios";

import { getAccessToken, refreshTokens } from "./authService";
import { expressDomain } from "../env_variables.json"

import { ChapterMap } from "../models/chapterTypes";

/**
 * Returns the user info of the user at userID
 * @param userID : string of the ObjectId of the user to find
 * @returns : all the data mongodb has of the video if found, otherwise console.log an error
 */
const getUserInfo = async (userID: string) => {
    const getUserOptions = {
        method: "GET",
        url: `${expressDomain}/user/getUser`,
        data: {
            id: userID
        }
    }

    const userResult = await axios(getUserOptions);
    if (userResult.data.message === "Success") {
        return userResult.data.userInfo;
    } else {
        console.log(`Something went wrong when getting video with id ${userID}`);
        console.log(userResult.data.message);
    }
}

const modifyChapterMap = async (userId: string, newMap: ChapterMap) => {
    try {
        const result = await modifyChapterMapBody(userId, newMap);
        if (result.data.message === "Success") {
            console.log("Successfully updated chapter map")
        } else {
            refreshTokens();
            const result = await modifyChapterMapBody(userId, newMap);
            if (result.data.message === "Success") {
                console.log("Successfully updated chapter map")
            } else {
                console.log("Failed to update user's chapter map")
            }
        }
    } catch (error) {
        console.log("No access: " + error)
    }
}

const modifyChapterMapBody = async (userId: string, newMap: ChapterMap) => {
    const accessToken = getAccessToken();
    const modifyOptions = {
        method: "PUT",
        url: `${expressDomain}/user/modifyChapterMap`,
        headers: { "Authorization": `Bearer ${accessToken}` },
        data: {
            userId: userId,
            newMap: newMap
        }
    }

    const result = await axios(modifyOptions);
    return result;
}

export { getUserInfo, modifyChapterMap }