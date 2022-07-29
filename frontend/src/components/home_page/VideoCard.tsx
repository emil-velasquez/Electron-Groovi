import "../../styles/home_page/VideoCardStyle.css"

import { useState } from "react"

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
            <div>
                <img src={`./videos/${video.thumbnail}`} alt={`${video.videoName} thumbnail`} />
                <p>{video.videoName}</p>
                <p>{choreographer.name}</p>
                <p>{video.songName}</p>
                <p>{video.artistName}</p>
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