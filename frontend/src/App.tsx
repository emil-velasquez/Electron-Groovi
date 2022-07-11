import './App.css';

import React from "react";
import Media from "./components/video_page/Media"

function App() {

    return (
        <div className="App">
            <Media />
        </div>
    );
}

/*
            <p className="score">Filler</p>
            <div className="video-controls">
                <input type="range" />
                <button className="video-button" >Play/Pause</button>
                <select>
                    <option value="1">1</option>
                </select>
                <input type="range" />
                <button>
                    Mirror
                </button>
            </div>
*/

export default App;
