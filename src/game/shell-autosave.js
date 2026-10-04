/**
 * Shell-level autosave timer and beforeunload hook (Phase 11 owner).
 *
 * Interval saves are idle-deferred so the 10s timer does not hitch the same
 * turn as the game loop. beforeunload stays synchronous.
 *
 * @param {{ autosaveNow: (opts?: { background?: boolean }) => void, intervalMs: number }} opts
 */
export function installGameShellAutosave({ autosaveNow, intervalMs }) {
    let idleQueued = false;

    function queueIntervalAutosave() {
        if (idleQueued) return;
        idleQueued = true;
        const run = () => {
            idleQueued = false;
            autosaveNow({ background: true });
        };
        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(run, { timeout: 5000 });
        } else {
            setTimeout(run, 0);
        }
    }

    setInterval(queueIntervalAutosave, intervalMs);
    window.addEventListener("beforeunload", () => autosaveNow());
}
