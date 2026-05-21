import { SAVE_KEY } from "./core.js";

/**
 * Removes the Number 1 save key and reloads the page. Caller must set any suppress-autosave flag
 * before invoking so `beforeunload` does not write a stale payload.
 */
export function clearNumber1SaveAndReload(storage) {
    try {
        storage.removeItem(SAVE_KEY);
    } catch (_) {
        /* ignore */
    }
    location.reload();
}
