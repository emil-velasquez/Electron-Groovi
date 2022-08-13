import { contextBridge, ipcRenderer } from "electron";
import { ObjectId } from "mongodb";

export type AuthAPI = {
    getProfile: () => Promise<any>
    logOut: () => void
}

const authAPI: AuthAPI = {
    getProfile: () => ipcRenderer.invoke("auth:get-profile"),
    logOut: () => ipcRenderer.send("auth:log-out")
}

export type PlaylistAPI = {
    getPlaylist: (playlistID: ObjectId) => Promise<any>
}

const playlistAPI: PlaylistAPI = {
    getPlaylist: (id) => ipcRenderer.invoke("playlist:get-playlist", { playlistID: id })
}

contextBridge.exposeInMainWorld("authAPI", authAPI)
contextBridge.exposeInMainWorld("playlistAPI", playlistAPI)