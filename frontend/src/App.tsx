import './App.css';

import React, { useEffect } from "react";

import { Link, Outlet } from 'react-router-dom';

function App() {
    useEffect(() => {
        console.log("here");
    }, [])

    return (
        <div className="App">
            <nav>
                <Link to="/user">User</Link> | {" "}
                <Link to="/playlist">Playlist</Link> | {" "}
                <Link to="/song">Song</Link>
            </nav>
            <Outlet />
        </div>
    );
}

export default App;
