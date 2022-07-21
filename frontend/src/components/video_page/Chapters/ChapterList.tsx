import "../../../styles/video_page/Chapters/ChapterListStyle.css"

import React, { useEffect, useState, useRef, forwardRef } from "react";

import ChapterEditor from "./ChapterEditor";
import Chapter from "./Chapter";

type ChapterType = {
    name: string,
    start: number,
    end: number
}

type ChapterListProps = {
    vidLength: string
}

function ChapterList(props: ChapterListProps, ref: any) {
    const [chapters, setChapters] = useState<ChapterType[]>([{ name: "test", start: 0, end: 100 }]);
    const [activeChapters, setActiveChapters] = useState<number[]>([]);
    const [currentChapter, setCurrentChapter] = useState<number>(0);

    const [editorValues, setEditorValues] = useState({ name: "Untitled", start: 0, end: 1, index: -1 });
    const [showEditor, setShowEditor] = useState(false);
    const firstRender = useRef(true);

    /**
     * Sets the values of the editor to be used before showed to the user
     */
    const resetChapterEditor = (newName: string, newStart: number, newEnd: number, newIndex: number) => {
        setEditorValues(prevValues => ({
            name: newName,
            start: newStart,
            end: newEnd,
            index: newIndex
        }));
    }

    /**
     * The editor is only reset whenever the next thing we want to do is show the editor
     */
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        } else {
            setShowEditor(true);
        }
    }, [editorValues])

    /**
     * Callback that allows us to close the ChapterEditor without submitting any values
     */
    const closeEditor = () => {
        setShowEditor(prev => false);
    }

    /**
     * Callback that allows the ChapterEditor to add or edit the current chapters
     */
    const updateChapters = (chapter: ChapterType, index: number) => {
        setShowEditor(prev => false);
        let updatedChapters = [...chapters];
        if (index === -1) {
            updatedChapters = [...updatedChapters, chapter];
        } else {
            updatedChapters[index] = chapter;
        }
        const sortedChapters = updatedChapters.sort((chap1, chap2) => {
            if (chap1.start > chap2.start) {
                return 1;
            } else if (chap1.start < chap2.start) {
                return -1;
            } else {
                return 0;
            }
        });
        setChapters(prevChapters => sortedChapters);
    }

    return (
        <div>
            <div className={showEditor ? "show-chapter-editor" : "hide-chapter-editor"}>
                <ChapterEditor values={editorValues} key={props.vidLength} maxVideoLength={props.vidLength}
                    closer={closeEditor} updater={updateChapters} />
            </div>
            <div className="chapter-list-container">
                <div className="header-section">
                    <p className="header">Chapters</p>
                    <button onClick={() => resetChapterEditor("Untitled", 0, 1, -1)}>
                        Plus
                    </button>
                </div>
                {chapters.map((curElement, idx) => <Chapter name={curElement.name} start={curElement.start}
                    end={curElement.end} index={idx} editor={resetChapterEditor} />)}
            </div>
        </div>
    )
}

export default forwardRef(ChapterList);