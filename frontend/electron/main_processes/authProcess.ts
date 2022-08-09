import { BrowserWindow } from "electron";
import * as authService from "../services/authService";
import { createAppWindow } from "./appProcess";

let authWindow: Electron.BrowserWindow = null;

/**
 * Shows the user the Auth0 Universal login page
 */
const createAuthWindow = () => {
    destroyAuthWindow();

    authWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: false
        }
    });

    authWindow.loadURL(authService.getAuthenticationURL());

    const { session: { webRequest } } = authWindow.webContents;

    const filter = {
        urls: [
            'http://localhost/callback*'
        ]
    };

    webRequest.onBeforeRequest(filter, async ({ url }) => {
        await authService.loadTokens(url);
        createAppWindow();
        return destroyAuthWindow();
    });

    authWindow.on('closed', () => {
        authWindow = null;
    });
}

/**
 * If there exists a current AuthWindow, close and remove it
 */
const destroyAuthWindow = () => {
    if (!authWindow) return;
    authWindow.close();
    authWindow = null;
}

/**
 * Logs the user out on both Auth0's end and on the user's machine
 */
const createLogoutWindow = () => {
    const logoutWindow = new BrowserWindow({
        show: false,
    });

    logoutWindow.loadURL(authService.getLogoutUrl());

    logoutWindow.on("ready-to-show", async () => {
        await authService.logout();
        logoutWindow.close();
        createAuthWindow();
    });
}

export { createAuthWindow, createLogoutWindow }