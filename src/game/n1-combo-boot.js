import {
    COMBOS,
    COMBOS_BY_MIN_HANDS,
    computeEarnedCatalogComboTierProducts as computeEarnedCatalogComboTierProductsForState,
    computeComboUiInputDigest as computeComboUiInputDigestForValues,
    getActiveCombosForValues,
    getComboParticipatingHandIndicesForValues,
    getPatternCatalogMultiplierFromEarned,
    createComboFeedbackUi
} from "./modules/number1/combo.js";
import {
    createCombinationsPanelUi,
    createCombinationsPanelRefresh
} from "./modules/number1/combinations-panel.js";
import { createComboDiscoveryUiLoop } from "./modules/number1/combo-discovery.js";

/**
 * Wires combinations panel UI, combo feedback, discovery loop, and CPS combo multipliers for Number 1.
 * Mutable combo state (`earnedComboNames`, milestone queues, etc.) lives in the caller so save/load stays local.
 *
 * @param {object} deps
 * @param {() => import("./modules/number1/hands.js").HandCounter[]} deps.getHands
 * @param {() => number} deps.getUnlockedHands
 * @param {() => string[]} deps.getAscensionNodeIds
 * @param {() => number} deps.getNearMissToleranceRanks
 * @param {(n: number) => string} deps.formatCount
 * @param {() => string} deps.renderComboPagePerHandStatusSectionHtml
 * @param {() => import("./n1-ascension.js").AscensionGrantTotals} deps.computeAscensionGrantTotals
 * @param {number} deps.ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP
 * @param {HTMLElement | null} deps.combinationsPageBtn
 * @param {() => HTMLElement | null} deps.getPagePanelEl
 * @param {() => HTMLElement | null} deps.getPagePanelBodyEl
 * @param {() => HTMLElement | null} deps.getPagePanelTitleEl
 * @param {HTMLElement | null} deps.comboBubbleContainerEl
 * @param {() => number} deps.getComboDiscoveryMilestoneCooldownMs
 * @param {(msg: string) => void} deps.addToLog
 * @param {() => void} deps.markMeaningfulProgress
 * @param {(opts?: object) => void} deps.updateRateDisplay
 * @param {(catalogBefore: number, catalogAfter: number, lbl: string) => void} deps.playLedgerBeamBonus
 * @param {() => void} deps.applyAscensionComboTimeWarpDelayReduction
 * @param {() => boolean} deps.getTurboBoostUnlocked
 * @param {(pts: number) => void} deps.addTurboBoostMeter
 * @param {(comboName: string) => number} deps.getTurboComboPoints
 * @param {() => void} deps.refreshCombinationsHandStatusIfOpen
 * @param {string[]} deps.earnedComboNames — mutable catalog (same array reference for save snapshots)
 * @param {() => Record<string, number>} deps.getComboActivationCounts
 * @param {() => string[]} deps.getMilestonePendingQueue
 * @param {() => number} deps.getMilestoneReadyAtMs
 * @param {(v: number) => void} deps.setMilestoneReadyAtMs
 * @param {(v: number) => void} deps.setMilestoneCooldownSpanMs
 * @param {() => Set<string>} deps.getPreviousTickActiveComboNames
 * @param {(s: Set<string>) => void} deps.setPreviousTickActiveComboNames
 * @param {() => string} deps.getLastComboUiInputDigest
 * @param {(v: string) => void} deps.setLastComboUiInputDigest
 * @param {() => void} deps.updateComboDiscoveryMilestonePanelIfOpen
 */
export function createNumber1ComboBoot(deps) {
    const {
        getHands,
        getUnlockedHands,
        getAscensionNodeIds,
        getNearMissToleranceRanks,
        formatCount,
        renderComboPagePerHandStatusSectionHtml,
        computeAscensionGrantTotals,
        ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP,
        combinationsPageBtn,
        getPagePanelEl,
        getPagePanelBodyEl,
        getPagePanelTitleEl,
        comboBubbleContainerEl,
        getComboDiscoveryMilestoneCooldownMs,
        addToLog,
        markMeaningfulProgress,
        updateRateDisplay,
        playLedgerBeamBonus,
        applyAscensionComboTimeWarpDelayReduction,
        getTurboBoostUnlocked,
        addTurboBoostMeter,
        getTurboComboPoints,
        refreshCombinationsHandStatusIfOpen,
        earnedComboNames,
        getComboActivationCounts,
        getMilestonePendingQueue,
        getMilestoneReadyAtMs,
        setMilestoneReadyAtMs,
        setMilestoneCooldownSpanMs,
        getPreviousTickActiveComboNames,
        setPreviousTickActiveComboNames,
        getLastComboUiInputDigest,
        setLastComboUiInputDigest
    } = deps;

    function getHandValues() {
        return getHands().map(h => h.count);
    }
    function getActiveCombos() {
        const v = getHandValues();
        return getActiveCombosForValues(v, getNearMissToleranceRanks());
    }
    /** Hand indices that participate in an active combo (for ascension pulse split). */
    function getComboParticipatingHandIndices(c, v) {
        return getComboParticipatingHandIndicesForValues(c, v, getUnlockedHands(), getNearMissToleranceRanks());
    }

    /** Drives combo matching: unlocked hand digits + ascension-owned nodes (near-miss ranks derive from the latter). */
    function computeComboUiInputDigest() {
        return computeComboUiInputDigestForValues(getHandValues(), getUnlockedHands(), getAscensionNodeIds());
    }

    function getCombosByMinHands() {
        return COMBOS_BY_MIN_HANDS;
    }
    /**
     * Per tier: product of every earned combo in that tier (unlocked catalog only; activation counts do not scale this).
     * Tier products sum for the pattern-catalog multiplier (CPS and warp base; activation counts do not scale this).
     */
    function computeEarnedCatalogComboTierProducts() {
        return computeEarnedCatalogComboTierProductsForState(earnedComboNames, getUnlockedHands());
    }
    /** Sum of tier products for unlocked patterns (minimum 1). Multiplies CPS together with {@link getAscensionComboPatternMult}. */
    function getPatternCatalogMultiplier() {
        return getPatternCatalogMultiplierFromEarned(earnedComboNames, getUnlockedHands());
    }
    /** Middle-finger ascension pattern mult only (capped). Does not include the unlocked catalog. */
    function getAscensionComboPatternMult() {
        if (getUnlockedHands() < 2) return 1;
        const t = computeAscensionGrantTotals();
        return t.comboEarnedPatternMult > 1 ? Math.min(ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP, t.comboEarnedPatternMult) : 1;
    }
    /**
     * Combo multiplier applied to Number 1 CPS (ticks, offline, hand tooltips): Combo Catalog × Ascended Combo.
     */
    function getComboMultiplier() {
        if (getUnlockedHands() < 2) return 1;
        return getPatternCatalogMultiplier() * getAscensionComboPatternMult();
    }
    /**
     * Combo stack for Time Warp grants: same CPS combo product × index comboMultAdd.
     */
    function getTimeWarpComboMultiplier() {
        if (getUnlockedHands() < 2) return 1;
        const t = computeAscensionGrantTotals();
        const flat = 1 + (t.comboMultAdd || 0);
        return getComboMultiplier() * flat;
    }

    const {
        patchCombinationsPageLiveDom,
        renderCombinationsPageHtml,
        setComboIndexStatusFilter,
        setComboIndexHandsFilter,
        resetComboIndexFilters
    } = createCombinationsPanelUi({
        combos: COMBOS,
        getUnlockedHands,
        getEarnedComboNames: () => earnedComboNames,
        getActiveComboNames: () => getActiveCombos().map(c => c.name),
        getComboActivationCounts,
        formatCount,
        renderComboPagePerHandStatusSectionHtml
    });

    const {
        pulseCombinationsPageButtonForNewBonus,
        showComboBubble,
        updateEarnedBonusesUI
    } = createComboFeedbackUi({
        comboBubbleContainerEl,
        combinationsPageBtn,
        computeAscensionGrantTotals,
        getUnlockedHands,
        getEarnedComboNames: () => earnedComboNames,
        getComboDiscoveryPendingQueue: getMilestonePendingQueue,
        getPatternCatalogMultiplier,
        getAscensionComboPatternMult,
        getComboMultiplier,
        getTimeWarpComboMultiplier,
        getCombosByMinHands
    });
    const combinationsPanelRefresh = createCombinationsPanelRefresh({
        getPagePanelEl,
        getPagePanelBodyEl,
        getPagePanelTitleEl,
        combinationsPageTitleText: "Combinations",
        getPatchCombinationsPageLiveDom: () => patchCombinationsPageLiveDom,
        getRenderCombinationsPageHtml: () => renderCombinationsPageHtml,
        refreshCombinationsHandStatusIfOpen,
        updateEarnedBonusesUI,
        updateComboDiscoveryMilestonePanelIfOpen: deps.updateComboDiscoveryMilestonePanelIfOpen
    });

    const {
        tryProcessOneComboDiscoveryMilestone,
        updateComboUI
    } = createComboDiscoveryUiLoop({
        getUnlockedHands,
        getEarnedComboNames: () => earnedComboNames,
        getMilestonePendingQueue,
        getMilestoneReadyAtMs,
        setMilestoneReadyAtMs,
        setMilestoneCooldownSpanMs,
        getPatternCatalogMultiplier,
        addToLog,
        markMeaningfulProgress,
        showComboBubble,
        pulseCombinationsPageButtonForNewBonus,
        updateEarnedBonusesUI,
        updateRateDisplay,
        playLedgerBeamBonus,
        getComboDiscoveryMilestoneCooldownMs,
        computeComboUiInputDigest,
        isCombinationsPageOpen: () =>
            !!(
                getPagePanelEl() &&
                getPagePanelEl().style.display !== "none" &&
                getPagePanelTitleEl() &&
                getPagePanelTitleEl().textContent === "Combinations"
            ),
        getActiveCombos,
        getLastComboUiInputDigest,
        setLastComboUiInputDigest,
        getPreviousTickActiveComboNames,
        setPreviousTickActiveComboNames,
        getComboActivationCounts,
        applyAscensionComboTimeWarpDelayReduction,
        getTurboBoostUnlocked,
        getBlackHoleState: deps.getBlackHoleState,
        isComboTurboFillFromCombosEnabled: deps.isComboTurboFillFromCombosEnabled,
        addTurboBoostMeter,
        getTurboComboPoints,
        refreshCombinationsPanelIfOpen: combinationsPanelRefresh.refreshCombinationsPanelIfOpen
    });

    return {
        patchCombinationsPageLiveDom,
        renderCombinationsPageHtml,
        setComboIndexStatusFilter,
        setComboIndexHandsFilter,
        resetComboIndexFilters,
        refreshCombinationsPanelIfOpen: combinationsPanelRefresh.refreshCombinationsPanelIfOpen,
        markCombinationsPanelOpenedClock: combinationsPanelRefresh.markCombinationsPanelOpenedClock,
        consumeComboFilterClickDebounced: combinationsPanelRefresh.consumeComboFilterClickDebounced,
        tryProcessOneComboDiscoveryMilestone,
        updateComboUI,
        getHandValues,
        getActiveCombos,
        getComboParticipatingHandIndices,
        computeComboUiInputDigest,
        getCombosByMinHands,
        computeEarnedCatalogComboTierProducts,
        getPatternCatalogMultiplier,
        getAscensionComboPatternMult,
        getComboMultiplier,
        getTimeWarpComboMultiplier,
        pulseCombinationsPageButtonForNewBonus,
        showComboBubble,
        updateEarnedBonusesUI
    };
}
