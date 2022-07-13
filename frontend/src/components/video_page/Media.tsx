import "../../styles/video_page/MediaStyle.css"

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
    const videoFocusSelectionCanvasRef = useRef<HTMLCanvasElement>(null);

    const videoFocusCanvas = useRef<HTMLCanvasElement>(null);
    const videoPoseCanvasRef = useRef<HTMLCanvasElement>(null);

    const mouseDown = useRef(false);
    const focusInterval = useRef<number>(null);
    const [rect, setRect] = useState({ startX: 0, startY: 0, width: 0, height: 0, updatedRect: false });


    useImperativeHandle(ref, () => ({
        get video() {
            return videoRef.current;
        },
        get videoPose() {
            return videoPoseCanvasRef.current;
        },
        get videoFocusArea() {
            return videoFocusSelectionCanvasRef.current;
        }
    }));

    const togglePlay = () => {
        const video = videoRef.current;
        if (video !== null) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }

    /**
     * Return the x value of the mouse scaled to the focus area
     */
    const getFocusAreaXScaled = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        let bounds = vidFocusSelectionCanvas?.getBoundingClientRect();
        if (bounds !== null && bounds !== undefined && vidFocusSelectionCanvas !== null) {
            return (e.clientX - bounds.left) * vidFocusSelectionCanvas.width / bounds.width;
        }
        return 0;
    }

    /**
     * Return the y value of the mouse scaled to the focus area
     */
    const getFocusAreaYScaled = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        let bounds = vidFocusSelectionCanvas?.getBoundingClientRect();
        if (bounds !== null && bounds !== undefined && vidFocusSelectionCanvas !== null) {
            return (e.clientY - bounds.top) * vidFocusSelectionCanvas.height / bounds.height;
        }
        return 0;
    }

    /**
     * Place the beginning corner of the focus area and enable drawing of a focus area
     * @param e: mouse event that has the x and y coordinates of the mouse
     * pre: mouseDown.current = false, videoFocusSelectionCanvasRef.current != null
     * post: rect startX and startY updated to the scaled mouse values
     */
    const setRectStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
        mouseDown.current = true;
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        if (vidFocusSelectionCanvas !== null) {
            setRect(prevRect => ({
                ...prevRect,
                startX: getFocusAreaXScaled(e),
                startY: getFocusAreaYScaled(e)
            }))
        }
    }

    /**
     * Allows user to drag the mouse around to draw a focus rectangle on the video
     * @param e: mouse event that has the x and y coordinates of the mouse
     * pre: mouseDown.current = false, videoFocusSelectionCanvasRef.current != null
     * post: rect width and height updated to the mouse's new position
     */
    const dragRect = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        if (vidFocusSelectionCanvas !== null) {
            const vidFocusSelectionCanvasCtx = vidFocusSelectionCanvas.getContext("2d");
            const mouseX = getFocusAreaXScaled(e);
            const mouseY = getFocusAreaYScaled(e);

            if (mouseDown.current && vidFocusSelectionCanvasCtx !== null) {
                vidFocusSelectionCanvasCtx.clearRect(0, 0, vidFocusSelectionCanvas.width,
                    vidFocusSelectionCanvas.height);
                const curWidth = mouseX - rect.startX;
                const curHeight = mouseY - rect.startY;
                setRect(prevRect => ({
                    ...prevRect,
                    width: curWidth,
                    height: curHeight
                }))

                vidFocusSelectionCanvasCtx.beginPath();
                vidFocusSelectionCanvasCtx.rect(rect.startX, rect.startY, rect.width, rect.height);
                vidFocusSelectionCanvasCtx.strokeStyle = "red";
                vidFocusSelectionCanvasCtx.lineWidth = 2;
                vidFocusSelectionCanvasCtx.stroke();
            }
        }
    }

    /**
     * Adjusts the rectangle drawn by the user such that StartX and StartY represent the top
     * left corner of the rectangle
     * pre: onMouseUp has been called
     * post: rect updated such that startX and startY represent the top left corner, actual rectangle
     * is the same from the user's perspective, mouseDown = false
     */
    const finalizeRect = () => {
        let newWidth = rect.width;
        let newHeight = rect.height;
        let newStartX = rect.startX;
        let newStartY = rect.startY;

        if (rect.width < 0) {
            newWidth = Math.abs(rect.width);
            newStartX = rect.startX - newWidth;
        }

        if (rect.height < 0) {
            newHeight = Math.abs(rect.height);
            newStartY = rect.startY - newHeight;
        }

        setRect(prevRect => ({
            startX: newStartX,
            startY: newStartY,
            width: newWidth,
            height: newHeight,
            updatedRect: true
        }))

        mouseDown.current = false;
    }

    return (
        <div className="media-container">
            <div className="video-container">
                <video crossOrigin="Anonymous" className="video-element" ref={videoRef}>
                    <source src="./videos/BTBT.mp4" type="video/mp4" />
                </video>
            </div>
            <canvas className="video-focus-selection-canvas" ref={videoFocusSelectionCanvasRef}
                onMouseDown={setRectStart} onMouseMove={dragRect} onMouseUp={finalizeRect} />
            <canvas className="focus-area" ref={videoFocusCanvas} />
            <canvas className="focus-area-pose" ref={videoPoseCanvasRef} />

            <Webcam className="camera-elements" />
            <canvas className="camera-elements" />

            <button className="video-button" onClick={togglePlay}>
                Play/Pause Video
            </button>
        </div>
    );
}

export default forwardRef(Media);