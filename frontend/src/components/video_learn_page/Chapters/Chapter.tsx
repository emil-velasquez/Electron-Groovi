import "../../../styles/video_learn_page/Chapters/Chapter.css"

import React, { useState, useEffect } from "react";

import { RiPencilFill } from "react-icons/ri";
import { BsFillTrashFill } from "react-icons/bs";

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
        <div className={activated ? "chapter-container-activated" : "chapter-container"} onClick={() => props.jumper(props.start)}>
            <div className="chapter-card-left">
                <p className={activated ? "chapter-card-text-activated" : "chapter-card-text"}>{props.name}</p>
                <p className={activated ? "chapter-card-text-activated" : "chapter-card-text"}>{secondToHourMinuteSecond(props.start).time + " - " + secondToHourMinuteSecond(props.end).time} </p>
                <label className={activated ? "chapter-card-text-activated" : "chapter-card-text"}><input type="checkbox" checked={activated} onChange={toggleActivated} />Loop</label>
            </div>
            <div>
                <button onClick={() => props.editor(props.name, props.start, props.end, props.index)}>
                    <RiPencilFill className={activated ? "chapter-card-icon-activated" : "chapter-card-icon"} />
                </button>
                <br />
                <button>
                    <BsFillTrashFill className={activated ? "chapter-card-icon-activated" : "chapter-card-icon"} />
                </button>
            </div>
        </div>
    )
}

export default Chapter;