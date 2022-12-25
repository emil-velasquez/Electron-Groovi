import "../../../styles/video_learn_page/Chapters/ChapterListStyle.css"

import React, { useEffect, useState, useRef } from "react";

import ChapterEditor from "./ChapterEditor";
import Chapter from "./Chapter";

import { FiPlus } from "react-icons/fi";

type RectType = {
    startX: number,
    startY: number,
    width: number,
    height: number,
    updatedRect: boolean
}


type ChapterType = {
    name: string,
    start: number,
    end: number,
    rect: RectType
}

type ChapterListProps = {
    vidLength: string,
    jumper: (time: number) => void,
    vidProgress: number,
    viewState: number,
    videoSource: string,
    mirrored: boolean,
    volume: number,
    rect: RectType,
    setRect: (rect: RectType) => void,
    isSliding: boolean
}

function ChapterList(props: ChapterListProps) {
    const [chapters, setChapters] = useState<ChapterType[]>([{ name: "test", start: 5, end: 10, rect: { startX: 0, startY: 0, width: 1, height: 1, updatedRect: false } }, { name: "test2", start: 90, end: 100, rect: { startX: 0, startY: 0, width: 1, height: 1, updatedRect: false } }]);
    const [activeChapters, setActiveChapters] = useState<number[]>([]);
    const [curActiveChapterIdx, setCurActiveChapterIdx] = useState(0);

    const [editorValues, setEditorValues] = useState({ name: "Untitled", start: 0, end: Number(props.vidLength), rect: { startX: 0, startY: 0, width: 1, height: 1, updatedRect: false }, index: -1 });
    const [showEditor, setShowEditor] = useState(false);
    const firstRender = useRef(true);

    const defaultRect = useRef(props.rect);

    /**
     * Sets the values of the editor to be used before showed to the user
     */
    const resetChapterEditor = (newName: string, newStart: number, newEnd: number, newRect: RectType, newIndex: number) => {
        setEditorValues(prevValues => ({
            name: newName,
            start: newStart,
            end: newEnd,
            rect: newRect,
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
                if (chap1.end > chap2.end) {
                    return 1;
                } else if (chap1.end < chap2.end) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });
        setChapters(prevChapters => sortedChapters);
    }

    /**
     * If a chapter gets activated, add it to activeChapters (in sorted order)
     * If a chapter gets deactivated, remove it from activateChapters and subtract 1 from curActiveChapterIdx
     * if curActiveChapterIdx >= size of activateChapters
     */
    const toggleChapter = (isActivated: boolean, index: number) => {
        if (isActivated) {
            let newActiveChapters = [...activeChapters, index];
            const sortedChapters = newActiveChapters.sort();
            setActiveChapters(prevActiveChapters => sortedChapters);
        } else {
            setActiveChapters(prevActiveChapters => {
                const removedChapter = prevActiveChapters.filter((value) => value !== index);
                return removedChapter;
            });
        }
    }

    useEffect(() => {
        if (curActiveChapterIdx >= activeChapters.length && curActiveChapterIdx > 0) {
            setCurActiveChapterIdx(prevChap => prevChap - 1);
        }
    }, [activeChapters, curActiveChapterIdx])

    /**
     * If there are activated chapters, figure out based on progress and curActiveChapterIdx when 
     * and where to jump. Additionally, update the focus rect as appropriate
     */
    useEffect(() => {
        //if there is no active chapters, make sure that the rect is the default one
        if (activeChapters.length === 0) {
            if (JSON.stringify({ ...props.rect, updatedRect: false }) !== JSON.stringify({ ...defaultRect.current, updatedRect: false })) {
                defaultRect.current = props.rect;
            }
        }
        if (activeChapters.length > 0) {
            const curActiveChap = chapters[activeChapters[curActiveChapterIdx]];

            //if we are within the current chapter, make sure that the correct rect is applied to the video
            //if the rect is not correct, call the current rect the default and then update the rect
            if (props.vidProgress >= curActiveChap.start && props.vidProgress <= curActiveChap.end) {
                if (JSON.stringify({ ...props.rect, updatedRect: false }) !== JSON.stringify({ ...curActiveChap.rect, updatedRect: false })) {
                    defaultRect.current = props.rect;
                    props.setRect({ ...curActiveChap.rect, updatedRect: true });
                }
            }

            //if progress is not within active chapter, figure out next active chapter after current progress
            if (props.vidProgress < curActiveChap.start || props.vidProgress > curActiveChap.end + 1) {
                let foundNewActive = false;
                let potentialNewActiveIdx = 0;
                let potentialActiveChapter = chapters[activeChapters[potentialNewActiveIdx]];
                while (!foundNewActive && potentialNewActiveIdx < activeChapters.length) {
                    potentialActiveChapter = chapters[activeChapters[potentialNewActiveIdx]];
                    if (potentialActiveChapter.start >= props.vidProgress ||
                        (potentialActiveChapter.start <= props.vidProgress && props.vidProgress <= potentialActiveChapter.end)) {
                        foundNewActive = true;
                    }
                    potentialNewActiveIdx++;
                }
                potentialNewActiveIdx -= 1;
                setCurActiveChapterIdx(prevChapter => potentialNewActiveIdx);

                //if the user has scrolled in between the previous chapter and the next chapter, set the rect to the default
                if (props.vidProgress < potentialActiveChapter.start || props.vidProgress > potentialActiveChapter.end + 1) {
                    //check if the user wants to define a new default
                    if (JSON.stringify({ ...defaultRect.current, updatedRect: false }) !== JSON.stringify({ ...props.rect, updatedRect: false })
                        && JSON.stringify({ ...curActiveChap.rect, updatedRect: false }) !== JSON.stringify({ ...props.rect, updatedRect: false })) {
                        defaultRect.current = props.rect;
                    }
                    props.setRect({ ...defaultRect.current, updatedRect: true });
                }
            }

            //checking if we are at the end of the current active chapter
            //if so figure out the next active chapter and jump if necessary to its start
            if (curActiveChap.end <= props.vidProgress && props.vidProgress <= curActiveChap.end + 1) {
                let nextActiveChapterIdx = curActiveChapterIdx + 1;
                if (nextActiveChapterIdx >= activeChapters.length) {
                    nextActiveChapterIdx = 0;
                }
                const nextActiveChap = chapters[activeChapters[nextActiveChapterIdx]];
                setCurActiveChapterIdx(prevChapter => nextActiveChapterIdx);
                //update rect to new active chapter
                if (!props.isSliding) {
                    props.setRect({ ...nextActiveChap.rect, updatedRect: true });
                    if (!(curActiveChap.start < nextActiveChap.start
                        && nextActiveChap.start < curActiveChap.end
                        && curActiveChap.end < nextActiveChap.end)) {
                        props.jumper(nextActiveChap.start);
                    }
                } else {
                    props.setRect({ ...defaultRect.current, updatedRect: true })
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
                <ChapterEditor values={editorValues}
                    closer={closeEditor} updater={updateChapters} videoSource={props.videoSource}
                    mirrored={props.mirrored} volume={props.volume} />
            </div>
            <div className={chapterListHeightSelector(props.viewState)}>
                <div className="header-section">
                    <p className="header">Chapters</p>
                    <button onClick={() => resetChapterEditor("Untitled", 0, Number(props.vidLength), { startX: 0, startY: 0, width: 1, height: 1, updatedRect: false }, -1)}>
                        <FiPlus className="plus-button" />
                    </button>
                </div>
                <hr />
                <div className={props.viewState === 1 ? "chapter-section-short" : "chapter-section"}>
                    {chapters.map((curElement, idx) => <Chapter name={curElement.name} start={curElement.start}
                        end={curElement.end} rect={curElement.rect} index={idx} editor={resetChapterEditor} jumper={props.jumper}
                        activator={toggleChapter} />)}
                </div>
            </div>
        </div>
    )
}

export default ChapterList;