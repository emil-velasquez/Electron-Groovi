import "./PlaylistPageStyle.css"

import { useParams } from "react-router-dom"

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