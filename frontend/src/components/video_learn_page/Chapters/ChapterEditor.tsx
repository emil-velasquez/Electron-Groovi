import "../../../styles/video_learn_page/Chapters/ChapterEditor.css"

import React, { useEffect, useState, useRef } from "react"
import { RiPencilFill } from "react-icons/ri";

import MultiRangeSlider from "../../utility/MultiRangeSlider";
import useTime from "../../../hooks/useTime";

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

    const titleInputElement = useRef<HTMLInputElement | null>(null);
    const videoElement = useRef<HTMLVideoElement | null>(null);

    const [videoLength, setVideoLength] = useState(1);

    /**
     * Handle resetting values at initialization
     */
    useEffect(() => {
        setCurName(prevName => props.values.name);
        setCurStart(prevStart => props.values.start);
        setStartDecomposed(prev => secondToHourMinuteSecond(props.values.start));
        setCurEnd(prevEnd => props.values.end);
        setEndDecomposed(prev => secondToHourMinuteSecond(props.values.end));
    }, [props.values])

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
     * Error checks changes to the time bounds
     */
    const handleManualTimeBoundsChange = (newValue: number, pos: TimePos, unit: TimeUnit) => {
        if (pos === TimePos.START) {
            let tempTime = curStart;
            if (unit === TimeUnit.HOUR) {
                tempTime -= startDecomposed.hours * 3600;
                tempTime += newValue * 3600;
            } else if (unit === TimeUnit.MINUTE) {
                tempTime -= startDecomposed.minutes * 60;
                tempTime += newValue * 60;
            } else {
                tempTime -= startDecomposed.seconds;
                tempTime += newValue;
            }
            if (tempTime < curEnd && tempTime < videoLength) {
                setCurStart(tempTime);
            }
        } else {
            let tempTime = curEnd;
            if (unit === TimeUnit.HOUR) {
                tempTime -= endDecomposed.hours * 3600;
                tempTime += newValue * 3600;
            } else if (unit === TimeUnit.MINUTE) {
                tempTime -= endDecomposed.minutes * 60;
                tempTime += newValue * 60;
            } else {
                tempTime -= endDecomposed.seconds;
                tempTime += newValue;
            }
            if (tempTime > curStart && tempTime < videoLength) {
                setCurEnd(tempTime);
            }
        }
    }

    /**
     * Updates the startDecomposed values when curStart changes
     */
    useEffect(() => {
        setStartDecomposed(prev => secondToHourMinuteSecond(curStart));
    }, [curStart])

    /**
    * Updates the endDecomposed values when curEnd changes
    */
    useEffect(() => {
        setEndDecomposed(prev => secondToHourMinuteSecond(curEnd));
    }, [curEnd])


    /**
     * When user submits, check that startTime < endTime 
     * If successful: calculate startTime and endTime in terms of seconds then pass
     * name, start, and end to callback
     */
    const handleSubmit = () => {
        if (curStart < curEnd) {
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
                onLoadedData={() => { if (videoElement.current !== null) setVideoLength(videoElement.current?.duration) }}>
                <source src={props.videoSource} type="video/mp4" />
            </video>

            <div className="time-bounds-slider">
                <MultiRangeSlider min={0} max={videoLength} onChange={handleTimeBoundsChange} minVal={curStart} maxVal={curEnd} />
            </div>

            <div className="time-text-container">
                <div className="time-text-border">
                    <input type="number" min="0" max="999" value={(startDecomposed.hours < 10 ? "0" : "") + startDecomposed.hours.toString()}
                        onChange={(event) => { handleManualTimeBoundsChange(Number(event.target.value), TimePos.START, TimeUnit.HOUR) }}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(startDecomposed.minutes < 10 ? "0" : "") + startDecomposed.minutes.toString()}
                        onChange={(event) => { handleManualTimeBoundsChange(Number(event.target.value), TimePos.START, TimeUnit.MINUTE) }}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(startDecomposed.seconds < 10 ? "0" : "") + startDecomposed.seconds.toString()}
                        onChange={(event) => { handleManualTimeBoundsChange(Number(event.target.value), TimePos.START, TimeUnit.SECOND) }}
                        className="time-text-input" />
                </div>
                &nbsp;-&nbsp;
                <div className="time-text-border">
                    <input type="number" min="0" max="999" value={(endDecomposed.hours < 10 ? "0" : "") + endDecomposed.hours.toString()}
                        onChange={(event) => { handleManualTimeBoundsChange(Number(event.target.value), TimePos.END, TimeUnit.HOUR) }}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(endDecomposed.minutes < 10 ? "0" : "") + endDecomposed.minutes.toString()}
                        onChange={(event) => { handleManualTimeBoundsChange(Number(event.target.value), TimePos.END, TimeUnit.MINUTE) }}
                        className="time-text-input" />
                </div>
                :
                <div className="time-text-border">
                    <input type="number" min="0" max="59" value={(endDecomposed.seconds < 10 ? "0" : "") + endDecomposed.seconds.toString()}
                        onChange={(event) => { handleManualTimeBoundsChange(Number(event.target.value), TimePos.END, TimeUnit.SECOND) }}
                        className="time-text-input" />
                </div>
            </div>


            <button className="save-button" onClick={handleSubmit}>
                Save
            </button>
        </div>
    )
}

export default ChapterEditor;