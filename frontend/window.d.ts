import type { ContextBridgeAPI } from "./electron/main_processes/preload";

declare global {
    interface Window {
        electronAPI: ContextBridgeAPI
    }
}