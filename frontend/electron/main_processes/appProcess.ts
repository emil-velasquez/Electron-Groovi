import { BrowserWindow } from "electron";
import * as path from "path";

/**
 * Creates a window that shows the state of the app after a user
 * has logged in through Auth0
 */
const createAppWindow = () => {
    let appWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    appWindow.loadFile(path.join(__dirname, "..", "index.html"));

    appWindow.on("closed", () => {
        appWindow = null;
    });
}

export { createAppWindow };