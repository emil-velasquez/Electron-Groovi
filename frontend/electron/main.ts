import { app, ipcMain, BrowserWindow } from "electron";

import { createAuthWindow, createLogoutWindow } from "./main_processes/authProcess";
import { createAppWindow } from "./main_processes/appProcess";

import * as authService from "./services/authService";
import * as playlistService from "./services/playlistService";
import * as videoService from "./services/videoService";
import * as userService from "./services/userService";
import * as chapterListService from "./services/chapterListService";

/**
 * If the user has a valid refresh token on their machine, log them in.
 * Otherwise, direct them first to the Auth0 login screen
 */
const showWindow = async () => {
    try {
        await authService.refreshTokens();
        createAppWindow();
    } catch (error) {
        createAuthWindow();
    }
}

app.on("ready", () => {
    //auth service handlers
    ipcMain.handle("auth:get-profile", authService.getProfile);
    ipcMain.on("auth:log-out", () => {
        BrowserWindow.getAllWindows().forEach(window => window.close());
        createLogoutWindow();
    })

    //playlist service handlers
    ipcMain.handle("playlist:get-playlist", async (event, ...args) => {
        const id = args[0].playlistID;
        const result = await playlistService.getPlaylistInfo(id);
        return result;
    })

    //video service handlers
    ipcMain.handle("video:get-video", async (event, ...args) => {
        const id = args[0].videoID;
        const result = videoService.getVideoInfo(id);
        return result;
    })

    //user service handlers
    ipcMain.handle("user:get-user", async (event, ...args) => {
        const id = args[0].userID;
        const result = userService.getUserInfo(id);
        return result;
    })

    ipcMain.on("user:modify-chapter-map", async (event, ...args) => {
        const id = args[0].userId;
        const newMap = args[0].newMap;
        userService.modifyChapterMap(id, newMap);
    })

    //chapter list service handlers
    ipcMain.handle("chapterlist:get-list", async (event, ...args) => {
        const id = args[0].listID;
        const result = chapterListService.getChapterListInfo(id);
        return result;
    })

    ipcMain.handle("chapterlist:insert-new-list", async (event, ...args) => {
        const id = args[0].userId;
        const result = chapterListService.insertNewChapterList(id);
        return result;
    })

    ipcMain.on("chapterlist:modify-max-id", async (event, ...args) => {
        const userId = args[0].userId;
        const listId = args[0].listId;
        const newMaxId = args[0].newMaxId;
        chapterListService.modifyChapterCurMaxID(userId, listId, newMaxId);
    })

    ipcMain.on("chapterlist:modify-chapters", async (event, ...args) => {
        const userId = args[0].userId;
        const listId = args[0].listId;
        const newChapters = args[0].newChapters;
        chapterListService.modifyChapterList(userId, listId, newChapters);
    })

    showWindow();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});