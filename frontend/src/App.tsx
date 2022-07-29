import './App.css';

import React, { useState } from "react";

import { getUser } from "./data/users";
import { getPlaylist } from './data/playlists';

import { Link, Outlet } from 'react-router-dom';

function App() {
    const [userPlaylists, setUserPlaylists] = useState(getUser("abcdef")?.playlists);

    return (
        <div className="App">
            <div className="top-bar">
                <div className="top-bar-section">
                    <p>Logo</p>
                </div>
                <div className="top-bar-section search-elements">
                    <p>Search Bar</p>
                    <p>Submit Search</p>
                </div>
                <div className="top-bar-section right-elements">
                    <p>Profile</p>
                    <p>Settings</p>
                </div>
            </div>
            <div className="side-bar">
                <Link className="side-bar-link" to="/playlist">
                    <p>Home</p>
                </Link>
                <p>Trending</p>
                <p>Liked</p>
                <hr />
                {userPlaylists?.map((playlistID) => {
                    return (
                        <Link className="side-bar-link" to={`/playlist/${playlistID}`}>
                            <p>{getPlaylist(playlistID)?.name}</p>
                        </Link>)
                })}
                <hr />
                <p>Subscribed</p>
            </div>
            <div className="outlet-section">
                <Outlet />
            </div>
        </div>
    );
}

export default App;
