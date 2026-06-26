/**
 * Coalesces objective + milestone DOM work when many updates stack in one turn.
 * @param {{ flush: () => void }} deps
 */
export function createNumber1ObjectivesBoot(deps) {
    let rafId = 0;

    function scheduleObjectiveDomFlush() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            deps.flush();
        });
    }

    return { scheduleObjectiveDomFlush };
}
