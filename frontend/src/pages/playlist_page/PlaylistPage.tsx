import "./PlaylistPageStyle.css"

import { useParams } from "react-router-dom"

import { getPlaylist } from "../../data/playlists"

function PlaylistPage() {
    let params = useParams();

    return (
        <div>
            <p>Playlist Page: {getPlaylist(params.playlistID)?.name}</p>
        </div>
    )
}

export default PlaylistPage