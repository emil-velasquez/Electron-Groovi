import axios from "axios";

import { expressDomain } from "../env_variables.json"

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

export { getUserInfo }