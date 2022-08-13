import "../../../styles/home_page/app_page/HomeSideBarStyle.css"

import React, { useState, useEffect } from "react";

import User from "../../../models/user";
import Playlist from "../../../models/playlist";

import { Link } from "react-router-dom";
import { ObjectId } from "mongodb";

type HomeSideBarProps = {
    user: User | null,
}

type KeyPlaylistInfo = {
    _id: ObjectId,
    name: string
}

function HomeSideBar(props: HomeSideBarProps) {
    const [playlistList, setPlaylistList] = useState<KeyPlaylistInfo[]>([]);

    /**
     * Whenever the playlistIDs of the user updates, reset the playlistList and obtain all
     * the ObjectId's and names of the current user's playlists
     */
    useEffect(() => {
        const loadUserPlaylists = async () => {
            if (props.user !== null) {
                let newPlaylistList: KeyPlaylistInfo[] = [];
                for (const id of props.user.playlistIDs) {
                    const playlistInfo: Playlist = await window.playlistAPI.getPlaylist(id);
                    if (playlistInfo._id !== undefined) {
                        newPlaylistList.push({ _id: playlistInfo._id, name: playlistInfo.name });
                    }
                }
                return newPlaylistList;
            }
            return [];
        }

        loadUserPlaylists().then((result) => setPlaylistList(result));
    }, [props.user])

    /**
     * Generates the links for all of the current user's playlists
     * @param playlistInfo : KeyPlaylistInfo => contains the ObjectId and name of the playlist
     * @returns :ReactRouter Link element that links to the playlist's page and display the playlist's
     * name
     */
    const createPlaylistLink = (playlistInfo: KeyPlaylistInfo) => {
        return (
            <Link className="side-bar-link" to={`/playlist/${playlistInfo._id.toString()}`}>
                <p>{playlistInfo.name}</p>
            </Link>
        )
    }

    return (
        <div className="side-bar">
            <Link className="side-bar-link" to="/playlist">
                <p>Home</p>
            </Link>
            <p>Trending</p>
            <p>Liked</p>
            <hr />
            <button>
                + New Playlist
            </button>
            {playlistList.map(playlistInfo => createPlaylistLink(playlistInfo))}
            <hr />
            <p>Subscribed</p>
        </div>
    )
}

export default HomeSideBar;