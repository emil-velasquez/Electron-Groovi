import './App.css';

import React, { useEffect } from "react";

import { Link, Outlet } from 'react-router-dom';

function App() {
    useEffect(() => {
        console.log("here");
    }, [])

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
                <p>Playlists</p>
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
