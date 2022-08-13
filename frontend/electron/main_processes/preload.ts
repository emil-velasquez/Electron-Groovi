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
    getPlaylist: (playlistID: ObjectId) => Promise<any>
}

const playlistAPI: PlaylistAPI = {
    getPlaylist: (id) => ipcRenderer.invoke("playlist:get-playlist", { playlistID: id })
}

//Video API
export type VideoAPI = {
    getVideo: (videoID: ObjectId) => Promise<any>
}

const videoAPI: VideoAPI = {
    getVideo: (id) => ipcRenderer.invoke("video:get-video", { videoID: id })
}

//User API
export type UserAPI = {
    getUser: (userID: ObjectId) => Promise<any>
}

const userAPI: UserAPI = {
    getUser: (id) => ipcRenderer.invoke("user:get-user", { userID: id })
}

contextBridge.exposeInMainWorld("authAPI", authAPI)
contextBridge.exposeInMainWorld("playlistAPI", playlistAPI)
contextBridge.exposeInMainWorld("videoAPI", videoAPI)
contextBridge.exposeInMainWorld("userAPI", userAPI)