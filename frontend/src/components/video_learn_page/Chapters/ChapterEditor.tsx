import "../../../styles/video_learn_page/Chapters/ChapterEditor.css"

import React, { useEffect, useState, useRef } from "react"
import { RiPencilFill } from "react-icons/ri";

import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";

import MultiRangeSlider from "../../utility/MultiRangeSlider";
import useTime from "../../../hooks/useTime";
import { AiOutlineConsoleSql } from "react-icons/ai";

type ChapterType = {
    name: string,
    start: number,
    end: number
}

enum TimePos {
    START,
    END
}

enum TimeUnit {
    HOUR,
    MINUTE,
    SECOND
}

type ChapterEditorProps = {
    values: {
        name: string,
        start: number,
        end: number,
        index: number
    },
    videoSource: string,
    mirrored: boolean,
    volume: number,
    closer: () => void,
    updater: (chapter: ChapterType, index: number) => void
}

function ChapterEditor(props: ChapterEditorProps) {
    const secondToHourMinuteSecond = useTime();

    const [curName, setCurName] = useState(props.values.name);

    const [curStart, setCurStart] = useState(props.values.start);
    const [curEnd, setCurEnd] = useState(props.values.end);

    const [startDecomposed, setStartDecomposed] = useState(secondToHourMinuteSecond(props.values.start));
    const [endDecomposed, setEndDecomposed] = useState(secondToHourMinuteSecond(props.values.end));
    const [displayStart, setDisplayStart] = useState(secondToHourMinuteSecond(props.values.start));
    const [displayEnd, setDisplayEnd] = useState(secondToHourMinuteSecond(props.values.end));

    const titleInputElement = useRef<HTMLInputElement | null>(null);
    const videoElement = useRef<HTMLVideoElement | null>(null);

    const [videoLength, setVideoLength] = useState(1);
    const [videoLengthDecomposed, setVideoLengthDecomposed] = useState(secondToHourMinuteSecond(videoLength));
    const [isPlaying, setIsPlaying] = useState(false);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Start Time must be before End Time")

    const focusCanvasRef = useRef<HTMLCanvasElement>(null);
    const [rect, setRect] = useState({ startX: 0, startY: 0, width: 0, height: 0, updatedRect: false })
    const mouseDown = useRef(false);

    /**
     * Handle resetting values at initialization
     */
    useEffect(() => {
        setCurName(prevName => props.values.name);
        setCurStart(prevStart => props.values.start);
        setStartDecomposed(prev => secondToHourMinuteSecond(props.values.start));
        setDisplayStart(prev => secondToHourMinuteSecond(props.values.start))
        setCurEnd(prevEnd => props.values.end);
        setEndDecomposed(prev => secondToHourMinuteSecond(props.values.end));
        setDisplayEnd(prev => secondToHourMinuteSecond(props.values.end))
        setIsPlaying(false);
        setShowError(false);
    }, [props.values])

    useEffect(() => {
        setVideoLengthDecomposed(secondToHourMinuteSecond(videoLength));
    }, [videoLength])

    useEffect(() => {
        if (videoElement.current !== null) {
            videoElement.current.volume = props.volume / 100;
        }
    }, [props.volume])

    useEffect(() => {
        if (videoElement.current !== null) {
            if (props.mirrored) {
                videoElement.current.style.setProperty("transform", "rotateY(180deg)");
            } else {
                videoElement.current.style.setProperty("transform", "rotateY(0deg)");
            }
        }
    }, [props.mirrored])

    /**
     * Allow the user to change the name of the video
     */
    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurName(curName => event.target.value);
    }

    /**
     * Callback function that allows the multirange slider to update the start and end values
     */
    const handleTimeBoundsChange = (newMin: number, newMax: number) => {
        newMin = Math.round(newMin);
        newMax = Math.round(newMax);
        if (newMin !== curStart) {
            setCurStart(newMin);
        } else {
            setCurEnd(newMax);
        }
    }

    /**
     * Removes any decimals from the input
     */
    const cleanTimeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event !== null) {
            let value = event.target.value;
            console.log(value.slice(-1));
            if (value.slice(-1) === ".") {
                value = value.slice(0, -1)
            }
            return Number(value)
        }
        return 0;
    }

    /**
     * Error checks changes to the time bounds
     */
    const handleManualTimeBoundsChange = (pos: TimePos, unit: TimeUnit) => {
        if (pos === TimePos.START) {
            let tempTime = curStart;
            if (unit === TimeUnit.HOUR) {
                tempTime -= startDecomposed.hours * 3600;
                tempTime += displayStart.hours * 3600;
            } else if (unit === TimeUnit.MINUTE) {
                tempTime -= startDecomposed.minutes * 60;
                tempTime += displayStart.minutes * 60;
            } else {
                tempTime -= startDecomposed.seconds;
                tempTime += displayStart.seconds;
            }

            if (tempTime > curEnd) {
                setErrorMessage("Start Time must be before End Time");
                setShowError(true);
                setDisplayStart(startDecomposed);
            } else if (tempTime > videoLength) {
                setErrorMessage("Max Time: " + getMaxLengthError());
                setShowError(true);
                setDisplayStart(startDecomposed);
            } else {
                setShowError(false);
                setCurStart(tempTime);
            }
        } else {
            let tempTime = curEnd;
            if (unit === TimeUnit.HOUR) {
                tempTime -= endDecomposed.hours * 3600;
                tempTime += displayEnd.hours * 3600;
            } else if (unit === TimeUnit.MINUTE) {
                tempTime -= endDecomposed.minutes * 60;
                tempTime += displayEnd.minutes * 60;
            } else {
                tempTime -= endDecomposed.seconds;
                tempTime += displayEnd.seconds;
            }

            if (tempTime < curStart) {
                setErrorMessage("End Time must be after Start Time");
                setShowError(true);
                setDisplayEnd(endDecomposed)
            } else if (tempTime > videoLength) {
                setErrorMessage("Max Time: " + getMaxLengthError());
                setShowError(true);
                setDisplayEnd(endDecomposed)
            } else {
                setShowError(false);
                setCurEnd(tempTime);
            }
        }
    }

    /**
     * Returns the max length of the video for error message
     */
    const getMaxLengthError = () => {
        let error = "";
        if (videoLengthDecomposed.hours < 10) {
            error += "0"
        }
        error += videoLengthDecomposed.hours.toString() + ":";
        if (videoLengthDecomposed.minutes < 10) {
            error += "0"
        }
        error += videoLengthDecomposed.minutes.toString() + ":";
        if (videoLengthDecomposed.seconds < 10) {
            error += "0"
        }
        error += videoLengthDecomposed.seconds.toString();
        return error;
    }

    /**
     * Updates the startDecomposed values when curStart changes
     */
    useEffect(() => {
        setStartDecomposed(prev => secondToHourMinuteSecond(curStart));
        jumpInVideo(curStart);
    }, [curStart])

    useEffect(() => {
        setDisplayStart(startDecomposed);
    }, [startDecomposed])

    /**
    * Updates the endDecomposed values when curEnd changes
    */
    useEffect(() => {
        setEndDecomposed(prev => secondToHourMinuteSecond(curEnd));
        jumpInVideo(curEnd);
    }, [curEnd])

    useEffect(() => {
        setDisplayEnd(endDecomposed)
    }, [endDecomposed])

    /**
     * Toggles whether the view is playing or is paused
     */
    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    }

    useEffect(() => {
        if (videoElement.current !== null) {
            isPlaying ? videoElement.current.play() : videoElement.current.pause();
        }
    }, [isPlaying, videoElement])

    /**
     * Causes the video to jump to the time (in seconds) passed in
     */
    const jumpInVideo = (time: number) => {
        setIsPlaying(false);
        if (videoElement.current !== null) {
            videoElement.current.currentTime = time;
        }
    }

    /**
     * If the video reaches the end of the section defined by the bounds, jump back to the beginning
     */
    const handleVideoProgress = () => {
        if (videoElement.current !== null) {
            if (curEnd < videoElement.current.currentTime) {
                videoElement.current.currentTime = curStart;
            }
        }
    }

    /**
     * Starts and ends drawing a focus area on the focus canvas
     */
    const setFocusRect = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const focusCanvas = focusCanvasRef.current;
        if (!mouseDown.current && focusCanvas !== null) {
            const bounds = focusCanvas.getBoundingClientRect();
            console.log(bounds);
            mouseDown.current = true;
            setRect(prevRect => ({
                startX: (e.clientX - bounds.left) / bounds.width,
                startY: (e.clientY - bounds.top) / bounds.height,
                width: 0.05,
                height: 0.05,
                updatedRect: false
            }))
        } else {
            finalizeRect();
        }
    }

    /**
     * Allows the user to drag the focus rectangle to their desired size
     */
    const dragRect = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const focusCanvas = focusCanvasRef.current;
        if (focusCanvas !== null) {
            const focusCanvasCtx = focusCanvas.getContext("2d");
            const bounds = focusCanvas.getBoundingClientRect();
            const mouseX = (e.clientX - bounds.left) / bounds.width;
            const mouseY = (e.clientY - bounds.top) / bounds.height;

            if (mouseDown.current && focusCanvasCtx !== null) {
                focusCanvasCtx.clearRect(0, 0, focusCanvas.width, focusCanvas.height);
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
     * Scales the rectangle to the canvas
     */
    const getCanvasRect = (x: number, y: number, width: number, height: number) => {
        const focusCanvas = focusCanvasRef.current;
        if (focusCanvas !== null) {
            const bounds = focusCanvas.getBoundingClientRect();
            const canvasX = x * bounds.width;
            const canvasY = y * bounds.height;
            const canvasWidth = width * bounds.width;
            const canvasHeight = height * bounds.height;
            return ({ canvasX, canvasY, canvasWidth, canvasHeight })
        }
        return ({ canvasX: 0, canvasY: 0, canvasWidth: 0, canvasHeight: 0 });
    }

    /**
     * Draws the bounding rectangle on the focus selection canvas
     */
    const drawRect = () => {
        const focusCanvas = focusCanvasRef.current;
        if (focusCanvas !== null) {
            const bounds = focusCanvas.getBoundingClientRect();
            const focusCanvasCtx = focusCanvas.getContext("2d");
            if (focusCanvasCtx !== null) {
                focusCanvasCtx.clearRect(0, 0, focusCanvas.width, focusCanvas.height);
                focusCanvasCtx.fillStyle = "#000000C0";
                focusCanvasCtx.fillRect(0, 0, focusCanvas.width, focusCanvas.height);

                console.log(`Canvas Width: ${focusCanvas.width}`);
                console.log(`Bounds Width: ${bounds.width}`)

                const xScale = focusCanvas.width / bounds.width;
                const yScale = focusCanvas.height / bounds.height;
                const scaledRect = getCanvasRect(rect.startX, rect.startY, rect.width, rect.height);
                focusCanvasCtx.clearRect(scaledRect.canvasX * xScale, scaledRect.canvasY * yScale,
                    scaledRect.canvasWidth * xScale, scaledRect.canvasHeight * yScale);
            }
        }
    }

    /**
     * When user submits, check that startTime < endTime 
     * If successful: calculate startTime and endTime in terms of seconds then pass
     * name, start, and end to callback
     */
    const handleSubmit = () => {
        if (curStart <= curEnd) {
            setIsPlaying(false);
            setShowError(false);
            props.updater({ name: curName, start: curStart, end: curEnd }, props.values.index);
        } else {
            console.log("Invalid time input")
        }
    }

    return (
        <div className="chapter-editor-container">
            <div className="title-wrapper">
                <div className="title-input-wrapper">
                    <input ref={titleInputElement} className="chp-text-input title-input" type="text"
                        name="cname" value={curName} onChange={handleChangeName} />
                </div>
                <button onClick={() => titleInputElement.current?.focus()}>
                    <RiPencilFill className="edit-title" />
                </button>
            </div>

            <video ref={videoElement} className="edit-video" crossOrigin="Anonymous"
                onLoadedData={() => {
                    if (videoElement.current !== null) {
                        setVideoLength(videoElement.current?.duration);
                    }
                }}
                onTimeUpdate={handleVideoProgress}>
                <source src={props.videoSource} type="video/mp4" />
            </video>

            <canvas className="editor-focus-area" ref={focusCanvasRef} onMouseDown={setFocusRect} onMouseMove={dragRect} />

            <div className="time-bounds-slider">
                <MultiRangeSlider min={0} max={videoLength} onChange={handleTimeBoundsChange} minVal={curStart} maxVal={curEnd} />
            </div>

            <div className="time-text-container">
                <button className="editor-play-pause" onClick={togglePlay}>
                    {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
                </button>
                <div className="time-text-border">
                    <input type="number" min="0" max="999" value={(displayStart.hours < 10 ? "0" : "") + displayStart.hours.toString()}
                        onChange={(event) => { setDisplayStart(prev => { return { ...prev, hours: cleanTimeInput(event) } }) }}
                        onBlur={() => handleManualTimeBoundsChange(TimePos.START, TimeUnit.HOUR)}
                        onKeyDown={(event => { if (event.key === "Enter") handleManualTimeBoundsChange(TimePos.START, TimeUnit.HOUR) })}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(displayStart.minutes < 10 ? "0" : "") + displayStart.minutes.toString()}
                        onChange={(event) => { setDisplayStart(prev => { return { ...prev, minutes: cleanTimeInput(event) } }) }}
                        onBlur={() => handleManualTimeBoundsChange(TimePos.START, TimeUnit.MINUTE)}
                        onKeyDown={(event => { if (event.key === "Enter") { handleManualTimeBoundsChange(TimePos.START, TimeUnit.MINUTE) } })}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(displayStart.seconds < 10 ? "0" : "") + displayStart.seconds.toString()}
                        onChange={(event) => { setDisplayStart(prev => { return { ...prev, seconds: cleanTimeInput(event) } }) }}
                        onBlur={() => handleManualTimeBoundsChange(TimePos.START, TimeUnit.SECOND)}
                        onKeyDown={(event => { if (event.key === "Enter") handleManualTimeBoundsChange(TimePos.START, TimeUnit.SECOND) })}
                        className="time-text-input" />
                </div>
                &nbsp;-&nbsp;
                <div className="time-text-border">
                    <input type="number" min="0" max="999" value={(displayEnd.hours < 10 ? "0" : "") + displayEnd.hours.toString()}
                        onChange={(event) => { setDisplayEnd(prev => { return { ...prev, hours: cleanTimeInput(event) } }) }}
                        onBlur={() => handleManualTimeBoundsChange(TimePos.END, TimeUnit.HOUR)}
                        onKeyDown={(event => { if (event.key === "Enter") handleManualTimeBoundsChange(TimePos.END, TimeUnit.HOUR) })}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(displayEnd.minutes < 10 ? "0" : "") + displayEnd.minutes.toString()}
                        onChange={(event) => { setDisplayEnd(prev => { return { ...prev, minutes: cleanTimeInput(event) } }) }}
                        onBlur={() => handleManualTimeBoundsChange(TimePos.END, TimeUnit.MINUTE)}
                        onKeyDown={(event => { if (event.key === "Enter") handleManualTimeBoundsChange(TimePos.END, TimeUnit.MINUTE) })}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(displayEnd.seconds < 10 ? "0" : "") + displayEnd.seconds.toString()}
                        onChange={(event) => { setDisplayEnd(prev => { return { ...prev, seconds: cleanTimeInput(event) } }) }}
                        onBlur={() => handleManualTimeBoundsChange(TimePos.END, TimeUnit.SECOND)}
                        onKeyDown={(event => { if (event.key === "Enter") handleManualTimeBoundsChange(TimePos.END, TimeUnit.SECOND) })}
                        className="time-text-input" />
                </div>
            </div>

            {
                showError ?
                    <p className="error-message">
                        {errorMessage}
                    </p>
                    :
                    <p></p>
            }

            <button className="save-button" onClick={handleSubmit}>
                Save
            </button>
        </div>
    )
}

export default ChapterEditor;