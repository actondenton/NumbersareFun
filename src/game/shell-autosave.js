/**
 * Shell-level autosave timer and beforeunload hook (Phase 11 owner).
 *
 * @param {{ autosaveNow: () => void, intervalMs: number }} opts
 */
export function installGameShellAutosave({ autosaveNow, intervalMs }) {
    setInterval(autosaveNow, intervalMs);
    window.addEventListener("beforeunload", autosaveNow);
}
