import "./PlaylistPageStyle.css"

import { useState } from "react";
import { useParams, Link } from "react-router-dom"

import VideoCard from "../../components/home_page/VideoCard";

import { getPlaylist } from "../../data/playlists"

function PlaylistPage() {
    let params = useParams();

    const [playlist, setPlaylist] = useState(getPlaylist(params.playlistID));

    /**
     * Creates a linked VideoCard component that shows basic information of the video and links
     * to the video information page for the video
     * @param videoID :string => for querying the database for the video to make the card for
     * @returns a Linked VideoCard component that links to the Video Info page for the video
     */
    const createVideoCard = (videoID: string) => {
        return (
            <div>
                <VideoCard videoID={videoID} />
            </div>
        )
    }

    return (
        <div className="playlist-page">
            <div className="header">
                <h1>{getPlaylist(params.playlistID)?.name}</h1>
            </div>
            <div className="video-cards-section">
                {playlist?.videos.map((video) => createVideoCard(video))}
            </div>
        </div>
    )
}

export default PlaylistPage