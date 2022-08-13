import axios from "axios";

import { expressDomain } from "../env_variables.json"

/**
 * Returns the video info of the video at videoID
 * @param videoID : string of the ObjectId of the video to find
 * @returns :All the data mongodb has of the video if found, otherwise console.log an error
 */
const getVideoInfo = async (videoID: string) => {
    const getVideoOptions = {
        method: "POST",
        url: `${expressDomain}/playlist/getVideo`,
        data: {
            id: videoID
        }
    }

    const videoResult = await axios(getVideoOptions);
    if (videoResult.data.message === "Success") {
        return videoResult.data.videoInfo;
    } else {
        console.log(`Something went wrong when getting video with id ${videoID}`);
        console.log(videoResult.data.message);
    }
}

export { getVideoInfo }