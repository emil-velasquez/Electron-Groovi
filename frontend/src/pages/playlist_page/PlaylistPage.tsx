import "./PlaylistPageStyle.css"

import { useParams } from "react-router-dom"

import { getPlaylist } from "../../data/playlists"

function PlaylistPage() {
    let params = useParams();

    return (
        <div className="playlist-page">
            <div className="header">

            </div>
            <div className="video-cards-section">

            </div>
        </div>
    )
}

export default PlaylistPage