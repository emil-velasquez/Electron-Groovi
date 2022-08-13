import type { AuthAPI, PlaylistAPI } from "./electron/main_processes/preload";

declare global {
    interface Window {
        authAPI: AuthAPI,
        playlistAPI: PlaylistAPI
    }
}