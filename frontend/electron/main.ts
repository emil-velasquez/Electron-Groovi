import { app, ipcMain, BrowserWindow } from "electron";

import { createAuthWindow, createLogoutWindow } from "./main_processes/authProcess";
import { createAppWindow } from "./main_processes/appProcess";

import * as authService from "./services/authService";
import * as playlistService from "./services/playlistService";

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

    showWindow();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});