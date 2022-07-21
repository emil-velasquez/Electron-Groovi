import "../../../styles/video_page/Chapters/Chapter.css"

import React, { useState } from "react";

import useTime from "../../../hooks/useTime";

type chapterProps = {
    name: string,
    start: number,
    end: number,
    index: number,
    editor: (newName: string, newStart: number, newEnd: number, newIndex: number) => void
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

    return (
        <div className="chapter-container">
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