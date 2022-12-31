import "../../../styles/video_learn_page/Chapters/ChapterListStyle.css"

import React, { useEffect, useState, useRef, useContext } from "react";

import ChapterEditor from "./ChapterEditor";
import Chapter from "./Chapter";

import { FiPlus } from "react-icons/fi";

import { RectType, ChapterTag, ChapterType, ChapterListType } from "../../../models/VideoLearnPage/VideoLearnPageTypes";
import { AppContext } from "../../../context/General/GeneralContext";

import { Types } from "../../../context/General/GeneralReducer";

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
    isSliding: boolean,
    videoId: string | undefined
}

function ChapterList(props: ChapterListProps) {
    const { state, dispatch } = useContext(AppContext)

    const [chapters, setChapters] = useState<ChapterType[]>([]);
    const [activeChapters, setActiveChapters] = useState<ChapterTag[]>([]);
    const [curActiveChapterIdx, setCurActiveChapterIdx] = useState(0);

    const [editorValues, setEditorValues] = useState({ name: "Untitled", start: 0, end: Number(props.vidLength), rect: { startX: 0, startY: 0, width: 1, height: 1, updatedRect: false }, id: -1, index: -1 });
    const [showEditor, setShowEditor] = useState(false);
    const firstRender = useRef(true);

    const [nextId, setNextId] = useState(0);

    const defaultRect = useRef(props.rect);
    const listId = useRef("");

    /**
     * Initializes the ChapterList to whatever information is saved from the user
     */
    useEffect(() => {
        const loadChapterList = async () => {
            const userChapterMap = state.user.chapterMap;
            if (props.videoId !== undefined) {
                const listID = userChapterMap[props.videoId];
                if (listID) {
                    listId.current = listID;
                    const listInfo: ChapterListType = await window.chapterListAPI.getChapterList(listID);
                    return listInfo;
                } else {
                    if (state.user._id !== undefined) {
                        console.log("here");
                        const newListID: string = await window.chapterListAPI.insertNewChapterList(state.user._id.toString());
                        listId.current = newListID;
                        let modifiedChapterMap = { ...state.user.chapterMap };
                        modifiedChapterMap[props.videoId] = newListID;
                        console.log(modifiedChapterMap);
                        await window.userAPI.modifyChapterMap(state.user._id.toString(), modifiedChapterMap);
                        dispatch({
                            type: Types.UpdateMap,
                            payload: {
                                chapterMap: modifiedChapterMap
                            }
                        })
                        return ({ chapters: [], curMaxID: 0 })
                    }
                }
            }
        }

        loadChapterList().then((result) => {
            if (result !== undefined) {
                setChapters(result.chapters)
                setNextId(result.curMaxID)
            }
        });
    }, [props.videoId])

    /**
     * Sets the values of the editor to be used before showed to the user
     */
    const resetChapterEditor = (newName: string, newStart: number, newEnd: number, newRect: RectType, newId: number, newIndex: number) => {
        setEditorValues(prevValues => ({
            name: newName,
            start: newStart,
            end: newEnd,
            rect: newRect,
            id: newId,
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
        if (chapter.id === -1) {
            chapter.id = nextId;
            setNextId(prev => prev + 1);
        }

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
     * Callback that allows a chapter to be deleted from the chapter list and from the activated list if necessary
     */
    const deleteChapters = (tag: ChapterTag) => {
        setActiveChapters(prevActiveChapters => {
            const removedChapter = prevActiveChapters.filter((value) => value.id !== tag.id);
            if (curActiveChapterIdx >= removedChapter.length && curActiveChapterIdx > 0) {
                setCurActiveChapterIdx(prevChap => prevChap - 1);
            }
            return removedChapter;
        })
        setChapters(prevChapters => {
            prevChapters.splice(tag.index, 1);
            const cloneSplicedChapters = [...prevChapters];
            return cloneSplicedChapters;
        })
    }

    /**
     * When chapter is updated, make sure that the activeChapter list is updated with any new indices
     * for the activated chapters (which could have been moved around)
     */
    useEffect(() => {
        const maxIndex = chapters.length;
        for (let tagIdx in activeChapters) {
            let tag = activeChapters[tagIdx];
            if (tag.index >= maxIndex || chapters[tag.index].id !== tag.id) {
                if (tag.index - 1 >= 0 && chapters[tag.index - 1].id === tag.id) {
                    activeChapters[tagIdx] = { ...activeChapters[tagIdx], index: tag.index - 1 }
                } else if (tag.index + 1 < maxIndex && chapters[tag.index + 1].id === tag.id) {
                    activeChapters[tagIdx] = { ...activeChapters[tagIdx], index: tag.index + 1 }
                }
            }
        }

        if (firstRender.current) {
            firstRender.current = false;
        } else {
            if (state.user._id !== undefined) {
                window.chapterListAPI.modifyChapters(state.user._id.toString(), listId.current, chapters)
            }
        }
    }, [chapters])

    /**
     * Save what the next new chapter's id should be to uniquely identify it for this song
     */
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        } else {
            if (state.user._id !== undefined) {
                window.chapterListAPI.modifyChapterCurMaxID(state.user._id.toString(), listId.current, nextId)
            }
        }
    }, [nextId])

    /**
     * If a chapter gets activated, add it to activeChapters (in sorted order)
     * If a chapter gets deactivated, remove it from activateChapters and subtract 1 from curActiveChapterIdx
     * if curActiveChapterIdx >= size of activateChapters
     */
    const toggleChapter = (isActivated: boolean, tag: ChapterTag) => {
        if (isActivated) {
            let newActiveChapters = [...activeChapters, tag];
            const sortedChapters = newActiveChapters.sort((chp1, chp2) => { return (chp1.index - chp2.index) });
            setActiveChapters(prevActiveChapters => sortedChapters);
        } else {
            setActiveChapters(prevActiveChapters => {
                const removedChapter = prevActiveChapters.filter((value) => value.id !== tag.id);
                return removedChapter;
            });
        }
    }

    /**
     * If the active chapter list is updated such that the last active chapter was deactived,
     * decrement cur active chapter index to stay within the active chapter list
     */
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
            try {
                const curActiveChap = chapters[activeChapters[curActiveChapterIdx].index];

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
                    let potentialActiveChapter = chapters[activeChapters[potentialNewActiveIdx].index];
                    while (!foundNewActive && potentialNewActiveIdx < activeChapters.length) {
                        potentialActiveChapter = chapters[activeChapters[potentialNewActiveIdx].index];
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
                    const nextActiveChap = chapters[activeChapters[nextActiveChapterIdx].index];
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
            } catch {
                console.error(chapters);
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
                    <button onClick={() => resetChapterEditor("Untitled", 0, Number(props.vidLength), { startX: 0, startY: 0, width: 1, height: 1, updatedRect: false }, -1, -1)}>
                        <FiPlus className="plus-button" />
                    </button>
                </div>
                <hr />
                <div className={props.viewState === 1 ? "chapter-section-short" : "chapter-section"}>
                    {chapters.map((curElement, idx) => <Chapter key={curElement.id} name={curElement.name} start={curElement.start}
                        end={curElement.end} rect={curElement.rect} id={curElement.id} index={idx} editor={resetChapterEditor} jumper={props.jumper}
                        activator={toggleChapter} deleter={deleteChapters} />)}
                </div>
            </div>
        </div>
    )
}

export default ChapterList;