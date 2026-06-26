/**
 * Applies per-tick hand gains and batches deferred total/DOM refresh after autobuy
 * purchases that skip upgrade DOM (`skipUpgradeDom`).
 *
 * @param {object} deps
 * @param {() => number} deps.getUnlockedHands
 * @param {() => number[]} deps.getHandEarnings
 * @param {() => void} deps.refreshTotalFromHandEarnings
 * @param {() => Element | null} deps.getIncrementalCountEl
 * @param {(n: number) => string} deps.formatCount
 * @param {() => number} deps.getTotalChanges
 * @param {() => void} deps.updateObjectives
 * @param {() => void} deps.maybeShowFirstAscensionIntroOnUnlock
 */
export function createNumber1TickApplyStep(deps) {
    const {
        getUnlockedHands,
        getHandEarnings,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        updateObjectives,
        maybeShowFirstAscensionIntroOnUnlock
    } = deps;

    let autobuyDeferredTotalsFlush = false;

    function markAutobuyDeferredTotalsPending() {
        autobuyDeferredTotalsFlush = true;
    }

    function flushAutobuyDeferredTotalsIfAny() {
        if (!autobuyDeferredTotalsFlush) return;
        autobuyDeferredTotalsFlush = false;
        refreshTotalFromHandEarnings();
        const el = getIncrementalCountEl();
        if (el) el.textContent = formatCount(getTotalChanges());
    }

    function applyTickGains(tickGains, backgroundTab) {
        const n = getUnlockedHands();
        const handEarnings = getHandEarnings();
        for (let i = 0; i < n; i++) {
            handEarnings[i] += tickGains[i] || 0;
        }
        refreshTotalFromHandEarnings();
        if (!backgroundTab) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
            updateObjectives();
            maybeShowFirstAscensionIntroOnUnlock();
        }
    }

    return {
        applyTickGains,
        flushAutobuyDeferredTotalsIfAny,
        markAutobuyDeferredTotalsPending
    };
}
