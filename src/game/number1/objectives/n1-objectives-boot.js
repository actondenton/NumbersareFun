/**
 * Coalesces objective + milestone DOM work when many updates stack in one turn.
 * Memory achievement sync can run every schedule; DOM is throttled / skipped while hidden.
 *
 * Accepts either the shared game context `g` (uses `updateObjectives` /
 * `syncObjectiveAchievements`) or an explicit `{ flush, syncAchievementsOnly }` bag.
 *
 * @param {object} gOrDeps
 */
export function createNumber1ObjectivesBoot(gOrDeps) {
    const flush =
        typeof gOrDeps.flush === "function"
            ? gOrDeps.flush
            : () => {
                  gOrDeps.updateObjectives();
              };
    const syncAchievementsOnly =
        typeof gOrDeps.syncAchievementsOnly === "function"
            ? gOrDeps.syncAchievementsOnly
            : () => {
                  if (typeof gOrDeps.syncObjectiveAchievements === "function") {
                      gOrDeps.syncObjectiveAchievements();
                  }
              };

    let rafId = 0;
    let trailingTimerId = 0;
    let lastDomFlushMs = 0;
    const OBJECTIVES_DOM_THROTTLE_MS = 300;

    function runDomFlush() {
        lastDomFlushMs = Date.now();
        flush();
    }

    function syncMemoryOnly() {
        syncAchievementsOnly();
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
