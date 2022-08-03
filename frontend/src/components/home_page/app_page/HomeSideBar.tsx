import "../../../styles/home_page/app_page/HomeSideBarStyle.css"

import { useState } from "react";
import { Link } from "react-router-dom";
import { getPlaylist } from "../../../data/playlists";
import { getUser } from "../../../data/users";

function HomeSideBar() {
    const [userPlaylists, setUserPlaylists] = useState(getUser("abcdef")?.playlists);


    return (
        <div className="side-bar">
            <Link className="side-bar-link" to="/playlist">
                <p>Home</p>
            </Link>
            <p>Trending</p>
            <p>Liked</p>
            <hr />
            {userPlaylists?.map((playlistID) => {
                return (
                    <Link className="side-bar-link" to={`/playlist/${playlistID}`}>
                        <p>{getPlaylist(playlistID)?.name}</p>
                    </Link>)
            })}
            <hr />
            <p>Subscribed</p>
        </div>
    )
}

export default HomeSideBar;