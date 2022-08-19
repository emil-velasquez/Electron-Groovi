import "./VideoInfoPageStyle.css"

import { useState, useEffect } from "react";
import Video from "../../models/video";

import { Link } from "react-router-dom";

import ProfileBanner from "../../components/home_page/ProfileBanner";

import HistoryButtons from "../../components/home_page/HistoryButtons";
import { useParams } from "react-router-dom";

import { RiHeartLine, RiHeartFill } from "react-icons/ri";
import { AiOutlineStar, AiFillStar } from "react-icons/ai"

function SongPage() {
    const params = useParams();

    const [curVideo, setCurVideo] = useState<Video | null>(null);

    /**
     * When this page mounts, load the information of the target video
     */
    useEffect(() => {
        const loadVideo = async () => {
            if (params.videoID !== undefined) {
                const videoInfo: Video = await window.videoAPI.getVideo(params.videoID);
                setCurVideo(prevVideo => videoInfo);
            } else {
                console.error("Invalid videoID");
            }
        }
        loadVideo();
    }, [params.videoID])

    if (curVideo === null) {
        return (<div />);
    } else {
        return (
            <div className="video-page">
                <HistoryButtons />
                <div className="overflow-container">
                    <div className="header">
                        <video controls className="video-preview">
                            <source src={curVideo.videoHostID} type="video/mp4" />
                        </video>
                        <div className="header-info">
                            <div className="header-info-content">
                                <RiHeartLine className="like-heart" />
                                <p className="video-name">{curVideo.videoName}</p>
                                <ProfileBanner userID={curVideo.choreographerID.toString()} size={35} />
                                <p className="header-song-info">{curVideo.songName}</p>
                                <p className="header-song-info">{curVideo.artistName}</p>
                                <div className="vid-buttons-section">
                                    <Link className="vid-link" to={`/learn/${curVideo._id?.toString()}`}>
                                        <p className="vid-buttons">Learn</p>
                                    </Link>
                                    <p className="vid-button-perform">Perform <br /> PB: XXXXX</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="body">
                        <div className="left-body">
                            <p>Stage:</p>
                            <p>Put user recordings of the dance here</p>
                        </div>
                        <div className="description-box">
                            <p className="vid-description">{curVideo.vidDescription}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


export default SongPage;