import "./PlaylistPageStyle.css"

import { useState } from "react";
import { useParams, Link } from "react-router-dom"

import VideoCard from "../../components/home_page/VideoCard";

function PlaylistPage() {
    let params = useParams();

    return (
        <div className="playlist-page">
            <div className="header">
                <h1>Playlist Page</h1>
            </div>
            <div className="video-card-section">
            </div>
        </div>
    )
}

export default PlaylistPage