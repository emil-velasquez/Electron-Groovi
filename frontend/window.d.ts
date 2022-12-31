import type { AuthAPI, PlaylistAPI, UserAPI, VideoAPI, ChapterListAPI } from "./electron/main_processes/preload";

declare global {
    interface Window {
        authAPI: AuthAPI,
        playlistAPI: PlaylistAPI,
        videoAPI: VideoAPI,
        userAPI: UserAPI,
        chapterListAPI: ChapterListAPI
    }
}