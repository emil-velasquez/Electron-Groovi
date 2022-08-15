import "../../styles/home_page/VideoCardStyle.css"

import React, { useState, useEffect } from "react"

import Video from "../../models/video"

import ProfileBanner from "./ProfileBanner"

type videoCardProps = {
    videoID: string
}

function VideoCard(props: videoCardProps) {
    const [curVideo, setCurVideo] = useState<Video | null>(null);

    /**
     * Grab the video information to build video card
     */
    useEffect(() => {
        const loadVideo = async () => {
            const videoInfo: Video = await window.videoAPI.getVideo(props.videoID);
            setCurVideo(prevVideo => videoInfo);
        }
        loadVideo();
    }, [])

    if (curVideo === null) {
        return (<div />);
    } else {
        return (
            <div className="video-card">
                <img className="video-thumbnail" src={curVideo.thumbnailHostID} alt="video thumbnail" />
                <p className="video-info">{curVideo.videoName}</p>
                <ProfileBanner userID={curVideo.choreographerID.toString()} size={15} />
                <p className="song-info">{curVideo.songName}</p>
                <p className="song-info">{curVideo.artistName}</p>
            </div>
        )
    }
}

export default VideoCard;