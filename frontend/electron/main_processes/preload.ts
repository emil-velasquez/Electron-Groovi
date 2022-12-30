import { contextBridge, ipcRenderer } from "electron";
import { ObjectId } from "mongodb";

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
}

const userAPI: UserAPI = {
    getUser: (id) => ipcRenderer.invoke("user:get-user", { userID: id })
}

//Chapter List API
export type ChapterListAPI = {
    getChapterList: (listID: string) => Promise<any>
}

const chapterListAPI: ChapterListAPI = {
    getChapterList: (id) => ipcRenderer.invoke("chapterlist:get-list", { listID: id })
}

contextBridge.exposeInMainWorld("authAPI", authAPI)
contextBridge.exposeInMainWorld("playlistAPI", playlistAPI)
contextBridge.exposeInMainWorld("videoAPI", videoAPI)
contextBridge.exposeInMainWorld("userAPI", userAPI)
contextBridge.exposeInMainWorld("chapterListAPI", chapterListAPI)