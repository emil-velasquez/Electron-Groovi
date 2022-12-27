import "../../../styles/video_learn_page/Chapters/Chapter.css"

import React, { useState, useEffect } from "react";

import { RiPencilFill } from "react-icons/ri";
import { BsFillTrashFill } from "react-icons/bs";
import { ImLoop2 } from "react-icons/im";

import useTime from "../../../hooks/useTime";
import { RectType, ChapterTag } from "../../../models/VideoLearnPage/VideoLearnPageTypes";

type chapterProps = {
    name: string,
    start: number,
    end: number,
    rect: RectType,
    id: number,
    index: number,
    editor: (newName: string, newStart: number, newEnd: number, newRect: RectType, newId: number, newIndex: number) => void,
    jumper: (time: number) => void,
    activator: (isActivated: boolean, tag: ChapterTag) => void,
    deleter: (tag: ChapterTag) => void
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
        props.activator(activated, { id: props.id, index: props.index });
    }, [activated])

    return (
        <div className={activated ? "chapter-container-activated" : "chapter-container"} onClick={() => props.jumper(props.start)}>
            <div className="chapter-card-left">
                <p className={activated ? "chapter-card-text-activated" : "chapter-card-text"}>{props.name}</p>
                <p className={activated ? "chapter-card-text-activated" : "chapter-card-text"}>{secondToHourMinuteSecond(props.start).time + " - " + secondToHourMinuteSecond(props.end).time} </p>
            </div>
            <div>
                <button onClick={toggleActivated}>
                    <ImLoop2 className={activated ? "chapter-card-icon-activated" : "chapter-card-icon"} />
                </button>
                <br />
                <button onClick={() => props.editor(props.name, props.start, props.end, props.rect, props.id, props.index)}>
                    <RiPencilFill className={activated ? "chapter-card-icon-activated" : "chapter-card-icon"} />
                </button>
                <br />
                <button onClick={() => props.deleter({ id: props.id, index: props.index })}>
                    <BsFillTrashFill className={activated ? "chapter-card-icon-activated" : "chapter-card-icon"} />
                </button>
            </div>
        </div>
    )
}

export default Chapter;