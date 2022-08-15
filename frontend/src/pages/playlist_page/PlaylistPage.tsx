import "./PlaylistPageStyle.css"

import React, { useEffect, useState } from "react";
import Playlist from "../../models/playlist";

import ProfileBanner from "../../components/home_page/ProfileBanner";
import VideoCard from "../../components/home_page/VideoCard";

import HistoryButtons from "../../components/home_page/HistoryButtons";
import { useParams } from "react-router-dom";

import { RiHeartLine, RiHeartFill } from "react-icons/ri"

function PlaylistPage() {
    const params = useParams();

    const [curPlaylist, setCurPlaylist] = useState<Playlist | null>(null);

    /**
     * When this page mounts, load the information of the current playlist
     */
    useEffect(() => {
        /**
        * Makes a call to the backend to receive all information on the current playlist
        */
        const loadPlaylist = async () => {
            if (params.playlistID !== undefined) {
                const playlistInfo: Playlist = await window.playlistAPI.getPlaylist(params.playlistID);
                setCurPlaylist(prevInfo => playlistInfo);
            } else {
                console.error("Invalid playlistID");
            }
        }
        loadPlaylist();
    }, [params.playlistID])

    if (curPlaylist === null) {
        return (<div />);
    } else {
        return (
            <div className="playlist-page">
                <HistoryButtons />
                <div className="overflow-container">
                    <div className="header">
                        <div className="header-logo">
                            <img className="playlist-logo"
                                src={curPlaylist?.pictureHostID}
                                alt="playlist logo" />
                        </div>
                        <div className="header-info">
                            <div className="header-info-content">
                                <RiHeartLine className="like-heart" />
                                <p className="header-name">{curPlaylist?.name}</p>
                                <ProfileBanner userID={curPlaylist.ownerID.toString()} size={35} />
                            </div>
                        </div>
                    </div>
                    <div className="video-card-section">
                        {curPlaylist.videoIDs.map(id => <VideoCard videoID={id.toString()} />)}
                    </div>
                </div>
            </div>
        )
    }

}

export default PlaylistPage