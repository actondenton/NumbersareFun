/** Throttling + selective rebuild for the Combinations page panel (#page-panel-body). */

const COMBO_FILTER_DEBOUNCE_MS = 220;
const COMBO_FILTER_LOCK_MS = 220;
const COMBO_FILTER_PAUSE_AUTO_REFRESH_MS = 1000;
const COMBINATIONS_FULL_REFRESH_MIN_MS = 350;

/**
 * @param {{
 *   getPagePanelEl: () => HTMLElement | null | undefined,
 *   getPagePanelBodyEl: () => HTMLElement | null | undefined,
 *   getPagePanelTitleEl: () => HTMLElement | null | undefined,
 *   combinationsPageTitleText: string,
 *   getPatchCombinationsPageLiveDom: () => () => boolean,
 *   getRenderCombinationsPageHtml: () => () => string,
 *   refreshCombinationsHandStatusIfOpen: () => void,
 *   updateEarnedBonusesUI: (forceRebuild?: boolean) => void,
 *   updateComboDiscoveryMilestonePanelIfOpen: () => void,
 * }} deps
 */
export function createCombinationsPanelRefresh(deps) {
    let comboFilterInteractionLockUntilMs = 0;
    let comboFilterLastApplyAtMs = 0;
    let comboFilterPauseAutoRefreshUntilMs = 0;
    let lastCombinationsFullRefreshMs = 0;

    /** Call when opening Combinations from the nav so the throttle clock matches user intent. */
    function markCombinationsPanelOpenedClock() {
        lastCombinationsFullRefreshMs = Date.now();
    }

    /** @returns {boolean} false when clicks should be ignored (debounce / interaction lock). */
    function consumeComboFilterClickDebounced(now) {
        if (now < comboFilterInteractionLockUntilMs) return false;
        if (now - comboFilterLastApplyAtMs < COMBO_FILTER_DEBOUNCE_MS) return false;
        comboFilterLastApplyAtMs = now;
        comboFilterInteractionLockUntilMs = now + COMBO_FILTER_LOCK_MS;
        comboFilterPauseAutoRefreshUntilMs = now + COMBO_FILTER_PAUSE_AUTO_REFRESH_MS;
        return true;
    }

    function refreshCombinationsPanelIfOpen(force) {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        const pagePanelTitleEl = deps.getPagePanelTitleEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl || !pagePanelTitleEl) return;
        if (pagePanelTitleEl.textContent !== deps.combinationsPageTitleText) return;
        const now = Date.now();
        const patchCombinationsPageLiveDom = deps.getPatchCombinationsPageLiveDom();
        const renderCombinationsPageHtml = deps.getRenderCombinationsPageHtml();
        if (!force && now < comboFilterPauseAutoRefreshUntilMs) {
            patchCombinationsPageLiveDom();
            deps.refreshCombinationsHandStatusIfOpen();
            deps.updateEarnedBonusesUI(false);
        } else if (!force && now - lastCombinationsFullRefreshMs < COMBINATIONS_FULL_REFRESH_MIN_MS) {
            patchCombinationsPageLiveDom();
            deps.refreshCombinationsHandStatusIfOpen();
            deps.updateEarnedBonusesUI(false);
        } else {
            lastCombinationsFullRefreshMs = now;
            if (force) {
                pagePanelBodyEl.innerHTML = renderCombinationsPageHtml();
                deps.updateEarnedBonusesUI();
            } else if (patchCombinationsPageLiveDom()) {
                deps.refreshCombinationsHandStatusIfOpen();
                deps.updateEarnedBonusesUI(false);
            } else {
                pagePanelBodyEl.innerHTML = renderCombinationsPageHtml();
                deps.updateEarnedBonusesUI();
            }
        }
        deps.updateComboDiscoveryMilestonePanelIfOpen();
    }

    return {
        refreshCombinationsPanelIfOpen,
        markCombinationsPanelOpenedClock,
        consumeComboFilterClickDebounced
    };
}
