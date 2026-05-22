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
    BLACK_HOLE_SCREEN_FX_MS,
    createNumber1BlackHoleState,
    createNumber1BlackHoleUxFlags,
    getBlackHolePhase2ErgosphereTurboPassivePerSec,
    getBlackHolePhase2PhotonComboPersistMinHands
} from "./number1-black-hole.js";
import { createNumber1BlackHoleBoot } from "./n1-black-hole-boot.js";
import {
    createNumber1AscensionPerform,
    consumeAscendNumber1Button,
    createNumber1AscensionFlowUi,
    renderAscensionPageShellHtml,
    isNumber1AscensionReadyFromState,
    ASCENSION_1_MIN_HANDS,
    ASCENSION_1_REQUIRED_TOTAL,
    computeNumber1AscensionBaseGain as computeNumber1AscensionBaseGainFromRules,
    computeNumber1AscensionGainBreakdown as computeNumber1AscensionGainBreakdownFromRules,
    computeNumber1AscensionGain as computeNumber1AscensionGainFromRules,
    getNumber1AscensionRequiredHands as getNumber1AscensionRequiredHandsFromPhase,
    getNumber1AscensionPendingBonusEssence as getNumber1AscensionPendingBonusEssenceFromValue,
    getNumber1AscensionClapEssenceMultiplier as getNumber1AscensionClapEssenceMultiplierFromValue
} from "./modules/number1/ascension.js";
import {
    NUMBER2_ASCENSION_READY_TOTAL,
    createNumber2ModuleDefinition
} from "./modules/number2/game.js";
import { createN2BootWiring } from "./n2-boot-wiring.js";
import {
    HAND_BASE_SPEED,
    UNLOCK_THRESHOLDS,
    shouldUnlockNextHand,
    storyTotalCountLead as getStoryTotalCountLead,
    hands1,
    HandCounter
} from "./modules/number1/hands.js";
import {
    formatCompactMultiplier,
    formatCount,
    formatSignedCountGain,
    formatSeconds,
    formatTurboBoostMultiplierForDisplay,
    formatTurboScensionLevelDisplay,
    formatWithCommas
} from "./modules/number1/format.js";
import {
    buildBlackHolePhase2TrackEffectHtml,
    formatBlackHolePhase1EffectLines,
    getBlackHolePhase1PourPreview
} from "./modules/number1/black-hole-effect-copy.js";
import {
    buildAscensionRunTimeBannerHtml,
    getNumber1AscensionRunDurationSec,
    getNumber1AscensionRunTimeMultPct
} from "./modules/number1/ascension-run-time.js";
import { accumulateNumber1DetachedCps } from "./modules/number1/detached-cps-progress.js";
import { clearNumber1SaveAndReload } from "./modules/number1/number1-clear-save-and-reload.js";
import { createLogTickerRuntime } from "./modules/number1/log.js";
import { createShellPanelsUi } from "./modules/number1/shell-panels.js";
import {
    AUTOSAVE_INTERVAL_MS,
    COMBO_ACTIVATION_EDGE_SAVE_VERSION,
    readSaveData,
    GAME_LOOP_MS,
    GAME_LOOP_MAX_ELAPSED_MS,
    GAME_LOOP_MAX_LAG_MS,
    GAME_LOOP_MAX_CATCHUP_STEPS,
    GAME_LOOP_HIDDEN_MAX_CATCHUP_STEPS,
    clampGameLoopElapsedMs,
    getGameLoopCatchupStepCap,
    alignSameSpeedHandPhases,
    createNumber1LoopRuntime,
    createNumber1TickApplyStep,
    calculateDetachedCpsProgress,
    createNumber1TurboGameLoopStep,
    createNumber1TurboBoot,
    TURBO_LEVELER_LINE_TOOLTIP,
    TURBO_SCENSION_AXIS_TITLES,
    TURBO_UNLOCK_COUNT,
    getTurboBoostMultiplierFromState as getTurboBoostMultiplierFromTurboState,
    getTurboBurnDrainForStep,
    getTurboComboPointsForMinHands,
    getTurboCountMultiplierMaxFromState,
    getTurboLevelerNextPointCost as getTurboLevelerNextPointCostForPurchases,
    getTurboMeterMaxFromState,
    getTurboNominalBurnPerSecFromState,
    getTurboScensionActivationCostFromTotals,
    getTurboScensionFillMult as getTurboScensionFillMultForLevel,
    getTurboScensionUpgradeRollCountFromTotals,
    turboMeterCurveScaleFromTotals as turboMeterCurveScaleFromTotalsRule
} from "./modules/number1/core.js";
import {
    formatUpgradeAffordEtaDuration,
    createUpgradeEtaSmoother,
    createUpgradeUiController,
    BASE_MAX_CHEAPEN_LEVEL,
    DEV_CHEAPEN_AUTOBUY_DELAY,
    DEV_SLOWDOWN_AUTOBUY_DELAY,
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
} from "./modules/number1/upgrades.js";
import { createTopCountRowFit } from "./modules/number1/top-count-row-fit.js";
import { renderNumber1GlobalOverviewHtml } from "./modules/number1/global-overview-render.js";
import { createOverviewAscensionPanelsRefresh } from "./modules/number1/overview-ascension-panels.js";
import { createNumber1ClapTick } from "./modules/number1/clap.js";
import { computeNumber1AdaptiveTipMessage } from "./modules/number1/adaptive-tip-message.js";
import {
    TIME_WARP_UNLOCK_COUNT,
    TIME_WARP_MANUAL_CLICK_SCALE,
    getTimeWarpAuraSpawnSpanMaxSecFromTotals,
    getTimeWarpOverflowRatioFromTotals,
    getTimeWarpProductionSecondsBonusFromTotals
} from "./modules/number1/time-warp.js";
import {
    clampFiniteNonNegative,
    formatCpsForDisplay,
    createNumber1RateTickBoot,
    createRateDisplayUi,
    CPS_HEADLINE_THROTTLE_MS
} from "./modules/number1/rate.js";
import {
    escapeHtml,
    renderStoryArchiveHtml as renderStoryArchiveHtmlForState,
    createNumber1StoryBannerBoot
} from "./modules/number1/story.js";
import { createConfettiSprayer } from "./modules/number1/vfx.js";
import { createLedgerBeamVfx } from "./modules/number1/ledger-beam.js";
import { attachN1DevTools } from "./modules/number1/dev-tools.js";
import { COMBOS, createComboHandStatusUi } from "./modules/number1/combo.js";
import { updateComboDiscoveryMilestonePanelIfOpen } from "./modules/number1/combo-discovery.js";
import { createNumber1ComboBoot } from "./n1-combo-boot.js";
import { createNumber1ObjectivesBoot, getObjectiveProgressForTotal, renderObjectiveForTotal, isObjectiveCompleteForTotal } from "./modules/number1/objectives.js";
import { syncPhase1TesseractCanvasesInRoot } from "./modules/number1/tesseract-canvas.js";
import {
    createN1AscensionGrants,
    createN1AscensionTreeRuntime,
    resolveAutobuyLanesAfterAscensionReset
} from "./n1-ascension.js";
import {
    createN1AscensionBootUi,
    ASCENSION_FINGER_RESPEC_LABELS,
    createN1AscensionMapDomDelegates,
    renderAccretionDiskHeroInnerHtml,
    initNumber1StageAccretionDiskBg
} from "./n1-ascension-pages.js";
import {
    applyNumber1OfflineAdvance,
    applyNumber1SnapToRuntime,
    buildNumber1NormalizeSnapshotOptions,
    buildNumber1SavePayload,
    createN1SaveOffline
} from "./n1-save-offline.js";
import { createNumber1GameLoopAssembly } from "./n1-game-loop-wire.js";
import { createN1UpgradeScrollHint } from "./n1-upgrade-scroll-hint.js";
import { wireNumber1SlowdownCheapenSpeedAndTimeWarpBoots } from "./n1-upgrades-rate-turbo-boot.js";

/**
 * legacy-boot.js — primary game boot: Number 1 simulation, save/load, UI wiring, ascension, black hole, Number 2 glue.
 * Pure mechanics live under `src/game/modules/number1/` (see core.js); this file owns DOM, init order, and cross-feature wiring.
 *
 * PILLARS (grep anchors):
 *   - Core counting: `GLOBAL STATE`, `refreshTotalFromHandEarnings`, `assembleNumber1GameLoopStepDeps`
 *   - Ascension (rules + tree + map + grants): `getNumber1AscensionPendingBonusEssence`, `createN1AscensionTreeRuntime`, `computeAscensionGrantTotals`
 *   - Black hole: `createNumber1BlackHoleBoot`, `updateBlackHolePhaseStep`
 *   - Number 2 (mode-gated; no cross-number bonuses): `createNumber2State`, `NUMBER_MODULES` key `2`
 *
 * REGION MAP — search for these banner titles (no line numbers):
 *   Bootstrap constants | Core N1 state | Settings | Objectives | Log ticker
 *   Hand loop runtime | Save / load / offline | Hand management | Story banners
 *   Speed upgrades | Cheapen / compaction / time warp / rate | Turbo | Combos & clap
 *   Ascension & pages | Black hole | Number 2 | Game loop assembly | Boot sequence
 *
 * Ordering: `const objectives` / factories that close over `let` state must stay below that state;
 * upgrade stubs stay adjacent to `createNumber1*Boot` then reassignment.
 */
    /** Page-load epoch ms for dev tools fallback when `performance.now` is unavailable. */
    const devToolsLoadTimeMs = Date.now();

    /** Stoke won't compress digestion below ~this much remaining time (~8s, within typical 5–10s UX buffer). */
    const BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS = 8000;

/* ---------------------------------------------------------
       GLOBAL STATE (Core N1 simulation + meta — see REGION MAP in file header)
    --------------------------------------------------------- */
    const maxHands = 10;
    let totalChanges = 1;
    /** Max total count (sum of hand earnings) reached this Number 1 run; used only for Ascension Essence formula input. Resets on ascend. */
    let number1RunPeakTotalCount = 1;
    /** Wall-clock start of the current Number 1 run (resets on ascend). Drives run-time Essence multiplier. */
    let number1RunStartedAtMs = Date.now();
    let handEarnings = Array(maxHands).fill(0);
    handEarnings[0] = 1;
    let unlockedHands = 1;
    /** Persistent prestige currency for Number 1 (run stats reset on ascend). */
    let number1AscensionEssence = 0;
    /** Bonus essence banked this run from Warp pinky grants; added to next ascend payout, then reset. */
    let number1AscensionPendingBonusEssence = 0;
    /** Thumb clap route: run-local multiplier built from clap procs; applies to ascend payout, then resets. */
    let number1AscensionClapEssenceMultiplier = 1;
    /** Count of successful essence-multiplier clap procs this run (for messaging/debug). */
    let number1AscensionClapEssenceProcCount = 0;
    let number1HasAscended = false;
    /** Purchased skill-tree node ids (Tempo / Overdrive chains — see PRD MVP). */
    let number1AscensionNodeIds = [];
    /** Legacy save field; mapped into black-hole phase state on load. */
    let number1AscensionBlackHoleLevel = 0;
    /** Phase-driven black-hole progression state (BLACK_HOLE_PLAN.md). */
    let number1BlackHoleState = createNumber1BlackHoleState();
    /** Non-persistent one-shot UX notices for BH state changes. */
    let number1BlackHoleUxFlags = createNumber1BlackHoleUxFlags();
    const ASCENSION_MAP_COLLAPSE_DURATION_MS = 3100;
    let ascensionMapCollapseActiveUntilMs = 0;
    let ascensionMapCollapseTimerId = 0;
    let ascensionMapCollapsePending = false;
    /** Hard cap to enforce irreversible furnace sacrifices. */
    let unlockedHandsCap = maxHands;
    /** If false, first ascend shows the teaching overlay (PRD: first completion only). */
    let ascensionNumber1IntroSeen = false;
    /** Selected number tab on the Ascension page (1 = skill map). Preserved for the session. */
    let ascensionPageActiveNumber = 1;
    /** Ring Turbo-scension: per-run upgrade levels (reset on ascend). Each level doubles that axis (burn rate, meter cap, mult cap, or meter fill from combos + passive sustain). */
    let turboScensionBurnLevel = 0;
    let turboScensionTankLevel = 0;
    let turboScensionMultLevel = 0;
    let turboScensionFillLevel = 0;
    let number1TimeWarpBoot = null;
    function isTimeWarpUnlocked() {
        return number1TimeWarpBoot ? number1TimeWarpBoot.isTimeWarpUnlocked() : totalChanges >= TIME_WARP_UNLOCK_COUNT;
    }
    /** When no time-warp boot yet, production bonus reads ascension grant totals (counting ↔ ascension grant coupling). */
    function getTimeWarpProductionSecondsBonus() {
        if (number1TimeWarpBoot) return number1TimeWarpBoot.getTimeWarpProductionSecondsBonus();
        return getTimeWarpProductionSecondsBonusFromTotals(computeAscensionGrantTotals());
    }

    /** Set when `totalChanges` first reaches Compaction unlock; stays true if total dips (per-hand spend) until Number 1 ascension. */
    let slowdownCompactionUnlockedLatched = false;

    /* ---------------------------------------------------------
       Core counting — total from hands, milestone sync (main loop below)
    --------------------------------------------------------- */
    function refreshTotalFromHandEarnings() {
        let s = 0;
        for (let i = 0; i < unlockedHands; i++) s += handEarnings[i] || 0;
        totalChanges = Math.min(BLACK_HOLE_EVAPORATION_CAP, s);
        if (totalChanges > number1RunPeakTotalCount) number1RunPeakTotalCount = totalChanges;
        if (totalChanges >= 1e15) slowdownCompactionUnlockedLatched = true;
        syncUnlocksWithTotalCount();
    }
    function getNumber1AscensionEssenceFormulaTotal() {
        return Math.max(1, number1RunPeakTotalCount);
    }

    const incrementalEl = document.getElementById("incremental-count");
    const incrementalCountLabelEl = document.getElementById("incremental-count-label");
    const incrementalRateEl = document.getElementById("incremental-rate");
    /** Autobuy / warp-assist may stack many purchases; defer refresh to once per batch. Wired in {@link createNumber1TickApplyStep}. */
    let flushAutobuyDeferredTotalsIfAny = () => {};
    let markAutobuyDeferredTotalsPending = () => {};

    const n1GravityCpsStripEl = document.getElementById("n1-gravity-cps-strip");
    const bonusMultiplierEl = document.getElementById("bonus-multiplier-display");
    const turboMultiplierDisplayEl = document.getElementById("turbo-multiplier-display");
    const turboRightClusterEl = document.getElementById("turbo-right-cluster");
    const turboBoostWrapEl = document.getElementById("turbo-boost-wrap");
    const turboScensionPanelEl = document.getElementById("turbo-scension-panel");
    const turboScensionUpgradeBtn = document.getElementById("turbo-scension-upgrade-btn");
    const turboScensionBurnLineEl = document.getElementById("turbo-scension-burn-line");
    const turboScensionTankLineEl = document.getElementById("turbo-scension-tank-line");
    const turboScensionMultLineEl = document.getElementById("turbo-scension-mult-line");
    const turboScensionFillLineEl = document.getElementById("turbo-scension-fill-line");
    const turboScensionLevelerLineEl = document.getElementById("turbo-scension-leveler-line");
    const turboBoostFillEl = document.getElementById("turbo-boost-fill");
    const turboBoostGaugeEl = document.getElementById("turbo-boost-gauge");
    const turboBoostMultiplierEl = document.getElementById("turbo-boost-multiplier");
    const turboBoostActivationsEl = document.getElementById("turbo-boost-activations");
    const turboBoostEnabledCheckbox = document.getElementById("turbo-boost-enabled");
    const turboBoostToggleLabelEl = document.querySelector(".turbo-boost-toggle-label");
    const handsContainer = document.getElementById("hands-container");
    const objectiveList = document.getElementById("objective-list");
    const longObjectiveList = document.getElementById("long-objective-list");
    const milestoneTitleEl = document.getElementById("milestone-title");
    const milestoneTextEl = document.getElementById("milestone-text");
    const milestoneEssenceLineEl = document.getElementById("milestone-essence-line");
    const milestoneProgressFillEl = document.getElementById("milestone-progress-fill");
    const playStageEl = document.getElementById("play-stage");
    const number1StageRootEl = document.getElementById("number1-stage-root");
    const ascensionReadyBannerEl = document.getElementById("ascension-ready-banner");
    const ascensionReadyBannerEssenceSuffixEl = document.getElementById("ascension-ready-banner-essence-suffix");
    const ascensionReadyCtaEl = document.getElementById("ascension-ready-cta");
    const ascensionPageBtn = document.querySelector(".page-btn[data-page=\"ascension\"]");
    const menuBtn = document.getElementById("menu-btn");
    const settingsPanelEl = document.getElementById("settings-panel");
    const settingsCloseBtn = document.getElementById("settings-close");
    const settingsThemeDarkEl = document.getElementById("settings-theme-dark");
    const settingsAdaptiveTipsEl = document.getElementById("settings-adaptive-tips");
    const settingsCurtainEnabledEl = document.getElementById("settings-curtain-enabled");
    const settingsHumorEnabledEl = document.getElementById("settings-humor-enabled");
    const settingsShowClapAnimationEl = document.getElementById("settings-show-clap-animation");
    const settingsOfflineCapHoursEl = document.getElementById("settings-offline-cap-hours");
    const offlineSummaryPanelEl = document.getElementById("offline-summary-panel");
    const offlineSummaryBodyEl = document.getElementById("offline-summary-body");
    const offlineSummaryCloseBtn = document.getElementById("offline-summary-close");
    const pagePanelEl = document.getElementById("page-panel");
    const pagePanelTitleEl = document.getElementById("page-panel-title");
    const pagePanelBodyEl = document.getElementById("page-panel-body");
    const pagePanelCloseBtn = document.getElementById("page-panel-close");
    const pageModalEl = document.getElementById("page-modal");
    const pageButtons = Array.from(document.querySelectorAll(".page-btn"));
    const combinationsPageBtn = document.querySelector(".page-btn[data-page=\"combinations\"]");
    const ambientMessageTickerEl = document.getElementById("ambient-message-ticker");
    const actionLogEl = document.getElementById("action-log-lines");
    const actionLogToggle = document.getElementById("action-log-toggle");
    const actionLogContainer = document.getElementById("action-log");

    /** Assigned after {@link createN1AscensionMapDomDelegates}; shell panels close hook runs earlier in boot. */
    let teardownAscensionMapPanZoom = () => {};

    const shellPanels = createShellPanelsUi({
        pagePanelEl,
        settingsPanelEl,
        playStageEl,
        pageModalEl,
        getUpgradeContainer: () => document.getElementById("upgrade-container"),
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

    const SETTINGS_KEY = "naf.settings.v1";
    /** When true, autosave is skipped (e.g. right before deleting save + reload). */
    let suppressAutosave = false;
    const DEFAULT_SETTINGS = { theme: "light", adaptiveTipsEnabled: true, curtainEnabled: true, humorEnabled: true, showClapAnimation: true, offlineCapHours: 8 };
    let settings = { ...DEFAULT_SETTINGS };
    const unlockedNumbers = new Set([1, 2]);
    function isNumber2Unlocked() {
        return unlockedNumbers.has(2);
    }
    function getAdaptiveTipMessage() {
        return computeNumber1AdaptiveTipMessage({
            totalChanges,
            unlockedHands,
            turboBoostUnlocked,
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
        getSettings: () => settings,
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
    const overviewAscPanelDelegates = {
        refreshGlobalOverviewPanelIfOpen() {},
        patchNumber1AscendControlIfOpen() {},
        refreshAscensionPanelIfOpen() {},
        refreshOverviewAndAscensionPanelsIfOpen() {},
        refreshOverviewAndAscensionHubLiveIfOpen() {},
        patchGlobalOverviewLiveDom() {},
        patchAscensionPanelLiveDom() {}
    };
    function refreshGlobalOverviewPanelIfOpen() {
        overviewAscPanelDelegates.refreshGlobalOverviewPanelIfOpen();
    }
    function patchNumber1AscendControlIfOpen() {
        overviewAscPanelDelegates.patchNumber1AscendControlIfOpen();
    }
    function refreshAscensionPanelIfOpen() {
        overviewAscPanelDelegates.refreshAscensionPanelIfOpen();
    }
    function refreshOverviewAndAscensionPanelsIfOpen() {
        overviewAscPanelDelegates.refreshOverviewAndAscensionPanelsIfOpen();
    }
    function refreshOverviewAndAscensionHubLiveIfOpen() {
        overviewAscPanelDelegates.refreshOverviewAndAscensionHubLiveIfOpen();
    }
    function patchGlobalOverviewLiveDom() {
        overviewAscPanelDelegates.patchGlobalOverviewLiveDom();
    }
    function patchAscensionPanelLiveDom() {
        overviewAscPanelDelegates.patchAscensionPanelLiveDom();
    }
    /* ---------------------------------------------------------
       Number 2 — Double or Nothing (mode-gated; isolated economy; save slice via NUMBER_MODULES)
    --------------------------------------------------------- */
    const { number2State, number2 } = createN2BootWiring({
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
    function reconcileNumber2LockState() {
        number2.reconcileLockState();
    }
    function updateNumber2SidebarUnlockUI() {
        const btn = document.querySelector(".nav-btn[data-mode=\"2\"]");
        if (btn) {
            if (isNumber2Unlocked()) {
                btn.classList.remove("nav-btn--soon");
                btn.setAttribute("aria-label", "Number 2");
                btn.removeAttribute("title");
            } else {
                btn.classList.add("nav-btn--soon");
                btn.setAttribute("aria-label", "Number 2 (coming soon)");
                btn.setAttribute("title", "Coming soon");
            }
        }
        updatePageButtonUnlocks();
    }
    function syncPlayStageForNumberMode(mode) {
        const n1 = document.getElementById("number1-stage-root");
        const n2 = document.getElementById("number2-stage");
        if (!n1 || !n2) return;
        if (mode === 2 && isNumber2Unlocked()) {
            n1.style.display = "none";
            n2.style.display = "flex";
            n2.setAttribute("aria-hidden", "false");
            number2.updateStageUI();
        } else {
            n1.style.display = "";
            n2.style.display = "none";
            n2.setAttribute("aria-hidden", "true");
            syncBlackHolePhase1Vfx();
            updateN1GravityCpsStrip();
        }
    }
    /**
     * Number 1 CPS gain while the stage is not ticking every hand (focused on Number 2, or large offline windows).
     * Same stack as {@link applyOfflineProgress}: raw CPS × pattern catalog × middle-finger ascension pattern mult × turbo × offline-averaged black-hole mult
     * (Hawking/wave boosts time-averaged, not the live burst mult from {@link getNumber1BlackHoleProductionMult}).
     * Phase 7 epilogue: no hand CPS accrual — the epilogue counter advances only in the black-hole phase step.
     * @returns {number} Count integrated for this slice (after rounding)
     */
    function applyNumber1DetachedCpsProgress(dtSec) {
        return accumulateNumber1DetachedCps(dtSec, {
            getBlackHolePhase,
            getUnlockedHands: () => unlockedHands,
            getRawCpsPerHand,
            getComboMultiplier,
            getTurboMultiplier: getTurboCountMultiplier,
            getBlackHoleOfflineProductionMult,
            mergeHandEarningsFromDetachedSlice(gainsByHand) {
                for (let i = 0; i < unlockedHands; i++) {
                    handEarnings[i] = (handEarnings[i] || 0) + (gainsByHand[i] || 0);
                }
            },
            refreshTotalsFromHands: refreshTotalFromHandEarnings,
        });
    }
    function tickNumber1BackgroundCps(dtSec) {
        applyNumber1DetachedCpsProgress(dtSec);
        if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
    }
    window.onBeforeNumberModeSwitch = function() {
        closeInlineMainStagePanels();
    };
    window.onNumberModeSwitched = function(mode) {
        syncPlayStageForNumberMode(mode);
        number2.handleModeSwitched(mode);
        if (mode === 1) {
            scheduleFitTopCountRow();
            updateRateDisplay();
        }
    };

    function getPreferredThemeFromSystem() {
        try {
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch (_) {
            return DEFAULT_SETTINGS.theme;
        }
    }
    function applyTheme() {
        const theme = settings.theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        scheduleFitTopCountRow();
    }
    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) {
                settings = { ...DEFAULT_SETTINGS, theme: getPreferredThemeFromSystem() };
                return;
            }
            const parsed = JSON.parse(raw);
            settings = {
                theme: parsed.theme === "dark" ? "dark" : "light",
                adaptiveTipsEnabled: parsed.adaptiveTipsEnabled !== false,
                curtainEnabled: parsed.curtainEnabled !== false,
                humorEnabled: parsed.humorEnabled !== false,
                showClapAnimation: parsed.showClapAnimation !== false,
                offlineCapHours: Number.isFinite(parsed.offlineCapHours) && parsed.offlineCapHours >= 0 ? parsed.offlineCapHours : DEFAULT_SETTINGS.offlineCapHours
            };
        } catch (_) {}
    }
    function persistSettings() {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
    }
    function applySettingsToUI() {
        if (settingsThemeDarkEl) settingsThemeDarkEl.checked = settings.theme === "dark";
        if (settingsAdaptiveTipsEl) settingsAdaptiveTipsEl.checked = settings.adaptiveTipsEnabled !== false;
        if (settingsCurtainEnabledEl) settingsCurtainEnabledEl.checked = !!settings.curtainEnabled;
        if (settingsHumorEnabledEl) settingsHumorEnabledEl.checked = !!settings.humorEnabled;
        if (settingsShowClapAnimationEl) settingsShowClapAnimationEl.checked = settings.showClapAnimation !== false;
        if (settingsOfflineCapHoursEl) settingsOfflineCapHoursEl.value = String(settings.offlineCapHours);
    }

    /* ---------------------------------------------------------
       OBJECTIVES (short term: 10, 100, 1000; long term: 1e9, ...)
       Once achieved, stays complete even if count drops later.
    --------------------------------------------------------- */
    const objectives = [
        { goal: 10, text: "Unlock speed increase", achieved: false },
        { goal: 100, text: "Unlocks speed increase auto buyer", achieved: false },
        { goal: 1000, text: "Unlock speed increase Cheapen", achieved: false },
        { goal: 10000, text: "Hand 1 cheapen level 2", achieved: false },
        { goal: 100000, text: "Hand 1 cheapen level 3", achieved: false },
        { goal: 1e6, text: "Hand 1 cheapen level 4", achieved: false },
        { goal: 1e7, text: "Hand 1 cheapen level 5", achieved: false },
        { goal: 1e8, text: "Hand 1 cheapen level 6", achieved: false }
    ];
    const longTermObjectives = [
        { goal: 1e9, text: "Unlock a second hand", achieved: false },
        { goal: 1e12, text: "Unlock a third hand", achieved: false },
        { goal: 1e12, text: "Unlock Turbo Boost", achieved: false },
        { goal: 1e15, text: "Unlock a fourth hand", achieved: false },
        { goal: 1e18, text: "Unlock a fifth hand", achieved: false },
        { goal: 1e21, text: "Unlock a sixth hand", achieved: false },
        { goal: 1e24, text: "Unlock a seventh hand", achieved: false },
        { goal: 1e27, text: "Unlock a eighth hand", achieved: false },
        { goal: 1e30, text: "Unlock a ninth hand", achieved: false },
        { goal: 1e33, text: "Unlock a tenth hand", achieved: false },
        { id: "ascension-ready", goal: 1e35, text: "Prepare to Ascend", achieved: false },
        { id: "first-ascension", text: "Ascend Number 1 for the first time", achieved: false, isComplete: () => number1HasAscended },
        { id: "first-ascension-node", text: "Buy your first Ascension node", achieved: false, isComplete: () => number1AscensionNodeIds.length >= 1, getProgress: () => {
            return { current: Math.min(number1AscensionNodeIds.length, 1), target: 1, pct: Math.min(100, (number1AscensionNodeIds.length / 1) * 100), label: number1AscensionNodeIds.length + " / 1 node" };
        } },
        { id: "ascension-tree-complete", text: "Complete the Ascension tree", achieved: false, isComplete: () => isNumber1AscensionTreeFullyPurchased(), getProgress: () => {
            const total = Math.max(1, Array.isArray(ASCENSION_MAP_NODES) ? ASCENSION_MAP_NODES.length : 1);
            const owned = Math.min(total, ascensionPurchasedSet().size);
            return { current: owned, target: total, pct: Math.max(0, Math.min(100, (owned / total) * 100)), label: owned + " / " + total + " nodes" };
        } },
        { id: "bh-mass-pour", text: "Pour Essence into the Mass Accumulator", achieved: false, isComplete: () => getBlackHolePhase() >= 2 || Math.floor(Number(number1BlackHoleState.phase1EssenceSpent) || 0) > 0, getProgress: () => {
            const spent = Math.max(0, Math.floor(Number(number1BlackHoleState.phase1EssenceSpent) || 0));
            return { current: spent, target: BLACK_HOLE_PHASE1_ESSENCE_TARGET, pct: getBlackHolePhase() >= 2 ? 100 : Math.max(0, Math.min(100, (spent / BLACK_HOLE_PHASE1_ESSENCE_TARGET) * 100)), label: formatCount(spent) + " / " + formatCount(BLACK_HOLE_PHASE1_ESSENCE_TARGET) + " Essence" };
        } },
        { id: "bh-phase2", text: "Collapse the Mass Accumulator", achieved: false, isComplete: () => getBlackHolePhase() >= 2, getProgress: () => ({ pct: getBlackHolePhase() >= 2 ? 100 : getBlackHolePhase1FillRatio() * 100, label: Math.floor(getBlackHolePhase1FillRatio() * 100) + "% charged" }) },
        { id: "bh-phase2-tracks", text: "Complete collapse cycles", achieved: false, isComplete: () => getBlackHolePhase() >= 3, getProgress: () => {
            const mass = Math.max(0, Math.floor(Number(number1BlackHoleState.phase2Mass) || 0));
            const cap = getBlackHolePhase() >= 3 ? BLACK_HOLE_PHASE2_MASS_CAP : mass;
            const maxForStep = Math.min(BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER, mass + 1);
            const tiers = getBlackHolePhase2CollapseMassTier() + getBlackHolePhase2CollapsePhotonTier() + getBlackHolePhase2CollapseErgosphereTier();
            const cycleTarget = maxForStep * 3;
            return {
                current: getBlackHolePhase() >= 3 ? BLACK_HOLE_PHASE2_MASS_CAP : mass,
                target: BLACK_HOLE_PHASE2_MASS_CAP,
                pct: getBlackHolePhase() >= 3 ? 100 : Math.max(0, Math.min(100, (mass / BLACK_HOLE_PHASE2_MASS_CAP) * 100)),
                label: getBlackHolePhase() >= 3 ? "Phase 2 complete" : "Step " + mass + "/" + BLACK_HOLE_PHASE2_MASS_CAP + " · channels " + tiers + "/" + cycleTarget
            };
        } },
        { id: "bh-phase3", text: "Fill the singularity with mass", achieved: false, isComplete: () => getBlackHolePhase() >= 3, getProgress: () => {
            const mass = Math.max(0, Math.floor(Number(number1BlackHoleState.phase2Mass) || 0));
            return { current: mass, target: BLACK_HOLE_PHASE2_MASS_CAP, pct: getBlackHolePhase() >= 3 ? 100 : Math.max(0, Math.min(100, (mass / BLACK_HOLE_PHASE2_MASS_CAP) * 100)), label: mass + " / " + BLACK_HOLE_PHASE2_MASS_CAP + " mass" };
        } },
        { id: "bh-phase4", text: "Tune all accretion disk systems", achieved: false, isComplete: () => getBlackHolePhase() >= 4, getProgress: () => {
            const tiers = getBlackHolePhase3TrackLevel("luminosity") + getBlackHolePhase3TrackLevel("viscous") + getBlackHolePhase3TrackLevel("coronal");
            return { current: tiers, target: 18, pct: getBlackHolePhase() >= 4 ? 100 : Math.max(0, Math.min(100, (tiers / 18) * 100)), label: tiers + " / 18 disk tiers" };
        } },
        { id: "bh-wave", text: "Fire a Gravitational Wave", achieved: false, isComplete: () => getBlackHolePhase() >= 5 || !!number1BlackHoleState.phase4WaveTriggered || Date.now() <= (number1BlackHoleState.phase4WaveActiveUntilMs || 0), getProgress: () => ({ pct: getBlackHolePhase() >= 4 ? 50 : 0, label: getBlackHolePhase() >= 4 ? "Wave system online" : "Locked" }) },
        { id: "bh-phase5", text: "Unlock the Gravitational Furnace", achieved: false, isComplete: () => getBlackHolePhase() >= 5, getProgress: () => ({ pct: getBlackHolePhase() >= 5 ? 100 : Math.max(0, Math.min(100, ((number1BlackHoleState.phase4WaveLevel || 0) / 6) * 100)), label: Math.floor(Number(number1BlackHoleState.phase4WaveLevel) || 0) + " / 6 wave levels" }) },
        { id: "bh-first-sacrifice", text: "Feed your first hand to the furnace", achieved: false, isComplete: () => getBlackHolePhase() >= 6 || (number1BlackHoleState.phase5DigestHandNumber || 0) > 0 || (number1BlackHoleState.phase5DigestedHands || 0) > 0 },
        { id: "bh-first-digest", text: "Complete your first digestion", achieved: false, isComplete: () => getBlackHolePhase() >= 6 || (number1BlackHoleState.phase5DigestedHands || 0) >= 1 || (number1BlackHoleState.phase5FurnaceLevel || 0) >= 1, getProgress: () => ({ pct: ((number1BlackHoleState.phase5DigestedHands || 0) >= 1 || getBlackHolePhase() >= 6) ? 100 : getBlackHolePhase5DigestProgress() * 100, label: Math.floor(getBlackHolePhase5DigestProgress() * 100) + "% digested" }) },
        { id: "bh-phase6", text: "Digest down to one hand", achieved: false, isComplete: () => getBlackHolePhase() >= 6, getProgress: () => {
            const done = getBlackHolePhase() >= 6 ? 9 : Math.max(0, Math.floor(Number(number1BlackHoleState.phase5DigestedHands) || 0));
            return { current: done, target: 9, pct: Math.max(0, Math.min(100, (done / 9) * 100)), label: done + " / 9 hands digested" };
        } },
        { id: "bh-jet-ignite", text: "Ignite the Astrophysical Jet", achieved: false, isComplete: () => getBlackHolePhase() >= 7 || !!number1BlackHoleState.phase6JetIgnited || !!number1BlackHoleState.phase6JetActive, getProgress: () => ({ pct: getBlackHolePhase() >= 6 ? 50 : 0, label: getBlackHolePhase() >= 6 ? "Jet system online" : "Locked" }) },
        { id: "bh-phase7", text: "Reach the evaporation limit", achieved: false, isComplete: () => getBlackHolePhase() >= 7 || totalChanges >= BLACK_HOLE_EVAPORATION_CAP, getProgress: () => ({ pct: getBlackHolePhase() >= 7 ? 100 : Math.max(0, Math.min(100, Math.log10(Math.max(1, totalChanges)) / 308 * 100)), label: formatCount(totalChanges) + " / " + formatCount(BLACK_HOLE_EVAPORATION_CAP) }) },
        { id: "bh-epilogue", text: "Count in the Epilogue", achieved: false, isComplete: () => getBlackHolePhase() >= 7 && (number1BlackHoleState.phase7EpilogueCounter || 0) >= 60, getProgress: () => ({ pct: getBlackHolePhase() >= 7 ? Math.max(0, Math.min(100, ((number1BlackHoleState.phase7EpilogueCounter || 0) / 60) * 100)) : 0, label: Math.floor(number1BlackHoleState.phase7EpilogueCounter || 0) + " / 60 epilogue ticks" }) }
    ];

    const objectivesEl = document.getElementById("objectives");
    const sprayConfettiFrom = createConfettiSprayer({ defaultOriginEl: objectivesEl });
    function sprayShortTermConfetti() {
        sprayConfettiFrom(objectivesEl);
    }

    function updateObjectives() {
        const wasAchieved = objectives.map(o => o.achieved);
        objectives.forEach(obj => { if (totalChanges >= obj.goal) obj.achieved = true; });
        const justCompleted = objectives.some((o, i) => !wasAchieved[i] && o.achieved);
        if (justCompleted) sprayShortTermConfetti();
        const lastCompleted = objectives.filter(o => o.achieved).pop();
        const nextUncompleted = objectives.find(o => !o.achieved);
        const shortTermToShow = [lastCompleted, nextUncompleted].filter(Boolean);
        objectiveList.innerHTML = "";
        shortTermToShow.forEach(obj => {
            objectiveList.appendChild(renderObjectiveForTotal(obj, totalChanges, formatCount));
        });
        longTermObjectives.forEach(obj => { if (isObjectiveCompleteForTotal(obj, totalChanges)) obj.achieved = true; });
        const longLastCompleted = longTermObjectives.filter(o => o.achieved).pop();
        const longNextUncompleted = longTermObjectives.find(o => !o.achieved);
        const longTermToShow = [longLastCompleted, longNextUncompleted].filter(Boolean);
        longObjectiveList.innerHTML = "";
        longTermToShow.forEach(obj => {
            longObjectiveList.appendChild(renderObjectiveForTotal(obj, totalChanges, formatCount));
        });
        updateMilestoneUI();
    }
    function updateMilestoneUI() {
        if (!milestoneTextEl || !milestoneProgressFillEl) return;
        const next = longTermObjectives.find(o => !o.achieved) || longTermObjectives[longTermObjectives.length - 1];
        if (!next) return;
        const progress = getObjectiveProgressForTotal(next, totalChanges, formatCount);
        const pct = next.achieved ? 100 : progress.pct;
        if (milestoneTitleEl) milestoneTitleEl.textContent = "Next milestone";
        milestoneTextEl.textContent = next.text + (progress.label ? " — " + progress.label : "") + " (" + pct.toFixed(2) + "%)";
        milestoneProgressFillEl.style.width = pct + "%";
        if (milestoneEssenceLineEl) {
            if (number1AscensionEssence > 0 || isNumber1AscensionReady()) {
                milestoneEssenceLineEl.style.display = "";
                const ascPct = Math.max(0, Math.min(100, (totalChanges / ASCENSION_1_REQUIRED_TOTAL) * 100));
                const requiredHands = getNumber1AscensionRequiredHands();
                const handReqText = unlockedHands >= requiredHands ? "hands ready" : ("hands: " + unlockedHands + "/" + requiredHands);
                const readinessText = isNumber1AscensionReady()
                    ? " — Ascension ready! Use the glowing Ascension button."
                    : (" — Ascension: " + formatCount(totalChanges) + " / " + formatCount(ASCENSION_1_REQUIRED_TOTAL) + " (" + ascPct.toFixed(2) + "%), " + handReqText);
                const pendingBonus = getNumber1AscensionPendingBonusEssence();
                const pendingText = pendingBonus > 0 ? (" · Pending warp bonus: +" + formatCount(pendingBonus)) : "";
                milestoneEssenceLineEl.textContent = "Ascension Essence (Number 1): " + formatCount(number1AscensionEssence) + pendingText + readinessText;
            } else {
                milestoneEssenceLineEl.textContent = "";
                milestoneEssenceLineEl.style.display = "none";
            }
        }
        updateAscensionReadyChrome();
    }

    const number1ObjectivesBoot = createNumber1ObjectivesBoot({
        flush: () => { updateObjectives(); }
    });

    function updateAscensionReadyChrome() {
        const ready = isNumber1AscensionReady();
        let gainInfo = null;
        let ascendGainStr = "";
        if (ready) {
            gainInfo = computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal());
            ascendGainStr = formatCount(gainInfo.finalGain);
        }
        if (ascensionReadyBannerEssenceSuffixEl) {
            if (!ready) {
                ascensionReadyBannerEssenceSuffixEl.textContent = "";
            } else {
                const parts = ["base " + formatCount(gainInfo.baseGain)];
                if (gainInfo.pendingBonus > 0) parts.push("warp bonus " + formatCount(gainInfo.pendingBonus));
                if (gainInfo.blackHoleMultiplierBonus > 0) {
                    parts.push(getArcEssenceMultiplierBonusPhraseTitle() + " +" + formatCount(gainInfo.blackHoleMultiplierBonus) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)");
                }
                if (gainInfo.multiplierBonus > 0) {
                    parts.push("clap mult +" + formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)");
                }
                const bonusText = parts.length > 1 ? (" (" + parts.join(" + ") + ")") : "";
                ascensionReadyBannerEssenceSuffixEl.textContent =
                    "Ascend now for " + ascendGainStr + " essence" + bonusText + ".";
            }
        }
        if (ascensionReadyBannerEl) {
            ascensionReadyBannerEl.hidden = true;
            ascensionReadyBannerEl.setAttribute("aria-hidden", "true");
        }
        if (ascensionPageBtn) {
            ascensionPageBtn.style.display = (number1HasAscended || ready) ? "" : "none";
            ascensionPageBtn.classList.toggle("page-btn--ascension-ready", ready);
            ascensionPageBtn.textContent = ready ? ("Ascension: " + ascendGainStr) : "Ascension";
            if (ready) {
                ascensionPageBtn.setAttribute("title", "Ascension ready — click to ascend or manage Essence");
                ascensionPageBtn.setAttribute("aria-label", "Ascension ready — " + ascendGainStr + " Essence on ascend");
            } else {
                ascensionPageBtn.removeAttribute("title");
                ascensionPageBtn.removeAttribute("aria-label");
            }
        }
    }
    const NUMBER_MODULE_INTERFACE_METHODS = [
        "getLabel",
        "getRatePerSec",
        "getMilestone",
        "isAscensionReady",
        "tickBackground",
        "getSaveData",
        "applySaveData",
        "getOverviewDetails"
    ];
    function createNumberModule(definition) {
        const module = {
            getLabel: () => "Unknown Number",
            getRatePerSec: () => 0,
            getMilestone: () => ({ text: "No milestone", pct: 0 }),
            isAscensionReady: () => false,
            tickBackground: () => {},
            getSaveData: () => ({}),
            applySaveData: () => {},
            getOverviewDetails: () => "",
            ...definition
        };
        NUMBER_MODULE_INTERFACE_METHODS.forEach(method => {
            if (typeof module[method] !== "function") {
                throw new Error("Number module missing method: " + method);
            }
        });
        return module;
    }
    /* ---------------------------------------------------------
       Ascension — ascend payout rules + skill tree data + map UI helpers (BH arc unlock follows)
    --------------------------------------------------------- */
    function getNumber1AscensionPendingBonusEssence() {
        return getNumber1AscensionPendingBonusEssenceFromValue(number1AscensionPendingBonusEssence);
    }
    function getNumber1AscensionClapEssenceMultiplier() {
        return getNumber1AscensionClapEssenceMultiplierFromValue(number1AscensionClapEssenceMultiplier);
    }
    function computeNumber1AscensionBaseGain(fromTotal) {
        return computeNumber1AscensionBaseGainFromRules(fromTotal);
    }
    function getNumber1AscensionRunDurationSecForUi() {
        return getNumber1AscensionRunDurationSec(number1RunStartedAtMs);
    }
    function computeNumber1AscensionGainBreakdown(fromTotal) {
        return computeNumber1AscensionGainBreakdownFromRules(fromTotal, {
            pendingBonus: getNumber1AscensionPendingBonusEssence(),
            blackHolePhase1Mult: getBlackHolePhase1AscensionEssenceMult(),
            blackHoleParallelBonus: number1BlackHoleState.phase2ParallelBonusPool || 0,
            blackHoleFurnaceBonus: getBlackHoleFurnaceEssenceBonus(),
            clapMult: getNumber1AscensionClapEssenceMultiplier(),
            runDurationSec: getNumber1AscensionRunDurationSecForUi()
        });
    }
    function computeNumber1AscensionGain(fromTotal) {
        return computeNumber1AscensionGainFromRules(fromTotal, {
            pendingBonus: getNumber1AscensionPendingBonusEssence(),
            blackHolePhase1Mult: getBlackHolePhase1AscensionEssenceMult(),
            blackHoleParallelBonus: number1BlackHoleState.phase2ParallelBonusPool || 0,
            blackHoleFurnaceBonus: getBlackHoleFurnaceEssenceBonus(),
            clapMult: getNumber1AscensionClapEssenceMultiplier(),
            runDurationSec: getNumber1AscensionRunDurationSecForUi()
        });
    }
    function computeNumber1AscensionGainBreakdownAtPhase1EssenceMult(phase1EssenceMult) {
        return computeNumber1AscensionGainBreakdownFromRules(getNumber1AscensionEssenceFormulaTotal(), {
            pendingBonus: getNumber1AscensionPendingBonusEssence(),
            blackHolePhase1Mult: phase1EssenceMult,
            blackHoleParallelBonus: number1BlackHoleState.phase2ParallelBonusPool || 0,
            blackHoleFurnaceBonus: getBlackHoleFurnaceEssenceBonus(),
            clapMult: getNumber1AscensionClapEssenceMultiplier(),
            runDurationSec: getNumber1AscensionRunDurationSecForUi()
        });
    }
    function buildPhase1AscendPourContext(state, pourAmount, slowdownCapBase) {
        const pour = Math.max(0, Math.floor(Number(pourAmount) || 0));
        const gainNow = computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal());
        const pourPreview = getBlackHolePhase1PourPreview(state, pour, slowdownCapBase);
        const gainAfterPour = computeNumber1AscensionGainBreakdownAtPhase1EssenceMult(pourPreview.after.essenceMult);
        return {
            gainNow,
            gainAfterPour,
            pourPreview,
            pour,
            ready: isNumber1AscensionReady(),
            runDurationSec: getNumber1AscensionRunDurationSecForUi(),
            runTimeMultPct: gainNow.runTimeMultPct
        };
    }
    function getNumber1AscensionRequiredHands() {
        return getNumber1AscensionRequiredHandsFromPhase(getBlackHolePhase(), ASCENSION_1_MIN_HANDS);
    }
    function isNumber1AscensionReady() {
        return isNumber1AscensionReadyFromState({
            phase: getBlackHolePhase(),
            unlockedHands,
            totalChanges,
            minHands: ASCENSION_1_MIN_HANDS,
            requiredTotal: ASCENSION_1_REQUIRED_TOTAL
        });
    }
    const {
        ASCENSION_TREE_VERSION,
        ASCENSION_MAP_NODES,
        ASCENSION_FINGER_KEYS,
        ASCENSION_MAP_NODE_BY_ID,
        getNearMissToleranceRanks,
        ascensionPurchasedSet,
        ascMapUi,
        isNumber1AscensionTreeFullyPurchased,
        isBlackHoleArcUnlocked
    } = createN1AscensionTreeRuntime({
        getAscensionTreeExport: () => window.ASCENSION_TREE_EXPORT,
        getAscensionNodeIds: () => number1AscensionNodeIds,
        formatCount,
        getNumber1AscensionEssence: () => number1AscensionEssence,
        hasAscended: () => number1HasAscended
    });
    const ascMapDomDelegates = createN1AscensionMapDomDelegates(ascMapUi);
    const {
        computeAscensionHandLayout,
        renderAscensionMapColumnGuidesSvg,
        renderAscensionMapEdgesSvg,
        syncAscensionMapNodeDomPositions,
        ascensionResolveNodeIdAtClient,
        updateAscensionMapDetailPanel,
        setAscensionMapSelectedNode,
        initAscensionMapPanZoom,
        renderAscensionMapDebugOverlaySvg
    } = ascMapDomDelegates;
    teardownAscensionMapPanZoom = ascMapDomDelegates.teardownAscensionMapPanZoom;
    function isTurboScensionUnlocked() {
        return number1AscensionNodeIds.some(function (id) {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            return def && def.finger === "ring" && def.grants && def.grants.turboScensionUnlock === true;
        });
    }
    function isTurboScensionUpgradeAutobuyUnlocked() {
        return number1AscensionNodeIds.some(function (id) {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            return def && def.finger === "ring" && def.grants && def.grants.turboScensionUpgradeAutobuy === true;
        });
    }
    /** Pre-map ascension ids from early builds — any match clears the whole node list on load (no migration). */
    const ASCENSION_LEGACY_NODE_ID_RE = /^(?:tempo_cheapen_|boost_turbo_|boost_warp_|asc_(?:chp|cmb|spd|tur|wrp|syn)_)/;
    /** Combo UI + CPS stack; stubs until {@link createNumber1ComboBoot} runs (rate/twarp/ascension grants close over these). */
    let updateEarnedBonusesUI = function() {};
    let getComboMultiplier = function() {
        return 1;
    };
    let getPatternCatalogMultiplier = function() {
        return 1;
    };
    let getAscensionComboPatternMult = function() {
        return 1;
    };
    let getTimeWarpComboMultiplier = function() {
        return 1;
    };
    let getHandValues = function() {
        return [];
    };
    let getActiveCombos = function() {
        return [];
    };
    let getComboParticipatingHandIndices = function() {
        return [];
    };
    let computeComboUiInputDigest = function() {
        return "";
    };
    let computeEarnedCatalogComboTierProducts = function() {
        return 1;
    };
    let getCombosByMinHands = function() {
        return {};
    };
    let pulseCombinationsPageButtonForNewBonus = function() {};
    let showComboBubble = function() {};
    /** Upgrade / warp UI; stubs until cheapen/slowdown/tw boot runs (ascension grants close over these). */
    let updateCheapenUpgradeUI = function() {};
    let updateSlowdownUpgradeUI = function() {};
    let updateTimeWarpAuraUI = function() {};
    const n1AscGrants = createN1AscensionGrants({
        ascensionPurchasedSet,
        getAscensionNodeIds: () => number1AscensionNodeIds,
        getAscensionNodeById: id => ASCENSION_MAP_NODE_BY_ID[id],
        getHasAscended: () => number1HasAscended,
        getUnlockedHands: () => unlockedHands,
        getHandEarnings: () => handEarnings,
        setHandEarning: (i, v) => {
            handEarnings[i] = v;
        },
        getTotalChanges: () => totalChanges,
        refreshTotalFromHandEarnings,
        getIncrementalEl: () => incrementalEl,
        formatCount,
        updateObjectives,
        updateMilestoneUI,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        updateEarnedBonusesUI,
        updatePageButtonUnlocks
    });
    const {
        ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID,
        ASCENSION_NODE_AUTOBUY_CHEAPEN_ID,
        ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID,
        ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP,
        COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS,
        COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS,
        ascensionAutobuyDefaultOnForNewHands,
        ascensionAutobuyIncludesCheapen,
        ascensionAutobuyIncludesSlowdown,
        getAscensionHandUnlockStartingCountFloor,
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
        computeAscensionGrantTotals,
        getComboDiscoveryMilestoneCooldownMs
    } = n1AscGrants;
    function enterBlackHolePhase7GameplayReset() {
        totalChanges = 0;
        handEarnings = Array(maxHands).fill(0);
        handEarnings[0] = 0;
        unlockedHands = 1;
        unlockedHandsCap = 1;
        shrinkSpeedRowsTo(1);
        while (hands.length > 1) {
            const h = hands.pop();
            if (h && h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
    }
    /** Story banner call sites in black-hole controller run before {@link STORY_BANNERS} wiring; patched below. */
    const storyBannerBridge = {
        showStoryBanner() {},
        showStoryBannerById() {}
    };
    /** Patched after story-banner boot; turbo unlock must not read `checkStoryBanners` before it exists. */
    let forwardCheckStoryBanners = () => {};
    /** Forwarding ref: real implementations assigned after rate-display UI factory runs. */
    const rateDisplayUiRef = {
        updateRateDisplay() {},
        updateN1GravityCpsStrip() {}
    };
    /** Combo discovery calls ledger beam before `ledgerBeamVfx` exists; patched after {@link createLedgerBeamVfx}. */
    const ledgerBeamPlayBonusBridge = {
        /** @type {(catalogBefore: number, catalogAfter: number, patternMultLabel: string) => void} */
        play() {}
    };
    /** Hub live patch; stub until {@link createN1AscensionBootUi} (BH UI deps close over this). */
    let patchAscensionHubStatsPillsDomIfChanged = function() {};
    /* ---------------------------------------------------------
       Black hole — boot wiring (deps for createNumber1BlackHoleBoot)
    --------------------------------------------------------- */
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
        getBlackHolePhase2CollapseMaxTier,
        getBlackHolePhase2CollapsePhotonTier,
        getBlackHolePhase2CollapseErgosphereTier,
        isBlackHolePhase2MassPourUnlocked,
        getBlackHolePhase2MassCouplingCostMult,
        getBlackHolePhase2PhotonShellMult,
        getBlackHolePhase2PhotonHawkingCdTrimSec,
        getBlackHolePhase2CollapseUpgradeCost,
        getBlackHolePhase2CostAtLevel,
        getBlackHolePhase2MassMult,
        getBlackHolePhase2MassMultAfterNextPour,
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
        triggerBlackHolePhase2StepSurgeVfx,
        patchBlackHolePhase1PanelLiveDom,
        patchBlackHolePhase2PanelLiveDom,
        patchBlackHolePhase3PanelLiveDom,
        refreshBlackHolePanelLiveDomIfOpen,
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
        updateBlackHolePhaseStep
    } = createNumber1BlackHoleBoot({
        maxSlowdownLevelBase: MAX_SLOWDOWN_LEVEL,
        rootDocument: typeof document !== "undefined" ? document : null,
        getBlackHoleControllerDeps(bhUiBridge) {
            return {
                getBlackHoleState: () => number1BlackHoleState,
                isArcUnlocked: isBlackHoleArcUnlocked,
                hasAscended: () => number1HasAscended,
                addToLog,
                formatCount,
                queueBlackHoleUiRefresh: () => bhUiBridge.queueBlackHoleUiRefresh?.(),
                autosaveNow,
                getTurboBoostMeter: () => turboBoostMeter,
                setTurboBoostMeter: v => {
                    turboBoostMeter = v;
                },
                getTurboMeterMax,
                getTurboBoostUnlocked: () => turboBoostUnlocked,
                getTurboBoostEnabled: () => turboBoostEnabled,
                setTurboBoostEnabled: v => {
                    turboBoostEnabled = v;
                },
                syncTurboBoostToggleDomFromBoot: en => syncTurboBoostToggleDomFromBoot(en),
                isTurboLevelerMode: () =>
                    turboBoostUnlocked &&
                    isTurboScensionUnlocked() &&
                    !!computeAscensionGrantTotals().turboLeveler &&
                    !turboBoostEnabled,
                confirmPhase2MassPourWithoutCoupling(cost, available) {
                    return window.confirm(
                        "The Essence you pour (" +
                            formatCount(available) +
                            ") may be inconsequential against the next mass step (" +
                            formatCount(cost) +
                            "). Essence–mass coupling can cheapen it. Pour anyway?"
                    );
                },
                syncBlackHolePhase2PhotonCombos: () => syncBlackHolePhase2PhotonCombosRef(),
                triggerBlackHolePhase2StepSurgeVfx: () => bhUiBridge.triggerBlackHolePhase2StepSurgeVfx?.(),
                getBlackHoleUxFlags: () => number1BlackHoleUxFlags,
                getNumber1StageRootEl: () => number1StageRootEl || document.getElementById("number1-stage-root"),
                playBlackHoleScreenEffect,
                syncBlackHolePhase1Vfx: () => bhUiBridge.syncBlackHolePhase1Vfx?.(),
                pulseBlackHoleLensingAutoTick: () => bhUiBridge.pulseBlackHoleLensingAutoTick?.(),
                showStoryBanner: (banner, opts) => storyBannerBridge.showStoryBanner(banner, opts),
                getMaxHands: () => maxHands,
                getNumber1AscensionEssence: () => number1AscensionEssence,
                setNumber1AscensionEssence: v => {
                    number1AscensionEssence = v;
                },
                getTotalChanges: () => totalChanges,
                enterBlackHolePhase7GameplayReset,
                formatSeconds,
                phase5StokeMinRemainingMs: BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS,
                updateRateDisplay: opts => rateDisplayUiRef.updateRateDisplay(opts),
                updateN1GravityCpsStrip: () => rateDisplayUiRef.updateN1GravityCpsStrip(),
                refreshAscensionPanelIfOpen,
                triggerBlackHolePhase1CollapseVfx: () => bhUiBridge.triggerBlackHolePhase1CollapseVfx?.(),
                showStoryBannerById: id => storyBannerBridge.showStoryBannerById(id),
                pulseBlackHoleLensingManualBurst: () => bhUiBridge.pulseBlackHoleLensingManualBurst?.(),
                getUnlockedHands: () => unlockedHands,
                applyHandSacrifice
            };
        },
        getBlackHoleUiDeps({ ctl, syncPhase1MassFillCssVars: syncPhase1MassFill, getMaxSlowdownLevelCap: getMaxSlowdownCapFromBoot }) {
            return {
                controller: ctl,
                getBlackHoleState: () => number1BlackHoleState,
                getStageRoot: () => number1StageRootEl || document.getElementById("number1-stage-root"),
                getPlayStage: () => playStageEl,
                getIncrementalCountLabel: () => incrementalCountLabelEl,
                syncPhase1MassFillCssVars: syncPhase1MassFill,
                refreshGlobalOverviewPanelIfOpen,
                getPagePanelEl: () => pagePanelEl,
                getPagePanelBodyEl: () => pagePanelBodyEl,
                getAscensionPageActiveNumber: () => ascensionPageActiveNumber,
                refreshAscensionPanelIfOpen,
                patchAscensionHubStatsPillsDomIfChanged,
                renderNumber1BlackHolePanelHtml,
                buildPhase1AscendPourContext: (state, pour, capBase) =>
                    buildPhase1AscendPourContext(state, pour, capBase),
                isBlackHoleArcUnlocked,
                formatCount,
                formatCompactMultiplier,
                getBlackHolePhase1SlowdownCapBonus: () => ctl.getBlackHolePhase1SlowdownCapBonus(),
                autosaveNow,
                getAscensionEssence: () => number1AscensionEssence,
                getMaxSlowdownLevelCap: getMaxSlowdownCapFromBoot
            };
        }
    });
    /** Real impl assigned with `createComboDiscoveryUiLoop` after combo feedback + panel refresh wiring. */
    let tryProcessOneComboDiscoveryMilestone = function() {};
    let updateComboUI = function() {};
    function applyHandSacrifice(handNum) {
        const target = Math.max(1, Math.min(maxHands, handNum | 0));
        if (unlockedHands < target) return false;
        unlockedHandsCap = Math.max(1, Math.min(unlockedHandsCap, target - 1));
        unlockedHands = Math.min(unlockedHands, unlockedHandsCap);
        while (hands.length > unlockedHands) {
            const h = hands.pop();
            if (h && h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
        for (let i = unlockedHands; i < maxHands; i++) {
            handEarnings[i] = 0;
            autoBuyEnabledByHand[i] = false;
            autoBuyCountdownSecondsByHand[i] = 0;
            timeWarpAuraActiveByHand[i] = false;
            timeWarpAuraAppearedAtMsByHand[i] = 0;
        }
        shrinkSpeedRowsTo(unlockedHands);
        ensureSpeedRows();
        updateSpeedUpgradeUI();
        updateCheapenUpgradeUI();
        updateSlowdownUpgradeUI();
        updateComboUI();
        updateTurboBoostUI({ force: true });
        return true;
    }
    /* Runtime ascension grants: createN1AscensionGrants → n1AscGrants (wired after ascMapUi). */

    function getAscensionCheapenCapBonusFromTree() {
        return computeAscensionGrantTotals().cheapenCap;
    }
    function getAscensionTurboScalingBonusFromTree() {
        return computeAscensionGrantTotals().turboScaling;
    }
    function getAscensionWarpOverflowBonusFromTree() {
        return computeAscensionGrantTotals().warpOverflow;
    }
    function getMaxCheapenLevel() {
        return BASE_MAX_CHEAPEN_LEVEL + getAscensionCheapenCapBonusFromTree();
    }
    function turboMeterCurveScaleFromTotals(t) {
        return turboMeterCurveScaleFromTotalsRule(t);
    }
    /** Base meter capacity for the turbo mult curve (not multiplied by tank size). */
    function getTurboMeterCurveScale() {
        return turboMeterCurveScaleFromTotals(computeAscensionGrantTotals());
    }
    function getTurboMeterMax() {
        return getTurboMeterMaxFromState(computeAscensionGrantTotals(), turboScensionTankLevel);
    }
    function getTurboCountMultiplierMax() {
        return getTurboCountMultiplierMaxFromState(getAscensionTurboScalingBonusFromTree(), turboScensionMultLevel);
    }
    function getTimeWarpOverflowRatio() {
        return getTimeWarpOverflowRatioFromTotals(computeAscensionGrantTotals());
    }
    /** Max seconds until next aura roll (uniform 0…max); ascension shortens span, floor 1s. */
    function getTimeWarpAuraSpawnSpanMaxSec() {
        return getTimeWarpAuraSpawnSpanMaxSecFromTotals(computeAscensionGrantTotals());
    }
    let escapeAscensionHtml;
    let collectPurchasedAscensionGrantFlags;
    let renderAscensionHubGrantsHtml;
    let renderAscensionHubStatsPillsHtml;
    ({
        escapeAscensionHtml,
        collectPurchasedAscensionGrantFlags,
        renderAscensionHubGrantsHtml,
        renderAscensionHubStatsPillsHtml,
        patchAscensionHubStatsPillsDomIfChanged
    } = createN1AscensionBootUi({
        getHasAscended: () => number1HasAscended,
        getAscensionNodeIds: () => number1AscensionNodeIds,
        getAscensionNodeById: id => ASCENSION_MAP_NODE_BY_ID[id],
        computeAscensionGrantTotals,
        getNearMissToleranceRanks,
        getUnlockedHands: () => unlockedHands,
        getPatternCatalogMultiplier,
        getAscensionComboPatternMult,
        getTimeWarpComboMultiplier,
        getTurboCountMultiplierMax,
        getTurboMeterMax,
        getTimeWarpOverflowRatio,
        getTimeWarpAuraSpawnSpanMaxSec,
        getMaxCheapenLevel,
        formatCount,
        BLACK_HOLE_PHASE1_ESSENCE_TARGET,
        getAscensionEssenceInvestedInNodes,
        getNumber1AscensionPendingBonusEssence,
        getNumber1AscensionEssence: () => number1AscensionEssence,
        getNumber1BlackHoleState: () => number1BlackHoleState,
        getBlackHolePhase,
        isBlackHoleArcUnlocked,
        getNumber1BlackHoleProductionMult,
        formatBlackHolePhase1CpsMultForUi,
        getBlackHolePhase1RunCpsMult,
        getAscensionMapNodeCount: () => ASCENSION_MAP_NODES.length
    }));
    function getAscensionNodePurchaseCost(id) {
        return ascMapUi.getAscensionNodePurchaseCost(id);
    }
    function getAscensionEssenceInvestedInNodes() {
        let sum = 0;
        number1AscensionNodeIds.forEach(id => {
            const c = getAscensionNodePurchaseCost(id);
            if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) sum += c;
        });
        return sum;
    }
    function ascensionNodePrereqsMet(id) {
        return ascMapUi.ascensionNodePrereqsMet(id);
    }
    function normalizeAscensionNodeIds() {
        if (number1AscensionNodeIds.some(id => typeof id === "string" && ASCENSION_LEGACY_NODE_ID_RE.test(id))) {
            number1AscensionNodeIds = [];
            return;
        }
        const seen = new Set();
        const out = [];
        number1AscensionNodeIds.forEach(id => {
            if (typeof id !== "string" || !ASCENSION_MAP_NODE_BY_ID[id]) return;
            if (seen.has(id)) return;
            seen.add(id);
            out.push(id);
        });
        number1AscensionNodeIds = out;
    }
    function ascensionNodeDisplayName(id) {
        return ascMapUi.ascensionNodeDisplayName(id);
    }
    function getAscensionPurchaseChainInfoToNode(id) {
        return ascMapUi.getAscensionPurchaseChainInfoToNode(id);
    }
    function tryBuyAscensionNode(id) {
        if (!number1HasAscended) return;
        const chain = getAscensionPurchaseChainInfoToNode(id);
        if (chain.targetOwned) return;
        const spend = chain.missingCost;
        if (!(spend > 0) || number1AscensionEssence < spend) {
            addToLog("Ascension skill: " + ascensionNodeDisplayName(id) + " requires " + formatCount(spend) + " Essence to buy-to-here.", "warning");
            return;
        }
        number1AscensionEssence -= spend;
        chain.missingOrdered.forEach(function (nid) {
            number1AscensionNodeIds.push(nid);
        });
        normalizeAscensionNodeIds();
        const buyCount = chain.missingOrdered.length;
        const boughtLabel = buyCount > 1 ? ("buy-to-here " + buyCount + " nodes") : "single node";
        addToLog("Ascension skill: " + ascensionNodeDisplayName(id) + " (" + boughtLabel + ", " + formatCount(spend) + " Essence)", "milestone");
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands();
        if (chain.missingOrdered.indexOf(ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID) >= 0) {
            autoBuyUnlocked = true;
            ensureSpeedRows();
            for (let i = 0; i < unlockedHands; i++) autoBuyEnabledByHand[i] = true;
        }
        updateCheapenUpgradeUI();
        updateTurboBoostUI({ force: true });
        updateRateDisplay();
        updateTimeWarpAuraUI();
        if (!number1BlackHoleState.phase1MapCollapseSeen && isNumber1AscensionTreeFullyPurchased()) {
            queueAscensionMapCollapseTransition();
        }
        refreshOverviewAndAscensionPanelsIfOpen();
        if (chain.missingOrdered.some(function (nid) {
            const bought = ASCENSION_MAP_NODE_BY_ID[nid];
            return bought && bought.grants && bought.grants.turboLeveler === true;
        })) tryTurboLevelerPurchases();
        checkStoryBanners();
        autosaveNow();
    }
    function isAscensionMapCollapseTransitionActive() {
        return ascensionMapCollapseActiveUntilMs > Date.now();
    }
    function queueAscensionMapCollapseTransition() {
        if (number1BlackHoleState.phase1MapCollapseSeen || ascensionMapCollapsePending) return;
        ascensionMapCollapsePending = true;
        addToLog("Final ascension node owned. Confirm the story modal to collapse the map.", "milestone");
        if (!storyBannerOverlayEl || storyBannerOverlayEl.style.display !== "flex") {
            ensureBlackHoleArcStarted();
            const gravityBanner = getStoryBannerById("black-hole-mass-accumulator-intro");
            const collapseBanner = getStoryBannerById("ascension-map-collapse-ready");
            if (gravityBanner && collapseBanner) {
                showStoryBanner(gravityBanner, {
                    onClose: function () {
                        showStoryBanner(collapseBanner);
                    }
                });
            } else if (collapseBanner) {
                showStoryBanner(collapseBanner);
            }
        }
    }
    function startAscensionMapCollapseTransition() {
        if (number1BlackHoleState.phase1MapCollapseSeen) return;
        ascensionMapCollapsePending = false;
        number1BlackHoleState.phase1MapCollapseSeen = true;
        let durationMs = ASCENSION_MAP_COLLAPSE_DURATION_MS;
        try {
            if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                durationMs = 260;
            }
        } catch (_) {}
        ascensionMapCollapseActiveUntilMs = Date.now() + durationMs;
        addToLog("Final ascension node owned. The map collapses into the singularity.", "milestone");
        if (ascensionMapCollapseTimerId) clearTimeout(ascensionMapCollapseTimerId);
        ascensionMapCollapseTimerId = setTimeout(function () {
            ascensionMapCollapseTimerId = 0;
            ascensionMapCollapseActiveUntilMs = 0;
            refreshAscensionPanelIfOpen();
        }, durationMs + 30);
        refreshAscensionPanelIfOpen();
    }
    function respecNumber1AscensionSkillTrees() {
        if (!number1HasAscended || number1AscensionNodeIds.length === 0) return;
        if (hasBlackHoleProgressLockingRespec()) {
            addToLog("Ascension respec is blocked once you've spent Essence on post-map progression.", "warning");
            return;
        }
        let refund = 0;
        number1AscensionNodeIds.forEach(nodeId => {
            const c = getAscensionNodePurchaseCost(nodeId);
            if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) refund += c;
        });
        number1AscensionNodeIds = [];
        if (!isBlackHoleArcUnlocked()) number1BlackHoleState.phase = 0;
        number1AscensionEssence += refund;
        turboLevelerBank = 0;
        turboLevelerPurchases = 0;
        addToLog("Ascension trees reset — " + formatCount(refund) + " Essence refunded (free respec).", "milestone");
        updateCheapenUpgradeUI();
        updateTurboBoostUI({ force: true });
        updateRateDisplay();
        updateTimeWarpAuraUI();
        refreshOverviewAndAscensionPanelsIfOpen();
        autosaveNow();
    }
    function ascensionFingerHasPurchasedNodes(finger) {
        return number1AscensionNodeIds.some(id => {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            return def && def.finger === finger;
        });
    }
    function respecNumber1AscensionFinger(finger) {
        if (!number1HasAscended) return;
        if (hasBlackHoleProgressLockingRespec()) {
            addToLog("Ascension respec is blocked once you've spent Essence on post-map progression.", "warning");
            return;
        }
        if (ASCENSION_FINGER_KEYS.indexOf(finger) < 0) return;
        const kept = [];
        let refund = 0;
        number1AscensionNodeIds.forEach(nodeId => {
            const def = ASCENSION_MAP_NODE_BY_ID[nodeId];
            if (def && def.finger === finger) {
                const c = getAscensionNodePurchaseCost(nodeId);
                if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) refund += c;
            } else {
                kept.push(nodeId);
            }
        });
        if (refund <= 0) return;
        number1AscensionNodeIds = kept;
        normalizeAscensionNodeIds();
        if (!isBlackHoleArcUnlocked()) number1BlackHoleState.phase = 0;
        number1AscensionEssence += refund;
        addToLog((ASCENSION_FINGER_RESPEC_LABELS[finger] || finger) + " reset — " + formatCount(refund) + " Essence refunded.", "milestone");
        updateCheapenUpgradeUI();
        updateTurboBoostUI({ force: true });
        updateRateDisplay();
        refreshOverviewAndAscensionPanelsIfOpen();
        autosaveNow();
    }
    function renderNumber1BlackHolePanelHtml() {
        const esc = escapeAscensionHtml;
        if (!number1HasAscended || !isBlackHoleArcUnlocked()) return "";
        if (getBlackHolePhase() === 0) ensureBlackHoleArcStarted();
        const phase = getBlackHolePhase();
        const mult = getNumber1BlackHoleProductionMult();
        const multStr = mult >= 10 ? mult.toFixed(2) : mult.toFixed(3);
        let body = "";
        let note = "";
        let actions = "";
        let panelTitle = "Black hole";
        let panelAria = "Black hole — post-map progression";
        let panelExtraClass = "";
        if (phase === 0 || phase === 1) {
            panelTitle = "Numerical Mass Accumulator";
            panelAria = "Numerical Mass Accumulator — Phase 1 mass charge";
            panelExtraClass = " asc-black-hole--phase1";
            const spent = Math.floor(number1BlackHoleState.phase1EssenceSpent || 0);
            const rem = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - spent);
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const pour = Math.min(rem, have);
            const can = rem > 0 && have > 0;
            const fillPct = Math.round(getBlackHolePhase1FillRatio() * 100);
            const p1Fmt = {
                formatCount,
                formatCompactMultiplier,
                formatCpsMult: formatBlackHolePhase1CpsMultForUi
            };
            const p1AscendCtx = buildPhase1AscendPourContext(number1BlackHoleState, pour, MAX_SLOWDOWN_LEVEL);
            const p1Live = formatBlackHolePhase1EffectLines(getBlackHolePhase1PourPreview(number1BlackHoleState, pour, MAX_SLOWDOWN_LEVEL), p1Fmt, {
                ascendCtx: p1AscendCtx
            });
            body =
                "<div class=\"asc-black-hole__mass-geometry\" aria-hidden=\"true\">" +
                "<div class=\"asc-black-hole__tesseract\"></div>" +
                "<div class=\"asc-black-hole__numeral-dust\"><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span></div>" +
                "</div>" +
                "<p class=\"asc-black-hole__kicker\">Phase 1 · toward critical mass</p>" +
                "<p class=\"asc-black-hole__body\">You've mapped every branch — now your totals gain <strong>weight</strong>. This sink is the only use for Ascension Essence here: one button pours <strong>everything</strong> you hold into mass. Heavier numbers count faster, ascend richer, and pull harder on your Compaction ceiling.</p>" +
                "<div class=\"asc-black-hole__mass-meter-wrap\" role=\"group\" aria-label=\"Numerical mass charge\">" +
                "<div class=\"asc-black-hole__mass-meter-label\"><span>Mass charge</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%</span></div>" +
                "<div class=\"asc-black-hole__mass-meter-track\" role=\"progressbar\" aria-valuenow=\"" + spent + "\" aria-valuemin=\"0\" aria-valuemax=\"" + BLACK_HOLE_PHASE1_ESSENCE_TARGET + "\" aria-label=\"Essence poured into numerical mass\"><div class=\"asc-black-hole__mass-meter-fill\" style=\"width:" + fillPct + "%\"></div></div>" +
                "</div>" +
                "<ul class=\"asc-black-hole__effect-list\" aria-label=\"Mass effects on this run\">" +
                "<li><span class=\"asc-black-hole__effect-name\">Inertial counting</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"inertial\">" +
                esc(p1Live.inertial.val) +
                "</span><span class=\"asc-black-hole__effect-hint\">" +
                esc(p1Live.inertial.hint) +
                "</span></li>" +
                "<li><span class=\"asc-black-hole__effect-name\">Essence coupling</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"essence\">" +
                esc(p1Live.essence.val) +
                "</span><span class=\"asc-black-hole__effect-hint\">" +
                esc(p1Live.essence.hint) +
                "</span></li>" +
                "<li><span class=\"asc-black-hole__effect-name\">Drag ceiling</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"drag\">" +
                esc(p1Live.drag.val) +
                "</span><span class=\"asc-black-hole__effect-hint\">" +
                esc(p1Live.drag.hint) +
                "</span></li>" +
                "<li class=\"asc-black-hole__effect-li--ascend\"><span class=\"asc-black-hole__effect-name\">This run's ascend</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"ascend\">" +
                esc(p1Live.ascend.val) +
                "</span><span class=\"asc-black-hole__effect-hint\">" +
                esc(p1Live.ascend.hint) +
                "</span></li>" +
                "</ul>";
            note = "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence · next pour: <strong>" + esc(formatCount(pour)) + "</strong> into mass</p>";
            if (!can && rem > 0) {
                note += "<p class=\"asc-black-hole__note\">Ascend on Number 1 to earn Essence, then come back — one tap dumps your whole purse into the accumulator.</p>";
            }
            actions =
                "<div class=\"asc-black-hole__p1-pour-hover-zone\">" +
                "<p class=\"asc-black-hole__pour-preview-note\">Hover <strong>Pour in all Essence</strong> to preview how mass coupling boosts Inertial counting, Essence coupling, and Drag ceiling.</p>" +
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--mass-pour\" data-asc-black-hole-buy=\"1\"" +
                (can ? "" : " disabled") +
                ">Pour in all Essence (" +
                esc(formatCount(pour)) +
                ")</button></p></div>";
        } else if (phase === 2) {
            panelExtraClass = " asc-black-hole--phase2";
            if (Date.now() - (number1BlackHoleUxFlags.lastPhase2MassFeedAtMs || 0) < 1600) {
                panelExtraClass += " asc-black-hole--feed-pulse";
            }
            const L = Math.floor(number1BlackHoleState.phase2Mass || 0);
            const nextCost = getBlackHolePhase2NextCostEssence();
            const bank = Math.floor(number1BlackHoleState.phase2EssenceBank || 0);
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const parallel = Math.max(0, Number(number1BlackHoleState.phase2ParallelBonusPool) || 0);
            const parallelPct = Math.min(100, Math.round((parallel / 1.5) * 100));
            const maxForStep = getBlackHolePhase2CollapseMaxTier();
            const tm = getBlackHolePhase2CollapseMassTier();
            const tp = getBlackHolePhase2CollapsePhotonTier();
            const te = getBlackHolePhase2CollapseErgosphereTier();
            const massPourUnlock = isBlackHolePhase2MassPourUnlocked();
            const cMass = getBlackHolePhase2CollapseUpgradeCost("mass");
            const cPhoton = getBlackHolePhase2CollapseUpgradeCost("photon");
            const cErgo = getBlackHolePhase2CollapseUpgradeCost("ergosphere");
            const canMassUp = tm < maxForStep && have >= cMass && cMass > 0;
            const canPhotonUp = tp < maxForStep && have >= cPhoton && cPhoton > 0;
            const canErgoUp = te < maxForStep && have >= cErgo && cErgo > 0;
            const pourTotal = have + bank;
            const canPourMass = massPourUnlock && L < BLACK_HOLE_PHASE2_MASS_CAP && pourTotal >= nextCost && nextCost > 0;
            const massMultNow = getBlackHolePhase2MassMult();
            const massMultNext = L < BLACK_HOLE_PHASE2_MASS_CAP ? getBlackHolePhase2MassMultAfterNextPour() : massMultNow;
            const massMultNowStr = formatCompactMultiplier(massMultNow);
            const massMultNextStr = formatCompactMultiplier(massMultNext);
            const massEffectHtml = buildBlackHolePhase2TrackEffectHtml(number1BlackHoleState, "mass", esc);
            const photonEffectHtml = buildBlackHolePhase2TrackEffectHtml(number1BlackHoleState, "photon", esc);
            const ergoEffectHtml = buildBlackHolePhase2TrackEffectHtml(number1BlackHoleState, "ergosphere", esc);
            const bankLine =
                nextCost > 0
                    ? " · Next pour: <strong>" + esc(formatCount(nextCost)) + "</strong> Essence" +
                      (bank > 0 ? (" (banked <strong>" + esc(formatCount(bank)) + "</strong>)") : "")
                    : "";
            const p2Row = function (track, title, tier, effectHtml, cost, canBuy) {
                const maxed = tier >= maxForStep;
                const tierLabel = maxed ? "max" : tier + "/" + maxForStep;
                const btnLabel = maxed ? "Maxed" : "Buy (" + esc(formatCount(cost)) + ")";
                return (
                    "<div class=\"asc-black-hole__p2-row\" data-asc-black-hole-p2-row=\"" + esc(track) + "\">" +
                    "<div class=\"asc-black-hole__p2-row-head\"><span class=\"asc-black-hole__p2-name\">" + esc(title) + "</span>" +
                    "<span class=\"asc-black-hole__p2-tier\">Tier <strong>" + esc(tierLabel) + "</strong></span></div>" +
                    "<p class=\"asc-black-hole__p2-effect\">" + effectHtml + "</p>" +
                    "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--p2-collapse\" data-asc-black-hole-p2=\"" + esc(track) + "\"" +
                    (canBuy ? "" : " disabled") + ">" + btnLabel + "</button></p>" +
                    "</div>"
                );
            };
            body =
                "<section class=\"asc-black-hole__p2-mass-block\" aria-label=\"Singularity mass\">" +
                "<h4 class=\"asc-black-hole__p2-mass-title\">Singularity mass</h4>" +
                "<p class=\"asc-black-hole__p2-mass-desc\">Raises the permanent black-hole counting multiplier for this arc.</p>" +
                "<p class=\"asc-black-hole__p2-mass-stats\">Mass step <strong>" + L + " / " + BLACK_HOLE_PHASE2_MASS_CAP + "</strong> · Now <strong>×" + esc(massMultNowStr) + "</strong>" +
                (L < BLACK_HOLE_PHASE2_MASS_CAP ? " · After next pour <strong>×" + esc(massMultNextStr) + "</strong>" : "") +
                bankLine + "</p></section>" +
                "<div class=\"asc-black-hole__collapse-geometry\" aria-hidden=\"true\">" +
                "<span class=\"asc-black-hole__collapse-core\"></span>" +
                "<div class=\"asc-black-hole__numeral-dust\"><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span></div>" +
                "<span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--a\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--b\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--c\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--d\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--e\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--f\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--g\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--h\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--i\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--j\"></span>" +
                "</div>" +
                "<p class=\"asc-black-hole__kicker\">Phase 2 · collapse cycle</p>" +
                "<p class=\"asc-black-hole__body\">Max all three channels at tier <strong>" + maxForStep + "</strong>, pour once into mass, then channels reset (final pour keeps upgrades). Parallel Essence bonus still builds on every spend.</p>" +
                "<div class=\"asc-black-hole__parallel-meter-wrap\" role=\"group\" aria-label=\"Parallel Essence bonus for future ascends\">" +
                "<div class=\"asc-black-hole__mass-meter-label\"><span>Parallel pool</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>+" + esc((parallel * 100).toFixed(1)) + "%</strong> / +150.0% Essence</span></div>" +
                "<div class=\"asc-black-hole__mass-meter-track asc-black-hole__parallel-meter-track\" role=\"progressbar\" aria-valuenow=\"" + esc((parallel * 100).toFixed(1)) + "\" aria-valuemin=\"0\" aria-valuemax=\"150\" aria-label=\"Parallel Essence bonus\"><div class=\"asc-black-hole__mass-meter-fill asc-black-hole__parallel-meter-fill\" style=\"width:" + parallelPct + "%\"></div></div>" +
                "</div>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Collapse upgrades\">" +
                p2Row("mass", "Essence–mass coupling", tm, massEffectHtml, cMass, canMassUp) +
                p2Row("photon", "Photon shell", tp, photonEffectHtml, cPhoton, canPhotonUp) +
                p2Row("ergosphere", "Ergosphere coupling", te, ergoEffectHtml, cErgo, canErgoUp) +
                "</div>";
            note =
                "<p class=\"asc-black-hole__stats\">Phase: <strong>2</strong> · Mass pour: <strong>" + (massPourUnlock ? "unlocked" : "locked") + "</strong> · Run mult: <strong>×" + esc(multStr) + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence" +
                (bank > 0 ? (" · banked <strong>" + esc(formatCount(bank)) + "</strong>") : "") + ".</p>" +
                (massPourUnlock
                    ? ""
                    : "<p class=\"asc-black-hole__note\">Max all three channels at tier <strong>" + maxForStep + "</strong> to unlock the next mass pour.</p>");
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" +
                (canPourMass ? "" : " disabled") +
                ">Pour one mass step (" +
                esc(formatCount(nextCost)) +
                " Essence)</button></p>";
        } else if (phase === 3) {
            panelExtraClass = " asc-black-hole--phase3";
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const lum = getBlackHolePhase3TrackLevel("luminosity");
            const vis = getBlackHolePhase3TrackLevel("viscous");
            const cor = getBlackHolePhase3TrackLevel("coronal");
            const p3TierPips = function (track, tier) {
                const dots = [];
                for (let i = 1; i <= 6; i++) {
                    dots.push("<span class=\"asc-black-hole__disk-pip" + (i <= tier ? " asc-black-hole__disk-pip--lit" : "") + "\" aria-hidden=\"true\">" + i + "</span>");
                }
                return "<div class=\"asc-black-hole__disk-pips asc-black-hole__disk-pips--" + esc(track) + "\" aria-label=\"" + esc(tier + " of 6 tiers lit") + "\">" + dots.join("") + "</div>";
            };
            const p3Row = function (track, title, tier, effectHtml) {
                const cost = getBlackHolePhase3TrackCost(track);
                const maxed = tier >= 6;
                const canBuy = !maxed && have >= cost && cost > 0;
                return (
                    "<div class=\"asc-black-hole__p2-row asc-black-hole__disk-row asc-black-hole__disk-row--" + esc(track) + "\">" +
                    "<div class=\"asc-black-hole__disk-track-icon\" aria-hidden=\"true\"><span></span></div>" +
                    "<div class=\"asc-black-hole__p2-row-head\"><span class=\"asc-black-hole__p2-name\">" + esc(title) + "</span>" +
                    "<span class=\"asc-black-hole__p2-tier\">Tier <strong>" + (maxed ? "max" : (tier + "/6")) + "</strong></span></div>" +
                    "<p class=\"asc-black-hole__p2-effect\">" + effectHtml + "</p>" +
                    p3TierPips(track, tier) +
                    "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--p2-collapse\" data-asc-black-hole-p3=\"" + esc(track) + "\"" +
                    (canBuy ? "" : " disabled") + ">" + (maxed ? "Maxed" : ("Buy (" + esc(formatCount(cost)) + ")")) + "</button></p>" +
                    "</div>"
                );
            };
            body =
                "<div class=\"asc-black-hole__disk-hero\" aria-hidden=\"true\">" +
                renderAccretionDiskHeroInnerHtml() +
                "</div>" +
                "<p class=\"asc-black-hole__body\">Phase 3 — Accretion Disk: tune the burst in three visible ways: brighter radiation, faster flares, and longer coronal burn windows.</p>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Accretion disk upgrades\">" +
                p3Row("luminosity", "Disk luminosity", lum, "Brighter Hawking bursts: raises the temporary CPS multiplier during radiation windows.") +
                p3Row("viscous", "Viscous accretion", vis, "More frequent flares: shortens the Hawking cooldown so bursts arrive sooner.") +
                p3Row("coronal", "Coronal loop", cor, "Longer burn: extends each Hawking burst duration so windows are easier to use.") +
                "</div>";
            note = "<p class=\"asc-black-hole__stats\" data-asc-bh-disk-phase-stats>Phase: <strong>3</strong> · Luminosity: <strong>" + lum + "</strong> · Viscous: <strong>" + vis + "</strong> · Coronal: <strong>" + cor + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\" data-asc-bh-disk-purse>You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence.</p>";
            actions = "";
        } else if (phase === 4) {
            panelExtraClass = " asc-black-hole--phase4";
            const W = Math.floor(number1BlackHoleState.phase4WaveLevel || 0);
            const cost = getBlackHolePhase4NextCostEssence();
            const bank = Math.floor(number1BlackHoleState.phase4EssenceBank || 0);
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const can = have >= 1 && W < 6;
            const bankLine = cost > 0 && bank > 0
                ? (" · Banked: <strong>" + esc(formatCount(bank)) + "</strong> / " + esc(formatCount(cost)))
                : (cost > 0 ? (" · Next tier: <strong>" + esc(formatCount(cost)) + "</strong> Essence") : "");
            const manualReady = Date.now() >= (number1BlackHoleState.phase4ManualReadyAtMs || 0);
            const manualInSec = manualReady ? 0 : Math.max(0, Math.ceil(((number1BlackHoleState.phase4ManualReadyAtMs || 0) - Date.now()) / 1000));
            body = "<p class=\"asc-black-hole__body\">Phase 4 — Gravitational Lensing: spacetime ripples pulse on cadence, and you can force a manual wave. Partial Essence banks toward the next wave upgrade.</p>";
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>4</strong> · Wave lvl: <strong>" + W + "</strong> · Interval: <strong>" + getBlackHoleWaveIntervalSec().toFixed(1) + "s</strong> · Manual: <strong>" + (manualReady ? "ready" : ("in " + formatSeconds(manualInSec))) + "</strong>" + bankLine + "</p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence.</p>";
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" + (can ? "" : " disabled") + ">Pour all Essence into wave (" + esc(formatCount(have)) + ")</button></p>" +
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-wave=\"1\"" + (manualReady ? "" : " disabled") + ">Manual Gravitational Wave</button></p>";
        } else if (phase === 5) {
            panelExtraClass = " asc-black-hole--phase5";
            const digestEnd = number1BlackHoleState.phase5DigestEndsAtMs || 0;
            const now = Date.now();
            const lastCompleteAt = Number(number1BlackHoleState.phase5LastDigestCompletedAtMs) || 0;
            if (lastCompleteAt > 0 && now - lastCompleteAt < BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS) {
                panelExtraClass += " asc-black-hole--furnace-ritual";
            }
            const activeHand = Math.max(0, Math.floor(number1BlackHoleState.phase5DigestHandNumber || 0));
            const canSpeedDigest = digestEnd > now && activeHand > 0;
            const speedDigestCost = Math.max(25, Math.floor(50 + 20 * (number1BlackHoleState.phase5FurnaceLevel || 0)));
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const pendingMutationLevel = Math.max(0, Math.floor(Number(number1BlackHoleState.phase5PendingMutationLevel) || 0));
            const pendingMutationHand = Math.max(0, Math.floor(Number(number1BlackHoleState.phase5PendingMutationHand) || 0));
            const hasPendingMutation = pendingMutationLevel > 0;
            const stokePreview = canSpeedDigest && have > 0 ? getBlackHolePhase5StokePreview(have, now) : null;
            const stokeSpend = stokePreview && stokePreview.spentEssence != null ? Math.max(0, Math.floor(Number(stokePreview.spentEssence))) : 0;
            const canStoke = canSpeedDigest && !hasPendingMutation && stokeSpend >= 1;
            const completed = Math.max(0, Math.floor(number1BlackHoleState.phase5FurnaceLevel || 0));
            const nextHand = Math.max(1, Math.floor(number1BlackHoleState.phase5NextSacrificeHand || 1));
            const rewardBeatActive = hasPendingMutation && lastCompleteAt > 0 && now - lastCompleteAt < BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS;
            const nextHandLocked = !canSpeedDigest && nextHand > 1 && unlockedHands < nextHand;
            const progress = canSpeedDigest ? getBlackHolePhase5DigestProgressAt(now) : 0;
            const curved = getBlackHolePhase5DigestCurve(progress);
            const progressPct = Math.floor(progress * 1000) / 10;
            const curvedPct = Math.floor(curved * 1000) / 10;
            const digestRemainingSec = canSpeedDigest ? Math.max(0, Math.ceil((digestEnd - now) / 1000)) : 0;
            const bufferSecCeil = Math.max(5, Math.ceil(BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS / 1000));
            const stokePreviewPct = stokePreview ? Math.floor(stokePreview.progress * 1000) / 10 : progressPct;
            const stokePreviewCurvedPct = stokePreview ? Math.floor(stokePreview.curved * 1000) / 10 : curvedPct;
            const stokeRemovedSec = stokePreview ? Math.max(0, Math.floor(stokePreview.removedMs / 1000)) : 0;
            const stokeRemainingSec = stokePreview ? Math.max(0, Math.ceil(stokePreview.projectedRemainingMs / 1000)) : digestRemainingSec;
            const currentPower = getBlackHolePhase5EffectiveFurnacePower();
            const nextFullPower = completed + (canSpeedDigest ? 1 : 0);
            const hotter = getBlackHolePhase5MutationLevel("hotter-core");
            const refinery = getBlackHolePhase5MutationLevel("essence-refinery");
            const orbit = getBlackHolePhase5MutationLevel("shorter-orbit");
            const furnaceMult = getBlackHoleFurnaceMult();
            const nextFurnaceMult = Math.pow(BLACK_HOLE_FURNACE_MULT_PER_POWER * getBlackHolePhase5HotterCoreMult(), nextFullPower);
            const furnaceEssenceBonus = getBlackHoleFurnaceEssenceBonus();
            const digestedStart = 11 - completed;
            const echoHands = completed > 0
                ? Array.from({ length: completed }, (_, i) => Math.max(1, 10 - i)).map(h => {
                    const pendingClass = hasPendingMutation && h === pendingMutationHand ? " asc-black-hole__echo-hand--pending" : "";
                    const rewardClass = rewardBeatActive && h === pendingMutationHand ? " asc-black-hole__echo-hand--new" : "";
                    return "<span class=\"asc-black-hole__echo-hand" + pendingClass + rewardClass + "\">H" + h + "</span>";
                }).join("")
                : "<span class=\"asc-black-hole__echo-empty\">No Echo Hands yet</span>";
            const echoTrack = "<div class=\"asc-black-hole__echo-track\" aria-label=\"Echo Hands collected\"><div class=\"asc-black-hole__echo-head\"><span>Echo Hands</span><strong>" + completed + " / 9</strong></div><div class=\"asc-black-hole__echo-list\">" + echoHands + "</div></div>";
            const mutationSummary = "<div class=\"asc-black-hole__mutation-summary\" aria-label=\"Furnace mutation summary\">" +
                "<span>Echo CPS <strong>×" + (furnaceMult >= 10 ? furnaceMult.toFixed(2) : furnaceMult.toFixed(3)) + "</strong> · each Echo Hand compounds from ×" + BLACK_HOLE_FURNACE_MULT_PER_POWER.toFixed(2) + " base</span>" +
                "<span>Hotter Core <strong>" + hotter + "</strong> · raises Echo CPS base +" + Math.round(BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS * 100) + "% / stack</span>" +
                "<span>Essence Refinery <strong>" + refinery + "</strong> · current furnace Essence bonus +" + (furnaceEssenceBonus * 100).toFixed(1) + "%</span>" +
                "<span>Shorter Orbit <strong>" + orbit + "</strong> · next digests ×" + getBlackHolePhase5ShorterOrbitMult().toFixed(2) + " time</span>" +
                "</div>";
            const ritual = hasPendingMutation
                ? ("<div class=\"asc-black-hole__furnace-ritual\" role=\"status\">" +
                    "<div class=\"asc-black-hole__furnace-ritual-kicker\">Furnace completion ritual</div>" +
                    "<h5>Hand " + pendingMutationHand + " became an Echo Hand</h5>" +
                    "<p>The furnace flares. Choose one mutation before feeding the next hand.</p>" +
                    "</div>")
                : "";
            const mutationChoices = hasPendingMutation
                ? ("<div class=\"asc-black-hole__mutation-choices" + (rewardBeatActive ? " asc-black-hole__mutation-choices--reward" : "") + "\" role=\"group\" aria-label=\"Choose Furnace Mutation\">" +
                    "<button type=\"button\" class=\"asc-black-hole__mutation-choice\" data-asc-black-hole-mutation=\"hotter-core\"><strong>Hotter Core</strong><span>Echo Hands burn brighter. The compounding CPS base gains +" + Math.round(BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS * 100) + "% per stack.</span></button>" +
                    "<button type=\"button\" class=\"asc-black-hole__mutation-choice\" data-asc-black-hole-mutation=\"essence-refinery\"><strong>Essence Refinery</strong><span>Digested hands refine ascension fuel. Furnace Essence bonus gains +" + Math.round(BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS * 100) + "% per stack.</span></button>" +
                    "<button type=\"button\" class=\"asc-black-hole__mutation-choice\" data-asc-black-hole-mutation=\"shorter-orbit\"><strong>Shorter Orbit</strong><span>The next digestion timers compress. Current timer multiplier: ×" + getBlackHolePhase5ShorterOrbitMult().toFixed(2) + ".</span></button>" +
                    "</div>")
                : "";
            const digestLabel = canSpeedDigest
                ? ("Hand " + activeHand + " digesting · " + progressPct.toFixed(1) + "% time · " + curvedPct.toFixed(1) + "% power")
                : (hasPendingMutation ? ("Mutation pending for Hand " + pendingMutationHand) : "Ready for next sacrifice");
            const digestMeter = canSpeedDigest
                ? ("<div class=\"asc-black-hole__mass-meter-wrap\" role=\"group\" aria-label=\"Active hand digestion\">" +
                    "<div class=\"asc-black-hole__mass-meter-label\"><span>Digesting hand " + activeHand + "</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>" + progressPct.toFixed(1) + "%</strong> time · <strong>" + curvedPct.toFixed(1) + "%</strong> power · " + esc(formatSeconds(digestRemainingSec)) + " left</span></div>" +
                    "<div class=\"asc-black-hole__mass-meter-track asc-black-hole__furnace-meter-track\" role=\"progressbar\" aria-valuenow=\"" + esc(progressPct.toFixed(1)) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-label=\"Digestion progress\"><div class=\"asc-black-hole__furnace-meter-preview\" style=\"width:" + Math.max(0, Math.min(100, stokePreviewPct)).toFixed(1) + "%\"></div><div class=\"asc-black-hole__mass-meter-fill asc-black-hole__furnace-meter-fill\" style=\"width:" + Math.max(0, Math.min(100, progress * 100)).toFixed(1) + "%\"></div></div>" +
                    (stokePreview
                        ? "<p class=\"asc-black-hole__stoke-preview-hint\">Hover or focus <strong>Stoke active digest</strong> to preview the jump.</p><p id=\"asc-black-hole-stoke-preview\" class=\"asc-black-hole__stoke-preview\" aria-live=\"polite\">Projected after stoke: <strong>" + stokePreviewPct.toFixed(1) + "%</strong> time · <strong>" + stokePreviewCurvedPct.toFixed(1) + "%</strong> power · removes <strong>" + esc(formatSeconds(stokeRemovedSec)) + "</strong> · leaves <strong>" + esc(formatSeconds(stokeRemainingSec)) + "</strong></p>"
                        : "<p id=\"asc-black-hole-stoke-preview\" class=\"asc-black-hole__stoke-preview asc-black-hole__stoke-preview--empty\">Earn Ascension Essence to preview the next stoke jump.</p>") +
                    "</div>")
                : "";
            const digestVisual = canSpeedDigest
                ? ("<div class=\"asc-black-hole__furnace-visual\" role=\"img\" aria-label=\"Hand " + activeHand + " is " + progressPct.toFixed(1) + "% digested\">" +
                    "<div class=\"asc-black-hole__furnace-hand-card\">" +
                    "<div class=\"asc-black-hole__furnace-hand-shell\" style=\"--digest-fill:" + Math.max(0, Math.min(100, progress * 100)).toFixed(1) + "%\">" +
                    "<div class=\"asc-black-hole__furnace-hand-fill\"></div>" +
                    "<pre class=\"asc-black-hole__furnace-hand-ascii\">" + esc(hands1[activeHand - 1] || hands1[9] || "") + "</pre>" +
                    "</div>" +
                    "<div class=\"asc-black-hole__furnace-hand-label\">Hand " + activeHand + "</div>" +
                    "</div>" +
                    "<div class=\"asc-black-hole__furnace-caption\">The silhouette fills as digestion converts the lost hand into furnace power.</div>" +
                    "</div>")
                : "";
            body = "<p class=\"asc-black-hole__body\">Phase 5 — Gravitational Furnace: feed one hand, wait for it to digest, then feed the next. The current hand starts weak and ramps non-linearly toward full furnace power as the 24-hour digest completes. Ascend actively to earn Essence, then stoke the furnace to compress the remaining timer.</p>" +
                ritual +
                echoTrack +
                mutationSummary +
                digestVisual +
                digestMeter +
                mutationChoices;
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>5</strong> · Completed hands: <strong>" + completed + "</strong> · Active: <strong>" + esc(digestLabel) + "</strong></p>" +
                "<p class=\"asc-black-hole__stats\">Furnace power: <strong>" + currentPower.toFixed(2) + "</strong> Echo Hands · Current furnace CPS: <strong>×" + furnaceMult.toFixed(2) + "</strong> · On completion: <strong>×" + nextFurnaceMult.toFixed(2) + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence · full stoke unit: <strong>" + esc(formatCount(speedDigestCost)) + "</strong>. Stoking trims time until ~<strong>" + bufferSecCeil + "</strong>s remain and only spends Essence that actually accelerates digestion.</p>" +
                (completed > 0 ? "<p class=\"asc-black-hole__stats\">Echo sequence: <strong>Hand 10" + (completed > 1 ? " → Hand " + digestedStart : "") + "</strong> absorbed into the singularity.</p>" : "") +
                (hasPendingMutation ? "<p class=\"asc-black-hole__note\">Pick a mutation to claim the Echo Hand reward.</p>" : (nextHandLocked ? "<p class=\"asc-black-hole__note\">Next sacrifice requires <strong>Hand " + nextHand + "</strong>. Unlock that hand again on this run before feeding it.</p>" : ""));
            const stokeBtnLabel =
                !canSpeedDigest
                    ? "Stoke active digest"
                    : hasPendingMutation
                      ? "Stoke (mutation pending)"
                      : stokeSpend >= 1
                        ? ("Stoke active digest (" + esc(formatCount(stokeSpend)) + " Essence)")
                        : ("Digest buffer (~≤" + bufferSecCeil + "s left) · won't spend Essence yet");
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" +
                    (canSpeedDigest ? " data-asc-black-hole-stoke-preview-toggle=\"1\" aria-describedby=\"asc-black-hole-stoke-preview\" title=\"Charges only Essence needed to shorten this digestion (stops ~" + bufferSecCeil + "s remaining).\"" : "") +
                    (canStoke ? "" : " disabled") +
                    ">" +
                    esc(stokeBtnLabel) +
                    "</button></p>" +
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-sacrifice=\"1\"" + (canSpeedDigest || hasPendingMutation ? " disabled" : "") + ">" + (hasPendingMutation ? "Choose mutation first" : (canSpeedDigest ? ("Digesting hand " + activeHand + "...") : (nextHandLocked ? ("Unlock Hand " + nextHand + " to feed") : "Feed next hand"))) + "</button></p>";
        } else if (phase === 6) {
            panelExtraClass = " asc-black-hole--phase6" + (number1BlackHoleState.phase6JetActive ? " asc-black-hole--jet-active" : "");
            const charge = Math.floor(number1BlackHoleState.phase6JetCharge || 0);
            const best = Math.max(0, Number(number1BlackHoleState.phase6JetBestAscensionEssence) || 0);
            const chargeCap = Math.max(500, best * (0.5 + 0.2 * getBlackHolePhase6TrackLevel("bank")));
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const drain = getBlackHolePhase6TrackLevel("drain");
            const boost = getBlackHolePhase6TrackLevel("boost");
            const bankLvl = getBlackHolePhase6TrackLevel("bank");
            const p6Row = function (track, title, tier, effectHtml) {
                const cost = getBlackHolePhase6TrackCost(track);
                const canBuy = have >= cost;
                return (
                    "<div class=\"asc-black-hole__p2-row\">" +
                    "<div class=\"asc-black-hole__p2-row-head\"><span class=\"asc-black-hole__p2-name\">" + esc(title) + "</span>" +
                    "<span class=\"asc-black-hole__p2-tier\">Tier <strong>" + tier + "</strong></span></div>" +
                    "<p class=\"asc-black-hole__p2-effect\">" + effectHtml + "</p>" +
                    "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--p2-collapse\" data-asc-black-hole-p6=\"" + esc(track) + "\"" +
                    (canBuy ? "" : " disabled") + ">Buy (" + esc(formatCount(cost)) + ")</button></p>" +
                    "</div>"
                );
            };
            body = "<p class=\"asc-black-hole__body\">Phase 6 — Astrophysical Jets: the battery creates Essence-equivalent jet fuel from your best ascension. If the tank runs dry while the jet is ON, stored Ascension Essence can burn directly as emergency fuel.</p>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Jet upgrades\">" +
                p6Row("drain", "Drain efficiency", drain, "Same thrust, cheaper burn: reduces fuel consumed per second while the jet is ON.") +
                p6Row("boost", "Boost multiplier", boost, "Hotter burn: increases the active jet production multiplier.") +
                p6Row("bank", "Boost bank", bankLvl, "Bigger tank: raises the Essence-equivalent fuel cap generated from your best ascend.") +
                "</div>";
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>6</strong> · Jet fuel: <strong>" + esc(formatCount(charge)) + " / " + esc(formatCount(Math.floor(chargeCap))) + "</strong> · Jet: <strong>" + (number1BlackHoleState.phase6JetActive ? "ON" : "OFF") + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence.</p>";
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-jet=\"" + (number1BlackHoleState.phase6JetActive ? "off" : "on") + "\">Turn jet " + (number1BlackHoleState.phase6JetActive ? "off" : "on") + "</button></p>";
        } else {
            panelExtraClass = " asc-black-hole--phase7";
            body = "<p class=\"asc-black-hole__body\">Phase 7 — Evaporation: one hand, one counter, one beat. Upgrades are silent. Counting continues for closure.</p>";
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>7</strong> · Epilogue counter: <strong>" + esc(formatCount(Math.floor(number1BlackHoleState.phase7EpilogueCounter || 0))) + "</strong></p>";
        }
        const totalMultLine =
            "<p class=\"asc-black-hole__stats asc-black-hole__total-mult\">" + esc(getTotalProductionMultLabelForPanel()) + ": <strong>×" + esc(multStr) + "</strong></p>";
        return (
            "<section class=\"asc-black-hole" + panelExtraClass + "\" aria-label=\"" + esc(panelAria) + "\">" +
            "<h4 class=\"asc-black-hole__title\">" + esc(panelTitle) + "</h4>" +
            body +
            totalMultLine +
            note +
            actions +
            "</section>"
        );
    }
    /** Fingerprint ascend-control copy + affordances for ~1 Hz incremental patch (avoid outerHTML churn). */
    function getNumber1AscendControlLivePatchDigest() {
        const essence = Math.floor(Number(number1AscensionEssence) || 0);
        if (!number1HasAscended) {
            return "pre|" + unlockedHands + "|" + totalChanges + "|" + essence + "|rt|" + getNumber1AscensionRunDurationSecForUi();
        }
        const ph = getBlackHolePhase();
        if (ph === 7) {
            return "p7|" + totalChanges + "|" + unlockedHands + "|" + essence + "|rt|" + getNumber1AscensionRunDurationSecForUi();
        }
        const req = getNumber1AscensionRequiredHands();
        if (!isNumber1AscensionReady()) {
            return "nr|" + totalChanges + "|" + unlockedHands + "|" + req + "|" + ASCENSION_1_REQUIRED_TOTAL + "|" + essence + "|rt|" + getNumber1AscensionRunDurationSecForUi();
        }
        const g = computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal());
        return (
            "r|" + g.finalGain + "|" + g.baseGain + "|" + g.pendingBonus + "|" + g.blackHolePhaseMult + "|" + g.beforeMult + "|" + g.clapMult + "|" +
            g.blackHoleMultiplierBonus + "|" + g.multiplierBonus + "|rt|" + g.runDurationSec + "|rtp|" + Math.floor(g.runTimeMultPct)
        );
    }
    function renderNumber1AscendControlHtml(livePatchDigest) {
        const ready = isNumber1AscensionReady();
        const esc = escapeAscensionHtml;
        const digestAttr =
            typeof livePatchDigest === "string" && livePatchDigest.length > 0
                ? " data-live-patch-digest=\"" + esc(livePatchDigest) + "\""
                : "";
        const requiredHands = getNumber1AscensionRequiredHands();
        const runDurationSec = getNumber1AscensionRunDurationSecForUi();
        const gainInfo = ready ? computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal()) : null;
        const runTimeMultPct = gainInfo ? gainInfo.runTimeMultPct : getNumber1AscensionRunTimeMultPct(runDurationSec);
        const runTimeBannerHtml = buildAscensionRunTimeBannerHtml({ runDurationSec, runTimeMultPct, esc });
        const gainText = gainInfo ? formatCount(gainInfo.finalGain) : "0";
        const gainFormulaText = gainInfo
            ? " Formula: base " + formatCount(gainInfo.baseGain) +
                (gainInfo.pendingBonus > 0 ? " + warp bonus " + formatCount(gainInfo.pendingBonus) : "") +
                (gainInfo.blackHoleMultiplierBonus > 0 ? " + " + getArcEssenceMultiplierBonusPhraseLower() + " " + formatCount(gainInfo.blackHoleMultiplierBonus) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)" : "") +
                " × run time " +
                gainInfo.runTimeMultPct.toFixed(1) +
                "%" +
                (gainInfo.runTimeMultBonus !== 0 ? " (" + (gainInfo.runTimeMultBonus > 0 ? "+" : "") + formatCount(gainInfo.runTimeMultBonus) + ")" : "") +
                (gainInfo.multiplierBonus > 0 ? " + clap mult " + formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)" : "") +
                " = " + gainText + "."
            : "";
        const requirementText = ready
            ? "Ready now: ascend Number 1 for " + gainText + " Ascension Essence." + gainFormulaText
            : "Not ready: reach " + formatCount(ASCENSION_1_REQUIRED_TOTAL) + " total and " + requiredHands + " hand" + (requiredHands === 1 ? "" : "s") + ". Current: " + formatCount(totalChanges) + " total, " + unlockedHands + "/" + requiredHands + " hands.";
        return (
            "<section" + digestAttr + " class=\"ascension-run-action" + (ready ? " ascension-run-action--ready" : "") + "\" aria-label=\"Number 1 ascend action\">" +
            runTimeBannerHtml +
            "<div class=\"ascension-run-action__copy\">" +
            "<strong class=\"ascension-run-action__title\">Number 1 Ascension</strong>" +
            "<span class=\"ascension-run-action__status\">" + esc(requirementText) + "</span>" +
            "</div>" +
            "<button type=\"button\" class=\"page-btn ascend-number-btn ascension-run-action__btn\" data-number=\"1\"" + (ready ? "" : " disabled aria-disabled=\"true\"") + ">Ascend now</button>" +
            "</section>"
        );
    }
    function renderAscensionUpgradesHtml() {
        if (!number1HasAscended) {
            return "<section class=\"ascension-placeholder\"><strong>Ascension map locked.</strong><br>Complete your first Number 1 ascension to unlock the permanent skill map.</section>";
        }
        const esc = escapeAscensionHtml;
        const s = ascensionPurchasedSet();
        const collapseActive = isAscensionMapCollapseTransitionActive();
        const hideAscensionSkillMap = isBlackHoleArcUnlocked() && getBlackHolePhase() >= 1 && !collapseActive;
        let respecRow = "";
        if (!hideAscensionSkillMap && !collapseActive) {
            const respecBtn = "<button type=\"button\" class=\"page-btn ascension-respec-btn\" data-asc-respec=\"1\"" + (number1AscensionNodeIds.length === 0 ? " disabled" : "") + ">Respec all</button>";
            const fingerRespecs = ASCENSION_FINGER_KEYS.map(fk => {
                const has = ascensionFingerHasPurchasedNodes(fk);
                return "<button type=\"button\" class=\"page-btn asc-tree-respec-btn\" data-asc-respec-finger=\"" + esc(fk) + "\"" + (has ? "" : " disabled") + " title=\"" + esc(ASCENSION_FINGER_RESPEC_LABELS[fk] || fk) + "\">" + esc(fk.charAt(0).toUpperCase() + fk.slice(1)) + "</button>";
            }).join("");
            respecRow = "<div class=\"ascension-respec-row\"><div class=\"ascension-branch-respecs\">" + fingerRespecs + "</div>" + respecBtn + "</div>";
        }
        let mapAndLegend = "";
        if (!hideAscensionSkillMap || collapseActive) {
            const layout = computeAscensionHandLayout();
            const ascMapVbH = ascMapUi.getAscensionMapViewBoxHeight();
            const handArt = (ASCENSION_TREE_EXPORT && ASCENSION_TREE_EXPORT.HUB_HAND_ART)
                ? String(ASCENSION_TREE_EXPORT.HUB_HAND_ART)
                : (typeof hands1 !== "undefined" && hands1[4] ? String(hands1[4]) : "");
            const nodeDots = ASCENSION_MAP_NODES.map(node => {
                const pt = layout[node.id] || { x: 50, y: 50 };
                const lx = pt.x.toFixed(3);
                const ly = pt.y.toFixed(3);
                const owned = s.has(node.id);
                const prereqOk = ascensionNodePrereqsMet(node.id);
                let stateClass = "asc-map-node--locked";
                if (owned) stateClass = "asc-map-node--owned";
                else if (prereqOk) stateClass = "asc-map-node--available";
                return (
                    "<div class=\"asc-map-node asc-map-node--route-" + esc(node.route) + " " + stateClass + "\" data-asc-vbx=\"" + lx + "\" data-asc-vby=\"" + ly + "\" data-asc-node-id=\"" + esc(node.id) + "\" role=\"button\" aria-label=\"" + esc(node.title) + " — hover for details, click to select and attempt purchase\" tabindex=\"-1\">" +
                    "<div class=\"asc-map-node-pin\" aria-hidden=\"true\"></div></div>"
                );
            }).join("");
            const legend =
                "<ul class=\"asc-map-legend\" aria-label=\"Path colors (left to right on map)\">" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--warp\"></span> Pinky · warp</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--turbo\"></span> Ring · turbo</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--combo\"></span> Middle · combo</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--velocity\"></span> Index · velocity</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--clap\"></span> Thumb · clap</li>" +
                "</ul>";
            mapAndLegend =
                "<div class=\"ascension-map-viewport" + (collapseActive ? " ascension-map-viewport--collapse" : "") + "\" id=\"ascension-map-viewport\">" +
                "<div class=\"ascension-map-detail-panel\" id=\"ascension-map-detail-panel\" aria-live=\"polite\">" +
                "<div class=\"ascension-map-detail-panel-inner\">" +
                "<div class=\"ascension-map-detail-kicker\" id=\"ascension-map-detail-kicker\"></div>" +
                "<div class=\"ascension-map-detail-title\" id=\"ascension-map-detail-title\"></div>" +
                "<div class=\"ascension-map-detail-effect\" id=\"ascension-map-detail-effect\"></div>" +
                "<div class=\"ascension-map-detail-meta\" id=\"ascension-map-detail-meta\"></div>" +
                "</div></div>" +
                "<div class=\"ascension-map-pan-zoom\" id=\"ascension-map-pan-zoom\">" +
                "<div class=\"ascension-map-world" + (collapseActive ? " ascension-map-world--collapse" : "") + "\">" +
                "<pre class=\"ascension-hand-backdrop\" aria-hidden=\"true\">" + esc(handArt) + "</pre>" +
                "<svg class=\"ascension-map-svg\" viewBox=\"0 0 100 " + ascMapVbH + "\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\">" +
                renderAscensionMapColumnGuidesSvg(ascMapVbH) +
                renderAscensionMapEdgesSvg(layout) +
                "</svg>" +
                renderAscensionMapDebugOverlaySvg() +
                "<div class=\"ascension-map-nodes-layer\">" + nodeDots + "</div>" +
                "</div></div></div>" + legend;
        }
        const hubClass =
            "ascension-hub" +
            (hideAscensionSkillMap ? " ascension-hub--mass-arc-active" : "") +
            (!hideAscensionSkillMap && collapseActive ? " ascension-hub--collapse-active" : "") +
            (isBlackHoleArcUnlocked() ? " ascension-hub--bh-arc-first" : "");
        const hubAria = hideAscensionSkillMap
            ? (getBlackHolePhase() <= 1
                ? "Number 1 ascension — skill map complete; numerical mass accumulator"
                : "Number 1 ascension — skill map complete; black hole progression")
            : "Number 1 ascension skill map";
        const hubTitle = hideAscensionSkillMap
            ? "<h4 class=\"ascension-hub-title\"><span class=\"ascension-hub-glyph\" aria-hidden=\"true\">◇</span> Ascension — map complete</h4>"
            : "<h4 class=\"ascension-hub-title\"><span class=\"ascension-hub-glyph\" aria-hidden=\"true\">◇</span> Ascension map</h4>";
        const hubSub = hideAscensionSkillMap
            ? (getBlackHolePhase() <= 1
                ? "<p class=\"ascension-hub-sub\">Every skill gem is owned. Spend Essence in the <strong>Numerical Mass Accumulator</strong> below — the gem map is done.</p>"
                : "<p class=\"ascension-hub-sub\">Every skill gem is owned. Continue below with <strong>black hole</strong> progression — the gem map is done.</p>")
            : (collapseActive
                ? "<p class=\"ascension-hub-sub\">Every branch is complete. Watch the constellation collapse into the singularity.</p>"
                : "<p class=\"ascension-hub-sub\">Five columns — pinky through thumb — lower branch tier at the bottom of each column, rising toward the top. Combo pulse production is split across <strong>hands that satisfy that pattern</strong>. <strong>Respec is free</strong>. <strong>Hover or click a gem</strong> for details; <strong>click</strong> also attempts purchase.</p>");
        const belowMapBlock =
            "<div class=\"ascension-hub-below-map\">" +
            "<p class=\"ascension-hub-sub ascension-hub-sub--grants-intro\">Owned-gem benefits are summarized in grouped lists below the map (complete for every aggregate grant). Gem tooltips remain the source of truth for exact wording.</p>" +
            "<div class=\"ascension-hub-stats\" id=\"ascension-hub-stats\">" + renderAscensionHubStatsPillsHtml() + "</div>" +
            "<div class=\"ascension-hub-grants\" id=\"ascension-hub-grants\" role=\"region\" aria-label=\"Purchased ascension benefits\">" + renderAscensionHubGrantsHtml() + "</div>" +
            "</div>";
        const bhPanel = renderNumber1BlackHolePanelHtml();
        const hubBodyMain = isBlackHoleArcUnlocked()
            ? (bhPanel + mapAndLegend + belowMapBlock)
            : (mapAndLegend + belowMapBlock + bhPanel);
        return (
            "<section class=\"" + hubClass + "\" aria-label=\"" + esc(hubAria) + "\">" +
            "<header class=\"ascension-hub-header\">" +
            hubTitle +
            hubSub +
            respecRow +
            "</header>" +
            hubBodyMain +
            "</section>"
        );
    }
    function renderAscensionPageHtml() {
        if (ascensionPageActiveNumber === 2 && !isNumber2Unlocked()) ascensionPageActiveNumber = 1;
        return renderAscensionPageShellHtml({
            activeTabNumber: ascensionPageActiveNumber,
            number2TabsUnlocked: isNumber2Unlocked(),
            renderNumber1AscensionBody: () => renderNumber1AscendControlHtml() + renderAscensionUpgradesHtml(),
            renderNumber2AscensionBody: () => number2.renderAscensionShell(),
            renderAscensionFallbackBody: () => renderAscensionUpgradesHtml()
        });
    }
    const NUMBER_MODULES = {
        1: createNumberModule({
            getLabel: () => "Number 1",
            getRatePerSec: () => {
                const cpsPerHand = getRawCpsPerHand();
                const rawCps = cpsPerHand.reduce((a, b) => a + b, 0);
                return rawCps * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult();
            },
            getMilestone: () => {
                const next = longTermObjectives.find(o => !o.achieved) || longTermObjectives[longTermObjectives.length - 1];
                if (!next) return { text: "Complete", pct: 100 };
                const progress = getObjectiveProgressForTotal(next, totalChanges, formatCount);
                return { text: next.text, pct: next.achieved ? 100 : progress.pct };
            },
            isAscensionReady: () => isNumber1AscensionReady(),
            tickBackground: () => {},
            getSaveData: () => ({
                ascensionEssence: number1AscensionEssence,
                ascensionIntroSeen: ascensionNumber1IntroSeen
            }),
            applySaveData: (data) => {
                if (!data || typeof data !== "object") return;
                if (typeof data.ascensionIntroSeen === "boolean") {
                    ascensionNumber1IntroSeen = data.ascensionIntroSeen;
                }
            },
            getOverviewDetails: () => {
                let s = "Essence: " + formatCount(number1AscensionEssence);
                if (getBlackHolePhase() > 0) {
                    const m = getNumber1BlackHoleProductionMult();
                    const ph = getBlackHolePhase();
                    if (ph === 1) {
                        s += " · Numerical mass · ×" + (m >= 10 ? m.toFixed(2) : m.toFixed(3)) + " total run mult";
                    } else {
                        s += " · Black hole P" + ph + " ×" + (m >= 10 ? m.toFixed(2) : m.toFixed(3)) + " (mass " + Math.floor(number1BlackHoleState.phase2Mass || 0) + ")";
                    }
                }
                return s;
            }
        }),
        2: createNumberModule(createNumber2ModuleDefinition(number2, number2State, {
            isUnlocked: () => isNumber2Unlocked(),
            formatCount
        }))
    };
    function getUnlockedNumberModules() {
        return Array.from(unlockedNumbers).map(n => ({ number: n, module: NUMBER_MODULES[n] })).filter(x => !!x.module);
    }
    function tickBackgroundNumberModules(dtSec) {
        const mode = typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1;
        getUnlockedNumberModules().forEach(entry => {
            if (entry.number === 1) {
                if (mode !== 1) tickNumber1BackgroundCps(dtSec);
                return;
            }
            if (entry.number === 2 && mode === 2) return;
            entry.module.tickBackground(dtSec);
        });
    }
    function buildGlobalOverviewCardsForHtml() {
        return getUnlockedNumberModules().map(entry => {
            const m = entry.module;
            const milestone = m.getMilestone();
            const ascensionReady = m.isAscensionReady();
            const gainPreviewInfo = entry.number === 1 && ascensionReady
                ? computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal())
                : null;
            let gainPreview = null;
            if (gainPreviewInfo) {
                gainPreview = {
                    finalGain: gainPreviewInfo.finalGain,
                    blackHoleMultiplierBonus: gainPreviewInfo.blackHoleMultiplierBonus,
                    multiplierBonus: gainPreviewInfo.multiplierBonus,
                    arcEssenceMultiplierBonusTitle: getArcEssenceMultiplierBonusPhraseTitle()
                };
            }
            return {
                number: entry.number,
                label: m.getLabel(),
                milestone,
                ascensionReady,
                ratePerSec: m.getRatePerSec(),
                details: m.getOverviewDetails(),
                number1Ascension: entry.number === 1 ? {
                    ascensionEssence: number1AscensionEssence,
                    ascensionRequiredTotal: ASCENSION_1_REQUIRED_TOTAL,
                    ascensionRequiredHands: getNumber1AscensionRequiredHands(),
                    hasAscended: number1HasAscended,
                    gainPreview
                } : null,
                number2Ascension: entry.number === 2 ? {
                    started: number2State.started,
                    luckAscensionEssence: number2State.ascensionEssence || 0,
                    ascensionGateTotal: NUMBER2_ASCENSION_READY_TOTAL
                } : null
            };
        });
    }
    function renderGlobalOverview() {
        return renderNumber1GlobalOverviewHtml({
            formatCount,
            getOverviewCards: buildGlobalOverviewCardsForHtml
        });
    }
    function renderMessageLogPageHtml() {
        return logTickerRt.renderMessageLogPageHtml(escapeHtml);
    }
    function renderStoryArchiveHtml() {
        return renderStoryArchiveHtmlForState(STORY_BANNERS, closedBanners, shownBannerIds);
    }
    function renderMessageAndStoryLogPageHtml() {
        return "<section class=\"message-log-section\" aria-label=\"Message Log\">" +
            "<h4 class=\"story-log-heading\">Message Log</h4>" +
            renderMessageLogPageHtml() +
            "</section>" +
            renderStoryArchiveHtml();
    }
    logPanelRefreshDeps.renderMessagesAndStory = renderMessageAndStoryLogPageHtml;
    function refreshStoryArchiveSectionIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || pagePanelEl.dataset.openPageId !== "messages") return;
        const section = pagePanelBodyEl ? pagePanelBodyEl.querySelector(".story-log-section") : null;
        if (section) section.outerHTML = renderStoryArchiveHtml();
    }
    function scrollMessageLogPanelToBottom() {
        const body = document.getElementById("message-log-terminal-body");
        if (body) body.scrollTop = body.scrollHeight;
    }
    function renderComingSoonPoster(heading, bodyHtml) {
        return "<div class=\"coming-soon-poster\" role=\"status\">" +
            "<div class=\"coming-soon-poster-ribbon\" aria-hidden=\"true\">Coming soon</div>" +
            "<h4 class=\"coming-soon-poster-title\">" + heading + "</h4>" +
            "<div class=\"coming-soon-poster-body\">" + bodyHtml + "</div></div>";
    }
    function updatePageButtonUnlocks() {
        if (combinationsPageBtn) {
            const unlocked = unlockedHands >= 2;
            combinationsPageBtn.style.display = unlocked ? "" : "none";
        }
        updateAscensionReadyChrome();
    }
    function refreshMessageLogPanelIfOpen() {
        logTickerRt.refreshMessageLogPanelIfOpen();
    }
    let patchCombinationsPageLiveDom = () => false;
    let renderCombinationsPageHtml = () => "<p class=\"message-log-empty\">Unlock Hand 2 to view combinations.</p>";
    let setComboIndexStatusFilter = function() {};
    let setComboIndexHandsFilter = function() {};
    let resetComboIndexFilters = function() {};
    let refreshCombinationsPanelIfOpen = function() {};
    let markCombinationsPanelOpenedClock = function() {};
    let consumeComboFilterClickDebounced = function() {
        return false;
    };

    function showPagePanel(pageId) {
        if (!pagePanelEl || !pagePanelTitleEl || !pagePanelBodyEl) return;
        teardownAscensionMapPanZoom();
        closeInlineMainStagePanels({ keep: "page" });
        let title = "";
        let bodyHtml = "";
        if (pageId === "achievements") {
            title = "Achievements";
            bodyHtml = renderComingSoonPoster("Achievement boards", "<p>Global and per-number achievement lists, filters, and rewards will live here.</p>" +
                "<p class=\"coming-soon-note\">Until then, <strong>Combo Catalog</strong> details and combo multipliers are on the <strong>Combinations</strong> page.</p>");
        } else if (pageId === "unlocks") {
            title = "Unlocks";
            bodyHtml = renderComingSoonPoster("Unlock atlas", "<p>A full unlock tree (hands, turbo, numbers, and cross-number gates) will be mapped here with clearer progress links.</p>") +
                "<div class=\"coming-soon-sneak-peek\"><p class=\"coming-soon-sneak-title\">Preview — current progression hooks</p><ul>" +
                "<li>Hands 2–10 via total count milestones</li>" +
                "<li>Turbo Boost at " + formatCount(TURBO_UNLOCK_COUNT) + "</li>" +
                "<li>More number modules as they are built</li></ul></div>";
        } else if (pageId === "collectibles") {
            title = "Collectibles";
            bodyHtml = renderComingSoonPoster("Collectibles vault", "<p>Collectibles with unique art, benefits, and cross-number synergies are planned. Each will be earned or unlocked through its own path.</p>");
        } else if (pageId === "messages") {
            title = "Message and Story Log";
            bodyHtml = renderMessageAndStoryLogPageHtml();
        } else if (pageId === "combinations") {
            title = "Combinations";
            bodyHtml = renderCombinationsPageHtml();
        } else if (pageId === "ascension") {
            title = "Ascension";
            bodyHtml = renderAscensionPageHtml();
        } else if (pageId === "overview") {
            title = "Global Overview";
            bodyHtml = renderGlobalOverview();
        } else {
            title = "Global Overview";
            bodyHtml = renderGlobalOverview();
        }
        pagePanelTitleEl.textContent = title;
        pagePanelBodyEl.innerHTML = bodyHtml;
        if (pageId === "ascension") {
            syncPhase1MassFillCssVars();
            syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
        }
        if (pageModalEl) pageModalEl.classList.toggle("page-modal--wide", pageId === "overview" || pageId === "combinations" || pageId === "ascension");
        syncMessageLogScrollContainerMode(pageId);
        pagePanelEl.dataset.openPageId = pageId;
        pagePanelEl.style.display = "block";
        syncInlinePanelsVsGameplay();
        if (pageId === "messages") {
            requestAnimationFrame(() => scrollMessageLogPanelToBottom());
        }
        if (pageId === "combinations") {
            markCombinationsPanelOpenedClock();
            requestAnimationFrame(() => {
                updateEarnedBonusesUI();
                updateComboDiscoveryMilestonePanelIfOpen();
            });
        }
        if (pageId === "ascension" && ascensionPageActiveNumber === 1 && number1HasAscended) {
            requestAnimationFrame(() => initAscensionMapPanZoom());
        }
    }

    /* ---------------------------------------------------------
       SPEED UPGRADE (per-hand) — Region: Speed upgrades
    --------------------------------------------------------- */
    let speedLevel = Array(maxHands).fill(0);
    /** Clap bonus: adds to speed multiplier like purchased levels; does not affect upgrade cost. Resets on ascension. */
    let speedBonusLevel = Array(maxHands).fill(0);
    /** Per-hand digit last frame (1–10) for clap edge detection; -1 = unknown */
    let clapDigitPrevious = Array(maxHands).fill(-1);
    /** Per-hand wall-clock ms (Date.now) until that hand may clap again; 0 = ready */
    let clapCooldownUntilMsByHand = Array(maxHands).fill(0);
    let autoBuyUnlocked = false;
    let autoBuyEnabledByHand = [];
    /** Mutates `target` in place so closures (e.g. upgrade UI `change` handler) keep the same array reference. */
    function copyArrayIntoExisting(target, source, mapValue) {
        target.length = 0;
        if (!Array.isArray(source)) return;
        for (let i = 0; i < source.length; i++) {
            target.push(mapValue ? mapValue(source[i], i) : source[i]);
        }
    }
    const AUTO_BUY_DELAY_SECONDS = 30;
    let devAutoBuyDelaySeconds = null;
    function getAutoBuyDelaySeconds() {
        var base = devAutoBuyDelaySeconds !== null ? devAutoBuyDelaySeconds : AUTO_BUY_DELAY_SECONDS;
        var mult = computeAscensionGrantTotals().autoBuyDelayMult || 1;
        return Math.max(0.05, base * mult);
    }
    let autoBuyCountdownSecondsByHand = [];
    function getEffectiveSpeedLevel(handIndex) {
        return getEffectiveUpgradeLevel(speedLevel[handIndex], speedBonusLevel[handIndex]);
    }
    function getSpeedMultiplier(handIndex) {
        return getSpeedMultiplierForLevel(getEffectiveSpeedLevel(handIndex));
    }
    /** Stable integer key: same effective speed → same bucket (avoids `Math.pow(2, level)` float collisions at high levels). */
    function getHandSpeedSyncBucketKey(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return null;
        return String(getEffectiveSpeedLevel(handIndex));
    }
    function getUpgradeCost(handIndex, nextLevel) {
        const ascSpeed = computeAscensionGrantTotals().speedMult;
        return getSpeedUpgradeCost(nextLevel, getCheapenMultiplier(handIndex), ascSpeed);
    }
    const upgradeContainer = document.getElementById("upgrade-container");
    const speedUpgradesContainerEl = document.getElementById("speed-upgrades-container");
    const upgradeDom = createUpgradeUiController({
        speedUpgradesContainerEl,
        turboScensionPanelEl,
        getUnlockedHands: () => unlockedHands,
        ascensionAutobuyDefaultOnForNewHands,
        autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand,
        getTimeWarpProductionSecondsBonus
    });
    const speedRowRefs = upgradeDom.speedRowRefs;
    /** When autobuy / warp-assist skips per-purchase upgrade DOM, flush once this step (or with the normal throttle). */
    let batchedUpgradeUiFlush = false;
    let handUpgradeDetailTipLogged = false;
    function flashSpeedAutobuyToast(handIndex, text) {
        upgradeDom.flashSpeedAutobuyToast(handIndex, text);
    }
    function ensureSpeedRows() {
        upgradeDom.ensureSpeedRows();
    }
    function shrinkSpeedRowsTo(keepCount) {
        upgradeDom.shrinkSpeedRowsTo(keepCount);
    }

    function getCheapestSpeedUpgrade() {
        let best = null;
        for (let i = 0; i < unlockedHands; i++) {
            if (!autoBuyEnabledByHand[i]) continue;
            const nextLevel = speedLevel[i] + 1;
            const cost = getUpgradeCost(i, nextLevel);
            if ((handEarnings[i] || 0) < cost) continue;
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
    function updateSpeedUpgradeUI() {
        bumpUpgradeEtaSmoothPass();
        if (totalChanges >= 10 && upgradeContainer) {
            upgradeContainer.classList.add("show-upgrade-content");
            if (!handUpgradeDetailTipLogged) {
                handUpgradeDetailTipLogged = true;
                addToLog("Hover or focus a hand to see count and CPS detail.", "tip");
            }
        }
        if (speedUpgradesContainerEl) {
            ensureSpeedRows();
            for (let i = 0; i < unlockedHands; i++) {
                const ref = speedRowRefs[i];
                if (!ref) continue;
                const nextLevel = speedLevel[i] + 1;
                const cost = getUpgradeCost(i, nextLevel);
                const balance = handEarnings[i] || 0;
                const canAfford = balance >= cost;
                const bonusB = speedBonusLevel[i] || 0;
                const effLv = getEffectiveSpeedLevel(i);
                const currentMult = getSpeedMultiplierForLevel(effLv);
                const nextMult = getSpeedMultiplierForLevel(effLv + 1);
                const percent = currentMult > 0 ? (nextMult / currentMult - 1) * 100 : 0;
                const sl = speedLevel[i] ?? 0;
                if (ref.speedLevelEl) {
                    if (sl === 0 && bonusB === 0) {
                        ref.speedLevelEl.innerHTML = "";
                        ref.speedLevelEl.classList.add("upgrade-btn-level--hidden");
                    } else {
                        ref.speedLevelEl.classList.remove("upgrade-btn-level--hidden");
                        ref.speedLevelEl.innerHTML = String(sl) + (bonusB > 0 ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusB + "</span>" : "");
                    }
                }
                const labelEl = ref.btn && ref.btn.querySelector(".upgrade-btn-label");
                if (labelEl) labelEl.textContent = sl > 0 || bonusB > 0 ? "" : "Upgrade";
                ref.btn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.btn, progress);
                ref.btn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                ref.btn.classList.remove("upgrade-btn-maxed");
                setUpgradeTooltipText(ref.btn, "Base level: " + speedLevel[i] + "\nBonus (clap): " + bonusB + "\nEffective: " + effLv + "\nBalance/Cost: " + formatCount(balance) + " / " + formatCount(cost) + "\nEffect next: +" + percent.toFixed(1) + "%" + formatUpgradeAffordEtaLine(balance, cost, i));
                if (ref.autobuyToggleEl) {
                    ref.autobuyToggleEl.checked = !!autoBuyEnabledByHand[i];
                    ref.autobuyToggleEl.disabled = !autoBuyUnlocked;
                    const autobuyStack = ref.autobuyToggleEl.closest(".speed-autobuy-stack");
                    if (autobuyStack) autobuyStack.style.visibility = (totalChanges >= 100 || autoBuyUnlocked) ? "visible" : "hidden";
                }
                if (ref.autobuyMessageEl) {
                    if (!autoBuyUnlocked || !autoBuyEnabledByHand[i]) {
                        ref.autobuyMessageEl.textContent = "";
                        ref.autobuyMessageEl.classList.remove("speed-autobuy-message--urgent");
                    } else if ((autoBuyCountdownSecondsByHand[i] || 0) > 0) {
                        const secLeft = Math.ceil(autoBuyCountdownSecondsByHand[i]);
                        ref.autobuyMessageEl.textContent = secLeft + "s";
                        ref.autobuyMessageEl.classList.toggle("speed-autobuy-message--urgent", secLeft <= 3);
                    } else {
                        ref.autobuyMessageEl.textContent = "Unaffordable";
                        ref.autobuyMessageEl.classList.remove("speed-autobuy-message--urgent");
                    }
                }
            }
        }

        if (totalChanges >= 100) autoBuyUnlocked = true;
        updateHandUpgradeScrollHint();
    }

    const scrollHintTimeWarpApi = {
        handContributesToScrollHint(handIndex) {
            return handIndex >= 0 && handIndex < unlockedHands;
        },
        handContributesTimeWarpPriority(_handIndex) {
            return 0;
        },
        handHasActiveTimeWarpAura() {
            return false;
        }
    };
    const n1UpgradeScrollHintBoot = createN1UpgradeScrollHint({
        upgradeScrollHintEl: document.getElementById("upgrade-scroll-hint"),
        upgradeScrollHintMessagesEl: document.getElementById("upgrade-scroll-hint-messages"),
        upgradeScrollHintJumpsEl: document.getElementById("upgrade-scroll-hint-jumps"),
        getUnlockedHands: () => unlockedHands,
        getTotalChanges: () => totalChanges,
        getHandEarning: i => handEarnings[i] || 0,
        getSpeedLevel: () => speedLevel,
        getUpgradeCost,
        getCheapenSectionUnlocked: () => cheapenSectionUnlocked,
        getCheapenLevel: () => cheapenLevel,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        isSlowdownUnlocked,
        getSlowdownLevel: () => slowdownLevel,
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        getAutoBuyUnlocked: () => autoBuyUnlocked,
        getAutoBuyEnabledByHand: i => !!autoBuyEnabledByHand[i],
        getAutoBuyCountdownSecondsByHand: i => autoBuyCountdownSecondsByHand[i] || 0,
        getSpeedRowRefs: () => speedRowRefs,
        getTimeWarpScrollHintApi: () => scrollHintTimeWarpApi
    });
    const {
        updateHandUpgradeScrollHint,
        scheduleHandUpgradeScrollHintUpdate,
        handScrollHintHasUpgradeReason
    } = n1UpgradeScrollHintBoot;

    /** Phase 2: replace no-op placeholders with boot exports once all deps exist (see createNumber1SpeedUpgradeBoot below). */
    let buySpeedUpgradeForHand = function() {};
    let maybeAutoBuySpeedUpgrade = function() {};

    /* ---------------------------------------------------------
       CHEAPEN SPEED UPGRADE (per-hand), max 10 per hand (base; ascension adds). 99%, 99.9%, ...
    --------------------------------------------------------- */
    let cheapenLevel = Array(maxHands).fill(0);
    let cheapenBonusLevel = Array(maxHands).fill(0);
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
    /** Dev: when false, combos do not call addTurboBoostMeter (BH Ergosphere passive fill still runs). */
    let devComboTurboFillFromCombosEnabled = true;
    let cheapenAutoBuyCountdownByHand = [];
    let devSlowdownAutobuyOn = false;
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
    let slowdownLevel = Array(maxHands).fill(0);
    let slowdownBonusLevel = Array(maxHands).fill(0);
    let slowdownUnlockLogged = false;
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
        return slowdownCompactionUnlockedLatched;
    }
    let buySlowdownUpgradeForHand = function() {};

    /* ---------------------------------------------------------
       TIME WARP (per-hand aura), unlock at 1e18.
       Random aura every 0–60s span (see spawn mult). Manual click grants 10× (60s or ascension-boosted seconds) of that hand's effective rate; Pinky Warp Potency can multiply manual clicks when the aura idles (overflow unchanged).
       If all hands already have aura, auto-grant 25% value to a random hand.
    --------------------------------------------------------- */
    let timeWarpAuraActiveByHand = [];
    /** Wall-clock ms when each hand’s aura appeared (0 if inactive); used for Warp Potency (manual only). */
    let timeWarpAuraAppearedAtMsByHand = [];
    let timeWarpNextSpawnInSec = 0;
    let timeWarpUnlockLogged = false;

    /* RATE DISPLAY and TICK INTERVAL (per-hand CPS + tick interval; n1-rate-display-ui consumes bridges). */
    const {
        getTickIntervalMs,
        getHandPerHandRawCps,
        getHandBaseCpsBeforeSlowdownMult,
        getHandSlowdownFactorForDisplay,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandEffectiveCps,
        getTotalRawCpsSum,
        getInstantTotalCps,
        getRawCpsPerHand
    } = createNumber1RateTickBoot({
        getUnlockedHands: () => unlockedHands,
        getHands: () => hands,
        getSpeedMultiplier,
        getSlowdownMultiplier,
        formatCount,
        getComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        isSlowdownUnlocked,
        getTurboBoostUnlocked: () => turboBoostUnlocked
    });
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
        renderComboPagePerHandStatusSectionHtml,
        refreshCombinationsHandStatusIfOpen
    } = createComboHandStatusUi({
        pagePanelEl,
        pagePanelTitleEl,
        getUnlockedHands: () => unlockedHands,
        getHandEarning: i => handEarnings[i] || 0,
        getHandBaseCpsBeforeSlowdownMult,
        getHandPerHandRawCps,
        getHandEffectiveCps,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandSlowdownFactorForDisplay,
        formatCount,
        formatCpsForDisplay: formatCpsForDisplay(formatCount)
    });
    const { updateN1GravityCpsStrip, updateHandStatusBlocks, updateRateDisplay } = createRateDisplayUi({
        n1GravityCpsStripEl,
        phase1EssenceTarget: BLACK_HOLE_PHASE1_ESSENCE_TARGET,
        getBlackHolePhase,
        isBlackHoleArcUnlocked,
        getNumber1BlackHoleState: () => number1BlackHoleState,
        getBlackHolePhase1RunCpsMult,
        formatBlackHolePhase1CpsMultForUi,
        getBlackHoleTotalMult,
        getBlackHoleFurnaceMult,
        getUnlockedHands: () => unlockedHands,
        getHandPerHandRawCps,
        getComboMultiplier,
        getPatternCatalogMultiplier,
        getAscensionComboPatternMult,
        getTurboCountMultiplier,
        getTurboCountMultiplierFromMeter,
        getNumber1BlackHoleProductionMult,
        getInstantTotalCps,
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        getTurboBoostEnabled: () => turboBoostEnabled,
        getGravityStackTooltipPhrase,
        bonusMultiplierEl,
        turboMultiplierDisplayEl,
        incrementalRateEl,
        formatCount,
        formatCompactMultiplier,
        formatTurboBoostMultiplierForDisplay,
        getSpeedRowRefs: () => speedRowRefs,
        getHandEarning: i => handEarnings[i] || 0,
        getHandBaseCpsBeforeSlowdownMult,
        getHandSlowdownFactorForDisplay,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandEffectiveCps,
        formatCount,
        formatCpsForDisplay: formatCpsForDisplay(formatCount),
        refreshCombinationsHandStatusIfOpen,
        scheduleFitTopCountRow
    });
    rateDisplayUiRef.updateRateDisplay = updateRateDisplay;
    rateDisplayUiRef.updateN1GravityCpsStrip = updateN1GravityCpsStrip;

    const n1UrtSlowMo = wireNumber1SlowdownCheapenSpeedAndTimeWarpBoots({
        getBlackHolePhase,
        getUnlockedHands: () => unlockedHands,
        getHandEarnings: i => handEarnings[i] || 0,
        getSlowdownLevel: () => slowdownLevel,
        getSlowdownBonusLevel: () => slowdownBonusLevel,
        getSlowdownAutoBuyCountdownByHand: () => slowdownAutoBuyCountdownByHand,
        setSlowdownAutoBuyCountdown: (i, v) => {
            slowdownAutoBuyCountdownByHand[i] = v;
        },
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        isSlowdownUnlocked,
        getDevSlowdownAutobuyOn: () => devSlowdownAutobuyOn,
        ascensionAutobuyIncludesSlowdown,
        getAutoBuyUnlocked: () => autoBuyUnlocked,
        getAutoBuyEnabledByHand: i => !!autoBuyEnabledByHand[i],
        setHandEarningBalance: (i, b) => {
            handEarnings[i] = b;
        },
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl: () => incrementalEl,
        formatCount,
        getTotalChanges: () => totalChanges,
        addToLog,
        setSlowdownBaseLevel: (i, v) => {
            slowdownLevel[i] = v;
        },
        resetSpeedLevelForCompaction: i => {
            speedLevel[i] = 0;
        },
        getHands: () => hands,
        getSpeedRowRefs: () => speedRowRefs,
        sprayConfettiFrom,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        formatUpgradeAffordEtaLine,
        flashSpeedAutobuyToast,
        setBatchedUpgradeUiFlush: v => {
            batchedUpgradeUiFlush = v;
        },
        updateSpeedUpgradeUI,
        updateRateDisplay,
        updateHandUpgradeScrollHint,
        getAutoBuyDelaySeconds,
        getSlowdownUnlockLogged: () => slowdownUnlockLogged,
        setSlowdownUnlockLogged: v => {
            slowdownUnlockLogged = v;
        },
        getCheapenLevel: () => cheapenLevel,
        getCheapenBonusLevel: () => cheapenBonusLevel,
        getCheapenSectionUnlocked: () => cheapenSectionUnlocked,
        setCheapenSectionUnlocked: v => {
            cheapenSectionUnlocked = v;
        },
        getCheapenAutoBuyCountdownByHand: () => cheapenAutoBuyCountdownByHand,
        setCheapenAutoBuyCountdown: (i, v) => {
            cheapenAutoBuyCountdownByHand[i] = v;
        },
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        getDevCheapenAutobuyOn: () => devCheapenAutobuyOn,
        ascensionAutobuyIncludesCheapen,
        getCheapenEffectText,
        setCheapenBaseLevel: (i, v) => {
            cheapenLevel[i] = v;
        },
        ensureSpeedRows,
        getSpeedLevel: () => speedLevel,
        getUpgradeCost,
        incrementSpeedLevel: i => {
            speedLevel[i]++;
        },
        restartAllHandTimers: () => hands.forEach(h => h.restartTimer()),
        setSpeedAutobuyCountdown: (i, v) => {
            autoBuyCountdownSecondsByHand[i] = v;
        },
        getAutoBuyCountdownSecondsByHand: i => autoBuyCountdownSecondsByHand[i] || 0,
        computeAscensionGrantTotals,
        getHandPerHandRawCps,
        getTimeWarpComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        scheduleObjectiveDomFlush: () => number1ObjectivesBoot.scheduleObjectiveDomFlush(),
        updateMilestoneUI,
        scheduleHandUpgradeScrollHintUpdate,
        handScrollHintHasUpgradeReason,
        getNumber1HasAscended: () => number1HasAscended,
        getAscensionPendingBonusEssence: getNumber1AscensionPendingBonusEssence,
        setAscensionPendingBonusEssence: v => {
            number1AscensionPendingBonusEssence = v;
        },
        refreshOverviewAndAscensionHubLiveIfOpen,
        autosaveNow,
        getTimeWarpAuraActiveByHand: () => timeWarpAuraActiveByHand,
        setTimeWarpAuraActiveByHand: v => {
            timeWarpAuraActiveByHand = v;
        },
        getTimeWarpAuraAppearedAtMsByHand: () => timeWarpAuraAppearedAtMsByHand,
        setTimeWarpAuraAppearedAtMsByHand: v => {
            timeWarpAuraAppearedAtMsByHand = v;
        },
        getTimeWarpNextSpawnInSec: () => timeWarpNextSpawnInSec,
        setTimeWarpNextSpawnInSec: v => {
            timeWarpNextSpawnInSec = v;
        },
        getTimeWarpUnlockLogged: () => timeWarpUnlockLogged,
        setTimeWarpUnlockLogged: v => {
            timeWarpUnlockLogged = v;
        },
        flushAutobuyDeferredTotalsIfAny,
        scrollHintTimeWarpApi
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
    } = n1UrtSlowMo;
    number1TimeWarpBoot = n1UrtSlowMo.number1TimeWarpBoot;
    updateTimeWarpAuraUI = n1UrtSlowMo.updateTimeWarpAuraUI;
    buySpeedUpgradeForHand = n1UrtSlowMo.number1SpeedUpgradeBoot.buySpeedUpgradeForHand;
    maybeAutoBuySpeedUpgrade = n1UrtSlowMo.number1SpeedUpgradeBoot.maybeAutoBuySpeedUpgrade;
    buyCheapenUpgradeForHand = n1UrtSlowMo.number1CheapenBoot.buyCheapenUpgradeForHand;
    maybeAutoBuyCheapen = n1UrtSlowMo.number1CheapenBoot.maybeAutoBuyCheapen;
    updateCheapenUpgradeUI = n1UrtSlowMo.number1CheapenBoot.updateCheapenUpgradeUI;
    buySlowdownUpgradeForHand = n1UrtSlowMo.number1SlowdownBoot.buySlowdownUpgradeForHand;
    maybeAutoBuySlowdown = n1UrtSlowMo.number1SlowdownBoot.maybeAutoBuySlowdown;
    updateSlowdownUpgradeUI = n1UrtSlowMo.number1SlowdownBoot.updateSlowdownUpgradeUI;

    /* ---------------------------------------------------------
       TURBO BOOST (unlocks at 1T; gauge to right of total count)

       Design goals:
       - Meter is fueled by repeatable hand combos (after unlock).
       - Turbo can be toggled On/Off. Off: meter can grow, but no bonus and no burn.
       - On: count multiplier is burn-driven (Turbo-scension Burn + base rate); tank fullness and size
         scale how much of that ceiling you get; a larger full tank runs hotter for longer. Drain uses a
         piecewise curve so burn slows as the meter nears empty.

       Balance knobs:
       - Combo → meter points (`getTurboComboPoints`; Turbo-scension Fill doubles this and passive sustain feed per level)
       - Nominal burn rate → boost shape (`getTurboBurnIntensityRatio`, exponent)
       - Ring Mult cap (`getTurboCountMultiplierMax`), tank fullness × tank-size peak (`TURBO_TANK_PEAK_*`)
       - Piecewise drain floor / exponent (`TURBO_DRAIN_*`), Burn Efficiency ascension
       - Ring sustain: extra combo→meter mult, drain mult, Off-only fill mult, passive meter/sec while On (Fill scales passive regen too)
    --------------------------------------------------------- */
    function getTurboScensionActivationCost() {
        return getTurboScensionActivationCostFromTotals(computeAscensionGrantTotals());
    }
    /** Independent random Burn/Tank/Mult/Fill rolls per Upgrade click (1 base + ascension extras). */
    function getTurboScensionUpgradeRollCount() {
        return getTurboScensionUpgradeRollCountFromTotals(computeAscensionGrantTotals());
    }

    let turboBoostMeter = 0;
    let turboBoostUnlocked = false;
    let turboBoostEnabled = false;
    let turboActivationCount = 0;
    /** Turbo Leveler (Ring): overflow combo fill while Turbo off + full meter → bank; spend for random scension levels. */
    let turboLevelerBank = 0;
    let turboLevelerPurchases = 0;
    /** Patched after {@link createNumber1TurboBoot}; stubs keep earlier handlers valid. */
    let tryUnlockTurboIfEligible = () => {};
    /** Patched after turbo boot — sync gauge toggle when simulation forces Turbo Off (empty meter). */
    let syncTurboBoostToggleDomFromBoot = () => {};

    // Converts combo size (minHands) into meter points.
    // Current mapping uses an exponential curve: points = base^(minHands-offset)
    function getTurboScensionFillMult() {
        return getTurboScensionFillMultForLevel(turboScensionFillLevel);
    }
    function getTurboComboPoints(minHands) {
        return getTurboComboPointsForMinHands(minHands, computeAscensionGrantTotals(), turboScensionFillLevel);
    }

    function getTurboNominalBurnPerSec() {
        return getTurboNominalBurnPerSecFromState(computeAscensionGrantTotals(), turboScensionBurnLevel);
    }
    /** Burn-driven boost, scaled by tank fullness and (when full) larger tanks hit harder. */
    function getTurboBoostMultiplierFromState() {
        return getTurboBoostMultiplierFromTurboState({
            meter: turboBoostMeter,
            meterMax: getTurboMeterMax(),
            curveScale: getTurboMeterCurveScale(),
            nominalBurnPerSec: getTurboNominalBurnPerSec(),
            multiplierMax: getTurboCountMultiplierMax()
        });
    }
    // Applied turbo multiplier. If turbo is toggled Off, this returns 1× (no effect).
    function getTurboCountMultiplier() {
        if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return 1;
        return getTurboBoostMultiplierFromState();
    }
    // Display-only: potential multiplier from current meter (even if toggle Off).
    function getTurboCountMultiplierFromMeter() {
        if (!turboBoostUnlocked || turboBoostMeter <= 0) return 1;
        return getTurboBoostMultiplierFromState();
    }

    const TURBO_GAIN_POPUP_DURATION_MS = 1000;

    // Small, short-lived "+N" popup near the turbo gauge when meter increases.
    // Positioned with slight randomness so multiple gains don't overlap perfectly.
    function showTurboGainPopup(points) {
        const container = document.getElementById("turbo-gain-popup-container");
        const gaugeEl = turboBoostGaugeEl;
        const wrapEl = turboBoostWrapEl;
        if (!container || !gaugeEl || !wrapEl || points <= 0) return;
        const popup = document.createElement("div");
        popup.className = "turbo-gain-popup";
        popup.textContent = formatSignedCountGain(points);
        const gaugeRect = gaugeEl.getBoundingClientRect();
        const wrapRect = wrapEl.getBoundingClientRect();
        const offsetX = (Math.random() - 0.5) * 56;
        const offsetY = (Math.random() - 0.5) * 20;
        popup.style.left = (gaugeRect.left - wrapRect.left + offsetX) + "px";
        popup.style.top = (gaugeRect.top - wrapRect.top + offsetY) + "px";
        container.appendChild(popup);
        setTimeout(() => {
            popup.classList.add("turbo-gain-popup-gone");
            setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 350);
        }, TURBO_GAIN_POPUP_DURATION_MS);
    }

    function isTurboLevelerMode() {
        return turboBoostUnlocked && isTurboScensionUnlocked() && !!computeAscensionGrantTotals().turboLeveler && !turboBoostEnabled;
    }
    function getTurboLevelerNextPointCost() {
        return getTurboLevelerNextPointCostForPurchases(turboLevelerPurchases);
    }
    /** Spend bank on random Burn/Tank/Mult/Fill while Turbo is off (Turbo Leveler grant). */
    function tryTurboLevelerPurchases() {
        if (!turboBoostUnlocked || !isTurboScensionUnlocked() || !computeAscensionGrantTotals().turboLeveler) return;
        if (turboBoostEnabled) return;
        let any = false;
        let nextCost = getTurboLevelerNextPointCost();
        while (turboLevelerBank >= nextCost) {
            turboLevelerBank -= nextCost;
            turboLevelerPurchases++;
            const axis = applyOneTurboScensionRandomLevel();
            const labels = ["Burn rate", "Boost tank", "Boost multiplier", "Meter fill"];
            const now = axis === 0 ? turboScensionBurnLevel : axis === 1 ? turboScensionTankLevel : axis === 2 ? turboScensionMultLevel : turboScensionFillLevel;
            addToLog("Turbo Leveler: +1 " + labels[axis] + " (now level " + now + ").", "system");
            turboBoostMeter = Math.min(turboBoostMeter, getTurboMeterMax());
            any = true;
            nextCost = getTurboLevelerNextPointCost();
        }
        if (any) {
            markMeaningfulProgress();
            updateTurboBoostUI({ force: true });
            updateRateDisplay();
            autosaveNow();
        }
    }
    // Adds meter charge (clamped). This does NOT care whether turbo is toggled On;
    // players can still build meter while turbo is Off.
    function addTurboBoostMeter(points) {
        if (!turboBoostUnlocked || points <= 0) return;
        const totals = computeAscensionGrantTotals();
        if (!turboBoostEnabled) {
            points *= (totals.turboOffMeterFillMult || 1);
        }
        const maxM = getTurboMeterMax();
        const prev = turboBoostMeter;
        let popupPts = points;
        if (isTurboLevelerMode()) {
            const space = Math.max(0, maxM - turboBoostMeter);
            const toMeter = Math.min(points, space);
            if (toMeter > 0) turboBoostMeter = Math.min(maxM, turboBoostMeter + toMeter);
            popupPts = toMeter;
            const overflow = points - toMeter;
            if (overflow > 0 && turboBoostMeter >= maxM - 1e-12) {
                turboLevelerBank += overflow;
                tryTurboLevelerPurchases();
            }
        } else {
            turboBoostMeter = Math.min(maxM, turboBoostMeter + points);
        }
        if (turboBoostMeter > prev && turboBoostFillEl) {
            showTurboGainPopup(popupPts > 0 ? popupPts : points);
            turboBoostFillEl.classList.remove("turbo-boost-fill-gain");
            void turboBoostFillEl.offsetWidth;
            turboBoostFillEl.classList.add("turbo-boost-fill-gain");
            setTimeout(() => turboBoostFillEl.classList.remove("turbo-boost-fill-gain"), 400);
        }
        updateTurboBoostUI({ force: true });
    }

    // Burns meter while turbo is actively applying a multiplier (toggle On).
    // Also auto-switches the toggle Off when the meter hits 0.
    function updateTurboBurn(dtSec) {
        if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return;
        const meterMax = getTurboMeterMax();
        const totals = computeAscensionGrantTotals();
        const drain = getTurboBurnDrainForStep(dtSec, {
            meter: turboBoostMeter,
            meterMax,
            nominalBurnPerSec: getTurboNominalBurnPerSecFromState(totals, turboScensionBurnLevel),
            totals
        });
        turboBoostMeter = Math.max(0, turboBoostMeter - drain);
        if (turboBoostMeter <= 0) {
            turboBoostEnabled = false;
            syncTurboBoostToggleDomFromBoot(false);
            updateRateDisplay();
        }
        if (drain > 0 && turboBoostGaugeEl) {
            turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning");
            void turboBoostGaugeEl.offsetWidth;
            turboBoostGaugeEl.classList.add("turbo-boost-gauge-burning");
            setTimeout(() => turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning"), 250);
        }
        updateTurboBoostUI({ force: true });
    }

    /** Flat meter per second while Turbo On and meter has charge (Ring sustain nodes). */
    function applyTurboPassiveMeterRegen(dtSec) {
        if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return;
        const rate = computeAscensionGrantTotals().turboPassiveMeterPerSec || 0;
        if (!(rate > 0) || !(dtSec > 0)) return;
        const maxM = getTurboMeterMax();
        if (turboBoostMeter >= maxM) return;
        turboBoostMeter = Math.min(maxM, turboBoostMeter + rate * dtSec * getTurboScensionFillMult());
    }

    /** Run whenever `totalChanges` changes so milestone gates cannot desync (load, offline, dev tools, etc.). */
    function syncUnlocksWithTotalCount() {
        checkUnlockHands();
        tryUnlockTurboIfEligible();
        if (totalChanges >= 100) autoBuyUnlocked = true;
        if (totalChanges >= 10 && upgradeContainer) upgradeContainer.classList.add("show-upgrade-content");
        if ((handEarnings[0] || 0) >= 1000 && !cheapenSectionUnlocked) {
            cheapenSectionUnlocked = true;
            ensureSpeedRows();
            updateCheapenUpgradeUI();
        }
        if (isSlowdownUnlocked() && !slowdownUnlockLogged) {
            slowdownUnlockLogged = true;
            addToLog("Compaction unlocked (all hands).", "milestone");
        }
        if (isTimeWarpUnlocked() && !timeWarpUnlockLogged) {
            timeWarpUnlockLogged = true;
            addToLog("Time Warp system unlocked (auras can now appear).", "milestone");
        }
    }

    /** @returns {0|1|2|3} axis: 0 burn, 1 tank, 2 mult, 3 fill */
    function applyOneTurboScensionRandomLevel() {
        const pick = Math.floor(Math.random() * 4);
        if (pick === 0) turboScensionBurnLevel++;
        else if (pick === 1) turboScensionTankLevel++;
        else if (pick === 2) turboScensionMultLevel++;
        else turboScensionFillLevel++;
        return pick;
    }
    function formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill) {
        const labels = ["Burn rate", "Boost tank", "Boost multiplier", "Meter fill"];
        const gained = [gainedBurn, gainedTank, gainedMult, gainedFill || 0];
        const parts = [];
        for (let i = 0; i < 4; i++) {
            const n = gained[i];
            if (n <= 0) continue;
            const now = i === 0 ? turboScensionBurnLevel : i === 1 ? turboScensionTankLevel : i === 2 ? turboScensionMultLevel : turboScensionFillLevel;
            parts.push("+" + n + " " + labels[i] + " (now level " + now + ")");
        }
        return parts.length ? "Turbo-scension: " + parts.join("; ") + "." : "";
    }
    /** Extra sentence(s) for Turbo-scension Upgrade detail tooltip: rough time to afford next purchase in activations. */
    function getTurboScensionUpgradeActivationEtaHint() {
        const cost = getTurboScensionActivationCost();
        const need = cost - turboActivationCount;
        if (need <= 0) return "";
        const perSec = 1000 / GAME_LOOP_MS;
        if (!turboBoostEnabled || turboBoostMeter <= 0) {
            return " Turn Turbo ON with charge in the meter to earn activations (~" + Math.round(perSec) + "/s — one per " + (GAME_LOOP_MS / 1000) + "s tick — only while boost runs). Refill the gauge with combos if it is empty.";
        }
        const secApprox = need / perSec;
        const dur = formatUpgradeAffordEtaDuration(secApprox).replace(/ at current rate/g, "").trim();
        return " Roughly " + dur + " of Turbo runtime at full tick rate to afford this if the meter stays charged (drain slows near empty; an empty meter turns Turbo off).";
    }
    /**
     * @param {object} [opts]
     * @param {boolean} [opts.skipLog] Omit tip log (autobuy).
     * @param {boolean} [opts.skipAutosave] Batch autobuy: caller saves once.
     * @param {boolean} [opts.skipUIUpdate] Batch autobuy: caller refreshes UI once.
     * @returns {boolean} true if a level was purchased
     */
    function tryTurboScensionActivationUpgrade(opts) {
        opts = opts || {};
        if (!isTurboScensionUnlocked() || !turboBoostUnlocked || gameplaySimFrozen()) return false;
        const cost = getTurboScensionActivationCost();
        if (turboActivationCount < cost) return false;
        turboActivationCount -= cost;
        const rolls = getTurboScensionUpgradeRollCount();
        const allAxes = !!computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
        let gainedBurn = 0;
        let gainedTank = 0;
        let gainedMult = 0;
        let gainedFill = 0;
        if (allAxes) {
            for (let r = 0; r < rolls; r++) {
                turboScensionBurnLevel++;
                turboScensionTankLevel++;
                turboScensionMultLevel++;
                turboScensionFillLevel++;
                gainedBurn++;
                gainedTank++;
                gainedMult++;
                gainedFill++;
            }
        } else {
            for (let r = 0; r < rolls; r++) {
                const axis = applyOneTurboScensionRandomLevel();
                if (axis === 0) gainedBurn++;
                else if (axis === 1) gainedTank++;
                else if (axis === 2) gainedMult++;
                else gainedFill++;
            }
        }
        turboBoostMeter = Math.min(turboBoostMeter, getTurboMeterMax());
        markMeaningfulProgress();
        if (!opts.skipUIUpdate) {
            updateTurboBoostUI({ force: true });
            updateRateDisplay();
        }
        if (!opts.skipAutosave) autosaveNow();
        if (!opts.skipLog) {
            const line = formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill);
            if (line) addToLog(line, "system");
        }
        return true;
    }
    let turboBoostUiFullLastMs = 0;
    let turboBoostUiFullDigest = "";
    const TURBO_BOOST_UI_FULL_MIN_MS = 120;
    let turboBoostUiStripLastMeterRounded = NaN;
    let turboBoostUiStripLastMeterMaxRounded = NaN;
    let turboBoostUiStripLastMultStr = "";
    let turboBoostUiStripLastActCount = NaN;
    let turboBoostUiStripLastEnabled = null;
    function computeTurboBoostUiFullDigest() {
        const u = turboBoostUnlocked ? 1 : 0;
        if (!u) return "u0";
        const s = isTurboScensionUnlocked() ? 1 : 0;
        if (!s) return "u1|s0|" + Math.round(getTurboMeterMax());
        const actCost = getTurboScensionActivationCost();
        const grants = computeAscensionGrantTotals();
        return [
            "u1|s1",
            Math.round(Number(turboScensionBurnLevel) || 0),
            Math.round(Number(turboScensionTankLevel) || 0),
            Math.round(Number(turboScensionMultLevel) || 0),
            Math.round(Number(turboScensionFillLevel) || 0),
            actCost,
            turboActivationCount,
            getTurboScensionUpgradeRollCount(),
            grants.turboScensionAllAxesUpgrade ? 1 : 0,
            grants.turboLeveler ? 1 : 0,
            grants.turboLeveler ? turboLevelerBank : 0,
            grants.turboLeveler ? getTurboLevelerNextPointCost() : 0,
            Math.round(getTurboMeterMax()),
        ].join("|");
    }
    function paintTurboBoostScisionFull() {
        const showScisionPanel = isTurboScensionUnlocked() && turboBoostUnlocked;
        if (turboScensionPanelEl) {
            turboScensionPanelEl.style.display = showScisionPanel ? "" : "none";
            turboScensionPanelEl.setAttribute("aria-hidden", showScisionPanel ? "false" : "true");
        }
        if (turboRightClusterEl) turboRightClusterEl.classList.toggle("turbo-right-cluster--scision", showScisionPanel);
        if (!showScisionPanel && turboScensionLevelerLineEl) {
            turboScensionLevelerLineEl.style.display = "none";
            turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
        }
        if (showScisionPanel) {
            if (turboScensionBurnLineEl) {
                const lab = turboScensionBurnLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Burn " + Math.round(Number(turboScensionBurnLevel) || 0);
                setUpgradeTooltipText(turboScensionBurnLineEl, TURBO_SCENSION_AXIS_TITLES[0]);
                turboScensionBurnLineEl.removeAttribute("title");
            }
            if (turboScensionTankLineEl) {
                const lab = turboScensionTankLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Tank " + Math.round(Number(turboScensionTankLevel) || 0);
                setUpgradeTooltipText(turboScensionTankLineEl, TURBO_SCENSION_AXIS_TITLES[1]);
                turboScensionTankLineEl.removeAttribute("title");
            }
            if (turboScensionMultLineEl) {
                const lab = turboScensionMultLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Mult " + Math.round(Number(turboScensionMultLevel) || 0);
                setUpgradeTooltipText(turboScensionMultLineEl, TURBO_SCENSION_AXIS_TITLES[2]);
                turboScensionMultLineEl.removeAttribute("title");
            }
            if (turboScensionFillLineEl) {
                const lab = turboScensionFillLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Fill " + Math.round(Number(turboScensionFillLevel) || 0);
                setUpgradeTooltipText(turboScensionFillLineEl, TURBO_SCENSION_AXIS_TITLES[3]);
                turboScensionFillLineEl.removeAttribute("title");
            }
            if (turboScensionUpgradeBtn) {
                const actCost = getTurboScensionActivationCost();
                const can = turboActivationCount >= actCost;
                const rollN = getTurboScensionUpgradeRollCount();
                const allAxes = !!computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
                turboScensionUpgradeBtn.disabled = !can;
                const progress = actCost > 0 ? Math.max(0, Math.min(1, turboActivationCount / actCost)) : 1;
                setUpgradeButtonProgress(turboScensionUpgradeBtn, progress);
                turboScensionUpgradeBtn.classList.toggle("upgrade-btn--afford-pulse", can);
                const spendLine = can
                    ? (allAxes
                        ? "Spend " + formatCount(actCost) + " activations for +" + rollN + " level each on Burn, Tank, Mult, and Fill (all four, no random)."
                        : "Spend " + formatCount(actCost) + " activations for " + rollN + " independent random level" + (rollN === 1 ? "" : "s") + " among Burn, Tank, Mult, or Fill (equal chance per roll).")
                    : ("Need " + formatCount(actCost) + " activations (have " + formatCount(turboActivationCount) + ").");
                const eta = getTurboScensionUpgradeActivationEtaHint();
                const foot = "\n\nHover Burn, Tank, Mult, or Fill above to see what each upgrade type does.";
                setUpgradeTooltipText(turboScensionUpgradeBtn, spendLine + eta + foot);
                turboScensionUpgradeBtn.removeAttribute("title");
            }
            if (turboScensionLevelerLineEl) {
                const tl = computeAscensionGrantTotals().turboLeveler === true;
                if (tl) {
                    turboScensionLevelerLineEl.style.display = "";
                    turboScensionLevelerLineEl.setAttribute("aria-hidden", "false");
                    const next = getTurboLevelerNextPointCost();
                    const lab = turboScensionLevelerLineEl.querySelector(".turbo-scension-level-line-label");
                    if (lab) lab.textContent = "Leveler " + formatTurboScensionLevelDisplay(turboLevelerBank) + " / " + formatTurboScensionLevelDisplay(next) + " pts";
                    setUpgradeTooltipText(turboScensionLevelerLineEl, TURBO_LEVELER_LINE_TOOLTIP);
                    turboScensionLevelerLineEl.removeAttribute("title");
                } else {
                    turboScensionLevelerLineEl.style.display = "none";
                    turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
                }
            }
        }
    }
    function paintTurboBoostMeterStrip() {
        if (!turboBoostWrapEl || !turboBoostUnlocked) return;
        const en = !!turboBoostEnabled;
        if (turboBoostUiStripLastEnabled !== en) {
            turboBoostUiStripLastEnabled = en;
            if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = en;
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = en ? "On" : "Off";
        }
        const meterMax = getTurboMeterMax();
        const pct = Math.min(100, (turboBoostMeter / meterMax) * 100);
        if (turboBoostFillEl) turboBoostFillEl.style.width = pct + "%";
        const mr = Math.round(turboBoostMeter);
        const mmx = Math.round(meterMax);
        if (turboBoostGaugeEl) {
            if (mr !== turboBoostUiStripLastMeterRounded) {
                turboBoostUiStripLastMeterRounded = mr;
                turboBoostGaugeEl.setAttribute("aria-valuenow", mr);
            }
            if (mmx !== turboBoostUiStripLastMeterMaxRounded) {
                turboBoostUiStripLastMeterMaxRounded = mmx;
                turboBoostGaugeEl.setAttribute("aria-valuemax", mmx);
            }
        }
        const multStr = formatTurboBoostMultiplierForDisplay(getTurboCountMultiplierFromMeter());
        if (turboBoostMultiplierEl && multStr !== turboBoostUiStripLastMultStr) {
            turboBoostUiStripLastMultStr = multStr;
            turboBoostMultiplierEl.textContent = multStr;
        }
        if (turboBoostActivationsEl && turboActivationCount !== turboBoostUiStripLastActCount) {
            turboBoostUiStripLastActCount = turboActivationCount;
            turboBoostActivationsEl.textContent = "Activations: " + formatCount(turboActivationCount);
        }
    }
    /**
     * @param {{ force?: boolean }} [opts] force: immediate Turbo-scision pass (purchases, toggle, load).
     */
    function updateTurboBoostUI(opts) {
        opts = opts || {};
        const force = opts.force === true;
        tryUnlockTurboIfEligible();
        const now = Date.now();
        const digest = computeTurboBoostUiFullDigest();
        const paintFull = force || digest !== turboBoostUiFullDigest || now - turboBoostUiFullLastMs >= TURBO_BOOST_UI_FULL_MIN_MS;
        if (paintFull) {
            turboBoostUiFullDigest = digest;
            turboBoostUiFullLastMs = now;
            paintTurboBoostScisionFull();
        }
        paintTurboBoostMeterStrip();
    }

    const number1TurboBoot = createNumber1TurboBoot({
        turboScensionUpgradeBtn,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        setTurboBoostEnabled: v => { turboBoostEnabled = v; },
        tryTurboLevelerPurchases,
        updateTurboBoostUI,
        updateRateDisplay,
        tryTurboScensionActivationUpgrade,
        getTotalChanges: () => totalChanges,
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        onTurboSystemFirstUnlock: () => {
            turboBoostUnlocked = true;
            turboBoostEnabled = false;
        },
        turboBoostWrapEl,
        addToLog,
        formatCount,
        checkStoryBanners: () => forwardCheckStoryBanners()
    });
    tryUnlockTurboIfEligible = number1TurboBoot.tryUnlockTurboIfEligible;
    syncTurboBoostToggleDomFromBoot = number1TurboBoot.syncTurboBoostToggleDom;

    const number1OfflineAdvanceDeps = {
        getSettings: () => settings,
        tickBackgroundNumberModules,
        updateBlackHolePhaseStep,
        getBlackHolePhase,
        setTotalChanges: v => {
            totalChanges = v;
        },
        getTotalChanges: () => totalChanges,
        getNumber1BlackHoleState: () => number1BlackHoleState,
        setHandEarning: (i, v) => {
            handEarnings[i] = v;
        },
        setNumber1RunPeakTotalCount: v => {
            number1RunPeakTotalCount = v;
        },
        getNumber1RunPeakTotalCount: () => number1RunPeakTotalCount,
        getRawCpsPerHand,
        applyNumber1DetachedCpsProgress,
        offlineSummaryBodyEl,
        offlineSummaryPanelEl,
        formatCount,
        syncBlackHolePhase1Vfx
    };
    function applyOfflineAdvanceFromLegacy(offlineMs, opts) {
        applyNumber1OfflineAdvance(number1OfflineAdvanceDeps, offlineMs, opts);
    }

    /* ---------------------------------------------------------
       HAND CLASS
    --------------------------------------------------------- */
    /** Wall-clock timing: each step advances the sim by exactly GAME_LOOP_MS so hand/combo logic stays stable. */
    const number1LoopRuntime = createNumber1LoopRuntime({
        isGameplayFrozen: () => gameplaySimFrozen(),
        isDocumentHidden: () => typeof document !== "undefined" && document.hidden,
        shouldRunHiddenFixedStep: () => {
            const mode = typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1;
            return mode === 2 && isNumber2Unlocked() && number2State.started;
        },
        runGameLoopStep: opts => runGameLoopStep(opts),
        applyOfflineProgress: applyOfflineAdvanceFromLegacy,
        patchOverviewIfNeeded: nowOverview => {
            if (
                typeof document !== "undefined" &&
                !document.hidden &&
                nowOverview - lastOverviewUpdateMs >= OVERVIEW_PANEL_LIVE_PATCH_MS &&
                pagePanelEl &&
                pagePanelEl.style.display !== "none" &&
                pagePanelBodyEl
            ) {
                lastOverviewUpdateMs = nowOverview;
                const openPageId = pagePanelEl.dataset.openPageId || "";
                if (openPageId === "overview") patchGlobalOverviewLiveDom();
                else if (openPageId === "ascension") patchAscensionPanelLiveDom();
            }
        }
    });

    function beginHiddenOfflineTracking() {
        number1LoopRuntime.beginHiddenOfflineTracking();
    }

    function endHiddenOfflineTracking() {
        number1LoopRuntime.endHiddenOfflineTracking();
    }

    /* ---------------------------------------------------------
       SAVE / LOAD / OFFLINE (after loop runtime — getSaveState uses number1LoopRuntime)
    --------------------------------------------------------- */

    /** Mutable refs for {@link number1SaveApplyDeps} (combo/story boot runs later in this file). */
    const earnedComboNames = [];
    function syncBlackHolePhase2PhotonCombosRef() {
        if ((number1BlackHoleState.phase || 0) < 2) return;
        const minH = getBlackHolePhase2PhotonComboPersistMinHands(number1BlackHoleState);
        if (!(minH > 0)) return;
        let added = false;
        for (let i = 0; i < COMBOS.length; i++) {
            const c = COMBOS[i];
            if (c.minHands <= minH && c.minHands <= unlockedHands && earnedComboNames.indexOf(c.name) === -1) {
                earnedComboNames.push(c.name);
                added = true;
            }
        }
        if (added) {
            if (typeof updateEarnedBonusesUI === "function") updateEarnedBonusesUI();
            updateRateDisplay();
        }
    }
    let comboActivationCounts = {};
    let comboDiscoveryMilestonePendingQueue = [];
    let comboDiscoveryMilestoneReadyAtMs = 0;
    let comboDiscoveryMilestoneCooldownSpanMs = 0;
    let previousTickActiveComboNames = new Set();
    const shownBannerIds = new Set();
    const closedBanners = [];

    const NUMBER1_SAVE_NORMALIZE_FIXED = {
        ascensionTreeVersionExpected: ASCENSION_TREE_VERSION,
        comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION,
        blackHoleMaxLevel: BLACK_HOLE_MAX_LEVEL,
        blackHoleEvaporationCap: BLACK_HOLE_EVAPORATION_CAP,
        comboDiscoveryCooldownBaseMs: COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS,
        comboDiscoveryCooldownMinMs: COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS
    };

    const number1SavePayloadRead = {
        handEarnings: () => handEarnings,
        unlockedHands: () => unlockedHands,
        speedLevel: () => speedLevel,
        speedBonusLevel: () => speedBonusLevel,
        cheapenLevel: () => cheapenLevel,
        cheapenBonusLevel: () => cheapenBonusLevel,
        slowdownLevel: () => slowdownLevel,
        slowdownBonusLevel: () => slowdownBonusLevel,
        slowdownUnlockLogged: () => slowdownUnlockLogged,
        slowdownCompactionUnlockedLatched: () => slowdownCompactionUnlockedLatched,
        timeWarpAuraActiveByHand: () => timeWarpAuraActiveByHand,
        timeWarpAuraAppearedAtMsByHand: () => timeWarpAuraAppearedAtMsByHand,
        timeWarpNextSpawnInSec: () => timeWarpNextSpawnInSec,
        timeWarpUnlockLogged: () => timeWarpUnlockLogged,
        autoBuyUnlocked: () => autoBuyUnlocked,
        autoBuyEnabledByHand: () => autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand: () => autoBuyCountdownSecondsByHand,
        turboBoostMeter: () => turboBoostMeter,
        turboBoostUnlocked: () => turboBoostUnlocked,
        turboBoostEnabled: () => turboBoostEnabled,
        turboActivationCount: () => turboActivationCount,
        turboScensionBurnLevel: () => turboScensionBurnLevel,
        turboScensionTankLevel: () => turboScensionTankLevel,
        turboScensionMultLevel: () => turboScensionMultLevel,
        turboScensionFillLevel: () => turboScensionFillLevel,
        turboLevelerBank: () => turboLevelerBank,
        turboLevelerPurchases: () => turboLevelerPurchases,
        earnedComboNames: () => earnedComboNames,
        comboActivationCounts: () => comboActivationCounts,
        comboDiscoveryMilestonePendingQueue: () => comboDiscoveryMilestonePendingQueue,
        comboDiscoveryMilestoneReadyAtMs: () => comboDiscoveryMilestoneReadyAtMs,
        comboDiscoveryMilestoneCooldownSpanMs: () => comboDiscoveryMilestoneCooldownSpanMs,
        adaptiveLastProgressAtMs: () => logTickerRt.getAdaptiveLastProgressAtMs(),
        adaptiveLastHintAtMs: () => logTickerRt.getAdaptiveLastHintAtMs(),
        previousTickActiveComboNames: () => Array.from(previousTickActiveComboNames),
        objectivesAchieved: () => objectives.map(o => o.achieved),
        longTermObjectivesAchieved: () => longTermObjectives.map(o => o.achieved),
        shownBannerIds: () => Array.from(shownBannerIds),
        closedBanners: () => closedBanners,
        settings: () => settings,
        numberModules: () => NUMBER_MODULES,
        maxHands: () => maxHands,
        number1RunPeakTotalCount: () => number1RunPeakTotalCount,
        number1RunStartedAtMs: () => number1RunStartedAtMs,
        number1AscensionEssence: () => number1AscensionEssence,
        number1AscensionPendingBonusEssence: () => number1AscensionPendingBonusEssence,
        number1AscensionClapEssenceMultiplier: () => number1AscensionClapEssenceMultiplier,
        number1AscensionClapEssenceProcCount: () => number1AscensionClapEssenceProcCount,
        number1HasAscended: () => number1HasAscended,
        number1AscensionNodeIds: () => number1AscensionNodeIds,
        number1AscensionBlackHoleLevel: () => Math.floor(Number(number1BlackHoleState.phase2Mass) || 0),
        number1BlackHoleState: () => number1BlackHoleState,
        unlockedHandsCap: () => unlockedHandsCap,
        ascensionNumber1IntroSeen: () => ascensionNumber1IntroSeen,
        ascensionTreeVersion: () => ASCENSION_TREE_VERSION,
        clapCooldownUntilMsByHand: () => clapCooldownUntilMsByHand,
        totalPlayTimeMs: () => number1LoopRuntime.getTotalPlayTimeMs()
    };

    const number1SaveApplyDeps = {
        loopRt: number1LoopRuntime,
        maxHands,
        setHandEarnings: v => {
            handEarnings = v;
        },
        getHandEarnings: () => handEarnings,
        setSpeedLevel: v => {
            speedLevel = v;
        },
        setSpeedBonusLevel: v => {
            speedBonusLevel = v;
        },
        setClapDigitPrevious: v => {
            clapDigitPrevious = v;
        },
        setClapCooldownUntilMsByHand: v => {
            clapCooldownUntilMsByHand = v;
        },
        setCheapenLevel: v => {
            cheapenLevel = v;
        },
        setCheapenBonusLevel: v => {
            cheapenBonusLevel = v;
        },
        setSlowdownLevel: v => {
            slowdownLevel = v;
        },
        setSlowdownBonusLevel: v => {
            slowdownBonusLevel = v;
        },
        setSlowdownUnlockLogged: v => {
            slowdownUnlockLogged = v;
        },
        setSlowdownCompactionUnlockedLatched: v => {
            slowdownCompactionUnlockedLatched = v;
        },
        setTimeWarpAuraActiveByHand: v => {
            timeWarpAuraActiveByHand = v;
        },
        getTimeWarpAuraActiveByHand: () => timeWarpAuraActiveByHand,
        setTimeWarpAuraAppearedAtMsByHand: v => {
            timeWarpAuraAppearedAtMsByHand = v;
        },
        getTimeWarpAuraAppearedAtMsByHand: () => timeWarpAuraAppearedAtMsByHand,
        setTimeWarpNextSpawnInSec: v => {
            timeWarpNextSpawnInSec = v;
        },
        setTimeWarpUnlockLogged: v => {
            timeWarpUnlockLogged = v;
        },
        setUnlockedHandsCap: v => {
            unlockedHandsCap = v;
        },
        setUnlockedHands: v => {
            unlockedHands = v;
        },
        ensureSpeedRows,
        getHands: () => hands,
        getSpeedRowRef: i => speedRowRefs[i],
        HandCounter,
        HAND_BASE_SPEED,
        setAutoBuyUnlocked: v => {
            autoBuyUnlocked = v;
        },
        copyArrayIntoExisting,
        autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand,
        setTurboBoostMeter: v => {
            turboBoostMeter = v;
        },
        getTurboBoostMeter: () => turboBoostMeter,
        setTurboBoostUnlocked: v => {
            turboBoostUnlocked = v;
        },
        setTurboBoostEnabled: v => {
            turboBoostEnabled = v;
        },
        getTurboBoostEnabled: () => turboBoostEnabled,
        setTurboActivationCount: v => {
            turboActivationCount = v;
        },
        setTurboScensionBurnLevel: v => {
            turboScensionBurnLevel = v;
        },
        setTurboScensionTankLevel: v => {
            turboScensionTankLevel = v;
        },
        setTurboScensionMultLevel: v => {
            turboScensionMultLevel = v;
        },
        setTurboScensionFillLevel: v => {
            turboScensionFillLevel = v;
        },
        setTurboLevelerBank: v => {
            turboLevelerBank = v;
        },
        setTurboLevelerPurchases: v => {
            turboLevelerPurchases = v;
        },
        tryTurboLevelerPurchases,
        logTickerRt,
        earnedComboNames,
        setComboActivationCounts: v => {
            comboActivationCounts = v;
        },
        setComboDiscoveryMilestonePendingQueue: v => {
            comboDiscoveryMilestonePendingQueue = v;
        },
        setComboDiscoveryMilestoneReadyAtMs: v => {
            comboDiscoveryMilestoneReadyAtMs = v;
        },
        setComboDiscoveryMilestoneCooldownSpanMs: v => {
            comboDiscoveryMilestoneCooldownSpanMs = v;
        },
        setPreviousTickActiveComboNames: s => {
            previousTickActiveComboNames = s;
        },
        objectiveLists: { objectives, longTermObjectives },
        shownBannerIds,
        closedBanners,
        getSettings: () => settings,
        setSettings: v => {
            settings = v;
        },
        NUMBER_MODULES,
        setNumber1AscensionEssence: v => {
            number1AscensionEssence = v;
        },
        setNumber1AscensionPendingBonusEssence: v => {
            number1AscensionPendingBonusEssence = v;
        },
        setNumber1AscensionClapEssenceMultiplier: v => {
            number1AscensionClapEssenceMultiplier = v;
        },
        setNumber1AscensionClapEssenceProcCount: v => {
            number1AscensionClapEssenceProcCount = v;
        },
        setNumber1HasAscended: v => {
            number1HasAscended = v;
        },
        reconcileNumber2LockState,
        updateNumber2SidebarUnlockUI,
        clearAscensionNodeIds: () => {
            number1AscensionNodeIds = [];
        },
        pushAscensionNodeId: id => {
            number1AscensionNodeIds.push(id);
        },
        normalizeAscensionNodeIds,
        setAscensionNumber1IntroSeen: v => {
            ascensionNumber1IntroSeen = v;
        },
        setNumber1AscensionBlackHoleLevel: v => {
            number1AscensionBlackHoleLevel = v;
        },
        setNumber1BlackHoleState: v => {
            number1BlackHoleState = v;
        },
        isNumber1AscensionTreeFullyPurchased,
        getBlackHolePhase,
        promoteBlackHoleToPhase1IfNeeded: () => {
            if (number1HasAscended && isNumber1AscensionTreeFullyPurchased() && getBlackHolePhase() === 0) {
                number1BlackHoleState.phase = 1;
            }
        },
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        getTurboMeterMax,
        setNumber1RunPeakTotalCount: v => {
            number1RunPeakTotalCount = v;
        },
        setNumber1RunStartedAtMs: v => {
            number1RunStartedAtMs = v;
        },
        refreshTotalFromHandEarnings,
        syncBlackHolePhase1Vfx,
        updateN1GravityCpsStrip,
        checkStoryBanners: forwardCheckStoryBanners
    };

    const n1SaveOffline = createN1SaveOffline({
        buildSavePayload: () => buildNumber1SavePayload(number1SavePayloadRead),
        getNormalizeSnapshotOptions: () =>
            buildNumber1NormalizeSnapshotOptions(number1SavePayloadRead, NUMBER1_SAVE_NORMALIZE_FIXED),
        applySnapToRuntime: snap => applyNumber1SnapToRuntime(number1SaveApplyDeps, snap),
        applyOfflineAdvance: applyOfflineAdvanceFromLegacy,
        getLocalStorage: () => localStorage,
        getSuppressAutosave: () => suppressAutosave
    });

    function getSaveState(savedAt) {
        return n1SaveOffline.getSaveState(savedAt);
    }
    function autosaveNow() {
        return n1SaveOffline.autosaveNow();
    }
    function applyLoadedState(data) {
        return n1SaveOffline.applyLoadedState(data);
    }
    function applyOfflineProgress(offlineMs, opts) {
        return n1SaveOffline.applyOfflineProgress(offlineMs, opts);
    }


    /* ---------------------------------------------------------
       HAND MANAGEMENT
       Hand 1: immediate. Hand 2: 1e9, 3: 1e12, 4: 1e15, 5: 1e18,
       6: 1e21, 7: 1e24, 8: 1e27, 9: 1e30, 10: 1e33
    --------------------------------------------------------- */
    const hands = [];
    let gamePaused = false;
    /** Dev-tools freeze: skips simulation without touching overlay `gamePaused` (story, ascension dialogs, …). */
    let devFreezeGame = false;
    function gameplaySimFrozen() {
        return gamePaused || devFreezeGame;
    }

    const deleteSaveOverlayEl = document.getElementById("delete-save-overlay");
    const deleteSaveNoBtn = document.getElementById("delete-save-no");
    const deleteSaveYesBtn = document.getElementById("delete-save-yes");
    const settingsDeleteSaveBtn = document.getElementById("settings-delete-save");
    const devDeleteSaveBtn = document.getElementById("dev-delete-save");

    function showDeleteSaveConfirmDialog() {
        gamePaused = true;
        if (deleteSaveOverlayEl) deleteSaveOverlayEl.style.display = "flex";
    }
    function hideDeleteSaveConfirmDialog() {
        if (deleteSaveOverlayEl) deleteSaveOverlayEl.style.display = "none";
        gamePaused = false;
    }
    function executeDeleteSaveAndReload() {
        suppressAutosave = true;
        clearNumber1SaveAndReload(localStorage);
    }

    function unlockHand() {
        if (unlockedHands >= maxHands) return;
        unlockedHands++;
        handEarnings[unlockedHands - 1] = getAscensionHandUnlockStartingCountFloor();
        markMeaningfulProgress();
        ensureSpeedRows();
        addToLog("Hand " + unlockedHands + " unlocked", "milestone");
        const slot = speedRowRefs[unlockedHands - 1]?.handMountEl;
        hands.push(new HandCounter(unlockedHands, HAND_BASE_SPEED, slot));
        checkStoryBanners();
        updateEarnedBonusesUI();
        updatePageButtonUnlocks();
        updateSlowdownUpgradeUI();
        updateTimeWarpAuraUI();
    }

    function checkUnlockHands() {
        while (shouldUnlockNextHand(unlockedHands, unlockedHandsCap, totalChanges, maxHands)) {
            unlockHand();
        }
    }

    /* ---------------------------------------------------------
       INITIALIZE FIRST HAND (appears immediately, in same slot as after 10)
    --------------------------------------------------------- */
    ensureSpeedRows();
    hands.push(new HandCounter(1, HAND_BASE_SPEED, speedRowRefs[0]?.handMountEl));

    /* ---------------------------------------------------------
       STORY BANNERS (celebratory, pause game; reviewable later)
       Milestone text matches UNLOCK_THRESHOLDS / TURBO_UNLOCK_COUNT (same as long-term objectives).
    --------------------------------------------------------- */
    function storyTotalCountLead(threshold) {
        return getStoryTotalCountLead(threshold, formatCount);
    }
    const STORY_BANNERS = [
        {
            id: "second-hand",
            order: 1,
            trigger: () => unlockedHands >= 2,
            title: "Congratulations — you unlocked a second hand!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[0]) + "you unlocked a second hand. Statistically speaking, you've always had a second hand available but you just didn't want to use it or something, but now you will be counting with two hands. Each hand has its own upgrades and its own earnings. Combinations between two hands award one-time bonuses that affect all of your counting. Try to get all of the bonuses!"
        },
        {
            id: "third-hand",
            order: 2,
            trigger: () => unlockedHands >= 3,
            title: "Wow — you're now counting on 3 hands!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[1]) + "you unlocked a third hand. I don't know how that is possible but maybe your friend is helping you. Similarly to two hands you can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "turbo-boost",
            order: 3,
            trigger: () => totalChanges >= TURBO_UNLOCK_COUNT,
            title: "Turbo Boost unlocked!",
            body: storyTotalCountLead(TURBO_UNLOCK_COUNT) + "you unlocked Turbo Boost. Three hands aren't going to get you to a quadrillion on their own, but with Turbo Boost you can push much further! The gauge to the right of your total count fills when you land hand combos—bigger combos add more. While the meter has charge and Turbo is on, all hand counts are multiplied. Now your numbers have NOS! Oh and you can get more combos too."
        },
        {
            id: "fourth-hand",
            order: 4,
            trigger: () => unlockedHands >= 4,
            title: "It's patty-cake time! 🎉 You're now counting on 4 hands!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[2]) + "you unlocked a fourth hand. Bake me a cake as fast as you can. JK there is no cake. You can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "fifth-hand",
            order: 5,
            trigger: () => unlockedHands >= 5,
            title: "You're now counting on 5 hands!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[3]) + "you unlocked a fifth hand. This is getting crazy. Where are these hands coming from? Probably from the same place as the sheep do. You can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "sixth-hand",
            order: 6,
            trigger: () => unlockedHands >= 6,
            title: "You're now counting on 6 hands!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[4]) + "you unlocked a sixth hand. If you google, \"do any creatures have 6 hands?\" the answer is no. Because of course it is no. Therefore you are an abomination...much like when Spider-Man became a spider man, but look at all those numbers! Also with more hands come more bonuses, just like uncle Ben said."
        },
        {
            id: "seventh-hand",
            order: 7,
            trigger: () => unlockedHands >= 7,
            title: "THE SEVENTH HAND HAS APPEARED!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[5]) + "you unlocked a seventh hand. Much like the other hands we have no idea who's they are or why they chose to help you count. But look at all those numbers! Get those new combos baby, cha-ching."
        },
        {
            id: "eighth-hand",
            order: 8,
            trigger: () => unlockedHands >= 8,
            title: "8 hand counting is now a thing!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[6]) + "you unlocked an eighth hand — give yourself a round of applause. Oh and Clapping is now a thing that helps you count faster. When any two hands finish a tick on the digit 5, they clap together (watch for the center-screen animation). Each clap has a 10% chance per hand to grant a bonus Speed level: it boosts your hand's rate like a normal level but does not increase upgrade costs. Your level line shows as \"Level X +Y\" when you have bonus levels. You can turn the animation off in Menu → Show clap animation (bonuses still apply). Combos between hands still work as before — keep mixing digits for bonuses and Turbo meter."
        },
        {
            id: "ninth-hand",
            order: 9,
            trigger: () => unlockedHands >= 9,
            title: "Nine is a fun number because it is the first time we see the square of three! If you don't find that interesting too, well that is reasonable.",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[7]) + "you unlocked a ninth hand. Did I really not come up with an upgrade for this? Anyways, you can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "tenth-hand",
            order: 10,
            trigger: () => unlockedHands >= 10,
            title: "This is the sound of 10 hands counting!",
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[8]) + "you unlocked a tenth hand. It is quieter than I thought it would be. Wait did I not add an upgrade for 10 hands either? No, that can't be right, I feel like there is something here. Keep counting while I go look for the next upgrade.."
        },
        {
            id: "black-hole-mass-accumulator-intro",
            order: 50,
            trigger: () => number1HasAscended && isBlackHoleArcUnlocked() && getBlackHolePhase() === 1,
            title: "Gravity takes hold",
            body: "You have mapped every path and you cunted so high that your numbers are no longer weightless. I know it sounds crazy but I think it might just be crazy enuogh to work. Let's call this the Numerical Mass Accumulator and by the power of imagination we will use its mass to help you count faster and higher. Feed Essence to the Numerical Mass Accumulator on Ascension for new boosts. Under Count per second, warm numerical mass shows your inertial boost while you charge. I am sure adding more and more numerical mass will have no consequences."
        },
        {
            id: "ascension-map-collapse-ready",
            order: 1000,
            trigger: () => false,
            title: "Constellation complete",
            body: "Ok, so there appear to be some minor consequences. It looks like our numerical mass is starting to get a bit heavy and collpased in on itself. BUT somehow its still helping us count, so the power of imagination lives. Let's see how far we can push this collapse, let's add some more ascension essence."
        },
        {
            // Unlocks collapse autobuy burst (applyAffordableUpgradeBurstForHand) when getBlackHolePhase() >= 2.
            id: "black-hole-phase-1-collapse",
            order: 1001,
            trigger: () => false,
            title: "Mass Accumulator Collapse",
            body: "Critical mass reached. The accumulator collapses inward. A black hole is born. You done messed up son (or daughter)! The singularity's gravity doesn't only bend count—it bends your autobuyers to unknown speeds. When an autobuy timer fires, they'll snap up every Speed (and linked) upgrade that hand can still afford, not just one level at a time."
        },
        {
            id: "black-hole-phase-2-disk",
            order: 1002,
            trigger: () => false,
            title: "Accretion Disk Ignition",
            body: "Numerical Matter begins to circle the singularity, it makes pretty swirly shapes. Also, the accretion disk ignites. So basically spiecy swirly shapes are going to help us count faster and higher."
        },
        {
            id: "black-hole-phase-3-wave",
            order: 1003,
            trigger: () => false,
            title: "Gravitational Lensing",
            body: "Spacetime bends around your count. Suck it Einstein! Gravitational Waves begin to pulse. Also, I am not sure if this is actually working, but it looks cool so I am going to leave it in."
        },
        {
            id: "black-hole-phase-4-furnace",
            order: 1004,
            trigger: () => false,
            title: "Gravitational Furnace",
            body: "It seems like our black hole is growing nicely but recently it just hasn't been itself. We give it essence and more essence but it just doesn't seem to do the trick. Much like our little shop of horrors I feel like we need to feed it soemthing tasty. I dare you to throw one of your hands in there, lol."
        },
        {
            id: "black-hole-phase-5-jets",
            order: 1005,
            trigger: () => false,
            title: "Astrophysical Jets",
            body: "Going from 10 hands to 1 was quite the sacrifice but little Jimmy (I assume that's our black hole's name) seems pretty happy. He's shooting out astrophysical jets of hypercharged numerical mass. Ride these jet's to the inevitable conclusion so you can prove everyone wrong and say, \"I counted to infinity\"."
        },
        {
            id: "black-hole-phase-6-evaporation",
            order: 1006,
            trigger: () => false,
            title: "Evaporation",
            body: "The cosmic limit is reached. Upgrades fall silent. Now, count for counting's sake."
        },
        {
            id: "black-hole-first-digest",
            order: 1007,
            trigger: () => false,
            title: "Furnace Response",
            body: "Digestion complete. The furnace answers with new power."
        }
    ];

    const storyBannerOverlayEl = document.getElementById("story-banner-overlay");
    const storyBannerTitleEl = document.getElementById("story-banner-title");
    const storyBannerBodyEl = document.getElementById("story-banner-body");
    const storyBannerCloseBtn = document.getElementById("story-banner-close");
    const ascensionIntroOverlayEl = document.getElementById("ascension-intro-overlay");
    const ascensionIntroContinueBtn = document.getElementById("ascension-intro-continue");
    const ascensionConfirmOverlayEl = document.getElementById("ascension-confirm-overlay");
    const ascensionConfirmBodyEl = document.getElementById("ascension-confirm-body");
    const ascensionConfirmCancelBtn = document.getElementById("ascension-confirm-cancel");
    const ascensionConfirmAscendBtn = document.getElementById("ascension-confirm-ascend");
    let beginNumber1AscensionFlow = () => {};
    let maybeShowFirstAscensionIntroOnUnlock = () => {};
    const storyReviewBtn = document.getElementById("story-review-btn");
    const storyReviewPanelEl = document.getElementById("story-review-panel");
    const storyReviewListEl = document.getElementById("story-review-list");
    const storyReviewCloseBtn = document.getElementById("story-review-close");

    const number1StoryBannerBoot = createNumber1StoryBannerBoot({
        storyBanners: STORY_BANNERS,
        shownBannerIds,
        closedBanners,
        storyBannerOverlayEl,
        storyBannerTitleEl,
        storyBannerBodyEl,
        storyBannerCloseBtn,
        storyReviewBtn,
        storyReviewPanelEl,
        storyReviewListEl,
        storyReviewCloseBtn,
        gameplaySimFrozen,
        getGamePaused: () => gamePaused,
        setGamePaused: v => { gamePaused = v; },
        getAscensionMapCollapsePending: () => ascensionMapCollapsePending,
        getNumber1BlackHoleState: () => number1BlackHoleState,
        startAscensionMapCollapseTransition,
        refreshStoryArchiveSectionIfOpen
    });
    Object.assign(storyBannerBridge, {
        showStoryBanner: number1StoryBannerBoot.showStoryBanner,
        showStoryBannerById: number1StoryBannerBoot.showStoryBannerById
    });
    const {
        getStoryBannerById,
        hasUnlockedStoryBanner,
        checkStoryBanners,
        showStoryBanner
    } = number1StoryBannerBoot;
    forwardCheckStoryBanners = checkStoryBanners;
    if (menuBtn) menuBtn.addEventListener("click", () => {
        if (!settingsPanelEl) return;
        const openNext = settingsPanelEl.style.display === "none";
        const applyToggle = () => {
            if (openNext) {
                closeInlineMainStagePanels({ keep: "settings" });
                settingsPanelEl.style.display = "block";
            } else {
                settingsPanelEl.style.display = "none";
                syncInlinePanelsVsGameplay();
            }
        };
        applyToggle();
    });
    if (settingsCloseBtn) settingsCloseBtn.addEventListener("click", () => {
        if (settingsPanelEl) settingsPanelEl.style.display = "none";
        syncInlinePanelsVsGameplay();
    });
    if (settingsDeleteSaveBtn) settingsDeleteSaveBtn.addEventListener("click", () => {
        if (settingsPanelEl) settingsPanelEl.style.display = "none";
        syncInlinePanelsVsGameplay();
        showDeleteSaveConfirmDialog();
    });
    if (deleteSaveNoBtn) deleteSaveNoBtn.addEventListener("click", () => hideDeleteSaveConfirmDialog());
    if (deleteSaveYesBtn) deleteSaveYesBtn.addEventListener("click", () => executeDeleteSaveAndReload());
    if (settingsThemeDarkEl) settingsThemeDarkEl.addEventListener("change", () => {
        settings.theme = settingsThemeDarkEl.checked ? "dark" : "light";
        applyTheme();
        persistSettings();
    });
    if (settingsAdaptiveTipsEl) settingsAdaptiveTipsEl.addEventListener("change", () => {
        settings.adaptiveTipsEnabled = settingsAdaptiveTipsEl.checked;
        if (settings.adaptiveTipsEnabled) {
            addToLog(getAdaptiveTipMessage(), "tip");
            logTickerRt.restartAdaptiveTipClockAfterSettingsTurnOn();
        }
        persistSettings();
    });
    if (settingsCurtainEnabledEl) settingsCurtainEnabledEl.addEventListener("change", () => { settings.curtainEnabled = settingsCurtainEnabledEl.checked; persistSettings(); });
    if (settingsHumorEnabledEl) settingsHumorEnabledEl.addEventListener("change", () => { settings.humorEnabled = settingsHumorEnabledEl.checked; persistSettings(); renderActionLog(); refreshMessageLogPanelIfOpen(); });
    if (settingsShowClapAnimationEl) settingsShowClapAnimationEl.addEventListener("change", () => { settings.showClapAnimation = settingsShowClapAnimationEl.checked; persistSettings(); });
    if (settingsOfflineCapHoursEl) settingsOfflineCapHoursEl.addEventListener("change", () => {
        const n = Number(settingsOfflineCapHoursEl.value);
        settings.offlineCapHours = Number.isFinite(n) && n >= 0 ? n : DEFAULT_SETTINGS.offlineCapHours;
        settingsOfflineCapHoursEl.value = String(settings.offlineCapHours);
        persistSettings();
    });
    if (offlineSummaryCloseBtn) offlineSummaryCloseBtn.addEventListener("click", () => { if (offlineSummaryPanelEl) offlineSummaryPanelEl.style.display = "none"; });
    pageButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const pageId = btn.getAttribute("data-page");
            showPagePanel(pageId);
        });
    });
    if (pagePanelCloseBtn) pagePanelCloseBtn.addEventListener("click", () => {
        if (pagePanelEl) {
            const wasAscension = pagePanelEl.dataset.openPageId === "ascension";
            pagePanelEl.style.display = "none";
            delete pagePanelEl.dataset.openPageId;
            syncMessageLogScrollContainerMode("");
            if (wasAscension) teardownAscensionMapPanZoom();
        }
        syncInlinePanelsVsGameplay();
    });
    if (pagePanelBodyEl) {
        pagePanelBodyEl.addEventListener("pointerup", function(e) {
            const replayBtn = e.target.closest("[data-story-replay-id]");
            if (replayBtn) {
                e.preventDefault();
                e.stopPropagation();
                const banner = getStoryBannerById(replayBtn.getAttribute("data-story-replay-id"));
                if (banner && hasUnlockedStoryBanner(banner.id)) showStoryBanner(banner, { isReplay: true });
                return;
            }
            const statusBtn = e.target.closest("[data-combo-status]");
            if (statusBtn) {
                e.preventDefault();
                e.stopPropagation();
                const now = Date.now();
                if (!consumeComboFilterClickDebounced(now)) return;
                setComboIndexStatusFilter(statusBtn.getAttribute("data-combo-status") || "all");
                refreshCombinationsPanelIfOpen(true);
                return;
            }
            const handsBtn = e.target.closest("[data-combo-hands]");
            if (handsBtn) {
                e.preventDefault();
                e.stopPropagation();
                const now = Date.now();
                if (!consumeComboFilterClickDebounced(now)) return;
                setComboIndexHandsFilter(handsBtn.getAttribute("data-combo-hands") || "all");
                refreshCombinationsPanelIfOpen(true);
            }
        });
    }
    function playBlackHoleScreenEffect(kind) {
        if (typeof document === "undefined" || !document.body) return;
        const allowed = {
            hawking: true,
            wave: true,
            sacrifice: true,
            digest: true,
            evaporation: true
        };
        if (!allowed[kind]) return;
        const wrap = document.createElement("div");
        wrap.className = "black-hole-screen-fx black-hole-screen-fx--" + kind;
        wrap.setAttribute("aria-hidden", "true");
        wrap.innerHTML = "<div class=\"black-hole-screen-fx__core\"></div><div class=\"black-hole-screen-fx__ring\"></div><div class=\"black-hole-screen-fx__field\"></div>";
        document.body.appendChild(wrap);
        window.setTimeout(function () {
            if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        }, BLACK_HOLE_SCREEN_FX_MS);
    }

    if (pagePanelEl) {
        const setStokePreviewActive = function(target, active) {
            const btn = target && typeof target.closest === "function"
                ? target.closest("[data-asc-black-hole-stoke-preview-toggle]")
                : null;
            if (!btn) return;
            const panel = btn.closest(".asc-black-hole");
            if (panel) panel.classList.toggle("asc-black-hole--stoke-preview-active", !!active);
        };
        pagePanelEl.addEventListener("pointerover", function(e) {
            setStokePreviewActive(e.target, true);
        });
        pagePanelEl.addEventListener("pointerout", function(e) {
            const btn = e.target && typeof e.target.closest === "function"
                ? e.target.closest("[data-asc-black-hole-stoke-preview-toggle]")
                : null;
            if (!btn) return;
            if (e.relatedTarget && btn.contains(e.relatedTarget)) return;
            setStokePreviewActive(btn, false);
        });
        pagePanelEl.addEventListener("focusin", function(e) {
            setStokePreviewActive(e.target, true);
        });
        pagePanelEl.addEventListener("focusout", function(e) {
            setStokePreviewActive(e.target, false);
        });
        pagePanelEl.addEventListener("click", function(e) {
            const ascTab = e.target.closest("[data-asc-tab]");
            if (ascTab && pagePanelEl.dataset.openPageId === "ascension" && pagePanelBodyEl) {
                const t = parseInt(ascTab.getAttribute("data-asc-tab"), 10);
                if (t === 1 || t === 2) {
                    if (t === 2 && !isNumber2Unlocked()) return;
                    if (ascensionPageActiveNumber === t) return;
                    const wasTab1 = ascensionPageActiveNumber === 1;
                    ascensionPageActiveNumber = t;
                    if (wasTab1 && t !== 1) teardownAscensionMapPanZoom();
                    pagePanelBodyEl.innerHTML = renderAscensionPageHtml();
                    syncPhase1MassFillCssVars();
                    syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
                    if (t === 1 && number1HasAscended) {
                        requestAnimationFrame(() => initAscensionMapPanZoom());
                    }
                }
                return;
            }
            const asc2Buy = e.target.closest("[data-asc2-buy]");
            if (asc2Buy && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 2 && pagePanelBodyEl) {
                e.preventDefault();
                const nid = asc2Buy.getAttribute("data-asc2-buy");
                number2.tryBuyAscensionNode(nid);
                return;
            }
            const ascBhBuy = e.target.closest("[data-asc-black-hole-buy]");
            if (ascBhBuy && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyNumber1BlackHole();
                return;
            }
            const ascBhP2 = e.target.closest("[data-asc-black-hole-p2]");
            if (ascBhP2 && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyBlackHolePhase2CollapseUpgrade(ascBhP2.getAttribute("data-asc-black-hole-p2") || "");
                return;
            }
            const ascBhP3 = e.target.closest("[data-asc-black-hole-p3]");
            if (ascBhP3 && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyBlackHolePhase3DiskUpgrade(ascBhP3.getAttribute("data-asc-black-hole-p3") || "");
                return;
            }
            const ascBhP6 = e.target.closest("[data-asc-black-hole-p6]");
            if (ascBhP6 && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyBlackHolePhase6JetUpgrade(ascBhP6.getAttribute("data-asc-black-hole-p6") || "");
                return;
            }
            const ascBhStart = e.target.closest("[data-asc-black-hole-start]");
            if (ascBhStart && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryStartNumber1BlackHoleArc();
                return;
            }
            const ascBhWave = e.target.closest("[data-asc-black-hole-wave]");
            if (ascBhWave && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                triggerBlackHoleWaveManual();
                queueBlackHoleUiRefresh();
                return;
            }
            const ascBhSacrifice = e.target.closest("[data-asc-black-hole-sacrifice]");
            if (ascBhSacrifice && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                sacrificeNextHandToFurnace();
                queueBlackHoleUiRefresh();
                return;
            }
            const ascBhMutation = e.target.closest("[data-asc-black-hole-mutation]");
            if (ascBhMutation && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                chooseBlackHoleFurnaceMutation(ascBhMutation.getAttribute("data-asc-black-hole-mutation") || "");
                queueBlackHoleUiRefresh();
                return;
            }
            const ascBhJet = e.target.closest("[data-asc-black-hole-jet]");
            if (ascBhJet && pagePanelEl.dataset.openPageId === "ascension" && ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryToggleJet(ascBhJet.getAttribute("data-asc-black-hole-jet") === "on");
                queueBlackHoleUiRefresh();
                return;
            }
            const openAsc = e.target.closest("[data-open-ascension]");
            if (openAsc) {
                e.preventDefault();
                showPagePanel("ascension");
                return;
            }
            const openAscN2 = e.target.closest("[data-open-ascension-n2]");
            if (openAscN2) {
                e.preventDefault();
                ascensionPageActiveNumber = 2;
                showPagePanel("ascension");
                return;
            }
            const ascMapViewport = e.target.closest("#ascension-map-viewport");
            if (ascMapViewport && number1HasAscended) {
                const blockAscMapInteract = e.target.closest(
                    "button, a, [data-asc-respec-finger], [data-asc-respec], .ascension-respec-btn, .asc-tree-respec-btn, .ascension-map-toolbar"
                );
                if (!blockAscMapInteract) {
                    const nodeEl = e.target && typeof e.target.closest === "function" ? e.target.closest(".asc-map-node") : null;
                    /* Prefer geometric nearest gem in viewBox space — overlapping 32px hit boxes otherwise
                       follow DOM paint order (misleading vs data-asc-vbx center coordinates). */
                    let nid = ascensionResolveNodeIdAtClient(e.clientX, e.clientY);
                    if (!nid && nodeEl && nodeEl.getAttribute("data-asc-node-id")) {
                        nid = nodeEl.getAttribute("data-asc-node-id");
                    }
                    if (nid) {
                        setAscensionMapSelectedNode(nid);
                        tryBuyAscensionNode(nid);
                    } else {
                        setAscensionMapSelectedNode(null);
                    }
                    return;
                }
            }
            const ascFingerRespec = e.target.closest("[data-asc-respec-finger]");
            if (ascFingerRespec) {
                const fk = ascFingerRespec.getAttribute("data-asc-respec-finger");
                if (fk) respecNumber1AscensionFinger(fk);
                return;
            }
            if (e.target.closest("[data-asc-respec]")) {
                respecNumber1AscensionSkillTrees();
                return;
            }
            if (consumeAscendNumber1Button(e.target, () => beginNumber1AscensionFlow())) return;
        });
    }

    /* ---------------------------------------------------------
       HAND COMBOS (poker-style: hand values 1–10, bonuses stack) — Region: Combos & clap
    --------------------------------------------------------- */
    /** When unchanged vs last game loop, combo detection can skip `getActiveCombos()` if Combinations is closed. */
    let lastComboUiInputDigest = "";
    const comboBubbleContainerEl = document.getElementById("combo-bubble-container");
    ({
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
    } = createNumber1ComboBoot({
        getHands: () => hands,
        getUnlockedHands: () => unlockedHands,
        getAscensionNodeIds: () => number1AscensionNodeIds,
        getNearMissToleranceRanks,
        formatCount,
        renderComboPagePerHandStatusSectionHtml,
        computeAscensionGrantTotals,
        ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP,
        combinationsPageBtn,
        getPagePanelEl: () => pagePanelEl,
        getPagePanelBodyEl: () => pagePanelBodyEl,
        getPagePanelTitleEl: () => pagePanelTitleEl,
        comboBubbleContainerEl,
        getComboDiscoveryMilestoneCooldownMs,
        addToLog,
        markMeaningfulProgress,
        updateRateDisplay,
        playLedgerBeamBonus: (catalogBefore, catalogAfter, lbl) =>
            ledgerBeamPlayBonusBridge.play(catalogBefore, catalogAfter, lbl),
        applyAscensionComboTimeWarpDelayReduction,
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        getBlackHoleState: () => number1BlackHoleState,
        isComboTurboFillFromCombosEnabled: () => devComboTurboFillFromCombosEnabled,
        addTurboBoostMeter,
        getTurboComboPoints,
        refreshCombinationsHandStatusIfOpen,
        updateComboDiscoveryMilestonePanelIfOpen,
        earnedComboNames,
        getComboActivationCounts: () => comboActivationCounts,
        getMilestonePendingQueue: () => comboDiscoveryMilestonePendingQueue,
        getMilestoneReadyAtMs: () => comboDiscoveryMilestoneReadyAtMs,
        setMilestoneReadyAtMs: v => {
            comboDiscoveryMilestoneReadyAtMs = v;
        },
        setMilestoneCooldownSpanMs: v => {
            comboDiscoveryMilestoneCooldownSpanMs = v;
        },
        getPreviousTickActiveComboNames: () => previousTickActiveComboNames,
        setPreviousTickActiveComboNames: s => {
            previousTickActiveComboNames = s;
        },
        getLastComboUiInputDigest: () => lastComboUiInputDigest,
        setLastComboUiInputDigest: v => {
            lastComboUiInputDigest = v;
        }
    }));

    /* Overview + ascension page panel refresh / live patch (implementation in n1-overview-ascension-panels). */
    Object.assign(overviewAscPanelDelegates, createOverviewAscensionPanelsRefresh({
        getPagePanelEl: () => pagePanelEl,
        getPagePanelBodyEl: () => pagePanelBodyEl,
        getAscensionPageActiveNumber: () => ascensionPageActiveNumber,
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
        updateAscensionMapDetailPanel: () => {
            if (typeof updateAscensionMapDetailPanel === "function") updateAscensionMapDetailPanel();
        },
        getUnlockedNumberModules,
        formatCount,
        computeNumber1AscensionGainBreakdown,
        getNumber1AscensionEssenceFormulaTotal,
        getNumber1AscensionRequiredHands,
        getNumber1AscensionEssence: () => number1AscensionEssence,
        number1HasAscended: () => number1HasAscended,
        getArcEssenceMultiplierBonusPhraseTitle,
        getNumber2State: () => number2State
    }));

    const { performNumber1Ascension } = createNumber1AscensionPerform({
        isNumber1AscensionReady,
        clearActionLogBacklogOnAscension,
        getAscensionGainBreakdown: () => computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal()),
        getNumber1AscensionEssence: () => number1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle,
        addToLog,
        markMeaningfulProgress,
        autosaveNow,
        applyAscensionEssenceGrantAndResetWarpClapBonuses(gain) {
            number1AscensionEssence += gain;
            number1BlackHoleState.phase6JetBestAscensionEssence = Math.max(
                number1BlackHoleState.phase6JetBestAscensionEssence || 0,
                gain
            );
            number1AscensionPendingBonusEssence = 0;
            number1AscensionClapEssenceMultiplier = 1;
            number1AscensionClapEssenceProcCount = 0;
            number1HasAscended = true;
            updateNumber2SidebarUnlockUI();
        },
        shrinkHandsUiToSingleHandKeepingFirst() {
            shrinkSpeedRowsTo(1);
            while (hands.length > 1) {
                const h = hands.pop();
                if (h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
            }
        },
        bootstrapLanesArraysAutobuyTimeWarpCheapenFlagsForAscension() {
            const autobuyDefaultAsc = ascensionAutobuyDefaultOnForNewHands();
            const hadAutobuyEnabled = autoBuyEnabledByHand.some((v, i) => i < unlockedHands && v);
            const autobuyAfterAsc = resolveAutobuyLanesAfterAscensionReset({
                ascensionDefaultOnForNewHands: autobuyDefaultAsc,
                hasAscended: number1HasAscended,
                anyHandHadAutobuyEnabled: hadAutobuyEnabled
            });
            unlockedHands = 1;
            handEarnings = Array(maxHands).fill(0);
            const ascHandStartFloor = getAscensionHandUnlockStartingCountFloor();
            handEarnings[0] = ascHandStartFloor > 0 ? ascHandStartFloor : 1;
            speedLevel = Array(maxHands).fill(0);
            speedBonusLevel = Array(maxHands).fill(0);
            clapDigitPrevious = Array(maxHands).fill(-1);
            clapCooldownUntilMsByHand = Array(maxHands).fill(0);
            cheapenLevel = Array(maxHands).fill(0);
            cheapenBonusLevel = Array(maxHands).fill(0);
            slowdownLevel = Array(maxHands).fill(0);
            slowdownBonusLevel = Array(maxHands).fill(0);
            slowdownCompactionUnlockedLatched = false;
            slowdownUnlockLogged = false;
            timeWarpAuraActiveByHand = [];
            timeWarpAuraAppearedAtMsByHand = [];
            timeWarpNextSpawnInSec = 0;
            timeWarpUnlockLogged = false;
            {
                autoBuyUnlocked = autobuyAfterAsc.unlocked;
                copyArrayIntoExisting(autoBuyEnabledByHand, [autobuyAfterAsc.hand0Enabled]);
            }
            copyArrayIntoExisting(autoBuyCountdownSecondsByHand, [0]);
            cheapenSectionUnlocked = false;
            cheapenAutoBuyCountdownByHand = [];
            slowdownAutoBuyCountdownByHand = [];
        },
        resetTurboAfterAscension() {
            turboBoostMeter = 0;
            turboBoostUnlocked = false;
            turboBoostEnabled = true;
            turboActivationCount = 0;
            turboScensionBurnLevel = 0;
            turboScensionTankLevel = 0;
            turboScensionMultLevel = 0;
            turboScensionFillLevel = 0;
            turboLevelerBank = 0;
            turboLevelerPurchases = 0;
            if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = true;
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = "On";
            if (turboBoostWrapEl) {
                turboBoostWrapEl.style.display = "none";
                turboBoostWrapEl.setAttribute("aria-hidden", "true");
            }
        },
        resetCombosDiscoveryAndObjectivesAfterAscension() {
            earnedComboNames.length = 0;
            comboActivationCounts = {};
            comboDiscoveryMilestonePendingQueue.length = 0;
            comboDiscoveryMilestoneReadyAtMs = 0;
            comboDiscoveryMilestoneCooldownSpanMs = 0;
            resetComboIndexFilters();
            previousTickActiveComboNames = new Set();
            objectives.forEach(o => {
                o.achieved = false;
            });
        },
        rebindPrimaryHandIntoFirstMountAndRender() {
            const h0 = hands[0];
            if (h0) {
                h0.count = 1;
                h0.tickAccBig = 0n;
                if (h0.el && speedRowRefs[0] && speedRowRefs[0].handMountEl && h0.el.parentNode !== speedRowRefs[0].handMountEl) {
                    speedRowRefs[0].handMountEl.appendChild(h0.el);
                }
                h0.render();
            }
        },
        recalculateTotalsHideUpgradeStripeIfBare() {
            number1RunPeakTotalCount = 0;
            number1RunStartedAtMs = Date.now();
            refreshTotalFromHandEarnings();
            if (upgradeContainer && totalChanges < 10) upgradeContainer.classList.remove("show-upgrade-content");
            incrementalEl.textContent = formatCount(totalChanges);
        },
        refreshAllStaleUiAfterAscension() {
            ensureSpeedRows();
            updateObjectives();
            updateMilestoneUI();
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateTimeWarpAuraUI();
            updateRateDisplay();
            updateTurboBoostUI({ force: true });
            updateComboUI();
            updateEarnedBonusesUI();
            updatePageButtonUnlocks();
            refreshOverviewAndAscensionPanelsIfOpen();
        }
    });

    const number1AscensionFlowUi = createNumber1AscensionFlowUi({
        ascensionConfirmOverlayEl,
        ascensionConfirmBodyEl,
        ascensionIntroOverlayEl,
        ascensionIntroContinueBtn,
        ascensionConfirmCancelBtn,
        ascensionConfirmAscendBtn,
        ascensionReadyCtaEl,
        formatCount,
        getAscensionGainBreakdown: () => computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal()),
        getTotalChanges: () => totalChanges,
        getNumber1AscensionEssence: () => number1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle,
        isNumber1AscensionReady,
        setGamePaused: v => {
            gamePaused = v;
        },
        gameplaySimFrozen,
        hasSeenAscNumber1Intro: () => ascensionNumber1IntroSeen,
        markAscNumber1IntroSeen() {
            ascensionNumber1IntroSeen = true;
        },
        autosaveNow,
        performNumber1Ascension,
    });
    beginNumber1AscensionFlow = number1AscensionFlowUi.beginNumber1AscensionFlow;
    maybeShowFirstAscensionIntroOnUnlock = number1AscensionFlowUi.maybeShowFirstAscensionIntroOnUnlock;
    number1AscensionFlowUi.attachAscensionFlowDomListeners();

    const ledgerBeamVfx = createLedgerBeamVfx({
        window,
        document,
        isSettingsPanelOpen,
        isPagePanelOpen,
        getCurrentNumberMode: () => typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1,
        getUnlockedHands: () => unlockedHands,
        getSpeedRowRefs: () => speedRowRefs,
        ascensionConfirmOverlayEl,
        pagePanelEl,
        ambientMessageTickerEl,
        actionLogEl,
        actionLogContainer,
        incrementalRateEl
    });
    ledgerBeamPlayBonusBridge.play = (catalogBefore, catalogAfter, patternMultLabel) => {
        ledgerBeamVfx.playBonus(catalogBefore, catalogAfter, patternMultLabel);
    };
    function snapshotHandLedgerBonusDisplays() {
        return ledgerBeamVfx.snapshotHandLedgerBonusDisplays();
    }
    function ledgerBeamAfterClapBonuses(beforeSnap) {
        ledgerBeamVfx.afterClapBonuses(beforeSnap);
    }

    const number1ClapTick = createNumber1ClapTick({
        getUnlockedHands: () => unlockedHands,
        getHands: () => hands,
        computeAscensionGrantTotals,
        cheapenBonusLevel,
        slowdownBonusLevel,
        speedLevel,
        speedBonusLevel,
        clapCooldownUntilMsByHand,
        clapDigitPrevious,
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
        settings,
        isPagePanelOpen,
        pagePanelEl,
        getNumber1AscensionClapEssenceMultiplier,
        applyClapEssenceMultiplierProc(step) {
            number1AscensionClapEssenceMultiplier *= 1 + step;
            number1AscensionClapEssenceProcCount++;
        }
    });

    let lastSameSpeedHandAlignWallMs = Date.now();
    const SAME_SPEED_HAND_ALIGN_INTERVAL_MS = 1000;
    /** Re-align digit + sub-tick carry for hands that share the same speed tier (lowest-id hand is source of truth). */
    function maybeAlignSameSpeedHandPhasesFromWallClock() {
        if (gameplaySimFrozen()) return;
        const now = Date.now();
        if (now - lastSameSpeedHandAlignWallMs < SAME_SPEED_HAND_ALIGN_INTERVAL_MS) return;
        lastSameSpeedHandAlignWallMs = now;
        alignSameSpeedHandPhases({
            hands,
            unlockedHands,
            handBaseSpeed: HAND_BASE_SPEED,
            getTickIntervalMs,
            getHandSpeedSyncBucketKey
        });
    }

    const number1TurboGameLoopStep = createNumber1TurboGameLoopStep({
        getTotalChanges: () => totalChanges,
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        getTurboBoostEnabled: () => turboBoostEnabled,
        getTurboBoostMeter: () => turboBoostMeter,
        incrementTurboActivationCount: () => {
            turboActivationCount++;
        },
        updateTurboBurn,
        applyTurboPassiveMeterRegen,
        isTurboScensionUpgradeAutobuyUnlocked,
        gameplaySimFrozen,
        tryTurboScensionActivationUpgrade,
        autosaveNow,
        updateTurboBoostUI,
        updateRateDisplay
    });

    const number1TickApplyStep = createNumber1TickApplyStep({
        getUnlockedHands: () => unlockedHands,
        getHandEarnings: () => handEarnings,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl: () => incrementalEl,
        formatCount,
        getTotalChanges: () => totalChanges,
        updateObjectives: () => number1ObjectivesBoot.scheduleObjectiveDomFlush(),
        maybeShowFirstAscensionIntroOnUnlock: () => maybeShowFirstAscensionIntroOnUnlock()
    });
    flushAutobuyDeferredTotalsIfAny = number1TickApplyStep.flushAutobuyDeferredTotalsIfAny;
    markAutobuyDeferredTotalsPending = number1TickApplyStep.markAutobuyDeferredTotalsPending;

    /* ---------------------------------------------------------
       GAME LOOP ASSEMBLY (step deps, turbo tick apply, throttled UI flush)
    --------------------------------------------------------- */
    const { UI_UPDATE_THROTTLE_MS, flushLoopUiThrottled, number1GameLoopStepDeps, runGameLoopStep } = createNumber1GameLoopAssembly({
        legacyLoopFlush: {
            getBatchedUpgradeUiFlush: () => batchedUpgradeUiFlush,
            setBatchedUpgradeUiFlush: v => { batchedUpgradeUiFlush = v; },
            updateSpeedUpgradeUI,
            updateCheapenUpgradeUI,
            updateSlowdownUpgradeUI,
            updateTimeWarpAuraUI,
            updateRateDisplay
        },
        gameLoopStep: {
            tickBackgroundNumberModules,
            updateBlackHolePhaseStep,
            syncBlackHolePhase1Vfx,
            getCurrentNumberMode: () => typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1,
            shouldRunNumber2Foreground: mode => mode === 2 && isNumber2Unlocked() && number2State.started,
            runNumber2GameLoopStep: dtSec => number2.runGameLoopStep(dtSec),
            processComboDiscoveryMilestoneIfUnlocked: () => {
                if (unlockedHands >= 2) tryProcessOneComboDiscoveryMilestone(Date.now());
            },
            getBlackHolePhase,
            runBlackHolePhase7Step: backgroundTab => {
                totalChanges = Math.floor(number1BlackHoleState.phase7EpilogueCounter || 0);
                handEarnings[0] = totalChanges;
                if (totalChanges > number1RunPeakTotalCount) number1RunPeakTotalCount = totalChanges;
                if (!backgroundTab) {
                    if (incrementalCountLabelEl) incrementalCountLabelEl.textContent = "Epilogue Count";
                    if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
                    updateRateDisplay();
                    updateMilestoneUI();
                }
            },
            updateTimeWarpSystem,
            maybeAlignSameSpeedHandPhasesFromWallClock,
            getUnlockedHands: () => unlockedHands,
            getHands: () => hands,
            getTickIntervalMs,
            getHandSpeedSyncBucketKey,
            getEffectiveSpeedLevel,
            getSpeedMultiplierBigForLevel,
            processClappingThisTick: number1ClapTick.processClappingThisTick,
            updateTurboStep: number1TurboGameLoopStep.updateTurboStep,
            updateComboStep: backgroundTab => {
                if (backgroundTab) {
                    if (unlockedHands >= 2) tryProcessOneComboDiscoveryMilestone(Date.now());
                } else {
                    updateComboUI();
                }
            },
            getComboMultiplier,
            getTurboCountMultiplier,
            getNumber1BlackHoleProductionMult,
            getSlowdownMultiplier,
            applyTickGains: number1TickApplyStep.applyTickGains,
            runAutobuyStep: () => {
                /* Autobuy uses wall-clock dt via GAME_LOOP_MS; must run every step — not only when a hand tick fires (speed 0 = rare ticks, countdown would barely move). */
                maybeAutoBuySpeedUpgrade();
                maybeAutoBuyCheapen();
                maybeAutoBuySlowdown();
            },
            flushAutobuyDeferredTotalsIfAny
        }
    });

    let lastOverviewUpdateMs = 0;
    const OVERVIEW_PANEL_LIVE_PATCH_MS = 1000;

    number1LoopRuntime.startGameLoop();
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) beginHiddenOfflineTracking();
        else endHiddenOfflineTracking();
    });

    logTickerRt.startPeriodicAmbientAndAdaptive({
        shouldSkipAmbientRandomTicker: gameplaySimFrozen
    });

    upgradeDom.attachUpgradeInteractionListeners({
        onWindowScrollResizeForUpgrades,
        addToLog,
        buySpeedUpgradeForHand,
        buyCheapenUpgradeForHand,
        buySlowdownUpgradeForHand,
        activateTimeWarpAuraForHand,
        ensureTimeWarpArrays,
        isTimeWarpUnlocked,
        timeWarpAuraActiveByHand,
        playTimeWarpScreenEffect
    });
    initTopCountRowFitObservers();
    updateSpeedUpgradeUI();
    updateCheapenUpgradeUI();
    updateSlowdownUpgradeUI();
    updateTimeWarpAuraUI();
    updateRateDisplay();
    updateMilestoneUI();
    updateComboUI();
    updateEarnedBonusesUI();
    updatePageButtonUnlocks();
    updateNumber2SidebarUnlockUI();
    initInlineRightPanels();
    initNumber1StageAccretionDiskBg();
    loadSettings();
    applyTheme();
    applySettingsToUI();
    const savedGameData = readSaveData(localStorage);
    if (savedGameData) {
        applyLoadedState(savedGameData);
        const savedAt = Number(savedGameData.savedAt) || Date.now();
        applyOfflineProgress(Date.now() - savedAt, { showSummary: true });
    }
    updateSpeedUpgradeUI();
    updateCheapenUpgradeUI();
    updateSlowdownUpgradeUI();
    syncPlayStageForNumberMode(typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1);
    try {
        number2.bindUI();
    } catch (err) {
        if (typeof console !== "undefined" && console.error) console.error("Number 2 UI bind failed:", err);
    }
    attachN1DevTools({
        devToolsLoadTimeMs,
        els: {
            devToolsToggle: document.getElementById("dev-tools-toggle"),
            devToolsPanel: document.getElementById("dev-tools-panel"),
            devSecondsElapsed: document.getElementById("dev-seconds-elapsed"),
            devSaveTotalSecondsEl: document.getElementById("dev-save-total-seconds"),
            devAddCountInput: document.getElementById("dev-add-count-input"),
            devAddCountBtn: document.getElementById("dev-add-count-btn"),
            devAddAscensionEssenceInput: document.getElementById("dev-add-ascension-essence-input"),
            devAddAscensionEssenceBtn: document.getElementById("dev-add-ascension-essence-btn"),
            devAllAutobuyCheckbox: document.getElementById("dev-all-autobuy"),
            devAutobuyDelay01Checkbox: document.getElementById("dev-autobuy-delay-01"),
            devAutobuyCheapenCheckbox: document.getElementById("dev-autobuy-cheapen"),
            devAutobuySlowdownCheckbox: document.getElementById("dev-autobuy-slowdown"),
            blackHolePhaseSelect: document.getElementById("dev-black-hole-phase-select"),
            devBlackHolePhaseApplyBtn: document.getElementById("dev-black-hole-phase-apply"),
            devPauseGameCheckbox: document.getElementById("dev-pause-game"),
            devN1StageBgStaticCheckbox: document.getElementById("dev-n1-stage-bg-static"),
            devComboTurboFillCheckbox: document.getElementById("dev-combo-turbo-fill"),
            devDeleteSaveBtn
        },
        n1Gameplay: {
            displayTotalPlaySeconds: () => number1LoopRuntime.getDisplayTotalPlayTimeMs(),
            getBlackHolePhase,
            freeze: {
                get: () => devFreezeGame,
                set: v => {
                    devFreezeGame = v;
                }
            },
            comboTurboFillFromCombosFlag: {
                get: () => devComboTurboFillFromCombosEnabled,
                set: v => {
                    devComboTurboFillFromCombosEnabled = !!v;
                }
            },
            getDevHandsRuntime: () => ({
                maxHands,
                setUnlockedCapAndHands(n) {
                    unlockedHandsCap = n;
                    unlockedHands = n;
                },
                setHandEarning(i, v) {
                    handEarnings[i] = v;
                },
                getHandEarning(i) {
                    return handEarnings[i] || 0;
                },
                clearHandSideForDev(i) {
                    handEarnings[i] = 0;
                    autoBuyEnabledByHand[i] = false;
                    autoBuyCountdownSecondsByHand[i] = 0;
                    timeWarpAuraActiveByHand[i] = false;
                    timeWarpAuraAppearedAtMsByHand[i] = 0;
                },
                hands,
                speedRowRefs
            }),
            getAscensionMapNodes: () => ASCENSION_MAP_NODES,
            ascending: {
                setHasAscended: v => {
                    number1HasAscended = v;
                },
                setAscensionNodeIds: ids => {
                    number1AscensionNodeIds = ids;
                },
                clampEssenceForDevUnlock: () => {
                    if (number1AscensionEssence < 5000) number1AscensionEssence = 5000;
                },
                getBlackHoleMutableState: () => number1BlackHoleState
            },
            setTotalChanges: v => {
                totalChanges = v;
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
                updateEarnedBonusesUI();
                updatePageButtonUnlocks();
                refreshOverviewAndAscensionPanelsIfOpen();
            },
            maybeApplyMidPhaseHandFloor: applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
            ensureSpeedRows,
            shrinkSpeedRowsTo,
            autoBuyDelayStandardSeconds: () => AUTO_BUY_DELAY_SECONDS,
            autoBuyDelayOverrideSeconds: {
                get: () => devAutoBuyDelaySeconds,
                set: v => {
                    devAutoBuyDelaySeconds = v;
                }
            },
            setAutoBuyUnlockedDev: v => {
                autoBuyUnlocked = v;
            },
            unlockedHandsGetter: () => unlockedHands,
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
            flushCheapenAutobuySeedsDev: () => {
                if (!devCheapenAutobuyOn) return;
                while (cheapenAutoBuyCountdownByHand.length < unlockedHands) cheapenAutoBuyCountdownByHand.push(0);
                for (let i = 0; i < unlockedHands; i++) {
                    const level = cheapenLevel[i] ?? 0;
                    if (level >= getMaxCheapenLevel()) continue;
                    const cost = getCheapenUpgradeCost(i, level + 1);
                    if ((handEarnings[i] || 0) >= cost) cheapenAutoBuyCountdownByHand[i] = DEV_CHEAPEN_AUTOBUY_DELAY;
                }
            },
            flushSlowdownAutobuySeedsDev: () => {
                if (!devSlowdownAutobuyOn || !isSlowdownUnlocked()) return;
                while (slowdownAutoBuyCountdownByHand.length < unlockedHands) slowdownAutoBuyCountdownByHand.push(0);
                for (let i = 0; i < unlockedHands; i++) {
                    const level = slowdownLevel[i] ?? 0;
                    if (level >= getMaxSlowdownLevelCap()) continue;
                    const cost = getSlowdownUpgradeCost(level + 1);
                    if (cost !== null && (handEarnings[i] || 0) >= cost) slowdownAutoBuyCountdownByHand[i] = DEV_SLOWDOWN_AUTOBUY_DELAY;
                }
            },
            updateSpeedUpgradeUI,
            onDeleteSaveClick: showDeleteSaveConfirmDialog,
            bumpHand0EarningsDev: val => {
                if (val <= 0) return;
                handEarnings[0] = (handEarnings[0] || 0) + val;
                refreshTotalFromHandEarnings();
                if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
                updateObjectives();
                updateSpeedUpgradeUI();
                updateCheapenUpgradeUI();
                updateSlowdownUpgradeUI();
                updateRateDisplay();
            },
            addAscensionEssenceDev: val => {
                if (val <= 0) return;
                const add = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(val));
                number1AscensionEssence = Math.min(Number.MAX_SAFE_INTEGER, number1AscensionEssence + add);
                markMeaningfulProgress();
                updateMilestoneUI();
                patchAscensionPanelLiveDom();
                refreshGlobalOverviewPanelIfOpen();
                autosaveNow();
            },
            addToLog,
            autosaveNow
        }
    });

    updateObjectives();
    updateMilestoneUI();
    updateTurboBoostUI({ force: true });
    updateRateDisplay();
    updateSlowdownUpgradeUI();
    updateTimeWarpAuraUI();
    updateEarnedBonusesUI();
    updatePageButtonUnlocks();
    updateNumber2SidebarUnlockUI();
    maybeShowFirstAscensionIntroOnUnlock();
    syncPhase1MassFillCssVars();
    syncPhase1TesseractCanvasesInRoot(document.body);
    n1SaveOffline.registerWindowAutosave(window, AUTOSAVE_INTERVAL_MS);

    /* ---------------------------------------------------------
       Hand milestones: checkUnlockHands() via syncUnlocksWithTotalCount → refreshTotalFromHandEarnings()
    --------------------------------------------------------- */
