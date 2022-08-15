import "../../../styles/home_page/app_page/HomeSideBarStyle.css"

import React, { useState, useEffect } from "react";

import User from "../../../models/user";
import Playlist from "../../../models/playlist";

import { NavLink } from "react-router-dom";
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
                    const playlistInfo: Playlist = await window.playlistAPI.getPlaylist(id.toString());
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
     * Returns class name for links depending on if they are the active link
     * @param active :boolean that describes if the link is the current active one in the outlet
     * @returns :name of the style for active and unactive links based on active
     */
    const setActiveLink = (active: boolean) => {
        return active ? "active-side-bar-link" : "side-bar-link"
    }

    /**
     * Generates the links for all of the current user's playlists
     * @param playlistInfo : KeyPlaylistInfo => contains the ObjectId and name of the playlist
     * @returns :ReactRouter Link element that links to the playlist's page and display the playlist's
     * name
     */
    const createPlaylistLink = (playlistInfo: KeyPlaylistInfo) => {
        return (
            <NavLink className={({ isActive }) => setActiveLink(isActive)} to={`/playlist/${playlistInfo._id.toString()}`}>
                <p>{playlistInfo.name}</p>
            </NavLink>
        )
    }

    return (
        <div className="side-bar">
            <div className="side-bar-content">
                <NavLink className={({ isActive }) => setActiveLink(isActive)} to="/user">
                    <p>Home</p>
                </NavLink>
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
        </div>
    )
}

export default HomeSideBar;