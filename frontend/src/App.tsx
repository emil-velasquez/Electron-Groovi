import './App.css';

import React, { useRef, useState } from "react";

import Webcam from "react-webcam";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import * as mp_drawing from "@mediapipe/drawing_utils";

function App() {
    const JOINTS: number[][] = [[16, 14, 12], [14, 12, 11], [14, 12, 24], [12, 24, 26], [24, 26, 28],
    [26, 24, 23], [25, 23, 24], [23, 25, 27], [11, 23, 25], [13, 11, 23],
    [13, 11, 12], [15, 13, 11]];

    return (
        <div className="App">
            <div className="video-container">
                <video crossOrigin="Anonymous" className="video-element">
                    <source />
                </video>
                <canvas className="video-pose-canvas" />
                <canvas className="video-focus-selection-canvas" />
            </div>
            <Webcam className="camera-elements" />
            <canvas className="camera-elements" />
            <canvas className="focus-area" />
            <canvas className="focus-area-pose" />
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
