import "../../../styles/video_learn_page/Chapters/ChapterEditor.css"

import React, { useEffect, useState } from "react"

import useTime from "../../../hooks/useTime";

type ChapterType = {
    name: string,
    start: number,
    end: number
}

type ChapterEditorProps = {
    values: {
        name: string,
        start: number,
        end: number,
        index: number
    },
    maxVideoLength: string,
    closer: () => void,
    updater: (chapter: ChapterType, index: number) => void
}

function ChapterEditor(props: ChapterEditorProps) {
    const secondToHourMinuteSecond = useTime();

    const [maxVideoLength, setMaxVideoLength] = useState(secondToHourMinuteSecond(props.maxVideoLength));
    const [curName, setCurName] = useState(props.values.name);
    const [curStart, setCurStart] = useState(secondToHourMinuteSecond(props.values.start));
    const [curEnd, setCurEnd] = useState(secondToHourMinuteSecond(props.values.end));

    /**
     * Handle resetting values at initialization
     */
    useEffect(() => {
        setCurName(prevName => props.values.name);
        setCurStart(prevStart => secondToHourMinuteSecond(props.values.start));
        setCurEnd(prevEnd => secondToHourMinuteSecond(props.values.end));
    }, [props.values])

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurName(curName => event.target.value);
    }

    /**
     * Updates the start time, checking that it never exceeds the length of the video
     */
    const handleChangeStart = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newTime = Number(event.target.value);
        if (event.target.name === "startHour") {
            newTime = newTime > maxVideoLength.hours ? maxVideoLength.hours : newTime;
            setCurStart(prevStart => ({ ...prevStart, hours: newTime }))
        } else if (event.target.name === "startMinute") {
            newTime = newTime > maxVideoLength.minutes
                && curStart.hours === maxVideoLength.hours ? maxVideoLength.minutes :
                newTime > 59 ? 59 : newTime;
            setCurStart(prevStart => ({ ...prevStart, minutes: newTime }))
        } else {
            newTime = newTime > maxVideoLength.seconds && curStart.hours === maxVideoLength.hours
                && curStart.minutes === maxVideoLength.minutes ? maxVideoLength.seconds :
                newTime > 59 ? 59 : newTime;
            setCurStart(prevStart => ({ ...prevStart, seconds: newTime }))
        }
    }

    /**
     * Updates the end time, checking that it never exceeds the length of the video
     */
    const handleChangeEnd = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newTime = Number(event.target.value);
        if (event.target.name === "endHour") {
            newTime = newTime > maxVideoLength.hours ? maxVideoLength.hours : newTime;
            setCurEnd(prevStart => ({ ...prevStart, hours: newTime }))
        } else if (event.target.name === "endMinute") {
            newTime = newTime > maxVideoLength.minutes
                && curEnd.hours === maxVideoLength.hours ? maxVideoLength.minutes :
                newTime > 59 ? 59 : newTime;;
            setCurEnd(prevStart => ({ ...prevStart, minutes: newTime }))
        } else {
            newTime = newTime > maxVideoLength.seconds && curEnd.hours === maxVideoLength.hours
                && curEnd.minutes === maxVideoLength.minutes ? maxVideoLength.seconds :
                newTime > 59 ? 59 : newTime;
            setCurEnd(prevStart => ({ ...prevStart, seconds: newTime }))
        }
    }

    /**
     * When user submits, check that startTime < endTime 
     * If successful: calculate startTime and endTime in terms of seconds then pass
     * name, start, and end to callback
     */
    const handleSubmit = () => {
        const startInSeconds = curStart.hours * 3600 + curStart.minutes * 60 + curStart.seconds;
        const endInSeconds = curEnd.hours * 3600 + curEnd.minutes * 60 + curEnd.seconds;
        if (startInSeconds < endInSeconds) {
            props.updater({ name: curName, start: startInSeconds, end: endInSeconds }, props.values.index);
        } else {
            console.log("Invalid time input")
        }
    }

    return (
        <div className="chapter-editor-container">
            <div className="header">
                <p>Edit Chapter</p>
                <button onClick={props.closer}>
                    Exit
                </button>
            </div>

            <label htmlFor="cname">Name: </label>
            <input type="text" name="cname" value={curName} onChange={handleChangeName} />
            <br />

            <div className="time">
                <p>Start: </p>
                <input className="time-input" name="startHour" type="number"
                    value={curStart.hours.toString()} onChange={handleChangeStart}
                    min="0" />
                <p>:</p>
                <input className="time-input" name="startMinute" type="number"
                    value={curStart.minutes.toString()} onChange={handleChangeStart}
                    min="0" />
                <p>:</p>
                <input className="time-input" name="startSecond" type="number"
                    value={curStart.seconds.toString()} onChange={handleChangeStart}
                    min="0" />
            </div>

            <div className="time">
                <p>End: </p>
                <input className="time-input" name="endHour" type="number"
                    value={curEnd.hours.toString()} onChange={handleChangeEnd}
                    min="0" />
                <p>:</p>
                <input className="time-input" name="endMinute" type="number"
                    value={curEnd.minutes.toString()} onChange={handleChangeEnd}
                    min="0" />
                <p>:</p>
                <input className="time-input" name="endSecond" type="number"
                    value={curEnd.seconds.toString()} onChange={handleChangeEnd}
                    min="0" />
            </div>

            <button onClick={handleSubmit}>
                Submit
            </button>
        </div>
    )
}

export default ChapterEditor;