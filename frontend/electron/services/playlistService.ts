import axios from "axios";
import { ObjectId } from "mongodb";

import { expressDomain } from "../env_variables.json"

/**
 * Returns the playlist info of the playlist at playlistID
 * @param playlistID : ObjectId of the playlist to find
 * @returns :All the data mongodb has of the playlist if found, otherwise console.log's an error
 */
const getPlaylistInfo = async (playlistID: string) => {
    const getPlaylistOptions = {
        method: "POST",
        url: `${expressDomain}/playlist/loadPlaylist`,
        data: {
            id: playlistID
        }
    }

    const playlistResult = await axios(getPlaylistOptions);
    if (playlistResult.data.message === "Success") {
        return playlistResult.data.playlistInfo;
    } else {
        console.log(`Something went wrong when getting playlist with id ${playlistID.toString()}`);
        console.log(playlistResult.data.message);
    }
}

export { getPlaylistInfo }