import "../../../styles/video_learn_page/Chapters/ChapterListStyle.css"

import React, { useEffect, useState, useRef } from "react";

import ChapterEditor from "./ChapterEditor";
import Chapter from "./Chapter";

import { FiPlus } from "react-icons/fi";

type ChapterType = {
    name: string,
    start: number,
    end: number
}

type ChapterListProps = {
    vidLength: string,
    jumper: (time: number) => void,
    vidProgress: number,
    viewState: number
}

function ChapterList(props: ChapterListProps) {
    const [chapters, setChapters] = useState<ChapterType[]>([{ name: "test", start: 0, end: 5 }]);
    const [activeChapters, setActiveChapters] = useState<number[]>([]);
    const [currentChapter, setCurrentChapter] = useState(0);

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

    /**
     * If a chapter gets activated, add it to activeChapters (in sorted order)
     * If a chapter gets deactivated, remove it from activateChapters and subtract 1 from currentChapter
     * if currentChapter >= size of activateChapters
     */
    const toggleChapter = (isActivated: boolean, index: number) => {
        if (isActivated) {
            setActiveChapters(prevActiveChapters => [...prevActiveChapters, index]);
        } else {
            setActiveChapters(prevActiveChapters => {
                const removedChapter = prevActiveChapters.filter((value) => value !== index);
                return removedChapter;
            });
        }
    }

    useEffect(() => {
        if (currentChapter >= activeChapters.length && currentChapter > 0) {
            setCurrentChapter(prevChap => prevChap - 1);
        }
    }, [activeChapters, currentChapter])

    /**
     * If there are activated chapters, figure out based on progress and currentChapter when 
     * and where to jump
     */
    useEffect(() => {
        if (activeChapters.length > 0) {
            const curActiveChap = chapters[activeChapters[currentChapter]];

            //if progress is not within active chapter, figure out next active chapter after current progress
            if (props.vidProgress < curActiveChap.start || props.vidProgress > curActiveChap.end + 1) {
                let foundNewActive = false;
                let potentialNewActiveIdx = 0;
                while (!foundNewActive && potentialNewActiveIdx < activeChapters.length) {
                    const potentialActiveChapter = chapters[activeChapters[potentialNewActiveIdx]];
                    if (potentialActiveChapter.start > props.vidProgress) {
                        foundNewActive = true;
                    }
                    potentialNewActiveIdx++;
                }
                if (potentialNewActiveIdx >= activeChapters.length) {
                    potentialNewActiveIdx = 0;
                }
                setCurrentChapter(prevChapter => potentialNewActiveIdx);
            }

            //checking if we are at the end of the current active chapter
            //if so figure out the next active chapter and jump if necessary to its start
            if (curActiveChap.end <= props.vidProgress && props.vidProgress <= curActiveChap.end + 1) {
                console.log("here")
                let nextActiveChapterIdx = currentChapter + 1;
                if (nextActiveChapterIdx >= activeChapters.length) {
                    nextActiveChapterIdx = 0;
                }
                const nextActiveChap = chapters[activeChapters[nextActiveChapterIdx]];
                setCurrentChapter(prevChapter => nextActiveChapterIdx);
                if (!(curActiveChap.start < nextActiveChap.start
                    && nextActiveChap.start < curActiveChap.end
                    && curActiveChap.end < nextActiveChap.end)) {
                    props.jumper(nextActiveChap.start);
                }
            }
        }
    }, [props.vidProgress])

    const chapterListHeightSelector = (viewState: number) => {
        if (viewState === 1) {
            return "chapter-list-container-short";
        } else {
            return "chapter-list-container";
        }
    }

    return (
        <div>
            <div className={showEditor ? "show-chapter-editor" : "hide-chapter-editor"}>
                <ChapterEditor values={editorValues} key={props.vidLength} maxVideoLength={props.vidLength}
                    closer={closeEditor} updater={updateChapters} />
            </div>
            <div className={chapterListHeightSelector(props.viewState)}>
                <div className="header-section">
                    <p className="header">Chapters</p>
                    <button onClick={() => resetChapterEditor("Untitled", 0, 1, -1)}>
                        <FiPlus className="plus-button" />
                    </button>
                </div>
                {chapters.map((curElement, idx) => <Chapter name={curElement.name} start={curElement.start}
                    end={curElement.end} index={idx} editor={resetChapterEditor} jumper={props.jumper}
                    activator={toggleChapter} />)}
            </div>
        </div>
    )
}

export default ChapterList;