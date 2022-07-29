import "../../styles/home_page/VideoCardStyle.css"

import { useState } from "react"
import { Link } from "react-router-dom"

import { getVideo } from "../../data/videos"
import { getUser } from "../../data/users"

type videoCardProps = {
    videoID: string
}

function VideoCard(props: videoCardProps) {
    const [video, setVideo] = useState(getVideo(props.videoID))
    const [choreographer, setChoreographer] = useState(getUser(getVideo(props.videoID)?.choreographerID));

    if (video !== undefined && choreographer !== undefined) {
        return (
            <div className="video-card">
                <img className="video-thumbnail" src={`./videos/${video.thumbnail}`} alt={`${video.videoName} thumbnail`} />
                <p className="video-info">{video.videoName}</p>
                <p className="video-info">{choreographer.name}</p>
                <p className="video-info">{video.songName}</p>
                <p className="video-info">{video.artistName}</p>
            </div>
        )
    } else {
        return (
            <div>
                Can't find video
            </div>
        )
    }
}

export default VideoCard;