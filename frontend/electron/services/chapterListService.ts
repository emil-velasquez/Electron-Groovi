import axios from "axios";

import { expressDomain } from "../env_variables.json"

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

export { getChapterListInfo }