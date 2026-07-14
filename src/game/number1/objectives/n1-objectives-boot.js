/**
 * Coalesces objective + milestone DOM work when many updates stack in one turn.
 * Memory achievement sync can run every schedule; DOM is throttled / skipped while hidden.
 *
 * @param {{
 *   flush: () => void,
 *   syncAchievementsOnly?: () => void
 * }} deps
 */
export function createNumber1ObjectivesBoot(deps) {
    let rafId = 0;
    let trailingTimerId = 0;
    let lastDomFlushMs = 0;
    const OBJECTIVES_DOM_THROTTLE_MS = 300;

    function runDomFlush() {
        lastDomFlushMs = Date.now();
        deps.flush();
    }

    function syncMemoryOnly() {
        if (typeof deps.syncAchievementsOnly === "function") deps.syncAchievementsOnly();
    }

    function scheduleObjectiveDomFlush() {
        if (typeof document !== "undefined" && document.hidden) {
            syncMemoryOnly();
            return;
        }
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            if (typeof document !== "undefined" && document.hidden) {
                syncMemoryOnly();
                return;
            }
            const now = Date.now();
            const elapsed = now - lastDomFlushMs;
            if (elapsed < OBJECTIVES_DOM_THROTTLE_MS) {
                syncMemoryOnly();
                if (!trailingTimerId) {
                    trailingTimerId = setTimeout(() => {
                        trailingTimerId = 0;
                        if (typeof document !== "undefined" && document.hidden) {
                            syncMemoryOnly();
                            return;
                        }
                        runDomFlush();
                    }, OBJECTIVES_DOM_THROTTLE_MS - elapsed);
                }
                return;
            }
            runDomFlush();
        });
    }

    return { scheduleObjectiveDomFlush };
}
