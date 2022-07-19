import "../../styles/video_page/VideoPoseStyle.css";

import React, { useState, useRef, useEffect } from "react";

import usePose from "../../hooks/usePose";

type videoPoseProps = {
    onPoseResults: (results: any) => void,
    onUpdateMirror: (mirrorState: boolean) => void
}

function VideoPose(props: videoPoseProps) {
    const HALF_HIDDEN_VIDEO_WIDTH = 0.22;

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoFocusSelectionCanvasRef = useRef<HTMLCanvasElement>(null);

    const videoFocusCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoPoseCanvasRef = useRef<HTMLCanvasElement>(null);

    const mouseDown = useRef(false);
    const focusInterval = useRef<number | null>(null);
    const [rect, setRect] = useState({ startX: 0, startY: 0, width: 0, height: 0, updatedRect: false });

    const mirrored = useRef(true);

    const { getPoseModel, startPoseEstimation, drawResults } = usePose();

    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(100);
    const [isMirrored, setMirrored] = useState(true);

    /**
     * Return the x value of the mouse scaled to the focus area
     */
    const getFocusAreaXScaled = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        const bounds = vidFocusSelectionCanvas?.getBoundingClientRect();
        let tempMouseX = e.clientX;
        if (bounds !== undefined) {
            if (tempMouseX > bounds.width / 2) {
                tempMouseX = bounds.width / 2;
            }
        }
        if (bounds !== null && bounds !== undefined && vidFocusSelectionCanvas !== null) {
            return (tempMouseX - bounds.left) * vidFocusSelectionCanvas.width / bounds.width;
        }
        return 0;
    }

    /**
     * Return the y value of the mouse scaled to the focus area
     */
    const getFocusAreaYScaled = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        const bounds = vidFocusSelectionCanvas?.getBoundingClientRect();
        let tempMouseY = e.clientY;
        if (bounds !== undefined) {
            if (tempMouseY > bounds.height) {
                tempMouseY = bounds.height;
            }
        }
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
        if (!mouseDown.current) {
            mouseDown.current = true;
            const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
            if (vidFocusSelectionCanvas !== null) {
                setRect(prevRect => ({
                    ...prevRect,
                    startX: getFocusAreaXScaled(e),
                    startY: getFocusAreaYScaled(e),
                    width: 1,
                    height: 1
                }))
            }
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
        if (mouseDown.current) {
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
    }

    /**
 * Make the focus area canvas start drawing the updated focus area rectangle
 */
    useEffect(() => {
        if (rect.updatedRect) {
            const drawVideoDance = () => {
                const videoFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
                if (videoFocusSelectionCanvas !== null) {
                    const bounds = videoFocusSelectionCanvas.getBoundingClientRect();
                    const scaleX = bounds.width / videoFocusSelectionCanvas.width;
                    const scaleY = bounds.height / videoFocusSelectionCanvas.height;

                    adjustFocusAndPoseCanvas(scaleX, scaleY);

                    const videoFocusCanvas = videoFocusCanvasRef.current;
                    const video = videoRef.current;
                    if (videoFocusCanvas !== null && video != null) {
                        const focusCanvasContext = videoFocusCanvas.getContext("2d");

                        let focusX = rect.startX * scaleX + video.videoWidth * .22;
                        let focusY = rect.startY * scaleY;
                        const focusWidth = rect.width * scaleX;
                        const focusHeight = rect.height * scaleY;

                        if (mirrored.current) {
                            if (focusX < video.videoWidth * .5) {
                                let topRightX = focusX + focusWidth;
                                let distance = video.videoWidth * .5 - topRightX;
                                focusX = focusX + 2 * distance + focusWidth;
                            } else {
                                let distance = focusX - video.videoWidth * .5;
                                focusX = focusX - 2 * distance - focusWidth;
                            }
                        }

                        if (focusCanvasContext !== null) {
                            focusCanvasContext.drawImage(video, focusX, focusY, focusWidth, focusHeight, 0, 0,
                                videoFocusCanvas.width, videoFocusCanvas.height);
                        }
                    }
                }

            }

            //resizes the focus area and pose canvas according to the rectangle
            const adjustFocusAndPoseCanvas = (scaleX: number, scaleY: number) => {
                const focusCanvas = videoFocusCanvasRef.current;
                if (focusCanvas !== null) {
                    focusCanvas.width = rect.width * scaleX;
                    focusCanvas.height = rect.height * scaleY;
                }

                const poseCanvas = videoPoseCanvasRef.current;
                if (poseCanvas !== null) {
                    poseCanvas.width = rect.width * scaleX;
                    poseCanvas.height = rect.height * scaleY;
                }
            }

            if (focusInterval.current !== null) {
                window.clearInterval(focusInterval.current);
            }

            focusInterval.current = window.setInterval(() => {
                drawVideoDance();
            }, 50);

            setRect(prevRect => ({ ...prevRect, updatedRect: false }))
        }
    }, [rect])

    /**
     * When the video is loaded, set the focus area to the 50% actually shown to the user
     * Also start the pose model
     * pre: video is loaded
     */
    const initVideoCanvas = () => {
        const video = videoRef.current;
        const videoFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        if (videoFocusSelectionCanvas !== null && video !== null) {
            const bounds = videoFocusSelectionCanvas.getBoundingClientRect();
            setRect(prevRect => ({
                startX: 0,
                startY: 0,
                width: HALF_HIDDEN_VIDEO_WIDTH * video.videoWidth,
                height: video.videoHeight / bounds.height * videoFocusSelectionCanvas.height,
                updatedRect: true
            }))
        }

        const videoCanvasPoseModel = getPoseModel();
        videoCanvasPoseModel.onResults(videoOnResults);

        if (videoFocusCanvasRef.current !== null) {
            startPoseEstimation(videoCanvasPoseModel, videoFocusCanvasRef.current)
        }
    }

    /**
    * Handle whenever the video pose model makes results
    */
    const videoOnResults = (results: any) => {
        if (videoPoseCanvasRef.current !== null) {
            console.log("video results");
            props.onPoseResults(results);
            drawResults(results, videoPoseCanvasRef.current);
        }
    }

    /**
     * Play or pause the video
     */
    const togglePlay = () => {
        setPlaying(prevPlaying => !prevPlaying);
    }

    useEffect(() => {
        if (videoRef.current !== null) {
            isPlaying ? videoRef.current.play() : videoRef.current.pause();
        }
    }, [isPlaying, videoRef])

    /**
     * keep track of the progress of the video
     */
    const handleOnTimeUpdate = () => {
        if (videoRef.current !== null) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    }

    /**
     * manually updates video progress
     */
    const handleVideoProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
        const manualChange = Number(event.target.value);
        if (videoRef.current !== null) {
            videoRef.current.currentTime = (videoRef.current.duration / 100) * manualChange;
        }
        setProgress(manualChange);
    }

    /**
     * manually adjust video speed
     */
    const handleVideoSpeed = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const speed = Number(event.target.value);
        if (videoRef.current !== null) {
            videoRef.current.playbackRate = speed;
        }
        setSpeed(speed);
    }

    /**
     * manually adjust volume
     */
    const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
        const volumeChange = Number(event.target.value) / 100;
        if (videoRef.current !== null) {
            videoRef.current.volume = volumeChange;
        }
        setVolume(volumeChange * 100);
    }

    /**
     * toggle mirroring the video
     */
    const toggleMirror = () => {
        setMirrored(prevMirrored => !prevMirrored);
    }

    useEffect(() => {
        if (videoRef.current !== null && videoPoseCanvasRef.current !== null) {
            if (isMirrored) {
                videoRef.current.style.setProperty("transform", "rotateY(180deg)");
                videoPoseCanvasRef.current.style.setProperty("transform", "rotateY(180deg)");
            } else {
                videoRef.current.style.setProperty("transform", "rotateY(0deg)");
                videoPoseCanvasRef.current.style.setProperty("transform", "rotateY(0deg)");
            }
        }
        mirrored.current = isMirrored;
        props.onUpdateMirror(isMirrored);
    })

    return (
        <div>
            <canvas className="video-focus-selection-canvas" ref={videoFocusSelectionCanvasRef}
                onMouseDown={setRectStart} onMouseMove={dragRect} onMouseUp={finalizeRect} />
            <canvas className="focus-area" ref={videoFocusCanvasRef} />
            <canvas className="focus-area" ref={videoPoseCanvasRef} />
            <div className="video-container">
                <video crossOrigin="Anonymous" className="video-element" ref={videoRef}
                    onLoadedData={initVideoCanvas} onTimeUpdate={handleOnTimeUpdate}>
                    <source src="./videos/BTBT.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="video-controls">
                <input type="range" min="0" max="100" value={progress} onChange={(e) => handleVideoProgress(e)} />
                <button className="video-button" onClick={togglePlay}>
                    Play/Pause Video
                </button>
                <select value={speed} onChange={(e) => handleVideoSpeed(e)}>
                    <option value="0.3">0.3</option>
                    <option value="0.4">0.4</option>
                    <option value="0.5">0.5</option>
                    <option value="0.6">0.6</option>
                    <option value="0.7">0.7</option>
                    <option value="0.8">0.8</option>
                    <option value="0.9">0.9</option>
                    <option value="1">1</option>
                    <option value="1.25">1.25</option>
                    <option value="1.5">1.5</option>
                    <option value="1.75">1.75</option>
                    <option value="2">2</option>
                </select>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => handleVolume(e)} />
                <button onClick={toggleMirror}>
                    Mirror
                </button>
            </div>
        </div>
    )
}

export default VideoPose;