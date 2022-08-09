import { contextBridge, ipcRenderer } from "electron";

export type ContextBridgeAPI = {
    getProfile: () => Promise<any>
    logOut: () => void
}

const electronAPI: ContextBridgeAPI = {
    getProfile: () => ipcRenderer.invoke("auth:get-profile"),
    logOut: () => ipcRenderer.send("auth:log-out")
}

contextBridge.exposeInMainWorld("electronAPI", electronAPI)