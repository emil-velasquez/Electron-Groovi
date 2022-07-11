import "../../styles/video_page/MediaStyles.css"

import React, { useRef, useState, useImperativeHandle, forwardRef, Ref } from "react";

import Webcam from "react-webcam";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import * as mp_drawing from "@mediapipe/drawing_utils";

//TODO: make sure to update props when we figure out what props to enter
function Media(props: any, ref: Ref<unknown>) {
    const JOINTS: number[][] = [[16, 14, 12], [14, 12, 11], [14, 12, 24], [12, 24, 26], [24, 26, 28],
    [26, 24, 23], [25, 23, 24], [23, 25, 27], [11, 23, 25], [13, 11, 23],
    [13, 11, 12], [15, 13, 11]];

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoPoseCanvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        get video() {
            return videoRef.current;
        },
        get videoPose() {
            return videoPoseCanvasRef.current;
        }
    }));

    return (
        <div className="media-container">
            <div className="video-container">
                <video crossOrigin="Anonymous" className="video-element" ref={videoRef}>
                    <source />
                </video>
                <canvas className="video-pose-canvas" ref={videoPoseCanvasRef} />
                <canvas className="video-focus-selection-canvas" />
            </div>
            <Webcam className="camera-elements" />
            <canvas className="camera-elements" />
            <canvas className="focus-area" />
            <canvas className="focus-area-pose" />
        </div>
    );
}

export default forwardRef(Media);