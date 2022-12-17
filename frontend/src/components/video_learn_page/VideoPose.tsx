import "../../styles/video_learn_page/VideoPoseStyle.css";

import React, { useState, useRef, useEffect, useCallback } from "react";

import { BsFillPlayFill, BsFillPauseFill, BsVolumeOffFill } from "react-icons/bs";
import { VscMirror } from "react-icons/vsc";
import { MdCenterFocusWeak } from "react-icons/md";

import { useParams } from "react-router-dom";
import Video from "../../models/video";

import ChapterList from "./Chapters/ChapterList";

import usePose from "../../hooks/usePose";
import useTime from "../../hooks/useTime";

import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

type videoPoseProps = {
    onPoseResults: (results: any) => void,
    onUpdateMirror: (mirrorState: boolean) => void,
    onViewStateChange: (newView: number) => void
}

function VideoPose(props: videoPoseProps) {
    const navigate = useNavigate();

    const params = useParams();
    const [curVideo, setCurVideo] = useState<Video | null>(null);

    /**
    * When this page mounts, load the information of the target video
    */
    useEffect(() => {
        const loadVideo = async () => {
            if (params.videoID !== undefined) {
                const videoInfo: Video = await window.videoAPI.getVideo(params.videoID);
                setCurVideo(prevVideo => videoInfo);
            } else {
                console.error("Invalid videoID");
            }
        }
        loadVideo();
    }, [params.videoID])

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoFocusSelectionCanvasRef = useRef<HTMLCanvasElement>(null);

    const videoFocusCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoPoseCanvasRef = useRef<HTMLCanvasElement>(null);

    const mouseDown = useRef(false);
    const focusInterval = useRef<number | null>(null);
    const [rect, setRect] = useState({ startX: 0, startY: 0, width: 0, height: 0, updatedRect: false });

    const mirrored = useRef(true);

    const { getPoseModel, startPoseEstimation, drawResults } = usePose();
    const secondToHourMinuteSecond = useTime();

    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const timeSlider = useRef<HTMLInputElement>(null);

    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(100);
    const volumeSlider = useRef<HTMLInputElement>(null);

    const [isMirrored, setMirrored] = useState(true);

    const [isFocused, setIsFocused] = useState(true);
    const [isFocusedDrawing, setIsFocusedDrawing] = useState(false);
    const [controlsHovered, setControlsHovered] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeout = useRef<number | null>(null);

    const [videoLength, setVideoLength] = useState("100");

    const [viewState, setViewState] = useState(2);
    const initialSetUp = useRef(true);

    const boundsScale = useRef(2);
    const boundsOffset = useRef(0.25);

    /**
     * Return the x value of the mouse scaled to the focus area
     */
    const getFocusAreaXScaled = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        const bounds = vidFocusSelectionCanvas?.getBoundingClientRect();
        let tempMouseX = e.clientX;
        if (bounds !== undefined) {
            if (tempMouseX > bounds.width / boundsScale.current) {
                tempMouseX = bounds.width / boundsScale.current;
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
            return (tempMouseY - bounds.top) * vidFocusSelectionCanvas.height / bounds.height;
        }
        return 0;
    }

    /**
     * Place the beginning corner of the focus area and enable drawing of a focus area or finish
     * the rectangle
     * @param e: mouse event that has the x and y coordinates of the mouse
     * pre: mouseDown.current = false, videoFocusSelectionCanvasRef.current != null
     * post: rect startX and startY updated to the scaled mouse values
     */
    const setFocusRect = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mouseDown.current) {
            setIsFocusedDrawing(true);
            mouseDown.current = true;
            const vidFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
            if (vidFocusSelectionCanvas !== null) {
                setRect(prevRect => ({
                    startX: getFocusAreaXScaled(e),
                    startY: getFocusAreaYScaled(e),
                    width: 1,
                    height: 1,
                    updatedRect: false
                }))
            }
        } else {
            setIsFocusedDrawing(false);
            finalizeRect();
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

                drawRect();
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
     * Draws the bounding rectangle on the focus selection canvas
     */
    const drawRect = useCallback(() => {
        const videoFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
        if (videoFocusSelectionCanvas !== null) {
            const bounds = videoFocusSelectionCanvas.getBoundingClientRect();
            const vidFocusSelectionCanvasCtx = videoFocusSelectionCanvas.getContext("2d");
            if (vidFocusSelectionCanvasCtx !== null) {
                vidFocusSelectionCanvasCtx.clearRect(0, 0, videoFocusSelectionCanvas.width,
                    videoFocusSelectionCanvas.height);
                vidFocusSelectionCanvasCtx.fillStyle = "#0000007A"
                vidFocusSelectionCanvasCtx.fillRect(0, 0,
                    ((bounds.width / boundsScale.current) - bounds.left) * videoFocusSelectionCanvas.width / bounds.width,
                    (bounds.height - bounds.top) * videoFocusSelectionCanvas.height / bounds.height);

                vidFocusSelectionCanvasCtx.clearRect(rect.startX, rect.startY, rect.width, rect.height);
            }
        }
    }, [rect.startX, rect.startY, rect.width, rect.height])

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

                        const videoWidthScale = video.videoWidth / window.screen.availWidth;

                        let focusX = (rect.startX * scaleX + window.screen.availWidth * boundsOffset.current) * videoWidthScale;
                        let focusY = rect.startY * scaleY * videoWidthScale;

                        const focusWidth = rect.width * scaleX * videoWidthScale;
                        const focusHeight = rect.height * scaleY * videoWidthScale;

                        //Just flips the focus area around the center if mirrored (does not need change)
                        if (mirrored.current) {
                            if (focusX < video.videoWidth / 2) {
                                let topRightX = focusX + focusWidth;
                                let distance = video.videoWidth / 2 - topRightX;
                                focusX = focusX + 2 * distance + focusWidth;
                            } else {
                                let distance = focusX - video.videoWidth / 2;
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
            }, 10);

            drawRect();

            setRect(prevRect => ({ ...prevRect, updatedRect: false }))
        }
    }, [rect, drawRect])

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

            //(tempMouseX - bounds.left) * vidFocusSelectionCanvas.width / bounds.width
            //(e.clientY - bounds.top) * vidFocusSelectionCanvas.height / bounds.height;

            setRect(prevRect => ({
                startX: 0,
                startY: 0,
                width: ((bounds.width / boundsScale.current) - bounds.left) * videoFocusSelectionCanvas.width / bounds.width,
                height: (bounds.height - bounds.top) * videoFocusSelectionCanvas.height / bounds.height,
                updatedRect: true
            }))

            setVideoLength(prevLength => video.duration.toString())
        }

        const videoCanvasPoseModel = getPoseModel();
        videoCanvasPoseModel.onResults(videoOnResults);

        if (videoFocusCanvasRef.current !== null) {
            startPoseEstimation(videoCanvasPoseModel, videoFocusCanvasRef.current)
        }

        setIsFocused(false);
    }

    /**
    * Handle whenever the video pose model makes results
    */
    const videoOnResults = (results: any) => {
        if (videoPoseCanvasRef.current !== null) {
            props.onPoseResults(results);
            //drawResults(results, videoPoseCanvasRef.current);
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
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * Number(videoLength);
            setProgress(progress);
        }
    }

    /**
     * manually updates video progress from input range
     */
    const handleVideoProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
        const manualChange = Number(event.target.value);
        jumpVideoProgress(manualChange);
    }

    /**
     * manually updates video progress from the chapter list
     */
    const jumpVideoProgress = (time: number) => {
        if (videoRef.current !== null) {
            videoRef.current.currentTime = (videoRef.current.duration / Number(videoLength)) * time;
        }
        setProgress(time);
    }

    /**
     * Whenever the progress of the video is updated, we need to update the style of the time
     * bar
     */
    useEffect(() => {
        if (videoRef.current !== null) {
            const percentFinish = progress / Number(videoLength) * 100;
            if (timeSlider.current !== null) {
                timeSlider.current.style.backgroundSize = `${percentFinish}% 100%`;
            }
        }
    }, [progress, videoLength])

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
     * Update the appearance of volume slider when volume changes
     */
    useEffect(() => {
        if (volumeSlider.current !== null) {
            volumeSlider.current.style.backgroundSize = `${volume}% 100%`
        }
    }, [volume])

    /**
     * toggle mirroring the video
     */
    const toggleMirror = () => {
        setMirrored(prevMirrored => !prevMirrored);
    }

    useEffect(() => {
        if (videoRef.current !== null && videoPoseCanvasRef.current !== null) {
            if (isMirrored) {
                console.log("here");
                videoRef.current.style.setProperty("transform", "rotateY(180deg)");
                videoPoseCanvasRef.current.style.setProperty("transform", "rotateY(180deg)");
            } else {
                videoRef.current.style.setProperty("transform", "rotateY(0deg)");
                videoPoseCanvasRef.current.style.setProperty("transform", "rotateY(0deg)");
            }
        }
        mirrored.current = isMirrored;
        props.onUpdateMirror(isMirrored);
    }, [isMirrored])

    /**
     * Master function that handles whether or not the video controls should be shown
     */
    const toggleVideoControls = useCallback(() => {
        if (controlsTimeout.current !== null) {
            window.clearTimeout(controlsTimeout.current);
        }
        if (isFocusedDrawing) {
            setShowControls(false);
        } else if (!isPlaying) {
            setShowControls(true);
        } else if (controlsHovered) {
            setShowControls(true);
        } else {
            //the video must be playing and the mouse is moving on top of video content
            setShowControls(true);
            controlsTimeout.current = window.setTimeout(() => { setShowControls(false) }, 2000);
        }
    }, [controlsHovered, isFocusedDrawing, isPlaying]);

    useEffect(() => {
        toggleVideoControls();
    }, [isFocusedDrawing, isPlaying, controlsHovered, toggleVideoControls])

    /**
     * Switches between the different view states
     */
    const toggleViewStates = () => {
        if (viewState === 0) {
            setViewState(1);
        } else if (viewState === 1) {
            setViewState(2);
        } else {
            setViewState(0);
        }
    }

    useEffect(() => {
        if (!initialSetUp.current) {
            props.onViewStateChange(viewState);
            const video = videoRef.current;
            const videoFocusSelectionCanvas = videoFocusSelectionCanvasRef.current;
            if (video != null && videoFocusSelectionCanvas !== null) {
                const bounds = videoFocusSelectionCanvas.getBoundingClientRect();
                const shift = window.screen.availWidth * 0.25 * videoFocusSelectionCanvas.width / bounds.width;
                if (viewState === 0) {
                    boundsScale.current = 1;
                    boundsOffset.current = 0;

                    setRect(prevRect =>
                    ({
                        ...prevRect,
                        startX: prevRect.startX + shift,
                        updatedRect: true
                    }))
                } else if (viewState === 2) {
                    boundsScale.current = 2;
                    boundsOffset.current = 0.25;
                    setRect(prevRect =>
                    ({
                        ...prevRect,
                        startX: prevRect.startX - shift,
                        updatedRect: true
                    }))

                }
            }
        } else {
            initialSetUp.current = false;
        }
    }, [viewState])

    if (curVideo === null) {
        return (<div />);
    } return (
        <div onMouseMove={toggleVideoControls}>
            <canvas className="whole-screen" />
            <canvas className={isFocused ? "video-focus-selection-canvas" : "focus-area-hidden"}
                ref={videoFocusSelectionCanvasRef}
                onMouseDown={setFocusRect} onMouseMove={dragRect} />
            <canvas className="focus-area" ref={videoFocusCanvasRef} />
            <canvas className="focus-area" ref={videoPoseCanvasRef} />

            <div className={viewState === 2 ? "video-container-half" : "video-container-full"}>
                <video crossOrigin="Anonymous" className={viewState === 2 ? "video-element-half" : "video-element-full"}
                    ref={videoRef} onLoadedData={initVideoCanvas} onTimeUpdate={handleOnTimeUpdate}>
                    <source src={curVideo.videoHostID} type="video/mp4" />
                </video>
            </div>

            <div className={showControls ? "video-controls-shown" : "video-controls-hidden"}
                onMouseEnter={() => setControlsHovered(true)} onMouseLeave={() => setControlsHovered(false)}>
                <div className="top-header">
                    <button onClick={() => navigate(-1)}>
                        <IoIosArrowBack className="video-back-button" />
                    </button>
                    <p className="top-header-video-name">{curVideo.videoName}</p>
                </div>
                <ChapterList viewState={viewState} vidLength={videoLength} jumper={jumpVideoProgress} vidProgress={progress} />
                <div className="video-controls">
                    <input ref={timeSlider} className={"time-slider " + (viewState === 2 ? "full-time-slider" : "shortened-time-slider")} type="range" min="0" max={videoLength} value={progress} onChange={(e) => handleVideoProgress(e)} />
                    <div className="bottom-half-controls">
                        <div className="bottom-half-controls-section">
                            <p className="current-time">{secondToHourMinuteSecond(progress).time + " / " + secondToHourMinuteSecond(videoLength).time}</p>
                            <button onClick={togglePlay}>
                                {isPlaying ? <BsFillPauseFill className="play-pause-button" /> :
                                    <BsFillPlayFill className="play-pause-button" />}
                            </button>
                            <BsVolumeOffFill className="control-bar-icon" />
                            <input ref={volumeSlider} className="volume-slider" type="range" min="0" max="100" value={volume} onChange={(e) => handleVolume(e)} />
                            <select className="select-speed" value={speed} onChange={(e) => handleVideoSpeed(e)}>
                                <option value="0.3">0.3x</option>
                                <option value="0.4">0.4x</option>
                                <option value="0.5">0.5x</option>
                                <option value="0.6">0.6x</option>
                                <option value="0.7">0.7x</option>
                                <option value="0.8">0.8x</option>
                                <option value="0.9">0.9x</option>
                                <option value="1">1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="1.75">1.75x</option>
                                <option value="2">2x</option>
                            </select>
                        </div>
                        <div className="bottom-half-controls-section">
                            <button onClick={toggleMirror}>
                                <VscMirror className={isMirrored ? "toggle-buttons-activated" : "toggle-buttons-deactivated"} />
                            </button>
                            <button onClick={() => setIsFocused(prevFocus => !prevFocus)}>
                                <MdCenterFocusWeak className={isFocused ? "toggle-buttons-activated" : "toggle-buttons-deactivated"} />
                            </button>
                            <button onClick={toggleViewStates}>
                                ToggleView
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPose;