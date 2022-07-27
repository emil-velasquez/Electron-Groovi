import "../../../styles/video_page/Chapters/Chapter.css"

import React, { useState, useEffect } from "react";

import useTime from "../../../hooks/useTime";

type chapterProps = {
    name: string,
    start: number,
    end: number,
    index: number,
    editor: (newName: string, newStart: number, newEnd: number, newIndex: number) => void
    jumper: (time: number) => void;
    activator: (isActivated: boolean, index: number) => void;
}

function Chapter(props: chapterProps) {
    const [activated, setActivated] = useState(false);

    const secondToHourMinuteSecond = useTime();

    /**
     * Notify ChapterList whether or not this chapter is activated 
     */
    const toggleActivated = () => {
        setActivated(prevState => !prevState);
    }

    useEffect(() => {
        props.activator(activated, props.index);
    }, [activated])

    return (
        <div className="chapter-container" onClick={() => props.jumper(props.start)}>
            <div className="row">
                <p>{props.name}</p>
                <input type="checkbox" checked={activated} onChange={toggleActivated} />
                <button onClick={() => props.editor(props.name, props.start, props.end, props.index)}>
                    Edit
                </button>
                <button>
                    Delete
                </button>
            </div>
            <div className="row">
                <p>{secondToHourMinuteSecond(props.start).time + " - " + secondToHourMinuteSecond(props.end).time} </p>
            </div>
        </div>
    )
}

export default Chapter;