import "../../../styles/home_page/app_page/HomeSideBarStyle.css"

import React, { useState, useEffect, useContext } from "react";

import User from "../../../models/user";
import Playlist from "../../../models/playlist";

import { NavLink } from "react-router-dom";
import { ObjectId } from "mongodb";

import { RiHeartFill } from "react-icons/ri"
import { BiTrendingUp, BiVideoPlus } from "react-icons/bi"
import { TiHome } from "react-icons/ti"
import { FiPlus } from "react-icons/fi";
import { BsFillDiscFill } from "react-icons/bs"
import { GoGear } from "react-icons/go"
import { FaSearch, FaRegBell } from "react-icons/fa"
import { CgProfile } from "react-icons/cg";
import { IoChatboxOutline } from "react-icons/io5"

import { AppContext } from "../../../context/General/GeneralContext";

type KeyPlaylistInfo = {
    _id: ObjectId,
    name: string
}

function HomeSideBar() {
    const [playlistList, setPlaylistList] = useState<KeyPlaylistInfo[]>([]);

    const { state, dispatch } = useContext(AppContext);

    /**
     * Whenever the playlistIDs of the user updates, reset the playlistList and obtain all
     * the ObjectId's and names of the current user's playlists
     */
    useEffect(() => {
        const loadUserPlaylists = async () => {
            if (state.user !== null) {
                let newPlaylistList: KeyPlaylistInfo[] = [];
                for (const id of state.user.playlistIDs) {
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
    }, [state.user])

    /**
     * Returns class name for links depending on if they are the active link
     * @param active :boolean that describes if the link is the current active one in the outlet
     * @returns :name of the style for active and unactive links based on active
     */
    const setActiveLink = (active: boolean) => {
        return active ? "active-side-bar-link" : "default-options-container"
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
                <p className="side-bar-text">{playlistInfo.name}</p>
            </NavLink>
        )
    }

    return (
        <div className="side-bar">
            <div className="side-bar-content">
                <div className="logo-wrapper">
                    <div className="logo-name">
                        <BsFillDiscFill className="logo" />&nbsp;Groovi
                    </div>
                </div>
                <div className="side-bar-middle">
                    <NavLink className={({ isActive }) => setActiveLink(isActive)} to="/user">
                        <TiHome className="side-bar-icons" /><p className="side-bar-text">Home</p>
                    </NavLink>
                    <div className="default-options-container">
                        <BiTrendingUp className="side-bar-icons" /><p className="side-bar-text">Trending</p>
                    </div>
                    <div className="default-options-container">
                        <RiHeartFill className="side-bar-icons" /><p className="side-bar-text">Liked</p>
                    </div>
                    <div className="default-options-container">
                        <FaSearch className="side-bar-icons" /><p className="side-bar-text">Search</p>
                    </div>
                    <hr className="side-bar-divider" />
                    <div className="playlist-section-header">
                        <p className="side-bar-text header-decoration">Playlists</p>
                        <button>
                            <div className="playlist-plus-wrapper">
                                <FiPlus className="playlist-plus" />
                            </div>
                        </button>
                    </div>
                    {playlistList.map(playlistInfo => createPlaylistLink(playlistInfo))}
                    <hr className="side-bar-divider" />
                    <div className="following-header">
                        <p className="side-bar-text header-decoration">Following</p>
                    </div>
                </div>
                <div className="additional-buttons">
                    <div className="bot-button-wrapper">
                        <CgProfile className="bottom-button" />
                    </div>
                    <div className="bot-button-wrapper">
                        <IoChatboxOutline className="bottom-button" />
                    </div>
                    <div className="bot-button-wrapper">
                        <FaRegBell className="bottom-button" />
                    </div>
                    <div className="bot-button-wrapper">
                        <BiVideoPlus className="bottom-button" />
                    </div>
                    <div className="bot-button-wrapper">
                        <GoGear className="bottom-button" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeSideBar;