import {
    COMBOS,
    COMBOS_BY_MIN_HANDS,
    computeComboUiInputDigest as computeComboUiInputDigestForValues,
    computeEarnedCatalogComboTierProducts as computeEarnedCatalogComboTierProductsForState,
    getActiveCombosForValues,
    getComboParticipatingHandIndicesForValues,
    getPatternCatalogMultiplierFromEarned
} from "./n1-combos.js";
import { createCombinationsPanelUi } from "./n1-combinations-panel-ui.js";
import { createCombinationsPanelRefresh } from "./n1-combinations-panel-refresh.js";
import { createComboFeedbackUi } from "./n1-combo-feedback-ui.js";
import { createComboDiscoveryUiLoop } from "./n1-combo-discovery-ui-loop.js";
import { updateComboDiscoveryMilestonePanelIfOpen as syncComboDiscoveryMilestonePanel } from "./n1-combo-discovery-milestone-ui.js";
import { ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP } from "../ascension/n1-ascension-grant-totals.js";

const COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS = 60000;
const COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS = 100;

/**
 * Combinations domain boot: catalog state, panel UI, discovery loop, CPS multipliers.
 *
 * @deps {object} combo - n1-combo-store slice
 * @deps {object} run - n1-run-store slice
 * @deps {object} ascension - n1-ascension-store slice
 * @deps {object} turbo - n1-turbo-store slice
 * @deps {function} getHands - () => HandCounter[]
 * @deps {function} getNearMissToleranceRanks
 * @deps {function} computeAscensionGrantTotals
 * @deps {function} formatCount
 * @deps {function} renderComboPagePerHandStatusSectionHtml
 * @deps {HTMLElement | null} pagePanelEl
 * @deps {HTMLElement | null} pagePanelBodyEl
 * @deps {HTMLElement | null} pagePanelTitleEl
 * @deps {HTMLElement | null} combinationsPageBtn
 * @deps {function} refreshCombinationsHandStatusIfOpen
 * @deps {function} addToLog
 * @deps {function} markMeaningfulProgress
 * @deps {function} updateRateDisplay
 * @deps {function} ledgerBeamPlayBonus
 * @deps {function} applyAscensionComboTimeWarpDelayReduction
 * @deps {function} addTurboBoostMeter
 * @deps {function} getTurboComboPoints
 * @deps {boolean} devTurboComboMeterGainDisabled
 * FORBIDDEN: deps.runtime, entire boot-number1 closures
 *
 * @param {object} deps
 */
export function createNumber1CombinationsBoot(deps) {
    const {
        combo,
        run,
        ascension,
        turbo,
        getHands,
        getNearMissToleranceRanks,
        computeAscensionGrantTotals,
        formatCount,
        renderComboPagePerHandStatusSectionHtml,
        pagePanelEl,
        pagePanelBodyEl,
        pagePanelTitleEl,
        combinationsPageBtn,
        refreshCombinationsHandStatusIfOpen,
        addToLog,
        markMeaningfulProgress,
        updateRateDisplay,
        ledgerBeamPlayBonus,
        applyAscensionComboTimeWarpDelayReduction,
        addTurboBoostMeter,
        getTurboComboPoints,
        devTurboComboMeterGainDisabled
    } = deps;

    function getHandValues() {
        return getHands().map(h => h.count);
    }
    function getActiveCombos() {
        const v = getHandValues();
        return getActiveCombosForValues(v, getNearMissToleranceRanks());
    }
    function getComboParticipatingHandIndices(c, v) {
        return getComboParticipatingHandIndicesForValues(c, v, run.unlockedHands, getNearMissToleranceRanks());
    }

    const earnedComboNames = combo.earnedComboNames;

    function getComboDiscoveryMilestoneCooldownMs() {
        const t = computeAscensionGrantTotals();
        const mult = Number(t.comboDiscoveryMilestoneCooldownMult) || 1;
        const m = Math.max(0.001, mult);
        return Math.max(
            COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS,
            Math.min(COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS, Math.round(COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS * m))
        );
    }

    function updateComboDiscoveryMilestonePanelIfOpen() {
        syncComboDiscoveryMilestonePanel({
            pagePanelEl,
            pagePanelTitleEl,
            unlockedHands: run.unlockedHands,
            milestoneCooldownMinMs: COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS,
            milestone: {
                pendingQueue: combo.comboDiscoveryMilestonePendingQueue,
                readyAtMs: combo.comboDiscoveryMilestoneReadyAtMs,
                cooldownSpanMs: combo.comboDiscoveryMilestoneCooldownSpanMs
            },
            getDefaultCooldownMs: getComboDiscoveryMilestoneCooldownMs
        });
    }

    let patchCombinationsPageLiveDom = () => false;
    let renderCombinationsPageHtml = () =>
        "<p class=\"message-log-empty\">Unlock Hand 2 to view combinations.</p>";
    let setComboIndexStatusFilter = function() {};
    let setComboIndexHandsFilter = function() {};
    let resetComboIndexFilters = function() {};
    let refreshCombinationsPanelIfOpen = function() {};
    let markCombinationsPanelOpenedClock = function() {};
    let consumeComboFilterClickDebounced = function() {
        return false;
    };

    ({
        patchCombinationsPageLiveDom,
        renderCombinationsPageHtml,
        setComboIndexStatusFilter,
        setComboIndexHandsFilter,
        resetComboIndexFilters
    } = createCombinationsPanelUi({
        combos: COMBOS,
        getUnlockedHands: () => run.unlockedHands,
        getEarnedComboNames: () => earnedComboNames,
        getActiveComboNames: () => getActiveCombos().map(c => c.name),
        getComboActivationCounts: () => combo.comboActivationCounts,
        formatCount,
        renderComboPagePerHandStatusSectionHtml
    }));

    let lastComboUiInputDigest = "";

    function computeComboUiInputDigest() {
        return computeComboUiInputDigestForValues(getHandValues(), run.unlockedHands, ascension.number1AscensionNodeIds);
    }
    function getCombosByMinHands() {
        return COMBOS_BY_MIN_HANDS;
    }
    function computeEarnedCatalogComboTierProducts() {
        return computeEarnedCatalogComboTierProductsForState(earnedComboNames, run.unlockedHands);
    }
    function getPatternCatalogMultiplier() {
        return getPatternCatalogMultiplierFromEarned(earnedComboNames, run.unlockedHands);
    }
    function getAscensionComboPatternMult() {
        if (run.unlockedHands < 2) return 1;
        const t = computeAscensionGrantTotals();
        return t.comboEarnedPatternMult > 1
            ? Math.min(ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP, t.comboEarnedPatternMult)
            : 1;
    }
    function getComboMultiplier() {
        if (run.unlockedHands < 2) return 1;
        return getPatternCatalogMultiplier() * getAscensionComboPatternMult();
    }
    function getTimeWarpComboMultiplier() {
        if (run.unlockedHands < 2) return 1;
        const t = computeAscensionGrantTotals();
        const flat = 1 + (t.comboMultAdd || 0);
        return getComboMultiplier() * flat;
    }

    const comboBubbleContainerEl =
        typeof document !== "undefined" ? document.getElementById("combo-bubble-container") : null;
    const { pulseCombinationsPageButtonForNewBonus, showComboBubble, updateEarnedBonusesUI } = createComboFeedbackUi({
        comboBubbleContainerEl,
        combinationsPageBtn,
        computeAscensionGrantTotals,
        getUnlockedHands: () => run.unlockedHands,
        getEarnedComboNames: () => earnedComboNames,
        getComboDiscoveryPendingQueue: () => combo.comboDiscoveryMilestonePendingQueue,
        getPatternCatalogMultiplier,
        getAscensionComboPatternMult,
        getComboMultiplier,
        getTimeWarpComboMultiplier,
        getCombosByMinHands
    });

    const combinationsPanelRefresh = createCombinationsPanelRefresh({
        getPagePanelEl: () => pagePanelEl,
        getPagePanelBodyEl: () => pagePanelBodyEl,
        getPagePanelTitleEl: () => pagePanelTitleEl,
        combinationsPageTitleText: "Combinations",
        getPatchCombinationsPageLiveDom: () => patchCombinationsPageLiveDom,
        getRenderCombinationsPageHtml: () => renderCombinationsPageHtml,
        refreshCombinationsHandStatusIfOpen,
        updateEarnedBonusesUI,
        updateComboDiscoveryMilestonePanelIfOpen
    });
    refreshCombinationsPanelIfOpen = combinationsPanelRefresh.refreshCombinationsPanelIfOpen;
    markCombinationsPanelOpenedClock = combinationsPanelRefresh.markCombinationsPanelOpenedClock;
    consumeComboFilterClickDebounced = combinationsPanelRefresh.consumeComboFilterClickDebounced;

    let tryProcessOneComboDiscoveryMilestone = function() {};
    let updateComboUI = function() {};
    ({
        tryProcessOneComboDiscoveryMilestone,
        updateComboUI
    } = createComboDiscoveryUiLoop({
        getUnlockedHands: () => run.unlockedHands,
        getEarnedComboNames: () => earnedComboNames,
        getMilestonePendingQueue: () => combo.comboDiscoveryMilestonePendingQueue,
        getMilestoneReadyAtMs: () => combo.comboDiscoveryMilestoneReadyAtMs,
        setMilestoneReadyAtMs: v => {
            combo.comboDiscoveryMilestoneReadyAtMs = v;
        },
        setMilestoneCooldownSpanMs: v => {
            combo.comboDiscoveryMilestoneCooldownSpanMs = v;
        },
        getPatternCatalogMultiplier,
        addToLog,
        markMeaningfulProgress,
        showComboBubble,
        pulseCombinationsPageButtonForNewBonus,
        updateEarnedBonusesUI,
        updateRateDisplay,
        playLedgerBeamBonus: (catalogBefore, catalogAfter, lbl) =>
            ledgerBeamPlayBonus(catalogBefore, catalogAfter, lbl),
        getComboDiscoveryMilestoneCooldownMs,
        computeComboUiInputDigest,
        isCombinationsPageOpen: () =>
            !!(
                pagePanelEl &&
                pagePanelEl.style.display !== "none" &&
                pagePanelTitleEl &&
                pagePanelTitleEl.textContent === "Combinations"
            ),
        getActiveCombos,
        getLastComboUiInputDigest: () => lastComboUiInputDigest,
        setLastComboUiInputDigest: v => {
            lastComboUiInputDigest = v;
        },
        getPreviousTickActiveComboNames: () => combo.previousTickActiveComboNames,
        setPreviousTickActiveComboNames: s => {
            combo.previousTickActiveComboNames = s;
        },
        getComboActivationCounts: () => combo.comboActivationCounts,
        applyAscensionComboTimeWarpDelayReduction,
        getTurboBoostUnlocked: () => turbo.turboBoostUnlocked,
        isTurboComboMeterGainEnabled: () => !devTurboComboMeterGainDisabled,
        addTurboBoostMeter,
        getTurboComboPoints,
        refreshCombinationsPanelIfOpen
    }));

    return {
        getComboDiscoveryMilestoneCooldownMs,
        updateComboDiscoveryMilestonePanelIfOpen,
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
        patchCombinationsPageLiveDom,
        renderCombinationsPageHtml,
        setComboIndexStatusFilter,
        setComboIndexHandsFilter,
        resetComboIndexFilters,
        refreshCombinationsPanelIfOpen,
        markCombinationsPanelOpenedClock,
        consumeComboFilterClickDebounced,
        tryProcessOneComboDiscoveryMilestone,
        updateComboUI,
        updateEarnedBonusesUI,
        pulseCombinationsPageButtonForNewBonus,
        showComboBubble
    };
}
