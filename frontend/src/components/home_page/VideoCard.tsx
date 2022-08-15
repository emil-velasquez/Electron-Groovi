import "../../styles/home_page/VideoCardStyle.css"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

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
                <Link className="video-link" to={`/videoinfo/${curVideo._id?.toString()}`}>
                    <img className="video-thumbnail" src={curVideo.thumbnailHostID} alt="video thumbnail" />
                    <p className="video-info">{curVideo.videoName}</p>
                </Link>
                <ProfileBanner userID={curVideo.choreographerID.toString()} size={15} />
                <Link className="video-link" to={`/videoinfo/${curVideo._id?.toString()}`}>
                    <p className="song-info">{curVideo.songName}</p>
                    <p className="song-info">{curVideo.artistName}</p>
                </Link>
            </div>
        )
    }
}

export default VideoCard;