import { contextBridge, ipcRenderer } from "electron";

import { ChapterMap, ChapterType } from "../models/chapterTypes";

//Authentication API
export type AuthAPI = {
    getProfile: () => Promise<any>
    logOut: () => void
}

const authAPI: AuthAPI = {
    getProfile: () => ipcRenderer.invoke("auth:get-profile"),
    logOut: () => ipcRenderer.send("auth:log-out")
}

//Playlist API
export type PlaylistAPI = {
    getPlaylist: (playlistID: string) => Promise<any>
}

const playlistAPI: PlaylistAPI = {
    getPlaylist: (id) => ipcRenderer.invoke("playlist:get-playlist", { playlistID: id })
}

//Video API
export type VideoAPI = {
    getVideo: (videoID: string) => Promise<any>
}

const videoAPI: VideoAPI = {
    getVideo: (id) => ipcRenderer.invoke("video:get-video", { videoID: id })
}

//User API
export type UserAPI = {
    getUser: (userID: string) => Promise<any>
    modifyChapterMap: (userId: string, newMap: ChapterMap) => void;
}

const userAPI: UserAPI = {
    getUser: (id) => ipcRenderer.invoke("user:get-user", { userID: id }),
    modifyChapterMap: (userId, newMap) => ipcRenderer.send("user:modify-chapter-map", { userId: userId, newMap: newMap })
}

//Chapter List API
export type ChapterListAPI = {
    getChapterList: (listID: string) => Promise<any>
    insertNewChapterList: (userId: string) => Promise<any>
    modifyChapterCurMaxID: (userId: string, listId: string, newMaxId: number) => void
    modifyChapters: (userId: string, listId: string, newChapters: ChapterType[]) => void
}

const chapterListAPI: ChapterListAPI = {
    getChapterList: (id) => ipcRenderer.invoke("chapterlist:get-list", { listID: id }),
    insertNewChapterList: (userId) => ipcRenderer.invoke("chapterlist:insert-new-list", { userId: userId }),
    modifyChapterCurMaxID: (userId, listId, newMaxId) => ipcRenderer.send("chapterlist:modify-max-id", { userId: userId, listId: listId, newMaxId: newMaxId }),
    modifyChapters: (userId, listId, newChapters) => ipcRenderer.send("chapterlist:modify-chapters", { userId: userId, listId: listId, newChapters: newChapters })
}

contextBridge.exposeInMainWorld("authAPI", authAPI)
contextBridge.exposeInMainWorld("playlistAPI", playlistAPI)
contextBridge.exposeInMainWorld("videoAPI", videoAPI)
contextBridge.exposeInMainWorld("userAPI", userAPI)
contextBridge.exposeInMainWorld("chapterListAPI", chapterListAPI)