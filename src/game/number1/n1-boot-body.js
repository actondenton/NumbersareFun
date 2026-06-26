import {
    NUMBER2_ASCENSION_READY_TOTAL
} from "../number2/number2-rules.js";
import {
    BLACK_HOLE_EVAPORATION_CAP,
    BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS,
    BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS,
    BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS,
    BLACK_HOLE_FURNACE_MULT_PER_POWER,
    BLACK_HOLE_MAX_LEVEL,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP,
    BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC,
    createNumber1BlackHoleState,
    createNumber1BlackHoleUxFlags,
    getBlackHolePhase2MassCouplingAscensionEssenceBonus,
    getBlackHolePhase2ErgosphereTurboActivationBonus,
    getBlackHoleErgosphereActivationsTooltipSuffix,
    getBlackHolePhotonShellLevelerTooltipSuffix,
} from "./black-hole/number1-black-hole.js";
import { createApplyHandSacrifice } from "./black-hole/n1-hand-sacrifice.js";
import { getPhase2CollapseEffectHtml } from "./black-hole/n1-black-hole-upgrade-preview.js";
import { createAscensionMapUi } from "./ascension/n1-ascension-map-ui.js";
import {
    createNumber2Controller,
    createNumber2State
} from "../number2/number2-game.js";
import { hands1 } from "./hands/n1-hand-ascii.js";
import {
    formatBlackHoleMultForUi,
    formatCompactMultiplier,
    formatCount,
    formatSeconds,
    formatTurboBoostMultiplierForDisplay,
    formatWithCommas
} from "./shell-ui/n1-format.js";
import { createLogTickerRuntime } from "./shell-ui/n1-log-ticker-runtime.js";
import { createShellPanelsUi } from "./shell-ui/n1-shell-panels.js";
import { formatUpgradeAffordEtaDuration, createUpgradeEtaSmoother } from "./upgrades/n1-upgrade-eta.js";
import { createUpgradeUiController } from "./upgrades/n1-upgrade-ui-controller.js";
import { createRateDisplayUi } from "./shell-ui/n1-rate-display-ui.js";
import { createTopCountRowFit } from "./shell-ui/n1-top-count-row-fit.js";
import { createConfettiSprayer } from "./shell-ui/n1-vfx.js";
import {
    HAND_BASE_SPEED,
    UNLOCK_THRESHOLDS
} from "./hands/n1-hands.js";
import { HandCounter } from "./hands/n1-hand-counter.js";
import { GAME_LOOP_MS } from "./loop/n1-game-loop.js";
import { consumeAscendNumber1Button } from "./ascension/n1-ascension-flow-ui.js";
import { initNumber1StageAccretionDiskBg } from "./shell-ui/n1-accretion-disk-render.js";
import { computeNumber1AdaptiveTipMessage } from "./shell-ui/n1-adaptive-tip-message.js";
import {
    MAX_SLOWDOWN_LEVEL,
    SLOWDOWN_UNLOCK_COUNT,
    getCheapenEffectTextForAchievedLevel,
    getCheapenMultiplierForLevel,
    getCheapenUpgradeCost as getCheapenUpgradeCostForLevel,
    getEffectiveUpgradeLevel,
    getSlowdownMultiplierForLevel,
    getSlowdownUpgradeCost as getSlowdownUpgradeCostForLevel,
    getSpeedMultiplierBigForLevel,
    getSpeedMultiplierForLevel,
    getSpeedUpgradeCost
} from "./upgrades/n1-upgrades.js";
import {
    TIME_WARP_UNLOCK_COUNT,
    getTimeWarpProductionSecondsBonusFromTotals
} from "./upgrades/n1-time-warp.js";
import { createNumber1RateTickBoot } from "./loop/n1-rate-tick-boot.js";
import {
    getObjectiveProgress as getObjectiveProgressForTotal
} from "./objectives/n1-objectives.js";
import {
    ASCENSION_1_MIN_HANDS,
    ASCENSION_1_REQUIRED_TOTAL,
    computeNumber1AscensionBaseGain as computeNumber1AscensionBaseGainFromRules,
    computeNumber1AscensionGainBreakdown as computeNumber1AscensionGainBreakdownFromRules,
    computeNumber1AscensionGain as computeNumber1AscensionGainFromRules,
    getNumber1AscensionClapEssenceMultiplier as getNumber1AscensionClapEssenceMultiplierFromValue,
    getNumber1AscensionPendingBonusEssence as getNumber1AscensionPendingBonusEssenceFromValue,
    getNumber1AscensionRequiredHands as getNumber1AscensionRequiredHandsFromPhase,
    isNumber1AscensionReady as isNumber1AscensionReadyFromState
} from "./ascension/n1-ascension.js";
import { escapeHtml, renderStoryArchiveHtml as renderStoryArchiveHtmlForState } from "./story/n1-story.js";
import { createLedgerBeamVfx } from "./shell-ui/n1-ledger-beam.js";
import { createCombinationsForwardRefHolder, createNumber1CombinationsWireDeps } from "./combos/n1-combinations-wire.js";
import { createNumber1StoryWireDeps } from "./story/n1-story-wire.js";
import { createNumber1ComboNearMissAccess } from "./combos/n1-combo-near-miss-access.js";
import {
    COMBOS,
    COMBOS_BY_MIN_HANDS,
    computeComboUiInputDigest as computeComboUiInputDigestForValues,
    computeEarnedCatalogComboTierProducts as computeEarnedCatalogComboTierProductsForState,
    getActiveCombosForValues,
    getComboParticipatingHandIndicesForValues,
    getPatternCatalogMultiplierFromEarned
} from "./combos/n1-combos.js";
import { createComboHandStatusUi } from "./combos/n1-combo-hand-status-ui.js";
import { createCombinationsPanelUi } from "./combos/n1-combinations-panel-ui.js";
import { createCombinationsPanelRefresh } from "./combos/n1-combinations-panel-refresh.js";
import { createComboFeedbackUi } from "./combos/n1-combo-feedback-ui.js";
import { updateComboDiscoveryMilestonePanelIfOpen as syncComboDiscoveryMilestonePanel } from "./combos/n1-combo-discovery-milestone-ui.js";
import {
    TURBO_UNLOCK_COUNT
} from "./upgrades/n1-turbo.js";
import {
    COMBO_ACTIVATION_EDGE_SAVE_VERSION,
    collectNumberModulesSaveState
} from "../n1-save.js";
import { playBlackHoleScreenEffect } from "./black-hole/n1-black-hole-screen-fx.js";
import { syncPhase1TesseractCanvasesInRoot } from "../phase1-tesseract-canvas.js";
import {
    ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP,
    createMemoizedAscensionGrantTotals
} from "./ascension/n1-ascension-grant-totals.js";
import { createOverviewPanelDelegates } from "./shell-ui/n1-overview-panel-delegates.js";
import { createNumber1Runtime } from "./state/n1-runtime.js";
import { collectNumber1DomRefs } from "./shell-ui/n1-dom-refs.js";
import { createNumberModule } from "../core/number-module-interface.js";
import { createNumber1ShellRegistryDeps } from "./n1-shell-registry-deps.js";
import {
    buildNumberModulesRegistry,
    getUnlockedNumberModules as getUnlockedNumberModulesFromRegistry,
    tickBackgroundNumberModules as tickBackgroundNumberModulesFromRegistry
} from "../shell-registry.js";

/**
 * Number 1 orchestration body (wired from {@link createN1Boot#boot}).
 *
 * @param {{
 *   n1Boot: ReturnType<typeof import("./n1-boot.js").createN1Boot>,
 *   runtime: ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>,
 *   dom: ReturnType<typeof import("./shell-ui/n1-dom-refs.js").collectNumber1DomRefs>
 * }} ctx
 */
export function runNumber1Boot({ n1Boot, runtime, dom }) {
    /** Page-load epoch ms for dev tools fallback when `performance.now` is unavailable. */
    const devToolsLoadTimeMs = Date.now();

    /** Stoke won't compress digestion below ~this much remaining time (~8s, within typical 5–10s UX buffer). */
    const BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS = 8000;

/* ---------------------------------------------------------
       GLOBAL STATE (number1/state/* via n1Rt)
    --------------------------------------------------------- */
    const n1Rt = runtime;
    const run = n1Rt.run;
    const ascension = n1Rt.ascension;
    const blackHole = n1Rt.blackHole;
    const turbo = n1Rt.turbo;
    const upgrades = n1Rt.upgrades;
    const autobuy = n1Rt.autobuy;
    const timewarp = n1Rt.timewarp;
    const handsRt = n1Rt.hands;
    const combo = n1Rt.combo;
    const story = n1Rt.story;
    const objectivesRt = n1Rt.objectives;
    const session = n1Rt.session;
    const gameplaySimFrozen = n1Boot.createGameplaySimFrozen(session);
    /** Populated by wireSaveLoad after turbo wire; hoisted wrappers delegate here. */
    const saveWireRef = {
        autosaveNow() {},
        getSaveState() {
            return {};
        },
        applyLoadedState() {
            return false;
        },
        applyOfflineProgress() {}
    };
    function autosaveNow() {
        saveWireRef.autosaveNow();
    }
    function getSaveState(savedAt) {
        return saveWireRef.getSaveState(savedAt);
    }
    function applyLoadedState(data) {
        return saveWireRef.applyLoadedState(data);
    }
    function applyOfflineProgress(offlineMs, opts) {
        return saveWireRef.applyOfflineProgress(offlineMs, opts);
    }
    /** Populated by wireHandUnlock after upgrade boots; hoisted wrappers delegate here. */
    const handUnlockRef = {
        unlockHand() {},
        checkUnlockHands() {},
        initFirstHand() {}
    };
    function unlockHand() {
        handUnlockRef.unlockHand();
    }
    function checkUnlockHands() {
        handUnlockRef.checkUnlockHands();
    }
    /** Populated by wireObjectivesLive after BH boot; hoisted wrappers delegate here. */
    const objectivesUiRef = {
        updateObjectives() {},
        updateMilestoneUI() {}
    };
    function updateObjectives() {
        objectivesUiRef.updateObjectives();
    }
    function updateMilestoneUI() {
        objectivesUiRef.updateMilestoneUI();
    }
    let longTermObjectives = [];
    let storyBanners = [];
    /** Populated by wireDetachedCps after rate-tick boot. */
    const detachedCpsRef = {
        applyNumber1DetachedCpsProgress() {
            return 0;
        },
        tickNumber1BackgroundCps() {}
    };
    /** Populated after rate-tick boot; shell registry wires run earlier. */
    const rateTickRef = {
        getRawCpsPerHand() {
            return [];
        }
    };
    function getRawCpsPerHand() {
        return rateTickRef.getRawCpsPerHand();
    }
    function applyNumber1DetachedCpsProgress(dtSec) {
        return detachedCpsRef.applyNumber1DetachedCpsProgress(dtSec);
    }
    function tickNumber1BackgroundCps(dtSec) {
        detachedCpsRef.tickNumber1BackgroundCps(dtSec);
    }
    /** Populated by wireMilestoneUnlocks after upgrade boots. */
    const milestoneUnlockRef = {
        syncUnlocksWithTotalCount() {}
    };
    /** Run whenever `totalChanges` changes so milestone gates cannot desync (load, offline, dev tools, etc.). */
    function syncUnlocksWithTotalCount() {
        milestoneUnlockRef.syncUnlocksWithTotalCount();
    }
    /** Populated by wireAscensionFlow after ascension perform boot. */
    const ascensionFlowRef = {
        beginNumber1AscensionFlow() {},
        maybeShowFirstAscensionIntroOnUnlock() {}
    };
    function beginNumber1AscensionFlow() {
        ascensionFlowRef.beginNumber1AscensionFlow();
    }
    function maybeShowFirstAscensionIntroOnUnlock() {
        ascensionFlowRef.maybeShowFirstAscensionIntroOnUnlock();
    }
    let ascensionConfirmOverlayEl = null;
    /** Populated by createAscensionHubRender after ascension grant helpers exist. */
    const ascensionHubRenderRef = {
        renderAscensionHubGrantsHtml() { return ""; },
        renderAscensionHubStatsPillsHtml() { return ""; },
        patchAscensionHubStatsPillsDomIfChanged() {}
    };
    function renderAscensionHubGrantsHtml() {
        return ascensionHubRenderRef.renderAscensionHubGrantsHtml();
    }
    function renderAscensionHubStatsPillsHtml() {
        return ascensionHubRenderRef.renderAscensionHubStatsPillsHtml();
    }
    function patchAscensionHubStatsPillsDomIfChanged() {
        ascensionHubRenderRef.patchAscensionHubStatsPillsDomIfChanged();
    }
    /** Populated by createBlackHolePanelRender after black hole boot. */
    const blackHolePanelRenderRef = {
        renderNumber1BlackHolePanelHtml() { return ""; }
    };
    function renderNumber1BlackHolePanelHtml() {
        return blackHolePanelRenderRef.renderNumber1BlackHolePanelHtml();
    }
    /** Populated by createAscensionPageRender after ascension map wrappers exist. */
    const ascensionPageRenderRef = {
        getNumber1AscendControlLivePatchDigest() { return ""; },
        renderNumber1AscendControlHtml() { return ""; },
        renderAscensionUpgradesHtml() { return ""; },
        renderAscensionPageHtml() { return ""; }
    };
    function getNumber1AscendControlLivePatchDigest() {
        return ascensionPageRenderRef.getNumber1AscendControlLivePatchDigest();
    }
    function renderNumber1AscendControlHtml(livePatchDigest) {
        return ascensionPageRenderRef.renderNumber1AscendControlHtml(livePatchDigest);
    }
    function renderAscensionUpgradesHtml() {
        return ascensionPageRenderRef.renderAscensionUpgradesHtml();
    }
    function renderAscensionPageHtml() {
        return ascensionPageRenderRef.renderAscensionPageHtml();
    }
    /** Populated by wireAscensionNodeActions before ascension page render wire. */
    const ascensionNodeActionsRef = {
        normalizeAscensionNodeIds() {},
        tryBuyAscensionNode() {},
        isAscensionMapCollapseTransitionActive() { return false; },
        startAscensionMapCollapseTransition() {},
        respecNumber1AscensionSkillTrees() {},
        respecNumber1AscensionFinger() {}
    };
    function normalizeAscensionNodeIds() {
        ascensionNodeActionsRef.normalizeAscensionNodeIds();
    }
    function tryBuyAscensionNode(id) {
        ascensionNodeActionsRef.tryBuyAscensionNode(id);
    }
    function isAscensionMapCollapseTransitionActive() {
        return ascensionNodeActionsRef.isAscensionMapCollapseTransitionActive();
    }
    function startAscensionMapCollapseTransition() {
        ascensionNodeActionsRef.startAscensionMapCollapseTransition();
    }
    function respecNumber1AscensionSkillTrees() {
        ascensionNodeActionsRef.respecNumber1AscensionSkillTrees();
    }
    function respecNumber1AscensionFinger(finger) {
        ascensionNodeActionsRef.respecNumber1AscensionFinger(finger);
    }
    /** Populated after ascension gain helpers; objectives live wire needs hoisted delegate. */
    const ascensionReadyChromeRef = {
        updateAscensionReadyChrome() {}
    };
    function updateAscensionReadyChrome() {
        ascensionReadyChromeRef.updateAscensionReadyChrome();
    }
    /** Populated after ascension ready chrome; number-2 shell wire needs hoisted delegate. */
    const pageButtonUnlocksRef = {
        updatePageButtonUnlocks() {}
    };
    function updatePageButtonUnlocks() {
        pageButtonUnlocksRef.updatePageButtonUnlocks();
    }
    /** BH wire runs before grant accessors; hoisted delegate for turbo meter cap. */
    const ascensionGrantAccessorsRef = {
        getTurboMeterMax() { return 0; }
    };
    function getTurboMeterMax() {
        return ascensionGrantAccessorsRef.getTurboMeterMax();
    }
    /** NUMBER_MODULES registry uses multiplier before turbo runtime wire. */
    const turboRuntimeRef = {
        getTurboCountMultiplier() { return 1; },
        tryTurboLevelerPurchases() {}
    };
    function getTurboCountMultiplier() {
        return turboRuntimeRef.getTurboCountMultiplier();
    }
    function tryTurboLevelerPurchases() {
        turboRuntimeRef.tryTurboLevelerPurchases();
    }
    /** Turbo runtime wire uses UI refresh before turbo UI boot wires. */
    const turboUiRef = {
        updateTurboBoostUI() {}
    };
    function updateTurboBoostUI(opts) {
        turboUiRef.updateTurboBoostUI(opts);
    }
    /** Grant accessors / upgrade wires run before speed UI boot wires. */
    const speedUpgradeUiRef = {
        updateSpeedUpgradeUI() {},
        updateHandUpgradeScrollHint() {},
        scheduleHandUpgradeScrollHintUpdate() {},
        handScrollHintHasUpgradeReason() { return false; }
    };
    function updateSpeedUpgradeUI() {
        speedUpgradeUiRef.updateSpeedUpgradeUI();
    }
    function updateHandUpgradeScrollHint() {
        speedUpgradeUiRef.updateHandUpgradeScrollHint();
    }
    function scheduleHandUpgradeScrollHintUpdate() {
        speedUpgradeUiRef.scheduleHandUpgradeScrollHintUpdate();
    }
    function handScrollHintHasUpgradeReason(handIndex) {
        return speedUpgradeUiRef.handScrollHintHasUpgradeReason(handIndex);
    }
    let tryUnlockTurboIfEligible = () => {};
    let syncTurboBoostToggleDomFromBoot = () => {};
    /** Grant accessors / ascension wires run before upgrade UI boot wires. */
    let updateCheapenUpgradeUI = function() {};
    let updateSlowdownUpgradeUI = function() {};
    let updateTimeWarpAuraUI = function() {};
    /** Populated after ascMapUi; shell panels need teardown before map UI exists. */
    const ascensionMapFacadeRef = {
        computeAscensionHandLayout() { return { hands: [] }; },
        renderAscensionMapColumnGuidesSvg() { return ""; },
        renderAscensionMapEdgesSvg() { return ""; },
        syncAscensionMapNodeDomPositions() {},
        ascensionResolveNodeIdAtClient() { return null; },
        updateAscensionMapDetailPanel() {},
        setAscensionMapSelectedNode() {},
        teardownAscensionMapPanZoom() {},
        initAscensionMapPanZoom() {},
        renderAscensionMapDebugOverlaySvg() { return ""; },
        getAscensionMapViewBoxHeight() { return 0; },
        getAscensionNodePurchaseCost() { return 0; },
        ascensionNodePrereqsMet() { return false; },
        getAscensionEssenceInvestedInNodes() { return 0; }
    };
    function computeAscensionHandLayout() {
        return ascensionMapFacadeRef.computeAscensionHandLayout();
    }
    function renderAscensionMapColumnGuidesSvg(vbH) {
        return ascensionMapFacadeRef.renderAscensionMapColumnGuidesSvg(vbH);
    }
    function renderAscensionMapEdgesSvg(layout) {
        return ascensionMapFacadeRef.renderAscensionMapEdgesSvg(layout);
    }
    function syncAscensionMapNodeDomPositions() {
        ascensionMapFacadeRef.syncAscensionMapNodeDomPositions();
    }
    function ascensionResolveNodeIdAtClient(clientX, clientY) {
        return ascensionMapFacadeRef.ascensionResolveNodeIdAtClient(clientX, clientY);
    }
    function updateAscensionMapDetailPanel() {
        ascensionMapFacadeRef.updateAscensionMapDetailPanel();
    }
    function setAscensionMapSelectedNode(id, skipIfSame) {
        ascensionMapFacadeRef.setAscensionMapSelectedNode(id, skipIfSame);
    }
    function teardownAscensionMapPanZoom() {
        ascensionMapFacadeRef.teardownAscensionMapPanZoom();
    }
    function initAscensionMapPanZoom() {
        ascensionMapFacadeRef.initAscensionMapPanZoom();
    }
    function renderAscensionMapDebugOverlaySvg() {
        return ascensionMapFacadeRef.renderAscensionMapDebugOverlaySvg();
    }
    const maxHands = run.maxHands;
    function isTimeWarpUnlocked() {
        return timewarp.number1TimeWarpBoot
            ? timewarp.number1TimeWarpBoot.isTimeWarpUnlocked()
            : run.totalChanges >= TIME_WARP_UNLOCK_COUNT;
    }
    function getTimeWarpProductionSecondsBonus() {
        if (timewarp.number1TimeWarpBoot) return timewarp.number1TimeWarpBoot.getTimeWarpProductionSecondsBonus();
        return getTimeWarpProductionSecondsBonusFromTotals(computeAscensionGrantTotals());
    }

    function refreshTotalFromHandEarnings() {
        let s = 0;
        for (let i = 0; i < run.unlockedHands; i++) s += run.handEarnings[i] || 0;
        run.totalChanges = Math.min(BLACK_HOLE_EVAPORATION_CAP, s);
        if (run.totalChanges > run.number1RunPeakTotalCount) run.number1RunPeakTotalCount = run.totalChanges;
        if (run.totalChanges >= 1e15) run.slowdownCompactionUnlockedLatched = true;
        syncUnlocksWithTotalCount();
    }
    function getNumber1AscensionEssenceFormulaTotal() {
        return Math.max(1, run.number1RunPeakTotalCount);
    }

    const {
        incrementalEl,
        incrementalCountLabelEl,
        incrementalRateEl,
        n1GravityCpsStripEl,
        bonusMultiplierEl,
        turboMultiplierDisplayEl,
        turboRightClusterEl,
        turboBoostWrapEl,
        turboScensionPanelEl,
        turboScensionUpgradeBtn,
        turboScensionBurnLineEl,
        turboScensionTankLineEl,
        turboScensionMultLineEl,
        turboScensionFillLineEl,
        turboScensionLevelerLineEl,
        turboBoostFillEl,
        turboBoostGaugeEl,
        turboBoostMultiplierEl,
        turboBoostActivationsEl,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        handsContainer,
        objectiveList,
        longObjectiveList,
        milestoneTitleEl,
        milestoneTextEl,
        milestoneEssenceLineEl,
        milestoneProgressFillEl,
        playStageEl,
        number1StageRootEl,
        ascensionReadyBannerEl,
        ascensionReadyBannerEssenceSuffixEl,
        ascensionReadyCtaEl,
        ascensionPageBtn,
        menuBtn,
        settingsPanelEl,
        settingsCloseBtn,
        settingsThemeDarkEl,
        settingsAdaptiveTipsEl,
        settingsCurtainEnabledEl,
        settingsHumorEnabledEl,
        settingsShowClapAnimationEl,
        settingsOfflineCapHoursEl,
        offlineSummaryPanelEl,
        offlineSummaryBodyEl,
        offlineSummaryCloseBtn,
        pagePanelEl,
        pagePanelTitleEl,
        pagePanelBodyEl,
        pagePanelCloseBtn,
        pageModalEl,
        pageButtons,
        combinationsPageBtn,
        ambientMessageTickerEl,
        actionLogEl,
        actionLogToggle,
        actionLogContainer
    } = dom;
    /** Autobuy / warp-assist may stack many purchases; defer refresh to once per batch. Wired in {@link createNumber1TickApplyStep}. */
    let flushAutobuyDeferredTotalsIfAny = () => {};
    let markAutobuyDeferredTotalsPending = () => {};
    let applyHandSacrificeBody = () => false;
    function applyHandSacrifice(handNum) {
        return applyHandSacrificeBody(handNum);
    }
    const comboForward = createCombinationsForwardRefHolder();
    let combinationsBoot = null;
    /** Populated by wireLoop; load tail ctx holds this ref so late assignment is visible. */
    const loopRuntimeRef = {
        setTotalPlayTimeMs() {},
        resetSavePlayWallClock() {},
        getTotalPlayTimeMs() { return 0; }
    };
    let number1LoopRuntime;

    const shellPanels = createShellPanelsUi({
        pagePanelEl,
        settingsPanelEl,
        playStageEl,
        pageModalEl,
        getUpgradeContainer: dom.getUpgradeContainer,
        teardownAscensionMapPanZoom
    });
    const {
        isPagePanelOpen,
        isSettingsPanelOpen,
        syncInlinePanelsVsGameplay,
        closeInlineMainStagePanels,
        initInlineRightPanels,
        syncMessageLogScrollContainerMode
    } = shellPanels;

    /** When true, autosave is skipped (e.g. right before deleting save + reload). */
    const { unlockedNumbers } = session;
    function isNumber2Unlocked() {
        return unlockedNumbers.has(2);
    }
    function getAdaptiveTipMessage() {
        return computeNumber1AdaptiveTipMessage({ totalChanges: run.totalChanges, unlockedHands: run.unlockedHands, turboBoostUnlocked: turbo.turboBoostUnlocked,
            slowdownUnlocked: isSlowdownUnlocked(),
            timeWarpUnlocked: isTimeWarpUnlocked(),
            timeWarpProductionSecondsBonus: getTimeWarpProductionSecondsBonus(),
        });
    }
    const logPanelRefreshDeps = {};
    const logTickerRt = createLogTickerRuntime({
        getAmbientTickerEl: () => ambientMessageTickerEl,
        getActionLogEl: () => actionLogEl,
        getActionLogContainer: () => actionLogContainer,
        getActionLogToggle: () => actionLogToggle,
        pagePanelEl,
        pagePanelBodyEl,
        pagePanelTitleEl,
        escapeHtml,
        getSettings: () => session.settings,
        getAdaptiveTipMessage,
        logPanelRefreshDeps
    });
    function markMeaningfulProgress() {
        logTickerRt.markMeaningfulProgress();
    }
    function maybeEmitAdaptiveTip(nowMs) {
        logTickerRt.maybeEmitAdaptiveTip(nowMs);
    }
    function addToLog(msg, category) {
        logTickerRt.addToLog(msg, category);
    }
    const {
        ref: overviewAscPanelDelegates,
        refreshGlobalOverviewPanelIfOpen,
        patchNumber1AscendControlIfOpen,
        refreshAscensionPanelIfOpen,
        refreshOverviewAndAscensionPanelsIfOpen,
        refreshOverviewAndAscensionHubLiveIfOpen,
        patchGlobalOverviewLiveDom,
        patchAscensionPanelLiveDom
    } = createOverviewPanelDelegates();
    /** Number 2 — Double or Nothing (isolated from Number 1 economy). */
    const number2State = createNumber2State();
    const number2 = createNumber2Controller(number2State, {
        formatCount,
        addToLog,
        autosaveNow,
        refreshOverviewAndAscensionPanelsIfOpen,
        refreshOverviewAndAscensionHubLiveIfOpen,
        refreshGlobalOverviewPanelIfOpen,
        renderAscensionPageHtml,
        getPagePanelBodyEl: () => pagePanelBodyEl,
        getCurrentNumberMode: () => typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1,
        isUnlocked: () => isNumber2Unlocked(),
        getUpgrades: () => typeof NUMBER2_UPGRADES !== "undefined" ? NUMBER2_UPGRADES : [],
        getAscension2Export: () => typeof ASCENSION2_TREE_EXPORT !== "undefined" ? ASCENSION2_TREE_EXPORT : null,
        getBasePDouble: () => typeof NUMBER2_BASE_P_DOUBLE === "number" ? NUMBER2_BASE_P_DOUBLE : 0.48,
        getMinPDouble: () => typeof NUMBER2_P_DOUBLE_MIN === "number" ? NUMBER2_P_DOUBLE_MIN : 0.05,
        getMaxPDouble: () => typeof NUMBER2_P_DOUBLE_MAX === "number" ? NUMBER2_P_DOUBLE_MAX : 0.95
    });
    const number2ShellRef = {
        reconcileNumber2LockState() {},
        updateNumber2SidebarUnlockUI() {}
    };
    function reconcileNumber2LockState() {
        number2ShellRef.reconcileNumber2LockState();
    }
    function updateNumber2SidebarUnlockUI() {
        number2ShellRef.updateNumber2SidebarUnlockUI();
    }
    Object.assign(number2ShellRef, n1Boot.wireNumber2Shell({
        number2,
        isNumber2Unlocked,
        updatePageButtonUnlocks
    }));
    function renderActionLog() {
        logTickerRt.renderActionLog();
    }
    function clearAmbientTickerPipeline() {
        logTickerRt.clearAmbientTickerPipeline();
    }
    function setAmbientMessage(entry) {
        logTickerRt.setAmbientMessage(entry);
    }
    function clearActionLogBacklogOnAscension() {
        logTickerRt.clearActionLogBacklogOnAscension();
    }

    const number1ObjectivesBoot = n1Boot.wireObjectives({
        flush: () => { updateObjectives(); }
    });

    function getNumber1AscensionPendingBonusEssence() {
        return getNumber1AscensionPendingBonusEssenceFromValue(ascension.number1AscensionPendingBonusEssence);
    }
    function getNumber1AscensionClapEssenceMultiplier() {
        return getNumber1AscensionClapEssenceMultiplierFromValue(ascension.number1AscensionClapEssenceMultiplier);
    }
    function computeNumber1AscensionBaseGain(fromTotal) {
        return computeNumber1AscensionBaseGainFromRules(fromTotal);
    }
    function computeNumber1AscensionGainBreakdown(fromTotal) {
        return computeNumber1AscensionGainBreakdownFromRules(fromTotal, {
            pendingBonus: getNumber1AscensionPendingBonusEssence(),
            blackHolePhase1Mult: getBlackHolePhase1AscensionEssenceMult(),
            blackHoleParallelBonus: blackHole.number1BlackHoleState.phase2ParallelBonusPool || 0,
            blackHoleFurnaceBonus: getBlackHoleFurnaceEssenceBonus(),
            blackHoleMassCouplingBonus: getBlackHolePhase2MassCouplingAscensionEssenceBonus(blackHole.number1BlackHoleState),
            clapMult: getNumber1AscensionClapEssenceMultiplier()
        });
    }
    function computeNumber1AscensionGain(fromTotal) {
        return computeNumber1AscensionGainFromRules(fromTotal, {
            pendingBonus: getNumber1AscensionPendingBonusEssence(),
            blackHolePhase1Mult: getBlackHolePhase1AscensionEssenceMult(),
            blackHoleParallelBonus: blackHole.number1BlackHoleState.phase2ParallelBonusPool || 0,
            blackHoleFurnaceBonus: getBlackHoleFurnaceEssenceBonus(),
            blackHoleMassCouplingBonus: getBlackHolePhase2MassCouplingAscensionEssenceBonus(blackHole.number1BlackHoleState),
            clapMult: getNumber1AscensionClapEssenceMultiplier()
        });
    }
    function getNumber1AscensionRequiredHands() {
        return getNumber1AscensionRequiredHandsFromPhase(getBlackHolePhase(), ASCENSION_1_MIN_HANDS);
    }
    function isNumber1AscensionReady() {
        return isNumber1AscensionReadyFromState({
            phase: getBlackHolePhase(), unlockedHands: run.unlockedHands, totalChanges: run.totalChanges,
            minHands: ASCENSION_1_MIN_HANDS,
            requiredTotal: ASCENSION_1_REQUIRED_TOTAL
        });
    }
    const ASCENSION_TREE_EXPORT = window.ASCENSION_TREE_EXPORT;
    const ASCENSION_TREE_VERSION = ASCENSION_TREE_EXPORT.VERSION;
    const ASCENSION_MAP_NODES = ASCENSION_TREE_EXPORT.NODES;
    const ASCENSION_MAP_NODE_BY_ID = {};
    ASCENSION_MAP_NODES.forEach(n => { ASCENSION_MAP_NODE_BY_ID[n.id] = n; });
    const computeAscensionGrantTotals = createMemoizedAscensionGrantTotals(
        () => ascension.number1AscensionNodeIds,
        id => ASCENSION_MAP_NODE_BY_ID[id]
    );
    const { getNearMissToleranceRanks } = createNumber1ComboNearMissAccess({
        getAscensionNodeIds: () => ascension.number1AscensionNodeIds,
        getAscensionNodeById: () => ASCENSION_MAP_NODE_BY_ID
    });
    function isTurboScensionUnlocked() {
        return ascension.number1AscensionNodeIds.some(function (id) {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            return def && def.finger === "ring" && def.grants && def.grants.turboScensionUnlock === true;
        });
    }
    function isTurboScensionUpgradeAutobuyUnlocked() {
        return ascension.number1AscensionNodeIds.some(function (id) {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            return def && def.finger === "ring" && def.grants && def.grants.turboScensionUpgradeAutobuy === true;
        });
    }
    function ascensionPurchasedSet() {
        return new Set(ascension.number1AscensionNodeIds);
    }
    const ascMapUi = createAscensionMapUi({
        getAscensionMapNodes: () => ASCENSION_MAP_NODES,
        getAscensionMapNodeById: () => ASCENSION_MAP_NODE_BY_ID,
        ascensionPurchasedSet,
        formatCount,
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        hasAscended: () => ascension.number1HasAscended,
        getAscensionTreeExport: () => ASCENSION_TREE_EXPORT
    });
    Object.assign(ascensionMapFacadeRef, n1Boot.createAscensionMapFacade(ascMapUi, {
        getNumber1AscensionNodeIds: () => ascension.number1AscensionNodeIds
    }));
    function getAscensionNodePurchaseCost(id) {
        return ascensionMapFacadeRef.getAscensionNodePurchaseCost(id);
    }
    function getAscensionEssenceInvestedInNodes() {
        return ascensionMapFacadeRef.getAscensionEssenceInvestedInNodes();
    }
    function ascensionNodePrereqsMet(id) {
        return ascensionMapFacadeRef.ascensionNodePrereqsMet(id);
    }
    function getAscensionPurchaseChainInfoToNode(id) {
        return ascMapUi.getAscensionPurchaseChainInfoToNode(id);
    }
    function ascensionNodeDisplayName(id) {
        return ascMapUi.ascensionNodeDisplayName(id);
    }
    function isNumber1AscensionTreeFullyPurchased() {
        if (!ascension.number1HasAscended || !ASCENSION_MAP_NODES || ASCENSION_MAP_NODES.length === 0) return false;
        const s = ascensionPurchasedSet();
        // Gate should only care whether every current map node is owned.
        // Ignore duplicate/stale entries that may remain in old saves.
        for (let i = 0; i < ASCENSION_MAP_NODES.length; i++) {
            if (!s.has(ASCENSION_MAP_NODES[i].id)) return false;
        }
        return true;
    }
    function isBlackHoleArcUnlocked() {
        return ascension.number1HasAscended && isNumber1AscensionTreeFullyPurchased();
    }
    function enterBlackHolePhase7GameplayReset() {
        run.totalChanges = 0;
        run.handEarnings = Array(maxHands).fill(0);
        run.handEarnings[0] = 0;
        run.unlockedHands = 1;
        run.unlockedHandsCap = 1;
        shrinkSpeedRowsTo(1);
        while (handsRt.hands.length > 1) {
            const h = handsRt.hands.pop();
            if (h && h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
    }
    /** Story banner call sites in black-hole controller run before story banner catalog wiring; patched below. */
    const storyBannerBridge = {
        showStoryBanner() {},
        showStoryBannerById() {}
    };
    const storyBannerLookupRef = {
        getStoryBannerById() { return null; },
        showStoryBanner() {}
    };
    /** Forwarding ref: real implementations assigned after rate-display UI factory runs. */
    const rateDisplayUiRef = {
        updateRateDisplay() {},
        updateN1GravityCpsStrip() {}
    };
    function updateRateDisplay(opts) {
        rateDisplayUiRef.updateRateDisplay(opts);
    }
    const number1BlackHoleBoot = n1Boot.wireBlackHole({
        maxSlowdownLevelBase: MAX_SLOWDOWN_LEVEL,
        rootDocument: typeof document !== "undefined" ? document : null,
        getBlackHoleControllerDeps(bhUiBridge) {
            return {
                getBlackHoleState: () => blackHole.number1BlackHoleState,
                isArcUnlocked: isBlackHoleArcUnlocked,
                hasAscended: () => ascension.number1HasAscended,
                addToLog,
                formatCount,
                queueBlackHoleUiRefresh: () => bhUiBridge.queueBlackHoleUiRefresh?.(),
                autosaveNow,
                getTurboBoostMeter: () => turbo.turboBoostMeter,
                setTurboBoostMeter: v => {
                    turbo.turboBoostMeter = v;
                },
                getTurboMeterMax,
                getTurboBoostUnlocked: () => turbo.turboBoostUnlocked,
                getBlackHoleUxFlags: () => blackHole.number1BlackHoleUxFlags,
                getNumber1StageRootEl: () => number1StageRootEl,
                playBlackHoleScreenEffect,
                syncBlackHolePhase1Vfx: () => bhUiBridge.syncBlackHolePhase1Vfx?.(),
                pulseBlackHoleLensingAutoTick: () => bhUiBridge.pulseBlackHoleLensingAutoTick?.(),
                showStoryBanner: (banner, opts) => storyBannerBridge.showStoryBanner(banner, opts),
                getMaxHands: () => maxHands,
                getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
                setNumber1AscensionEssence: v => {
                    ascension.number1AscensionEssence = v;
                },
                getTotalChanges: () => run.totalChanges,
                enterBlackHolePhase7GameplayReset,
                formatSeconds,
                phase5StokeMinRemainingMs: BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS,
                updateRateDisplay: opts => rateDisplayUiRef.updateRateDisplay(opts),
                updateN1GravityCpsStrip: () => rateDisplayUiRef.updateN1GravityCpsStrip(),
                refreshAscensionPanelIfOpen,
                triggerBlackHolePhase1CollapseVfx: () => bhUiBridge.triggerBlackHolePhase1CollapseVfx?.(),
                showStoryBannerById: id => storyBannerBridge.showStoryBannerById(id),
                pulseBlackHoleLensingManualBurst: () => bhUiBridge.pulseBlackHoleLensingManualBurst?.(),
                getUnlockedHands: () => run.unlockedHands,
                applyHandSacrifice
            };
        },
        getBlackHoleUiDeps({ ctl, syncPhase1MassFillCssVars: syncPhase1MassFill, getMaxSlowdownLevelCap: getMaxSlowdownCapFromBoot }) {
            return {
                controller: ctl,
                getBlackHoleState: () => blackHole.number1BlackHoleState,
                getStageRoot: () => number1StageRootEl,
                getPlayStage: () => playStageEl,
                getIncrementalCountLabel: () => incrementalCountLabelEl,
                syncPhase1MassFillCssVars: syncPhase1MassFill,
                refreshGlobalOverviewPanelIfOpen,
                getPagePanelEl: () => pagePanelEl,
                getPagePanelBodyEl: () => pagePanelBodyEl,
                getAscensionPageActiveNumber: () => ascension.ascensionPageActiveNumber,
                refreshAscensionPanelIfOpen,
                patchAscensionHubStatsPillsDomIfChanged,
                renderNumber1BlackHolePanelHtml,
                isBlackHoleArcUnlocked,
                formatCount,
                autosaveNow,
                getAscensionEssence: () => ascension.number1AscensionEssence,
                getMaxSlowdownLevelCap: getMaxSlowdownCapFromBoot,
                getSlowdownCapBase: () => MAX_SLOWDOWN_LEVEL,
                isNumber1AscensionReady,
                getAscensionGainBreakdown: () => computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal()),
                getBlackHolePhase: () => getBlackHolePhase(),
                formatBlackHolePhase1CpsMultForUi: m => formatBlackHolePhase1CpsMultForUi(m),
                getJetMult: () => getBlackHoleJetMult(),
                escapeHtml: escapeAscensionHtml,
                formatSeconds,
                getBlackHoleUxFlags: () => blackHole.number1BlackHoleUxFlags,
                getUnlockedHands: () => run.unlockedHands,
                getPhase5StokeMinRemainingMs: () => BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS,
                getStokePreviewStats: budget => {
                    const now = Date.now();
                    const held = Math.max(0, Math.floor(Number(ascension.number1AscensionEssence) || 0));
                    const current = getBlackHolePhase5StokePreview(held, now);
                    const future = getBlackHolePhase5StokePreview(Math.max(0, Math.floor(Number(budget) || 0)), now);
                    if (!future) return null;
                    const lineFor = p => {
                        if (!p) return { stokeLine: "", stokeFillWidth: "0" };
                        const progressPct = Math.floor(p.progress * 1000) / 10;
                        const curvedPct = Math.floor(p.curved * 1000) / 10;
                        const removedSec = Math.max(0, Math.floor(p.removedMs / 1000));
                        const remainingSec = Math.max(0, Math.ceil(p.projectedRemainingMs / 1000));
                        return {
                            stokeLine:
                                "Projected after stoke: <strong>" +
                                progressPct.toFixed(1) +
                                "%</strong> time · <strong>" +
                                curvedPct.toFixed(1) +
                                "%</strong> power · removes <strong>" +
                                escapeAscensionHtml(formatSeconds(removedSec)) +
                                "</strong> · leaves <strong>" +
                                escapeAscensionHtml(formatSeconds(remainingSec)) +
                                "</strong>",
                            stokeFillWidth: String(Math.max(0, Math.min(100, progressPct)).toFixed(1))
                        };
                    };
                    return { current: lineFor(current || future), future: lineFor(future) };
                }
            };
        }
    });
    const {
        controller: number1BlackHoleCtl,
        getBlackHolePhase,
        useBlackHolePlayerTerminology,
        getArcEssenceMultiplierBonusPhraseLower,
        getArcEssenceMultiplierBonusPhraseTitle,
        getTotalProductionMultLabelForPanel,
        getGravityStackTooltipPhrase,
        ensureBlackHoleArcStarted,
        tryStartNumber1BlackHoleArc,
        hasBlackHoleProgressLockingRespec,
        getBlackHolePhase2CollapseMassTier,
        getBlackHolePhase2CollapsePhotonTier,
        getBlackHolePhase2CollapseErgosphereTier,
        isBlackHolePhase2MassPourUnlocked,
        getBlackHolePhase2CollapseUpgradeCost,
        getBlackHolePhase2CostAtLevel,
        getBlackHolePhase2MassMult,
        getBlackHolePhase2NextCostEssence,
        addBlackHolePhase2ParallelBonusFromEssence,
        getBlackHolePhase3UpgradeFrac,
        getBlackHolePhase4NextCostEssenceForWave,
        getBlackHolePhase4NextCostEssence,
        getBlackHolePhase6NextJetUpgradeCostEssence,
        getBlackHolePhase3TrackLevel,
        getBlackHolePhase3TrackCost,
        syncBlackHolePhase3LegacyLevel,
        isBlackHolePhase3Complete,
        getBlackHolePhase6TrackLevel,
        getBlackHolePhase6TrackCost,
        getBlackHolePhase1FillRatio,
        syncPhase1MassFillCssVars,
        getBlackHolePhase1RunCpsMult,
        formatBlackHolePhase1CpsMultForUi,
        getBlackHolePhase1AscensionEssenceMult,
        getBlackHolePhase1SlowdownCapBonus,
        getMaxSlowdownLevelCap,
        getBlackHoleWaveIntervalSec,
        getBlackHoleHawkingMult,
        getBlackHoleWaveMult,
        getBlackHolePhase5DigestDurationMsSafe,
        getBlackHolePhase5MutationLevel,
        getBlackHolePhase5HotterCoreMult,
        getBlackHolePhase5ShorterOrbitMult,
        getBlackHolePhase5DigestProgressAt,
        getBlackHolePhase5DigestProgress,
        getBlackHolePhase5DigestCurve,
        getBlackHolePhase5EffectiveFurnacePower,
        getBlackHoleFurnaceEssenceBonus,
        getBlackHoleFurnaceMult,
        getBlackHoleJetMult,
        getBlackHoleTotalMult,
        getBlackHolePersistentMultForOffline,
        getBlackHoleOfflineTimedBuffAverageMult,
        getBlackHoleOfflineProductionMult,
        getNumber1BlackHoleProductionMult,
        queueBlackHoleUiRefresh,
        syncBlackHolePhase4LensingRipples,
        pulseBlackHoleLensingManualBurst,
        pulseBlackHoleLensingAutoTick,
        syncBlackHolePhase1Vfx,
        triggerBlackHolePhase1CollapseVfx,
        patchBlackHolePhase1PanelLiveDom,
        patchBlackHolePhase2PanelLiveDom,
        patchBlackHolePhase3PanelLiveDom,
        refreshBlackHolePanelLiveDomIfOpen,
        bindBlackHoleUpgradePreviewListeners,
        afterBlackHolePanelMounted,
        completeBlackHolePhaseTransition,
        tryBuyBlackHolePhase2CollapseUpgrade,
        tryBuyBlackHolePhase3DiskUpgrade,
        tryBuyBlackHolePhase6JetUpgrade,
        tryBuyNumber1BlackHole,
        triggerBlackHoleWaveManual,
        getBlackHoleNextDigestDurationMs,
        getBlackHolePhase5StokePreview,
        sacrificeNextHandToFurnace,
        chooseBlackHoleFurnaceMutation,
        tryToggleJet,
        updateBlackHolePhaseStep,
        registerSyncBhCollapseTurboTierAccents
    } = number1BlackHoleBoot;
    Object.assign(ascensionReadyChromeRef, n1Boot.createAscensionReadyChrome({
        isNumber1AscensionReady,
        computeNumber1AscensionGainBreakdown,
        getNumber1AscensionEssenceFormulaTotal,
        formatCount,
        getArcEssenceMultiplierBonusPhraseTitle,
        ascensionReadyBannerEssenceSuffixEl,
        ascensionReadyBannerEl,
        ascensionPageBtn,
        getNumber1HasAscended: () => ascension.number1HasAscended
    }));
    Object.assign(pageButtonUnlocksRef, n1Boot.createPageButtonUnlocksBoot({
        combinationsPageBtn,
        getUnlockedHands: () => run.unlockedHands,
        updateAscensionReadyChrome
    }));
    Object.assign(blackHolePanelRenderRef, n1Boot.createBlackHolePanelRender({
        getNumber1HasAscended: () => ascension.number1HasAscended,
        isBlackHoleArcUnlocked,
        getBlackHolePhase,
        ensureBlackHoleArcStarted,
        getNumber1BlackHoleProductionMult,
        getBlackHoleState: () => blackHole.number1BlackHoleState,
        getBlackHoleUxFlags: () => blackHole.number1BlackHoleUxFlags,
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        getBlackHolePhase1FillRatio,
        getMaxSlowdownLevelCap,
        formatBlackHolePhase1CpsMultForUi,
        getBlackHolePhase1RunCpsMult,
        getBlackHolePhase1AscensionEssenceMult,
        formatCount,
        getBlackHolePhase2NextCostEssence,
        getBlackHolePhase2CollapseMassTier,
        getBlackHolePhase2CollapsePhotonTier,
        getBlackHolePhase2CollapseErgosphereTier,
        isBlackHolePhase2MassPourUnlocked,
        getBlackHolePhase2CollapseUpgradeCost,
        getBlackHolePhase3TrackLevel,
        getBlackHolePhase3TrackCost,
        getBlackHolePhase4NextCostEssence,
        formatSeconds,
        getBlackHoleWaveIntervalSec,
        getPhase5StokeMinRemainingMs: () => BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS,
        getBlackHolePhase5StokePreview,
        getBlackHolePhase5DigestProgressAt,
        getBlackHolePhase5DigestCurve,
        getBlackHolePhase5EffectiveFurnacePower,
        getBlackHolePhase5MutationLevel,
        getBlackHoleFurnaceMult,
        getBlackHolePhase5HotterCoreMult,
        getBlackHoleFurnaceEssenceBonus,
        getBlackHolePhase5ShorterOrbitMult,
        getUnlockedHands: () => run.unlockedHands,
        getBlackHolePhase6TrackLevel,
        getBlackHolePhase6TrackCost,
        getTotalProductionMultLabelForPanel
    }));
    const objectivesLive = n1Boot.wireObjectivesLive({
        catalog: {
            ascension,
            run,
            blackHole,
            formatCount,
            isNumber1AscensionTreeFullyPurchased,
            ascensionPurchasedSet,
            ascensionMapNodes: ASCENSION_MAP_NODES,
            getBlackHolePhase,
            blackHolePhase1EssenceTarget: BLACK_HOLE_PHASE1_ESSENCE_TARGET,
            getBlackHolePhase1FillRatio,
            isBlackHolePhase2MassPourUnlocked,
            blackHolePhase2CollapseMaxTier: BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
            getBlackHolePhase2CollapseMassTier,
            getBlackHolePhase2CollapsePhotonTier,
            getBlackHolePhase2CollapseErgosphereTier,
            blackHolePhase2MassCap: BLACK_HOLE_PHASE2_MASS_CAP,
            getBlackHolePhase3TrackLevel,
            getBlackHolePhase5DigestProgress,
            blackHoleEvaporationCap: BLACK_HOLE_EVAPORATION_CAP
        },
        objectivesRt,
        run,
        ascension,
        objectiveList,
        longObjectiveList,
        formatCount,
        milestoneTitleEl,
        milestoneTextEl,
        milestoneEssenceLineEl,
        milestoneProgressFillEl,
        ascensionRequiredTotal: ASCENSION_1_REQUIRED_TOTAL,
        isNumber1AscensionReady,
        getNumber1AscensionRequiredHands,
        getNumber1AscensionPendingBonusEssence,
        updateAscensionReadyChrome
    });
    Object.assign(objectivesUiRef, objectivesLive);
    longTermObjectives = objectivesLive.longTermObjectives;
    const {
        ascensionAutobuyDefaultOnForNewHands,
        ascensionAutobuyIncludesCheapen,
        ascensionAutobuyIncludesSlowdown,
        applyAscensionAutobuyGrantToUnlockedHands,
        getAscensionHandUnlockStartingCountFloor,
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
        getAscensionCheapenCapBonusFromTree,
        getAscensionTurboScalingBonusFromTree,
        getAscensionWarpOverflowBonusFromTree,
        getMaxCheapenLevel,
        turboMeterCurveScaleFromTotals,
        getTurboMeterCurveScale,
        getTurboCountMultiplierMax,
        getTimeWarpOverflowRatio,
        getTimeWarpAuraSpawnSpanMaxSec
    } = Object.assign(ascensionGrantAccessorsRef, n1Boot.createAscensionGrantAccessorsBoot({
        ascensionPurchasedSet,
        computeAscensionGrantTotals,
        getAutobuy: () => autobuy,
        ensureSpeedRows,
        getAutoBuyEnabledByHand: () => autoBuyEnabledByHand,
        getUnlockedHands: () => run.unlockedHands,
        syncAllAutobuyTogglesFromState,
        getNumber1HasAscended: () => ascension.number1HasAscended,
        getRun: () => run,
        refreshTotalFromHandEarnings,
        incrementalEl,
        formatCount,
        updateObjectives,
        updateMilestoneUI,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        getComboForward: () => comboForward,
        updatePageButtonUnlocks,
        getTurboScensionTankLevel: () => turbo.turboScensionTankLevel,
        getTurboScensionMultLevel: () => turbo.turboScensionMultLevel
    }));
    const {
        getTurboScensionActivationCost,
        getTurboScensionUpgradeRollCount,
        getTurboComboPoints,
        getTurboCountMultiplierFromMeter,
        addTurboBoostMeter,
        updateTurboBurn,
        earnTurboActivationsFromTick,
        applyTurboPassiveMeterRegen,
        getTurboLevelerNextPointCost,
        getTurboScensionUpgradeActivationEtaHint,
        tryTurboScensionActivationUpgrade
    } = Object.assign(turboRuntimeRef, n1Boot.createTurboRuntimeBoot({
        computeAscensionGrantTotals,
        getTurbo: () => turbo,
        getTurboMeterMax,
        getTurboMeterCurveScale,
        getTurboCountMultiplierMax,
        isTurboScensionUnlocked,
        turboBoostGaugeEl,
        turboBoostWrapEl,
        turboBoostFillEl,
        getBlackHoleState: () => blackHole.number1BlackHoleState,
        addToLog,
        markMeaningfulProgress,
        updateTurboBoostUI,
        updateRateDisplay,
        autosaveNow,
        syncTurboBoostToggleDomFromBoot,
        gameplaySimFrozen
    }));
    /** Default gap between catalog “Discovered combo” milestones; reduced by middle `comboDiscoveryMilestoneCooldownMult` (× each, min 0.1s). */
    const COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS = 60000;
    const COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS = 100;
    Object.assign(ascensionHubRenderRef, n1Boot.createAscensionHubRender({
        getNumber1HasAscended: () => ascension.number1HasAscended,
        getNumber1AscensionNodeIds: () => ascension.number1AscensionNodeIds,
        getAscensionMapNodeById: () => ASCENSION_MAP_NODE_BY_ID,
        getAscensionMapNodeCount: () => ASCENSION_MAP_NODES.length,
        computeAscensionGrantTotals,
        getNearMissToleranceRanks,
        getUnlockedHands: () => run.unlockedHands,
        getPatternCatalogMultiplier: () => comboForward.getPatternCatalogMultiplier(),
        getAscensionComboPatternMult: () => comboForward.getAscensionComboPatternMult(),
        getTimeWarpComboMultiplier: () => comboForward.getTimeWarpComboMultiplier(),
        getTurboCountMultiplierMax,
        getTurboMeterMax,
        formatCount,
        getTimeWarpOverflowRatio,
        getTimeWarpAuraSpawnSpanMaxSec,
        getMaxCheapenLevel,
        getAscensionEssenceInvestedInNodes,
        getNumber1AscensionPendingBonusEssence,
        getNumber1BlackHoleProductionMult,
        getBlackHolePhase,
        getPhase1EssenceSpent: () => blackHole.number1BlackHoleState.phase1EssenceSpent,
        getPhase2Mass: () => blackHole.number1BlackHoleState.phase2Mass,
        getPhase2ParallelBonusPool: () => blackHole.number1BlackHoleState.phase2ParallelBonusPool,
        isBlackHoleArcUnlocked,
        formatBlackHolePhase1CpsMultForUi,
        getBlackHolePhase1RunCpsMult,
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence
    }));
    Object.assign(ascensionNodeActionsRef, n1Boot.wireAscensionNodeActions({
        getNumber1HasAscended: () => ascension.number1HasAscended,
        getNumber1AscensionNodeIds: () => ascension.number1AscensionNodeIds,
        setNumber1AscensionNodeIds: ids => { ascension.number1AscensionNodeIds = ids; },
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        addNumber1AscensionEssence: delta => { ascension.number1AscensionEssence += delta; },
        getAscensionMapNodeById: () => ASCENSION_MAP_NODE_BY_ID,
        getAscensionPurchaseChainInfoToNode,
        ascensionNodeDisplayName,
        getAscensionNodePurchaseCost,
        addToLog,
        formatCount,
        autosaveNow,
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
        applyAscensionAutobuyGrantToUnlockedHands,
        updateCheapenUpgradeUI,
        updateTurboBoostUI,
        updateRateDisplay,
        updateTimeWarpAuraUI,
        getPhase1MapCollapseSeen: () => blackHole.number1BlackHoleState.phase1MapCollapseSeen,
        setPhase1MapCollapseSeen: v => { blackHole.number1BlackHoleState.phase1MapCollapseSeen = v; },
        isNumber1AscensionTreeFullyPurchased,
        refreshOverviewAndAscensionPanelsIfOpen,
        tryTurboLevelerPurchases,
        checkStoryBanners: () => story.checkStoryBanners(),
        hasBlackHoleProgressLockingRespec,
        isBlackHoleArcUnlocked,
        resetBlackHolePhaseToZero: () => { blackHole.number1BlackHoleState.phase = 0; },
        resetTurboLevelerBank: () => {
            turbo.turboLevelerBank = 0;
            turbo.turboLevelerPurchases = 0;
        },
        getAscensionMapCollapseActiveUntilMs: () => ascension.ascensionMapCollapseActiveUntilMs,
        setAscensionMapCollapseActiveUntilMs: v => { ascension.ascensionMapCollapseActiveUntilMs = v; },
        getAscensionMapCollapsePending: () => ascension.ascensionMapCollapsePending,
        setAscensionMapCollapsePending: v => { ascension.ascensionMapCollapsePending = v; },
        getAscensionMapCollapseTimerId: () => ascension.ascensionMapCollapseTimerId,
        setAscensionMapCollapseTimerId: v => { ascension.ascensionMapCollapseTimerId = v; },
        getStoryBannerOverlayEl: () => document.getElementById("story-banner-overlay"),
        getStoryBannerById: id => storyBannerLookupRef.getStoryBannerById(id),
        showStoryBanner: (banner, opts) => storyBannerLookupRef.showStoryBanner(banner, opts),
        ensureBlackHoleArcStarted,
        refreshAscensionPanelIfOpen
    }));
    function escapeAscensionHtml(t) {
        return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    /** Fingerprint ascend-control copy + affordances for ~1 Hz incremental patch (avoid outerHTML churn). */
    Object.assign(ascensionPageRenderRef, n1Boot.createAscensionPageRender({
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        getNumber1HasAscended: () => ascension.number1HasAscended,
        getUnlockedHands: () => run.unlockedHands,
        getTotalChanges: () => run.totalChanges,
        getBlackHolePhase,
        getNumber1AscensionRequiredHands,
        isNumber1AscensionReady,
        computeNumber1AscensionGainBreakdown,
        getNumber1AscensionEssenceFormulaTotal,
        formatCount,
        getArcEssenceMultiplierBonusPhraseLower,
        ascensionPurchasedSet,
        isAscensionMapCollapseTransitionActive,
        isBlackHoleArcUnlocked,
        getNumber1AscensionNodeIds: () => ascension.number1AscensionNodeIds,
        getAscensionMapNodeById: () => ASCENSION_MAP_NODE_BY_ID,
        computeAscensionHandLayout,
        getAscensionMapViewBoxHeight: () => ascensionMapFacadeRef.getAscensionMapViewBoxHeight(),
        getAscensionTreeExport: () => ASCENSION_TREE_EXPORT,
        getAscensionMapNodes: () => ASCENSION_MAP_NODES,
        ascensionNodePrereqsMet,
        renderAscensionMapColumnGuidesSvg,
        renderAscensionMapEdgesSvg,
        renderAscensionMapDebugOverlaySvg,
        renderAscensionHubStatsPillsHtml,
        renderAscensionHubGrantsHtml,
        renderNumber1BlackHolePanelHtml,
        normalizeAscensionPageActiveNumber() {
            if (ascension.ascensionPageActiveNumber === 2 && !isNumber2Unlocked()) {
                ascension.ascensionPageActiveNumber = 1;
            }
        },
        getAscensionPageActiveNumber: () => ascension.ascensionPageActiveNumber,
        isNumber2Unlocked,
        renderNumber2AscensionShell: () => number2.renderAscensionShell()
    }));
    const NUMBER_MODULES = buildNumberModulesRegistry(createNumber1ShellRegistryDeps({
        createNumberModule,
        getRawCpsPerHand,
        getComboMultiplier: comboForward.getComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        longTermObjectives,
        run,
        formatCount,
        getObjectiveProgressForTotal,
        isNumber1AscensionReady,
        ascension,
        getBlackHolePhase,
        formatBlackHoleMultForUi,
        blackHole,
        number2,
        number2State,
        isNumber2Unlocked
    }));
    function getUnlockedNumberModules() {
        return getUnlockedNumberModulesFromRegistry(unlockedNumbers, NUMBER_MODULES);
    }
    function tickBackgroundNumberModules(dtSec) {
        tickBackgroundNumberModulesFromRegistry(dtSec, unlockedNumbers, NUMBER_MODULES, {
            getMode: () => (typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1),
            tickNumber1BackgroundCps
        });
    }
    const { renderGlobalOverview } = n1Boot.createGlobalOverviewBoot({
        formatCount,
        getUnlockedNumberModules,
        computeNumber1AscensionGainBreakdown,
        getNumber1AscensionEssenceFormulaTotal,
        getArcEssenceMultiplierBonusPhraseTitle,
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        getNumber1AscensionRequiredHands,
        getNumber1HasAscended: () => ascension.number1HasAscended,
        getNumber2Started: () => number2State.started,
        getNumber2AscensionEssence: () => number2State.ascensionEssence || 0
    });
    const {
        renderMessageAndStoryLogPageHtml,
        refreshStoryArchiveSectionIfOpen,
        scrollMessageLogPanelToBottom
    } = n1Boot.createMessageStoryLogPageBoot({
        logTickerRt,
        escapeHtml,
        renderStoryArchiveHtmlForState,
        getStoryBanners: () => storyBanners,
        story,
        pagePanelEl,
        pagePanelBodyEl
    });
    logPanelRefreshDeps.renderMessagesAndStory = renderMessageAndStoryLogPageHtml;
    function refreshMessageLogPanelIfOpen() {
        logTickerRt.refreshMessageLogPanelIfOpen();
    }

    const { showPagePanel } = n1Boot.createPagePanelBoot({
        pagePanelEl,
        pagePanelTitleEl,
        pagePanelBodyEl,
        pageModalEl,
        teardownAscensionMapPanZoom,
        closeInlineMainStagePanels,
        renderMessageAndStoryLogPageHtml,
        comboForward,
        renderAscensionPageHtml,
        renderGlobalOverview,
        formatCount,
        turboUnlockCount: TURBO_UNLOCK_COUNT,
        syncPhase1MassFillCssVars,
        syncPhase1TesseractCanvasesInRoot,
        syncMessageLogScrollContainerMode,
        syncInlinePanelsVsGameplay,
        scrollMessageLogPanelToBottom,
        getAscensionPageActiveNumber: () => ascension.ascensionPageActiveNumber,
        getNumber1HasAscended: () => ascension.number1HasAscended,
        initAscensionMapPanZoom
    });

    /* ---------------------------------------------------------
       SPEED UPGRADE (per-hand)
    --------------------------------------------------------- */
    const { autoBuyEnabledByHand, autoBuyCountdownSecondsByHand } = autobuy;
    const AUTO_BUY_DELAY_SECONDS = 30;
    let devAutoBuyDelaySeconds = null;
    function getAutoBuyDelaySeconds() {
        var base = devAutoBuyDelaySeconds !== null ? devAutoBuyDelaySeconds : AUTO_BUY_DELAY_SECONDS;
        var mult = computeAscensionGrantTotals().autoBuyDelayMult || 1;
        return Math.max(0.05, base * mult);
    }
    function getEffectiveSpeedLevel(handIndex) {
        return getEffectiveUpgradeLevel(handsRt.speedLevel[handIndex], handsRt.speedBonusLevel[handIndex]);
    }
    function getSpeedMultiplier(handIndex) {
        return getSpeedMultiplierForLevel(getEffectiveSpeedLevel(handIndex));
    }
    /** Stable integer key: same effective speed → same bucket (avoids `Math.pow(2, level)` float collisions at high levels). */
    function getHandSpeedSyncBucketKey(handIndex) {
        if (handIndex < 0 || handIndex >= run.unlockedHands) return null;
        return String(getEffectiveSpeedLevel(handIndex));
    }
    function getUpgradeCost(handIndex, nextLevel) {
        const ascSpeed = computeAscensionGrantTotals().speedMult;
        return getSpeedUpgradeCost(nextLevel, getCheapenMultiplier(handIndex), ascSpeed);
    }
    const upgradeContainer = document.getElementById("upgrade-container");
    const speedUpgradesContainerEl = document.getElementById("speed-upgrades-container");
    const upgradeScrollHintEl = document.getElementById("upgrade-scroll-hint");
    const upgradeScrollHintMessagesEl = document.getElementById("upgrade-scroll-hint-messages");
    const upgradeScrollHintJumpsEl = document.getElementById("upgrade-scroll-hint-jumps");
    const upgradeDom = createUpgradeUiController({
        speedUpgradesContainerEl,
        turboScensionPanelEl,
        getUnlockedHands: () => run.unlockedHands,
        ascensionAutobuyDefaultOnForNewHands,
        autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand,
        getTimeWarpProductionSecondsBonus,
        setAutoBuyEnabledForHand
    });
    const speedRowRefs = upgradeDom.speedRowRefs;
    const handsBoot = n1Boot.wireHands({
        handsRt,
        run,
        maxHands,
        getSpeedRowRefs: () => speedRowRefs,
        ensureSpeedRows,
        createHandCounter: (handNum, slot) => new HandCounter(handNum, HAND_BASE_SPEED, slot)
    });
    /** When autobuy / warp-assist skips per-purchase upgrade DOM, flush once this step (or with the normal throttle). */
    let batchedUpgradeUiFlush = false;
    function flashSpeedAutobuyToast(handIndex, text) {
        upgradeDom.flashSpeedAutobuyToast(handIndex, text);
    }
    function syncAutobuyToggleDomFromState(handIndex) {
        const ref = speedRowRefs[handIndex];
        if (ref && ref.autobuyToggleEl) ref.autobuyToggleEl.checked = !!autoBuyEnabledByHand[handIndex];
    }
    function setAutoBuyEnabledForHand(handIndex, enabled) {
        if (handIndex < 0) return;
        autoBuyEnabledByHand[handIndex] = !!enabled;
        syncAutobuyToggleDomFromState(handIndex);
    }
    function syncAllAutobuyTogglesFromState() {
        for (let i = 0; i < run.unlockedHands; i++) syncAutobuyToggleDomFromState(i);
    }
    function ensureSpeedRows() {
        upgradeDom.ensureSpeedRows();
    }
    function shrinkSpeedRowsTo(keepCount) {
        upgradeDom.shrinkSpeedRowsTo(keepCount);
    }

    function getCheapestSpeedUpgrade() {
        let best = null;
        for (let i = 0; i < run.unlockedHands; i++) {
            if (!autoBuyEnabledByHand[i]) continue;
            const nextLevel = handsRt.speedLevel[i] + 1;
            const cost = getUpgradeCost(i, nextLevel);
            if ((run.handEarnings[i] || 0) < cost) continue;
            if (best === null || cost < best.cost) best = { handIndex: i, cost, nextLevel };
        }
        return best;
    }
    function setUpgradeTooltipText(btn, text) {
        upgradeDom.setUpgradeTooltipText(btn, text);
    }
    function setUpgradeButtonProgress(btn, progress01) {
        upgradeDom.setUpgradeButtonProgress(btn, progress01);
    }
    Object.assign(turboUiRef, n1Boot.createTurboUiBoot({
        getTurbo: () => turbo,
        isTurboScensionUnlocked,
        getTurboMeterMax,
        getTurboScensionActivationCost,
        getTurboScensionUpgradeRollCount,
        getTurboLevelerNextPointCost,
        getTurboScensionUpgradeActivationEtaHint,
        getTurboCountMultiplierFromMeter,
        computeAscensionGrantTotals,
        getBlackHoleState: () => blackHole.number1BlackHoleState,
        tryUnlockTurboIfEligible: () => tryUnlockTurboIfEligible(),
        registerSyncBhCollapseTurboTierAccents,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        turboBoostWrapEl,
        turboBoostFillEl,
        turboBoostGaugeEl,
        turboBoostMultiplierEl,
        turboBoostActivationsEl,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        turboScensionPanelEl,
        turboRightClusterEl,
        turboScensionBurnLineEl,
        turboScensionTankLineEl,
        turboScensionMultLineEl,
        turboScensionFillLineEl,
        turboScensionUpgradeBtn,
        turboScensionLevelerLineEl
    }));
    function onWindowScrollResizeForUpgrades() {
        upgradeDom.positionVisibleTooltips();
        scheduleHandUpgradeScrollHintUpdate();
    }
    function positionTooltipForHost(host) {
        upgradeDom.positionTooltipForHost(host);
    }
    function positionTooltipForButton(btn) {
        upgradeDom.positionTooltipForButton(btn);
    }
    function positionVisibleTooltips() {
        upgradeDom.positionVisibleTooltips();
    }
    function dismissAllHoverOnlyTooltips() {
        upgradeDom.dismissAllHoverOnlyTooltips();
    }
    function stopUpgradeHoldRepeat(setSuppressForClick) {
        upgradeDom.stopUpgradeHoldRepeat(setSuppressForClick);
    }
    function clearUpgradeTooltipHoverTimer(btn) {
        upgradeDom.clearUpgradeTooltipHoverTimer(btn);
    }
    function cancelUpgradeTooltipHoverShow(btn) {
        upgradeDom.cancelUpgradeTooltipHoverShow(btn);
    }
    function bindTurboScensionTooltipHovers() {
        upgradeDom.bindTurboScensionTooltipHovers();
    }

    let buySpeedUpgradeForHand = function() {};
    let maybeAutoBuySpeedUpgrade = function() {};

    /* ---------------------------------------------------------
       CHEAPEN SPEED UPGRADE (per-hand), max 10 per hand (base; ascension adds). 99%, 99.9%, ...
    --------------------------------------------------------- */
    const {
        cheapenLevel,
        cheapenBonusLevel,
        slowdownLevel,
        slowdownBonusLevel
    } = upgrades;
    function getEffectiveCheapenLevel(handIndex) {
        return getEffectiveUpgradeLevel(cheapenLevel[handIndex], cheapenBonusLevel[handIndex]);
    }
    function getCheapenMultiplier(handIndex) {
        return getCheapenMultiplierForLevel(getEffectiveCheapenLevel(handIndex));
    }
    function getCheapenUpgradeCost(handIndex, nextLevel) {
        return getCheapenUpgradeCostForLevel(nextLevel);
    }
    let cheapenSectionUnlocked = false;
    let devCheapenAutobuyOn = false;
    let cheapenAutoBuyCountdownByHand = [];
    let devSlowdownAutobuyOn = false;
    /** Dev-only: when true, hand combos no longer charge the Turbo meter (passive fill still applies). */
    let devTurboComboMeterGainDisabled = false;
    let slowdownAutoBuyCountdownByHand = [];

    /** Effect after purchasing the next tier (same as achieved level once bought). */
    function getCheapenEffectText(nextLevel) {
        return getCheapenEffectTextForAchievedLevel(nextLevel);
    }

    let buyCheapenUpgradeForHand = function() {};
    let maybeAutoBuyCheapen = function() {};

    let maybeAutoBuySlowdown = function() {};

    /* ---------------------------------------------------------
       COMPACTION upgrade (per-hand), unlock at 1e15, base max 4 (+ up to +6 from Black Hole Phase 1 fill).
       Purchase resets Speed to 0; each level multiplies tick value by 10^level.
       Digit animation cadence follows Speed upgrades again (same interval math as without Compaction).
    --------------------------------------------------------- */
    function getEffectiveSlowdownLevel(handIndex) {
        return getEffectiveUpgradeLevel(slowdownLevel[handIndex], slowdownBonusLevel[handIndex]);
    }

    function getSlowdownMultiplier(handIndex) {
        const lv = getEffectiveSlowdownLevel(handIndex);
        return lv <= 0 ? 1 : Math.pow(10, lv);
    }
    function getSlowdownUpgradeCost(nextLevel) {
        const cap = getMaxSlowdownLevelCap();
        var m = computeAscensionGrantTotals().slowdownCostMult || 1;
        return getSlowdownUpgradeCostForLevel(nextLevel, cap, m);
    }
    function isSlowdownUnlocked() {
        return run.slowdownCompactionUnlockedLatched;
    }
    let buySlowdownUpgradeForHand = function() {};

    /* ---------------------------------------------------------
       TIME WARP (per-hand aura), unlock at 1e18.
       Random aura every 0–60s span (see spawn mult). Manual click grants 10× (60s or ascension-boosted seconds) of that hand's effective rate; Pinky Warp Potency can multiply manual clicks when the aura idles (overflow unchanged).
       If all hands already have aura, auto-grant 25% value to a random hand.
    --------------------------------------------------------- */

    /* RATE DISPLAY and TICK INTERVAL (per-hand CPS + tick interval; n1-rate-display-ui consumes bridges). */
    const {
        formatCpsForDisplay,
        getTickIntervalMs,
        getHandPerHandRawCps,
        getHandBaseCpsBeforeSlowdownMult,
        getHandSlowdownFactorForDisplay,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandEffectiveCps,
        getTotalRawCpsSum,
        getInstantTotalCps,
        getRawCpsPerHand: wireGetRawCpsPerHand
    } = createNumber1RateTickBoot({
        getUnlockedHands: () => run.unlockedHands,
        getHands: () => handsRt.hands,
        getSpeedMultiplier,
        getSlowdownMultiplier,
        formatCount,
        getComboMultiplier: comboForward.getComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        isSlowdownUnlocked,
        getTurboBoostUnlocked: () => turbo.turboBoostUnlocked
    });
    rateTickRef.getRawCpsPerHand = wireGetRawCpsPerHand;
    Object.assign(detachedCpsRef, n1Boot.wireDetachedCps({
        getBlackHolePhase,
        getUnlockedHands: () => run.unlockedHands,
        getRawCpsPerHand,
        getComboMultiplier: comboForward.getComboMultiplier,
        getTurboMultiplier: getTurboCountMultiplier,
        getBlackHoleOfflineProductionMult,
        mergeHandEarningsFromDetachedSlice(gainsByHand) {
            for (let i = 0; i < run.unlockedHands; i++) {
                run.handEarnings[i] = (run.handEarnings[i] || 0) + (gainsByHand[i] || 0);
            }
        },
        refreshTotalsFromHands: refreshTotalFromHandEarnings,
        incrementalEl,
        formatCount,
        getTotalChanges: () => run.totalChanges
    }));
    const upgradeEtaSmoother = createUpgradeEtaSmoother({ getHandEffectiveCps });
    function bumpUpgradeEtaSmoothPass() {
        upgradeEtaSmoother.bumpPass();
    }
    /** Line for upgrade button tooltips: ETA to cover cost shortfall at smoothed count/s for this hand. */
    function formatUpgradeAffordEtaLine(balance, cost, handIndex) {
        return upgradeEtaSmoother.formatAffordEtaLine(balance, cost, handIndex);
    }
    const { scheduleFitTopCountRow, initTopCountRowFitObservers } = createTopCountRowFit({
        getTurboFitEl: () => turboRightClusterEl || turboBoostWrapEl,
        incrementalEl,
        incrementalRateEl
    });
    const {
        applyTheme,
        loadSettings,
        persistSettings,
        applySettingsToUI
    } = n1Boot.wireSettings({
        session,
        storage: typeof localStorage !== "undefined" ? localStorage : null,
        settingsThemeDarkEl,
        settingsAdaptiveTipsEl,
        settingsCurtainEnabledEl,
        settingsHumorEnabledEl,
        settingsShowClapAnimationEl,
        settingsOfflineCapHoursEl,
        scheduleFitTopCountRow
    });
    const {
        renderComboPagePerHandStatusSectionHtml,
        refreshCombinationsHandStatusIfOpen
    } = createComboHandStatusUi({
        pagePanelEl,
        pagePanelTitleEl,
        getUnlockedHands: () => run.unlockedHands,
        getHandEarning: i => run.handEarnings[i] || 0,
        getHandBaseCpsBeforeSlowdownMult,
        getHandPerHandRawCps,
        getHandEffectiveCps,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandSlowdownFactorForDisplay,
        formatCount,
        formatCpsForDisplay
    });
    const {
        updateN1GravityCpsStrip,
        updateHandStatusBlocks,
        updateRateDisplay: wireUpdateRateDisplay
    } = createRateDisplayUi({
        n1GravityCpsStripEl,
        phase1EssenceTarget: BLACK_HOLE_PHASE1_ESSENCE_TARGET,
        getBlackHolePhase,
        isBlackHoleArcUnlocked,
        getNumber1BlackHoleState: () => blackHole.number1BlackHoleState,
        getBlackHolePhase1RunCpsMult,
        formatBlackHolePhase1CpsMultForUi,
        getBlackHoleTotalMult,
        getBlackHoleFurnaceMult,
        getUnlockedHands: () => run.unlockedHands,
        getHandPerHandRawCps,
        getComboMultiplier: comboForward.getComboMultiplier,
        getPatternCatalogMultiplier: comboForward.getPatternCatalogMultiplier,
        getAscensionComboPatternMult: comboForward.getAscensionComboPatternMult,
        getTurboCountMultiplier,
        getTurboCountMultiplierFromMeter,
        getNumber1BlackHoleProductionMult,
        getInstantTotalCps,
        getTurboBoostUnlocked: () => turbo.turboBoostUnlocked,
        getTurboBoostEnabled: () => turbo.turboBoostEnabled,
        getGravityStackTooltipPhrase,
        bonusMultiplierEl,
        turboMultiplierDisplayEl,
        incrementalRateEl,
        formatCount,
        formatCompactMultiplier,
        formatTurboBoostMultiplierForDisplay,
        getSpeedRowRefs: () => speedRowRefs,
        getHandEarning: i => run.handEarnings[i] || 0,
        getHandBaseCpsBeforeSlowdownMult,
        getHandSlowdownFactorForDisplay,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandEffectiveCps,
        formatCpsForDisplay,
        refreshCombinationsHandStatusIfOpen,
        scheduleFitTopCountRow
    });
    rateDisplayUiRef.updateRateDisplay = wireUpdateRateDisplay;
    rateDisplayUiRef.updateN1GravityCpsStrip = updateN1GravityCpsStrip;

    const syncPlayStageForNumberMode = n1Boot.createSyncPlayStage({
        isNumber2Unlocked,
        number2,
        syncBlackHolePhase1Vfx,
        updateN1GravityCpsStrip
    });
    n1Boot.wireShellModeSwitch({
        closeInlineMainStagePanels,
        syncPlayStageForNumberMode,
        number2,
        scheduleFitTopCountRow,
        updateRateDisplay
    });

    const sprayConfettiFrom = createConfettiSprayer();
    const upgradesWire = n1Boot.wireUpgrades({
        slowdown: {
            getBlackHolePhase,
            getUnlockedHands: () => run.unlockedHands,
            getHandEarnings: i => run.handEarnings[i] || 0,
            getSlowdownLevel: () => slowdownLevel,
            getSlowdownBonusLevel: () => slowdownBonusLevel,
            getSlowdownAutoBuyCountdownByHand: () => slowdownAutoBuyCountdownByHand,
            setSlowdownAutoBuyCountdown: (i, v) => { slowdownAutoBuyCountdownByHand[i] = v; },
            getMaxSlowdownLevelCap,
            getSlowdownUpgradeCost,
            isSlowdownUnlocked,
            devSlowdownAutobuyOn: () => devSlowdownAutobuyOn,
            ascensionAutobuyIncludesSlowdown,
            getAutoBuyUnlocked: () => autobuy.autoBuyUnlocked,
            getAutoBuyEnabledByHand: i => !!autoBuyEnabledByHand[i],
            setHandEarningBalance: (i, b) => { run.handEarnings[i] = b; },
            markMeaningfulProgress,
            markAutobuyDeferredTotalsPending,
            refreshTotalFromHandEarnings,
            getIncrementalCountEl: () => incrementalEl,
            formatCount,
            getTotalChanges: () => run.totalChanges,
            addToLog,
            setSlowdownBaseLevel: (i, v) => { slowdownLevel[i] = v; },
            resetSpeedLevelForCompaction: i => { handsRt.speedLevel[i] = 0; },
            getHands: () => handsRt.hands,
            getSpeedRowRefs: () => speedRowRefs,
            sprayConfettiFrom,
            setUpgradeTooltipText,
            setUpgradeButtonProgress,
            formatUpgradeAffordEtaLine,
            flashSpeedAutobuyToast,
            setBatchedUpgradeUiFlush: v => { batchedUpgradeUiFlush = v; },
            updateSpeedUpgradeUI,
            updateRateDisplay,
            updateHandUpgradeScrollHint,
            getAutoBuyDelaySeconds,
            onSlowdownUnlockedFirstUi: () => {
                if (isSlowdownUnlocked() && !upgrades.slowdownUnlockLogged) {
                    upgrades.slowdownUnlockLogged = true;
                    addToLog("Compaction unlocked (all hands).", "milestone");
                }
            }
        },
        cheapen: {
            getBlackHolePhase,
            getUnlockedHands: () => run.unlockedHands,
            getHandEarnings: i => run.handEarnings[i] || 0,
            getCheapenLevel: () => cheapenLevel,
            getCheapenBonusLevel: () => cheapenBonusLevel,
            getCheapenSectionUnlocked: () => cheapenSectionUnlocked,
            setCheapenSectionUnlocked: v => { cheapenSectionUnlocked = v; },
            getCheapenAutoBuyCountdownByHand: () => cheapenAutoBuyCountdownByHand,
            setCheapenAutoBuyCountdown: (i, v) => { cheapenAutoBuyCountdownByHand[i] = v; },
            getMaxCheapenLevel,
            getCheapenUpgradeCost,
            devCheapenAutobuyOn: () => devCheapenAutobuyOn,
            ascensionAutobuyIncludesCheapen,
            getAutoBuyUnlocked: () => autobuy.autoBuyUnlocked,
            getAutoBuyEnabledByHand: i => !!autoBuyEnabledByHand[i],
            setHandEarningBalance: (i, b) => { run.handEarnings[i] = b; },
            markMeaningfulProgress,
            markAutobuyDeferredTotalsPending,
            refreshTotalFromHandEarnings,
            getIncrementalCountEl: () => incrementalEl,
            formatCount,
            getTotalChanges: () => run.totalChanges,
            addToLog,
            getCheapenEffectText,
            setCheapenBaseLevel: (i, v) => { cheapenLevel[i] = v; },
            getSpeedRowRefs: () => speedRowRefs,
            sprayConfettiFrom,
            setUpgradeTooltipText,
            setUpgradeButtonProgress,
            formatUpgradeAffordEtaLine,
            flashSpeedAutobuyToast,
            setBatchedUpgradeUiFlush: v => { batchedUpgradeUiFlush = v; },
            updateSpeedUpgradeUI,
            ensureSpeedRows,
            updateHandUpgradeScrollHint,
            getAutoBuyDelaySeconds
        },
        speed: {
            getBlackHolePhase,
            getUnlockedHands: () => run.unlockedHands,
            getSpeedLevel: () => handsRt.speedLevel,
            getUpgradeCost,
            getHandEarnings: i => run.handEarnings[i] || 0,
            setHandEarningBalance: (i, b) => { run.handEarnings[i] = b; },
            markMeaningfulProgress,
            markAutobuyDeferredTotalsPending,
            refreshTotalFromHandEarnings,
            incrementSpeedLevel: i => { handsRt.speedLevel[i]++; },
            getHands: () => handsRt.hands,
            addToLog,
            getIncrementalCountEl: () => incrementalEl,
            formatCount,
            getTotalChanges: () => run.totalChanges,
            restartAllHandTimers: () => handsRt.hands.forEach(h => h.restartTimer()),
            getAutoBuyUnlocked: () => autobuy.autoBuyUnlocked,
            setSpeedAutobuyCountdown: (i, v) => { autoBuyCountdownSecondsByHand[i] = v; },
            getAutoBuyEnabledByHand: i => !!autoBuyEnabledByHand[i],
            getAutoBuyCountdownSecondsByHand: i => autoBuyCountdownSecondsByHand[i] || 0,
            getAutoBuyDelaySeconds,
            getSpeedRowRefs: () => speedRowRefs,
            sprayConfettiFrom,
            setBatchedUpgradeUiFlush: v => { batchedUpgradeUiFlush = v; },
            updateSpeedUpgradeUI,
            updateRateDisplay,
            flashSpeedAutobuyToast
        }
    });
    buySpeedUpgradeForHand = upgradesWire.buySpeedUpgradeForHand;
    maybeAutoBuySpeedUpgrade = upgradesWire.maybeAutoBuySpeedUpgrade;
    buyCheapenUpgradeForHand = upgradesWire.buyCheapenUpgradeForHand;
    maybeAutoBuyCheapen = upgradesWire.maybeAutoBuyCheapen;
    updateCheapenUpgradeUI = upgradesWire.updateCheapenUpgradeUI;
    buySlowdownUpgradeForHand = upgradesWire.buySlowdownUpgradeForHand;
    maybeAutoBuySlowdown = upgradesWire.maybeAutoBuySlowdown;
    updateSlowdownUpgradeUI = upgradesWire.updateSlowdownUpgradeUI;

    Object.assign(handUnlockRef, n1Boot.wireHandUnlock({
        run,
        maxHands,
        handsRt,
        speedRowRefs,
        HandCounter,
        getAscensionHandUnlockStartingCountFloor,
        markMeaningfulProgress,
        ensureSpeedRows,
        addToLog,
        checkStoryBanners: () => story.checkStoryBanners(),
        comboForward,
        updatePageButtonUnlocks,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI
    }));
    handUnlockRef.initFirstHand();

    const timeWarpWire = n1Boot.wireTimeWarp({
        timewarp,
        boot: {
            getTotalChanges: () => run.totalChanges,
            getUnlockedHands: () => run.unlockedHands,
            getSpeedRowRefs: () => speedRowRefs,
            getHandEarnings: i => run.handEarnings[i] || 0,
            setHandEarningBalance: (i, v) => { run.handEarnings[i] = v; },
            getTimeWarpAuraActiveByHand: () => timewarp.timeWarpAuraActiveByHand,
            setTimeWarpAuraActiveByHand: v => { timewarp.timeWarpAuraActiveByHand = v; },
            getTimeWarpAuraAppearedAtMsByHand: () => timewarp.timeWarpAuraAppearedAtMsByHand,
            setTimeWarpAuraAppearedAtMsByHand: v => { timewarp.timeWarpAuraAppearedAtMsByHand = v; },
            getTimeWarpNextSpawnInSec: () => timewarp.timeWarpNextSpawnInSec,
            setTimeWarpNextSpawnInSec: v => { timewarp.timeWarpNextSpawnInSec = v; },
            getTimeWarpUnlockLogged: () => timewarp.timeWarpUnlockLogged,
            setTimeWarpUnlockLogged: v => { timewarp.timeWarpUnlockLogged = v; },
            computeAscensionGrantTotals,
            getHandPerHandRawCps,
            getTimeWarpComboMultiplier: comboForward.getTimeWarpComboMultiplier,
            getTurboCountMultiplier,
            getNumber1BlackHoleProductionMult,
            getIncrementalCountEl: () => incrementalEl,
            formatCount,
            refreshTotalFromHandEarnings,
            updateObjectives: () => number1ObjectivesBoot.scheduleObjectiveDomFlush(),
            updateSpeedUpgradeUI,
            updateCheapenUpgradeUI,
            updateSlowdownUpgradeUI,
            updateRateDisplay,
            updateMilestoneUI,
            addToLog,
            markMeaningfulProgress,
            scheduleHandUpgradeScrollHintUpdate,
            handScrollHintHasUpgradeReason,
            getNumber1HasAscended: () => ascension.number1HasAscended,
            getAscensionPendingBonusEssence: getNumber1AscensionPendingBonusEssence,
            setAscensionPendingBonusEssence: v => { ascension.number1AscensionPendingBonusEssence = v; },
            refreshOverviewAndAscensionHubLiveIfOpen,
            autosaveNow,
            getSpeedLevel: () => handsRt.speedLevel,
            getCheapenLevel: () => cheapenLevel,
            getSlowdownLevel: () => slowdownLevel,
            getMaxCheapenLevel,
            getCheapenUpgradeCost,
            getUpgradeCost,
            getSlowdownUpgradeCost,
            getMaxSlowdownLevelCap,
            isSlowdownUnlocked,
            buyCheapenUpgradeForHand,
            buySpeedUpgradeForHand,
            buySlowdownUpgradeForHand,
            flushAutobuyDeferredTotalsIfAny
        },
        afterWarpAssist: {
            setBatchedUpgradeUiFlush: v => { batchedUpgradeUiFlush = v; },
            updateSpeedUpgradeUI,
            updateCheapenUpgradeUI,
            updateSlowdownUpgradeUI,
            updateRateDisplay
        }
    });
    const {
        handHasActiveTimeWarpAura,
        handContributesTimeWarpPriority,
        handContributesToScrollHint,
        ensureTimeWarpArrays,
        getWarpPotencyMaxTiersEffective,
        getWarpPotencyTierForHandNow,
        getWarpPotencyMultiplierForHandNow,
        scheduleNextTimeWarpSpawn,
        getTimeWarpGrantForHand,
        applyTimeWarpGrant,
        tryGrantAscensionBonusEssenceFromWarp,
        applyTimeWarpOverflowToAllHands,
        applyTimeWarpManualAutoBuyAssistForHand,
        playTimeWarpScreenEffect,
        activateTimeWarpAuraForHand,
        updateTimeWarpSystem,
        getAscensionComboTimeWarpDelayReductionPerTriggerSec,
        applyAscensionComboTimeWarpDelayReduction
    } = timeWarpWire;
    updateTimeWarpAuraUI = timeWarpWire.updateTimeWarpAuraUI;

    Object.assign(speedUpgradeUiRef, n1Boot.createSpeedUpgradeUiBoot({
        bumpUpgradeEtaSmoothPass,
        getTotalChanges: () => run.totalChanges,
        upgradeContainer,
        addToLog,
        speedUpgradesContainerEl,
        ensureSpeedRows,
        getUnlockedHands: () => run.unlockedHands,
        getSpeedRowRefs: () => speedRowRefs,
        getSpeedLevel: () => handsRt.speedLevel,
        getSpeedBonusLevel: () => handsRt.speedBonusLevel,
        getUpgradeCost,
        getHandEarnings: i => run.handEarnings[i] || 0,
        getEffectiveSpeedLevel,
        formatCount,
        setUpgradeButtonProgress,
        setUpgradeTooltipText,
        formatUpgradeAffordEtaLine,
        getAutoBuyUnlocked: () => autobuy.autoBuyUnlocked,
        setAutoBuyUnlocked: v => { autobuy.autoBuyUnlocked = v; },
        getAutoBuyEnabledByHand: i => !!autoBuyEnabledByHand[i],
        getAutoBuyCountdownSecondsByHand: i => autoBuyCountdownSecondsByHand[i] || 0,
        getCheapenSectionUnlocked: () => cheapenSectionUnlocked,
        getCheapenLevel: () => cheapenLevel,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        isSlowdownUnlocked,
        getSlowdownLevel: () => slowdownLevel,
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        handContributesToScrollHint,
        handContributesTimeWarpPriority,
        handHasActiveTimeWarpAura,
        upgradeScrollHintEl,
        upgradeScrollHintMessagesEl,
        upgradeScrollHintJumpsEl
    }));

    const turboWire = n1Boot.wireTurbo({
        turboScensionUpgradeBtn,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        setTurboBoostEnabled: v => { turbo.turboBoostEnabled = v; },
        tryTurboLevelerPurchases,
        updateTurboBoostUI,
        updateRateDisplay,
        tryTurboScensionActivationUpgrade,
        getTotalChanges: () => run.totalChanges,
        getTurboBoostUnlocked: () => turbo.turboBoostUnlocked,
        onTurboSystemFirstUnlock: () => {
            turbo.turboBoostUnlocked = true;
            turbo.turboBoostEnabled = false;
        },
        turboBoostWrapEl,
        addToLog,
        formatCount,
        checkStoryBanners: () => story.checkStoryBanners()
    });
    tryUnlockTurboIfEligible = turboWire.tryUnlockTurboIfEligible;
    syncTurboBoostToggleDomFromBoot = turboWire.syncTurboBoostToggleDomFromBoot;

    milestoneUnlockRef.syncUnlocksWithTotalCount = n1Boot.wireMilestoneUnlocks({
        run,
        autobuy,
        upgrades,
        timewarp,
        upgradeContainer,
        getCheapenSectionUnlocked: () => cheapenSectionUnlocked,
        setCheapenSectionUnlocked: v => { cheapenSectionUnlocked = v; },
        checkUnlockHands,
        tryUnlockTurboIfEligible,
        ensureSpeedRows,
        updateCheapenUpgradeUI,
        isSlowdownUnlocked,
        isTimeWarpUnlocked,
        addToLog
    });

    Object.assign(saveWireRef, n1Boot.wireSaveLoad({
        runtime: n1Rt,
        session,
        storage: typeof localStorage !== "undefined" ? localStorage : null,
        saveExtra: () => ({
            adaptiveLastProgressAtMs: logTickerRt.getAdaptiveLastProgressAtMs(),
            adaptiveLastHintAtMs: logTickerRt.getAdaptiveLastHintAtMs(),
            numberModulesState: collectNumberModulesSaveState(NUMBER_MODULES),
            ascensionTreeVersion: ASCENSION_TREE_VERSION,
            totalPlayTimeMs: number1LoopRuntime.getTotalPlayTimeMs()
        }),
        hydrateCtx: {
            maxHands,
            ascensionTreeVersionExpected: ASCENSION_TREE_VERSION,
            comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION,
            blackHoleMaxLevel: BLACK_HOLE_MAX_LEVEL,
            blackHoleEvaporationCap: BLACK_HOLE_EVAPORATION_CAP,
            comboDiscoveryCooldownBaseMs: COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS,
            comboDiscoveryCooldownMinMs: COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS,
            session,
            ascension,
            autobuy
        },
        loadTailCtx: {
            runtime: n1Rt,
            maxHands,
            handsBoot,
            loopRuntime: loopRuntimeRef,
            logTickerRt,
            numberModules: NUMBER_MODULES,
            tryTurboLevelerPurchases,
            reconcileNumber2LockState,
            updateNumber2SidebarUnlockUI,
            normalizeAscensionNodeIds,
            ascensionAutobuyDefaultOnForNewHands,
            syncAllAutobuyTogglesFromState,
            isNumber1AscensionTreeFullyPurchased,
            getBlackHolePhase,
            getTurboMeterMax,
            refreshTotalFromHandEarnings,
            syncBlackHolePhase1Vfx,
            updateN1GravityCpsStrip,
            checkStoryBanners: () => story.checkStoryBanners()
        },
        offline: {
            tickBackgroundNumberModules,
            updateBlackHolePhaseStep,
            getBlackHolePhase,
            getRawCpsPerHand,
            applyDetachedCpsProgress: applyNumber1DetachedCpsProgress,
            run,
            blackHole,
            formatCount,
            syncBlackHolePhase1Vfx,
            offlineSummaryBodyEl,
            offlineSummaryPanelEl
        }
    }));

    /* ---------------------------------------------------------
       HAND CLASS (loop runtime wired later via n1Boot.wireLoop)
    --------------------------------------------------------- */
    /* ---------------------------------------------------------
       HAND MANAGEMENT
       Hand 1: immediate. Hand 2: 1e9, 3: 1e12, 4: 1e15, 5: 1e18,
       6: 1e21, 7: 1e24, 8: 1e27, 9: 1e30, 10: 1e33
    --------------------------------------------------------- */
    applyHandSacrificeBody = createApplyHandSacrifice({
        maxHands,
        run,
        hands: handsRt.hands,
        setAutoBuyEnabledForHand,
        autoBuyCountdownSecondsByHand,
        timeWarpAuraActiveByHand: timewarp.timeWarpAuraActiveByHand,
        timeWarpAuraAppearedAtMsByHand: timewarp.timeWarpAuraAppearedAtMsByHand,
        shrinkSpeedRowsTo,
        ensureSpeedRows,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateComboUI: (...args) => comboForward.updateComboUI(...args),
        updateTurboBoostUI: (...args) => updateTurboBoostUI(...args)
    });
    const deleteSaveOverlayEl = document.getElementById("delete-save-overlay");
    const deleteSaveNoBtn = document.getElementById("delete-save-no");
    const deleteSaveYesBtn = document.getElementById("delete-save-yes");
    const settingsDeleteSaveBtn = document.getElementById("settings-delete-save");

    storyBanners = n1Boot.createStoryBanners({
        run,
        ascension,
        formatCount,
        isBlackHoleArcUnlocked,
        getBlackHolePhase
    });
    const storyBannerOverlayEl = document.getElementById("story-banner-overlay");
    const storyBannerTitleEl = document.getElementById("story-banner-title");
    const storyBannerBodyEl = document.getElementById("story-banner-body");
    const storyBannerCloseBtn = document.getElementById("story-banner-close");
    const storyReviewBtn = document.getElementById("story-review-btn");
    const storyReviewPanelEl = document.getElementById("story-review-panel");
    const storyReviewListEl = document.getElementById("story-review-list");
    const storyReviewCloseBtn = document.getElementById("story-review-close");

    const number1StoryBannerBoot = n1Boot.wireStory(createNumber1StoryWireDeps({
        story,
        storyBanners,
        storyBannerOverlayEl,
        storyBannerTitleEl,
        storyBannerBodyEl,
        storyBannerCloseBtn,
        storyReviewBtn,
        storyReviewPanelEl,
        storyReviewListEl,
        storyReviewCloseBtn,
        gameplaySimFrozen,
        getGamePaused: () => session.gamePaused,
        setGamePaused: v => { session.gamePaused = v; },
        getAscensionMapCollapsePending: () => ascension.ascensionMapCollapsePending,
        getNumber1BlackHoleState: () => blackHole.number1BlackHoleState,
        startAscensionMapCollapseTransition,
        refreshStoryArchiveSectionIfOpen
    }), storyBannerBridge);
    const {
        getStoryBannerById,
        hasUnlockedStoryBanner,
        checkStoryBanners,
        showStoryBanner
    } = number1StoryBannerBoot;
    Object.assign(storyBannerLookupRef, { getStoryBannerById, showStoryBanner });
    const { showDeleteSaveConfirmDialog } = n1Boot.wireShellDomListeners({
        session,
        menuBtn,
        settingsPanelEl,
        settingsCloseBtn,
        settingsDeleteSaveBtn,
        deleteSaveOverlayEl,
        deleteSaveNoBtn,
        deleteSaveYesBtn,
        settingsThemeDarkEl,
        settingsAdaptiveTipsEl,
        settingsCurtainEnabledEl,
        settingsHumorEnabledEl,
        settingsShowClapAnimationEl,
        settingsOfflineCapHoursEl,
        offlineSummaryCloseBtn,
        offlineSummaryPanelEl,
        pageButtons,
        pagePanelCloseBtn,
        pagePanelEl,
        pagePanelBodyEl,
        closeInlineMainStagePanels,
        syncInlinePanelsVsGameplay,
        applyTheme,
        persistSettings,
        addToLog,
        getAdaptiveTipMessage,
        logTickerRt,
        renderActionLog,
        refreshMessageLogPanelIfOpen,
        showPagePanel,
        syncMessageLogScrollContainerMode,
        teardownAscensionMapPanZoom,
        getStoryBannerById,
        hasUnlockedStoryBanner,
        showStoryBanner,
        comboForward,
        bindBlackHoleUpgradePreviewListeners,
        ascension,
        isNumber2Unlocked,
        renderAscensionPageHtml,
        syncPhase1MassFillCssVars,
        syncPhase1TesseractCanvasesInRoot,
        afterBlackHolePanelMounted,
        initAscensionMapPanZoom,
        number2,
        tryBuyAscensionNode,
        tryBuyNumber1BlackHole,
        tryBuyBlackHolePhase2CollapseUpgrade,
        tryBuyBlackHolePhase3DiskUpgrade,
        tryBuyBlackHolePhase6JetUpgrade,
        tryStartNumber1BlackHoleArc,
        triggerBlackHoleWaveManual,
        queueBlackHoleUiRefresh,
        sacrificeNextHandToFurnace,
        chooseBlackHoleFurnaceMutation,
        tryToggleJet,
        beginNumber1AscensionFlow,
        ascensionResolveNodeIdAtClient,
        setAscensionMapSelectedNode,
        respecNumber1AscensionFinger,
        respecNumber1AscensionSkillTrees,
        consumeAscendNumber1Button
    });

    /* ---------------------------------------------------------
       HAND COMBOS (poker-style: hand values 1–10, bonuses stack)
    --------------------------------------------------------- */
    combinationsBoot = n1Boot.wireCombinations(createNumber1CombinationsWireDeps({
        forward: comboForward,
        combo,
        run,
        ascension,
        turbo,
        getHands: () => handsRt.hands,
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
        ledgerBeamPlayBonus: (catalogBefore, catalogAfter, lbl) =>
            ledgerBeamPlayBonus(catalogBefore, catalogAfter, lbl),
        applyAscensionComboTimeWarpDelayReduction,
        addTurboBoostMeter,
        getTurboComboPoints,
        devTurboComboMeterGainDisabled
    }));
    const getHandValues = combinationsBoot.getHandValues;
    const getActiveCombos = combinationsBoot.getActiveCombos;
    const getComboParticipatingHandIndices = combinationsBoot.getComboParticipatingHandIndices;
    const computeComboUiInputDigest = combinationsBoot.computeComboUiInputDigest;
    const getCombosByMinHands = combinationsBoot.getCombosByMinHands;
    const computeEarnedCatalogComboTierProducts = combinationsBoot.computeEarnedCatalogComboTierProducts;
    const pulseCombinationsPageButtonForNewBonus = combinationsBoot.pulseCombinationsPageButtonForNewBonus;
    const showComboBubble = combinationsBoot.showComboBubble;

    /* Overview + ascension page panel refresh / live patch (implementation in n1-overview-ascension-panels). */
    Object.assign(overviewAscPanelDelegates, n1Boot.wireOverviewAscensionPanels({
        getPagePanelEl: () => pagePanelEl,
        getPagePanelBodyEl: () => pagePanelBodyEl,
        getAscensionPageActiveNumber: () => ascension.ascensionPageActiveNumber,
        renderGlobalOverview,
        renderAscensionPageHtml,
        renderNumber1AscendControlHtml,
        getNumber1AscendControlLivePatchDigest,
        teardownAscensionMapPanZoom,
        initAscensionMapPanZoom,
        patchBlackHolePhase1PanelLiveDom,
        patchBlackHolePhase2PanelLiveDom,
        patchAscensionHubStatsPillsDomIfChanged,
        syncPhase1MassFillCssVars,
        syncPhase1TesseractCanvasesInRoot,
        getBlackHolePhase,
        isBlackHoleArcUnlocked,
        refreshBlackHolePanelLiveDomIfOpen,
        afterBlackHolePanelMounted,
        updateAscensionMapDetailPanel: () => {
            if (typeof updateAscensionMapDetailPanel === "function") updateAscensionMapDetailPanel();
        },
        getUnlockedNumberModules,
        formatCount,
        computeNumber1AscensionGainBreakdown,
        getNumber1AscensionEssenceFormulaTotal,
        getNumber1AscensionRequiredHands,
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        number1HasAscended: () => ascension.number1HasAscended,
        getArcEssenceMultiplierBonusPhraseTitle,
        getNumber2State: () => number2State
    }));

    const { performNumber1Ascension } = n1Boot.wireAscensionPerform({
        isNumber1AscensionReady,
        clearActionLogBacklogOnAscension,
        getAscensionGainBreakdown: () => computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal()),
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle,
        addToLog,
        markMeaningfulProgress,
        autosaveNow,
        getAscension: () => ascension,
        getBlackHole: () => blackHole,
        updateNumber2SidebarUnlockUI,
        shrinkSpeedRowsTo,
        getHandsRt: () => handsRt,
        getRun: () => run,
        getMaxHands: () => maxHands,
        getAscensionHandUnlockStartingCountFloor,
        getUpgrades: () => upgrades,
        getTimewarp: () => timewarp,
        getAutobuy: () => autobuy,
        ascensionAutobuyDefaultOnForNewHands,
        getAutoBuyEnabledByHand: () => autoBuyEnabledByHand,
        getAutoBuyCountdownSecondsByHand: () => autoBuyCountdownSecondsByHand,
        setCheapenSectionUnlocked: v => { cheapenSectionUnlocked = v; },
        getCheapenAutoBuyCountdownByHand: () => cheapenAutoBuyCountdownByHand,
        getSlowdownAutoBuyCountdownByHand: () => slowdownAutoBuyCountdownByHand,
        getTurbo: () => turbo,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        turboBoostWrapEl,
        getCombo: () => combo,
        getObjectivesRt: () => objectivesRt,
        getComboForward: () => comboForward,
        getSpeedRowRefs: () => speedRowRefs,
        refreshTotalFromHandEarnings,
        upgradeContainer,
        incrementalEl,
        formatCount,
        ensureSpeedRows,
        applyAscensionAutobuyGrantToUnlockedHands,
        syncAllAutobuyTogglesFromState,
        updateObjectives,
        updateMilestoneUI,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        updateRateDisplay,
        updateTurboBoostUI,
        updatePageButtonUnlocks,
        refreshOverviewAndAscensionPanelsIfOpen
    });

    Object.assign(ascensionFlowRef, n1Boot.wireAscensionFlow({
        ascensionReadyCtaEl,
        getAscensionGainBreakdown: () => computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal()),
        getTotalChanges: () => run.totalChanges,
        getNumber1AscensionEssence: () => ascension.number1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle,
        isNumber1AscensionReady,
        setGamePaused: v => {
            session.gamePaused = v;
        },
        gameplaySimFrozen,
        hasSeenAscNumber1Intro: () => ascension.ascensionNumber1IntroSeen,
        markAscNumber1IntroSeen() {
            ascension.ascensionNumber1IntroSeen = true;
        },
        autosaveNow,
        performNumber1Ascension
    }));
    ascensionConfirmOverlayEl = ascensionFlowRef.ascensionConfirmOverlayEl;

    const ledgerBeamVfx = createLedgerBeamVfx({
        window,
        document,
        isSettingsPanelOpen,
        isPagePanelOpen,
        getCurrentNumberMode: () => typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1,
        getUnlockedHands: () => run.unlockedHands,
        getSpeedRowRefs: () => speedRowRefs,
        ascensionConfirmOverlayEl,
        pagePanelEl,
        ambientMessageTickerEl,
        actionLogEl,
        actionLogContainer,
        incrementalRateEl
    });
    function ledgerBeamPlayBonus(catalogBefore, catalogAfter, patternMultLabel) {
        ledgerBeamVfx.playBonus(catalogBefore, catalogAfter, patternMultLabel);
    }
    function snapshotHandLedgerBonusDisplays() {
        return ledgerBeamVfx.snapshotHandLedgerBonusDisplays();
    }
    function ledgerBeamAfterClapBonuses(beforeSnap) {
        ledgerBeamVfx.afterClapBonuses(beforeSnap);
    }

    const gameLoopWire = n1Boot.wireLoop(n1Boot.buildGameLoopWireDep({
        onTickApplyWired: step => {
            flushAutobuyDeferredTotalsIfAny = step.flushAutobuyDeferredTotalsIfAny;
            markAutobuyDeferredTotalsPending = step.markAutobuyDeferredTotalsPending;
        },
        getUnlockedHands: () => run.unlockedHands,
        getHands: () => handsRt.hands,
        computeAscensionGrantTotals,
        cheapenBonusLevel,
        slowdownBonusLevel,
        speedLevel: handsRt.speedLevel,
        speedBonusLevel: handsRt.speedBonusLevel,
        clapCooldownUntilMsByHand: handsRt.clapCooldownUntilMsByHand,
        clapDigitPrevious: handsRt.clapDigitPrevious,
        gameplaySimFrozen,
        addToLog,
        markMeaningfulProgress,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateRateDisplay,
        updateMilestoneUI,
        refreshOverviewAndAscensionHubLiveIfOpen,
        snapshotHandLedgerBonusDisplays,
        ledgerBeamAfterClapBonuses,
        settings: session.settings,
        isPagePanelOpen,
        pagePanelEl,
        getNumber1AscensionClapEssenceMultiplier,
        applyClapEssenceMultiplierProc(step) {
            ascension.number1AscensionClapEssenceMultiplier *= 1 + step;
            ascension.number1AscensionClapEssenceProcCount++;
        },
        getTotalChanges: () => run.totalChanges,
        getTurboBoostUnlocked: () => turbo.turboBoostUnlocked,
        getTurboBoostEnabled: () => turbo.turboBoostEnabled,
        getTurboBoostMeter: () => turbo.turboBoostMeter,
        incrementTurboActivationCount: earnTurboActivationsFromTick,
        updateTurboBurn,
        applyTurboPassiveMeterRegen,
        isTurboScensionUpgradeAutobuyUnlocked,
        tryTurboScensionActivationUpgrade,
        autosaveNow,
        updateTurboBoostUI,
        getHandEarnings: () => run.handEarnings,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl: () => incrementalEl,
        formatCount,
        updateObjectives: () => number1ObjectivesBoot.scheduleObjectiveDomFlush(),
        maybeShowFirstAscensionIntroOnUnlock: () => maybeShowFirstAscensionIntroOnUnlock(),
        tickBackgroundNumberModules,
        updateBlackHolePhaseStep,
        syncBlackHolePhase1Vfx,
        getCurrentNumberMode: () => typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1,
        shouldRunNumber2Foreground: mode => mode === 2 && isNumber2Unlocked() && number2State.started,
        runNumber2GameLoopStep: dtSec => number2.runGameLoopStep(dtSec),
        processComboDiscoveryMilestoneIfUnlocked: () => {
            if (run.unlockedHands >= 2) comboForward.tryProcessOneComboDiscoveryMilestone(Date.now());
        },
        getBlackHolePhase,
        runBlackHolePhase7Step: backgroundTab => {
            run.totalChanges = Math.floor(blackHole.number1BlackHoleState.phase7EpilogueCounter || 0);
            run.handEarnings[0] = run.totalChanges;
            if (run.totalChanges > run.number1RunPeakTotalCount) run.number1RunPeakTotalCount = run.totalChanges;
            if (!backgroundTab) {
                if (incrementalCountLabelEl) incrementalCountLabelEl.textContent = "Epilogue Count";
                if (incrementalEl) incrementalEl.textContent = formatCount(run.totalChanges);
                updateRateDisplay();
                updateMilestoneUI();
            }
        },
        updateTimeWarpSystem,
        getTickIntervalMs,
        getHandSpeedSyncBucketKey,
        getEffectiveSpeedLevel,
        getSpeedMultiplierBigForLevel,
        updateComboStep: backgroundTab => {
            if (backgroundTab) {
                if (run.unlockedHands >= 2) comboForward.tryProcessOneComboDiscoveryMilestone(Date.now());
            } else {
                comboForward.updateComboUI();
            }
        },
        getComboMultiplier: comboForward.getComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        getSlowdownMultiplier,
        runAutobuyStep: () => {
            maybeAutoBuySpeedUpgrade();
            maybeAutoBuyCheapen();
            maybeAutoBuySlowdown();
        },
        getBatchedUpgradeUiFlush: () => batchedUpgradeUiFlush,
        setBatchedUpgradeUiFlush: v => { batchedUpgradeUiFlush = v; },
        updateTimeWarpAuraUI,
        isGameplayFrozen: () => gameplaySimFrozen(),
        isDocumentHidden: () => typeof document !== "undefined" && document.hidden,
        shouldRunHiddenFixedStep: () => {
            const mode = typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1;
            return mode === 2 && isNumber2Unlocked() && number2State.started;
        },
        applyOfflineProgress: (offlineMs, opts) => applyOfflineProgress(offlineMs, opts),
        patchOverviewIfNeeded: (nowOverview, ctx) => {
            if (
                typeof document !== "undefined" &&
                !document.hidden &&
                nowOverview - ctx.lastOverviewUpdateMs >= ctx.overviewPatchMs &&
                pagePanelEl &&
                pagePanelEl.style.display !== "none" &&
                pagePanelBodyEl
            ) {
                ctx.lastOverviewUpdateMs = nowOverview;
                const openPageId = pagePanelEl.dataset.openPageId || "";
                if (openPageId === "overview") patchGlobalOverviewLiveDom();
                else if (openPageId === "ascension") patchAscensionPanelLiveDom();
            }
        }
    }));
    number1LoopRuntime = gameLoopWire.number1LoopRuntime;
    Object.assign(loopRuntimeRef, number1LoopRuntime);

    n1Boot.startGameLoop(number1LoopRuntime);
    gameLoopWire.attachVisibilityOfflineTracking();

    logTickerRt.startPeriodicAmbientAndAdaptive({
        shouldSkipAmbientRandomTicker: gameplaySimFrozen
    });

    n1Boot.finishShellBoot({
        upgradeDom,
        onWindowScrollResizeForUpgrades,
        addToLog,
        buySpeedUpgradeForHand,
        buyCheapenUpgradeForHand,
        buySlowdownUpgradeForHand,
        activateTimeWarpAuraForHand,
        ensureTimeWarpArrays,
        isTimeWarpUnlocked,
        timewarp,
        playTimeWarpScreenEffect,
        initTopCountRowFitObservers,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        updateRateDisplay,
        updateMilestoneUI,
        comboForward,
        updatePageButtonUnlocks,
        updateNumber2SidebarUnlockUI,
        initInlineRightPanels,
        initNumber1StageAccretionDiskBg,
        loadSettings,
        applyTheme,
        applySettingsToUI,
        storage: typeof localStorage !== "undefined" ? localStorage : null,
        applyLoadedState,
        applyOfflineProgress,
        syncPlayStageForNumberMode,
        number2
    });

    n1Boot.wireDevTools(n1Boot.buildDevToolsWireDep({
        devToolsLoadTimeMs,
        displayTotalPlaySeconds: () => number1LoopRuntime.getDisplayTotalPlayTimeMs(),
        getBlackHolePhase,
        freeze: {
            get: () => session.devFreezeGame,
            set: v => {
                session.devFreezeGame = v;
            }
        },
        getDevHandsRuntime: () => ({
            maxHands,
            setUnlockedCapAndHands(n) {
                run.unlockedHandsCap = n;
                run.unlockedHands = n;
            },
            setHandEarning(i, v) {
                run.handEarnings[i] = v;
            },
            getHandEarning(i) {
                return run.handEarnings[i] || 0;
            },
            clearHandSideForDev(i) {
                run.handEarnings[i] = 0;
                setAutoBuyEnabledForHand(i, false);
                autoBuyCountdownSecondsByHand[i] = 0;
                timewarp.timeWarpAuraActiveByHand[i] = false;
                timewarp.timeWarpAuraAppearedAtMsByHand[i] = 0;
            },
            hands: handsRt.hands,
            speedRowRefs
        }),
        getAscensionMapNodes: () => ASCENSION_MAP_NODES,
        ascending: {
            setHasAscended: v => {
                ascension.number1HasAscended = v;
            },
            setAscensionNodeIds: ids => {
                ascension.number1AscensionNodeIds = ids;
            },
            clampEssenceForDevUnlock: () => {
                if (ascension.number1AscensionEssence < 5000) ascension.number1AscensionEssence = 5000;
            },
            getBlackHoleMutableState: () => blackHole.number1BlackHoleState
        },
        setTotalChanges: v => {
            run.totalChanges = v;
        },
        refreshAfterBhDevJumpAndSelectUpdated: () => {
            refreshTotalFromHandEarnings();
            syncBlackHolePhase1Vfx();
            updateN1GravityCpsStrip();
            updateObjectives();
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateTimeWarpAuraUI();
            updateTurboBoostUI({ force: true });
            updateRateDisplay();
            updateMilestoneUI();
            comboForward.updateEarnedBonusesUI();
            updatePageButtonUnlocks();
            refreshOverviewAndAscensionPanelsIfOpen();
        },
        maybeApplyMidPhaseHandFloor: applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
        ensureSpeedRows,
        shrinkSpeedRowsTo,
        syncAllAutobuyTogglesFromState,
        setAutoBuyEnabledForHand,
        autoBuyDelayStandardSeconds: () => AUTO_BUY_DELAY_SECONDS,
        autoBuyDelayOverrideSeconds: {
            get: () => devAutoBuyDelaySeconds,
            set: v => {
                devAutoBuyDelaySeconds = v;
            }
        },
        setAutoBuyUnlockedDev: v => {
            autobuy.autoBuyUnlocked = v;
        },
        unlockedHandsGetter: () => run.unlockedHands,
        autoBuyEnabledByHandMutable: autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHandMutable: autoBuyCountdownSecondsByHand,
        cheapenAutobuyFlag: {
            get: () => devCheapenAutobuyOn,
            set: v => {
                devCheapenAutobuyOn = v;
            }
        },
        slowdownAutobuyFlag: {
            get: () => devSlowdownAutobuyOn,
            set: v => {
                devSlowdownAutobuyOn = v;
            }
        },
        turboComboMeterGainDisabledFlag: {
            get: () => devTurboComboMeterGainDisabled,
            set: v => {
                devTurboComboMeterGainDisabled = v;
            }
        },
        cheapenAutoBuyCountdownByHand,
        slowdownAutoBuyCountdownByHand,
        getCheapenLevel: () => cheapenLevel,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        getHandEarning: i => run.handEarnings[i] || 0,
        getSlowdownLevel: () => slowdownLevel,
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        isSlowdownUnlocked,
        updateSpeedUpgradeUI,
        onDeleteSaveClick: showDeleteSaveConfirmDialog,
        bumpHand0EarningsDev: val => {
            if (val <= 0) return;
            run.handEarnings[0] = (run.handEarnings[0] || 0) + val;
            refreshTotalFromHandEarnings();
            if (incrementalEl) incrementalEl.textContent = formatCount(run.totalChanges);
            updateObjectives();
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        },
        addAscensionEssenceDev: val => {
            if (val <= 0) return;
            const add = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(val));
            ascension.number1AscensionEssence = Math.min(Number.MAX_SAFE_INTEGER, ascension.number1AscensionEssence + add);
            markMeaningfulProgress();
            updateMilestoneUI();
            patchAscensionPanelLiveDom();
            refreshGlobalOverviewPanelIfOpen();
            autosaveNow();
        },
        addToLog,
        autosaveNow
    }));

    n1Boot.finishBootRefresh(n1Boot.buildBootFinishRefreshers({
        updateObjectives,
        updateMilestoneUI,
        updateTurboBoostUI,
        updateRateDisplay,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        updateEarnedBonusesUI: comboForward.updateEarnedBonusesUI,
        updatePageButtonUnlocks,
        updateNumber2SidebarUnlockUI,
        maybeShowFirstAscensionIntroOnUnlock,
        syncPhase1MassFillCssVars,
        syncPhase1TesseractCanvasesInRoot
    }));

    /* ---------------------------------------------------------
       Hand milestones: checkUnlockHands() via syncUnlocksWithTotalCount → refreshTotalFromHandEarnings()
    --------------------------------------------------------- */

    return {
        autosaveNow,
        getSaveState,
        getUnlockedNumberModules,
        tickBackgroundNumberModules,
        NUMBER_MODULES,
        unlockedNumbers
    };
}
