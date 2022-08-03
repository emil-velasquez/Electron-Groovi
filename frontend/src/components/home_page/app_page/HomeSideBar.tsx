import "../../../styles/home_page/app_page/HomeSideBarStyle.css"

import { useState } from "react";
import { Link } from "react-router-dom";

function HomeSideBar() {
    return (
        <div className="side-bar">
            <Link className="side-bar-link" to="/playlist">
                <p>Home</p>
            </Link>
            <p>Trending</p>
            <p>Liked</p>
            <hr />
            <p>Playlists</p>
            <hr />
            <p>Subscribed</p>
        </div>
    )
}

export default HomeSideBar;