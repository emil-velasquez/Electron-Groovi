import "./PlaylistPageStyle.css"

import { useState } from "react";
import { useParams, Link } from "react-router-dom"

import VideoCard from "../../components/home_page/VideoCard";

import { getPlaylist } from "../../data/playlists"

function PlaylistPage() {
    let params = useParams();

    const [playlist, setPlaylist] = useState(getPlaylist(params.playlistID));

    return (
        <div className="playlist-page">
            <div className="header">
                <h1>{getPlaylist(params.playlistID)?.name}</h1>
            </div>
            <div className="video-card-section">
                {playlist?.videos.map((videoID) => <VideoCard videoID={videoID} />)}
            </div>
        </div>
    )
}

export default PlaylistPage