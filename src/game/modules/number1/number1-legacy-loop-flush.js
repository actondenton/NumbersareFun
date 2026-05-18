/**
 * Throttled post-step UI flush for the upgrade column and CPS headline.
 * Extracted from legacy-boot so deps are explicit (Phase 2 split).
 */
export function createNumber1LegacyLoopFlushUi(deps) {
    const {
        uiUpdateThrottleMs,
        getBatchedUpgradeUiFlush,
        setBatchedUpgradeUiFlush,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        updateRateDisplay
    } = deps;
    let lastUIUpdateMs = 0;
    return function flushLoopUi(_totalTicks, backgroundTab) {
        void _totalTicks;
        if (backgroundTab) return;
        const now = Date.now();
        if (now - lastUIUpdateMs >= uiUpdateThrottleMs || getBatchedUpgradeUiFlush()) {
            if (now - lastUIUpdateMs >= uiUpdateThrottleMs) lastUIUpdateMs = now;
            if (getBatchedUpgradeUiFlush()) setBatchedUpgradeUiFlush(false);
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateTimeWarpAuraUI();
            updateRateDisplay({ throttleCpsHeadline: true });
        }
    };
}
