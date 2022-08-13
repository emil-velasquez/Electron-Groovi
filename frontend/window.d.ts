import type { AuthAPI, PlaylistAPI, VideoAPI } from "./electron/main_processes/preload";

declare global {
    interface Window {
        authAPI: AuthAPI,
        playlistAPI: PlaylistAPI,
        videoAPI: VideoAPI
    }
}