import {
    NUMBER2_ASCENSION_READY_TOTAL
} from "./number2-rules.js";
import {
    BLACK_HOLE_DIGEST_BASE_MS,
    BLACK_HOLE_EVAPORATION_CAP,
    BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS,
    BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS,
    BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS,
    BLACK_HOLE_FURNACE_MULT_PER_POWER,
    BLACK_HOLE_FURNACE_SHORTER_ORBIT_TRIM,
    BLACK_HOLE_MAX_LEVEL,
    BLACK_HOLE_MULT_PER_LEVEL,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP,
    BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC,
    BLACK_HOLE_PHASE4_WAVE_BOOST_MULT,
    BLACK_HOLE_SCREEN_FX_MS,
    clampBlackHolePhase as clampBlackHolePhaseRule,
    clampBlackHolePhase2CollapseTier as clampBlackHolePhase2CollapseTierRule,
    createNumber1BlackHoleState,
    createNumber1BlackHoleUxFlags,
    createNumber1BlackHoleDevPhasePreset,
    getBlackHoleFurnaceEssenceBonus as getBlackHoleFurnaceEssenceBonusRule,
    getBlackHoleFurnaceMult as getBlackHoleFurnaceMultRule,
    getBlackHolePhase2CollapseErgosphereTier as getBlackHolePhase2CollapseErgosphereTierRule,
    getBlackHolePhase2CollapseMassTier as getBlackHolePhase2CollapseMassTierRule,
    getBlackHolePhase2CollapsePhotonTier as getBlackHolePhase2CollapsePhotonTierRule,
    getBlackHolePhase2CollapseUpgradeCost as getBlackHolePhase2CollapseUpgradeCostRule,
    getBlackHolePhase2CostAtLevel as getBlackHolePhase2CostAtLevelRule,
    getBlackHolePhase2MassCouplingCostMult as getBlackHolePhase2MassCouplingCostMultRule,
    getBlackHolePhase2PhotonHawkingCdTrimSec as getBlackHolePhase2PhotonHawkingCdTrimSecRule,
    getBlackHolePhase2PhotonShellMult as getBlackHolePhase2PhotonShellMultRule,
    getBlackHolePhase1AscensionEssenceMult as getBlackHolePhase1AscensionEssenceMultRule,
    getBlackHolePhase1FillRatio as getBlackHolePhase1FillRatioRule,
    getBlackHolePhase1RunCpsMult as getBlackHolePhase1RunCpsMultRule,
    getBlackHolePhase1SlowdownCapBonus as getBlackHolePhase1SlowdownCapBonusRule,
    getBlackHolePhase3TrackCost as getBlackHolePhase3TrackCostRule,
    getBlackHolePhase3TrackLevel as getBlackHolePhase3TrackLevelRule,
    getBlackHolePhase3UpgradeFrac as getBlackHolePhase3UpgradeFracRule,
    getBlackHolePhase4NextCostEssenceForWave as getBlackHolePhase4NextCostEssenceForWaveRule,
    getBlackHolePhase5DigestCurve as getBlackHolePhase5DigestCurveRule,
    getBlackHolePhase5DigestProgressAt as getBlackHolePhase5DigestProgressAtRule,
    getBlackHolePhase5EffectiveFurnacePower as getBlackHolePhase5EffectiveFurnacePowerRule,
    getBlackHolePhase5EssenceRefineryBonus as getBlackHolePhase5EssenceRefineryBonusRule,
    getBlackHolePhase5HotterCoreMult as getBlackHolePhase5HotterCoreMultRule,
    getBlackHolePhase5MutationLevel as getBlackHolePhase5MutationLevelRule,
    getBlackHolePhase5MutationTotal as getBlackHolePhase5MutationTotalRule,
    getBlackHolePhase5ShorterOrbitMult as getBlackHolePhase5ShorterOrbitMultRule,
    getBlackHolePhase6NextJetUpgradeCostEssence as getBlackHolePhase6NextJetUpgradeCostEssenceRule,
    getBlackHolePhase6TrackCost as getBlackHolePhase6TrackCostRule,
    getBlackHolePhase6TrackLevel as getBlackHolePhase6TrackLevelRule,
    getBlackHoleWaveIntervalSec as getBlackHoleWaveIntervalSecRule,
    isBlackHolePhase3Complete as isBlackHolePhase3CompleteRule,
    isBlackHolePhase2MassPourUnlocked as isBlackHolePhase2MassPourUnlockedRule,
    normalizeNumber1BlackHoleStateFromSaveData,
    syncNumber1BlackHolePhase3LegacyLevel
} from "./number1-black-hole.js";
import {
    createNumber2Controller,
    createNumber2ModuleDefinition,
    createNumber2State
} from "./number2-game.js";

    /** Stoke won't compress digestion below ~this much remaining time (~8s, within typical 5–10s UX buffer). */
    const BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS = 8000;

    /* ---------------------------------------------------------
       ASCII HANDS (1–10)
    --------------------------------------------------------- */
    const hands1 = [

`       _	
      | |
      | |
 _ _ _| |
| | | | |  
|       |_   
|         \\ 
|          \\
|          |
 \\        /
  |      /
  |  1  |  
`, // 1

`     _  
    | |_	
    | | |
    | | |
 _ _| | |
| | | | |  
|       |_   
|         \\  
|          \\
|          |
 \\        /
  |      /
  |  2  | 
  `, // 2

`     _  
   _| |_	
  | | | |
  | | | |
 _| | | |
| | | | |  
|       |_   
|         \\ 
|          |
|          |
 \\        /
  |      /
  |  3  | 
  `, // 3

`     _  
   _| |_	
 _| | | |
| | | | |
| | | | |
| | | | |  
|       |_  
|         \\ 
|          |
|          |
 \\        /
  |      /
  |  4  |  
  `, // 4

`     _  
   _| |_	
 _| | | |
| | | | |
| | | | |
| | | | |    _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  5  |  
  `, // 5

`

 _    
| |  
| |_ _ _ 
| | | | |   _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  6  |  
  `, // 6 

`
   _  
 _| | 
| | |
| | |_ _ 
| | | | |   _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  7  | 
  `, // 7

`     _ 
   _| |
 _| | |
| | | |
| | | |_ 
| | | | |    _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  8  |
  `, // 8

`

        __
       /   \\
 _ _ _/  /\\_\\
| | | | |    _
|       |   / /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  9  | 
  `, // 9 

`



 _ _ _ _  
| | | | |     
|       |      
|        \\_   
|          | 
|          / 
 \\        /
  |      /
  |  10 |  
  ` // 10  
    ];

/* ---------------------------------------------------------
       GLOBAL STATE
    --------------------------------------------------------- */
    const maxHands = 10;
    let totalChanges = 1;
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

    function refreshTotalFromHandEarnings() {
        let s = 0;
        for (let i = 0; i < unlockedHands; i++) s += handEarnings[i] || 0;
        totalChanges = Math.min(BLACK_HOLE_EVAPORATION_CAP, s);
        syncUnlocksWithTotalCount();
    }

    const incrementalEl = document.getElementById("incremental-count");
    const incrementalCountLabelEl = document.getElementById("incremental-count-label");
    const incrementalRateEl = document.getElementById("incremental-rate");
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

    function isPagePanelOpen() {
        return !!pagePanelEl && pagePanelEl.style.display !== "none";
    }
    function isSettingsPanelOpen() {
        return !!settingsPanelEl && settingsPanelEl.style.display !== "none";
    }
    function syncInlinePanelsVsGameplay() {
        if (!upgradeContainer) return;
        const panelOpen = isPagePanelOpen() || isSettingsPanelOpen();
        upgradeContainer.style.display = panelOpen ? "none" : "";
        const topCountRow = document.querySelector(".top-count-row");
        if (topCountRow) {
            const wideReading = isPagePanelOpen() && pagePanelEl &&
                (pagePanelEl.dataset.openPageId === "overview" || pagePanelEl.dataset.openPageId === "ascension");
            topCountRow.style.display = wideReading ? "none" : "";
        }
    }
    function closeInlineMainStagePanels(opts) {
        const keep = (opts && opts.keep) || "";
        if (settingsPanelEl && keep !== "settings") settingsPanelEl.style.display = "none";
        if (pagePanelEl && keep !== "page") {
            const wasAscension = pagePanelEl.dataset.openPageId === "ascension";
            pagePanelEl.style.display = "none";
            delete pagePanelEl.dataset.openPageId;
            if (wasAscension) teardownAscensionMapPanZoom();
        }
        syncInlinePanelsVsGameplay();
    }
    function initInlineRightPanels() {
        if (!playStageEl) return;
        /** insertBefore(ref) requires ref be a direct child of #play-stage; #upgrade-container lives under #number1-stage-root. */
        function playStageInlineInsertBeforeRef() {
            if (upgradeContainer && upgradeContainer.parentElement === playStageEl) return upgradeContainer;
            const n1 = document.getElementById("number1-stage-root");
            if (n1 && n1.parentElement === playStageEl) return n1;
            const n2 = document.getElementById("number2-stage");
            if (n2 && n2.parentElement === playStageEl) return n2;
            return null;
        }
        const inlinePanelRef = playStageInlineInsertBeforeRef();
        if (settingsPanelEl) {
            settingsPanelEl.classList.add("settings-panel--inline");
            settingsPanelEl.setAttribute("aria-modal", "false");
            if (settingsPanelEl.parentElement !== playStageEl) playStageEl.insertBefore(settingsPanelEl, inlinePanelRef);
        }
        if (pagePanelEl) {
            pagePanelEl.classList.add("page-panel--inline");
            pagePanelEl.setAttribute("aria-modal", "false");
            if (pagePanelEl.parentElement !== playStageEl) playStageEl.insertBefore(pagePanelEl, inlinePanelRef);
        }
        if (pageModalEl) pageModalEl.classList.add("page-modal--inline");
        syncInlinePanelsVsGameplay();
    }

    const ACTION_LOG_MAX = 50;
    const ACTION_LOG_VISIBLE = 3;
    const ACTION_LOG_EXPANDED = 15;
    const TICKER_SPEED_PX_PER_SEC = 92;
    const TICKER_ITEM_GAP_PX = 28;
    const TICKER_QUEUE_MAX = 50;
    const actionLogEntries = [];
    const tickerQueue = [];
    const activeTickerItems = [];
    let tickerReducedMotionQuery = null;
    let tickerSpawnTimerId = 0;
    let tickerNextSpawnAtMs = 0;
    let actionLogExpanded = false;
    let messageLogLastRenderedVisibleCount = -1;
    let messageLogLastRenderedHeadSig = "";
    let messageLogLastRenderedTailSig = "";
    const RECENT_RANDOM_LOG_COUNT = 3;
    const recentRandomLogMessages = [];
    /** Typed message log: category drives GLaDOS-style color coding; humor filtered by settings. */
    const LOG_CATEGORIES = ["tip", "fact", "milestone", "warning", "humor"];
    const LOG_MESSAGE_ENTRIES = [
        { text: "Keep counting!", category: "tip" },
        { text: "How fast can you count?", category: "tip" },
        { text: "Have you ever counted on your fingers? What about counting with multiple hands?", category: "tip" },
        { text: "Every number counts.", category: "tip" },
        { text: "Speed is key.", category: "tip" },
        { text: "Counting is fun.", category: "tip" },
        { text: "Counting is addictive.", category: "tip" },
        { text: "Counting is rewarding.", category: "tip" },
        { text: "Counting is satisfying.", category: "tip" },
        { text: "Counting is relaxing.", category: "tip" },
        { text: "You can always count to one more.", category: "tip" },
        { text: "Counting is a skill that can be improved.", category: "tip" },
        { text: "At one point we counted from zero to one for the very first time.", category: "fact" },
        { text: "We don't know the biggest number someone or something has counted to.", category: "fact" },
        { text: "This game will have exponents in the hundreds but the universe only has 10e80 atoms. However, the universe is infinitely more complex than this game. Explain that to me.", category: "fact" },
        { text: "Most people can identify 4-5 objects without counting. Some people are better than others, this is called subitizing.  ", category: "fact" },
        { text: "I wanted to add subtraction but I came up with nothing.", category: "humor" },
        { text: "If machines do all the counting what will we use our fingers for?", category: "humor" }
    ];
    const SETTINGS_KEY = "naf.settings.v1";
    const SAVE_KEY = "naf.save.v1";
    /** When true, autosave is skipped (e.g. right before deleting save + reload). */
    let suppressAutosave = false;
    const AUTOSAVE_INTERVAL_MS = 10000;
    const DEFAULT_SETTINGS = { theme: "light", adaptiveTipsEnabled: true, curtainEnabled: true, humorEnabled: true, showClapAnimation: true, offlineCapHours: 8 };
    let settings = { ...DEFAULT_SETTINGS };
    const ADAPTIVE_TIP_FIRST_STALL_MS = 360000;
    const ADAPTIVE_TIP_REPEAT_STALL_MS = 600000;
    let adaptiveLastProgressAtMs = Date.now();
    let adaptiveLastHintAtMs = 0;
    const unlockedNumbers = new Set([1, 2]);
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
    function number2TotalBig() {
        return number2.totalBig();
    }
    function setNumber2TotalBig(b) {
        number2.setTotalBig(b);
    }
    function formatNumber2BigIntDisplay(b) {
        return number2.formatTotalBig(b);
    }
    function getNumber2UpgradeLevel(id) {
        return number2.getUpgradeLevel(id);
    }
    function getNumber2UpgradeDef(id) {
        return number2.getUpgradeDef(id);
    }
    function getNumber2UpgradeCost(u, level) {
        return number2.getUpgradeCost(u, level);
    }
    function getPlayingFairTokenMultiplier() {
        return number2.getPlayingFairTokenMultiplier();
    }
    function addNumber2Tokens(kind, rawAmount, opts) {
        return number2.addTokens(kind, rawAmount, opts);
    }
    function hasNumber2ChanceModByUpgrade(id) {
        return number2.hasChanceModByUpgrade(id);
    }
    function isNumber2UpgradeToggleEnabled(id) {
        return number2.isUpgradeToggleEnabled(id);
    }
    function setExclusiveNumber2Toggle(activeId, on) {
        number2.setExclusiveToggle(activeId, on);
    }
    function areNumber2ChanceModsEnabled() {
        return number2.areChanceModsEnabled();
    }
    function getNumber2Asc2Totals() {
        return number2.getAsc2Totals();
    }
    function getNumber2EffectivePDouble() {
        return number2.getEffectivePDouble();
    }
    function getNumber2LuckPerNothing() {
        return number2.getLuckPerNothing();
    }
    function getNumber2ActiveRollsPerSec() {
        return number2.getActiveRollsPerSec();
    }
    function isNumber2Unlocked() {
        return unlockedNumbers.has(2);
    }
    function canTickNumber2() {
        return number2.canTick();
    }
    function resetNumber2Progress() {
        number2.reset();
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
            updateNumber2StageUI();
        } else {
            n1.style.display = "";
            n2.style.display = "none";
            n2.setAttribute("aria-hidden", "true");
            syncBlackHolePhase1Vfx();
            updateN1GravityCpsStrip();
        }
    }
    function resolveNumber2Roll() {
        return number2.resolveRoll();
    }
    function applyNumber2RollOutcome(res, opts) {
        number2.applyRollOutcome(res, opts);
    }
    function commitNumber2Roll(opts) {
        number2.commitRoll(opts);
    }
    function tickNumber2Background(dtSec) {
        number2.tickBackground(dtSec);
    }
    function runNumber2GameLoopStep(dtSec) {
        number2.runGameLoopStep(dtSec);
    }
    /**
     * Number 1 CPS gain while the stage is not ticking every hand (focused on Number 2, or large offline windows).
     * Same stack as {@link applyOfflineProgress}: raw CPS × combo × turbo × offline-averaged black-hole mult
     * (Hawking/wave boosts time-averaged, not the live burst mult from {@link getNumber1BlackHoleProductionMult}).
     * Phase 7 epilogue: no hand CPS accrual — the epilogue counter advances only in the black-hole phase step.
     * @returns {number} Count integrated for this slice (after rounding)
     */
    function applyNumber1DetachedCpsProgress(dtSec) {
        if (!(dtSec > 0)) return 0;
        if (getBlackHolePhase() === 7) return 0;
        const offlineBhMult = getBlackHoleOfflineProductionMult(dtSec);
        const cpsPerHand = getRawCpsPerHand();
        const rawCps = cpsPerHand.reduce((a, b) => a + b, 0);
        if (rawCps <= 0) return 0;
        const comboMult = getComboMultiplier();
        const turboMult = getTurboCountMultiplier();
        const gained = Math.round(dtSec * rawCps * comboMult * turboMult * offlineBhMult);
        const totalWeight = cpsPerHand.reduce((a, b) => a + b, 0) || 1;
        for (let i = 0; i < unlockedHands; i++) {
            const weight = cpsPerHand[i] || 0;
            handEarnings[i] = (handEarnings[i] || 0) + Math.round((weight / totalWeight) * gained);
        }
        refreshTotalFromHandEarnings();
        return gained;
    }
    function tickNumber1BackgroundCps(dtSec) {
        applyNumber1DetachedCpsProgress(dtSec);
        if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
    }
    function updateNumber2StageUI() {
        number2.updateStageUI();
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
    function markMeaningfulProgress() {
        adaptiveLastProgressAtMs = Date.now();
    }
    function getAdaptiveTipMessage() {
        if (totalChanges < 10) {
            return "Tip: Buy your first Speed upgrade to ramp up early count gain.";
        }
        if (unlockedHands < 2) {
            return "Tip: Keep upgrading Speed and Cheapen on Hand 1 to push toward unlocking Hand 2.";
        }
        if (!turboBoostUnlocked) {
            return "Tip: Match hand digits to discover combos and build stronger multipliers.";
        }
        if (!isSlowdownUnlocked()) {
            return "Tip: Turbo is unlocked. Build meter from combos, then toggle Turbo on. Boost scales with your Burn tier; a full tank runs longer with a bigger cap, and the gauge eases off near empty.";
        }
        if (!isTimeWarpUnlocked()) {
            return "Tip: Slowdown can trade speed for heavier ticks per hand. Use it where upgrades are expensive.";
        }
        return "Tip: Watch for Time Warp auras and click them for a large production burst (" + TIME_WARP_MANUAL_CLICK_SCALE + "× " + getTimeWarpProductionSecondsBonus() + "s of that hand's rate).";
    }
    function maybeEmitAdaptiveTip(nowMs) {
        if (settings.adaptiveTipsEnabled === false) return;
        const now = nowMs || Date.now();
        const sinceProgress = now - adaptiveLastProgressAtMs;
        if (adaptiveLastHintAtMs <= 0) {
            if (sinceProgress < ADAPTIVE_TIP_FIRST_STALL_MS) return;
        } else if (now - adaptiveLastHintAtMs < ADAPTIVE_TIP_REPEAT_STALL_MS) {
            return;
        }
        addToLog(getAdaptiveTipMessage(), "tip");
        adaptiveLastHintAtMs = now;
    }

    function normalizeLogCategory(category) {
        if (LOG_CATEGORIES.indexOf(category) !== -1) return category;
        if (category === "action") return "milestone";
        if (category === "message") return "fact";
        return "fact";
    }
    function isLogCategoryVisible(category) {
        const cat = normalizeLogCategory(category);
        if (cat === "humor" && !settings.humorEnabled) return false;
        return true;
    }
    function prefersReducedTickerMotion() {
        try {
            if (!tickerReducedMotionQuery && window.matchMedia) {
                tickerReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            }
            return !!(tickerReducedMotionQuery && tickerReducedMotionQuery.matches);
        } catch (_) {
            return false;
        }
    }
    function createTickerItem(entry) {
        const cat = normalizeLogCategory(entry.category);
        const item = document.createElement("span");
        item.className = "ambient-message-ticker__item ambient-message-ticker__item--" + cat;
        item.textContent = "[" + logCategoryTag(cat) + "] " + entry.text;
        return item;
    }
    function cleanupTickerItem(item) {
        const idx = activeTickerItems.indexOf(item);
        if (idx !== -1) activeTickerItems.splice(idx, 1);
        if (item && item.parentNode) item.parentNode.removeChild(item);
        if (activeTickerItems.length === 0 && tickerQueue.length > 0 && !tickerSpawnTimerId) {
            spawnTickerItem();
        }
    }
    function scheduleTickerSpawn(delayMs) {
        if (tickerSpawnTimerId || tickerQueue.length === 0) return;
        tickerSpawnTimerId = window.setTimeout(() => {
            tickerSpawnTimerId = 0;
            spawnTickerItem();
        }, Math.max(0, delayMs));
    }
    function spawnTickerItem() {
        if (!ambientMessageTickerEl || tickerQueue.length === 0) return;
        const containerWidth = ambientMessageTickerEl.clientWidth || 600;
        const entry = tickerQueue.shift();
        const item = createTickerItem(entry);
        ambientMessageTickerEl.appendChild(item);
        const width = item.getBoundingClientRect().width || Math.max(80, item.textContent.length * 8);
        const startX = containerWidth;
        const endX = -width - TICKER_ITEM_GAP_PX;
        const durationMs = Math.max(4500, ((startX - endX) / TICKER_SPEED_PX_PER_SEC) * 1000);
        const nextDelayMs = Math.max(240, ((width + TICKER_ITEM_GAP_PX) / TICKER_SPEED_PX_PER_SEC) * 1000);
        item.style.transform = "translate3d(" + startX + "px, 0, 0)";
        activeTickerItems.push(item);
        tickerNextSpawnAtMs = Date.now() + nextDelayMs;
        if (typeof item.animate === "function") {
            const animation = item.animate([
                { transform: "translate3d(" + startX + "px, 0, 0)" },
                { transform: "translate3d(" + endX + "px, 0, 0)" }
            ], {
                duration: durationMs,
                easing: "linear",
                fill: "forwards"
            });
            animation.onfinish = () => cleanupTickerItem(item);
            animation.oncancel = () => cleanupTickerItem(item);
        } else {
            item.style.transition = "transform " + durationMs + "ms linear";
            window.requestAnimationFrame(() => {
                item.style.transform = "translate3d(" + endX + "px, 0, 0)";
            });
            window.setTimeout(() => cleanupTickerItem(item), durationMs);
        }
        scheduleTickerSpawn(nextDelayMs);
    }
    function startTickerLoop() {
        if (!ambientMessageTickerEl) return;
        if (prefersReducedTickerMotion()) {
            const latest = tickerQueue.pop();
            tickerQueue.length = 0;
            activeTickerItems.length = 0;
            if (tickerSpawnTimerId) {
                window.clearTimeout(tickerSpawnTimerId);
                tickerSpawnTimerId = 0;
            }
            ambientMessageTickerEl.replaceChildren();
            if (latest) ambientMessageTickerEl.appendChild(createTickerItem(latest));
            return;
        }
        if (activeTickerItems.length === 0) {
            spawnTickerItem();
            return;
        }
        scheduleTickerSpawn(Math.max(0, tickerNextSpawnAtMs - Date.now()));
    }
    function setAmbientMessage(entry) {
        if (!ambientMessageTickerEl || !entry) return;
        const cat = normalizeLogCategory(entry.category);
        if (!isLogCategoryVisible(cat)) return;
        tickerQueue.push({ text: entry.text, category: cat });
        if (tickerQueue.length > TICKER_QUEUE_MAX) tickerQueue.shift();
        ambientMessageTickerEl.className = "ambient-message-ticker";
        startTickerLoop();
    }
    function addToLog(msg, category) {
        const cat = normalizeLogCategory(category);
        if (!isLogCategoryVisible(cat)) return;
        actionLogEntries.push({ text: msg, category: cat });
        if (actionLogEntries.length > ACTION_LOG_MAX) actionLogEntries.shift();
        setAmbientMessage({ text: msg, category: cat });
        renderActionLog();
        refreshMessageLogPanelIfOpen();
    }
    function renderActionLog() {
        if (!actionLogEl) return;
        const prevTop = actionLogEl.scrollTop;
        const prevLeft = actionLogEl.scrollLeft;
        const prevHeight = actionLogEl.scrollHeight;
        const prevWidth = actionLogEl.scrollWidth;
        const wasPinnedToBottom = (prevTop + actionLogEl.clientHeight) >= (prevHeight - 2);
        const wasPinnedToRight = (prevLeft + actionLogEl.clientWidth) >= (prevWidth - 2);
        const n = actionLogExpanded ? ACTION_LOG_EXPANDED : ACTION_LOG_VISIBLE;
        const visible = actionLogEntries.filter(entry => isLogCategoryVisible(entry.category));
        const toShow = visible.slice(-n);
        actionLogEl.innerHTML = "";
        toShow.forEach(entry => {
            const line = document.createElement("div");
            line.className = "action-log-line action-log-cat-" + entry.category;
            line.setAttribute("data-log-category", entry.category);
            line.textContent = entry.text;
            actionLogEl.appendChild(line);
        });
        if (wasPinnedToBottom) {
            actionLogEl.scrollTop = actionLogEl.scrollHeight;
        } else {
            actionLogEl.scrollTop = prevTop;
        }
        if (wasPinnedToRight) {
            actionLogEl.scrollLeft = actionLogEl.scrollWidth;
        } else {
            actionLogEl.scrollLeft = prevLeft;
        }
    }
    if (actionLogToggle) {
        actionLogToggle.addEventListener("click", () => {
            actionLogExpanded = !actionLogExpanded;
            actionLogToggle.textContent = actionLogExpanded ? "Show less" : "Show more";
            if (actionLogContainer) actionLogContainer.classList.toggle("expanded", actionLogExpanded);
            renderActionLog();
        });
    }

    const NAMES = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion"];
    function formatWithCommas(n) {
        if (n < 1000) return String(n);
        const parts = String(n).split(".");
        const withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.length > 1 ? withCommas + "." + parts[1] : withCommas;
    }
    function formatCount(n) {
        if (n < 1e6) return formatWithCommas(n);
        const exp = Math.floor(Math.log10(n));
        const tier = Math.floor(exp / 3);
        const mantissa = (n / Math.pow(10, tier * 3)).toFixed(2);
        const name = NAMES[tier] || "e" + (tier * 3);
        return mantissa + " " + name;
    }
    function formatSeconds(sec) {
        const s = Math.max(0, Math.floor(Number(sec) || 0));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const r = s % 60;
        if (h > 0) return h + "h " + m + "m " + r + "s";
        if (m > 0) return m + "m " + r + "s";
        return r + "s";
    }
    /** Compact multiplier text to keep top-center CPS line readable. */
    function formatCompactMultiplier(v) {
        const n = Number(v) || 0;
        if (!(n > 0)) return "0";
        if (n >= 1e9) return n.toExponential(2);
        if (n >= 1e6) return n.toExponential(2);
        if (n >= 1e3) return n.toFixed(1);
        if (n >= 10) return n.toFixed(2);
        return n.toFixed(3);
    }
    /** Turbo-scension level lines: whole numbers only (internal bank/cost may be fractional). */
    function formatTurboScensionLevelDisplay(n) {
        const r = Math.round(Number(n) || 0);
        if (!Number.isFinite(r) || r <= 0) return "0";
        if (r < 1e6) return formatWithCommas(r);
        const exp = Math.floor(Math.log10(r));
        const tier = Math.floor(exp / 3);
        const mantissa = Math.round(r / Math.pow(10, tier * 3));
        const name = NAMES[tier] || "e" + (tier * 3);
        return mantissa + " " + name;
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
        { id: "bh-phase2-tracks", text: "Stabilize all collapse tracks", achieved: false, isComplete: () => getBlackHolePhase() >= 3 || isBlackHolePhase2MassPourUnlocked(), getProgress: () => {
            const total = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER * 3;
            const tiers = getBlackHolePhase2CollapseMassTier() + getBlackHolePhase2CollapsePhotonTier() + getBlackHolePhase2CollapseErgosphereTier();
            return { current: tiers, target: total, pct: getBlackHolePhase() >= 3 ? 100 : Math.max(0, Math.min(100, (tiers / total) * 100)), label: tiers + " / " + total + " tiers" };
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

    function getObjectiveProgress(obj) {
        if (!obj) return { pct: 100, label: "Complete" };
        if (typeof obj.getProgress === "function") {
            try {
                const p = obj.getProgress() || {};
                return {
                    pct: Math.max(0, Math.min(100, Number(p.pct) || 0)),
                    label: p.label || ""
                };
            } catch (_) {
                return { pct: 0, label: "" };
            }
        }
        if (Number.isFinite(obj.goal)) {
            return {
                pct: Math.max(0, Math.min(100, (totalChanges / obj.goal) * 100)),
                label: formatCount(totalChanges) + " / " + formatCount(obj.goal)
            };
        }
        return { pct: 0, label: "" };
    }
    function isObjectiveComplete(obj) {
        if (!obj) return false;
        if (typeof obj.isComplete === "function") {
            try {
                return !!obj.isComplete();
            } catch (_) {
                return false;
            }
        }
        return Number.isFinite(obj.goal) && totalChanges >= obj.goal;
    }
    function renderObjective(obj, totalChanges) {
        const li = document.createElement("li");
        const progress = getObjectiveProgress(obj);
        const prefix = Number.isFinite(obj.goal) ? ("Reach " + formatCount(obj.goal) + " — ") : "";
        li.textContent = prefix + obj.text + (progress.label ? " (" + progress.label + ")" : "");
        if (isObjectiveComplete(obj)) obj.achieved = true;
        if (obj.achieved) {
            li.style.textDecoration = "line-through";
            li.style.color = "#4CAF50";
        }
        return li;
    }

    const objectivesEl = document.getElementById("objectives");
    const CONFETTI_COLORS = ["#4CAF50", "#9aa0ff", "#FFC107", "#E91E63", "#00BCD4", "#8BC34A", "#FF9800"];
    function sprayConfettiFrom(originEl) {
        const el = originEl || objectivesEl;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const count = 18;
        const container = document.createElement("div");
        container.className = "confetti-container";
        container.style.pointerEvents = "none";
        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "confetti-particle";
            const size = 10 + Math.random() * 10;
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = 70 + Math.random() * 90;
            const dx = Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1);
            const dy = Math.sin(angle) * dist - 20;
            p.style.left = (cx - size / 2) + "px";
            p.style.top = (cy - size / 2) + "px";
            p.style.width = size + "px";
            p.style.height = size + "px";
            p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            p.style.setProperty("--dx", dx + "px");
            p.style.setProperty("--dy", dy + "px");
            container.appendChild(p);
        }
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 3200);
    }
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
            objectiveList.appendChild(renderObjective(obj, totalChanges));
        });
        longTermObjectives.forEach(obj => { if (isObjectiveComplete(obj)) obj.achieved = true; });
        const longLastCompleted = longTermObjectives.filter(o => o.achieved).pop();
        const longNextUncompleted = longTermObjectives.find(o => !o.achieved);
        const longTermToShow = [longLastCompleted, longNextUncompleted].filter(Boolean);
        longObjectiveList.innerHTML = "";
        longTermToShow.forEach(obj => {
            longObjectiveList.appendChild(renderObjective(obj, totalChanges));
        });
        updateMilestoneUI();
    }
    function updateMilestoneUI() {
        if (!milestoneTextEl || !milestoneProgressFillEl) return;
        const next = longTermObjectives.find(o => !o.achieved) || longTermObjectives[longTermObjectives.length - 1];
        if (!next) return;
        const progress = getObjectiveProgress(next);
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
    function updateAscensionReadyChrome() {
        const ready = isNumber1AscensionReady();
        if (ascensionReadyBannerEssenceSuffixEl) {
            const gainInfo = computeNumber1AscensionGainBreakdown(totalChanges);
            const parts = ["base " + formatCount(gainInfo.baseGain)];
            if (gainInfo.pendingBonus > 0) parts.push("warp bonus " + formatCount(gainInfo.pendingBonus));
            if (gainInfo.blackHoleMultiplierBonus > 0) {
                parts.push("BH bonus +" + formatCount(gainInfo.blackHoleMultiplierBonus) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)");
            }
            if (gainInfo.multiplierBonus > 0) {
                parts.push("clap mult +" + formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)");
            }
            const bonusText = parts.length > 1 ? (" (" + parts.join(" + ") + ")") : "";
            ascensionReadyBannerEssenceSuffixEl.textContent = ready
                ? "Ascend now for " + formatCount(computeNumber1AscensionGain(totalChanges)) + " essence" + bonusText + "."
                : "";
        }
        if (ascensionReadyBannerEl) {
            ascensionReadyBannerEl.hidden = true;
            ascensionReadyBannerEl.setAttribute("aria-hidden", "true");
        }
        if (ascensionPageBtn) {
            ascensionPageBtn.style.display = (number1HasAscended || ready) ? "" : "none";
            ascensionPageBtn.classList.toggle("page-btn--ascension-ready", ready);
            if (ready) {
                ascensionPageBtn.setAttribute("title", "Ascension ready — click to ascend or manage Essence");
                ascensionPageBtn.setAttribute("aria-label", "Ascension ready");
            } else {
                ascensionPageBtn.removeAttribute("title");
                ascensionPageBtn.removeAttribute("aria-label");
            }
        }
    }
    const ASCENSION_1_MIN_HANDS = 10;
    const ASCENSION_1_REQUIRED_TOTAL = 1e35;
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
    function getNumber1AscensionPendingBonusEssence() {
        const b = Math.floor(Number(number1AscensionPendingBonusEssence) || 0);
        return b > 0 ? b : 0;
    }
    function getNumber1AscensionClapEssenceMultiplier() {
        const m = Number(number1AscensionClapEssenceMultiplier);
        return Number.isFinite(m) && m >= 1 ? m : 1;
    }
    /**
     * Base ascension essence scaling on log10(total count).
     * Anchors: 1e35 -> ~35, 1e42 -> ~75, 1e100 -> ~1000.
     * Two smooth power segments keep growth readable early and rewarding deep runs.
     */
    const ASC_ESSENCE_ANCHOR_X0 = 35;
    const ASC_ESSENCE_ANCHOR_Y0 = 35;
    const ASC_ESSENCE_ANCHOR_X1 = 42;
    const ASC_ESSENCE_ANCHOR_Y1 = 75;
    const ASC_ESSENCE_ANCHOR_X2 = 100;
    const ASC_ESSENCE_ANCHOR_Y2 = 1000;
    const ASC_ESSENCE_SEGMENT1_POWER = 1.08;
    const ASC_ESSENCE_SEGMENT2_POWER = 1.22;
    function computeNumber1AscensionBaseGain(fromTotal) {
        const t = Math.max(1, Number(fromTotal) || 1);
        const x = Math.max(0, Math.log10(t));
        let y;
        if (x <= ASC_ESSENCE_ANCHOR_X0) {
            // Keep pre-ascension-ramp behavior intuitive before deep scaling kicks in.
            y = Math.max(1, x);
        } else if (x <= ASC_ESSENCE_ANCHOR_X1) {
            const u = (x - ASC_ESSENCE_ANCHOR_X0) / (ASC_ESSENCE_ANCHOR_X1 - ASC_ESSENCE_ANCHOR_X0);
            y = ASC_ESSENCE_ANCHOR_Y0 + (ASC_ESSENCE_ANCHOR_Y1 - ASC_ESSENCE_ANCHOR_Y0) * Math.pow(Math.max(0, Math.min(1, u)), ASC_ESSENCE_SEGMENT1_POWER);
        } else if (x <= ASC_ESSENCE_ANCHOR_X2) {
            const u = (x - ASC_ESSENCE_ANCHOR_X1) / (ASC_ESSENCE_ANCHOR_X2 - ASC_ESSENCE_ANCHOR_X1);
            y = ASC_ESSENCE_ANCHOR_Y1 + (ASC_ESSENCE_ANCHOR_Y2 - ASC_ESSENCE_ANCHOR_Y1) * Math.pow(Math.max(0, Math.min(1, u)), ASC_ESSENCE_SEGMENT2_POWER);
        } else {
            // Continue beyond 1e100 with diminishing relative gains.
            const over = x - ASC_ESSENCE_ANCHOR_X2;
            y = ASC_ESSENCE_ANCHOR_Y2 + 80 * Math.pow(over, 0.72);
        }
        return Math.max(1, Math.floor(y));
    }
    function computeNumber1AscensionGainBreakdown(fromTotal) {
        const baseGain = computeNumber1AscensionBaseGain(fromTotal);
        const pendingBonus = getNumber1AscensionPendingBonusEssence();
        const blackHolePhase1Mult = getBlackHolePhase1AscensionEssenceMult();
        const blackHoleParallelBonus = number1BlackHoleState.phase2ParallelBonusPool || 0;
        const blackHoleFurnaceBonus = getBlackHoleFurnaceEssenceBonus();
        const phaseMult = blackHolePhase1Mult + blackHoleParallelBonus + blackHoleFurnaceBonus;
        const beforeMultRaw = (baseGain + pendingBonus) * Math.max(1, phaseMult);
        const beforeMult = Math.max(baseGain + pendingBonus, Math.floor(beforeMultRaw));
        const clapMult = getNumber1AscensionClapEssenceMultiplier();
        const finalGain = Math.max(beforeMult, Math.floor(beforeMult * clapMult));
        return {
            baseGain,
            pendingBonus,
            blackHolePhase1Mult,
            blackHoleParallelBonus,
            blackHoleFurnaceBonus,
            blackHolePhaseMult: phaseMult,
            blackHoleMultiplierBonus: Math.max(0, beforeMult - (baseGain + pendingBonus)),
            beforeMult,
            clapMult,
            multiplierBonus: Math.max(0, finalGain - beforeMult),
            finalGain
        };
    }
    function computeNumber1AscensionGain(fromTotal) {
        return computeNumber1AscensionGainBreakdown(fromTotal).finalGain;
    }
    function getNumber1AscensionRequiredHands() {
        const phase = getBlackHolePhase();
        return phase >= 5 && phase < 7 ? 1 : ASCENSION_1_MIN_HANDS;
    }
    function isNumber1AscensionReady() {
        if (getBlackHolePhase() === 7) return false;
        return unlockedHands >= getNumber1AscensionRequiredHands() && totalChanges >= ASCENSION_1_REQUIRED_TOTAL;
    }
    const ASCENSION_TREE_EXPORT = window.ASCENSION_TREE_EXPORT;
    const ASCENSION_TREE_VERSION = ASCENSION_TREE_EXPORT.VERSION;
    const ASCENSION_MAP_NODES = ASCENSION_TREE_EXPORT.NODES;
    const ASCENSION_FINGER_KEYS = ["pinky", "ring", "middle", "index", "thumb"];
    const ASCENSION_MAP_NODE_BY_ID = {};
    ASCENSION_MAP_NODES.forEach(n => { ASCENSION_MAP_NODE_BY_ID[n.id] = n; });
    /** SVG viewBox height for ascension map (width stays 100); updated in computeAscensionHandLayout. */
    let ascensionMapViewBoxHeight = 100;
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
    function ascensionPurchasedSet() {
        return new Set(number1AscensionNodeIds);
    }
    function isNumber1AscensionTreeFullyPurchased() {
        if (!number1HasAscended || !ASCENSION_MAP_NODES || ASCENSION_MAP_NODES.length === 0) return false;
        const s = ascensionPurchasedSet();
        // Gate should only care whether every current map node is owned.
        // Ignore duplicate/stale entries that may remain in old saves.
        for (let i = 0; i < ASCENSION_MAP_NODES.length; i++) {
            if (!s.has(ASCENSION_MAP_NODES[i].id)) return false;
        }
        return true;
    }
    function getBlackHolePhase() {
        return clampBlackHolePhaseRule(number1BlackHoleState.phase);
    }
    function isBlackHoleArcUnlocked() {
        return number1HasAscended && isNumber1AscensionTreeFullyPurchased();
    }
    function ensureBlackHoleArcStarted() {
        if (!isBlackHoleArcUnlocked()) return;
        if (getBlackHolePhase() > 0) return;
        number1BlackHoleState.phase = 1;
        addToLog("Numerical Mass Accumulator online — pour Ascension Essence until critical mass (350).", "milestone");
    }
    function tryStartNumber1BlackHoleArc() {
        if (!number1HasAscended) return;
        if (!isBlackHoleArcUnlocked()) {
            addToLog("Black Hole is locked. Buy every ascension map node first.", "warning");
            return;
        }
        ensureBlackHoleArcStarted();
        queueBlackHoleUiRefresh();
        autosaveNow();
    }
    function hasBlackHoleProgressLockingRespec() {
        const phase = getBlackHolePhase();
        if (phase > 1) return true;
        if (Math.floor(Number(number1BlackHoleState.phase1EssenceSpent) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase2Mass) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase2EssenceBank) || 0) > 0) return true;
        if (getBlackHolePhase2CollapseMassTier() > 0) return true;
        if (getBlackHolePhase2CollapsePhotonTier() > 0) return true;
        if (getBlackHolePhase2CollapseErgosphereTier() > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase3HawkingStrength) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase3EssenceBank) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase4WaveLevel) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase4EssenceBank) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase5FurnaceLevel) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase6JetBoostLevel) || 0) > 0) return true;
        if (Math.floor(Number(number1BlackHoleState.phase6EssenceBank) || 0) > 0) return true;
        return false;
    }
    function clampBlackHolePhase2CollapseTier(n) {
        return clampBlackHolePhase2CollapseTierRule(n);
    }
    function getBlackHolePhase2CollapseMassTier() {
        return getBlackHolePhase2CollapseMassTierRule(number1BlackHoleState);
    }
    function getBlackHolePhase2CollapsePhotonTier() {
        return getBlackHolePhase2CollapsePhotonTierRule(number1BlackHoleState);
    }
    function getBlackHolePhase2CollapseErgosphereTier() {
        return getBlackHolePhase2CollapseErgosphereTierRule(number1BlackHoleState);
    }
    /** True when each collapse track has reached max tier — mass pour is allowed. */
    function isBlackHolePhase2MassPourUnlocked() {
        return isBlackHolePhase2MassPourUnlockedRule(number1BlackHoleState);
    }
    /** Essence→mass coupling: lowers effective Essence cost per mass step (Phase 2 only). */
    function getBlackHolePhase2MassCouplingCostMult() {
        return getBlackHolePhase2MassCouplingCostMultRule(number1BlackHoleState, getBlackHolePhase());
    }
    /** Photon shell: small persistent counting mult + Hawking cadence trim (tier stored across phases). */
    function getBlackHolePhase2PhotonShellMult() {
        return getBlackHolePhase2PhotonShellMultRule(number1BlackHoleState);
    }
    function getBlackHolePhase2PhotonHawkingCdTrimSec() {
        return getBlackHolePhase2PhotonHawkingCdTrimSecRule(number1BlackHoleState);
    }
    /** Next Essence cost for one purchase on a collapse track (`mass` | `photon` | `ergosphere`). */
    function getBlackHolePhase2CollapseUpgradeCost(track) {
        return getBlackHolePhase2CollapseUpgradeCostRule(number1BlackHoleState, track);
    }
    /** Essence cost for one mass step from current integer mass level L → L+1 (Phase 2 only). */
    function getBlackHolePhase2CostAtLevel(L) {
        return getBlackHolePhase2CostAtLevelRule(L, getBlackHolePhase2MassCouplingCostMult());
    }
    function getBlackHolePhase2MassMult() {
        const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(number1BlackHoleState.phase2Mass) || 0)));
        if (getBlackHolePhase() > 2) {
            if (L <= 0) return 1;
            return Math.pow(BLACK_HOLE_MULT_PER_LEVEL, L);
        }
        const bank = Math.max(0, Math.floor(Number(number1BlackHoleState.phase2EssenceBank) || 0));
        if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return Math.pow(BLACK_HOLE_MULT_PER_LEVEL, BLACK_HOLE_PHASE2_MASS_CAP);
        if (L <= 0 && bank <= 0) return 1;
        const cost = getBlackHolePhase2CostAtLevel(L);
        const frac = cost > 0 ? Math.min(1, bank / cost) : 0;
        return Math.pow(BLACK_HOLE_MULT_PER_LEVEL, L + frac);
    }
    function getBlackHolePhase2NextCostEssence() {
        const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(number1BlackHoleState.phase2Mass) || 0)));
        if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return 0;
        return getBlackHolePhase2CostAtLevel(L);
    }
    function addBlackHolePhase2ParallelBonusFromEssence(spentEssence) {
        if (getBlackHolePhase() !== 2) return 0;
        const spend = Math.max(0, Math.floor(Number(spentEssence) || 0));
        if (spend <= 0) return 0;
        const before = Math.max(0, Number(number1BlackHoleState.phase2ParallelBonusPool) || 0);
        const after = Math.min(1.5, before + spend * 0.0001);
        number1BlackHoleState.phase2ParallelBonusPool = after;
        return Math.max(0, after - before);
    }
    /** [0,1] progress from banked Essence toward the next Phase 3 disk upgrade (while still in Phase 3). */
    function getBlackHolePhase3UpgradeFrac() {
        return getBlackHolePhase3UpgradeFracRule(number1BlackHoleState, getBlackHolePhase());
    }
    function getBlackHolePhase4NextCostEssenceForWave(w) {
        return getBlackHolePhase4NextCostEssenceForWaveRule(w);
    }
    function getBlackHolePhase4NextCostEssence() {
        return getBlackHolePhase4NextCostEssenceForWave(number1BlackHoleState.phase4WaveLevel || 0);
    }
    function getBlackHolePhase6NextJetUpgradeCostEssence() {
        return getBlackHolePhase6NextJetUpgradeCostEssenceRule(number1BlackHoleState);
    }
    function getBlackHolePhase3TrackLevel(track) {
        return getBlackHolePhase3TrackLevelRule(number1BlackHoleState, track);
    }
    function getBlackHolePhase3TrackCost(track) {
        return getBlackHolePhase3TrackCostRule(number1BlackHoleState, track);
    }
    function syncBlackHolePhase3LegacyLevel() {
        syncNumber1BlackHolePhase3LegacyLevel(number1BlackHoleState);
    }
    function isBlackHolePhase3Complete() {
        return isBlackHolePhase3CompleteRule(number1BlackHoleState);
    }
    function getBlackHolePhase6TrackLevel(track) {
        return getBlackHolePhase6TrackLevelRule(number1BlackHoleState, track);
    }
    function getBlackHolePhase6TrackCost(track) {
        return getBlackHolePhase6TrackCostRule(number1BlackHoleState, track);
    }
    function getBlackHolePhase1FillRatio() {
        return getBlackHolePhase1FillRatioRule(number1BlackHoleState);
    }
    function getBlackHolePhase1RunCpsMult() {
        return getBlackHolePhase1RunCpsMultRule(number1BlackHoleState);
    }
    function getBlackHolePhase1AscensionEssenceMult() {
        return getBlackHolePhase1AscensionEssenceMultRule(number1BlackHoleState);
    }
    function getBlackHolePhase1SlowdownCapBonus() {
        return getBlackHolePhase1SlowdownCapBonusRule(number1BlackHoleState);
    }
    function getMaxSlowdownLevelCap() {
        return MAX_SLOWDOWN_LEVEL + getBlackHolePhase1SlowdownCapBonus();
    }
    function getBlackHoleWaveIntervalSec() {
        return getBlackHoleWaveIntervalSecRule(number1BlackHoleState);
    }
    function getBlackHoleHawkingMult() {
        const p = getBlackHolePhase();
        if (p < 3 || p >= 6) return 1;
        const now = Date.now();
        if (now > (number1BlackHoleState.phase3HawkingActiveUntilMs || 0)) return 1;
        const baseS = getBlackHolePhase3TrackLevel("luminosity");
        const sEff = p === 3 ? baseS + getBlackHolePhase3UpgradeFrac() : baseS;
        const amp = 0.25 + 0.1 * sEff;
        return 1 + amp;
    }
    function getBlackHoleWaveMult() {
        const p = getBlackHolePhase();
        if (p < 4 || p >= 6) return 1;
        return Date.now() <= (number1BlackHoleState.phase4WaveActiveUntilMs || 0) ? BLACK_HOLE_PHASE4_WAVE_BOOST_MULT : 1;
    }
    function getBlackHolePhase5DigestDurationMsSafe() {
        const raw = Number(number1BlackHoleState.phase5DigestDurationMs);
        return Number.isFinite(raw) && raw > 0 ? raw : getBlackHoleNextDigestDurationMs();
    }
    function getBlackHolePhase5MutationLevel(kind) {
        return getBlackHolePhase5MutationLevelRule(number1BlackHoleState, kind);
    }
    function getBlackHolePhase5MutationTotal() {
        return getBlackHolePhase5MutationTotalRule(number1BlackHoleState);
    }
    function getBlackHolePhase5HotterCoreMult() {
        return getBlackHolePhase5HotterCoreMultRule(number1BlackHoleState);
    }
    function getBlackHolePhase5EssenceRefineryBonus() {
        return getBlackHolePhase5EssenceRefineryBonusRule(number1BlackHoleState);
    }
    function getBlackHolePhase5ShorterOrbitMult() {
        return getBlackHolePhase5ShorterOrbitMultRule(number1BlackHoleState);
    }
    function getBlackHolePhase5DigestProgressAt(nowMs) {
        return getBlackHolePhase5DigestProgressAtRule(number1BlackHoleState, nowMs, getBlackHolePhase5DigestDurationMsSafe());
    }
    function getBlackHolePhase5DigestProgress() {
        return getBlackHolePhase5DigestProgressAt(Date.now());
    }
    function getBlackHolePhase5DigestCurve(progress) {
        return getBlackHolePhase5DigestCurveRule(progress);
    }
    function getBlackHolePhase5EffectiveFurnacePower() {
        return getBlackHolePhase5EffectiveFurnacePowerRule(number1BlackHoleState, getBlackHolePhase(), getBlackHolePhase5DigestProgress());
    }
    function getBlackHoleFurnaceEssenceBonus() {
        return getBlackHoleFurnaceEssenceBonusRule(number1BlackHoleState, getBlackHolePhase(), getBlackHolePhase5EffectiveFurnacePower());
    }
    function getBlackHoleFurnaceMult() {
        return getBlackHoleFurnaceMultRule(number1BlackHoleState, getBlackHolePhase(), getBlackHolePhase5EffectiveFurnacePower());
    }
    function getBlackHoleJetMult() {
        if (getBlackHolePhase() < 6 || !number1BlackHoleState.phase6JetActive) return 1;
        const B = getBlackHolePhase6TrackLevel("boost");
        let frac = 0;
        if (getBlackHolePhase() === 6) {
            const bank = Math.max(0, Math.floor(Number(number1BlackHoleState.phase6EssenceBank) || 0));
            const c = getBlackHolePhase6NextJetUpgradeCostEssence();
            if (c > 0) frac = Math.min(1, bank / c);
        }
        const bEff = B + frac;
        return 1 + 3 * (1 + 0.15 * bEff);
    }
    function getBlackHoleTotalMult() {
        if (!isBlackHoleArcUnlocked()) return 1;
        return (
            getBlackHolePhase2MassMult() *
            getBlackHolePhase1RunCpsMult() *
            getBlackHolePhase2PhotonShellMult() *
            getBlackHoleHawkingMult() *
            getBlackHoleWaveMult() *
            getBlackHoleFurnaceMult() *
            getBlackHoleJetMult()
        );
    }
    function getBlackHolePersistentMultForOffline() {
        if (!isBlackHoleArcUnlocked()) return 1;
        const jetMult = getBlackHolePhase() >= 6 && number1BlackHoleState.phase6JetActive ? getBlackHoleJetMult() : 1;
        return (
            getBlackHolePhase2MassMult() *
            getBlackHolePhase1RunCpsMult() *
            getBlackHolePhase2PhotonShellMult() *
            getBlackHoleFurnaceMult() *
            jetMult
        );
    }
    function getBlackHoleOfflineTimedBuffAverageMult(dtSec) {
        const p = getBlackHolePhase();
        if (!(dtSec > 0) || p < 3 || p >= 6) return 1;
        let hawkingAvg = 1;
        if (p >= 3) {
            const f = p === 3 ? getBlackHolePhase3UpgradeFrac() : 0;
            const cd = Math.max(4, 18 - (getBlackHolePhase3TrackLevel("viscous") + f) - getBlackHolePhase2PhotonHawkingCdTrimSec());
            const dur = 5 + getBlackHolePhase3TrackLevel("coronal") + f;
            const amp = 0.25 + 0.1 * (getBlackHolePhase3TrackLevel("luminosity") + f);
            const uptime = Math.max(0, Math.min(1, dur / cd));
            hawkingAvg = 1 + amp * uptime;
        }
        let waveAvg = 1;
        if (p >= 4) {
            const iv = Math.max(1, getBlackHoleWaveIntervalSec());
            const uptime = Math.max(0, Math.min(1, BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC / iv));
            waveAvg = 1 + (BLACK_HOLE_PHASE4_WAVE_BOOST_MULT - 1) * uptime;
        }
        return hawkingAvg * waveAvg;
    }
    function getBlackHoleOfflineProductionMult(dtSec) {
        return getBlackHolePersistentMultForOffline() * getBlackHoleOfflineTimedBuffAverageMult(dtSec);
    }
    function getNumber1BlackHoleProductionMult() {
        return getBlackHoleTotalMult();
    }
    let blackHoleUiRefreshQueued = false;
    let blackHolePhase1VfxActive = false;
    let blackHolePhase1CollapsePulseQueued = false;
    let blackHolePhase1SurgeTimerId = 0;
    let blackHoleLensingManualBurstTimerId = 0;
    let blackHoleLensingAutoTickTimerId = 0;
    let blackHoleLensRippleCssLastMs = 0;
    let blackHoleLensRippleLastIv = 0;
    function queueBlackHoleUiRefresh() {
        if (blackHoleUiRefreshQueued) return;
        blackHoleUiRefreshQueued = true;
        requestAnimationFrame(function () {
            blackHoleUiRefreshQueued = false;
            refreshGlobalOverviewPanelIfOpen();
            refreshBlackHolePanelLiveDomIfOpen();
        });
    }
    function syncBlackHolePhase4LensingRipples() {
        if (!number1StageRootEl) return;
        const arc = isBlackHoleArcUnlocked();
        const p = getBlackHolePhase();
        const lensOn = arc && p >= 4 && p < 6;
        number1StageRootEl.classList.toggle("bh-phase4-lensing-cadence", lensOn);
        if (!lensOn) {
            number1StageRootEl.style.removeProperty("--bh-lens-period");
            number1StageRootEl.style.removeProperty("--bh-lens-ripple-delay");
            blackHoleLensRippleCssLastMs = 0;
            blackHoleLensRippleLastIv = 0;
            if (blackHoleLensingManualBurstTimerId) {
                clearTimeout(blackHoleLensingManualBurstTimerId);
                blackHoleLensingManualBurstTimerId = 0;
            }
            if (blackHoleLensingAutoTickTimerId) {
                clearTimeout(blackHoleLensingAutoTickTimerId);
                blackHoleLensingAutoTickTimerId = 0;
            }
            number1StageRootEl.classList.remove("bh-phase4-lensing-manual-burst", "bh-phase4-lensing-auto-tick");
        }
    }
    function pulseBlackHoleLensingManualBurst() {
        if (!number1StageRootEl) return;
        if (blackHoleLensingManualBurstTimerId) {
            clearTimeout(blackHoleLensingManualBurstTimerId);
            blackHoleLensingManualBurstTimerId = 0;
        }
        number1StageRootEl.classList.remove("bh-phase4-lensing-manual-burst");
        void number1StageRootEl.offsetWidth;
        number1StageRootEl.classList.add("bh-phase4-lensing-manual-burst");
        blackHoleLensingManualBurstTimerId = setTimeout(function () {
            blackHoleLensingManualBurstTimerId = 0;
            if (number1StageRootEl) number1StageRootEl.classList.remove("bh-phase4-lensing-manual-burst");
        }, 720);
    }
    function pulseBlackHoleLensingAutoTick() {
        if (!number1StageRootEl) return;
        if (blackHoleLensingAutoTickTimerId) clearTimeout(blackHoleLensingAutoTickTimerId);
        number1StageRootEl.classList.remove("bh-phase4-lensing-auto-tick");
        void number1StageRootEl.offsetWidth;
        number1StageRootEl.classList.add("bh-phase4-lensing-auto-tick");
        blackHoleLensingAutoTickTimerId = setTimeout(function () {
            blackHoleLensingAutoTickTimerId = 0;
            if (number1StageRootEl) number1StageRootEl.classList.remove("bh-phase4-lensing-auto-tick");
        }, 480);
    }
    const PHASE5_THERMAL_PROP_KEYS = ["--bh-phase5-prime", "--bh-phase5-cool", "--bh-phase5-furnace", "--bh-phase5-wash-mid"];
    function phase5ThermalClearCustomProps(el) {
        if (!el || !el.style) return;
        PHASE5_THERMAL_PROP_KEYS.forEach(function (k) {
            el.style.removeProperty(k);
        });
    }
    function clamp01(v) {
        return Math.max(0, Math.min(1, Number(v)));
    }
    function lerpRgb(c0, c1, t0) {
        const t = clamp01(t0);
        return [
            Math.round(Math.max(0, Math.min(255, c0[0] + (c1[0] - c0[0]) * t))),
            Math.round(Math.max(0, Math.min(255, c0[1] + (c1[1] - c0[1]) * t))),
            Math.round(Math.max(0, Math.min(255, c0[2] + (c1[2] - c0[2]) * t))),
        ];
    }
    /** r,g,b for rgba(..., alpha) shorthand */
    function rgbTripleVar(rgb) {
        return rgb[0] + "," + rgb[1] + "," + rgb[2];
    }
    /**
     * 9 digest acts in three bands: hands 1–3 magnetic→red, 4–6 deep red hot, 7–9 white-hot.
     * heatUnified is 0..1 (fractional digest progress included).
     */
    function getBlackHolePhase5DigestThermalPalette(heatUnified) {
        const hueRaw = clamp01(heatUnified) * 9;
        const capped = Math.min(9, hueRaw);
        const segIdx = Math.min(2, Math.floor(capped / 3));
        let u = (capped - segIdx * 3) / 3;
        u = clamp01(u);
        u *= u * (3 - 2 * u);
        const magPrime = [185, 118, 246];
        const tealCool = [92, 210, 255];
        const redPrime = [236, 64, 108];
        const coralCool = [255, 110, 86];
        const deepPrime = [255, 32, 24];
        const coalsCool = [255, 66, 44];
        const whitePrime = [255, 253, 248];
        const ivoryCool = [255, 244, 220];
        const furnaceA = [255, 92, 112];
        const furnaceB = [255, 54, 48];
        const furnaceC = [255, 22, 16];
        const furnaceD = [255, 248, 232];
        const washA = [56, 18, 98];
        const washB = [98, 24, 86];
        const washC = [154, 20, 32];
        const washD = [112, 86, 98];
        let primeRgb;
        let coolRgb;
        let furnaceRgb;
        let washRgb;
        if (segIdx === 0) {
            primeRgb = lerpRgb(magPrime, redPrime, u);
            coolRgb = lerpRgb(tealCool, coralCool, u);
            furnaceRgb = lerpRgb(furnaceA, furnaceB, u);
            washRgb = lerpRgb(washA, washB, u);
        } else if (segIdx === 1) {
            primeRgb = lerpRgb(redPrime, deepPrime, u);
            coolRgb = lerpRgb(coralCool, coalsCool, u);
            furnaceRgb = lerpRgb(furnaceB, furnaceC, u);
            washRgb = lerpRgb(washB, washC, u);
        } else {
            primeRgb = lerpRgb(deepPrime, whitePrime, u);
            coolRgb = lerpRgb(coalsCool, ivoryCool, u);
            furnaceRgb = lerpRgb(furnaceC, furnaceD, u);
            washRgb = lerpRgb(washC, washD, u);
        }
        return {
            prime: rgbTripleVar(primeRgb),
            cool: rgbTripleVar(coolRgb),
            furnace: rgbTripleVar(furnaceRgb),
            washMid: rgbTripleVar(washRgb),
        };
    }
    function computePhase5DigestHeatUnified(nowMs) {
        let digested = Math.max(0, Math.floor(Number(number1BlackHoleState.phase5DigestedHands) || 0));
        digested = Math.min(9, digested);
        if (digested >= 9) return 9;
        const end = Number(number1BlackHoleState.phase5DigestEndsAtMs) || 0;
        const start = Number(number1BlackHoleState.phase5DigestStartedAtMs) || 0;
        const handNum = Math.floor(Number(number1BlackHoleState.phase5DigestHandNumber) || 0);
        let frac = 0;
        if (end > nowMs && handNum > 0 && end > start) {
            frac = (nowMs - start) / (end - start);
            frac = clamp01(frac);
            frac *= frac * (3 - 2 * frac);
        }
        return Math.min(9, digested + frac);
    }
    /** Play stage colour ramp (per digest + slow in-digest ease); drives --bh-phase5-* on stage + inner root */
    function syncBlackHolePhase5ThermalTheme(nowMs) {
        const els = [number1StageRootEl, playStageEl].filter(Boolean);
        const arc = isBlackHoleArcUnlocked();
        const p = getBlackHolePhase();
        if (!(arc && p === 5)) {
            els.forEach(phase5ThermalClearCustomProps);
            return;
        }
        const heatUnified = clamp01(computePhase5DigestHeatUnified(nowMs) / 9);
        const pal = getBlackHolePhase5DigestThermalPalette(heatUnified);
        els.forEach(function (el) {
            el.style.setProperty("--bh-phase5-prime", pal.prime);
            el.style.setProperty("--bh-phase5-cool", pal.cool);
            el.style.setProperty("--bh-phase5-furnace", pal.furnace);
            el.style.setProperty("--bh-phase5-wash-mid", pal.washMid);
        });
    }
    function syncBlackHolePhase1Vfx() {
        if (!number1StageRootEl) return;
        const arc = isBlackHoleArcUnlocked();
        const p = getBlackHolePhase();
        const now = Date.now();
        const massMood = arc && p === 1;
        const collapseMood = arc && p === 2;
        const singularityMood = arc && p >= 2 && p <= 6;
        const hawkingActive = arc && p >= 3 && p < 6 && now <= (number1BlackHoleState.phase3HawkingActiveUntilMs || 0);
        const waveActive = arc && p >= 4 && p < 6 && now <= (number1BlackHoleState.phase4WaveActiveUntilMs || 0);
        if (incrementalCountLabelEl) {
            incrementalCountLabelEl.textContent = p === 7 ? "Epilogue Count" : "Total Count";
        }
        blackHolePhase1VfxActive = massMood;
        if (!massMood) {
            if (blackHolePhase1SurgeTimerId) {
                clearTimeout(blackHolePhase1SurgeTimerId);
                blackHolePhase1SurgeTimerId = 0;
            }
            number1StageRootEl.classList.remove("bh-phase1-unlock-surge");
        }
        number1StageRootEl.classList.toggle("bh-phase1-vfx", massMood);
        number1StageRootEl.classList.toggle("bh-phase2-collapse-vfx", collapseMood);
        number1StageRootEl.classList.toggle("bh-singularity-vfx", singularityMood);
        number1StageRootEl.classList.toggle("bh-singularity-deep", singularityMood);
        number1StageRootEl.classList.toggle("bh-phase3-accretion-disk", arc && p === 3);
        number1StageRootEl.classList.toggle("bh-phase3-hawking-active", hawkingActive);
        number1StageRootEl.classList.toggle("bh-phase4-wave-active", waveActive);
        number1StageRootEl.classList.toggle("bh-phase5-magnetic-furnace", arc && p === 5);
        number1StageRootEl.classList.toggle("bh-phase6-jet-beam", arc && p === 6);
        number1StageRootEl.classList.toggle("bh-phase6-jet-active", arc && p === 6 && !!number1BlackHoleState.phase6JetActive);
        number1StageRootEl.classList.toggle("bh-phase7-stillness", arc && p === 7);
        if (massMood && !number1BlackHoleState.phase1VisualUnlockDone) {
            number1BlackHoleState.phase1VisualUnlockDone = true;
            let allowSurge = true;
            try {
                if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) allowSurge = false;
            } catch (_) {}
            if (allowSurge) {
                number1StageRootEl.classList.add("bh-phase1-unlock-surge");
                if (blackHolePhase1SurgeTimerId) clearTimeout(blackHolePhase1SurgeTimerId);
                blackHolePhase1SurgeTimerId = setTimeout(function () {
                    blackHolePhase1SurgeTimerId = 0;
                    if (number1StageRootEl) number1StageRootEl.classList.remove("bh-phase1-unlock-surge");
                }, 5200);
            }
            autosaveNow();
        }
        syncBlackHolePhase4LensingRipples();
        syncBlackHolePhase5ThermalTheme(now);
    }
    function triggerBlackHolePhase1CollapseVfx() {
        if (!number1StageRootEl || blackHolePhase1CollapsePulseQueued) return;
        blackHolePhase1CollapsePulseQueued = true;
        number1StageRootEl.classList.remove("bh-phase1-collapse-pulse");
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                number1StageRootEl.classList.add("bh-phase1-collapse-pulse");
                blackHolePhase1CollapsePulseQueued = false;
            });
        });
    }
    function patchBlackHolePhase1PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = getBlackHolePhase();
        if (phase !== 1 || !bhEl.classList.contains("asc-black-hole--phase1")) return false;
        const spent = Math.floor(number1BlackHoleState.phase1EssenceSpent || 0);
        const rem = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - spent);
        const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
        const pour = Math.min(rem, have);
        const can = rem > 0 && have > 0;
        const fillPct = Math.round(getBlackHolePhase1FillRatio() * 100);
        const meterNums = bhEl.querySelector(".asc-black-hole__mass-meter-nums");
        if (meterNums) meterNums.innerHTML = "<strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%";
        const meterTrack = bhEl.querySelector(".asc-black-hole__mass-meter-track");
        if (meterTrack) meterTrack.setAttribute("aria-valuenow", String(spent));
        const meterFill = bhEl.querySelector(".asc-black-hole__mass-meter-fill");
        if (meterFill) meterFill.style.width = fillPct + "%";
        const stats = Array.from(bhEl.querySelectorAll(".asc-black-hole__stats"));
        const multStat = stats.find(el => el.textContent.indexOf("Current total BH mult") >= 0);
        if (multStat) {
            const mult = getNumber1BlackHoleProductionMult();
            const multStr = mult >= 10 ? mult.toFixed(2) : mult.toFixed(3);
            multStat.innerHTML = "Current total BH mult: <strong>×" + multStr + "</strong>";
        }
        const purse = bhEl.querySelector(".asc-black-hole__purse");
        if (purse) purse.innerHTML = "You hold <strong>" + formatCount(have) + "</strong> Ascension Essence · next pour: <strong>" + formatCount(pour) + "</strong> into mass";
        const btn = bhEl.querySelector(".page-btn--mass-pour");
        if (btn) {
            btn.disabled = !can;
            btn.textContent = "Pour in all Essence (" + formatCount(pour) + ")";
        }
        return true;
    }
    function patchBlackHolePhase2PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = getBlackHolePhase();
        if (phase !== 2 || !bhEl.classList.contains("asc-black-hole--phase2")) return false;
        const collapseGeometry = bhEl.querySelector(".asc-black-hole__collapse-geometry");
        if (!collapseGeometry) return false;
        const wrap = document.createElement("div");
        wrap.innerHTML = renderNumber1BlackHolePanelHtml();
        const freshBhEl = wrap.firstElementChild;
        if (!freshBhEl || !freshBhEl.classList || !freshBhEl.classList.contains("asc-black-hole--phase2")) return false;
        bhEl.className = freshBhEl.className;
        Array.from(bhEl.childNodes).forEach(function (node) {
            if (node !== collapseGeometry) node.remove();
        });
        Array.from(freshBhEl.childNodes).forEach(function (node) {
            if (node.nodeType === 1 && node.classList.contains("asc-black-hole__collapse-geometry")) return;
            bhEl.appendChild(node);
        });
        return true;
    }
    let patchBlackHolePhase3LastDataKey = "";
    function patchBlackHolePhase3PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = getBlackHolePhase();
        if (phase !== 3 || !bhEl.classList.contains("asc-black-hole--phase3")) return false;
        if (!bhEl.querySelector(".asc-black-hole__disk-hero")) return false;
        const lum = getBlackHolePhase3TrackLevel("luminosity");
        const vis = getBlackHolePhase3TrackLevel("viscous");
        const cor = getBlackHolePhase3TrackLevel("coronal");
        const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
        const mult = getNumber1BlackHoleProductionMult();
        const multStr = mult >= 10 ? mult.toFixed(2) : mult.toFixed(3);
        const dataKey = lum + "|" + vis + "|" + cor + "|" + have + "|" + multStr;
        if (dataKey === patchBlackHolePhase3LastDataKey) return true;
        patchBlackHolePhase3LastDataKey = dataKey;
        const statsBlocks = Array.from(bhEl.querySelectorAll(".asc-black-hole__stats"));
        const multStat = statsBlocks.find(el => el.textContent.indexOf("Current total BH mult") >= 0);
        if (multStat) {
            multStat.innerHTML = "Current total BH mult: <strong>×" + multStr + "</strong>";
        }
        const phaseStat = bhEl.querySelector("[data-asc-bh-disk-phase-stats]");
        if (phaseStat) {
            phaseStat.innerHTML = "Phase: <strong>3</strong> · Luminosity: <strong>" + lum + "</strong> · Viscous: <strong>" + vis + "</strong> · Coronal: <strong>" + cor + "</strong>";
        }
        const purse = bhEl.querySelector("[data-asc-bh-disk-purse]");
        if (purse) purse.innerHTML = "You hold <strong>" + formatCount(have) + "</strong> Ascension Essence.";
        const patchP3Row = function (track, tier) {
            const row = bhEl.querySelector(".asc-black-hole__disk-row--" + track);
            if (!row) return;
            const cost = getBlackHolePhase3TrackCost(track);
            const maxed = tier >= 6;
            const canBuy = !maxed && have >= cost && cost > 0;
            const tierStrong = row.querySelector(".asc-black-hole__p2-tier strong");
            if (tierStrong) tierStrong.textContent = maxed ? "max" : (tier + "/6");
            const pipsWrap = row.querySelector(".asc-black-hole__disk-pips");
            if (pipsWrap) pipsWrap.setAttribute("aria-label", tier + " of 6 tiers lit");
            const pips = row.querySelectorAll(".asc-black-hole__disk-pip");
            for (let idx = 0; idx < pips.length; idx++) {
                const i = idx + 1;
                if (i <= tier) pips[idx].classList.add("asc-black-hole__disk-pip--lit");
                else pips[idx].classList.remove("asc-black-hole__disk-pip--lit");
            }
            const btn = row.querySelector("[data-asc-black-hole-p3]");
            if (btn) {
                btn.disabled = !canBuy;
                btn.textContent = maxed ? "Maxed" : ("Buy (" + formatCount(cost) + ")");
            }
        };
        patchP3Row("luminosity", lum);
        patchP3Row("viscous", vis);
        patchP3Row("coronal", cor);
        return true;
    }
    function refreshBlackHolePanelLiveDomIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension" || ascensionPageActiveNumber !== 1) return;
        const bhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
        if (bhEl) {
            if (!patchBlackHolePhase1PanelLiveDom(bhEl) && !patchBlackHolePhase2PanelLiveDom(bhEl) && !patchBlackHolePhase3PanelLiveDom(bhEl)) bhEl.outerHTML = renderNumber1BlackHolePanelHtml();
        } else {
            refreshAscensionPanelIfOpen();
        }
        patchAscensionHubStatsPillsDomIfChanged();
    }
    function completeBlackHolePhaseTransition(nextPhase, message) {
        const from = getBlackHolePhase();
        if (nextPhase <= from) return;
        number1BlackHoleState.phase = nextPhase;
        if (nextPhase >= 3) number1BlackHoleState.phase2EssenceBank = 0;
        if (nextPhase >= 4) number1BlackHoleState.phase3EssenceBank = 0;
        if (nextPhase >= 5) number1BlackHoleState.phase4EssenceBank = 0;
        if (nextPhase >= 7) number1BlackHoleState.phase6EssenceBank = 0;
        syncBlackHolePhase1Vfx();
        updateN1GravityCpsStrip();
        updateRateDisplay();
        if (message) addToLog(message, "milestone");
        if (nextPhase === 2) {
            triggerBlackHolePhase1CollapseVfx();
            showStoryBannerById("black-hole-phase-1-collapse");
        }
        if (nextPhase === 3) {
            showStoryBannerById("black-hole-phase-2-disk");
        }
        if (nextPhase === 4) {
            showStoryBannerById("black-hole-phase-3-wave");
        }
        if (nextPhase === 5) {
            showStoryBannerById("black-hole-phase-4-furnace");
        }
        if (nextPhase === 6) {
            playBlackHoleScreenEffect("sacrifice");
            showStoryBannerById("black-hole-phase-5-jets");
        }
        if (nextPhase === 7) {
            playBlackHoleScreenEffect("evaporation");
            showStoryBannerById("black-hole-phase-6-evaporation");
        }
        if (nextPhase === 2) addToLog("Tip: buy three collapse upgrades to tier 3 each, then pour Essence into mass.", "tip");
        if (nextPhase === 3) addToLog("Tip: Hawking bursts are brief. Time your pushes around burst windows.", "tip");
        if (nextPhase === 4) addToLog("Tip: Gravitational Wave can be fired manually at half-interval timing.", "tip");
        if (nextPhase === 5) addToLog("Tip: sacrifices are permanent. Feed hands in order 10 -> 1. Use Essence to accelerate digestion.", "tip");
        if (nextPhase === 6) addToLog("Tip: Hawking and lensing are now silent. Jets are your primary burst window.", "tip");
        if (nextPhase === 7) addToLog("The upgrades fall silent. Count on.", "milestone");
        if (nextPhase === 3 && !(number1BlackHoleState.phase3NextHawkingAtMs > 0)) {
            number1BlackHoleState.phase3NextHawkingAtMs = Date.now() + 12000;
        }
        if (nextPhase === 4) {
            const ivMs = Math.round(getBlackHoleWaveIntervalSec() * 1000);
            number1BlackHoleState.phase4NextWaveAtMs = Date.now() + ivMs;
            number1BlackHoleState.phase4ManualReadyAtMs = Date.now() + Math.round(ivMs * 0.5);
            number1BlackHoleUxFlags.waveReadyAnnounced = false;
        }
        if (nextPhase === 5 && !(number1BlackHoleState.phase5NextSacrificeHand > 0)) {
            number1BlackHoleState.phase5NextSacrificeHand = 10;
            number1BlackHoleUxFlags.digestReadyAnnounced = true;
        }
        if (nextPhase === 6) {
            number1BlackHoleState.phase3HawkingActiveUntilMs = 0;
            number1BlackHoleState.phase4WaveActiveUntilMs = 0;
            number1BlackHoleUxFlags.jetReadyAnnounced = false;
            number1BlackHoleUxFlags.jetDryAnnounced = false;
        }
        autosaveNow();
        queueBlackHoleUiRefresh();
    }
    function tryBuyBlackHolePhase2CollapseUpgrade(track) {
        if (!number1HasAscended) return;
        if (!isBlackHoleArcUnlocked()) {
            addToLog("Black Hole is locked. Buy every ascension map node first.", "warning");
            return;
        }
        if (getBlackHolePhase() !== 2) return;
        if (track !== "mass" && track !== "photon" && track !== "ergosphere") return;
        const cost = getBlackHolePhase2CollapseUpgradeCost(track);
        if (!(cost > 0)) return;
        const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
        if (have < cost) {
            addToLog("Need " + formatCount(cost) + " Ascension Essence for this upgrade.", "warning");
            return;
        }
        let cur = 0;
        let name = "";
        if (track === "mass") {
            cur = getBlackHolePhase2CollapseMassTier();
            name = "Essence–mass coupling";
            if (cur >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return;
            number1BlackHoleState.phase2CollapseMassTier = cur + 1;
        } else if (track === "photon") {
            cur = getBlackHolePhase2CollapsePhotonTier();
            name = "Photon shell";
            if (cur >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return;
            number1BlackHoleState.phase2CollapsePhotonTier = cur + 1;
        } else if (track === "ergosphere") {
            cur = getBlackHolePhase2CollapseErgosphereTier();
            name = "Ergosphere coupling";
            if (cur >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return;
            number1BlackHoleState.phase2CollapseErgosphereTier = cur + 1;
        } else {
            return;
        }
        number1AscensionEssence -= cost;
        const parallelAdded = addBlackHolePhase2ParallelBonusFromEssence(cost);
        const parallelNote = parallelAdded > 0 ? (" · parallel pool +" + (parallelAdded * 100).toFixed(2) + "%") : "";
        addToLog(name + " → tier " + (cur + 1) + "/" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER + parallelNote + ".", "tip");
        if (isBlackHolePhase2MassPourUnlocked()) {
            addToLog("Singularity accepts direct mass feeds. Pour Essence when you are ready.", "milestone");
        }
        autosaveNow();
        queueBlackHoleUiRefresh();
        updateRateDisplay();
    }
    function tryBuyBlackHolePhase3DiskUpgrade(track) {
        if (!number1HasAscended || getBlackHolePhase() !== 3) return;
        if (track !== "luminosity" && track !== "viscous" && track !== "coronal") return;
        const cost = getBlackHolePhase3TrackCost(track);
        if (!(cost > 0)) return;
        const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
        if (have < cost) {
            addToLog("Need " + formatCount(cost) + " Ascension Essence for this disk upgrade.", "warning");
            return;
        }
        number1AscensionEssence -= cost;
        let name = "";
        if (track === "luminosity") {
            number1BlackHoleState.phase3LuminosityLevel = getBlackHolePhase3TrackLevel(track) + 1;
            name = "Disk luminosity";
        } else if (track === "viscous") {
            number1BlackHoleState.phase3ViscousLevel = getBlackHolePhase3TrackLevel(track) + 1;
            name = "Viscous accretion";
        } else {
            number1BlackHoleState.phase3CoronalLevel = getBlackHolePhase3TrackLevel(track) + 1;
            name = "Coronal loop";
        }
        syncBlackHolePhase3LegacyLevel();
        addToLog(name + " → tier " + getBlackHolePhase3TrackLevel(track) + "/6.", "tip");
        if (isBlackHolePhase3Complete()) {
            number1BlackHoleState.phase3EssenceBank = 0;
            completeBlackHolePhaseTransition(4, "Phase 3 complete: lensing active. Phase 4 unlocked.");
        }
        autosaveNow();
        queueBlackHoleUiRefresh();
        updateRateDisplay();
    }
    function tryBuyBlackHolePhase6JetUpgrade(track) {
        if (!number1HasAscended || getBlackHolePhase() !== 6) return;
        if (track !== "drain" && track !== "boost" && track !== "bank") return;
        const cost = getBlackHolePhase6TrackCost(track);
        const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
        if (have < cost) {
            addToLog("Need " + formatCount(cost) + " Ascension Essence for this jet upgrade.", "warning");
            return;
        }
        number1AscensionEssence -= cost;
        let name = "";
        if (track === "drain") {
            number1BlackHoleState.phase6JetEfficiencyLevel = getBlackHolePhase6TrackLevel(track) + 1;
            name = "Drain efficiency";
        } else if (track === "boost") {
            number1BlackHoleState.phase6JetBoostLevel = getBlackHolePhase6TrackLevel(track) + 1;
            name = "Boost multiplier";
        } else {
            number1BlackHoleState.phase6JetBankLevel = getBlackHolePhase6TrackLevel(track) + 1;
            name = "Boost bank";
        }
        addToLog(name + " → tier " + getBlackHolePhase6TrackLevel(track) + ".", "tip");
        autosaveNow();
        queueBlackHoleUiRefresh();
        updateRateDisplay();
    }
    function tryBuyNumber1BlackHole() {
        if (!number1HasAscended) return;
        if (!isBlackHoleArcUnlocked()) {
            addToLog("Black Hole is locked. Buy every ascension map node first.", "warning");
            return;
        }
        ensureBlackHoleArcStarted();
        const phase = getBlackHolePhase();
        if (phase === 1) {
            const remaining = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - (number1BlackHoleState.phase1EssenceSpent || 0));
            if (remaining <= 0) return;
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const spend = Math.min(remaining, have);
            if (spend < 1) {
                addToLog("Need Ascension Essence to charge the Mass Accumulator. Ascend, then pour it all in here.", "warning");
                return;
            }
            number1AscensionEssence -= spend;
            number1BlackHoleState.phase1EssenceSpent = Math.min(BLACK_HOLE_PHASE1_ESSENCE_TARGET, (number1BlackHoleState.phase1EssenceSpent || 0) + spend);
            addToLog("Mass Accumulator absorbed " + formatCount(spend) + " Essence.", "tip");
            if (number1BlackHoleState.phase1EssenceSpent >= BLACK_HOLE_PHASE1_ESSENCE_TARGET) {
                completeBlackHolePhaseTransition(2, "Phase 1 complete: accumulator collapse. Phase 2 unlocked.");
            }
        } else if (phase === 2) {
            if (!isBlackHolePhase2MassPourUnlocked()) {
                addToLog("Stabilize all three collapse upgrades to tier 3 before pouring Essence into mass.", "warning");
                return;
            }
            let L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(number1BlackHoleState.phase2Mass) || 0)));
            if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return;
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            if (have < 1) {
                addToLog("Need Ascension Essence to feed mass into the singularity.", "warning");
                return;
            }
            number1AscensionEssence -= have;
            let bank = Math.max(0, Math.floor(Number(number1BlackHoleState.phase2EssenceBank) || 0)) + have;
            while (L < BLACK_HOLE_PHASE2_MASS_CAP) {
                const c = getBlackHolePhase2CostAtLevel(L);
                if (!(c > 0) || bank < c) break;
                bank -= c;
                L++;
            }
            number1BlackHoleState.phase2Mass = L;
            number1BlackHoleState.phase2EssenceBank = bank;
            number1BlackHoleUxFlags.lastPhase2MassFeedAtMs = Date.now();
            const parallelAdded = addBlackHolePhase2ParallelBonusFromEssence(have);
            const nextC = L < BLACK_HOLE_PHASE2_MASS_CAP ? getBlackHolePhase2CostAtLevel(L) : 0;
            const bankNote = bank > 0 && nextC > 0 ? (" · " + formatCount(bank) + " / " + formatCount(nextC) + " Essence banked toward the next mass step") : "";
            const parallelNote = parallelAdded > 0 ? (" · parallel pool +" + (parallelAdded * 100).toFixed(2) + "%") : "";
            addToLog("Fed " + formatCount(have) + " Essence into black hole mass" + bankNote + parallelNote + ".", "tip");
            if (L >= BLACK_HOLE_PHASE2_MASS_CAP) {
                number1BlackHoleState.phase2EssenceBank = 0;
                completeBlackHolePhaseTransition(3, "Phase 2 complete: accretion disk ignites. Phase 3 unlocked.");
            }
        } else if (phase === 3) {
            let S = Math.floor(Number(number1BlackHoleState.phase3HawkingStrength) || 0);
            if (S >= 6) return;
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            if (have < 1) {
                addToLog("Need Ascension Essence for disk upgrades.", "warning");
                return;
            }
            number1AscensionEssence -= have;
            let bank = Math.max(0, Math.floor(Number(number1BlackHoleState.phase3EssenceBank) || 0)) + have;
            while (S < 6) {
                const c = 75 + 25 * S;
                if (bank < c) break;
                bank -= c;
                S++;
            }
            number1BlackHoleState.phase3HawkingStrength = S;
            number1BlackHoleState.phase3HawkingRate = S;
            number1BlackHoleState.phase3HawkingDuration = S;
            number1BlackHoleState.phase3EssenceBank = bank;
            const nextC = S < 6 ? 75 + 25 * S : 0;
            const bankNote = bank > 0 && nextC > 0 ? (" · " + formatCount(bank) + " / " + formatCount(nextC) + " toward next disk tier") : "";
            addToLog("Fed " + formatCount(have) + " Essence into the accretion disk" + bankNote + ".", "tip");
            if (S >= 6) {
                number1BlackHoleState.phase3EssenceBank = 0;
                completeBlackHolePhaseTransition(4, "Phase 3 complete: lensing active. Phase 4 unlocked.");
            }
        } else if (phase === 4) {
            let W = Math.floor(Number(number1BlackHoleState.phase4WaveLevel) || 0);
            if (W >= 6) return;
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            if (have < 1) {
                addToLog("Need Ascension Essence for wave upgrades.", "warning");
                return;
            }
            number1AscensionEssence -= have;
            let bank = Math.max(0, Math.floor(Number(number1BlackHoleState.phase4EssenceBank) || 0)) + have;
            while (W < 6) {
                const c = getBlackHolePhase4NextCostEssenceForWave(W);
                if (bank < c) break;
                bank -= c;
                W++;
            }
            number1BlackHoleState.phase4WaveLevel = W;
            number1BlackHoleState.phase4EssenceBank = bank;
            const nextC = W < 6 ? getBlackHolePhase4NextCostEssenceForWave(W) : 0;
            const bankNote = bank > 0 && nextC > 0 ? (" · " + formatCount(bank) + " / " + formatCount(nextC) + " toward next wave tier") : "";
            addToLog("Fed " + formatCount(have) + " Essence into gravitational lensing" + bankNote + ".", "tip");
            if (W >= 6) {
                number1BlackHoleState.phase4EssenceBank = 0;
                completeBlackHolePhaseTransition(5, "Phase 4 complete: furnace unlocked. Phase 5 unlocked.");
            }
        } else if (phase === 5) {
            if ((number1BlackHoleState.phase5PendingMutationLevel || 0) > 0) {
                addToLog("Choose the pending Furnace Mutation before stoking or feeding again.", "warning");
                return;
            }
            const digestEnd = number1BlackHoleState.phase5DigestEndsAtMs || 0;
            if (!(digestEnd > Date.now()) || !(number1BlackHoleState.phase5DigestHandNumber > 0)) {
                addToLog("Phase 5 has no active digest to accelerate.", "warning");
                return;
            }
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            if (have < 1) {
                addToLog("Need Ascension Essence to stoke the furnace.", "warning");
                return;
            }
            const now = Date.now();
            const preview = getBlackHolePhase5StokePreview(have, now);
            if (!preview) {
                addToLog("Phase 5 has no active digest to accelerate.", "warning");
                return;
            }
            const spent = Math.max(0, Math.floor(Number(preview.spentEssence) || 0));
            if (spent < 1) {
                addToLog(
                    "Digestion is already inside the furnace buffer (~" +
                        Math.ceil(BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS / 1000) +
                        "s or less remaining); Essence wasn't spent.",
                    "warning"
                );
                return;
            }
            number1AscensionEssence -= spent;
            const digestEndMs = preview.digestEndMs;
            number1BlackHoleState.phase5DigestEndsAtMs = digestEndMs;
            number1BlackHoleState.phase5DigestStartedAtMs = preview.start;
            number1BlackHoleState.phase5DigestDurationMs = preview.duration;
            const leftSec = Math.max(0, Math.ceil(preview.projectedRemainingMs / 1000));
            const removedSec = Math.max(0, Math.floor(preview.removedMs / 1000));
            const pct = Math.floor(getBlackHolePhase5DigestProgress() * 100);
            let msg =
                "Furnace: spent " +
                formatCount(spent) +
                " Essence (" +
                formatSeconds(removedSec) +
                " removed, " +
                pct +
                "% digested, ~" +
                formatSeconds(leftSec) +
                " remaining).";
            if (spent < have)
                msg += " (" + formatCount(have - spent) + " Essence untouched — digestion only needed up to ~" + formatSeconds(Math.ceil(BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS / 1000)) + " left.)";
            addToLog(msg, "tip");
        } else if (phase === 6) {
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            if (have < 1) {
                addToLog("Need Ascension Essence for jet upgrades.", "warning");
                return;
            }
            number1AscensionEssence -= have;
            let bank = Math.max(0, Math.floor(Number(number1BlackHoleState.phase6EssenceBank) || 0)) + have;
            let B = Math.floor(Number(number1BlackHoleState.phase6JetBoostLevel) || 0);
            while (true) {
                const c = 300 + 120 * B;
                if (!(c > 0) || bank < c) break;
                bank -= c;
                B++;
                number1BlackHoleState.phase6JetBoostLevel = B;
                number1BlackHoleState.phase6JetEfficiencyLevel = B;
                number1BlackHoleState.phase6JetBankLevel = B;
            }
            number1BlackHoleState.phase6EssenceBank = bank;
            const nextC = getBlackHolePhase6NextJetUpgradeCostEssence();
            const bankNote = bank > 0 && nextC > 0 ? (" · " + formatCount(bank) + " / " + formatCount(nextC) + " toward next jet upgrade") : "";
            addToLog("Fed " + formatCount(have) + " Essence into jet systems" + bankNote + ".", "tip");
        }
        updateRateDisplay();
        queueBlackHoleUiRefresh();
    }
    function triggerBlackHoleWaveManual() {
        if (getBlackHolePhase() < 4 || getBlackHolePhase() >= 6) return;
        const now = Date.now();
        if (now < (number1BlackHoleState.phase4ManualReadyAtMs || 0)) {
            const waitSec = Math.max(0, Math.ceil(((number1BlackHoleState.phase4ManualReadyAtMs || 0) - now) / 1000));
            addToLog("Gravitational Wave is not ready (" + formatSeconds(waitSec) + " remaining).", "warning");
            return;
        }
        number1BlackHoleState.phase4WaveActiveUntilMs = now + BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC * 1000;
        const ivMs = Math.round(getBlackHoleWaveIntervalSec() * 1000);
        number1BlackHoleState.phase4NextWaveAtMs = now + ivMs;
        number1BlackHoleState.phase4ManualReadyAtMs = now + Math.round(ivMs * 0.5);
        number1BlackHoleUxFlags.waveReadyAnnounced = false;
        number1BlackHoleState.phase4WaveTriggered = true;
        playBlackHoleScreenEffect("wave");
        syncBlackHolePhase1Vfx();
        pulseBlackHoleLensingManualBurst();
        addToLog("Manual Gravitational Wave fired (100x for 5s).", "milestone");
    }
    function getBlackHoleNextDigestDurationMs() {
        return Math.max(60 * 1000, Math.floor(BLACK_HOLE_DIGEST_BASE_MS * getBlackHolePhase5ShorterOrbitMult()));
    }
    function getBlackHolePhase5StokePreview(spendEssence, nowMs) {
        const now = Number(nowMs) || Date.now();
        const spendBudget = Math.max(0, Math.floor(Number(spendEssence) || 0));
        const digestEnd = Number(number1BlackHoleState.phase5DigestEndsAtMs) || 0;
        if (!(digestEnd > now) || !(number1BlackHoleState.phase5DigestHandNumber > 0)) return null;
        if (spendBudget < 0) return null;

        const oldDuration = getBlackHolePhase5DigestDurationMsSafe();
        const duration = oldDuration;

        /** spendBudget 0 ⇒ current progress without spending (for HUD / clamps). */
        if (spendBudget === 0) {
            const start0 = digestEnd - duration;
            const progress0 = Math.max(0, Math.min(1, duration > 0 ? (now - start0) / duration : 0));
            return {
                start: start0,
                digestEndMs: digestEnd,
                duration,
                currentRemainingMs: Math.max(0, digestEnd - now),
                projectedRemainingMs: Math.max(0, digestEnd - now),
                removedMs: 0,
                progress: progress0,
                curved: getBlackHolePhase5DigestCurve(progress0),
                spentEssence: 0,
                unspentBudget: 0,
            };
        }

        const cost = Math.max(25, Math.floor(50 + 20 * (number1BlackHoleState.phase5FurnaceLevel || 0)));
        const floorMs = Math.max(1000, Math.floor(oldDuration * 0.01));
        const stopRm = BLACK_HOLE_PHASE5_STOKE_MIN_REMAINING_MS;

        const getStokedRemainingMs = function (remaining, reduction) {
            const rem = Math.max(0, Math.floor(Number(remaining) || 0));
            const red = Math.max(0, Math.floor(Number(reduction) || 0));
            if (rem <= 1 || red <= 0) return rem;
            if (rem <= floorMs) return Math.max(1, rem - red);
            return Math.min(rem, Math.max(floorMs, rem - red));
        };

        let poolRemain = spendBudget;
        let digestEndMs = digestEnd;

        while (poolRemain >= cost && digestEndMs > now) {
            const remaining = digestEndMs - now;
            if (remaining <= stopRm) break;
            const fullRed = Math.max(1, Math.floor(remaining * 0.06));
            let newRm = getStokedRemainingMs(remaining, fullRed);
            if (newRm < stopRm) newRm = stopRm;
            digestEndMs = now + newRm;
            poolRemain -= cost;
        }

        /** Leftover purse below one full stoke tier: proportional trim, billed as spent remainder. */
        if (poolRemain > 0 && digestEndMs > now && cost > 0) {
            const remaining = digestEndMs - now;
            if (remaining > stopRm) {
                const fullRed = Math.max(1, Math.floor(remaining * 0.06));
                const reduction = Math.max(1, Math.floor(fullRed * Math.min(1, poolRemain / cost)));
                let newRm = getStokedRemainingMs(remaining, reduction);
                if (newRm < stopRm) newRm = stopRm;
                digestEndMs = now + newRm;
                poolRemain = 0;
            }
        }

        const spentEssence = spendBudget - poolRemain;
        const start = digestEndMs - duration;
        const progress = Math.max(0, Math.min(1, duration > 0 ? (now - start) / duration : 0));
        return {
            start,
            digestEndMs,
            duration,
            currentRemainingMs: Math.max(0, digestEnd - now),
            projectedRemainingMs: Math.max(0, digestEndMs - now),
            removedMs: Math.max(0, digestEnd - digestEndMs),
            progress,
            curved: getBlackHolePhase5DigestCurve(progress),
            spentEssence,
            unspentBudget: Math.max(0, poolRemain),
        };
    }
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
        updateTurboBoostUI();
        return true;
    }
    function sacrificeNextHandToFurnace() {
        if (getBlackHolePhase() !== 5) return;
        if ((number1BlackHoleState.phase5PendingMutationLevel || 0) > 0) {
            addToLog("Choose a Furnace Mutation before feeding the next hand.", "warning");
            return;
        }
        if ((number1BlackHoleState.phase5DigestEndsAtMs || 0) > Date.now()) {
            const remainSec = Math.max(0, Math.ceil(((number1BlackHoleState.phase5DigestEndsAtMs || 0) - Date.now()) / 1000));
            addToLog("Digestion is already in progress (" + formatSeconds(remainSec) + " remaining).", "warning");
            return;
        }
        const handNum = Math.max(1, Math.floor(number1BlackHoleState.phase5NextSacrificeHand || 1));
        if (handNum <= 1 || unlockedHands <= 1) {
            completeBlackHolePhaseTransition(6, "Only one hand remains. Phase 6 jets unlocked.");
            return;
        }
        if (unlockedHands < handNum) {
            addToLog("Furnace needs Hand " + handNum + ", but it is not unlocked yet. Build this run back to " + handNum + " hands, then feed it.", "warning");
            return;
        }
        if (!applyHandSacrifice(handNum)) {
            addToLog("Furnace could not feed Hand " + handNum + " yet. Unlock it first, then try again.", "warning");
            return;
        }
        const now = Date.now();
        const duration = getBlackHoleNextDigestDurationMs();
        number1BlackHoleState.phase5DigestHandNumber = handNum;
        number1BlackHoleState.phase5DigestStartedAtMs = now;
        number1BlackHoleState.phase5DigestDurationMs = duration;
        number1BlackHoleState.phase5DigestEndsAtMs = now + duration;
        number1BlackHoleState.phase5NextSacrificeHand = handNum - 1;
        number1BlackHoleUxFlags.digestReadyAnnounced = false;
        playBlackHoleScreenEffect("sacrifice");
        addToLog("Hand " + handNum + " is fed to the furnace. Digestion begins (" + formatSeconds(Math.ceil(duration / 1000)) + ").", "milestone");
    }
    function chooseBlackHoleFurnaceMutation(kind) {
        if (getBlackHolePhase() !== 5) return;
        if (!(number1BlackHoleState.phase5PendingMutationLevel > 0)) return;
        const handNum = Math.max(1, Math.floor(Number(number1BlackHoleState.phase5PendingMutationHand) || number1BlackHoleState.phase5LastDigestedHand || 1));
        let label = "";
        if (kind === "hotter-core") {
            number1BlackHoleState.phase5MutationHotterCore = getBlackHolePhase5MutationLevel("hotter-core") + 1;
            label = "Hotter Core";
        } else if (kind === "essence-refinery") {
            number1BlackHoleState.phase5MutationEssenceRefinery = getBlackHolePhase5MutationLevel("essence-refinery") + 1;
            label = "Essence Refinery";
        } else if (kind === "shorter-orbit") {
            number1BlackHoleState.phase5MutationShorterOrbit = getBlackHolePhase5MutationLevel("shorter-orbit") + 1;
            label = "Shorter Orbit";
        } else {
            return;
        }
        number1BlackHoleState.phase5PendingMutationHand = 0;
        number1BlackHoleState.phase5PendingMutationLevel = 0;
        addToLog("Furnace Mutation chosen for Hand " + handNum + ": " + label + ".", "milestone");
        playBlackHoleScreenEffect("digest");
        updateRateDisplay();
        updateN1GravityCpsStrip();
        refreshAscensionPanelIfOpen();
        autosaveNow();
        if ((number1BlackHoleState.phase5NextSacrificeHand || 1) <= 1) {
            completeBlackHolePhaseTransition(6, "Phase 5 complete: jets awakened.");
        }
    }
    function showBlackHoleFurnaceDigestCompletionRitual(handNum, furnaceLevel) {
        const h = Math.max(1, Math.min(maxHands, Math.floor(Number(handNum) || 1)));
        const level = Math.max(1, Math.floor(Number(furnaceLevel) || 1));
        const echoMult = getBlackHoleFurnaceMult();
        const title = "Hand " + h + " Digested";
        const body = "The Gravitational Furnace flares and Hand " + h + " collapses into an Echo Hand.\n\n" +
            "Echo Hands collected: " + level + " / 9\n" +
            "Current furnace CPS: x" + (echoMult >= 10 ? echoMult.toFixed(2) : echoMult.toFixed(3)) + "\n\n" +
            "Choose a Furnace Mutation to claim the reward, then feed the next hand.";
        showStoryBanner({
            id: level === 1 ? "black-hole-first-digest" : ("black-hole-digest-hand-" + h),
            order: 1007 + level,
            title,
            body
        }, {
            onClose: function () {
                queueBlackHoleUiRefresh();
                playBlackHoleScreenEffect("digest");
            }
        });
    }
    function tryToggleJet(active) {
        if (getBlackHolePhase() < 6 || getBlackHolePhase() >= 7) return;
        if (active && (number1BlackHoleState.phase6JetCharge || 0) <= 0) {
            addToLog("Jet cannot ignite: no charge. Let the battery refill.", "warning");
            return;
        }
        number1BlackHoleState.phase6JetActive = !!active;
        if (number1BlackHoleState.phase6JetActive) number1BlackHoleState.phase6JetIgnited = true;
        syncBlackHolePhase1Vfx();
        addToLog(number1BlackHoleState.phase6JetActive ? "Jet ignition: ON." : "Jet ignition: OFF.", "milestone");
    }
    function updateBlackHolePhaseStep(dtSec) {
        if (!(dtSec > 0)) return;
        if (!isBlackHoleArcUnlocked()) return;
        ensureBlackHoleArcStarted();
        const now = Date.now();
        const phase = getBlackHolePhase();
        if (phase === 2) {
            const erg = getBlackHolePhase2CollapseErgosphereTier();
            if (erg > 0 && turboBoostUnlocked) {
                const ergoRate = 0.45 * erg;
                turboBoostMeter = Math.min(getTurboMeterMax(), turboBoostMeter + ergoRate * dtSec);
            }
        }
        if (phase >= 3 && phase < 6) {
            const f = phase === 3 ? getBlackHolePhase3UpgradeFrac() : 0;
            const baseCd = Math.max(4, 18 - (getBlackHolePhase3TrackLevel("viscous") + f) - getBlackHolePhase2PhotonHawkingCdTrimSec());
            if (!(number1BlackHoleState.phase3NextHawkingAtMs > 0)) number1BlackHoleState.phase3NextHawkingAtMs = now + baseCd * 1000;
            if (now >= number1BlackHoleState.phase3NextHawkingAtMs) {
                const durSec = 5 + getBlackHolePhase3TrackLevel("coronal") + f;
                number1BlackHoleState.phase3HawkingActiveUntilMs = now + durSec * 1000;
                number1BlackHoleState.phase3NextHawkingAtMs = now + baseCd * 1000;
                playBlackHoleScreenEffect("hawking");
                syncBlackHolePhase1Vfx();
            }
        }
        if (phase >= 4 && phase < 6) {
            if (number1StageRootEl && isBlackHoleArcUnlocked()) {
                const ivLens = Math.max(8, getBlackHoleWaveIntervalSec());
                number1StageRootEl.style.setProperty("--bh-lens-period", ivLens + "s");
                const ivDelta = Math.abs(ivLens - blackHoleLensRippleLastIv);
                const rippleDelaySyncMs = 320;
                if (ivDelta > 0.051 || !blackHoleLensRippleLastIv || now - blackHoleLensRippleCssLastMs >= rippleDelaySyncMs) {
                    blackHoleLensRippleCssLastMs = now;
                    blackHoleLensRippleLastIv = ivLens;
                    const nextAt = number1BlackHoleState.phase4NextWaveAtMs || 0;
                    let remSec = nextAt > now ? (nextAt - now) / 1000 : 0;
                    if (remSec > ivLens) remSec = ivLens;
                    const elapsedLens = Math.max(0, ivLens - remSec);
                    number1StageRootEl.style.setProperty("--bh-lens-ripple-delay", (-elapsedLens) + "s");
                }
            }
            const ivMs = Math.round(getBlackHoleWaveIntervalSec() * 1000);
            if (!(number1BlackHoleState.phase4NextWaveAtMs > 0)) number1BlackHoleState.phase4NextWaveAtMs = now + ivMs;
            if (now >= number1BlackHoleState.phase4NextWaveAtMs) {
                number1BlackHoleState.phase4WaveActiveUntilMs = now + BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC * 1000;
                number1BlackHoleState.phase4NextWaveAtMs = now + ivMs;
                number1BlackHoleState.phase4WaveTriggered = true;
                playBlackHoleScreenEffect("wave");
                pulseBlackHoleLensingAutoTick();
                syncBlackHolePhase1Vfx();
                if (now >= (number1BlackHoleState.phase4ManualReadyAtMs || 0)) {
                    number1BlackHoleState.phase4ManualReadyAtMs = now + Math.round(ivMs * 0.5);
                }
                number1BlackHoleUxFlags.waveReadyAnnounced = false;
            }
            if (!number1BlackHoleUxFlags.waveReadyAnnounced && now >= (number1BlackHoleState.phase4ManualReadyAtMs || 0)) {
                addToLog("Gravitational Wave manual trigger is ready.", "tip");
                number1BlackHoleUxFlags.waveReadyAnnounced = true;
            }
        }
        if (phase === 5) {
            const digestEnd = number1BlackHoleState.phase5DigestEndsAtMs || 0;
            if (digestEnd > 0 && now >= digestEnd) {
                const completedHand = Math.max(1, Math.floor(Number(number1BlackHoleState.phase5DigestHandNumber) || number1BlackHoleState.phase5NextSacrificeHand + 1 || 1));
                number1BlackHoleState.phase5DigestEndsAtMs = 0;
                number1BlackHoleState.phase5DigestStartedAtMs = 0;
                number1BlackHoleState.phase5DigestDurationMs = 0;
                number1BlackHoleState.phase5DigestHandNumber = 0;
                number1BlackHoleState.phase5DigestedHands = (number1BlackHoleState.phase5DigestedHands || 0) + 1;
                number1BlackHoleState.phase5FurnaceLevel = (number1BlackHoleState.phase5FurnaceLevel || 0) + 1;
                number1BlackHoleState.phase5PendingMutationHand = completedHand;
                number1BlackHoleState.phase5PendingMutationLevel = number1BlackHoleState.phase5FurnaceLevel;
                number1BlackHoleState.phase5LastDigestedHand = completedHand;
                number1BlackHoleState.phase5LastDigestCompletedAtMs = now;
                addToLog("Hand " + completedHand + " digestion complete. Echo Hand formed — choose a Furnace Mutation.", "milestone");
                showBlackHoleFurnaceDigestCompletionRitual(completedHand, number1BlackHoleState.phase5FurnaceLevel);
                number1BlackHoleUxFlags.digestReadyAnnounced = true;
                autosaveNow();
            }
            const passiveMeterPerSec = Math.max(0, 0.5 * getBlackHolePhase5EffectiveFurnacePower());
            if (passiveMeterPerSec > 0) {
                turboBoostMeter = Math.min(getTurboMeterMax(), turboBoostMeter + passiveMeterPerSec * dtSec);
            }
        }
        if (phase >= 6 && phase < 7) {
            const best = Math.max(0, Number(number1BlackHoleState.phase6JetBestAscensionEssence) || 0);
            const chargeCap = Math.max(500, best * (0.5 + 0.2 * getBlackHolePhase6TrackLevel("bank")));
            const batteryPerSec = Math.max(1, best * 0.01);
            number1BlackHoleState.phase6JetCharge = Math.min(chargeCap, (number1BlackHoleState.phase6JetCharge || 0) + batteryPerSec * dtSec);
            if (number1BlackHoleState.phase6JetActive) {
                const eff = 1 + 0.15 * getBlackHolePhase6TrackLevel("drain");
                const burn = (20 + 4 * getBlackHolePhase6TrackLevel("boost")) / eff;
                const fuelNeed = burn * dtSec;
                const fromTank = Math.min(number1BlackHoleState.phase6JetCharge || 0, fuelNeed);
                number1BlackHoleState.phase6JetCharge = Math.max(0, (number1BlackHoleState.phase6JetCharge || 0) - fromTank);
                const remainder = Math.max(0, fuelNeed - fromTank);
                if (remainder > 0 && number1AscensionEssence > 0) {
                    const fromEssence = Math.min(number1AscensionEssence, Math.ceil(remainder));
                    number1AscensionEssence -= fromEssence;
                }
                if (number1BlackHoleState.phase6JetCharge <= 0 && number1AscensionEssence <= 0) {
                    number1BlackHoleState.phase6JetActive = false;
                    if (!number1BlackHoleUxFlags.jetDryAnnounced) {
                        addToLog("Jet fuel depleted. Battery recharging; no Ascension Essence remains for emergency burn.", "warning");
                        number1BlackHoleUxFlags.jetDryAnnounced = true;
                    }
                }
            } else {
                const charge = number1BlackHoleState.phase6JetCharge || 0;
                const best = Math.max(0, Number(number1BlackHoleState.phase6JetBestAscensionEssence) || 0);
                const readyFloor = Math.max(100, best * 0.08);
                if (!number1BlackHoleUxFlags.jetReadyAnnounced && charge >= readyFloor) {
                    addToLog("Jet charge is ready. Ignite when you want a burst window.", "tip");
                    number1BlackHoleUxFlags.jetReadyAnnounced = true;
                    number1BlackHoleUxFlags.jetDryAnnounced = false;
                }
            }
        }
        if (phase >= 6 && totalChanges >= BLACK_HOLE_EVAPORATION_CAP) {
            number1BlackHoleState.phase = 7;
            number1BlackHoleState.phase7EnteredAtMs = now;
            number1BlackHoleState.phase7EpilogueCounter = 0;
            number1BlackHoleState.evaporationComplete = true;
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
            addToLog("Phase 7 reached. Evaporation begins. The epilogue counter is active.", "milestone");
            playBlackHoleScreenEffect("evaporation");
        }
        if (phase === 7) {
            number1BlackHoleState.phase7EpilogueCounter += dtSec;
        }
    }
    const ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID = "asc_ix_00";
    const ASCENSION_NODE_AUTOBUY_CHEAPEN_ID = "asc_ix_05";
    const ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID = "asc_ix_10";
    function ascensionAutobuyDefaultOnForNewHands() {
        return ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID);
    }
    function ascensionAutobuyIncludesCheapen() {
        return ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_CHEAPEN_ID);
    }
    function ascensionAutobuyIncludesSlowdown() {
        return ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID);
    }
    /** Integer grant value; digit strings preserve values beyond Number.MAX_SAFE_INTEGER. */
    function ascensionGrantHandUnlockCountToBigInt(v) {
        if (v == null || v === false) return 0n;
        if (typeof v === "bigint") return v < 0n ? 0n : v;
        if (typeof v === "number" && isFinite(v)) return BigInt(Math.max(0, Math.floor(v)));
        if (typeof v === "string" && /^[0-9]+$/.test(v)) {
            try {
                return BigInt(v);
            } catch (e) {
                return 0n;
            }
        }
        return 0n;
    }
    /** Min count each unlocked hand should have from Velocity ascension nodes; raises totals and can cascade milestone hand unlocks. */
    function getAscensionHandUnlockStartingCountFloor() {
        const raw = computeAscensionGrantTotals().handUnlockStartingCount;
        if (typeof raw === "bigint") {
            if (raw <= 0n) return 0;
            const cap = BigInt(Number.MAX_SAFE_INTEGER);
            return raw > cap ? Number.MAX_SAFE_INTEGER : Number(raw);
        }
        return Math.max(0, Math.floor(Number(raw) || 0));
    }
    function applyAscensionHandUnlockStartingCountFloorToUnlockedHands() {
        if (!number1HasAscended) return false;
        const floor = getAscensionHandUnlockStartingCountFloor();
        if (floor <= 0) return false;
        let any = false;
        for (let i = 0; i < unlockedHands; i++) {
            const cur = handEarnings[i] || 0;
            if (cur < floor) {
                handEarnings[i] = floor;
                any = true;
            }
        }
        if (any) {
            refreshTotalFromHandEarnings();
            if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
            updateObjectives();
            updateMilestoneUI();
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateTimeWarpAuraUI();
            updateEarnedBonusesUI();
            updatePageButtonUnlocks();
        }
        return any;
    }
    const ASCENSION_TURBO_BURN_EFFICIENCY_MAX_REDUCE = 0.99;
    const ASCENSION_COMBO_PRODUCTION_FRAC_CAP = 0.5;
    /** Middle-finger only: `comboEarnedPatternMultAdd` multiplies as Π(1 + x) over purchased middle nodes; product capped. Tuning target ~6–7× product at full middle (see combo sustain + pulse scaling for ~10× end-to-end reference). */
    const ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP = 10;
    /** Save/load: activation counts are edge-based (combo appears after being absent); version ≠ this clears counts on load. */
    const COMBO_ACTIVATION_EDGE_SAVE_VERSION = 2;
    const COMBO_SUSTAIN_ACC_MAX = 1;
    const COMBO_SUSTAIN_BASE_MAX_MULT_ADD = 0.055;
    const COMBO_SUSTAIN_MAX_MULT_ADD_CAP = 0.42;
    const COMBO_SUSTAIN_BASE_FILL_PER_TICK = 0.0012;
    const COMBO_SUSTAIN_FILL_EXTRA_CAP = 0.028;
    const COMBO_SUSTAIN_MAX_MULT_ADD_SUM_CAP = 0.38;
    const COMBO_ACTIVATION_LOG_COEFF_CAP = 0.065;
    const COMBO_ACTIVATION_LOG_BONUS_CAP = 0.45;
    /** Save/load sanity only (corrupted saves); no gameplay cap on run ramp. */
    const COMBO_RUN_BONUS_RAMP_LOAD_CAP = 1e15;
    /** `computeAscensionGrantTotals` only depends on purchased node ids — reuse until that set changes. */
    let _ascensionGrantTotalsCacheKey = "";
    let _ascensionGrantTotalsCache = null;
    function computeAscensionGrantTotals() {
        const cacheKey = number1AscensionNodeIds.length + "|" + number1AscensionNodeIds.slice().sort().join(",");
        if (_ascensionGrantTotalsCacheKey === cacheKey && _ascensionGrantTotalsCache) {
            return _ascensionGrantTotalsCache;
        }
        let cheapenCap = 0;
        let turboScaling = 0;
        let warpOverflow = 0;
        let speedMult = 1;
        let comboMultAdd = 0;
        let comboRunBonusAddPerTick = 0;
        let comboEarnedPatternMult = 1;
        let comboSustainMaxMultAdd = 0;
        let comboSustainFillPerTick = 0;
        let comboActivationLogCoeff = 0;
        let comboTriggerProductionFrac = 0;
        let comboTurboPointsMult = 1;
        let turboBoostComboFillAdd = 0;
        let autoBuyDelayMult = 1;
        let slowdownCostMult = 1;
        let clapCooldownMult = 1;
        let clapBonusChanceAdd = 0;
        let clapCheapenBonusChanceAdd = 0;
        let clapSlowdownBonusChanceAdd = 0;
        let clapEssenceProcChanceAdd = 0;
        let clapEssenceMultiplierStepAdd = 0;
        let clapCheapenExtraRoll = false;
        let clapCheapenChainRolls = false;
        let clapSlowdownExtraRoll = false;
        let clapSlowdownChainRolls = false;
        let comboClapExtraRoll = false;
        let comboClapChainRolls = false;
        let comboTimeWarpDelayReduceSec = 0;
        let comboTimeWarpDelayReduceMult = 1;
        let warpSpawnIntervalMult = 1;
        let warpManualGrantSeconds = 60;
        let warpAutoBuyAssist = false;
        let warpFactor36AllHandsOverflow = false;
        let warpPotencyMaxTiers = 0;
        let warpClickAscensionEssenceChance = 0;
        let warpOverflowAscensionEssenceChance = 0;
        let turboScensionActivationCostMult = 1;
        let turboBurnEfficiencyReduceSum = 0;
        let turboTankSizeMult = 1;
        let turboBurnRateMult = 1;
        let turboScensionExtraUpgradeRolls = 0;
        let turboLeveler = false;
        let turboScensionAllAxesUpgrade = false;
        let turboMeterFromComboMult = 1;
        let turboMeterDrainMult = 1;
        let turboOffMeterFillMult = 1;
        let turboPassiveMeterPerSec = 0;
        let handUnlockStartingCount = 0n;
        number1AscensionNodeIds.forEach(id => {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            if (!def || !def.grants) return;
            const g = def.grants;
            const capBi = ascensionGrantHandUnlockCountToBigInt(g.handUnlockStartingCount);
            if (capBi > handUnlockStartingCount) handUnlockStartingCount = capBi;
            if (typeof g.cheapenCap === "number") cheapenCap += g.cheapenCap;
            if (typeof g.turboScaling === "number") turboScaling += g.turboScaling;
            if (typeof g.warpOverflow === "number") warpOverflow += g.warpOverflow;
            if (typeof g.speedCostMult === "number" && g.speedCostMult > 0 && g.speedCostMult <= 1) speedMult *= g.speedCostMult;
            if (typeof g.comboMultAdd === "number") comboMultAdd += g.comboMultAdd;
            if (def.finger === "middle" && typeof g.comboEarnedPatternMultAdd === "number" && g.comboEarnedPatternMultAdd > 0) {
                comboEarnedPatternMult *= 1 + g.comboEarnedPatternMultAdd;
            }
            if (def.finger === "middle") {
                if (typeof g.comboSustainMaxMultAdd === "number" && g.comboSustainMaxMultAdd > 0) comboSustainMaxMultAdd += g.comboSustainMaxMultAdd;
                if (typeof g.comboSustainFillPerTick === "number" && g.comboSustainFillPerTick > 0) comboSustainFillPerTick += g.comboSustainFillPerTick;
                if (typeof g.comboActivationLogCoeff === "number" && g.comboActivationLogCoeff > 0) comboActivationLogCoeff += g.comboActivationLogCoeff;
                if (typeof g.comboRunBonusAddPerTick === "number" && g.comboRunBonusAddPerTick > 0) comboRunBonusAddPerTick += g.comboRunBonusAddPerTick;
                if (g.comboClapExtraRoll === true) comboClapExtraRoll = true;
                if (g.comboClapChainRolls === true) comboClapChainRolls = true;
                if (typeof g.comboTimeWarpDelayReduceSec === "number" && g.comboTimeWarpDelayReduceSec > 0) {
                    comboTimeWarpDelayReduceSec += g.comboTimeWarpDelayReduceSec;
                }
                if (typeof g.comboTimeWarpDelayReduceMult === "number" && g.comboTimeWarpDelayReduceMult > 1) {
                    comboTimeWarpDelayReduceMult *= g.comboTimeWarpDelayReduceMult;
                }
            }
            if (typeof g.comboTriggerProductionFrac === "number" && g.comboTriggerProductionFrac > 0) comboTriggerProductionFrac += g.comboTriggerProductionFrac;
            if (typeof g.comboTurboPointsMult === "number" && g.comboTurboPointsMult > 0) comboTurboPointsMult *= 1 + g.comboTurboPointsMult;
            if (typeof g.turboBoostComboFillAdd === "number" && g.turboBoostComboFillAdd > 0) turboBoostComboFillAdd += g.turboBoostComboFillAdd;
            if (typeof g.autoBuyDelayMult === "number" && g.autoBuyDelayMult > 0 && g.autoBuyDelayMult <= 1) autoBuyDelayMult *= g.autoBuyDelayMult;
            if (typeof g.slowdownCostMult === "number" && g.slowdownCostMult > 0 && g.slowdownCostMult <= 1) slowdownCostMult *= g.slowdownCostMult;
            if (typeof g.clapCooldownMult === "number" && g.clapCooldownMult > 0 && g.clapCooldownMult <= 1) clapCooldownMult *= g.clapCooldownMult;
            if (typeof g.clapBonusChanceAdd === "number" && g.clapBonusChanceAdd > 0) clapBonusChanceAdd += g.clapBonusChanceAdd;
            if (typeof g.clapCheapenBonusChanceAdd === "number" && g.clapCheapenBonusChanceAdd > 0) clapCheapenBonusChanceAdd += g.clapCheapenBonusChanceAdd;
            if (typeof g.clapSlowdownBonusChanceAdd === "number" && g.clapSlowdownBonusChanceAdd > 0) clapSlowdownBonusChanceAdd += g.clapSlowdownBonusChanceAdd;
            if (typeof g.clapEssenceProcChanceAdd === "number" && g.clapEssenceProcChanceAdd > 0) clapEssenceProcChanceAdd += g.clapEssenceProcChanceAdd;
            if (typeof g.clapEssenceMultiplierStepAdd === "number" && g.clapEssenceMultiplierStepAdd > 0) clapEssenceMultiplierStepAdd += g.clapEssenceMultiplierStepAdd;
            if (def.finger === "thumb" && g.clapCheapenExtraRoll === true) clapCheapenExtraRoll = true;
            if (def.finger === "thumb" && g.clapCheapenChainRolls === true) clapCheapenChainRolls = true;
            if (def.finger === "thumb" && g.clapSlowdownExtraRoll === true) clapSlowdownExtraRoll = true;
            if (def.finger === "thumb" && g.clapSlowdownChainRolls === true) clapSlowdownChainRolls = true;
            if (typeof g.warpSpawnIntervalMult === "number" && g.warpSpawnIntervalMult > 0 && g.warpSpawnIntervalMult <= 1) {
                warpSpawnIntervalMult *= g.warpSpawnIntervalMult;
            }
            if (def.finger === "pinky" && typeof g.warpManualGrantSeconds === "number" && Number.isFinite(g.warpManualGrantSeconds) && g.warpManualGrantSeconds >= 60) {
                warpManualGrantSeconds = Math.max(warpManualGrantSeconds, g.warpManualGrantSeconds);
            }
            if (def.finger === "pinky" && g.warpAutoBuyAssist === true) warpAutoBuyAssist = true;
            if (def.finger === "pinky" && g.warpFactor36AllHandsOverflow === true) warpFactor36AllHandsOverflow = true;
            if (def.finger === "pinky" && typeof g.warpPotencyMaxTiers === "number" && Number.isFinite(g.warpPotencyMaxTiers) && g.warpPotencyMaxTiers > 0) {
                warpPotencyMaxTiers += Math.floor(g.warpPotencyMaxTiers);
            }
            if (def.finger === "pinky" && typeof g.warpClickAscensionEssenceChance === "number" && Number.isFinite(g.warpClickAscensionEssenceChance) && g.warpClickAscensionEssenceChance > 0) {
                warpClickAscensionEssenceChance += g.warpClickAscensionEssenceChance;
            }
            if (def.finger === "pinky" && typeof g.warpOverflowAscensionEssenceChance === "number" && Number.isFinite(g.warpOverflowAscensionEssenceChance) && g.warpOverflowAscensionEssenceChance > 0) {
                warpOverflowAscensionEssenceChance += g.warpOverflowAscensionEssenceChance;
            }
            if (def.finger === "ring" && typeof g.turboScensionActivationCostMult === "number" && g.turboScensionActivationCostMult > 0 && g.turboScensionActivationCostMult <= 1) {
                turboScensionActivationCostMult *= g.turboScensionActivationCostMult;
            }
            if (def.finger === "ring" && typeof g.turboBurnEfficiencyReduce === "number" && g.turboBurnEfficiencyReduce > 0) {
                turboBurnEfficiencyReduceSum += g.turboBurnEfficiencyReduce;
            }
            if (def.finger === "ring" && typeof g.turboTankSizeMultAdd === "number" && g.turboTankSizeMultAdd > 0) {
                turboTankSizeMult *= 1 + g.turboTankSizeMultAdd;
            }
            if (def.finger === "ring" && typeof g.turboBurnRateMultAdd === "number" && g.turboBurnRateMultAdd > 0) {
                turboBurnRateMult *= 1 + g.turboBurnRateMultAdd;
            }
            if (def.finger === "ring" && g.turboScensionDoubleUpgrade === true) turboScensionExtraUpgradeRolls++;
            if (def.finger === "ring" && g.turboLeveler === true) turboLeveler = true;
            if (def.finger === "ring" && g.turboScensionAllAxesUpgrade === true) turboScensionAllAxesUpgrade = true;
            if (def.finger === "ring" && typeof g.turboMeterFromComboMultAdd === "number" && g.turboMeterFromComboMultAdd > 0) {
                turboMeterFromComboMult *= 1 + g.turboMeterFromComboMultAdd;
            }
            if (def.finger === "ring" && typeof g.turboMeterDrainMult === "number" && g.turboMeterDrainMult > 0 && g.turboMeterDrainMult <= 1) {
                turboMeterDrainMult *= g.turboMeterDrainMult;
            }
            if (def.finger === "ring" && typeof g.turboOffMeterFillMultAdd === "number" && g.turboOffMeterFillMultAdd > 0) {
                turboOffMeterFillMult *= 1 + g.turboOffMeterFillMultAdd;
            }
            if (def.finger === "ring" && typeof g.turboPassiveMeterPerSec === "number" && g.turboPassiveMeterPerSec > 0) {
                turboPassiveMeterPerSec += g.turboPassiveMeterPerSec;
            }
        });
        comboTriggerProductionFrac = Math.min(ASCENSION_COMBO_PRODUCTION_FRAC_CAP, comboTriggerProductionFrac);
        comboEarnedPatternMult = Math.min(ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP, comboEarnedPatternMult);
        comboSustainMaxMultAdd = Math.min(COMBO_SUSTAIN_MAX_MULT_ADD_SUM_CAP, comboSustainMaxMultAdd);
        comboSustainFillPerTick = Math.min(COMBO_SUSTAIN_FILL_EXTRA_CAP, comboSustainFillPerTick);
        comboActivationLogCoeff = Math.min(COMBO_ACTIVATION_LOG_COEFF_CAP, comboActivationLogCoeff);
        clapBonusChanceAdd = Math.min(0.45, clapBonusChanceAdd);
        clapCheapenBonusChanceAdd = Math.min(0.9, clapCheapenBonusChanceAdd);
        clapSlowdownBonusChanceAdd = Math.min(0.75, clapSlowdownBonusChanceAdd);
        clapEssenceProcChanceAdd = Math.min(0.85, clapEssenceProcChanceAdd);
        clapEssenceMultiplierStepAdd = Math.min(0.05, clapEssenceMultiplierStepAdd);
        turboBurnEfficiencyReduceSum = Math.min(ASCENSION_TURBO_BURN_EFFICIENCY_MAX_REDUCE, turboBurnEfficiencyReduceSum);
        const out = {
            cheapenCap,
            turboScaling,
            warpOverflow,
            speedMult,
            comboMultAdd,
            comboRunBonusAddPerTick,
            comboEarnedPatternMult,
            comboSustainMaxMultAdd,
            comboSustainFillPerTick,
            comboActivationLogCoeff,
            comboTriggerProductionFrac,
            comboTurboPointsMult,
            turboBoostComboFillAdd,
            autoBuyDelayMult,
            slowdownCostMult,
            clapCooldownMult,
            clapBonusChanceAdd,
            clapCheapenBonusChanceAdd,
            clapSlowdownBonusChanceAdd,
            clapEssenceProcChanceAdd,
            clapEssenceMultiplierStepAdd,
            clapCheapenExtraRoll,
            clapCheapenChainRolls,
            clapSlowdownExtraRoll,
            clapSlowdownChainRolls,
            comboClapExtraRoll,
            comboClapChainRolls,
            comboTimeWarpDelayReduceSec,
            comboTimeWarpDelayReduceMult,
            warpSpawnIntervalMult,
            warpManualGrantSeconds,
            warpAutoBuyAssist,
            warpFactor36AllHandsOverflow,
            warpPotencyMaxTiers,
            warpClickAscensionEssenceChance,
            warpOverflowAscensionEssenceChance,
            turboScensionActivationCostMult,
            turboBurnEfficiencyReduceSum,
            turboTankSizeMult,
            turboBurnRateMult,
            turboScensionExtraUpgradeRolls,
            turboLeveler,
            turboScensionAllAxesUpgrade,
            turboMeterFromComboMult,
            turboMeterDrainMult,
            turboOffMeterFillMult,
            turboPassiveMeterPerSec,
            handUnlockStartingCount
        };
        _ascensionGrantTotalsCacheKey = cacheKey;
        _ascensionGrantTotalsCache = out;
        return out;
    }
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
        return Math.max(1, TURBO_BOOST_METER_BASE_MAX + (t.turboScaling || 0) * 25);
    }
    /** Base meter capacity for the turbo mult curve (not multiplied by tank size). */
    function getTurboMeterCurveScale() {
        return turboMeterCurveScaleFromTotals(computeAscensionGrantTotals());
    }
    function getTurboMeterMax() {
        const t = computeAscensionGrantTotals();
        return turboMeterCurveScaleFromTotals(t) * (t.turboTankSizeMult || 1) * Math.pow(2, Math.max(0, turboScensionTankLevel));
    }
    function getTurboCountMultiplierMax() {
        const base = TURBO_COUNT_MULTIPLIER_BASE_MAX * Math.pow(1.25, getAscensionTurboScalingBonusFromTree());
        return base * Math.pow(2, Math.max(0, turboScensionMultLevel));
    }
    function getTimeWarpOverflowRatioFromTotals(t) {
        const w = Number(t && t.warpOverflow) || 0;
        let r = Math.min(0.9, TIME_WARP_OVERFLOW_BASE_RATIO + w * 0.05);
        if (t && t.warpFactor36AllHandsOverflow) r *= 0.75;
        return r;
    }
    function getTimeWarpOverflowRatio() {
        return getTimeWarpOverflowRatioFromTotals(computeAscensionGrantTotals());
    }
    /** Max seconds until next aura roll (uniform 0…max); ascension shortens span, floor 1s. */
    function getTimeWarpAuraSpawnSpanMaxSec() {
        const m = computeAscensionGrantTotals().warpSpawnIntervalMult || 1;
        return Math.max(1, 60 * m);
    }
    function getAscensionNodePurchaseCost(id) {
        const def = ASCENSION_MAP_NODE_BY_ID[id];
        return def && typeof def.cost === "number" ? def.cost : Number.MAX_SAFE_INTEGER;
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
        const def = ASCENSION_MAP_NODE_BY_ID[id];
        if (!def) return false;
        const s = ascensionPurchasedSet();
        return def.parents.every(p => s.has(p));
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
        const def = ASCENSION_MAP_NODE_BY_ID[id];
        return def && def.title ? def.title : id;
    }
    function collectAscensionChainToNode(id, purchased, visited, outOrdered) {
        const def = ASCENSION_MAP_NODE_BY_ID[id];
        if (!def) return;
        if (visited.has(id)) return;
        visited.add(id);
        (def.parents || []).forEach(function (pid) {
            collectAscensionChainToNode(pid, purchased, visited, outOrdered);
        });
        outOrdered.push(id);
    }
    function getAscensionPurchaseChainInfoToNode(id) {
        const purchased = ascensionPurchasedSet();
        const visited = new Set();
        const ordered = [];
        collectAscensionChainToNode(id, purchased, visited, ordered);
        const missingOrdered = ordered.filter(function (nid) {
            return !purchased.has(nid);
        });
        let missingCost = 0;
        missingOrdered.forEach(function (nid) {
            const c = getAscensionNodePurchaseCost(nid);
            if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) missingCost += c;
        });
        const targetOwned = purchased.has(id);
        return {
            ordered,
            missingOrdered,
            missingCost,
            totalCount: ordered.length,
            ownedCount: ordered.length - missingOrdered.length,
            targetOwned
        };
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
        updateTurboBoostUI();
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
            showStoryBannerById("ascension-map-collapse-ready");
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
            addToLog("Ascension respec is blocked while Black Hole progression is active.", "warning");
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
        updateTurboBoostUI();
        updateRateDisplay();
        updateTimeWarpAuraUI();
        refreshOverviewAndAscensionPanelsIfOpen();
        autosaveNow();
    }
    const ASCENSION_FINGER_RESPEC_LABELS = {
        index: "Index (velocity)",
        middle: "Middle (combo)",
        ring: "Ring (turbo)",
        pinky: "Pinky (warp)",
        thumb: "Thumb (clap)"
    };
    function ascensionFingerHasPurchasedNodes(finger) {
        return number1AscensionNodeIds.some(id => {
            const def = ASCENSION_MAP_NODE_BY_ID[id];
            return def && def.finger === finger;
        });
    }
    function respecNumber1AscensionFinger(finger) {
        if (!number1HasAscended) return;
        if (hasBlackHoleProgressLockingRespec()) {
            addToLog("Ascension respec is blocked while Black Hole progression is active.", "warning");
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
        updateTurboBoostUI();
        updateRateDisplay();
        refreshOverviewAndAscensionPanelsIfOpen();
        autosaveNow();
    }
    function escapeAscensionHtml(t) {
        return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    /**
     * Five equal columns (viewBox 0–100 wide): pinky → ring → middle → index → thumb (left to right).
     * Within each column, nodes sort by ascending branchIndex (tie: cost, id); lower index sits low,
     * then zigzag upward with a slight drift toward the top-right of the column. Short relaxation keeps
     * centers at least MIN_DIST apart; x stays inside the column band. Hand art stays decorative only.
     */
    function computeAscensionHandLayout() {
        const COL_FINGERS = ["pinky", "ring", "middle", "index", "thumb"];
        const vbH = 100;
        ascensionMapViewBoxHeight = vbH;
        const marginX = 2.4;
        const marginY = 5.5;
        const MIN_DIST = 4.62;
        const numCols = COL_FINGERS.length;
        const colWidth = (100 - 2 * marginX) / numCols;

        function nodeCost(n) {
            const c = n.cost;
            if (typeof c === "number" && isFinite(c)) return c;
            const parsed = Number(c);
            return isFinite(parsed) ? parsed : 0;
        }

        const byFinger = {};
        COL_FINGERS.forEach(function (fk) { byFinger[fk] = []; });
        ASCENSION_MAP_NODES.forEach(function (node) {
            let fk = node.finger || "middle";
            if (COL_FINGERS.indexOf(fk) < 0) fk = "middle";
            byFinger[fk].push(node);
        });

        const pts = [];
        COL_FINGERS.forEach(function (fk, c) {
            const list = (byFinger[fk] || []).slice().sort(function (a, b) {
                const ia = a.branchIndex != null ? a.branchIndex : 0;
                const ib = b.branchIndex != null ? b.branchIndex : 0;
                if (ia !== ib) return ia - ib;
                const ca = nodeCost(a);
                const cb = nodeCost(b);
                if (ca !== cb) return ca - cb;
                return String(a.id).localeCompare(String(b.id));
            });
            const n = list.length;
            if (!n) return;
            const xMin = marginX + c * colWidth + 0.45;
            const xMax = marginX + (c + 1) * colWidth - 0.45;
            const xc = (xMin + xMax) / 2;
            const xAmp = Math.min(2.95, (xMax - xMin) * 0.22);
            const usableY = vbH - 2 * marginY;
            const dy = n <= 1 ? 0 : usableY / (n - 1);
            const diagSpan = (xMax - xMin) * 0.42;
            let i;
            for (i = 0; i < n; i++) {
                const frac = n <= 1 ? 0.5 : i / (n - 1);
                const zig = (i % 2 === 0 ? -1 : 1) * xAmp;
                const diag = -diagSpan * 0.5 + frac * diagSpan;
                const x0 = xc + zig + diag * 0.55;
                const y0 = vbH - marginY - frac * usableY;
                pts.push({
                    id: list[i].id,
                    finger: fk,
                    x: x0,
                    y: y0,
                    xMin: xMin,
                    xMax: xMax
                });
            }
        });

        let iter;
        for (iter = 0; iter < 88; iter++) {
            const relax = iter < 40 ? 0.32 : 0.18;
            let i;
            for (i = 0; i < pts.length; i++) {
                let j;
                for (j = i + 1; j < pts.length; j++) {
                    const a = pts[i];
                    const b = pts[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const d = Math.hypot(dx, dy) || 1e-6;
                    if (d >= MIN_DIST) continue;
                    const push = ((MIN_DIST - d) / MIN_DIST) * relax;
                    const ux = dx / d;
                    const uy = dy / d;
                    a.x -= ux * push;
                    a.y -= uy * push;
                    b.x += ux * push;
                    b.y += uy * push;
                }
            }
            for (i = 0; i < pts.length; i++) {
                const p = pts[i];
                p.x = Math.min(p.xMax, Math.max(p.xMin, p.x));
                p.y = Math.min(vbH - marginY * 0.45, Math.max(marginY * 0.45, p.y));
            }
        }

        const out = {};
        let wi;
        for (wi = 0; wi < pts.length; wi++) {
            out[pts[wi].id] = { x: pts[wi].x, y: pts[wi].y };
        }
        return out;
    }
    /** Soft quadratic link between two nodes (no palm-relative routing). */
    function ascensionColumnEdgePath(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const bend = Math.min(2.8, Math.max(0.65, len * 0.12));
        const nx = (-dy / len) * bend;
        const ny = (dx / len) * bend;
        const mx = (x1 + x2) / 2 + nx;
        const my = (y1 + y2) / 2 + ny;
        return "M " + x1.toFixed(3) + " " + y1.toFixed(3) +
            " Q " + mx.toFixed(3) + " " + my.toFixed(3) + " " + x2.toFixed(3) + " " + y2.toFixed(3);
    }
    function ascensionEdgePathActive(parentId, childId, purchased) {
        const childDef = ASCENSION_MAP_NODE_BY_ID[childId];
        if (!childDef) return false;
        const childOwned = purchased.has(childId);
        const childReachable = childOwned || ascensionNodePrereqsMet(childId);
        if (!childReachable) return false;
        if (!parentId) return true;
        return purchased.has(parentId);
    }
    function ascensionMergePointForChild(node, L, np) {
        const parents = node.parents;
        if (!parents.length) return null;
        let ax = 0;
        let ay = 0;
        let n = 0;
        parents.forEach(function (pid) {
            const p = L[pid];
            if (p) {
                ax += p.x;
                ay += p.y;
                n++;
            }
        });
        if (!n) return null;
        ax /= n;
        ay /= n;
        const vx = np.x - ax;
        const vy = np.y - ay;
        const vlen = Math.hypot(vx, vy) || 1;
        const px = -vy / vlen;
        const py = vx / vlen;
        const spread = parents.length > 1 ? 1.5 + Math.min(2.6, parents.length * 0.28) : 0;
        return { x: (ax + np.x) / 2 + px * spread * 0.38, y: (ay + np.y) / 2 + py * spread * 0.38 };
    }
    function renderAscensionMapColumnGuidesSvg(vbH) {
        const lineH = typeof vbH === "number" && isFinite(vbH) ? vbH : ascensionMapViewBoxHeight;
        const marginX = 2.4;
        const colWidth = (100 - 2 * marginX) / 5;
        const parts = [];
        let c;
        for (c = 1; c < 5; c++) {
            const gx = marginX + c * colWidth;
            parts.push("<line class=\"asc-map-col-rule\" x1=\"" + gx.toFixed(3) + "\" y1=\"0\" x2=\"" + gx.toFixed(3) + "\" y2=\"" + lineH + "\"/>");
        }
        return "<g class=\"asc-map-col-guides\" aria-hidden=\"true\">" + parts.join("") + "</g>";
    }
    function renderAscensionMapEdgesSvg(layout) {
        const L = layout || computeAscensionHandLayout();
        const purchased = ascensionPurchasedSet();
        const parts = [];
        ASCENSION_MAP_NODES.forEach(node => {
            const r = node.route || "combo";
            const np = L[node.id];
            if (!np) return;
            const merge = node.parents.length > 1 ? ascensionMergePointForChild(node, L, np) : null;
            node.parents.forEach(pid => {
                const pp = L[pid];
                if (!pp) return;
                const active = ascensionEdgePathActive(pid, node.id, purchased);
                const stateClass = active ? " asc-map-edge--active" : " asc-map-edge--muted";
                let d;
                if (merge) {
                    d = ascensionColumnEdgePath(pp.x, pp.y, merge.x, merge.y) + " " +
                        ascensionColumnEdgePath(merge.x, merge.y, np.x, np.y);
                } else {
                    d = ascensionColumnEdgePath(pp.x, pp.y, np.x, np.y);
                }
                parts.push(
                    "<path class=\"asc-map-edge asc-map-edge--" + r + stateClass + "\" d=\"" + d + "\" />"
                );
            });
        });
        return parts.join("");
    }
    let ascensionMapPanZoomCleanup = null;
    let ascensionMapResizeObserver = null;
    let ascensionMapSyncCallSeq = 0;
    /** Survives overview re-renders (innerHTML refresh) so zoom/pan is not lost after buys or autosave. */
    const ascensionMapPanZoomState = { scale: 1, tx: 0, ty: 0 };
    /**
     * Map node x,y are in the same 0–100 space as the SVG viewBox. The SVG uses preserveAspectRatio meet,
     * so the graph is letterboxed inside the SVG element; plain % left/top on the full box misaligns pins,
     * hover, and popups. Position nodes with the same padding + scale as meet.
     */
    function syncAscensionMapNodeDomPositions() {
        const viewport = document.getElementById("ascension-map-viewport");
        if (!viewport) return;
        const svg = viewport.querySelector(".ascension-map-svg");
        const world = viewport.querySelector(".ascension-map-world");
        if (!svg || !world) return;
        ascensionMapSyncCallSeq++;
        const W = svg.clientWidth;
        const H = svg.clientHeight;
        if (!Number.isFinite(W) || !Number.isFinite(H) || W < 2 || H < 2) return;
        const rect = viewport.getBoundingClientRect();
        const ctm = svg.getScreenCTM();
        if (!ctm || typeof svg.createSVGPoint !== "function") return;
        function toViewportPoint(vbX, vbY) {
            const pt = svg.createSVGPoint();
            pt.x = vbX;
            pt.y = vbY;
            const sp = pt.matrixTransform(ctm);
            return { x: sp.x - rect.left, y: sp.y - rect.top };
        }
        world.querySelectorAll(".asc-map-node[data-asc-vbx]").forEach(function (el) {
            const nx = parseFloat(el.getAttribute("data-asc-vbx"), 10);
            const ny = parseFloat(el.getAttribute("data-asc-vby"), 10);
            if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
            const p = toViewportPoint(nx, ny);
            el.style.left = p.x + "px";
            el.style.top = p.y + "px";
        });
        const handEl = world.querySelector(".ascension-hand-backdrop");
        if (handEl) {
            const hub = (typeof ASCENSION_TREE_EXPORT !== "undefined" && ASCENSION_TREE_EXPORT && ASCENSION_TREE_EXPORT.HUB_CENTER)
                ? ASCENSION_TREE_EXPORT.HUB_CENTER
                : { x: 50, y: 51 };
            const hp = toViewportPoint(Number(hub.x) || 50, Number(hub.y) || 51);
            handEl.style.left = hp.x + "px";
            handEl.style.top = hp.y + "px";
        }
        if (typeof updateAscensionMapDetailPanel === "function") updateAscensionMapDetailPanel();
    }
    const ASCENSION_MAP_PICK_RADIUS_VB = 0.78;
    /** Last clicked node on the map; persists across overview refresh for the detail panel. */
    let ascensionMapSelectedNodeId = null;
    /** Node under pointer; detail panel prefers this over selection while hovering. */
    let ascensionMapHoverNodeId = null;
    function getAscensionMapDetailPanelSourceNodeId() {
        return ascensionMapHoverNodeId || ascensionMapSelectedNodeId;
    }
    function ascensionMapDebugEnabled() {
        try {
            if (typeof localStorage !== "undefined" && localStorage.getItem("ascensionMapDebug") === "1") return true;
        } catch (e) {}
        try {
            return typeof location !== "undefined" && /(?:\?|&)ascdev=1(?:&|$)/.test(String(location.search || ""));
        } catch (e2) {
            return false;
        }
    }
    function ascensionClientToViewBox(svgEl, clientX, clientY) {
        if (!svgEl || typeof svgEl.createSVGPoint !== "function") return null;
        const pt = svgEl.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svgEl.getScreenCTM();
        if (!ctm) return null;
        let inv;
        try {
            inv = ctm.inverse();
        } catch (e) {
            return null;
        }
        const loc = pt.matrixTransform(inv);
        return { x: loc.x, y: loc.y };
    }
    function ascensionPickNearestNodeId(vbX, vbY) {
        const L = computeAscensionHandLayout();
        let best = null;
        let bestD = ASCENSION_MAP_PICK_RADIUS_VB;
        ASCENSION_MAP_NODES.forEach(function (node) {
            const p = L[node.id];
            if (!p) return;
            const d = Math.hypot(p.x - vbX, p.y - vbY);
            if (d < bestD) {
                bestD = d;
                best = node.id;
            }
        });
        return best;
    }
    function ascensionResolveNodeIdAtClient(clientX, clientY) {
        const viewport = document.getElementById("ascension-map-viewport");
        if (!viewport) return null;
        const svg = viewport.querySelector(".ascension-map-svg");
        if (!svg) return null;
        const vb = ascensionClientToViewBox(svg, clientX, clientY);
        if (!vb) return null;
        return ascensionPickNearestNodeId(vb.x, vb.y);
    }
    function updateAscensionMapDetailPanel() {
        const titleEl = document.getElementById("ascension-map-detail-title");
        const effectEl = document.getElementById("ascension-map-detail-effect");
        const metaEl = document.getElementById("ascension-map-detail-meta");
        const kickerEl = document.getElementById("ascension-map-detail-kicker");
        if (!titleEl || !effectEl || !metaEl) return;
        const id = getAscensionMapDetailPanelSourceNodeId();
        if (kickerEl) kickerEl.textContent = "";
        if (!id || !ASCENSION_MAP_NODE_BY_ID[id]) {
            titleEl.textContent = "Ascension node";
            effectEl.textContent = "Hover or click a skill gem on the map to inspect it. Click also attempts purchase when affordable.";
            metaEl.textContent = "";
            return;
        }
        const def = ASCENSION_MAP_NODE_BY_ID[id];
        const owned = ascensionPurchasedSet().has(id);
        const prereqOk = ascensionNodePrereqsMet(id);
        const cost = getAscensionNodePurchaseCost(id);
        const chain = getAscensionPurchaseChainInfoToNode(id);
        let status = owned ? "Owned" : (prereqOk ? "Available" : "Locked");
        if (kickerEl) kickerEl.textContent = (def.route || "").charAt(0).toUpperCase() + (def.route || "").slice(1) + " · " + (def.finger || "");
        titleEl.textContent = def.title || id;
        effectEl.textContent = def.effect || "";
        let meta = "Essence cost: " + formatCount(cost) +
            " · Cost to here: " + formatCount(chain.missingCost) +
            " · Chain: " + chain.ownedCount + "/" + chain.totalCount + " owned" +
            " · " + status;
        if (!owned) meta += " · Your pool: " + formatCount(number1AscensionEssence);
        metaEl.textContent = meta;
    }
    function setAscensionMapSelectedNode(id, skipIfSame) {
        if (skipIfSame && id === ascensionMapSelectedNodeId) return;
        ascensionMapSelectedNodeId = id || null;
        document.querySelectorAll(".asc-map-node.asc-map-node--selected").forEach(function (el) {
            el.classList.remove("asc-map-node--selected");
        });
        if (id) {
            const nodeEl = document.querySelector('.asc-map-node[data-asc-node-id="' + String(id).replace(/"/g, "") + '"]');
            if (nodeEl) nodeEl.classList.add("asc-map-node--selected");
        }
        updateAscensionMapDetailPanel();
    }
    function teardownAscensionMapPanZoom() {
        if (ascensionMapResizeObserver) {
            ascensionMapResizeObserver.disconnect();
            ascensionMapResizeObserver = null;
        }
        if (typeof ascensionMapPanZoomCleanup === "function") {
            ascensionMapPanZoomCleanup();
            ascensionMapPanZoomCleanup = null;
        }
    }
    function initAscensionMapPanZoom() {
        teardownAscensionMapPanZoom();
        const viewport = document.getElementById("ascension-map-viewport");
        const layer = document.getElementById("ascension-map-pan-zoom");
        if (!viewport || !layer) return;
        ascensionMapHoverNodeId = null;
        const nodesLayer = viewport.querySelector(".ascension-map-nodes-layer");
        function onAscensionNodesPointerOver(e) {
            if (!number1HasAscended || !nodesLayer) return;
            const node = e.target && typeof e.target.closest === "function" ? e.target.closest(".asc-map-node") : null;
            if (!node || !nodesLayer.contains(node)) return;
            const hid = ascensionResolveNodeIdAtClient(e.clientX, e.clientY) || node.getAttribute("data-asc-node-id");
            if (!hid) return;
            if (ascensionMapHoverNodeId !== hid) {
                ascensionMapHoverNodeId = hid;
                updateAscensionMapDetailPanel();
            }
        }
        function onAscensionNodesPointerOut(e) {
            if (!number1HasAscended || !nodesLayer) return;
            const node = e.target && typeof e.target.closest === "function" ? e.target.closest(".asc-map-node") : null;
            if (!node || !nodesLayer.contains(node)) return;
            const related = e.relatedTarget;
            if (related && typeof related.closest === "function") {
                const nextNode = related.closest(".asc-map-node");
                if (nextNode && nodesLayer.contains(nextNode)) return;
            }
            ascensionMapHoverNodeId = null;
            updateAscensionMapDetailPanel();
        }
        if (nodesLayer) {
            nodesLayer.addEventListener("pointerover", onAscensionNodesPointerOver);
            nodesLayer.addEventListener("pointerout", onAscensionNodesPointerOut);
        }
        ascensionMapPanZoomState.scale = 1;
        ascensionMapPanZoomState.tx = 0;
        ascensionMapPanZoomState.ty = 0;
        layer.style.transform = "none";
        function scheduleAscensionNodeLayoutSync() {
            syncAscensionMapNodeDomPositions();
            requestAnimationFrame(syncAscensionMapNodeDomPositions);
        }
        let ascensionResizeSyncRaf = 0;
        function requestDebouncedAscensionNodeLayoutSync() {
            if (ascensionResizeSyncRaf) return;
            ascensionResizeSyncRaf = requestAnimationFrame(function () {
                ascensionResizeSyncRaf = 0;
                scheduleAscensionNodeLayoutSync();
            });
        }
        scheduleAscensionNodeLayoutSync();
        if (ascensionMapSelectedNodeId) {
            setAscensionMapSelectedNode(ascensionMapSelectedNodeId, false);
        } else {
            updateAscensionMapDetailPanel();
        }
        if (typeof ResizeObserver !== "undefined") {
            ascensionMapResizeObserver = new ResizeObserver(requestDebouncedAscensionNodeLayoutSync);
            ascensionMapResizeObserver.observe(viewport);
        }
        ascensionMapPanZoomCleanup = function () {
            if (ascensionResizeSyncRaf) {
                cancelAnimationFrame(ascensionResizeSyncRaf);
                ascensionResizeSyncRaf = 0;
            }
            ascensionMapHoverNodeId = null;
            if (nodesLayer) {
                nodesLayer.removeEventListener("pointerover", onAscensionNodesPointerOver);
                nodesLayer.removeEventListener("pointerout", onAscensionNodesPointerOut);
            }
        };
    }
    /** Stat pills only — used for live ticks without rebuilding the ascension map DOM. */
    function renderAscensionHubStatsPillsHtml() {
        if (!number1HasAscended) return "";
        const totals = computeAscensionGrantTotals();
        const totalNodes = ASCENSION_MAP_NODES.length;
        const ownedCount = number1AscensionNodeIds.length;
        const invested = getAscensionEssenceInvestedInNodes();
        const speedDiscountPct = (1 - totals.speedMult) * 100;
        const earnedPatMult = totals.comboEarnedPatternMult > 1 ? totals.comboEarnedPatternMult : 1;
        /** Middle-branch combo purchases: (1 + comboMultAdd) × comboEarnedPatternMult — same factors as in total bonus (without pattern base or rhythm). */
        const comboUpgradesMult = (1 + (totals.comboMultAdd || 0)) * earnedPatMult;
        const comboPulsePct = totals.comboTriggerProductionFrac * 100;
        const turboPtsPct = (totals.comboTurboPointsMult - 1) * 100;
        const turboSustainParts = [];
        if ((totals.turboMeterFromComboMult || 1) > 1.001) turboSustainParts.push("×" + (totals.turboMeterFromComboMult || 1).toFixed(2) + " combo→meter");
        if ((totals.turboMeterDrainMult || 1) < 0.999) turboSustainParts.push("×" + (totals.turboMeterDrainMult || 1).toFixed(2) + " drain");
        if ((totals.turboOffMeterFillMult || 1) > 1.001) turboSustainParts.push("×" + (totals.turboOffMeterFillMult || 1).toFixed(2) + " fill Off");
        if ((totals.turboPassiveMeterPerSec || 0) > 0) turboSustainParts.push("+" + totals.turboPassiveMeterPerSec + "/s On");
        const turboSustainPill = turboSustainParts.length
            ? "<span class=\"asc-stat-pill asc-stat-pill--wide\"><span class=\"asc-stat-pill-k\">Turbo sustain</span> <span class=\"asc-stat-pill-v\">" + turboSustainParts.join(" · ") + "</span></span>"
            : "";
        const sustainFillAsc = totals.comboSustainFillPerTick || 0;
        const sustainMaxAsc = totals.comboSustainMaxMultAdd || 0;
        const pulseLogCoeff = totals.comboActivationLogCoeff || 0;
        const sustainPill = sustainFillAsc > 1e-9 || sustainMaxAsc > 1e-9
            ? "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Sustain</span> <span class=\"asc-stat-pill-v\">+" + (sustainFillAsc * 100).toFixed(2) + "% fill/tick · +" + (sustainMaxAsc * 100).toFixed(0) + "% cap</span></span>"
            : "";
        const pulseScalePill = pulseLogCoeff > 1e-9
            ? "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Pulse log</span> <span class=\"asc-stat-pill-v\">×" + pulseLogCoeff.toFixed(3) + "</span></span>"
            : "";
        const pendingBonusEss = getNumber1AscensionPendingBonusEssence();
        const pendingBonusPill = pendingBonusEss > 0
            ? "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Next bonus</span> <span class=\"asc-stat-pill-v\">+" + formatCount(pendingBonusEss) + " Essence</span></span>"
            : "";
        const bhMultStat = getNumber1BlackHoleProductionMult();
        const bhPhase = getBlackHolePhase();
        const bhMass = Math.floor(Number(number1BlackHoleState.phase2Mass) || 0);
        const p1Spent = Math.floor(Number(number1BlackHoleState.phase1EssenceSpent) || 0);
        const bhParallel = Math.max(0, Number(number1BlackHoleState.phase2ParallelBonusPool) || 0);
        const blackHolePill = (isBlackHoleArcUnlocked() || bhPhase > 0)
            ? (bhPhase === 1
                ? "<span class=\"asc-stat-pill asc-stat-pill--wide asc-stat-pill--mass\"><span class=\"asc-stat-pill-k\">Mass accumulator</span> <span class=\"asc-stat-pill-v\">charge " + p1Spent + " / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " · inertial ×" + getBlackHolePhase1RunCpsMult().toFixed(2) + "</span></span>"
                : bhPhase === 7
                    ? "<span class=\"asc-stat-pill asc-stat-pill--wide asc-stat-pill--epilogue\"><span class=\"asc-stat-pill-k\">Evaporation</span> <span class=\"asc-stat-pill-v\">P7 · epilogue</span></span>"
                    : "<span class=\"asc-stat-pill asc-stat-pill--wide asc-stat-pill--void\"><span class=\"asc-stat-pill-k\">Black hole</span> <span class=\"asc-stat-pill-v\">P" + bhPhase + " · ×" + (bhMultStat >= 10 ? bhMultStat.toFixed(2) : bhMultStat.toFixed(3)) + " · mass " + bhMass + "</span></span>")
            : "";
        const blackHoleParallelPill = bhParallel > 0
            ? "<span class=\"asc-stat-pill asc-stat-pill--bh-parallel\"><span class=\"asc-stat-pill-k\">BH parallel</span> <span class=\"asc-stat-pill-v\">+" + (bhParallel * 100).toFixed(1) + "% Essence</span></span>"
            : "";
        return (
            "<span class=\"asc-stat-pill asc-stat-pill--wide\"><span class=\"asc-stat-pill-k\">Nodes</span> <span class=\"asc-stat-pill-v\">" + ownedCount + " / " + totalNodes + "</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">In nodes</span> <span class=\"asc-stat-pill-v\">" + formatCount(invested) + " Essence</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Pool</span> <span class=\"asc-stat-pill-v\">" + formatCount(number1AscensionEssence) + "</span></span>" +
            pendingBonusPill +
            blackHolePill +
            blackHoleParallelPill +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Cheapen cap</span> <span class=\"asc-stat-pill-v\">" + getMaxCheapenLevel() + "</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Speed</span> <span class=\"asc-stat-pill-v\">−" + speedDiscountPct.toFixed(1) + "% cost</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Combo upgrades</span> <span class=\"asc-stat-pill-v\">×" + comboUpgradesMult.toFixed(2) + "</span></span>" +
            sustainPill +
            pulseScalePill +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Combo pulse</span> <span class=\"asc-stat-pill-v\">" + comboPulsePct.toFixed(1) + "% CPS</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Turbo pts</span> <span class=\"asc-stat-pill-v\">+" + turboPtsPct.toFixed(0) + "%</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Turbo cap</span> <span class=\"asc-stat-pill-v\">" + formatCount(Math.round(getTurboCountMultiplierMax() * 100) / 100) + "×</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Meter</span> <span class=\"asc-stat-pill-v\">" + formatCount(getTurboMeterMax()) + "</span></span>" +
            turboSustainPill +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Warp</span> <span class=\"asc-stat-pill-v\">" + (getTimeWarpOverflowRatio() * 100).toFixed(0) + "%</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Warp aura</span> <span class=\"asc-stat-pill-v\">≤" + formatCount(Math.round(getTimeWarpAuraSpawnSpanMaxSec())) + "s</span></span>"
        );
    }
    /** Skip innerHTML when unchanged — avoids layout when the pills game loop polls ~1 Hz while ascension stays open. */
    function patchAscensionHubStatsPillsDomIfChanged() {
        const statsEl = document.getElementById("ascension-hub-stats");
        if (!statsEl) return;
        const nextHtml = renderAscensionHubStatsPillsHtml();
        if (statsEl.dataset.ascHubPillsSnap === nextHtml) return;
        statsEl.dataset.ascHubPillsSnap = nextHtml;
        statsEl.innerHTML = nextHtml;
    }
    function renderAscensionMapDebugOverlaySvg() {
        if (!ascensionMapDebugEnabled()) return "";
        const H = (ASCENSION_TREE_EXPORT && ASCENSION_TREE_EXPORT.HUB_CENTER) || { x: 50, y: 51 };
        const tips = (ASCENSION_TREE_EXPORT && ASCENSION_TREE_EXPORT.FINGERTIP_TARGETS) || {};
        const vbH = ascensionMapViewBoxHeight;
        const lines = [];
        let g;
        for (g = 0; g <= 100; g += 10) {
            lines.push("<line class=\"asc-map-debug-line\" x1=\"" + g + "\" y1=\"0\" x2=\"" + g + "\" y2=\"" + vbH + "\" />");
            lines.push("<line class=\"asc-map-debug-line\" x1=\"0\" y1=\"" + g + "\" x2=\"100\" y2=\"" + g + "\" />");
        }
        let dots = "<circle class=\"asc-map-debug-hub\" cx=\"" + H.x + "\" cy=\"" + H.y + "\" r=\"0.85\" />";
        Object.keys(tips).forEach(function (k) {
            const t = tips[k];
            if (t && typeof t.x === "number" && typeof t.y === "number") {
                dots += "<circle class=\"asc-map-debug-tip\" cx=\"" + t.x + "\" cy=\"" + t.y + "\" r=\"0.6\" />";
            }
        });
        return "<svg class=\"ascension-map-debug-svg\" viewBox=\"0 0 100 " + vbH + "\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\">" + lines.join("") + dots + "</svg>";
    }
    /** Vogel (golden-angle) spiral from disk center; glyphs follow the Fibonacci sequence. */
    function renderAccretionDiskSpiralNumeralsHtml() {
        const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
        /** Larger radius + exponent > 0.5 opens the Vogel arms so the spiral reads clearly in the hero. */
        const SCALE_REM = 1.02;
        const RADIAL_EXP = 0.63;
        const DURATION_SEC = 180;
        const MAX_TERMS = 12;
        const fib = [1];
        let prev = 1;
        let cur = 1;
        while (fib.length < MAX_TERMS) {
            const next = prev + cur;
            prev = cur;
            cur = next;
            fib.push(next);
        }
        const n = fib.length;
        const arms = [];
        for (let i = 0; i < n; i++) {
            let dx = 0;
            let dy = 0;
            if (i > 0) {
                const r = SCALE_REM * Math.pow(i, RADIAL_EXP);
                const ang = (i - 1) * GOLDEN_ANGLE;
                dx = r * Math.cos(ang);
                dy = r * Math.sin(ang);
            }
            const fadeDelay = -(i * DURATION_SEC / n);
            const wideClass = fib[i] >= 100 ? " asc-black-hole__disk-number-glyph--wide" : "";
            arms.push(
                "<span class=\"asc-black-hole__disk-spiral-arm\" style=\"--sdx:" + dx.toFixed(3) + "rem;--sdy:" + dy.toFixed(3) + "rem;--spiral-anim-delay:" + fadeDelay.toFixed(2) + "s\">" +
                "<span class=\"asc-black-hole__disk-number\"><span class=\"asc-black-hole__disk-number-glyph" + wideClass + "\">" + fib[i] + "</span></span></span>"
            );
        }
        return "<span class=\"asc-black-hole__disk-spiral\" aria-hidden=\"true\">" + arms.join("") + "</span>";
    }
    function renderAccretionDiskHeroInnerHtml() {
        return (
            "<span class=\"asc-black-hole__disk-glow\"></span>" +
            "<span class=\"asc-black-hole__disk-band asc-black-hole__disk-band--outer\"></span>" +
            "<span class=\"asc-black-hole__disk-band asc-black-hole__disk-band--inner\"></span>" +
            "<span class=\"asc-black-hole__disk-core\"></span>" +
            renderAccretionDiskSpiralNumeralsHtml()
        );
    }
    function initNumber1StageAccretionDiskBg() {
        const wrap = document.getElementById("number1-stage-disk-bg");
        if (!wrap || wrap.dataset.diskBgInit === "1") return;
        wrap.dataset.diskBgInit = "1";
        wrap.innerHTML =
            "<div class=\"asc-black-hole__disk-hero number1-stage-disk-hero\" aria-hidden=\"true\">" +
            renderAccretionDiskHeroInnerHtml() +
            "</div>";
    }
    function renderNumber1BlackHolePanelHtml() {
        const esc = escapeAscensionHtml;
        const unlocked = isBlackHoleArcUnlocked();
        if (unlocked && getBlackHolePhase() === 0) ensureBlackHoleArcStarted();
        const phase = getBlackHolePhase();
        const mult = getNumber1BlackHoleProductionMult();
        const multStr = mult >= 10 ? mult.toFixed(2) : mult.toFixed(3);
        const ascOwnedSet = ascensionPurchasedSet();
        const ownedCount = ASCENSION_MAP_NODES.reduce((n, node) => n + (ascOwnedSet.has(node.id) ? 1 : 0), 0);
        const totalCount = ASCENSION_MAP_NODES.length;
        let body = "";
        let note = "";
        let actions = "";
        let panelTitle = "Black hole";
        let panelAria = "Black hole — post-map progression";
        let panelExtraClass = "";
        if (!unlocked) {
            note = "<p class=\"asc-black-hole__note\">When every ascension node is mapped, the singularity opens.</p>" +
                "<p class=\"asc-black-hole__stats\">Tree progress: <strong>" + ownedCount + " / " + totalCount + "</strong></p>";
        } else if (phase === 0 || phase === 1) {
            panelTitle = "Numerical Mass Accumulator";
            panelAria = "Numerical Mass Accumulator — Phase 1 mass charge";
            panelExtraClass = " asc-black-hole--phase1";
            const spent = Math.floor(number1BlackHoleState.phase1EssenceSpent || 0);
            const rem = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - spent);
            const have = Math.max(0, Math.floor(Number(number1AscensionEssence) || 0));
            const pour = Math.min(rem, have);
            const can = rem > 0 && have > 0;
            const fillPct = Math.round(getBlackHolePhase1FillRatio() * 100);
            const slowdownCap = getMaxSlowdownLevelCap();
            const cpsM = getBlackHolePhase1RunCpsMult().toFixed(2);
            const ascM = getBlackHolePhase1AscensionEssenceMult().toFixed(2);
            body =
                "<div class=\"asc-black-hole__mass-geometry\" aria-hidden=\"true\">" +
                "<div class=\"asc-black-hole__tesseract\">" +
                "<span class=\"asc-black-hole__tesseract-frame asc-black-hole__tesseract-frame--outer\"></span><span class=\"asc-black-hole__tesseract-frame asc-black-hole__tesseract-frame--mid\"></span><span class=\"asc-black-hole__tesseract-frame asc-black-hole__tesseract-frame--inner\"></span><span class=\"asc-black-hole__tesseract-frame asc-black-hole__tesseract-frame--core\"></span>" +
                "<span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--a\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--b\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--c\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--d\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--e\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--f\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--g\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--h\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--i\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--j\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--k\"></span><span class=\"asc-black-hole__tesseract-edge asc-black-hole__tesseract-edge--l\"></span>" +
                "<span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--a\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--b\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--c\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--d\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--e\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--f\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--g\"></span><span class=\"asc-black-hole__tesseract-node asc-black-hole__tesseract-node--h\"></span>" +
                "</div>" +
                "<div class=\"asc-black-hole__numeral-dust\"><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span></div>" +
                "</div>" +
                "<p class=\"asc-black-hole__kicker\">Phase 1 · toward critical mass</p>" +
                "<p class=\"asc-black-hole__body\">You've mapped every branch — now your totals gain <strong>weight</strong>. This sink is the only use for Ascension Essence here: one button pours <strong>everything</strong> you hold into mass. Heavier numbers count faster, ascend richer, and pull harder on your slowdown ceiling.</p>" +
                "<div class=\"asc-black-hole__mass-meter-wrap\" role=\"group\" aria-label=\"Numerical mass charge\">" +
                "<div class=\"asc-black-hole__mass-meter-label\"><span>Mass charge</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%</span></div>" +
                "<div class=\"asc-black-hole__mass-meter-track\" role=\"progressbar\" aria-valuenow=\"" + spent + "\" aria-valuemin=\"0\" aria-valuemax=\"" + BLACK_HOLE_PHASE1_ESSENCE_TARGET + "\" aria-label=\"Essence poured into numerical mass\"><div class=\"asc-black-hole__mass-meter-fill\" style=\"width:" + fillPct + "%\"></div></div>" +
                "</div>" +
                "<ul class=\"asc-black-hole__effect-list\" aria-label=\"Mass effects on this run\">" +
                "<li><span class=\"asc-black-hole__effect-name\">Inertial counting</span><span class=\"asc-black-hole__effect-val\">run CPS ×" + esc(cpsM) + "</span><span class=\"asc-black-hole__effect-hint\">ticks feel heavier as the bar fills</span></li>" +
                "<li><span class=\"asc-black-hole__effect-name\">Essence coupling</span><span class=\"asc-black-hole__effect-val\">Ascend payout ×" + esc(ascM) + "</span><span class=\"asc-black-hole__effect-hint\">next Number 1 ascend earns more Essence</span></li>" +
                "<li><span class=\"asc-black-hole__effect-name\">Drag ceiling</span><span class=\"asc-black-hole__effect-val\">slowdown cap " + slowdownCap + "</span><span class=\"asc-black-hole__effect-hint\">room to lean on slowdown upgrades</span></li>" +
                "</ul>";
            note = "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence · next pour: <strong>" + esc(formatCount(pour)) + "</strong> into mass</p>";
            if (!can && rem > 0) {
                note += "<p class=\"asc-black-hole__note\">Ascend on Number 1 to earn Essence, then come back — one tap dumps your whole purse into the accumulator.</p>";
            }
            actions = "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--mass-pour\" data-asc-black-hole-buy=\"1\"" + (can ? "" : " disabled") + ">Pour in all Essence (" + esc(formatCount(pour)) + ")</button></p>";
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
            const tm = getBlackHolePhase2CollapseMassTier();
            const tp = getBlackHolePhase2CollapsePhotonTier();
            const te = getBlackHolePhase2CollapseErgosphereTier();
            const massPourUnlock = isBlackHolePhase2MassPourUnlocked();
            const cMass = getBlackHolePhase2CollapseUpgradeCost("mass");
            const cPhoton = getBlackHolePhase2CollapseUpgradeCost("photon");
            const cErgo = getBlackHolePhase2CollapseUpgradeCost("ergosphere");
            const canMassUp = tm < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cMass && cMass > 0;
            const canPhotonUp = tp < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cPhoton && cPhoton > 0;
            const canErgoUp = te < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cErgo && cErgo > 0;
            const canPourMass = massPourUnlock && have >= 1 && L < BLACK_HOLE_PHASE2_MASS_CAP;
            const coupPct = (getBlackHolePhase2MassCouplingCostMult() * 100).toFixed(1);
            const photonMultStr = getBlackHolePhase2PhotonShellMult().toFixed(3);
            const cdTrimStr = getBlackHolePhase2PhotonHawkingCdTrimSec().toFixed(2);
            const massEffectHtml =
                tm > 0
                    ? ("Lowers Essence cost per mass step while in this phase. Now: <strong>" + esc(coupPct) + "%</strong> of base cost.")
                    : "Each tier tightens Essence→mass conversion (lower % of base cost per step).";
            const photonEffectHtml =
                tp > 0
                    ? ("Disk primer: counting mult <strong>×" + esc(photonMultStr) + "</strong> · trims Hawking cooldown by <strong>" + esc(cdTrimStr) + "s</strong> (Phase 3+).")
                    : "Each tier adds counting mult and trims Hawking burst cooldown once the accretion disk exists.";
            const ergoEffectHtml =
                te > 0
                    ? ("Passively charges the Turbo meter on Number 1 during Phase 2 (strength scales with tier).")
                    : "Each tier increases passive Turbo meter fill per second while Turbo is unlocked (Phase 2 only).";
            const bankLine = nextCost > 0 && bank > 0
                ? (" · Banked toward next step: <strong>" + esc(formatCount(bank)) + "</strong> / " + esc(formatCount(nextCost)))
                : (nextCost > 0 ? (" · Next step: <strong>" + esc(formatCount(nextCost)) + "</strong> Essence") : "");
            const p2Row = function (track, title, tier, effectHtml, cost, canBuy) {
                const maxed = tier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
                const tierLabel = maxed ? "max" : (tier + "/" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER);
                const btnLabel = maxed ? "Maxed" : ("Buy (" + esc(formatCount(cost)) + ")");
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
                "<div class=\"asc-black-hole__collapse-geometry\" aria-hidden=\"true\">" +
                "<span class=\"asc-black-hole__collapse-core\"></span>" +
                "<span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--a\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--b\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--c\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--d\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--e\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--f\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--g\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--h\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--i\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--j\"></span>" +
                "</div>" +
                "<p class=\"asc-black-hole__kicker\">Phase 2 · collapse upgrades</p>" +
                "<p class=\"asc-black-hole__body\">Before the singularity accepts raw mass, stabilize three channels with Ascension Essence. Each track has <strong>" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER + "</strong> tiers. Every Phase 2 spend also charges the distinct <strong>BH parallel</strong> Essence bonus for future ascends.</p>" +
                "<div class=\"asc-black-hole__parallel-meter-wrap\" role=\"group\" aria-label=\"Black hole parallel Essence bonus\">" +
                "<div class=\"asc-black-hole__mass-meter-label\"><span>BH parallel pool</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>+" + esc((parallel * 100).toFixed(1)) + "%</strong> / +150.0% Essence</span></div>" +
                "<div class=\"asc-black-hole__mass-meter-track asc-black-hole__parallel-meter-track\" role=\"progressbar\" aria-valuenow=\"" + esc((parallel * 100).toFixed(1)) + "\" aria-valuemin=\"0\" aria-valuemax=\"150\" aria-label=\"Black hole parallel Essence bonus\"><div class=\"asc-black-hole__mass-meter-fill asc-black-hole__parallel-meter-fill\" style=\"width:" + parallelPct + "%\"></div></div>" +
                "</div>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Collapse upgrades\">" +
                p2Row("mass", "Essence–mass coupling", tm, massEffectHtml, cMass, canMassUp) +
                p2Row("photon", "Photon shell", tp, photonEffectHtml, cPhoton, canPhotonUp) +
                p2Row("ergosphere", "Ergosphere coupling", te, ergoEffectHtml, cErgo, canErgoUp) +
                "</div>";
            note =
                "<p class=\"asc-black-hole__stats\">Phase: <strong>2</strong> · Mass pour: <strong>" + (massPourUnlock ? "unlocked" : "locked") + "</strong> · Mass: <strong>" + L + "</strong> · Total gain: <strong>×" + esc(multStr) + "</strong>" + bankLine + "</p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(formatCount(have)) + "</strong> Ascension Essence.</p>" +
                (massPourUnlock
                    ? ""
                    : "<p class=\"asc-black-hole__note\">Bring every collapse track to tier " + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER + " to unlock mass investment.</p>");
            actions = "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" + (canPourMass ? "" : " disabled") + ">Pour all Essence into mass (" + esc(formatCount(have)) + ")</button></p>";
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
        return (
            "<section class=\"asc-black-hole" + panelExtraClass + "\" aria-label=\"" + esc(panelAria) + "\">" +
            "<h4 class=\"asc-black-hole__title\">" + esc(panelTitle) + "</h4>" +
            body +
            "<p class=\"asc-black-hole__stats\">Current total BH mult: <strong>×" + esc(multStr) + "</strong></p>" +
            note +
            actions +
            "</section>"
        );
    }
    /** Fingerprint ascend-control copy + affordances for ~1 Hz incremental patch (avoid outerHTML churn). */
    function getNumber1AscendControlLivePatchDigest() {
        const essence = Math.floor(Number(number1AscensionEssence) || 0);
        if (!number1HasAscended) {
            return "pre|" + unlockedHands + "|" + totalChanges + "|" + essence;
        }
        const ph = getBlackHolePhase();
        if (ph === 7) {
            return "p7|" + totalChanges + "|" + unlockedHands + "|" + essence;
        }
        const req = getNumber1AscensionRequiredHands();
        if (!isNumber1AscensionReady()) {
            return "nr|" + totalChanges + "|" + unlockedHands + "|" + req + "|" + ASCENSION_1_REQUIRED_TOTAL + "|" + essence;
        }
        const g = computeNumber1AscensionGainBreakdown(totalChanges);
        return (
            "r|" + g.finalGain + "|" + g.baseGain + "|" + g.pendingBonus + "|" + g.blackHolePhaseMult + "|" + g.beforeMult + "|" + g.clapMult + "|" +
            g.blackHoleMultiplierBonus + "|" + g.multiplierBonus
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
        const gainInfo = ready ? computeNumber1AscensionGainBreakdown(totalChanges) : null;
        const gainText = gainInfo ? formatCount(gainInfo.finalGain) : "0";
        const gainFormulaText = gainInfo
            ? " Formula: base " + formatCount(gainInfo.baseGain) +
                (gainInfo.pendingBonus > 0 ? " + warp bonus " + formatCount(gainInfo.pendingBonus) : "") +
                (gainInfo.blackHoleMultiplierBonus > 0 ? " + BH bonus " + formatCount(gainInfo.blackHoleMultiplierBonus) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)" : "") +
                (gainInfo.multiplierBonus > 0 ? " + clap mult " + formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)" : "") +
                " = " + gainText + "."
            : "";
        const requirementText = ready
            ? "Ready now: ascend Number 1 for " + gainText + " Ascension Essence." + gainFormulaText
            : "Not ready: reach " + formatCount(ASCENSION_1_REQUIRED_TOTAL) + " total and " + requiredHands + " hand" + (requiredHands === 1 ? "" : "s") + ". Current: " + formatCount(totalChanges) + " total, " + unlockedHands + "/" + requiredHands + " hands.";
        return (
            "<section" + digestAttr + " class=\"ascension-run-action" + (ready ? " ascension-run-action--ready" : "") + "\" aria-label=\"Number 1 ascend action\">" +
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
            const ascMapVbH = ascensionMapViewBoxHeight;
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
        const hubClass = hideAscensionSkillMap
            ? "ascension-hub ascension-hub--mass-arc-active"
            : ("ascension-hub" + (collapseActive ? " ascension-hub--collapse-active" : ""));
        const hubAria = hideAscensionSkillMap
            ? "Number 1 ascension — skill map complete; mass accumulator and black hole"
            : "Number 1 ascension skill map";
        const hubTitle = hideAscensionSkillMap
            ? "<h4 class=\"ascension-hub-title\"><span class=\"ascension-hub-glyph\" aria-hidden=\"true\">◇</span> Ascension — map complete</h4>"
            : "<h4 class=\"ascension-hub-title\"><span class=\"ascension-hub-glyph\" aria-hidden=\"true\">◇</span> Ascension map</h4>";
        const hubSub = hideAscensionSkillMap
            ? "<p class=\"ascension-hub-sub\">Every skill gem is owned. Spend Essence in the <strong>Numerical Mass Accumulator</strong> and later black-hole phases below — the gem map is done.</p>"
            : (collapseActive
                ? "<p class=\"ascension-hub-sub\">Every branch is complete. Watch the constellation collapse into the singularity.</p>"
                : "<p class=\"ascension-hub-sub\">Five columns — pinky through thumb — lower branch tier at the bottom of each column, rising toward the top. Combo pulse production is split across <strong>hands that satisfy that pattern</strong>. <strong>Respec is free</strong>. <strong>Hover or click a gem</strong> for details; <strong>click</strong> also attempts purchase.</p>");
        return (
            "<section class=\"" + hubClass + "\" aria-label=\"" + esc(hubAria) + "\">" +
            "<header class=\"ascension-hub-header\">" +
            hubTitle +
            hubSub +
            "<div class=\"ascension-hub-stats\" id=\"ascension-hub-stats\">" + renderAscensionHubStatsPillsHtml() + "</div>" +
            respecRow +
            "</header>" +
            mapAndLegend +
            renderNumber1BlackHolePanelHtml() +
            "</section>"
        );
    }
    function renderAscensionNumber2ShellHtml() {
        return number2.renderAscensionShell();
    }
    function tryBuyNumber2Upgrade(id) {
        number2.tryBuyUpgrade(id);
    }
    function tryActivateNumber2UpgradeAction(actionId) {
        number2.tryActivateUpgradeAction(actionId);
    }
    function tryBuyAscension2Node(nid) {
        number2.tryBuyAscensionNode(nid);
    }
    function renderAscensionPageHtml() {
        if (ascensionPageActiveNumber === 2 && !isNumber2Unlocked()) ascensionPageActiveNumber = 1;
        const n = ascensionPageActiveNumber;
        const tab2 = isNumber2Unlocked();
        let tabsHtml = "";
        if (tab2) {
            tabsHtml =
                "<div class=\"ascension-page-tabs\" role=\"tablist\" aria-label=\"Ascension by number\">" +
                "<button type=\"button\" class=\"page-btn ascension-number-tab" + (n === 1 ? " ascension-number-tab--active" : "") + "\" data-asc-tab=\"1\" role=\"tab\" aria-selected=\"" + (n === 1 ? "true" : "false") + "\">Number 1</button>" +
                "<button type=\"button\" class=\"page-btn ascension-number-tab" + (n === 2 ? " ascension-number-tab--active" : "") + "\" data-asc-tab=\"2\" role=\"tab\" aria-selected=\"" + (n === 2 ? "true" : "false") + "\">Number 2</button>" +
                "</div>";
        }
        let body = "";
        if (n === 1) body = renderNumber1AscendControlHtml() + renderAscensionUpgradesHtml();
        else if (n === 2 && tab2) body = renderAscensionNumber2ShellHtml();
        else body = renderAscensionUpgradesHtml();
        return "<div class=\"ascension-page\">" + tabsHtml + "<div class=\"ascension-page-body\">" + body + "</div></div>";
    }
    function getNumber2Milestone() {
        return number2.getMilestone();
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
                const progress = getObjectiveProgress(next);
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
                    s += " · Black hole P" + getBlackHolePhase() + " ×" + (m >= 10 ? m.toFixed(2) : m.toFixed(3)) + " (mass " + Math.floor(number1BlackHoleState.phase2Mass || 0) + ")";
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
    function renderGlobalOverview() {
        const rows = getUnlockedNumberModules().map(entry => {
            const m = entry.module;
            const milestone = m.getMilestone();
            const ascReady = m.isAscensionReady();
            const gainPreviewInfo = entry.number === 1 && ascReady ? computeNumber1AscensionGainBreakdown(totalChanges) : null;
            const gainPreview = gainPreviewInfo ? gainPreviewInfo.finalGain : 0;
            let ascPart = "Ascension: " + (ascReady ? "<span class=\"overview-asc-ready\">Ready</span>" : "Not ready");
            if (entry.number === 1) ascPart += " · Essence: " + formatCount(number1AscensionEssence);
            if (entry.number === 1 && !ascReady) {
                ascPart += " · Requirement: " + formatCount(ASCENSION_1_REQUIRED_TOTAL) + " total and " + getNumber1AscensionRequiredHands() + " hands";
            }
            if (entry.number === 1 && ascReady) {
                ascPart += " · Next gain: " + formatCount(gainPreview);
                if (gainPreviewInfo && gainPreviewInfo.blackHoleMultiplierBonus > 0) {
                    ascPart += " (BH bonus +" + formatCount(gainPreviewInfo.blackHoleMultiplierBonus) + ")";
                }
                if (gainPreviewInfo && gainPreviewInfo.multiplierBonus > 0) {
                    ascPart += " (clap mult +" + formatCount(gainPreviewInfo.multiplierBonus) + ")";
                }
                ascPart += " <button type=\"button\" class=\"ascend-number-btn\" data-number=\"1\">Ascend Number 1</button>";
            }
            if (entry.number === 1 && number1HasAscended) {
                ascPart += " <button type=\"button\" class=\"page-btn overview-open-ascension-btn\" data-open-ascension>Skill tree</button>";
            }
            if (entry.number === 2) {
                if (!number2State.started) ascPart = "Ascension: inactive — switch to Number 2 in the sidebar to begin.";
                ascPart += " · Luck essence: " + formatCount(number2State.ascensionEssence || 0);
                if (number2State.started) {
                    if (ascReady) {
                        ascPart += " <button type=\"button\" class=\"page-btn overview-open-ascension-n2-btn\" data-open-ascension-n2>Luck table</button>";
                    } else {
                        ascPart += " · Gate: Number 2 total ≥ " + formatCount(NUMBER2_ASCENSION_READY_TOTAL) + ".";
                    }
                }
            }
            const details = m.getOverviewDetails();
            const isLive = entry.number === 1;
            const badgeLabel = isLive ? "Main stage · live" : "Background · summarized";
            const badgeMod = isLive ? "overview-card-badge--live" : "overview-card-badge--bg";
            const pct = Math.max(0, Math.min(100, milestone.pct));
            const rateStr = formatCount(Math.round(m.getRatePerSec() * 100) / 100) + "/s";
            return (
                "<article class=\"overview-card overview-card--n" + entry.number + "\" data-overview-number=\"" + entry.number + "\">" +
                "<header class=\"overview-card-header\">" +
                "<span class=\"overview-card-poster-glyph\" aria-hidden=\"true\">" + entry.number + "</span>" +
                "<div class=\"overview-card-heading\">" +
                "<h3 class=\"overview-card-title\">" + m.getLabel() + "</h3>" +
                "<span class=\"overview-card-badge " + badgeMod + "\">" + badgeLabel + "</span>" +
                "</div></header>" +
                "<div class=\"overview-card-body\">" +
                "<div class=\"overview-stat\">" +
                "<span class=\"overview-stat-label\">Progress rate</span>" +
                "<span class=\"overview-stat-value\">" + rateStr + "</span></div>" +
                "<div class=\"overview-stat overview-stat--milestone\">" +
                "<span class=\"overview-stat-label\">Next milestone</span>" +
                "<span class=\"overview-stat-value overview-stat-milestone-text\">" + milestone.text + " · " + pct.toFixed(1) + "%</span>" +
                "<div class=\"overview-mini-progress\" role=\"progressbar\" aria-valuenow=\"" + pct.toFixed(1) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\">" +
                "<div class=\"overview-mini-fill\" style=\"width:" + pct + "%\"></div></div></div>" +
                "<div class=\"overview-stat\">" +
                "<span class=\"overview-stat-label\">Module details</span>" +
                "<span class=\"overview-stat-value\">" + details + "</span></div>" +
                (entry.number === 2 ? "<p class=\"overview-coming-soon-note\">Switch to <strong>Number 2</strong> in the sidebar for Double or Nothing.</p>" :
                    (entry.number !== 1 ? "<p class=\"overview-coming-soon-note\">Full playable stage for this number — <span class=\"coming-soon-inline\">coming soon</span>.</p>" : "")) +
                "<div class=\"overview-ascension-cell\">" + ascPart + "</div></div></article>"
            );
        });
        const base = rows.join("") || "<div class=\"overview-empty\">No unlocked numbers on this save. Additional number modules — <span class=\"coming-soon-inline\">coming soon</span>.</div>";
        return base;
    }
    function logCategoryTag(category) {
        const c = normalizeLogCategory(category);
        if (c === "tip") return "TIP";
        if (c === "fact") return "FACT";
        if (c === "milestone") return "MILE";
        if (c === "warning") return "WARN";
        if (c === "humor") return "JOKE";
        return "LOG";
    }
    function renderMessageLogLineHtml(entry) {
        return "<div class=\"message-log-line message-log-cat-" + entry.category + "\" data-log-category=\"" + entry.category + "\">" +
            "<span class=\"message-log-tag\">[" + logCategoryTag(entry.category) + "]</span>" +
            "<span class=\"message-log-text\">" + escapeHtml(entry.text) + "</span></div>";
    }
    function renderMessageLogPageHtml() {
        const visible = actionLogEntries.filter(entry => isLogCategoryVisible(entry.category));
        if (visible.length === 0) {
            messageLogLastRenderedVisibleCount = 0;
            messageLogLastRenderedHeadSig = "";
            messageLogLastRenderedTailSig = "";
            return "<p class=\"message-log-empty\">No messages yet. Tips, facts, and milestones will appear here as you play. Humor lines respect Settings → Humor messages.</p>" +
                "<p class=\"coming-soon-note coming-soon-note--compact\">Filters, search, and save export for this log — <span class=\"coming-soon-inline\">coming soon</span>.</p>";
        }
        messageLogLastRenderedVisibleCount = visible.length;
        messageLogLastRenderedHeadSig = visible[0].category + "\n" + visible[0].text;
        messageLogLastRenderedTailSig = visible[visible.length - 1].category + "\n" + visible[visible.length - 1].text;
        const lines = visible.map(renderMessageLogLineHtml).join("");
        return "<div class=\"message-log-terminal\" role=\"log\" aria-relevant=\"additions\">" +
            "<div class=\"message-log-terminal-header\" id=\"message-log-terminal-header\">message_feed // " + visible.length + " line(s) visible</div>" +
            "<div class=\"message-log-terminal-body\" id=\"message-log-terminal-body\">" + lines + "</div></div>" +
            "<p class=\"message-log-footnote\">Bottom ticker shows the latest lines; this panel is the full scrollback (oldest → newest).</p>";
    }
    function renderStoryArchiveHtml() {
        const canonicalIds = new Set(STORY_BANNERS.map(b => b.id));
        const legacyClosed = closedBanners.filter(b => b && b.id && !canonicalIds.has(b.id));
        const chapters = [...STORY_BANNERS, ...legacyClosed].sort((a, b) => a.order - b.order);
        const unlockedCount = chapters.filter(b => hasUnlockedStoryBanner(b.id)).length;
        let html = "<section class=\"story-log-section\" aria-label=\"Story Archive\">" +
            "<h4 class=\"story-log-heading\">Story Archive</h4>" +
            "<p class=\"story-review-summary\">" + unlockedCount + " / " + chapters.length + " transmissions recovered.</p>" +
            "<div class=\"story-review-list story-review-list--embedded\">";
        chapters.forEach((b, index) => {
            const unlocked = hasUnlockedStoryBanner(b.id);
            html += "<div class=\"story-review-item" + (unlocked ? " story-review-item--unlocked" : " story-review-item--locked") + "\">";
            if (unlocked) {
                html += "<div class=\"story-review-item-head\"><span class=\"story-review-item-kicker\">Transmission " + (index + 1) + "</span><button type=\"button\" class=\"story-review-replay\" data-story-replay-id=\"" + escapeHtml(b.id) + "\">Replay</button></div><strong class=\"story-review-item-title\">" + escapeHtml(b.title) + "</strong><p class=\"story-review-item-body\">" + escapeHtml(b.body) + "</p>";
            } else {
                html += "<div class=\"story-review-item-head\"><span class=\"story-review-item-kicker\">Transmission " + (index + 1) + "</span><span class=\"story-review-locked-tag\">Locked</span></div><strong class=\"story-review-item-title\">???</strong><p class=\"story-review-item-body\">Signal not yet recovered. Keep counting to unlock this story beat.</p>";
            }
            html += "</div>";
        });
        html += "</div></section>";
        return html;
    }
    function renderMessageAndStoryLogPageHtml() {
        return "<section class=\"message-log-section\" aria-label=\"Message Log\">" +
            "<h4 class=\"story-log-heading\">Message Log</h4>" +
            renderMessageLogPageHtml() +
            "</section>" +
            renderStoryArchiveHtml();
    }
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
        if (ascensionPageBtn) {
            ascensionPageBtn.style.display = (number1HasAscended || isNumber1AscensionReady()) ? "" : "none";
        }
    }
    function refreshMessageLogPanelIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl || !pagePanelTitleEl) return;
        if (pagePanelEl.dataset.openPageId !== "messages") return;
        const visible = actionLogEntries.filter(entry => isLogCategoryVisible(entry.category));
        const prevBody = document.getElementById("message-log-terminal-body");
        const prevHeader = document.getElementById("message-log-terminal-header");
        const headSig = visible.length > 0 ? (visible[0].category + "\n" + visible[0].text) : "";
        const tailSig = visible.length > 0 ? (visible[visible.length - 1].category + "\n" + visible[visible.length - 1].text) : "";
        if (
            prevBody &&
            prevHeader &&
            messageLogLastRenderedVisibleCount >= 0 &&
            visible.length === messageLogLastRenderedVisibleCount + 1
        ) {
            const prevTop = prevBody.scrollTop;
            const prevLeft = prevBody.scrollLeft;
            const prevHeight = prevBody.scrollHeight;
            const prevWidth = prevBody.scrollWidth;
            const wasPinnedToBottom = (prevTop + prevBody.clientHeight) >= (prevHeight - 2);
            const wasPinnedToRight = (prevLeft + prevBody.clientWidth) >= (prevWidth - 2);
            prevBody.insertAdjacentHTML("beforeend", renderMessageLogLineHtml(visible[visible.length - 1]));
            prevHeader.textContent = "message_feed // " + visible.length + " line(s) visible";
            messageLogLastRenderedVisibleCount = visible.length;
            messageLogLastRenderedHeadSig = headSig;
            messageLogLastRenderedTailSig = tailSig;
            if (wasPinnedToBottom) prevBody.scrollTop = prevBody.scrollHeight;
            else prevBody.scrollTop = prevTop;
            if (wasPinnedToRight) prevBody.scrollLeft = prevBody.scrollWidth;
            else prevBody.scrollLeft = prevLeft;
            return;
        }
        if (
            prevBody &&
            prevHeader &&
            messageLogLastRenderedVisibleCount > 0 &&
            visible.length === messageLogLastRenderedVisibleCount &&
            visible.length >= ACTION_LOG_MAX &&
            headSig !== messageLogLastRenderedHeadSig &&
            tailSig !== messageLogLastRenderedTailSig
        ) {
            const prevTop = prevBody.scrollTop;
            const prevLeft = prevBody.scrollLeft;
            const prevHeight = prevBody.scrollHeight;
            const prevWidth = prevBody.scrollWidth;
            const wasPinnedToBottom = (prevTop + prevBody.clientHeight) >= (prevHeight - 2);
            const wasPinnedToRight = (prevLeft + prevBody.clientWidth) >= (prevWidth - 2);
            if (prevBody.firstElementChild) prevBody.removeChild(prevBody.firstElementChild);
            prevBody.insertAdjacentHTML("beforeend", renderMessageLogLineHtml(visible[visible.length - 1]));
            prevHeader.textContent = "message_feed // " + visible.length + " line(s) visible";
            messageLogLastRenderedVisibleCount = visible.length;
            messageLogLastRenderedHeadSig = headSig;
            messageLogLastRenderedTailSig = tailSig;
            if (wasPinnedToBottom) prevBody.scrollTop = prevBody.scrollHeight;
            else prevBody.scrollTop = prevTop;
            if (wasPinnedToRight) prevBody.scrollLeft = prevBody.scrollWidth;
            else prevBody.scrollLeft = prevLeft;
            return;
        }
        let prevTop = 0;
        let prevLeft = 0;
        let prevHeight = 0;
        let prevWidth = 0;
        let wasPinnedToBottom = true;
        let wasPinnedToRight = false;
        if (prevBody) {
            prevTop = prevBody.scrollTop;
            prevLeft = prevBody.scrollLeft;
            prevHeight = prevBody.scrollHeight;
            prevWidth = prevBody.scrollWidth;
            wasPinnedToBottom = (prevTop + prevBody.clientHeight) >= (prevHeight - 2);
            wasPinnedToRight = (prevLeft + prevBody.clientWidth) >= (prevWidth - 2);
        }
        pagePanelBodyEl.innerHTML = renderMessageAndStoryLogPageHtml();
        const nextBody = document.getElementById("message-log-terminal-body");
        if (!nextBody) return;
        if (wasPinnedToBottom) {
            nextBody.scrollTop = nextBody.scrollHeight;
        } else {
            nextBody.scrollTop = prevTop;
        }
        if (wasPinnedToRight) {
            nextBody.scrollLeft = nextBody.scrollWidth;
        } else {
            nextBody.scrollLeft = prevLeft;
        }
        messageLogLastRenderedVisibleCount = visible.length;
        messageLogLastRenderedHeadSig = headSig;
        messageLogLastRenderedTailSig = tailSig;
    }
    function renderCombinationsPageHtml() {
        if (unlockedHands < 2) return "<p class=\"message-log-empty\">Unlock Hand 2 to view combinations.</p>";
        const discovered = new Set(earnedComboNames);
        const activeNow = new Set(getActiveCombos().map(c => c.name));
        const available = COMBOS.filter(c => unlockedHands >= c.minHands);
        const handOptions = ["all"].concat(Array.from(new Set(available.map(c => c.minHands))).sort((a, b) => a - b).map(String));
        let rows = available.slice();
        if (comboIndexStatusFilter === "discovered") rows = rows.filter(c => discovered.has(c.name));
        if (comboIndexStatusFilter === "undiscovered") rows = rows.filter(c => !discovered.has(c.name));
        if (comboIndexHandsFilter !== "all") rows = rows.filter(c => String(c.minHands) === comboIndexHandsFilter);
        const discoveredCount = available.filter(c => discovered.has(c.name)).length;
        const statusButtons = [
            { id: "all", label: "All" },
            { id: "discovered", label: "Discovered" },
            { id: "undiscovered", label: "Undiscovered" }
        ].map(b => "<button type=\"button\" class=\"page-btn combo-filter-btn" + (comboIndexStatusFilter === b.id ? " combo-filter-active" : "") + "\" data-combo-status=\"" + b.id + "\">" + b.label + "</button>").join(" ");
        const handButtons = handOptions.map(h => {
            const label = h === "all" ? "All hand counts" : (h + "-hand combos");
            return "<button type=\"button\" class=\"page-btn combo-filter-btn" + (comboIndexHandsFilter === h ? " combo-filter-active" : "") + "\" data-combo-hands=\"" + h + "\">" + label + "</button>";
        }).join(" ");
        const listItems = rows.map(c => {
            const found = discovered.has(c.name);
            const css = found ? "earned-bonus-item-earned" : "earned-bonus-undiscovered";
            const activeBadge = activeNow.has(c.name) ? " <span class=\"overview-card-badge overview-card-badge--live\">Active</span>" : "";
            const pulseEdges = comboActivationCounts[c.name] || 0;
            return "<li class=\"" + css + "\"><strong>" + c.name + "</strong>" + activeBadge + "<div>Hands: " + c.minHands + " · Effect: x" + c.bonus.toFixed(2) + " · Pulse count (edges): " + formatCount(pulseEdges) + "</div></li>";
        }).join("");
        return "<div class=\"coming-soon-sneak-peek\"><p class=\"coming-soon-sneak-title\">Combination Index</p><p>Discovered " + discoveredCount + " / " + available.length + ". Currently active: " + (activeNow.size > 0 ? Array.from(activeNow).join(", ") : "None") + ".</p></div>" +
            renderComboPagePerHandStatusSectionHtml() +
            "<section class=\"combo-earned-bonuses-section\" aria-labelledby=\"combo-bonus-breakdown-heading\">" +
            "<h3 id=\"combo-bonus-breakdown-heading\" class=\"combo-earned-bonuses-heading\">Bonus breakdown</h3>" +
            "<p class=\"combo-earned-bonuses-intro\">How pattern bonuses feed the <strong>total bonus</strong> on Count per second (tiers add; patterns multiply within a tier; combo upgrades and rhythm multiply on top).</p>" +
            "<ul id=\"earned-bonuses-list\" class=\"earned-bonuses-list--page\"></ul></section>" +
            "<div class=\"combo-filter-row\">" + statusButtons + "</div>" +
            "<div class=\"combo-filter-row\">" + handButtons + "</div>" +
            "<ul id=\"combo-index-list\">" + (listItems || "<li class=\"earned-bonuses-placeholder\">No combinations match the current filters.</li>") + "</ul>";
    }
    let comboFilterInteractionLockUntilMs = 0;
    let comboFilterLastApplyAtMs = 0;
    let comboFilterPauseAutoRefreshUntilMs = 0;
    const COMBO_FILTER_DEBOUNCE_MS = 220;
    const COMBO_FILTER_LOCK_MS = 220;
    const COMBO_FILTER_PAUSE_AUTO_REFRESH_MS = 1000;
    /** Full Combinations panel rebuild is expensive; game loop calls this every tick when the page is open. */
    const COMBINATIONS_FULL_REFRESH_MIN_MS = 350;
    let lastCombinationsFullRefreshMs = 0;
    /** Bonus breakdown list only: full DOM rebuild at most this often when the panel is auto-refreshed from the game loop (not on explicit user/sync events). */
    const EARNED_BONUSES_UI_AUTO_MIN_MS = 350;
    let lastEarnedBonusesUiRebuildAtMs = 0;

    function refreshCombinationsPanelIfOpen(force) {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl || !pagePanelTitleEl) return;
        if (pagePanelTitleEl.textContent !== "Combinations") return;
        const now = Date.now();
        if (!force && now < comboFilterPauseAutoRefreshUntilMs) {
            updateEarnedBonusesUI(false);
            return;
        }
        if (!force && now - lastCombinationsFullRefreshMs < COMBINATIONS_FULL_REFRESH_MIN_MS) {
            updateEarnedBonusesUI(false);
            return;
        }
        lastCombinationsFullRefreshMs = now;
        pagePanelBodyEl.innerHTML = renderCombinationsPageHtml();
        updateEarnedBonusesUI();
    }
    function syncMessageLogScrollContainerMode(pageId) {
        if (!pageModalEl) return;
        pageModalEl.classList.toggle("page-modal--messages", pageId === "messages");
    }
    function showPagePanel(pageId) {
        if (!pagePanelEl || !pagePanelTitleEl || !pagePanelBodyEl) return;
        teardownAscensionMapPanZoom();
        closeInlineMainStagePanels({ keep: "page" });
        let title = "";
        let bodyHtml = "";
        if (pageId === "achievements") {
            title = "Achievements";
            bodyHtml = renderComingSoonPoster("Achievement boards", "<p>Global and per-number achievement lists, filters, and rewards will live here.</p>" +
                "<p class=\"coming-soon-note\">Until then, pattern bonuses and your total bonus multiplier are on the <strong>Combinations</strong> page.</p>");
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
        if (pageModalEl) pageModalEl.classList.toggle("page-modal--wide", pageId === "overview" || pageId === "combinations" || pageId === "ascension");
        syncMessageLogScrollContainerMode(pageId);
        pagePanelEl.dataset.openPageId = pageId;
        pagePanelEl.style.display = "block";
        syncInlinePanelsVsGameplay();
        if (pageId === "messages") {
            requestAnimationFrame(() => scrollMessageLogPanelToBottom());
        }
        if (pageId === "combinations") {
            lastCombinationsFullRefreshMs = Date.now();
            requestAnimationFrame(() => updateEarnedBonusesUI());
        }
        if (pageId === "ascension" && ascensionPageActiveNumber === 1 && number1HasAscended) {
            requestAnimationFrame(() => initAscensionMapPanZoom());
        }
    }

    /* ---------------------------------------------------------
       SPEED UPGRADE (per-hand)
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
    const AUTO_BUY_DELAY_SECONDS = 30;
    let devAutoBuyDelaySeconds = null;
    function getAutoBuyDelaySeconds() {
        var base = devAutoBuyDelaySeconds !== null ? devAutoBuyDelaySeconds : AUTO_BUY_DELAY_SECONDS;
        var mult = computeAscensionGrantTotals().autoBuyDelayMult || 1;
        return Math.max(0.05, base * mult);
    }
    let autoBuyCountdownSecondsByHand = [];
    function getSpeedMultiplierForLevel(level) {
        if (level === 0) return 1;
        return Math.pow(2, level); 
    }
    function getEffectiveSpeedLevel(handIndex) {
        return Math.max(0, (speedLevel[handIndex] ?? 0) + (speedBonusLevel[handIndex] ?? 0));
    }
    function getSpeedMultiplier(handIndex) {
        return getSpeedMultiplierForLevel(getEffectiveSpeedLevel(handIndex));
    }
    /** Exact 2^level for tick math (float Math.pow loses integers past ~2^53). */
    function getSpeedMultiplierBigForLevel(level) {
        const lv = level | 0;
        if (lv <= 0) return 1n;
        return 1n << BigInt(lv);
    }
    function getUpgradeCost(handIndex, nextLevel) {
        const baseCost = 10 + Math.floor(Math.pow(4, nextLevel));
        const ascSpeed = computeAscensionGrantTotals().speedMult;
        return Math.max(1, Math.floor(baseCost * getCheapenMultiplier(handIndex) * ascSpeed));
    }
    const upgradeContainer = document.getElementById("upgrade-container");
    const speedUpgradesContainerEl = document.getElementById("speed-upgrades-container");
    const speedRowRefs = [];
    let handUpgradeDetailTipLogged = false;
    const UPGRADE_HOLD_REPEAT_MS = 100;
    let upgradeHoldRepeatState = null;
    let upgradeHoldSuppressClickBtn = null;
    let upgradeHoldRepeatTipLogged = false;
    function stopUpgradeHoldRepeat(setSuppressForClick) {
        if (!upgradeHoldRepeatState) return;
        clearInterval(upgradeHoldRepeatState.intervalId);
        if (setSuppressForClick) upgradeHoldSuppressClickBtn = upgradeHoldRepeatState.buttonEl;
        upgradeHoldRepeatState = null;
    }

    function ensureSpeedRows() {
        if (!speedUpgradesContainerEl) return;
        while (autoBuyEnabledByHand.length < unlockedHands) {
            autoBuyEnabledByHand.push(ascensionAutobuyDefaultOnForNewHands());
        }
        while (autoBuyCountdownSecondsByHand.length < unlockedHands) autoBuyCountdownSecondsByHand.push(0);
        while (speedRowRefs.length < unlockedHands) {
            const i = speedRowRefs.length;
            const handNum = i + 1;
            const wrapper = document.createElement("div");
            wrapper.className = "hand-upgrade-row";
            wrapper.setAttribute("data-hand-index", String(i));
            const handCol = document.createElement("div");
            handCol.className = "hand-left-column";
            const handSlot = document.createElement("div");
            handSlot.className = "hand-slot";
            handSlot.setAttribute("tabindex", "0");
            handSlot.setAttribute("aria-label", "Hand " + handNum + " — hover or focus for production details");
            const auraBtn = document.createElement("button");
            auraBtn.type = "button";
            auraBtn.className = "time-warp-aura-btn";
            auraBtn.setAttribute("data-hand-index", String(i));
            auraBtn.setAttribute("aria-label", "Activate Time Warp aura for hand " + handNum + " (" + TIME_WARP_MANUAL_CLICK_SCALE + "× " + getTimeWarpProductionSecondsBonus() + " seconds of effective production)");
            auraBtn.title = "Grants " + TIME_WARP_MANUAL_CLICK_SCALE + "× " + getTimeWarpProductionSecondsBonus() + "s of this hand's effective rate";
            auraBtn.style.display = "none";
            auraBtn.textContent = "Time Warp";
            const handSlotMain = document.createElement("div");
            handSlotMain.className = "hand-slot-main";
            handSlotMain.appendChild(auraBtn);
            const handHeadingLabel = document.createElement("span");
            handHeadingLabel.className = "speed-upgrade-label hand-slot-hand-label";
            handHeadingLabel.textContent = "Hand " + handNum;
            handHeadingLabel.setAttribute("aria-hidden", "true");
            handSlotMain.appendChild(handHeadingLabel);
            const statusBlock = document.createElement("div");
            statusBlock.className = "hand-status-block";
            statusBlock.setAttribute("role", "group");
            statusBlock.setAttribute("aria-label", "Hand " + handNum + " production");
            statusBlock.innerHTML = "<div class=\"hand-status-expanded\">" +
                "<div class=\"hand-status-line\"><span class=\"hand-status-k\">Count</span> <span class=\"hand-status-v hand-status-count\"></span></div>" +
                "<div class=\"hand-status-line\"><span class=\"hand-status-k\">Base CPS</span> <span class=\"hand-status-v hand-status-base\"></span></div>" +
                "<div class=\"hand-status-line\"><span class=\"hand-status-k\">Effective CPS</span> <span class=\"hand-status-v hand-status-effective\"></span></div>" +
                "<div class=\"hand-status-formula\" aria-hidden=\"true\"></div></div>" +
                "<div class=\"hand-status-compact\" aria-hidden=\"true\"></div>";
            handSlot.appendChild(handSlotMain);
            handSlot.appendChild(statusBlock);
            handCol.appendChild(handSlot);
            const row = document.createElement("div");
            row.className = "speed-upgrade-row";
            row.setAttribute("data-hand-index", String(i));
            row.innerHTML = "<span class=\"upgrade-pillar upgrade-pillar--speed\">" +
                "<span class=\"upgrade-pillar-heading\">Speed</span>" +
                "<button type=\"button\" class=\"upgrade-btn speed-upgrade-btn\" data-hand-index=\"" + i + "\">" +
                "<span class=\"upgrade-btn-fill\"></span>" +
                "<span class=\"upgrade-btn-body\"><span class=\"upgrade-btn-level\"></span><span class=\"upgrade-btn-label\">Upgrade</span></span>" +
                "<span class=\"upgrade-details-tooltip\" role=\"tooltip\"></span>" +
                "</button></span>" +
                "<span class=\"speed-autobuy-stack\"><label class=\"speed-autobuy-wrap\"><input type=\"checkbox\" class=\"speed-autobuy-toggle\" data-hand-index=\"" + i + "\"><span class=\"speed-autobuy-switch\"><span class=\"speed-autobuy-knob\"></span></span><span class=\"speed-autobuy-label\">Autobuy</span></label><span class=\"speed-autobuy-message\"></span></span>" +
                "<span class=\"upgrade-row-cheapen\" style=\"display: none;\">" +
                "<span class=\"upgrade-pillar upgrade-pillar--cheapen\">" +
                "<span class=\"upgrade-pillar-heading\">Cheapen</span>" +
                "<button type=\"button\" class=\"upgrade-btn cheapen-upgrade-btn\" data-hand-index=\"" + i + "\">" +
                "<span class=\"upgrade-btn-fill\"></span>" +
                "<span class=\"upgrade-btn-body\"><span class=\"upgrade-btn-level\"></span><span class=\"upgrade-btn-label\">Cheapen</span></span>" +
                "<span class=\"upgrade-details-tooltip\" role=\"tooltip\"></span>" +
                "</button></span></span>" +
                "<span class=\"upgrade-row-slowdown\" style=\"display: none;\">" +
                "<span class=\"upgrade-pillar upgrade-pillar--slowdown\">" +
                "<span class=\"upgrade-pillar-heading\">Slowdown</span>" +
                "<button type=\"button\" class=\"upgrade-btn slowdown-upgrade-btn\" data-hand-index=\"" + i + "\">" +
                "<span class=\"upgrade-btn-fill\"></span>" +
                "<span class=\"upgrade-btn-body\"><span class=\"upgrade-btn-level\"></span><span class=\"upgrade-btn-label\">Slowdown</span></span>" +
                "<span class=\"upgrade-details-tooltip\" role=\"tooltip\"></span>" +
                "</button></span></span>";
            const upgradesCol = document.createElement("div");
            upgradesCol.className = "hand-upgrades-column";
            upgradesCol.appendChild(row);
            wrapper.appendChild(handCol);
            wrapper.appendChild(upgradesCol);
            speedUpgradesContainerEl.appendChild(wrapper);
            const cheapenWrap = row.querySelector(".upgrade-row-cheapen");
            const slowdownWrap = row.querySelector(".upgrade-row-slowdown");
            speedRowRefs.push({
                handUpgradeRowEl: wrapper,
                handSlotEl: handSlot,
                handMountEl: handSlotMain,
                speedLevelEl: row.querySelector(".speed-upgrade-btn .upgrade-btn-level"),
                btn: row.querySelector(".speed-upgrade-btn"),
                autobuyToggleEl: row.querySelector(".speed-autobuy-toggle"),
                autobuyMessageEl: row.querySelector(".speed-autobuy-message"),
                cheapenWrapEl: cheapenWrap,
                cheapenLevelEl: row.querySelector(".cheapen-upgrade-btn .upgrade-btn-level"),
                cheapenBtn: row.querySelector(".cheapen-upgrade-btn"),
                slowdownWrapEl: slowdownWrap,
                slowdownLevelEl: row.querySelector(".slowdown-upgrade-btn .upgrade-btn-level"),
                slowdownBtn: row.querySelector(".slowdown-upgrade-btn"),
                timeWarpAuraBtn: auraBtn,
                statusCountEl: statusBlock.querySelector(".hand-status-count"),
                statusBaseEl: statusBlock.querySelector(".hand-status-base"),
                statusEffectiveEl: statusBlock.querySelector(".hand-status-effective"),
                statusFormulaEl: statusBlock.querySelector(".hand-status-formula"),
                statusCompactEl: statusBlock.querySelector(".hand-status-compact")
            });
        }
    }

    function shrinkSpeedRowsTo(keepCount) {
        if (!speedUpgradesContainerEl) return;
        const k = Math.max(0, keepCount | 0);
        while (speedRowRefs.length > k) {
            const ref = speedRowRefs.pop();
            const wrapper = ref && ref.handUpgradeRowEl ? ref.handUpgradeRowEl : null;
            if (wrapper && wrapper.parentNode === speedUpgradesContainerEl) {
                speedUpgradesContainerEl.removeChild(wrapper);
            }
        }
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
        if (!btn) return;
        const tip = btn.querySelector(".upgrade-details-tooltip");
        if (tip) tip.textContent = text || "";
    }
    function setUpgradeButtonProgress(btn, progress01) {
        if (!btn) return;
        const fill = btn.querySelector(".upgrade-btn-fill");
        const p = Math.max(0, Math.min(1, Number(progress01) || 0));
        const pct = (p * 100).toFixed(2) + "%";
        if (fill) fill.style.width = pct;
        let tint = "rgba(72, 98, 220, 0.58)";
        if (btn.classList.contains("cheapen-upgrade-btn")) tint = "rgba(56, 175, 95, 0.58)";
        else if (btn.classList.contains("slowdown-upgrade-btn")) tint = "rgba(235, 130, 48, 0.58)";
        if (p <= 0) {
            btn.style.backgroundImage = "";
        } else {
            btn.style.backgroundImage = "linear-gradient(90deg, " + tint + " 0 " + pct + ", transparent " + pct + " 100%)";
        }
    }
    function updateSpeedUpgradeUI() {
        if (totalChanges >= 10) {
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
                setUpgradeTooltipText(ref.btn, "Base level: " + speedLevel[i] + "\nBonus (clap): " + bonusB + "\nEffective: " + effLv + "\nBalance/Cost: " + formatCount(balance) + " / " + formatCount(cost) + "\nEffect next: +" + percent.toFixed(1) + "%");
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

    const upgradeScrollHintEl = document.getElementById("upgrade-scroll-hint");
    const upgradeScrollHintMessagesEl = document.getElementById("upgrade-scroll-hint-messages");
    const upgradeScrollHintJumpsEl = document.getElementById("upgrade-scroll-hint-jumps");
    const UPGRADE_SCROLL_HINT_TOP_MARGIN = 72;
    const UPGRADE_SCROLL_HINT_BOTTOM_MARGIN = 32;
    const SCROLL_HINT_PULSE_COOLDOWN_MS = 5000;
    const SPEED_AUTOBUY_SUPPRESS_COUNTDOWN_SEC = 5;
    let lastScrollHintPulseUpAt = 0;
    let lastScrollHintPulseDownAt = 0;
    let upgradeScrollHintLastStateKey = "";
    function handHasSpeedAffordableNext(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands || totalChanges < 10) return false;
        const bal = handEarnings[handIndex] || 0;
        const nextLevel = speedLevel[handIndex] + 1;
        return bal >= getUpgradeCost(handIndex, nextLevel);
    }
    function handHasCheapenAffordableNext(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands || !cheapenSectionUnlocked) return false;
        const bal = handEarnings[handIndex] || 0;
        const cl = cheapenLevel[handIndex] ?? 0;
        const cap = getMaxCheapenLevel();
        if (cl >= cap) return false;
        const c = getCheapenUpgradeCost(handIndex, cl + 1);
        return c !== null && bal >= c;
    }
    function handHasSlowdownAffordableNext(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands || !isSlowdownUnlocked()) return false;
        const bal = handEarnings[handIndex] || 0;
        const sl = slowdownLevel[handIndex] ?? 0;
        const cap = getMaxSlowdownLevelCap();
        if (sl >= cap) return false;
        const c = getSlowdownUpgradeCost(sl + 1);
        return c !== null && bal >= c;
    }
    function handHasAffordableUpgradeWaiting(handIndex) {
        return handHasSpeedAffordableNext(handIndex) || handHasCheapenAffordableNext(handIndex) || handHasSlowdownAffordableNext(handIndex);
    }
    /** Speed autobuy will buy within N seconds and no other upgrade type is waiting — suppress scroll hint for that hand. */
    function handSuppressedForImminentSpeedAutobuy(handIndex) {
        if (!autoBuyUnlocked || !autoBuyEnabledByHand[handIndex]) return false;
        const cd = autoBuyCountdownSecondsByHand[handIndex] || 0;
        if (cd <= 0 || cd > SPEED_AUTOBUY_SUPPRESS_COUNTDOWN_SEC) return false;
        if (!handHasSpeedAffordableNext(handIndex)) return false;
        if (handHasCheapenAffordableNext(handIndex) || handHasSlowdownAffordableNext(handIndex)) return false;
        return true;
    }
    function handScrollHintHasUpgradeReason(handIndex) {
        if (!handHasAffordableUpgradeWaiting(handIndex)) return false;
        if (handSuppressedForImminentSpeedAutobuy(handIndex)) return false;
        return true;
    }
    function handUpgradeRowIntersectsViewportComfort(el) {
        if (!el) return true;
        const r = el.getBoundingClientRect();
        const vTop = UPGRADE_SCROLL_HINT_TOP_MARGIN;
        const vBot = window.innerHeight - UPGRADE_SCROLL_HINT_BOTTOM_MARGIN;
        return r.bottom > vTop && r.top < vBot;
    }
    function classifyOffScreenScrollHintHands() {
        const above = [];
        const below = [];
        const vTop = UPGRADE_SCROLL_HINT_TOP_MARGIN;
        const vBot = window.innerHeight - UPGRADE_SCROLL_HINT_BOTTOM_MARGIN;
        for (let i = 0; i < unlockedHands; i++) {
            if (!handContributesToScrollHint(i)) continue;
            const row = speedRowRefs[i] && speedRowRefs[i].handUpgradeRowEl;
            if (!row) continue;
            if (handUpgradeRowIntersectsViewportComfort(row)) continue;
            const r = row.getBoundingClientRect();
            if (r.bottom <= vTop) above.push({ handIndex: i, row: row, r: r });
            else if (r.top >= vBot) below.push({ handIndex: i, row: row, r: r });
        }
        above.sort((a, b) => {
            const pa = handContributesTimeWarpPriority(a.handIndex);
            const pb = handContributesTimeWarpPriority(b.handIndex);
            if (pa !== pb) return pb - pa;
            return b.r.bottom - a.r.bottom;
        });
        below.sort((a, b) => {
            const pa = handContributesTimeWarpPriority(a.handIndex);
            const pb = handContributesTimeWarpPriority(b.handIndex);
            if (pa !== pb) return pb - pa;
            return a.r.top - b.r.top;
        });
        return { above: above, below: below };
    }
    function pulseUpgradeScrollHintShell() {
        if (!upgradeScrollHintEl) return;
        upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--pulse");
        void upgradeScrollHintEl.offsetWidth;
        upgradeScrollHintEl.classList.add("upgrade-scroll-hint--pulse");
        window.clearTimeout(pulseUpgradeScrollHintShell._clearT);
        pulseUpgradeScrollHintShell._clearT = window.setTimeout(() => {
            upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--pulse");
        }, 750);
    }
    function pulseHandUpgradeRowForScrollHint(rowEl) {
        if (!rowEl) return;
        rowEl.classList.remove("hand-upgrade-row--scroll-pulse");
        void rowEl.offsetWidth;
        rowEl.classList.add("hand-upgrade-row--scroll-pulse");
        window.setTimeout(() => rowEl.classList.remove("hand-upgrade-row--scroll-pulse"), 750);
    }
    /** Scroll window so the full hand row fits in view (same margins as scroll-hint comfort band). Vertical only. */
    function scrollHandUpgradeRowFullyIntoView(rowEl) {
        if (!rowEl) return;
        const padTop = UPGRADE_SCROLL_HINT_TOP_MARGIN;
        const padBot = UPGRADE_SCROLL_HINT_BOTTOM_MARGIN;
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const rect = rowEl.getBoundingClientRect();
        const available = vh - padTop - padBot;
        let delta = 0;
        if (rect.height <= available) {
            if (rect.top < padTop) {
                delta = rect.top - padTop;
            } else if (rect.bottom > vh - padBot) {
                delta = rect.bottom - (vh - padBot);
            }
        } else {
            const bandMidY = padTop + available / 2;
            const idealTop = bandMidY - rect.height / 2;
            delta = rect.top - idealTop;
        }
        if (Math.abs(delta) > 2) {
            window.scrollBy({ top: delta, left: 0, behavior: "smooth" });
        }
    }
    if (upgradeScrollHintEl && upgradeScrollHintEl.dataset.jumpBound !== "1") {
        upgradeScrollHintEl.dataset.jumpBound = "1";
        upgradeScrollHintEl.addEventListener("click", function(e) {
            const btn = e.target.closest("[data-jump-hand]");
            if (!btn) return;
            const i = parseInt(btn.getAttribute("data-jump-hand"), 10);
            if (isNaN(i) || i < 0 || i >= unlockedHands) return;
            const row = speedRowRefs[i] && speedRowRefs[i].handUpgradeRowEl;
            if (row) scrollHandUpgradeRowFullyIntoView(row);
        });
    }
    let handUpgradeScrollHintRaf = 0;
    function updateHandUpgradeScrollHint() {
        if (!upgradeScrollHintEl || !upgradeScrollHintMessagesEl || !upgradeScrollHintJumpsEl) return;
        const { above, below } = classifyOffScreenScrollHintHands();
        const needUp = above.length > 0;
        const needDown = below.length > 0;
        if (!needUp) lastScrollHintPulseUpAt = 0;
        if (!needDown) lastScrollHintPulseDownAt = 0;
        if (!needUp && !needDown) {
            upgradeScrollHintMessagesEl.textContent = "";
            upgradeScrollHintJumpsEl.innerHTML = "";
            upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--down-only");
            upgradeScrollHintEl.hidden = true;
            upgradeScrollHintLastStateKey = "";
            return;
        }
        upgradeScrollHintEl.hidden = false;
        upgradeScrollHintEl.classList.toggle("upgrade-scroll-hint--down-only", needDown && !needUp);
        const upTwAny = needUp && above.some(e => handHasActiveTimeWarpAura(e.handIndex));
        const upGrAny = needUp && above.some(e => handScrollHintHasUpgradeReason(e.handIndex));
        const downTwAny = needDown && below.some(e => handHasActiveTimeWarpAura(e.handIndex));
        const downGrAny = needDown && below.some(e => handScrollHintHasUpgradeReason(e.handIndex));
        const upPri = above[0] ? above[0].handIndex : "x";
        const downPri = below[0] ? below[0].handIndex : "x";
        const upPriTw = above[0] && handHasActiveTimeWarpAura(above[0].handIndex) ? "1" : "0";
        const downPriTw = below[0] && handHasActiveTimeWarpAura(below[0].handIndex) ? "1" : "0";
        const stateKey =
            (needUp ? "1" : "0") +
            "|" +
            (needDown ? "1" : "0") +
            "|" +
            upPri +
            "|" +
            downPri +
            "|" +
            (upTwAny ? "1" : "0") +
            (upGrAny ? "1" : "0") +
            (downTwAny ? "1" : "0") +
            (downGrAny ? "1" : "0") +
            "|" +
            upPriTw +
            "|" +
            downPriTw;
        if (stateKey !== upgradeScrollHintLastStateKey) {
            upgradeScrollHintLastStateKey = stateKey;
            lastScrollHintPulseUpAt = 0;
            lastScrollHintPulseDownAt = 0;
            upgradeScrollHintMessagesEl.innerHTML = "";
            if (needUp) {
                const line = document.createElement("div");
                line.className = "upgrade-scroll-hint-line";
                if (upTwAny && upGrAny) line.textContent = "Scroll up, hand upgrades or a Time Warp are available!";
                else if (upTwAny) line.textContent = "Scroll up, a Time Warp is waiting!";
                else line.textContent = "Scroll up, hand upgrades are available!";
                upgradeScrollHintMessagesEl.appendChild(line);
            }
            if (needDown) {
                const line = document.createElement("div");
                line.className = "upgrade-scroll-hint-line";
                if (downTwAny && downGrAny) line.textContent = "Scroll down, hand upgrades or a Time Warp are available!";
                else if (downTwAny) line.textContent = "Scroll down, a Time Warp is waiting!";
                else line.textContent = "Scroll down, hand upgrades are available!";
                upgradeScrollHintMessagesEl.appendChild(line);
            }
            upgradeScrollHintJumpsEl.innerHTML = "";
            if (needUp && above[0]) {
                const hi = above[0].handIndex;
                const b = document.createElement("button");
                b.type = "button";
                b.className = "upgrade-scroll-hint-jump-btn";
                b.setAttribute("data-jump-hand", String(hi));
                b.textContent = handHasActiveTimeWarpAura(hi) ? "Jump to Hand " + (hi + 1) + " (Time Warp)" : "Jump to Hand " + (hi + 1);
                upgradeScrollHintJumpsEl.appendChild(b);
            }
            if (needDown && below[0]) {
                const hi = below[0].handIndex;
                const b = document.createElement("button");
                b.type = "button";
                b.className = "upgrade-scroll-hint-jump-btn";
                b.setAttribute("data-jump-hand", String(hi));
                b.textContent = handHasActiveTimeWarpAura(hi) ? "Jump to Hand " + (hi + 1) + " (Time Warp)" : "Jump to Hand " + (hi + 1);
                upgradeScrollHintJumpsEl.appendChild(b);
            }
        }
        const now = Date.now();
        const upDue = needUp && (lastScrollHintPulseUpAt === 0 || now - lastScrollHintPulseUpAt >= SCROLL_HINT_PULSE_COOLDOWN_MS);
        const downDue = needDown && (lastScrollHintPulseDownAt === 0 || now - lastScrollHintPulseDownAt >= SCROLL_HINT_PULSE_COOLDOWN_MS);
        if (upDue || downDue) {
            if (upDue) lastScrollHintPulseUpAt = now;
            if (downDue) lastScrollHintPulseDownAt = now;
            pulseUpgradeScrollHintShell();
            if (upDue && above[0]) pulseHandUpgradeRowForScrollHint(above[0].row);
            if (downDue && below[0]) {
                if (upDue) window.setTimeout(() => pulseHandUpgradeRowForScrollHint(below[0].row), 160);
                else pulseHandUpgradeRowForScrollHint(below[0].row);
            }
        }
    }
    function scheduleHandUpgradeScrollHintUpdate() {
        if (handUpgradeScrollHintRaf) return;
        handUpgradeScrollHintRaf = requestAnimationFrame(() => {
            handUpgradeScrollHintRaf = 0;
            updateHandUpgradeScrollHint();
        });
    }

    function buySpeedUpgradeForHand(handIndex, opts) {
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const nextLevel = speedLevel[handIndex] + 1;
        const cost = getUpgradeCost(handIndex, nextLevel);
        const balance = handEarnings[handIndex] || 0;
        if (balance < cost) return;
        handEarnings[handIndex] = balance - cost;
        markMeaningfulProgress();
        refreshTotalFromHandEarnings();
        speedLevel[handIndex]++;
        const handNum = handIndex + 1;
        const upgradedHand = hands[handIndex];
        if (upgradedHand) upgradedHand.tickAccBig = 0n;
        if (!opts?.silentLog) addToLog("Speed upgrade purchased for Hand " + handNum + " (level " + speedLevel[handIndex] + ")", "tip");
        incrementalEl.textContent = formatCount(totalChanges);
        hands.forEach(h => h.restartTimer());
        if (autoBuyUnlocked) {
            const nextCost = getUpgradeCost(handIndex, speedLevel[handIndex] + 1);
            if ((handEarnings[handIndex] || 0) < nextCost) autoBuyCountdownSecondsByHand[handIndex] = 0;
        }
        if (!opts?.fromAutobuy) {
            const origin = opts?.confettiOrigin || speedRowRefs[handIndex]?.btn?.closest(".speed-upgrade-row");
            if (origin) sprayConfettiFrom(origin);
        }
        if (opts?.skipUpgradeDom) {
            batchedUpgradeUiFlush = true;
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        }
    }

    /* ---------------------------------------------------------
       CHEAPEN SPEED UPGRADE (per-hand), max 6 per hand. 99%, 99.9%, ...
    --------------------------------------------------------- */
    const BASE_MAX_CHEAPEN_LEVEL = 6;
    let cheapenLevel = Array(maxHands).fill(0);
    let cheapenBonusLevel = Array(maxHands).fill(0);
    function getEffectiveCheapenLevel(handIndex) {
        return Math.max(0, (cheapenLevel[handIndex] ?? 0) + (cheapenBonusLevel[handIndex] ?? 0));
    }
    function getCheapenMultiplier(handIndex) {
        const level = getEffectiveCheapenLevel(handIndex);
        return level === 0 ? 1 : Math.pow(10, -(level + 1));
    }
    function getCheapenUpgradeCost(handIndex, nextLevel) {
        return 1000 * Math.pow(10, nextLevel - 1);
    }
    let cheapenSectionUnlocked = false;
    let devCheapenAutobuyOn = false;
    let cheapenAutoBuyCountdownByHand = [];
    const DEV_CHEAPEN_AUTOBUY_DELAY = 0.1;
    let devSlowdownAutobuyOn = false;
    let slowdownAutoBuyCountdownByHand = [];
    const DEV_SLOWDOWN_AUTOBUY_DELAY = 0.1;

    /** Discount / wording for a given achieved Cheapen level (1…cap). */
    function getCheapenEffectTextForAchievedLevel(level) {
        if (level <= 0) return "";
        if (level === 1) return "99% off speed upgrade cost";
        const decimals = level - 1;
        return "99." + "9".repeat(decimals) + "% off speed upgrade cost";
    }
    /** Effect after purchasing the next tier (same as achieved level once bought). */
    function getCheapenEffectText(nextLevel) {
        return getCheapenEffectTextForAchievedLevel(nextLevel);
    }

    function updateCheapenUpgradeUI() {
        const hand1Balance = handEarnings[0] || 0;
        if (!cheapenSectionUnlocked && hand1Balance >= 1000) {
            cheapenSectionUnlocked = true;
            ensureSpeedRows();
        }
        if (!cheapenSectionUnlocked) {
            for (let i = 0; i < speedRowRefs.length; i++) {
                const ref = speedRowRefs[i];
                if (ref && ref.cheapenWrapEl) ref.cheapenWrapEl.style.display = "none";
                if (ref && ref.cheapenBtn) ref.cheapenBtn.classList.remove("upgrade-btn--afford-pulse");
            }
            updateHandUpgradeScrollHint();
            return;
        }
        for (let i = 0; i < unlockedHands; i++) {
            const ref = speedRowRefs[i];
            if (!ref || !ref.cheapenWrapEl) continue;
            ref.cheapenWrapEl.style.display = "";
            const level = cheapenLevel[i] ?? 0;
            const bonusLevel = cheapenBonusLevel[i] ?? 0;
            const effectiveLevel = getEffectiveCheapenLevel(i);
            const nextLevel = level + 1;
            const cap = getMaxCheapenLevel();
            const cost = level >= cap ? null : getCheapenUpgradeCost(i, nextLevel);
            const balance = handEarnings[i] || 0;
            const canAfford = cost !== null && balance >= cost;
            if (level >= cap) {
                if (ref.cheapenLevelEl) {
                    ref.cheapenLevelEl.innerHTML = level > 0 || bonusLevel > 0
                        ? (level + "/" + cap + (bonusLevel > 0 ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>" : ""))
                        : "";
                    ref.cheapenLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                ref.cheapenBtn.style.display = "";
                ref.cheapenBtn.disabled = true;
                setUpgradeButtonProgress(ref.cheapenBtn, 1);
                ref.cheapenBtn.classList.add("upgrade-btn-maxed");
                ref.cheapenBtn.classList.remove("upgrade-btn--afford-pulse");
                setUpgradeTooltipText(ref.cheapenBtn, "Base level: " + level + "/" + cap + "\nBonus (clap): " + bonusLevel + "\nEffective: " + effectiveLevel + "\nBalance/Cost: MAX\nEffect: " + getCheapenEffectTextForAchievedLevel(effectiveLevel));
                const cheapenLbl = ref.cheapenBtn && ref.cheapenBtn.querySelector(".upgrade-btn-label");
                if (cheapenLbl) cheapenLbl.textContent = level > 0 ? "" : "Cheapen";
            } else {
                if (ref.cheapenLevelEl) {
                    ref.cheapenLevelEl.innerHTML = level > 0 || bonusLevel > 0
                        ? (level + "/" + cap + (bonusLevel > 0 ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>" : ""))
                        : "";
                    ref.cheapenLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                const cheapenLbl = ref.cheapenBtn && ref.cheapenBtn.querySelector(".upgrade-btn-label");
                if (cheapenLbl) cheapenLbl.textContent = level > 0 ? "" : "Cheapen";
                ref.cheapenBtn.style.display = "";
                ref.cheapenBtn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.cheapenBtn, progress);
                ref.cheapenBtn.classList.remove("upgrade-btn-maxed");
                ref.cheapenBtn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(ref.cheapenBtn, "Base level: " + level + "/" + cap + "\nBonus (clap): " + bonusLevel + "\nEffective: " + effectiveLevel + "\nBalance/Cost: " + formatCount(balance) + " / " + formatCount(cost) + "\nEffect next base: " + getCheapenEffectText(nextLevel));
            }
        }
        updateHandUpgradeScrollHint();
    }

    function buyCheapenUpgradeForHand(handIndex, confettiOriginEl, opts) {
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const level = cheapenLevel[handIndex] ?? 0;
        if (level >= getMaxCheapenLevel()) return;
        const nextLevel = level + 1;
        const cost = getCheapenUpgradeCost(handIndex, nextLevel);
        const balance = handEarnings[handIndex] || 0;
        if (balance < cost) return;
        handEarnings[handIndex] = balance - cost;
        markMeaningfulProgress();
        refreshTotalFromHandEarnings();
        cheapenLevel[handIndex] = level + 1;
        const handNum = handIndex + 1;
        if (!opts?.silentLog) addToLog("Speed cheapen purchased for Hand " + handNum + " (level " + cheapenLevel[handIndex] + ")", "tip");
        incrementalEl.textContent = formatCount(totalChanges);
        const origin = confettiOriginEl || speedRowRefs[handIndex]?.cheapenBtn?.closest(".speed-upgrade-row");
        if (origin && !opts?.fromAutobuy) sprayConfettiFrom(origin);
        if (opts?.skipUpgradeDom) {
            batchedUpgradeUiFlush = true;
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        }
    }

    function maybeAutoBuyCheapen() {
        const useDev = devCheapenAutobuyOn;
        const useAsc = !useDev && ascensionAutobuyIncludesCheapen() && autoBuyUnlocked;
        if (!useDev && !useAsc) return;
        while (cheapenAutoBuyCountdownByHand.length < unlockedHands) cheapenAutoBuyCountdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay = useDev ? DEV_CHEAPEN_AUTOBUY_DELAY : getAutoBuyDelaySeconds();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!autoBuyEnabledByHand[i]) continue;
                if (!cheapenSectionUnlocked) continue;
            }
            const level = cheapenLevel[i] ?? 0;
            if (level >= getMaxCheapenLevel()) continue;
            const nextLevel = level + 1;
            const cost = getCheapenUpgradeCost(i, nextLevel);
            const canAfford = (handEarnings[i] || 0) >= cost;
            let countdown = cheapenAutoBuyCountdownByHand[i] || 0;
            if (countdown > 0) {
                cheapenAutoBuyCountdownByHand[i] = countdown - dtSec;
                if (cheapenAutoBuyCountdownByHand[i] <= 0) {
                    if (canAfford) {
                        buyCheapenUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        const stillCanAfford = (handEarnings[i] || 0) >= getCheapenUpgradeCost(i, cheapenLevel[i] + 1);
                        cheapenAutoBuyCountdownByHand[i] = stillCanAfford && cheapenLevel[i] < getMaxCheapenLevel() ? tickDelay : 0;
                    } else {
                        cheapenAutoBuyCountdownByHand[i] = 0;
                    }
                }
            } else if (canAfford) {
                cheapenAutoBuyCountdownByHand[i] = tickDelay;
            }
        }
    }

    function maybeAutoBuySlowdown() {
        if (!isSlowdownUnlocked()) return;
        const useDev = devSlowdownAutobuyOn;
        const useAsc = !useDev && ascensionAutobuyIncludesSlowdown() && autoBuyUnlocked;
        if (!useDev && !useAsc) return;
        while (slowdownAutoBuyCountdownByHand.length < unlockedHands) slowdownAutoBuyCountdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay = useDev ? DEV_SLOWDOWN_AUTOBUY_DELAY : getAutoBuyDelaySeconds();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!autoBuyEnabledByHand[i]) continue;
            }
            const level = slowdownLevel[i] ?? 0;
            const cap = getMaxSlowdownLevelCap();
            if (level >= cap) continue;
            const nextLevel = level + 1;
            const cost = getSlowdownUpgradeCost(nextLevel);
            const canAfford = cost !== null && (handEarnings[i] || 0) >= cost;
            let countdown = slowdownAutoBuyCountdownByHand[i] || 0;
            if (countdown > 0) {
                slowdownAutoBuyCountdownByHand[i] = countdown - dtSec;
                if (slowdownAutoBuyCountdownByHand[i] <= 0) {
                    if (canAfford) {
                        buySlowdownUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        const lv = slowdownLevel[i] ?? 0;
                        const nextCost = lv >= cap ? null : getSlowdownUpgradeCost(lv + 1);
                        const stillCanAfford = nextCost !== null && (handEarnings[i] || 0) >= nextCost;
                        slowdownAutoBuyCountdownByHand[i] = stillCanAfford ? tickDelay : 0;
                    } else {
                        slowdownAutoBuyCountdownByHand[i] = 0;
                    }
                }
            } else if (canAfford) {
                slowdownAutoBuyCountdownByHand[i] = tickDelay;
            }
        }
    }

    /* ---------------------------------------------------------
       SLOWDOWN UPGRADE (per-hand), unlock at 1e15, max 3 levels.
       Purchase resets Speed to 0; each level multiplies tick value by 10^level.
       Digit animation cadence follows Speed upgrades again (same interval math as no slowdown).
    --------------------------------------------------------- */
    const SLOWDOWN_UNLOCK_COUNT = 1e15;
    const MAX_SLOWDOWN_LEVEL = 3;
    /* Level 1 unchanged; each further level is 1,000× the prior (before ascension slowdown cost mult). */
    const SLOWDOWN_COSTS = [1e16, 1e19, 1e22];
    let slowdownLevel = Array(maxHands).fill(0);
    let slowdownBonusLevel = Array(maxHands).fill(0);
    let slowdownUnlockLogged = false;
    function getEffectiveSlowdownLevel(handIndex) {
        return Math.max(0, (slowdownLevel[handIndex] ?? 0) + (slowdownBonusLevel[handIndex] ?? 0));
    }

    function getSlowdownMultiplier(handIndex) {
        const lv = getEffectiveSlowdownLevel(handIndex);
        return lv <= 0 ? 1 : Math.pow(10, lv);
    }
    function getSlowdownUpgradeCost(nextLevel) {
        const cap = getMaxSlowdownLevelCap();
        if (nextLevel <= 0 || nextLevel > cap) return null;
        const idx = Math.min(SLOWDOWN_COSTS.length - 1, nextLevel - 1);
        var raw = SLOWDOWN_COSTS[idx] * Math.pow(10, Math.max(0, nextLevel - SLOWDOWN_COSTS.length));
        var m = computeAscensionGrantTotals().slowdownCostMult || 1;
        return Math.max(1, Math.floor(raw * m));
    }
    function isSlowdownUnlocked() {
        return totalChanges >= SLOWDOWN_UNLOCK_COUNT;
    }
    function getSlowdownEffectText(level) {
        if (level <= 0) return "No slowdown";
        return "+" + formatCount(getSlowdownMultiplierForLevel(level)) + "× tick value; digit speed scales with Speed upgrades";
    }
    function getSlowdownMultiplierForLevel(level) {
        if (level <= 0) return 1;
        return Math.pow(10, level);
    }
    function updateSlowdownUpgradeUI() {
        const unlocked = isSlowdownUnlocked();
        if (unlocked && !slowdownUnlockLogged) {
            slowdownUnlockLogged = true;
            addToLog("Slowdown system unlocked (all hands).", "milestone");
        }
        for (let i = 0; i < unlockedHands; i++) {
            const ref = speedRowRefs[i];
            if (!ref || !ref.slowdownWrapEl) continue;
            if (!unlocked) {
                ref.slowdownWrapEl.style.display = "none";
                if (ref.slowdownBtn) ref.slowdownBtn.classList.remove("upgrade-btn--afford-pulse");
                continue;
            }
            ref.slowdownWrapEl.style.display = "";
            const level = slowdownLevel[i] ?? 0;
            const bonusLevel = slowdownBonusLevel[i] ?? 0;
            const effectiveLevel = getEffectiveSlowdownLevel(i);
            const nextLevel = level + 1;
            const cap = getMaxSlowdownLevelCap();
            const cost = level >= cap ? null : getSlowdownUpgradeCost(nextLevel);
            const balance = handEarnings[i] || 0;
            const canAfford = cost !== null && balance >= cost;
            if (level >= cap) {
                if (ref.slowdownLevelEl) {
                    ref.slowdownLevelEl.innerHTML = level > 0 || bonusLevel > 0
                        ? (level + "/" + cap + (bonusLevel > 0 ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>" : ""))
                        : "";
                    ref.slowdownLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                ref.slowdownBtn.style.display = "";
                ref.slowdownBtn.disabled = true;
                setUpgradeButtonProgress(ref.slowdownBtn, 1);
                ref.slowdownBtn.classList.add("upgrade-btn-maxed");
                ref.slowdownBtn.classList.remove("upgrade-btn--afford-pulse");
                setUpgradeTooltipText(ref.slowdownBtn, "Base level: " + level + "/" + cap + "\nBonus (clap): " + bonusLevel + "\nEffective: " + effectiveLevel + "\nBalance/Cost: MAX\nEffect: " + getSlowdownEffectText(effectiveLevel));
                const slowLbl = ref.slowdownBtn && ref.slowdownBtn.querySelector(".upgrade-btn-label");
                if (slowLbl) slowLbl.textContent = level > 0 ? "" : "Slowdown";
            } else {
                if (ref.slowdownLevelEl) {
                    ref.slowdownLevelEl.innerHTML = level > 0 || bonusLevel > 0
                        ? (level + "/" + cap + (bonusLevel > 0 ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>" : ""))
                        : "";
                    ref.slowdownLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                const slowLbl = ref.slowdownBtn && ref.slowdownBtn.querySelector(".upgrade-btn-label");
                if (slowLbl) slowLbl.textContent = level > 0 ? "" : "Slowdown";
                ref.slowdownBtn.style.display = "";
                ref.slowdownBtn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.slowdownBtn, progress);
                ref.slowdownBtn.classList.remove("upgrade-btn-maxed");
                ref.slowdownBtn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(ref.slowdownBtn, "Base level: " + level + "/" + cap + "\nBonus (clap): " + bonusLevel + "\nEffective: " + effectiveLevel + "\nBalance/Cost: " + formatCount(balance) + " / " + formatCount(cost) + "\nEffect next base: " + getSlowdownEffectText(nextLevel));
            }
        }
        updateHandUpgradeScrollHint();
    }
    function buySlowdownUpgradeForHand(handIndex, originEl, opts) {
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        if (!isSlowdownUnlocked()) return;
        const level = slowdownLevel[handIndex] ?? 0;
        const cap = getMaxSlowdownLevelCap();
        if (level >= cap) return;
        const nextLevel = level + 1;
        const cost = getSlowdownUpgradeCost(nextLevel);
        if (cost === null) return;
        const balance = handEarnings[handIndex] || 0;
        if (balance < cost) return;
        handEarnings[handIndex] = balance - cost;
        markMeaningfulProgress();
        refreshTotalFromHandEarnings();
        slowdownLevel[handIndex] = nextLevel;
        // Slowdown is a deliberate "tempo reset" for this hand.
        // Reset speed upgrades so displayed speed/CPS state and progression align.
        speedLevel[handIndex] = 0;
        const handNum = handIndex + 1;
        if (!opts?.silentLog) addToLog("Slowdown purchased for Hand " + handNum + " (level " + nextLevel + "). Speed level reset.", "tip");
        incrementalEl.textContent = formatCount(totalChanges);
        const targetHand = hands[handIndex];
        if (targetHand) targetHand.tickAccBig = 0n;
        const origin = originEl || speedRowRefs[handIndex]?.slowdownBtn?.closest(".speed-upgrade-row");
        if (origin && !opts?.fromAutobuy) sprayConfettiFrom(origin);
        if (opts?.skipUpgradeDom) {
            batchedUpgradeUiFlush = true;
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        }
    }

    /* ---------------------------------------------------------
       TIME WARP (per-hand aura), unlock at 1e18.
       Random aura every 0–60s span (see spawn mult). Manual click grants 10× (60s or ascension-boosted seconds) of that hand's effective rate; Pinky Warp Potency can multiply manual clicks when the aura idles (overflow unchanged).
       If all hands already have aura, auto-grant 25% value to a random hand.
    --------------------------------------------------------- */
    const TIME_WARP_UNLOCK_COUNT = 1e18;
    const TIME_WARP_SECONDS_BONUS = 60;
    /** Multiplier when the player clicks an active aura (overflow random grants use a separate ratio). */
    const TIME_WARP_MANUAL_CLICK_SCALE = 10;
    const TIME_WARP_OVERFLOW_BASE_RATIO = 0.25;
    /** Idle time (manual aura only) before potency doubles the click grant. */
    const WARP_POTENCY_TIER1_SEC = 10;
    const WARP_POTENCY_TIER2_SEC = 100;
    const WARP_POTENCY_TIER3_SEC = 1000;
    let timeWarpAuraActiveByHand = [];
    /** Wall-clock ms when each hand’s aura appeared (0 if inactive); used for Warp Potency (manual only). */
    let timeWarpAuraAppearedAtMsByHand = [];
    let timeWarpNextSpawnInSec = 0;
    let timeWarpUnlockLogged = false;

    function isTimeWarpUnlocked() {
        return totalChanges >= TIME_WARP_UNLOCK_COUNT;
    }
    function handHasActiveTimeWarpAura(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands || !isTimeWarpUnlocked()) return false;
        ensureTimeWarpArrays();
        return !!timeWarpAuraActiveByHand[handIndex];
    }
    function handContributesTimeWarpPriority(handIndex) {
        return handHasActiveTimeWarpAura(handIndex) ? 1 : 0;
    }
    function handContributesToScrollHint(handIndex) {
        if (handHasActiveTimeWarpAura(handIndex)) return true;
        return handScrollHintHasUpgradeReason(handIndex);
    }
    function ensureTimeWarpArrays() {
        while (timeWarpAuraActiveByHand.length < unlockedHands) timeWarpAuraActiveByHand.push(false);
        while (timeWarpAuraAppearedAtMsByHand.length < unlockedHands) timeWarpAuraAppearedAtMsByHand.push(0);
    }
    /** Capped potency steps (10s → ×2, 100s → ×4, 1000s → ×8); overflow warps ignore this. */
    function getWarpPotencyMaxTiersEffective() {
        const raw = Math.floor(Number(computeAscensionGrantTotals().warpPotencyMaxTiers) || 0);
        return Math.max(0, Math.min(3, raw));
    }
    /** 0 = base, 1 = ×2 eligible, 2 = ×4 eligible, 3 = ×8 eligible (manual aura, by idle time). */
    function getWarpPotencyTierForHandNow(handIndex, nowMs) {
        const cap = getWarpPotencyMaxTiersEffective();
        if (cap <= 0) return 0;
        if (handIndex < 0 || handIndex >= unlockedHands || !isTimeWarpUnlocked()) return 0;
        ensureTimeWarpArrays();
        if (!timeWarpAuraActiveByHand[handIndex]) return 0;
        const t0 = timeWarpAuraAppearedAtMsByHand[handIndex];
        if (!(t0 > 0)) return 0;
        const elapsedSec = (nowMs - t0) / 1000;
        if (cap >= 3 && elapsedSec >= WARP_POTENCY_TIER3_SEC) return 3;
        if (cap >= 2 && elapsedSec >= WARP_POTENCY_TIER2_SEC) return 2;
        if (cap >= 1 && elapsedSec >= WARP_POTENCY_TIER1_SEC) return 1;
        return 0;
    }
    function getWarpPotencyMultiplierForHandNow(handIndex, nowMs) {
        return Math.pow(2, getWarpPotencyTierForHandNow(handIndex, nowMs));
    }
    function scheduleNextTimeWarpSpawn() {
        timeWarpNextSpawnInSec = Math.random() * getTimeWarpAuraSpawnSpanMaxSec();
    }
    function formatCpsForDisplay(cps) {
        if (!isFinite(cps) || cps <= 0) return "0/s";
        const rounded = cps < 1e6 ? Math.round(cps * 100) / 100 : cps;
        return formatCount(rounded) + "/s";
    }
    function clampFiniteNonNegative(value) {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }
    /**
     * Per-hand count/s from that hand before combo/turbo (matches gameLoopTick weighting).
     * Tick cadence embeds Speed (2^level); Slowdown multiplies tick value only (10^level).
     */
    function getHandPerHandRawCps(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return 0;
        const h = hands[handIndex];
        if (!h) return 0;
        const baseSpeed = (Number.isFinite(h.baseSpeed) && h.baseSpeed > 0) ? h.baseSpeed : HAND_BASE_SPEED;
        const intervalMs = getTickIntervalMs(baseSpeed, handIndex);
        if (intervalMs <= 0) return 0;
        const animPerSec = 1000 / intervalMs;
        const slow = getSlowdownMultiplier(handIndex);
        return clampFiniteNonNegative(animPerSec * slow);
    }
    /** Speed-upgrade multiplier shown as the “base” in base × combo × turbo × slowdown (always ≥ 1). */
    function getHandBaseCpsBeforeSlowdownMult(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return 0;
        return getSpeedMultiplier(handIndex);
    }
    function getHandSlowdownFactorForDisplay(handIndex) {
        return isSlowdownUnlocked() ? getSlowdownMultiplier(handIndex) : 1;
    }
    function getHandComboFactorForDisplay() {
        return unlockedHands >= 2 ? getComboMultiplier() : 1;
    }
    function getHandTurboFactorForDisplay() {
        return turboBoostUnlocked ? getTurboCountMultiplier() : 1;
    }
    function getHandEffectiveCps(handIndex) {
        return clampFiniteNonNegative(getHandPerHandRawCps(handIndex) * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult());
    }
    /** Sum of per-hand raw tick CPS (before combo × turbo). */
    function getTotalRawCpsSum() {
        let sum = 0;
        for (let i = 0; i < unlockedHands; i++) sum += getHandPerHandRawCps(i);
        return sum;
    }
    /** Instantaneous total CPS from current sim state (hands, upgrades, combo, turbo, black hole). */
    function getInstantTotalCps() {
        const raw = getTotalRawCpsSum();
        return clampFiniteNonNegative(raw * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult());
    }
    /** Throttle painting the center Count/s line during batched game-loop UI so it does not flicker every tick. */
    let cpsHeadlineLastPaintMs = 0;
    const CPS_HEADLINE_THROTTLE_MS = 1000;
    function getTimeWarpProductionSecondsBonus() {
        const s = computeAscensionGrantTotals().warpManualGrantSeconds;
        return Number.isFinite(s) && s >= 60 ? s : TIME_WARP_SECONDS_BONUS;
    }
    function getTimeWarpGrantForHand(handIndex, scale) {
        const effectiveCps = getHandEffectiveCps(handIndex);
        const secBonus = getTimeWarpProductionSecondsBonus();
        return Math.max(1, Math.round(effectiveCps * secBonus * (scale || 1)));
    }
    function applyTimeWarpGrant(handIndex, scale, reasonLabel, opts) {
        opts = opts || {};
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const gain = getTimeWarpGrantForHand(handIndex, scale);
        handEarnings[handIndex] = (handEarnings[handIndex] || 0) + gain;
        refreshTotalFromHandEarnings();
        incrementalEl.textContent = formatCount(totalChanges);
        updateObjectives();
        updateSpeedUpgradeUI();
        updateCheapenUpgradeUI();
        updateSlowdownUpgradeUI();
        updateRateDisplay();
        updateTimeWarpAuraUI();
        if (!opts.silentLog) {
            addToLog("Time Warp " + (reasonLabel || "activated") + " on Hand " + (handIndex + 1) + " for +" + formatCount(gain) + ".", "milestone");
        }
    }
    /** Pinky grants: chance to bank +1 bonus Essence for next ascend (manual click / overflow trigger). */
    function tryGrantAscensionBonusEssenceFromWarp(sourceLabel, opts) {
        opts = opts || {};
        if (!number1HasAscended) return false;
        const t = computeAscensionGrantTotals();
        const chance = sourceLabel === "overflow"
            ? (Number(t.warpOverflowAscensionEssenceChance) || 0)
            : (Number(t.warpClickAscensionEssenceChance) || 0);
        if (!(chance > 0) || Math.random() >= chance) return false;
        number1AscensionPendingBonusEssence = getNumber1AscensionPendingBonusEssence() + 1;
        updateMilestoneUI();
        refreshOverviewAndAscensionHubLiveIfOpen();
        autosaveNow();
        if (!opts.silentLog) {
            addToLog("Warp essence bonus: banked +1 Ascension Essence for your next ascend (" + sourceLabel + " trigger).", "milestone");
        }
        return true;
    }
    /** Warp Factor 36: one overflow tick at reduced ratio, applied to every hand (single UI refresh + optional log). */
    function applyTimeWarpOverflowToAllHands(ratio, opts) {
        opts = opts || {};
        if (unlockedHands <= 0) return;
        const pct = (ratio * 100).toFixed(0);
        const bits = [];
        for (let i = 0; i < unlockedHands; i++) {
            const gain = getTimeWarpGrantForHand(i, ratio);
            handEarnings[i] = (handEarnings[i] || 0) + gain;
            bits.push("H" + (i + 1) + " +" + formatCount(gain));
        }
        refreshTotalFromHandEarnings();
        if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
        updateObjectives();
        updateSpeedUpgradeUI();
        updateCheapenUpgradeUI();
        updateSlowdownUpgradeUI();
        updateRateDisplay();
        updateTimeWarpAuraUI();
        if (!opts.silentLog) {
            addToLog("Time Warp overflow (all hands, " + pct + "% of each hand's rate — Warp Factor 36): " + bits.join(" · ") + ".", "milestone");
        }
    }
    /** Pinky ascension: after a manual aura click grant, spend that hand’s balance on every affordable Speed/Cheapen/Slowdown upgrade (cheapens first for better prices). */
    function applyTimeWarpManualAutoBuyAssistForHand(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        if (!computeAscensionGrantTotals().warpAutoBuyAssist) return;
        const buyOpts = { fromAutobuy: true, silentLog: true, skipUpgradeDom: true };
        const sl0 = speedLevel[handIndex] ?? 0;
        const ch0 = cheapenLevel[handIndex] ?? 0;
        const sd0 = slowdownLevel[handIndex] ?? 0;
        let guard = 0;
        while (guard++ < 400) {
            let progressed = false;
            let inner = 0;
            while (inner++ < 500) {
                const ch = cheapenLevel[handIndex] ?? 0;
                if (ch >= getMaxCheapenLevel()) break;
                const nextCh = ch + 1;
                const cCost = getCheapenUpgradeCost(handIndex, nextCh);
                if ((handEarnings[handIndex] || 0) < cCost) break;
                buyCheapenUpgradeForHand(handIndex, null, buyOpts);
                progressed = true;
            }
            inner = 0;
            while (inner++ < 5000) {
                const nextSp = speedLevel[handIndex] + 1;
                const sCost = getUpgradeCost(handIndex, nextSp);
                if ((handEarnings[handIndex] || 0) < sCost) break;
                buySpeedUpgradeForHand(handIndex, buyOpts);
                progressed = true;
            }
            if (isSlowdownUnlocked()) {
                const sd = slowdownLevel[handIndex] ?? 0;
                if (sd < getMaxSlowdownLevelCap()) {
                    const nextSd = sd + 1;
                    const dCost = getSlowdownUpgradeCost(nextSd);
                    if (dCost != null && (handEarnings[handIndex] || 0) >= dCost) {
                        buySlowdownUpgradeForHand(handIndex, null, buyOpts);
                        progressed = true;
                    }
                }
            }
            if (!progressed) break;
        }
        const any = (speedLevel[handIndex] ?? 0) !== sl0 || (cheapenLevel[handIndex] ?? 0) !== ch0 || (slowdownLevel[handIndex] ?? 0) !== sd0;
        if (any) {
            batchedUpgradeUiFlush = false;
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
            updateTimeWarpAuraUI();
            addToLog("Warp auto buy assist: bought upgrades for Hand " + (handIndex + 1) + " after your manual Time Warp.", "tip");
        }
    }
    function updateTimeWarpAuraUI() {
        const unlocked = isTimeWarpUnlocked();
        ensureTimeWarpArrays();
        const twSec = getTimeWarpProductionSecondsBonus();
        const nowMs = Date.now();
        const potencyUnlocked = getWarpPotencyMaxTiersEffective() > 0;
        for (let i = 0; i < unlockedHands; i++) {
            const ref = speedRowRefs[i];
            if (!ref || !ref.timeWarpAuraBtn) continue;
            const active = unlocked && !!timeWarpAuraActiveByHand[i];
            ref.timeWarpAuraBtn.style.display = active ? "" : "none";
            const hi = i + 1;
            const btn = ref.timeWarpAuraBtn;
            btn.classList.remove("time-warp-aura-btn--potency-1", "time-warp-aura-btn--potency-2", "time-warp-aura-btn--potency-3");
            let titleExtra = "";
            let ariaExtra = "";
            if (active && potencyUnlocked) {
                const tier = getWarpPotencyTierForHandNow(i, nowMs);
                const cap = getWarpPotencyMaxTiersEffective();
                if (tier >= 3) {
                    btn.classList.add("time-warp-aura-btn--potency-3");
                    titleExtra = " — ×8 potency (idle " + WARP_POTENCY_TIER3_SEC + "s+)";
                    ariaExtra = ", ×8 potency charged";
                } else if (tier >= 2) {
                    btn.classList.add("time-warp-aura-btn--potency-2");
                    titleExtra = " — ×4 potency (idle " + WARP_POTENCY_TIER2_SEC + "s+)";
                    ariaExtra = ", ×4 potency charged";
                } else if (tier >= 1) {
                    btn.classList.add("time-warp-aura-btn--potency-1");
                    titleExtra = " — ×2 potency (idle " + WARP_POTENCY_TIER1_SEC + "s+)";
                    ariaExtra = ", ×2 potency charged";
                } else if (cap >= 3) {
                    titleExtra = " — charging: ×2 after " + WARP_POTENCY_TIER1_SEC + "s idle, ×4 after " + WARP_POTENCY_TIER2_SEC + "s, ×8 after " + WARP_POTENCY_TIER3_SEC + "s";
                    ariaExtra = "; charges ×2 / ×4 / ×8 when left unclicked";
                } else if (cap >= 2) {
                    titleExtra = " — charging: ×2 after " + WARP_POTENCY_TIER1_SEC + "s idle, ×4 after " + WARP_POTENCY_TIER2_SEC + "s";
                    ariaExtra = "; charges ×2 / ×4 when left unclicked";
                } else {
                    titleExtra = " — charging: ×2 after " + WARP_POTENCY_TIER1_SEC + "s idle";
                    ariaExtra = "; charges ×2 when left unclicked";
                }
            }
            btn.setAttribute("aria-label", "Activate Time Warp on hand " + hi + ": " + TIME_WARP_MANUAL_CLICK_SCALE + "× " + twSec + " seconds of production" + ariaExtra);
            btn.title = "Grants " + TIME_WARP_MANUAL_CLICK_SCALE + "× " + twSec + "s of this hand's effective rate" + titleExtra;
        }
        scheduleHandUpgradeScrollHintUpdate();
    }
    const TIME_WARP_SCREEN_FX_MS = 960;
    function playTimeWarpScreenEffect(anchorEl) {
        if (!anchorEl || !(anchorEl instanceof Element)) return;
        const r = anchorEl.getBoundingClientRect();
        if (r.width <= 0 && r.height <= 0) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const wrap = document.createElement("div");
        wrap.className = "time-warp-screen-fx";
        wrap.setAttribute("aria-hidden", "true");
        wrap.style.setProperty("--tw-x", cx + "px");
        wrap.style.setProperty("--tw-y", cy + "px");
        wrap.innerHTML =
            "<div class=\"time-warp-screen-fx-vignette\"></div>" +
            "<div class=\"time-warp-screen-fx-twist\"></div>" +
            "<div class=\"time-warp-screen-fx-spiral\"></div>";
        document.body.appendChild(wrap);
        window.setTimeout(() => {
            if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        }, TIME_WARP_SCREEN_FX_MS);
    }

    function activateTimeWarpAuraForHand(handIndex) {
        ensureTimeWarpArrays();
        if (!isTimeWarpUnlocked()) return;
        if (!timeWarpAuraActiveByHand[handIndex]) return;
        const nowMs = Date.now();
        const potencyMult = getWarpPotencyMultiplierForHandNow(handIndex, nowMs);
        timeWarpAuraActiveByHand[handIndex] = false;
        timeWarpAuraAppearedAtMsByHand[handIndex] = 0;
        markMeaningfulProgress();
        let reason = "aura (" + TIME_WARP_MANUAL_CLICK_SCALE + "× manual)";
        if (potencyMult > 1) reason += ", ×" + potencyMult + " potency";
        applyTimeWarpGrant(handIndex, TIME_WARP_MANUAL_CLICK_SCALE * potencyMult, reason);
        tryGrantAscensionBonusEssenceFromWarp("manual");
        applyTimeWarpManualAutoBuyAssistForHand(handIndex);
    }
    function updateTimeWarpSystem(dtSec) {
        if (!isTimeWarpUnlocked()) return;
        ensureTimeWarpArrays();
        if (!timeWarpUnlockLogged) {
            timeWarpUnlockLogged = true;
            addToLog("Time Warp system unlocked (auras can now appear).", "milestone");
        }
        if (timeWarpNextSpawnInSec <= 0) scheduleNextTimeWarpSpawn();
        timeWarpNextSpawnInSec -= dtSec;
        if (timeWarpNextSpawnInSec > 0) {
            updateTimeWarpAuraUI();
            return;
        }
        const available = [];
        for (let i = 0; i < unlockedHands; i++) {
            if (!timeWarpAuraActiveByHand[i]) available.push(i);
        }
        if (available.length > 0) {
            const idx = available[Math.floor(Math.random() * available.length)];
            timeWarpAuraActiveByHand[idx] = true;
            timeWarpAuraAppearedAtMsByHand[idx] = Date.now();
            addToLog("A Time Warp aura appeared on Hand " + (idx + 1) + ".", "milestone");
        } else if (unlockedHands > 0) {
            const twTotals = computeAscensionGrantTotals();
            const ratio = getTimeWarpOverflowRatioFromTotals(twTotals);
            if (twTotals.warpFactor36AllHandsOverflow) applyTimeWarpOverflowToAllHands(ratio, { silentLog: true });
            else {
                const idx = Math.floor(Math.random() * unlockedHands);
                applyTimeWarpGrant(idx, ratio, "overflow", { silentLog: true });
            }
            tryGrantAscensionBonusEssenceFromWarp("overflow", { silentLog: true });
        }
        scheduleNextTimeWarpSpawn();
        updateTimeWarpAuraUI();
    }
    /** Middle-branch: each combo that newly appears this tick trims the Time Warp aura countdown (per trigger). */
    function getAscensionComboTimeWarpDelayReductionPerTriggerSec() {
        const t = computeAscensionGrantTotals();
        const base = Number(t.comboTimeWarpDelayReduceSec) || 0;
        const mult = Number(t.comboTimeWarpDelayReduceMult) || 1;
        if (base <= 0 || mult <= 0) return 0;
        return base * mult;
    }
    function applyAscensionComboTimeWarpDelayReduction(newComboTriggerCount) {
        if (newComboTriggerCount <= 0 || !isTimeWarpUnlocked()) return;
        const per = getAscensionComboTimeWarpDelayReductionPerTriggerSec();
        if (per <= 0) return;
        const total = per * newComboTriggerCount;
        if (!(timeWarpNextSpawnInSec > 0)) return;
        const minLeft = 1e-4;
        timeWarpNextSpawnInSec = Math.max(minLeft, timeWarpNextSpawnInSec - total);
    }

    /* ---------------------------------------------------------
       RATE DISPLAY and TICK INTERVAL (per-hand; total CPS = sum of hand CPS)
    --------------------------------------------------------- */
    function getTickIntervalMs(baseSpeed, handIndex) {
        const mult = getSpeedMultiplier(handIndex);
        if (!Number.isFinite(mult) || mult <= 0) return 0;
        return baseSpeed / mult;
    }
    /** Count/s row: shows Numerical mass (Phase 1) vs Black hole (Phases 2–6) only after post-map arc unlock. Hidden in Phase 7 (stillness). */
    function updateN1GravityCpsStrip() {
        if (!n1GravityCpsStripEl) return;
        const p = getBlackHolePhase();
        if (!isBlackHoleArcUnlocked() || p < 1 || p === 7) {
            n1GravityCpsStripEl.hidden = true;
            n1GravityCpsStripEl.textContent = "";
            n1GravityCpsStripEl.className = "n1-gravity-cps-strip";
            return;
        }
        n1GravityCpsStripEl.hidden = false;
        if (p === 1) {
            const spent = Math.floor(number1BlackHoleState.phase1EssenceSpent || 0);
            const m = getBlackHolePhase1RunCpsMult();
            const ms = m.toFixed(2);
            n1GravityCpsStripEl.className = "n1-gravity-cps-strip n1-gravity-cps-strip--mass";
            n1GravityCpsStripEl.innerHTML =
                "<div class=\"n1-gravity-cps-strip__inner\" role=\"status\">" +
                "<span class=\"n1-gravity-cps-strip__glyph\" aria-hidden=\"true\">⊕</span>" +
                "<div class=\"n1-gravity-cps-strip__text\">" +
                "<span class=\"n1-gravity-cps-strip__line\"><span class=\"n1-gravity-cps-strip__name\">Numerical mass</span>" +
                "<span class=\"n1-gravity-cps-strip__mult\">CPS ×" + ms + "</span></span>" +
                "<span class=\"n1-gravity-cps-strip__sub\">Mass charge " + spent + " / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + "</span>" +
                "</div></div>";
            return;
        }
        if (p >= 2) {
            const t = getBlackHoleTotalMult();
            const ts = t >= 10 ? t.toFixed(2) : t.toFixed(3);
            let sub = "All phase effects apply here";
            if (p >= 5) {
                const f = getBlackHoleFurnaceMult();
                const echoes = Math.max(0, Math.floor(Number(number1BlackHoleState.phase5FurnaceLevel) || 0));
                sub = "Furnace ×" + (f >= 10 ? f.toFixed(2) : f.toFixed(3)) + " · Echo Hands " + echoes;
            }
            n1GravityCpsStripEl.className = "n1-gravity-cps-strip n1-gravity-cps-strip--void";
            n1GravityCpsStripEl.innerHTML =
                "<div class=\"n1-gravity-cps-strip__inner\" role=\"status\">" +
                "<span class=\"n1-gravity-cps-strip__glyph n1-gravity-cps-strip__glyph--void\" aria-hidden=\"true\">" +
                "<span class=\"n1-bh-visual\"><span class=\"n1-bh-visual__ring\"></span><span class=\"n1-bh-visual__core\"></span></span></span>" +
                "<div class=\"n1-gravity-cps-strip__text\">" +
                "<span class=\"n1-gravity-cps-strip__line\"><span class=\"n1-gravity-cps-strip__name\">Black hole</span>" +
                "<span class=\"n1-gravity-cps-strip__mult\">Counting ×" + ts + "</span></span>" +
                "<span class=\"n1-gravity-cps-strip__sub\">" + sub + "</span>" +
                "</div></div>";
        }
    }
    // Updates the "Count per second" UI:
    // - Total line is rule-based (hands × upgrades × combo × turbo × black hole) via getInstantTotalCps — not wall-clock measured.
    // - "base × bonus × turbo" breakdown uses the same factors; base is tick-rate sum adjusted only for how total bonus is displayed.
    // - Per-hand Hn lines are raw tick-rate CPS only (do not sum them and expect Total).
    // - Bonus/Turbo lines are hidden until those features are unlocked.
    // - opts.throttleCpsHeadline: when true (batched game-loop UI), repaint the center rate text at most once per second.
    function updateRateDisplay(opts) {
        opts = opts || {};
        const throttleCpsHeadline = opts.throttleCpsHeadline === true;
        const cpsPerHand = [];
        let cpsTotalRaw = 0;
        for (let i = 0; i < unlockedHands; i++) {
            const safeCps = getHandPerHandRawCps(i);
            cpsPerHand.push(safeCps);
            cpsTotalRaw += safeCps;
        }
        const comboMult = getComboMultiplier();
        const turboMult = getTurboCountMultiplier ? getTurboCountMultiplier() : 1;
        const turboDisplayMult = getTurboCountMultiplierFromMeter ? getTurboCountMultiplierFromMeter() : 1;
        const bhMult = getNumber1BlackHoleProductionMult();
        const blackHoleSectionActive = isBlackHoleArcUnlocked() && getBlackHolePhase() >= 1;
        const cpsTotal = getInstantTotalCps();
        const bonusUnlocked = unlockedHands >= 2;
        const turboUnlocked = turboBoostUnlocked;
        if (bonusMultiplierEl) {
            const bonusDisplayMult = getDisplayedTotalComboBonus();
            bonusMultiplierEl.textContent = "Total bonus: " + bonusDisplayMult.toFixed(2) + "×";
            bonusMultiplierEl.style.display = bonusUnlocked ? "" : "none";
            bonusMultiplierEl.title = "Full bonus from every pattern you have earned, all combo upgrades, and a full rhythm bar. Count/s total follows your current hands and upgrades (same factors as the breakdown).";
        }
        if (turboMultiplierDisplayEl) {
            turboMultiplierDisplayEl.textContent = "Turbo: " + turboDisplayMult.toFixed(2) + "×";
            turboMultiplierDisplayEl.style.display = turboUnlocked ? "" : "none";
        }
        if (incrementalRateEl) {
            incrementalRateEl.classList.toggle("rate-turbo-active", turboBoostEnabled && turboMult > 1);
            incrementalRateEl.classList.toggle("incremental-rate-value--pre-bh-wrap", !blackHoleSectionActive && unlockedHands >= 2);
            incrementalRateEl.title = "Total count per second from your current hands, speed/slowdown levels, combo bonus, turbo, and black hole — same basis as hand tooltips. During play the center line repaints at most once per second so it stays easy to read; it also updates right away after purchases, turbo, and similar changes.";
        }
        const nowPaint = Date.now();
        const mayPaintHeadline = !throttleCpsHeadline || (nowPaint - cpsHeadlineLastPaintMs >= CPS_HEADLINE_THROTTLE_MS);
        if (incrementalRateEl && mayPaintHeadline) {
            cpsHeadlineLastPaintMs = nowPaint;
            if (getBlackHolePhase() === 7) {
                incrementalRateEl.textContent = "1 / second";
                incrementalRateEl.title = "Evaporation epilogue: the power game is over, and the counter advances exactly once per second.";
            } else
            if (unlockedHands >= 2) {
                const totalFormatted = formatCount(cpsTotal < 1e6 ? Math.round(cpsTotal * 100) / 100 : cpsTotal);
                const bonusDisplayMult = getDisplayedTotalComboBonus();
                const appliedComboMult = comboMult;
                let cpsRateDisplayBase = cpsTotalRaw;
                if (bonusUnlocked && Number.isFinite(bonusDisplayMult) && bonusDisplayMult > 0) {
                    cpsRateDisplayBase = (cpsTotalRaw * appliedComboMult) / bonusDisplayMult;
                }
                const baseFormatted = formatCount(cpsRateDisplayBase < 1e6 ? Math.round(cpsRateDisplayBase * 100) / 100 : cpsRateDisplayBase);
                const calcParts = ["base " + baseFormatted];
                if (bonusUnlocked) calcParts.push("bonus×" + formatCompactMultiplier(bonusDisplayMult));
                if (turboUnlocked) calcParts.push("turbo×" + formatCompactMultiplier(turboMult));
                if (bhMult > 1.0005) {
                    const bhs = formatCompactMultiplier(bhMult);
                    let bhPart = "bh×" + bhs;
                    if (isBlackHoleArcUnlocked()) {
                        const ph = getBlackHolePhase();
                        if (ph === 1) bhPart = "mass×" + bhs;
                        else if (ph >= 2 && ph <= 6) bhPart = "black\u00a0hole×" + bhs;
                        else if (ph === 7) bhPart = "epilogue×" + bhs;
                    }
                    calcParts.push(bhPart);
                }
                const totalStr = "Total " + totalFormatted + "/s · " + calcParts.join(" · ");
                if (blackHoleSectionActive) {
                    incrementalRateEl.innerHTML = "<strong>" + totalStr + "</strong> · all hands";
                } else {
                    const handParts = cpsPerHand.slice(0, unlockedHands).map((cps, i) => {
                        const rawCps = cps;
                        return "H" + (i + 1) + ": " + formatCount(rawCps < 1e6 ? Math.round(rawCps * 100) / 100 : rawCps) + "/s";
                    });
                    incrementalRateEl.innerHTML = "<strong>" + totalStr + "</strong> · " + handParts.join(" · ");
                }
            } else {
                incrementalRateEl.textContent = formatCount(cpsTotal < 1e6 ? Math.round(cpsTotal * 100) / 100 : cpsTotal);
            }
        }
        updateN1GravityCpsStrip();
        updateHandStatusBlocks();
        refreshCombinationsHandStatusIfOpen();
        scheduleFitTopCountRow();
    }

    const TOP_COUNT_ROW_FIT_MIN_SCALE = 0.06;
    const TOP_COUNT_ROW_FIT_ITERATIONS = 22;
    /** Coalesce layout passes after row height is fixed to side-column anchor. */
    const TOP_COUNT_ROW_FIT_LAYOUT_PASSES = 3;
    /** Minimum inner content height (px) for the bar when sides are tiny or hidden. */
    const TOP_COUNT_ROW_MIN_CONTENT_H = 40;
    let topCountRowFitRaf = 0;
    let topCountRowFitObserversStarted = false;

    function scheduleFitTopCountRow() {
        if (topCountRowFitRaf) return;
        topCountRowFitRaf = requestAnimationFrame(function() {
            topCountRowFitRaf = 0;
            fitTopCountRowSegments();
        });
    }

    function binarySearchScaleToFit(segment, inner, cssVarName, minScale, maxScale) {
        if (!segment || !inner) return;
        const maxW = segment.clientWidth;
        const maxH = segment.clientHeight;
        if (maxW < 4 || maxH < 4) return;
        let lo = minScale;
        let hi = maxScale;
        for (let i = 0; i < TOP_COUNT_ROW_FIT_ITERATIONS; i++) {
            const mid = (lo + hi) / 2;
            segment.style.setProperty(cssVarName, String(mid));
            const w = inner.scrollWidth;
            const h = inner.scrollHeight;
            if (w <= maxW && h <= maxH) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        segment.style.setProperty(cssVarName, String(lo));
    }

    function binarySearchScaleToFitWidthOnly(segment, inner, cssVarName, minScale, maxScale) {
        if (!segment || !inner) return;
        const maxW = segment.clientWidth;
        if (maxW < 4) return;
        let lo = minScale;
        let hi = maxScale;
        for (let i = 0; i < TOP_COUNT_ROW_FIT_ITERATIONS; i++) {
            const mid = (lo + hi) / 2;
            segment.style.setProperty(cssVarName, String(mid));
            if (inner.scrollWidth <= maxW) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        segment.style.setProperty(cssVarName, String(lo));
    }

    function fitTopCountRowSegments() {
        const row = document.querySelector(".top-count-row");
        if (!row || row.offsetParent === null) return;
        if (row.style.display === "none") return;
        const leftSeg = row.querySelector(".top-count-row__segment--left");
        const centerSeg = row.querySelector(".top-count-row__segment--center");
        const leftInner = leftSeg && leftSeg.querySelector(".top-count-row__left-fit-wrap");
        const centerInner = centerSeg && centerSeg.querySelector(".top-count-row__center-fit-wrap");
        if (!leftSeg || !centerSeg || !leftInner || !centerInner) return;

        centerSeg.style.setProperty("min-height", "0");
        centerSeg.style.setProperty("max-height", "0");
        centerSeg.style.setProperty("overflow", "hidden");
        row.style.height = "";
        row.style.minHeight = "";

        binarySearchScaleToFitWidthOnly(leftSeg, leftInner, "--left-stack-scale", TOP_COUNT_ROW_FIT_MIN_SCALE, 1);

        const hLeft = Math.ceil(leftInner.getBoundingClientRect().height);
        let hRight = 0;
        const turboFitEl = turboRightClusterEl || turboBoostWrapEl;
        if (turboFitEl) {
            const tws = window.getComputedStyle(turboFitEl);
            if (tws.display !== "none" && tws.visibility !== "hidden") {
                hRight = Math.ceil(turboFitEl.getBoundingClientRect().height);
            }
        }
        const anchorH = Math.max(hLeft, hRight, TOP_COUNT_ROW_MIN_CONTENT_H);

        const cs = window.getComputedStyle(row);
        const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        const borderY = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
        row.style.boxSizing = "border-box";
        row.style.height = anchorH + padY + borderY + "px";

        centerSeg.style.removeProperty("max-height");
        centerSeg.style.removeProperty("min-height");
        centerSeg.style.removeProperty("overflow");

        for (let p = 0; p < TOP_COUNT_ROW_FIT_LAYOUT_PASSES; p++) {
            binarySearchScaleToFit(leftSeg, leftInner, "--left-stack-scale", TOP_COUNT_ROW_FIT_MIN_SCALE, 1);
            binarySearchScaleToFit(centerSeg, centerInner, "--center-text-scale", TOP_COUNT_ROW_FIT_MIN_SCALE, 1);
        }
    }

    function initTopCountRowFitObservers() {
        if (topCountRowFitObserversStarted) return;
        topCountRowFitObserversStarted = true;
        const row = document.querySelector(".top-count-row");
        if (!row || typeof ResizeObserver === "undefined") {
            scheduleFitTopCountRow();
            return;
        }
        const ro = new ResizeObserver(function() {
            scheduleFitTopCountRow();
        });
        ro.observe(row);
        if (incrementalEl) {
            const mo = new MutationObserver(function() {
                scheduleFitTopCountRow();
            });
            mo.observe(incrementalEl, { characterData: true, subtree: true, childList: true });
        }
        if (incrementalRateEl) {
            const moR = new MutationObserver(function() {
                scheduleFitTopCountRow();
            });
            moR.observe(incrementalRateEl, { characterData: true, subtree: true, childList: true });
        }
        scheduleFitTopCountRow();
    }

    function updateHandStatusBlocks() {
        for (let i = 0; i < unlockedHands; i++) {
            const ref = speedRowRefs[i];
            if (!ref || !ref.statusCountEl) continue;
            const baseCps = getHandBaseCpsBeforeSlowdownMult(i);
            const slowF = getHandSlowdownFactorForDisplay(i);
            const comboF = getHandComboFactorForDisplay();
            const turboF = getHandTurboFactorForDisplay();
            const rawHand = getHandPerHandRawCps(i);
            const eff = getHandEffectiveCps(i);
            const bal = handEarnings[i] || 0;
            ref.statusCountEl.textContent = formatCount(bal);
            ref.statusBaseEl.textContent = formatCpsForDisplay(baseCps);
            ref.statusEffectiveEl.textContent = formatCpsForDisplay(eff);
            const baseStr = formatCpsForDisplay(baseCps);
            ref.statusFormulaEl.textContent = "base × combo × turbo × slowdown: " + baseStr + " × " +
                comboF.toFixed(2) + " × " + turboF.toFixed(2) + " × " + slowF.toFixed(2) + " = " + formatCpsForDisplay(eff);
            ref.statusCompactEl.textContent = "Hand " + (i + 1) + ": " + formatCount(bal) + " · " + formatCpsForDisplay(rawHand) + " → " + formatCpsForDisplay(eff);
        }
    }
    function buildComboHandStatusCardsHtml() {
        if (unlockedHands < 1) return "<li class=\"combo-hand-status-empty\">No hands.</li>";
        const cards = [];
        for (let i = 0; i < unlockedHands; i++) {
            const baseCps = getHandBaseCpsBeforeSlowdownMult(i);
            const slowF = getHandSlowdownFactorForDisplay(i);
            const comboF = getHandComboFactorForDisplay();
            const turboF = getHandTurboFactorForDisplay();
            const rawHand = getHandPerHandRawCps(i);
            const eff = getHandEffectiveCps(i);
            const bal = handEarnings[i] || 0;
            const n = i + 1;
            const formula = "base × combo × turbo × slowdown: " + formatCpsForDisplay(baseCps) + " × " +
                comboF.toFixed(2) + " × " + turboF.toFixed(2) + " × " + slowF.toFixed(2) + " = " + formatCpsForDisplay(eff);
            cards.push(
                "<li class=\"combo-hand-status-card\" data-hand-index=\"" + i + "\">" +
                "<div class=\"combo-hand-status-card-title\">Hand " + n + "</div>" +
                "<div class=\"combo-hand-status-line\"><span class=\"hand-status-k\">Count</span> <span class=\"hand-status-v\">" + formatCount(bal) + "</span></div>" +
                "<div class=\"combo-hand-status-line\"><span class=\"hand-status-k\">Base CPS</span> <span class=\"hand-status-v\">" + formatCpsForDisplay(baseCps) + "</span></div>" +
                "<div class=\"combo-hand-status-line\"><span class=\"hand-status-k\">Effective CPS</span> <span class=\"hand-status-v\">" + formatCpsForDisplay(eff) + "</span></div>" +
                "<div class=\"combo-hand-status-formula\">" + formula + "</div>" +
                "<div class=\"combo-hand-status-compact\">Hand " + n + ": " + formatCount(bal) + " · " + formatCpsForDisplay(rawHand) + " → " + formatCpsForDisplay(eff) + "</div>" +
                "</li>"
            );
        }
        return cards.join("");
    }
    function renderComboPagePerHandStatusSectionHtml() {
        return "<div class=\"combo-per-hand-status\" role=\"region\" aria-label=\"Per-hand production\">" +
            "<p class=\"combo-per-hand-status-title\">Per-hand production</p>" +
            "<p class=\"combo-per-hand-status-note\">These values use the same throttled refresh as the main hand rows (typically a few times per second) so the tab stays responsive.</p>" +
            "<ul id=\"combo-per-hand-status-list\" class=\"combo-hand-status-grid\">" + buildComboHandStatusCardsHtml() + "</ul></div>";
    }
    function refreshCombinationsHandStatusIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelTitleEl) return;
        if (pagePanelTitleEl.textContent !== "Combinations") return;
        const listEl = document.getElementById("combo-per-hand-status-list");
        if (!listEl) return;
        listEl.innerHTML = buildComboHandStatusCardsHtml();
    }
    function getRawCpsPerHand() {
        const out = [];
        for (let i = 0; i < unlockedHands; i++) out.push(getHandPerHandRawCps(i));
        return out;
    }

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
    const TURBO_UNLOCK_COUNT = 1e12;
    const TURBO_BOOST_METER_BASE_MAX = 100;
    // Combo size → boost points: 2 hands = 1, 6 hands = 16, 10 hands = 256 (2^(minHands-2))
    const TURBO_COMBO_POINTS_BASE = 2;
    const TURBO_COMBO_POINTS_EXP_OFFSET = 2;   // points = TURBO_COMBO_POINTS_BASE^(minHands - TURBO_COMBO_POINTS_EXP_OFFSET)
    const TURBO_COUNT_MULTIPLIER_BASE_MAX = 100;    // ceiling from Ring scaling before Turbo-scension Mult (×2 per Mult level)
    const TURBO_MULTIPLIER_CURVE_EXPONENT = 2; // applied to burn intensity ratio (shape of burn → boost)
    const TURBO_BURN_RATE_PER_SEC = 3;         // base meter drain per second (doubled per Turbo-scension Burn level)
    /** Maps nominal burn to [0,1); higher Burn upgrades → stronger boost (asymptotic). */
    const TURBO_BURN_INTENSITY_K = 8;
    /** Extra boost when the tank is large and full: peak mult scales by 1 + WEIGHT * (min(ratio, MAX) - 1). */
    const TURBO_TANK_PEAK_MAX_RATIO = 16;
    const TURBO_TANK_PEAK_WEIGHT = 0.06;
    /** Near-empty drain: rate multiplier from u = meter/max; u→0 approaches FLOOR; u=1 is full speed. */
    const TURBO_DRAIN_FLOOR = 0.07;
    const TURBO_DRAIN_PIECE_EXP = 0.55;
    const TURBO_SCENSION_ACTIVATION_BASE_COST = 10000;
    /** Point cost for first Turbo Leveler purchase; each completed purchase doubles this baseline for the next. */
    const TURBO_LEVELER_BASE_POINT_COST = 48;
    function getTurboScensionActivationCost() {
        const m = computeAscensionGrantTotals().turboScensionActivationCostMult || 1;
        return Math.max(1, Math.floor(TURBO_SCENSION_ACTIVATION_BASE_COST * m));
    }
    /** Independent random Burn/Tank/Mult/Fill rolls per Upgrade click (1 base + ascension extras). */
    function getTurboScensionUpgradeRollCount() {
        return 1 + (computeAscensionGrantTotals().turboScensionExtraUpgradeRolls || 0);
    }

    let turboBoostMeter = 0;
    let turboBoostUnlocked = false;
    let turboBoostEnabled = false;
    let turboActivationCount = 0;
    /** Turbo Leveler (Ring): overflow combo fill while Turbo off + full meter → bank; spend for random scension levels. */
    let turboLevelerBank = 0;
    let turboLevelerPurchases = 0;

    // Converts combo size (minHands) into meter points.
    // Current mapping uses an exponential curve: points = base^(minHands-offset)
    function getTurboScensionFillMult() {
        return Math.pow(2, Math.max(0, turboScensionFillLevel));
    }
    function getTurboComboPoints(minHands) {
        if (minHands < 2) return 0;
        let pts = Math.pow(TURBO_COMBO_POINTS_BASE, minHands - TURBO_COMBO_POINTS_EXP_OFFSET);
        const totals = computeAscensionGrantTotals();
        const mult = totals.comboTurboPointsMult || 1;
        const flat = totals.turboBoostComboFillAdd || 0;
        const meterExtra = totals.turboMeterFromComboMult || 1;
        return (pts * mult + flat) * meterExtra * getTurboScensionFillMult();
    }

    function getTurboNominalBurnPerSec() {
        const ascBurn = computeAscensionGrantTotals().turboBurnRateMult || 1;
        return TURBO_BURN_RATE_PER_SEC * Math.pow(2, Math.max(0, turboScensionBurnLevel)) * ascBurn;
    }
    /** 0..~1 from current Burn tier (not reduced by Burn Efficiency — that only affects drain). */
    function getTurboBurnIntensityRatio() {
        const nominal = getTurboNominalBurnPerSec();
        return nominal / (nominal + TURBO_BURN_INTENSITY_K);
    }
    function getTurboTankPeakMult(meterMax, curveScale) {
        const tr = Math.min(TURBO_TANK_PEAK_MAX_RATIO, meterMax / Math.max(1e-9, curveScale));
        return 1 + TURBO_TANK_PEAK_WEIGHT * (tr - 1);
    }
    /** Burn-driven boost, scaled by tank fullness and (when full) larger tanks hit harder. */
    function getTurboBoostMultiplierFromState() {
        const curveScale = getTurboMeterCurveScale();
        const meterMax = getTurboMeterMax();
        const fullness = Math.min(1, turboBoostMeter / Math.max(1e-9, meterMax));
        const burnCurve = Math.pow(getTurboBurnIntensityRatio(), TURBO_MULTIPLIER_CURVE_EXPONENT);
        const tankPeakMult = getTurboTankPeakMult(meterMax, curveScale);
        const multCap = getTurboCountMultiplierMax();
        return 1 + burnCurve * (multCap - 1) * fullness * tankPeakMult;
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
        popup.textContent = "+" + points;
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
        return TURBO_LEVELER_BASE_POINT_COST * Math.pow(2, turboLevelerPurchases);
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
            addToLog("Turbo Leveler: +1 " + labels[axis] + " (now level " + now + ").", "tip");
            turboBoostMeter = Math.min(turboBoostMeter, getTurboMeterMax());
            any = true;
            nextCost = getTurboLevelerNextPointCost();
        }
        if (any) {
            markMeaningfulProgress();
            updateTurboBoostUI();
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
        updateTurboBoostUI();
    }

    // Burns meter while turbo is actively applying a multiplier (toggle On).
    // Also auto-switches the toggle Off when the meter hits 0.
    function updateTurboBurn(dtSec) {
        if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return;
        const meterMax = getTurboMeterMax();
        const u = Math.max(0, Math.min(1, turboBoostMeter / Math.max(1e-9, meterMax)));
        const piecewise = TURBO_DRAIN_FLOOR + (1 - TURBO_DRAIN_FLOOR) * Math.pow(u, TURBO_DRAIN_PIECE_EXP);
        const reduce = computeAscensionGrantTotals().turboBurnEfficiencyReduceSum || 0;
        const effMult = Math.max(0, 1 - reduce);
        const drainM = computeAscensionGrantTotals().turboMeterDrainMult || 1;
        const burnRate = getTurboNominalBurnPerSec() * effMult * piecewise * drainM;
        const drain = dtSec * burnRate;
        turboBoostMeter = Math.max(0, turboBoostMeter - drain);
        if (turboBoostMeter <= 0) {
            turboBoostEnabled = false;
            if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = false;
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = "Off";
            updateRateDisplay();
        }
        if (drain > 0 && turboBoostGaugeEl) {
            turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning");
            void turboBoostGaugeEl.offsetWidth;
            turboBoostGaugeEl.classList.add("turbo-boost-gauge-burning");
            setTimeout(() => turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning"), 250);
        }
        updateTurboBoostUI();
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

    function tryUnlockTurboIfEligible() {
        if (totalChanges < TURBO_UNLOCK_COUNT) return;
        if (!turboBoostUnlocked) {
            turboBoostUnlocked = true;
            // First-time unlock starts OFF so the player explicitly chooses activation.
            turboBoostEnabled = false;
            if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = false;
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = "Off";
            addToLog("Turbo system unlocked at " + formatCount(TURBO_UNLOCK_COUNT) + ".", "milestone");
            checkStoryBanners();
        }
        if (turboBoostWrapEl) {
            turboBoostWrapEl.style.display = "";
            turboBoostWrapEl.setAttribute("aria-hidden", "false");
        }
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
            addToLog("Slowdown system unlocked (all hands).", "milestone");
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
            updateTurboBoostUI();
            updateRateDisplay();
        }
        if (!opts.skipAutosave) autosaveNow();
        if (!opts.skipLog) {
            const line = formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill);
            if (line) addToLog(line, "tip");
        }
        return true;
    }
    // Syncs the turbo UI (unlock visibility, gauge fill, and displayed multiplier).
    function updateTurboBoostUI() {
        tryUnlockTurboIfEligible();
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
            if (turboScensionBurnLineEl) turboScensionBurnLineEl.textContent = "Burn " + Math.round(Number(turboScensionBurnLevel) || 0);
            if (turboScensionTankLineEl) turboScensionTankLineEl.textContent = "Tank " + Math.round(Number(turboScensionTankLevel) || 0);
            if (turboScensionMultLineEl) turboScensionMultLineEl.textContent = "Mult " + Math.round(Number(turboScensionMultLevel) || 0);
            if (turboScensionFillLineEl) turboScensionFillLineEl.textContent = "Fill " + Math.round(Number(turboScensionFillLevel) || 0);
            if (turboScensionUpgradeBtn) {
                const actCost = getTurboScensionActivationCost();
                const can = turboActivationCount >= actCost;
                const rollN = getTurboScensionUpgradeRollCount();
                const allAxes = !!computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
                turboScensionUpgradeBtn.disabled = !can;
                turboScensionUpgradeBtn.title = can
                    ? (allAxes
                        ? "Spend " + formatCount(actCost) + " activations for +" + rollN + " each on Burn, Tank, Mult, and Fill (no random)"
                        : "Spend " + formatCount(actCost) + " activations for " + rollN + " independent random level" + (rollN === 1 ? "" : "s") + " on Burn, Tank, Mult, or Fill")
                    : "Need " + formatCount(actCost) + " activations (have " + formatCount(turboActivationCount) + ")";
            }
            if (turboScensionLevelerLineEl) {
                const tl = computeAscensionGrantTotals().turboLeveler === true;
                if (tl) {
                    turboScensionLevelerLineEl.style.display = "";
                    turboScensionLevelerLineEl.setAttribute("aria-hidden", "false");
                    const next = getTurboLevelerNextPointCost();
                    turboScensionLevelerLineEl.textContent = "Leveler " + formatTurboScensionLevelDisplay(turboLevelerBank) + " / " + formatTurboScensionLevelDisplay(next) + " pts";
                    turboScensionLevelerLineEl.title = "While Turbo is off, combo fill past a full meter banks here. With Turbo still off, meeting the point cost buys one random Burn/Tank/Mult/Fill level; that cost doubles each purchase.";
                } else {
                    turboScensionLevelerLineEl.style.display = "none";
                    turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
                }
            }
        }
        if (!turboBoostWrapEl || !turboBoostUnlocked) return;
        if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = !!turboBoostEnabled;
        if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = turboBoostEnabled ? "On" : "Off";
        const meterMax = getTurboMeterMax();
        const pct = Math.min(100, (turboBoostMeter / meterMax) * 100);
        if (turboBoostFillEl) turboBoostFillEl.style.width = pct + "%";
        if (turboBoostGaugeEl) turboBoostGaugeEl.setAttribute("aria-valuenow", Math.round(turboBoostMeter));
        if (turboBoostGaugeEl) turboBoostGaugeEl.setAttribute("aria-valuemax", Math.round(meterMax));
        const displayMult = getTurboCountMultiplierFromMeter();
        if (turboBoostMultiplierEl) turboBoostMultiplierEl.textContent = displayMult.toFixed(2) + "×";
        if (turboBoostActivationsEl) turboBoostActivationsEl.textContent = "Activations: " + formatCount(turboActivationCount);
    }

    if (turboScensionUpgradeBtn) {
        turboScensionUpgradeBtn.addEventListener("click", () => { tryTurboScensionActivationUpgrade(); });
    }
    if (turboBoostEnabledCheckbox) {
        turboBoostEnabledCheckbox.addEventListener("change", () => {
            turboBoostEnabled = turboBoostEnabledCheckbox.checked;
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = turboBoostEnabled ? "On" : "Off";
            if (!turboBoostEnabled) tryTurboLevelerPurchases();
            updateTurboBoostUI();
            updateRateDisplay();
        });
    }

    function maybeAutoBuySpeedUpgrade() {
        if (!autoBuyUnlocked) return;
        const dtSec = GAME_LOOP_MS / 1000;
        for (let i = 0; i < unlockedHands; i++) {
            if (!autoBuyEnabledByHand[i]) continue;
            const countdown = autoBuyCountdownSecondsByHand[i] || 0;
            const nextLevel = speedLevel[i] + 1;
            const cost = getUpgradeCost(i, nextLevel);
            const canAfford = (handEarnings[i] || 0) >= cost;
            if (countdown > 0) {
                autoBuyCountdownSecondsByHand[i] = countdown - dtSec;
                if (autoBuyCountdownSecondsByHand[i] <= 0) {
                    if (canAfford) {
                        buySpeedUpgradeForHand(i, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        const stillCanAfford = (handEarnings[i] || 0) >= getUpgradeCost(i, speedLevel[i] + 1);
                        autoBuyCountdownSecondsByHand[i] = stillCanAfford ? getAutoBuyDelaySeconds() : 0;
                    } else {
                        autoBuyCountdownSecondsByHand[i] = 0;
                    }
                }
            } else if (canAfford) {
                autoBuyCountdownSecondsByHand[i] = getAutoBuyDelaySeconds();
            }
        }
    }

    function getSaveState(savedAt) {
        const numberModulesState = {};
        Object.keys(NUMBER_MODULES).forEach(k => {
            const m = NUMBER_MODULES[k];
            numberModulesState[k] = m.getSaveData();
        });
        return {
            savedAt: savedAt || Date.now(),
            handEarnings,
            unlockedHands,
            speedLevel,
            speedBonusLevel,
            cheapenLevel,
            cheapenBonusLevel,
            slowdownLevel,
            slowdownBonusLevel,
            slowdownUnlockLogged,
            timeWarpAuraActiveByHand,
            timeWarpAuraAppearedAtMsByHand,
            timeWarpNextSpawnInSec,
            timeWarpUnlockLogged,
            autoBuyUnlocked,
            autoBuyEnabledByHand,
            autoBuyCountdownSecondsByHand,
            turboBoostMeter,
            turboBoostUnlocked,
            turboBoostEnabled,
            turboActivationCount,
            turboScensionBurnLevel,
            turboScensionTankLevel,
            turboScensionMultLevel,
            turboScensionFillLevel,
            turboLevelerBank,
            turboLevelerPurchases,
            earnedComboNames,
            comboActivationCounts,
            comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION,
            comboSustainPrimaryName,
            comboSustainAccumulator,
            comboRunBonusRampAccumulator,
            adaptiveLastProgressAtMs,
            adaptiveLastHintAtMs,
            previousTickActiveComboNames: Array.from(previousTickActiveComboNames),
            objectivesAchieved: objectives.map(o => o.achieved),
            longTermObjectivesAchieved: longTermObjectives.map(o => o.achieved),
            shownBannerIds: Array.from(shownBannerIds),
            closedBanners,
            settings,
            numberModulesState,
            number1AscensionEssence,
            number1AscensionPendingBonusEssence,
            number1AscensionClapEssenceMultiplier,
            number1AscensionClapEssenceProcCount,
            number1HasAscended,
            number1AscensionNodeIds,
            number1AscensionBlackHoleLevel: Math.floor(Number(number1BlackHoleState.phase2Mass) || 0),
            number1BlackHoleState,
            unlockedHandsCap,
            ascensionNumber1IntroSeen,
            ascensionTreeVersion: ASCENSION_TREE_VERSION,
            clapCooldownUntilMsByHand
        };
    }
    function autosaveNow() {
        if (suppressAutosave) return;
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveState(Date.now()))); } catch (_) {}
    }
    /** Non-null only for valid non-negative saved essence (Number 1); avoids losing essence to parse quirks. */
    function parseNumber1AscensionEssenceFromSaveValue(v) {
        if (v == null) return null;
        if (typeof v === "bigint") {
            if (v < 0n) return null;
            const n = Number(v);
            return Number.isFinite(n) ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)) : Number.MAX_SAFE_INTEGER;
        }
        let n;
        if (typeof v === "string") {
            const t = v.trim();
            if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return null;
            n = Number(t);
        } else {
            n = Number(v);
        }
        if (!Number.isFinite(n) || n < 0) return null;
        return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
    }
    /** Essence is stored top-level and under numberModulesState[1]; use max so 0 in one field cannot wipe the other. */
    function mergeNumber1AscensionEssenceFromSaveData(data) {
        if (!data || typeof data !== "object") return;
        const candidates = [];
        const add = (v) => {
            const p = parseNumber1AscensionEssenceFromSaveValue(v);
            if (p !== null) candidates.push(p);
        };
        add(data.number1AscensionEssence);
        if (data.numberModulesState && typeof data.numberModulesState === "object") {
            const n1 = data.numberModulesState["1"];
            if (n1 && typeof n1 === "object" && n1.ascensionEssence != null) add(n1.ascensionEssence);
        }
        if (candidates.length === 0) return;
        number1AscensionEssence = Math.max(number1AscensionEssence, Math.min(Number.MAX_SAFE_INTEGER, Math.max(...candidates)));
    }
    function applyLoadedState(data) {
        if (!data || typeof data !== "object") return;
        if (Array.isArray(data.handEarnings)) handEarnings = data.handEarnings.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.handEarnings.length)).fill(0));
        if (Array.isArray(data.speedLevel)) speedLevel = data.speedLevel.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.speedLevel.length)).fill(0));
        if (Array.isArray(data.speedBonusLevel)) speedBonusLevel = data.speedBonusLevel.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.speedBonusLevel.length)).fill(0));
        else speedBonusLevel = Array(maxHands).fill(0);
        clapDigitPrevious = Array(maxHands).fill(-1);
        clapCooldownUntilMsByHand = Array(maxHands).fill(0);
        if (Array.isArray(data.clapCooldownUntilMsByHand)) {
            const src = data.clapCooldownUntilMsByHand;
            const now = Date.now();
            for (let i = 0; i < maxHands && i < src.length; i++) {
                const t = Number(src[i]);
                clapCooldownUntilMsByHand[i] = Number.isFinite(t) && t > now ? t : 0;
            }
        }
        if (Array.isArray(data.cheapenLevel)) cheapenLevel = data.cheapenLevel.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.cheapenLevel.length)).fill(0));
        if (Array.isArray(data.cheapenBonusLevel)) cheapenBonusLevel = data.cheapenBonusLevel.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.cheapenBonusLevel.length)).fill(0));
        else cheapenBonusLevel = Array(maxHands).fill(0);
        if (Array.isArray(data.slowdownLevel)) slowdownLevel = data.slowdownLevel.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.slowdownLevel.length)).fill(0));
        if (Array.isArray(data.slowdownBonusLevel)) slowdownBonusLevel = data.slowdownBonusLevel.slice(0, maxHands).concat(Array(Math.max(0, maxHands - data.slowdownBonusLevel.length)).fill(0));
        else slowdownBonusLevel = Array(maxHands).fill(0);
        slowdownUnlockLogged = !!data.slowdownUnlockLogged;
        if (Array.isArray(data.timeWarpAuraActiveByHand)) timeWarpAuraActiveByHand = data.timeWarpAuraActiveByHand.slice(0, maxHands).map(v => !!v).concat(Array(Math.max(0, maxHands - data.timeWarpAuraActiveByHand.length)).fill(false));
        if (Array.isArray(data.timeWarpAuraAppearedAtMsByHand)) {
            timeWarpAuraAppearedAtMsByHand = data.timeWarpAuraAppearedAtMsByHand.slice(0, maxHands).map(v => {
                const t = Number(v);
                return Number.isFinite(t) && t > 0 ? t : 0;
            }).concat(Array(Math.max(0, maxHands - data.timeWarpAuraAppearedAtMsByHand.length)).fill(0));
        } else {
            timeWarpAuraAppearedAtMsByHand = [];
        }
        timeWarpNextSpawnInSec = Number.isFinite(data.timeWarpNextSpawnInSec) && data.timeWarpNextSpawnInSec >= 0 ? data.timeWarpNextSpawnInSec : 0;
        timeWarpUnlockLogged = !!data.timeWarpUnlockLogged;
        unlockedHandsCap = Math.max(1, Math.min(maxHands, Number(data.unlockedHandsCap) || maxHands));
        unlockedHands = Math.max(1, Math.min(unlockedHandsCap, Number(data.unlockedHands) || 1));
        for (let i = unlockedHands; i < maxHands; i++) handEarnings[i] = 0;
        while (timeWarpAuraAppearedAtMsByHand.length < maxHands) timeWarpAuraAppearedAtMsByHand.push(0);
        for (let i = 0; i < unlockedHands; i++) {
            if (timeWarpAuraActiveByHand[i] && !(timeWarpAuraAppearedAtMsByHand[i] > 0)) {
                timeWarpAuraAppearedAtMsByHand[i] = Date.now();
            }
        }
        ensureSpeedRows();
        while (hands.length < unlockedHands) {
            const handNum = hands.length + 1;
            const slot = speedRowRefs[handNum - 1]?.handMountEl;
            hands.push(new HandCounter(handNum, HAND_BASE_SPEED, slot));
        }
        autoBuyUnlocked = !!data.autoBuyUnlocked;
        if (Array.isArray(data.autoBuyEnabledByHand)) autoBuyEnabledByHand = data.autoBuyEnabledByHand.slice(0, maxHands);
        if (Array.isArray(data.autoBuyCountdownSecondsByHand)) autoBuyCountdownSecondsByHand = data.autoBuyCountdownSecondsByHand.slice(0, maxHands);
        turboBoostMeter = Number(data.turboBoostMeter) || 0;
        turboBoostUnlocked = !!data.turboBoostUnlocked;
        turboBoostEnabled = data.turboBoostEnabled !== false;
        turboActivationCount = Number.isFinite(data.turboActivationCount) && data.turboActivationCount >= 0 ? Math.floor(data.turboActivationCount) : 0;
        turboScensionBurnLevel = Number.isFinite(data.turboScensionBurnLevel) && data.turboScensionBurnLevel >= 0 ? Math.floor(data.turboScensionBurnLevel) : 0;
        turboScensionTankLevel = Number.isFinite(data.turboScensionTankLevel) && data.turboScensionTankLevel >= 0 ? Math.floor(data.turboScensionTankLevel) : 0;
        turboScensionMultLevel = Number.isFinite(data.turboScensionMultLevel) && data.turboScensionMultLevel >= 0 ? Math.floor(data.turboScensionMultLevel) : 0;
        turboScensionFillLevel = Number.isFinite(data.turboScensionFillLevel) && data.turboScensionFillLevel >= 0 ? Math.floor(data.turboScensionFillLevel) : 0;
        {
            const b = Number(data.turboLevelerBank);
            turboLevelerBank = Number.isFinite(b) && b >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, b) : 0;
        }
        turboLevelerPurchases = Number.isFinite(data.turboLevelerPurchases) && data.turboLevelerPurchases >= 0 ? Math.floor(data.turboLevelerPurchases) : 0;
        if (!turboBoostEnabled) tryTurboLevelerPurchases();
        adaptiveLastProgressAtMs = Number.isFinite(data.adaptiveLastProgressAtMs) && data.adaptiveLastProgressAtMs > 0 ? data.adaptiveLastProgressAtMs : Date.now();
        adaptiveLastHintAtMs = Number.isFinite(data.adaptiveLastHintAtMs) && data.adaptiveLastHintAtMs > 0 ? data.adaptiveLastHintAtMs : 0;
        if (Array.isArray(data.earnedComboNames)) {
            earnedComboNames.length = 0;
            data.earnedComboNames.forEach(n => earnedComboNames.push(n));
        }
        const loadedActivationEdgeVer = Number(data.comboActivationEdgeVersion);
        if (loadedActivationEdgeVer === COMBO_ACTIVATION_EDGE_SAVE_VERSION && data.comboActivationCounts && typeof data.comboActivationCounts === "object") {
            comboActivationCounts = {};
            Object.keys(data.comboActivationCounts).forEach(k => {
                const v = Number(data.comboActivationCounts[k]);
                comboActivationCounts[k] = Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
            });
        } else {
            comboActivationCounts = {};
        }
        comboSustainPrimaryName = typeof data.comboSustainPrimaryName === "string" && data.comboSustainPrimaryName.length > 0 ? data.comboSustainPrimaryName : null;
        {
            const acc = Number(data.comboSustainAccumulator);
            comboSustainAccumulator = Number.isFinite(acc) && acc >= 0 ? Math.min(COMBO_SUSTAIN_ACC_MAX, acc) : 0;
        }
        {
            const rra = Number(data.comboRunBonusRampAccumulator);
            comboRunBonusRampAccumulator = Number.isFinite(rra) && rra >= 0 ? Math.min(COMBO_RUN_BONUS_RAMP_LOAD_CAP, rra) : 0;
        }
        if (Array.isArray(data.previousTickActiveComboNames)) previousTickActiveComboNames = new Set(data.previousTickActiveComboNames);
        if (Array.isArray(data.objectivesAchieved)) objectives.forEach((o, i) => { o.achieved = !!data.objectivesAchieved[i]; });
        if (Array.isArray(data.longTermObjectivesAchieved)) longTermObjectives.forEach((o, i) => { o.achieved = !!data.longTermObjectivesAchieved[i]; });
        if (Array.isArray(data.shownBannerIds)) { shownBannerIds.clear(); data.shownBannerIds.forEach(id => shownBannerIds.add(id)); }
        if (Array.isArray(data.closedBanners)) { closedBanners.length = 0; data.closedBanners.forEach(b => closedBanners.push(b)); }
        if (data.settings) {
            settings = {
                theme: data.settings.theme === "dark" ? "dark" : "light",
                adaptiveTipsEnabled: data.settings.adaptiveTipsEnabled !== false,
                curtainEnabled: data.settings.curtainEnabled !== false,
                humorEnabled: data.settings.humorEnabled !== false,
                showClapAnimation: data.settings.showClapAnimation !== false,
                offlineCapHours: Number.isFinite(data.settings.offlineCapHours) && data.settings.offlineCapHours >= 0 ? data.settings.offlineCapHours : settings.offlineCapHours
            };
        }
        if (data.numberModulesState && typeof data.numberModulesState === "object") {
            Object.keys(data.numberModulesState).forEach(k => {
                const m = NUMBER_MODULES[k];
                if (m) m.applySaveData(data.numberModulesState[k]);
            });
        }
        mergeNumber1AscensionEssenceFromSaveData(data);
        number1AscensionPendingBonusEssence = Number.isFinite(data.number1AscensionPendingBonusEssence) && data.number1AscensionPendingBonusEssence >= 0
            ? Math.floor(data.number1AscensionPendingBonusEssence)
            : 0;
        number1AscensionClapEssenceMultiplier = Number.isFinite(data.number1AscensionClapEssenceMultiplier) && data.number1AscensionClapEssenceMultiplier >= 1
            ? data.number1AscensionClapEssenceMultiplier
            : 1;
        number1AscensionClapEssenceProcCount = Number.isFinite(data.number1AscensionClapEssenceProcCount) && data.number1AscensionClapEssenceProcCount >= 0
            ? Math.floor(data.number1AscensionClapEssenceProcCount)
            : 0;
        number1HasAscended = !!data.number1HasAscended;
        reconcileNumber2LockState();
        updateNumber2SidebarUnlockUI();
        number1AscensionNodeIds = [];
        const savedAscTreeVer = Number(data.ascensionTreeVersion);
        const ascTreeOk = Number.isFinite(savedAscTreeVer) && savedAscTreeVer >= ASCENSION_TREE_VERSION;
        if (ascTreeOk && Array.isArray(data.number1AscensionNodeIds)) {
            data.number1AscensionNodeIds.forEach(id => {
                if (typeof id === "string") number1AscensionNodeIds.push(id);
            });
            normalizeAscensionNodeIds();
        }
        if (typeof data.ascensionNumber1IntroSeen === "boolean") {
            ascensionNumber1IntroSeen = data.ascensionNumber1IntroSeen;
        }
        {
            const bh = Number(data.number1AscensionBlackHoleLevel);
            number1AscensionBlackHoleLevel = Number.isFinite(bh) && bh >= 0 ? Math.min(BLACK_HOLE_MAX_LEVEL, Math.floor(bh)) : 0;
        }
        number1BlackHoleState = normalizeNumber1BlackHoleStateFromSaveData(data.number1BlackHoleState, {
            legacyBlackHoleLevel: number1AscensionBlackHoleLevel,
            maxHands,
            nowMs: Date.now()
        });
        if (number1HasAscended && isNumber1AscensionTreeFullyPurchased() && getBlackHolePhase() === 0) {
            number1BlackHoleState.phase = 1;
        }
        if (turboBoostUnlocked) turboBoostMeter = Math.min(turboBoostMeter, getTurboMeterMax());
        refreshTotalFromHandEarnings();
        syncBlackHolePhase1Vfx();
        updateN1GravityCpsStrip();
        checkStoryBanners();
    }
    function applyOfflineProgress(offlineMs, opts) {
        const options = opts || {};
        const showSummary = options.showSummary !== false;
        const capMs = Math.max(0, settings.offlineCapHours * 3600 * 1000);
        const effectiveMs = Math.min(Math.max(0, offlineMs), capMs);
        if (effectiveMs <= 0) return;
        const offlineSec = effectiveMs / 1000;
        tickBackgroundNumberModules(offlineSec);
        updateBlackHolePhaseStep(offlineSec);
        try {
            if (getBlackHolePhase() === 7) {
                totalChanges = Math.floor(number1BlackHoleState.phase7EpilogueCounter || 0);
                handEarnings[0] = totalChanges;
                return;
            }
            const cpsPerHandProbe = getRawCpsPerHand();
            const rawCpsProbe = cpsPerHandProbe.reduce((a, b) => a + b, 0);
            if (rawCpsProbe <= 0) return;
            const gained = applyNumber1DetachedCpsProgress(offlineSec);
            if (showSummary && offlineSummaryBodyEl && offlineSummaryPanelEl) {
                const capped = offlineMs > capMs;
                offlineSummaryBodyEl.textContent = "Simulated " + (effectiveMs / 1000).toFixed(1) + "s offline and gained " + formatCount(gained) + (capped ? " (capped)." : ".");
                offlineSummaryPanelEl.style.display = "flex";
            }
        } finally {
            syncBlackHolePhase1Vfx();
        }
    }

    /* ---------------------------------------------------------
       HAND CLASS
    --------------------------------------------------------- */
    const GAME_LOOP_MS = 50;
    /** Wall-clock timing: each step advances the sim by exactly GAME_LOOP_MS so hand/combo logic stays stable. */
    let lastGameLoopPerfMs = null;
    let simLagMs = 0;
    const GAME_LOOP_MAX_ELAPSED_MS = 60000;
    const GAME_LOOP_MAX_LAG_MS = 120000;
    const GAME_LOOP_MAX_CATCHUP_STEPS = 240;
    let gameLoopTimer = null;
    let hiddenStartedAtMs = null;

    function beginHiddenOfflineTracking() {
        // If gameplay is intentionally paused by a modal/overlay, do not accrue offline gains.
        if (gameplaySimFrozen()) {
            hiddenStartedAtMs = null;
            lastGameLoopPerfMs = null;
            simLagMs = 0;
            return;
        }
        if (hiddenStartedAtMs == null) hiddenStartedAtMs = Date.now();
        // Prevent the fixed-step loop from attempting to catch up on return.
        lastGameLoopPerfMs = null;
        simLagMs = 0;
    }

    function endHiddenOfflineTracking() {
        const hiddenAt = hiddenStartedAtMs;
        hiddenStartedAtMs = null;
        if (hiddenAt == null) {
            lastGameLoopPerfMs = null;
            simLagMs = 0;
            return;
        }
        const offlineMs = Math.max(0, Date.now() - hiddenAt);
        if (!gameplaySimFrozen() && offlineMs > 0) {
            applyOfflineProgress(offlineMs, { showSummary: false });
        }
        lastGameLoopPerfMs = null;
        simLagMs = 0;
    }

    class HandCounter {
        constructor(id, speed, parentEl) {
            this.id = id;
            this.count = 1;
            this.baseSpeed = speed;
            /** Exact sub-tick carry: floor(total ms × mult / 1000) via (acc += dt×mult) / 1000. */
            this.tickAccBig = 0n;

            this.el = document.createElement("div");
            this.el.className = "hand curtain-reveal";
            this.el.style.whiteSpace = "pre";

            (parentEl || handsContainer).appendChild(this.el);

            this.render();

            setTimeout(() => {
                this.el.classList.add("visible");
            }, 300);
        }

        restartTimer() { /* speed applied in game loop */ }

        applyTicks(n) {
            if (n <= 0) return;
            const nb = typeof n === "bigint" ? n : BigInt(Math.floor(Number(n)));
            if (nb <= 0n) return;
            const tMod = Number(nb % 10n);
            this.count = ((this.count - 1 + tMod) % 10 + 10) % 10 + 1;
            this.render();
        }

        render() {
            if (this._lastRenderedCount === this.count) return;
            this._lastRenderedCount = this.count;
            this.el.textContent = hands1[this.count - 1];
        }
    }

    /* ---------------------------------------------------------
       HAND MANAGEMENT
       Hand 1: immediate. Hand 2: 1e9, 3: 1e12, 4: 1e15, 5: 1e18,
       6: 1e21, 7: 1e24, 8: 1e27, 9: 1e30, 10: 1e33
    --------------------------------------------------------- */
    const hands = [];
    const UNLOCK_THRESHOLDS = [
        1e9,   // hand 2: 1 billion
        1e12,  // hand 3: 1 trillion
        1e15,  // hand 4: 1 quadrillion
        1e18,  // hand 5: 1 quintillion
        1e21,  // hand 6: 1 sextillion
        1e24,  // hand 7: 1 septillion
        1e27,  // hand 8: 1 octillion
        1e30,  // hand 9: 1 nonillion
        1e33   // hand 10: 1 decillion
    ];

    const HAND_BASE_SPEED = 1000; // ms per tick; same for all hands

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
        try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
        location.reload();
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
        const cap = Math.max(1, Math.min(maxHands, unlockedHandsCap | 0));
        while (unlockedHands < cap && unlockedHands - 1 < UNLOCK_THRESHOLDS.length && totalChanges >= UNLOCK_THRESHOLDS[unlockedHands - 1]) {
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
        return "At " + formatCount(threshold) + " total count on your counter, ";
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
            body: storyTotalCountLead(UNLOCK_THRESHOLDS[8]) + "you unlocked a tenth hand. It is quieter than I thought it would be. Wait did I not add an upgrade for 10 hands either? Not that can't be right, I feel like there is something here. Keep counting while I go look for the next upgrade.."
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
            id: "black-hole-phase-1-collapse",
            order: 1001,
            trigger: () => false,
            title: "Mass Accumulator Collapse",
            body: "Critical mass reached. The accumulator collapses inward. A black hole is born. You done messed up son (or daughter)!"
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
    const shownBannerIds = new Set();
    const closedBanners = [];

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
    const storyReviewBtn = document.getElementById("story-review-btn");
    const storyReviewPanelEl = document.getElementById("story-review-panel");
    const storyReviewListEl = document.getElementById("story-review-list");
    const storyReviewCloseBtn = document.getElementById("story-review-close");

    function getStoryBannerById(id) {
        return STORY_BANNERS.find(b => b.id === id) || null;
    }
    function showStoryBannerById(id) {
        const banner = getStoryBannerById(id);
        if (banner) showStoryBanner(banner);
    }
    function hasUnlockedStoryBanner(id) {
        return shownBannerIds.has(id) || closedBanners.some(b => b && b.id === id);
    }
    function checkStoryBanners() {
        if (gameplaySimFrozen()) return;
        const pending = STORY_BANNERS.filter(b => !shownBannerIds.has(b.id) && b.trigger());
        pending.sort((a, b) => a.order - b.order);
        const toShow = pending[0];
        if (toShow) showStoryBanner(toShow);
    }

    let currentStoryBanner = null;
    let currentStoryBannerIsReplay = false;
    let currentStoryBannerOnClose = null;
    let replayStoryBannerPreviousPaused = false;

    function showStoryBanner(banner, options = {}) {
        currentStoryBanner = banner;
        currentStoryBannerIsReplay = !!options.isReplay;
        currentStoryBannerOnClose = typeof options.onClose === "function" ? options.onClose : null;
        replayStoryBannerPreviousPaused = currentStoryBannerIsReplay ? gamePaused : false;
        gamePaused = true;
        if (storyBannerTitleEl) storyBannerTitleEl.textContent = banner.title;
        if (storyBannerBodyEl) storyBannerBodyEl.textContent = banner.body;
        if (storyBannerOverlayEl) storyBannerOverlayEl.style.display = "flex";
    }

    function closeStoryBanner() {
        if (!storyBannerOverlayEl || storyBannerOverlayEl.style.display !== "flex") return;
        const wasReplay = currentStoryBannerIsReplay;
        const onClose = currentStoryBannerOnClose;
        if (currentStoryBanner) {
            if (!wasReplay) {
                shownBannerIds.add(currentStoryBanner.id);
                closedBanners.push({ id: currentStoryBanner.id, order: currentStoryBanner.order, title: currentStoryBanner.title, body: currentStoryBanner.body, closedAt: Date.now() });
            }
            currentStoryBanner = null;
        }
        currentStoryBannerIsReplay = false;
        currentStoryBannerOnClose = null;
        storyBannerOverlayEl.style.display = "none";
        if (!wasReplay && ascensionMapCollapsePending && !number1BlackHoleState.phase1MapCollapseSeen) {
            startAscensionMapCollapseTransition();
        }
        gamePaused = wasReplay ? replayStoryBannerPreviousPaused : false;
        replayStoryBannerPreviousPaused = false;
        renderStoryReviewList();
        if (!wasReplay) refreshStoryArchiveSectionIfOpen();
        if (onClose) onClose();
        if (!wasReplay) checkStoryBanners();
    }

    function renderStoryReviewList() {
        if (!storyReviewListEl) return;
        storyReviewListEl.innerHTML = renderStoryArchiveHtml();
    }
    function escapeHtml(s) {
        const div = document.createElement("div");
        div.textContent = s;
        return div.innerHTML;
    }

    if (storyBannerCloseBtn) storyBannerCloseBtn.addEventListener("click", closeStoryBanner);
    if (storyReviewBtn) storyReviewBtn.addEventListener("click", () => { storyReviewPanelEl.style.display = storyReviewPanelEl.style.display === "none" ? "block" : "none"; renderStoryReviewList(); });
    if (storyReviewCloseBtn) storyReviewCloseBtn.addEventListener("click", () => { storyReviewPanelEl.style.display = "none"; });
    if (storyReviewListEl) {
        storyReviewListEl.addEventListener("click", e => {
            const replayBtn = e.target.closest("[data-story-replay-id]");
            if (!replayBtn) return;
            const banner = getStoryBannerById(replayBtn.getAttribute("data-story-replay-id"));
            if (banner && hasUnlockedStoryBanner(banner.id)) showStoryBanner(banner, { isReplay: true });
        });
    }
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
        if (typeof playCurtainAnimation === "function") {
            playCurtainAnimation(applyToggle);
        } else {
            applyToggle();
        }
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
            adaptiveLastHintAtMs = Date.now();
            adaptiveLastProgressAtMs = Date.now();
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
            if (typeof playCurtainAnimation === "function") {
                playCurtainAnimation(() => showPagePanel(pageId));
            } else {
                showPagePanel(pageId);
            }
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
                if (now < comboFilterInteractionLockUntilMs) return;
                if (now - comboFilterLastApplyAtMs < COMBO_FILTER_DEBOUNCE_MS) return;
                comboIndexStatusFilter = statusBtn.getAttribute("data-combo-status") || "all";
                comboFilterLastApplyAtMs = now;
                comboFilterInteractionLockUntilMs = now + COMBO_FILTER_LOCK_MS;
                comboFilterPauseAutoRefreshUntilMs = now + COMBO_FILTER_PAUSE_AUTO_REFRESH_MS;
                refreshCombinationsPanelIfOpen(true);
                return;
            }
            const handsBtn = e.target.closest("[data-combo-hands]");
            if (handsBtn) {
                e.preventDefault();
                e.stopPropagation();
                const now = Date.now();
                if (now < comboFilterInteractionLockUntilMs) return;
                if (now - comboFilterLastApplyAtMs < COMBO_FILTER_DEBOUNCE_MS) return;
                comboIndexHandsFilter = handsBtn.getAttribute("data-combo-hands") || "all";
                comboFilterLastApplyAtMs = now;
                comboFilterInteractionLockUntilMs = now + COMBO_FILTER_LOCK_MS;
                comboFilterPauseAutoRefreshUntilMs = now + COMBO_FILTER_PAUSE_AUTO_REFRESH_MS;
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

    if (ascensionReadyCtaEl) {
        ascensionReadyCtaEl.addEventListener("click", () => beginNumber1AscensionFlow());
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
                tryBuyAscension2Node(nid);
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
                const openAscPanel = () => showPagePanel("ascension");
                if (typeof playCurtainAnimation === "function") playCurtainAnimation(openAscPanel);
                else openAscPanel();
                return;
            }
            const openAscN2 = e.target.closest("[data-open-ascension-n2]");
            if (openAscN2) {
                e.preventDefault();
                ascensionPageActiveNumber = 2;
                const openAscPanel = () => showPagePanel("ascension");
                if (typeof playCurtainAnimation === "function") playCurtainAnimation(openAscPanel);
                else openAscPanel();
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
            const btn = e.target.closest(".ascend-number-btn");
            if (!btn) return;
            if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
            const n = parseInt(btn.getAttribute("data-number"), 10);
            if (n === 1) beginNumber1AscensionFlow();
        });
    }

    if (ascensionIntroContinueBtn && ascensionIntroOverlayEl) {
        ascensionIntroContinueBtn.addEventListener("click", () => {
            ascensionIntroOverlayEl.style.display = "none";
            gamePaused = false;
        });
    }
    if (ascensionConfirmCancelBtn && ascensionConfirmOverlayEl) {
        ascensionConfirmCancelBtn.addEventListener("click", () => {
            ascensionConfirmOverlayEl.style.display = "none";
            gamePaused = false;
        });
    }
    if (ascensionConfirmAscendBtn && ascensionConfirmOverlayEl) {
        ascensionConfirmAscendBtn.addEventListener("click", () => {
            ascensionConfirmOverlayEl.style.display = "none";
            performNumber1Ascension();
            gamePaused = false;
        });
    }

    /* ---------------------------------------------------------
       HAND COMBOS (poker-style: hand values 1–10, bonuses stack)
    --------------------------------------------------------- */
    function getHandValues() {
        return hands.map(h => h.count);
    }
    function countValues(v) {
        const c = {};
        for (let i = 1; i <= 10; i++) c[i] = 0;
        v.forEach(x => {
            const key = Number(x);
            if (key >= 1 && key <= 10) c[key] = (c[key] || 0) + 1;
        });
        return c;
    }
    const BONUS_BY_COUNT = { 2: 1.10, 3: 1.20, 4: 1.35, 5: 1.40, 6: 1.45, 7: 1.50, 8: 1.55, 9: 1.60, 10: 1.65 };
    const COUNT_NAMES = ["", "", "Pair of", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    const COMBOS = [];
    for (let n = 1; n <= 10; n++) {
        for (let k = 2; k <= 10; k++) {
            const name = (k === 2 ? "Pair of " + n + "s" : COUNT_NAMES[k] + " " + n + "s");
            let check;
            if (k === 2) (function(nn) { check = v => v[0] === nn && v[1] === nn; })(n);
            else if (k === 3) (function(nn) { check = v => v[0] === nn && v[1] === nn && v[2] === nn; })(n);
            else (function(nn, kk) { check = v => countValues(v)[nn] >= kk; })(n, k);
            COMBOS.push({ name, minHands: k, check, bonus: BONUS_BY_COUNT[k] });
        }
    }
    COMBOS.push(
        { name: "Two Pair", minHands: 4, check: v => { const c = countValues(v); let nRanksWithPair = 0; for (let r = 1; r <= 10; r++) { if (c[r] >= 2) nRanksWithPair++; } return nRanksWithPair >= 2; }, bonus: 1.15 },
        { name: "Full House", minHands: 5, check: v => { const c = countValues(v); const counts = Object.values(c).filter(n => n > 0).sort((a, b) => b - a); return counts[0] >= 3 && counts[1] >= 2; }, bonus: 1.30 }
    );
    const COMBOS_BY_MIN_HANDS = (function () {
        const byMinHands = {};
        COMBOS.forEach(c => {
            if (!byMinHands[c.minHands]) byMinHands[c.minHands] = [];
            byMinHands[c.minHands].push(c);
        });
        return byMinHands;
    })();
    /** Max distinct near-miss tolerance ranks from middle ascension (see near-miss-combo.spec.md). */
    const NEAR_MISS_TOLERANCE_RANK_MAX = 5;
    /**
     * Distinct digit ranks 1–10 from purchased middle-finger nodes with `nearMissToleranceRank`.
     * Capped at NEAR_MISS_TOLERANCE_RANK_MAX; order = ascending node id, first-seen wins per rank.
     */
    function getNearMissToleranceRanks() {
        const seen = new Set();
        const out = [];
        const ids = number1AscensionNodeIds.slice().sort();
        for (let i = 0; i < ids.length; i++) {
            const def = ASCENSION_MAP_NODE_BY_ID[ids[i]];
            if (!def || def.finger !== "middle" || !def.grants) continue;
            const r = def.grants.nearMissToleranceRank;
            if (typeof r !== "number" || !Number.isInteger(r) || r < 1 || r > 10) continue;
            if (seen.has(r)) continue;
            seen.add(r);
            out.push(r);
            if (out.length >= NEAR_MISS_TOLERANCE_RANK_MAX) break;
        }
        return out;
    }
    /** Pair of n on first two hands: strict (n,n) or relaxed neighbor multisets per near-miss-combo.spec.md. */
    function pairOfNMatchesStrictOrRelaxed(n, v) {
        if (!v || v.length < 2) return false;
        const a = v[0];
        const b = v[1];
        if (a === n && b === n) return true;
        const ranks = getNearMissToleranceRanks();
        if (!ranks.includes(n)) return false;
        const opts = [[n, n]];
        if (n < 10) opts.push([n, n + 1]);
        if (n > 1) opts.push([n - 1, n]);
        for (let oi = 0; oi < opts.length; oi++) {
            const x = opts[oi][0];
            const y = opts[oi][1];
            if ((a === x && b === y) || (a === y && b === x)) return true;
        }
        return false;
    }
    function comboMatchesActive(c, v) {
        if (!v || v.length < (c.minHands || 0)) return false;
        const pairOf = c.name.match(/^Pair of (\d+)s$/);
        if (pairOf && c.minHands === 2) {
            const n = parseInt(pairOf[1], 10);
            return pairOfNMatchesStrictOrRelaxed(n, v);
        }
        return c.check(v);
    }
    function getActiveCombos() {
        const v = getHandValues();
        return COMBOS.filter(c => v.length >= c.minHands && comboMatchesActive(c, v));
    }
    /** Hand indices that participate in an active combo (for ascension pulse split). */
    function getComboParticipatingHandIndices(c, v) {
        const uh = Math.min(v.length, unlockedHands);
        if (uh <= 0) return [];
        const all = () => Array.from({ length: uh }, (_, i) => i);
        if (c.name === "Two Pair") {
            const cv = countValues(v);
            const ranks = [];
            for (let r = 1; r <= 10; r++) if (cv[r] >= 2) ranks.push(r);
            const out = [];
            for (let i = 0; i < uh; i++) if (ranks.indexOf(v[i]) >= 0) out.push(i);
            return out.length ? out : all();
        }
        if (c.name === "Full House") {
            const cv = countValues(v);
            let tri = 0;
            let pair = 0;
            for (let r = 1; r <= 10; r++) if (cv[r] >= 3) { tri = r; break; }
            for (let r = 1; r <= 10; r++) if (cv[r] >= 2 && r !== tri) { pair = r; break; }
            if (!tri) return all();
            const out = [];
            for (let i = 0; i < uh; i++) if (v[i] === tri || v[i] === pair) out.push(i);
            return out.length ? out : all();
        }
        const pairOf = c.name.match(/^Pair of (\d+)s$/);
        if (pairOf) {
            const d = parseInt(pairOf[1], 10);
            if (uh >= 2 && pairOfNMatchesStrictOrRelaxed(d, v)) {
                return [0, 1];
            }
            const out = [];
            for (let i = 0; i < uh; i++) if (v[i] === d) out.push(i);
            return out.length ? out : all();
        }
        const nk = c.name.match(/^(?:Three|Four|Five|Six|Seven|Eight|Nine|Ten) (\d+)s$/);
        if (nk) {
            const d = parseInt(nk[1], 10);
            const out = [];
            for (let i = 0; i < uh; i++) if (v[i] === d) out.push(i);
            return out.length ? out : all();
        }
        return all().slice(0, Math.min(c.minHands || uh, uh));
    }
    const earnedComboNames = [];
    let comboActivationCounts = {};
    let comboIndexStatusFilter = "all";
    let comboIndexHandsFilter = "all";
    let previousTickActiveComboNames = new Set();
    let comboSustainPrimaryName = null;
    let comboSustainAccumulator = 0;
    let comboRunBonusRampAccumulator = 0;
    function getCombosByMinHands() {
        return COMBOS_BY_MIN_HANDS;
    }
    /**
     * Per hand-count tier (2…10): product of bonuses for earned combos that match current hands, including pulse log scaling.
     * Null when no such pattern is active in that tier.
     */
    function computeActiveEarnedComboTierProducts(totalsOpt) {
        const earnedSet = new Set(earnedComboNames);
        const v = getHandValues();
        const byMinHands = getCombosByMinHands();
        const totals = totalsOpt || computeAscensionGrantTotals();
        const pulseCoeff = totals.comboActivationLogCoeff || 0;
        const tier = {};
        for (let n = 2; n <= 10; n++) {
            const group = byMinHands[n] || [];
            const earnedInGroup = group.filter(c => earnedSet.has(c.name) && comboMatchesActive(c, v));
            if (earnedInGroup.length === 0) {
                tier[n] = null;
                continue;
            }
            tier[n] = earnedInGroup.reduce((m, c) => {
                const edges = comboActivationCounts[c.name] || 0;
                const logBonus = pulseCoeff > 0
                    ? Math.min(COMBO_ACTIVATION_LOG_BONUS_CAP, pulseCoeff * Math.log1p(edges))
                    : 0;
                return m * c.bonus * (1 + logBonus);
            }, 1);
        }
        return tier;
    }
    /**
     * Per tier: product of every earned combo in that tier (no “matching hands” filter), optional pulse log from activation counts.
     * Used only for the headline “Total bonus” display — not for ticks or CPS.
     */
    function computeEarnedCatalogComboTierProducts(includePulseLog, totalsOpt) {
        const earnedSet = new Set(earnedComboNames);
        const byMinHands = getCombosByMinHands();
        const totals = totalsOpt || computeAscensionGrantTotals();
        const pulseCoeff = totals.comboActivationLogCoeff || 0;
        const usePulse = !!includePulseLog && pulseCoeff > 0;
        const tier = {};
        for (let n = 2; n <= 10; n++) {
            if (unlockedHands < n) {
                tier[n] = null;
                continue;
            }
            const group = byMinHands[n] || [];
            const earnedInGroup = group.filter(c => earnedSet.has(c.name));
            if (earnedInGroup.length === 0) {
                tier[n] = null;
                continue;
            }
            tier[n] = earnedInGroup.reduce((m, c) => {
                let factor = c.bonus;
                if (usePulse) {
                    const edges = comboActivationCounts[c.name] || 0;
                    const logBonus = Math.min(COMBO_ACTIVATION_LOG_BONUS_CAP, pulseCoeff * Math.log1p(edges));
                    factor *= 1 + logBonus;
                }
                return m * factor;
            }, 1);
        }
        return tier;
    }
    /**
     * Headline “Total bonus” for the top row and Combinations summary only.
     * Same factor stack as production, but pattern base = full earned catalog (not “matching hands now”),
     * and rhythm = full bar — so buying combo ascension upgrades never lowers this number while CPS can still rise from other sources.
     * Count/s total CPS and ticks still use getComboMultiplier() (applied truth); the top-row rate breakdown rescales aggregate base CPS so base × this bonus × turbo matches that total.
     */
    function getDisplayedTotalComboBonus() {
        const totals = computeAscensionGrantTotals();
        const ascSustainMax = totals.comboSustainMaxMultAdd || 0;
        const maxSustainAdd = Math.min(COMBO_SUSTAIN_MAX_MULT_ADD_CAP, COMBO_SUSTAIN_BASE_MAX_MULT_ADD + ascSustainMax);
        const sustainDisplayMult = 1 + COMBO_SUSTAIN_ACC_MAX * maxSustainAdd;
        const tier = computeEarnedCatalogComboTierProducts(true, totals);
        let sum = 0;
        for (let n = 2; n <= 10; n++) {
            const p = tier[n];
            if (p == null) continue;
            sum += p;
        }
        const base = sum > 0 ? sum : 1;
        const comboAdd = totals.comboMultAdd;
        const runRamp = Math.max(0, comboRunBonusRampAccumulator);
        const earnedPatternMult = totals.comboEarnedPatternMult > 1 ? totals.comboEarnedPatternMult : 1;
        return base * (1 + comboAdd + runRamp) * earnedPatternMult * sustainDisplayMult;
    }
    /**
     * Applied combo multiplier for ticks, hand CPS, and the Count/s parenthetical (honest arithmetic with raw CPS).
     *   base × (1 + comboMultAdd + runRamp) × comboEarnedPatternMult × sustainMult
     * Base = sum over tiers of products for earned combos that match current hands (includes pulse log).
     */
    function getComboBonusFactors() {
        const totals = computeAscensionGrantTotals();
        const ascSustainMax = totals.comboSustainMaxMultAdd || 0;
        const maxSustainAdd = Math.min(COMBO_SUSTAIN_MAX_MULT_ADD_CAP, COMBO_SUSTAIN_BASE_MAX_MULT_ADD + ascSustainMax);
        const sustainMult = 1 + comboSustainAccumulator * maxSustainAdd;
        const tier = computeActiveEarnedComboTierProducts(totals);
        let sum = 0;
        for (let n = 2; n <= 10; n++) {
            const p = tier[n];
            if (p == null) continue;
            sum += p;
        }
        const base = sum > 0 ? sum : 1;
        const comboAdd = totals.comboMultAdd;
        const runRamp = Math.max(0, comboRunBonusRampAccumulator);
        const earnedPatternMult = totals.comboEarnedPatternMult > 1 ? totals.comboEarnedPatternMult : 1;
        const comboFlatMult = 1 + comboAdd + runRamp;
        return {
            base,
            comboFlatMult,
            earnedPatternMult,
            sustainMult,
            total: base * comboFlatMult * earnedPatternMult * sustainMult
        };
    }
    function getComboMultiplier() {
        return getComboBonusFactors().total;
    }
    function getPrimaryComboName(active) {
        if (!active || active.length === 0) return null;
        const sorted = active.slice().sort((a, b) => {
            if (b.minHands !== a.minHands) return b.minHands - a.minHands;
            if (b.bonus !== a.bonus) return b.bonus - a.bonus;
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        return sorted[0].name;
    }
    function updateComboSustainState(active) {
        const totals = computeAscensionGrantTotals();
        const fillPerTick = COMBO_SUSTAIN_BASE_FILL_PER_TICK + (totals.comboSustainFillPerTick || 0);
        const ascSustainMax = totals.comboSustainMaxMultAdd || 0;
        const maxSustainAdd = Math.min(COMBO_SUSTAIN_MAX_MULT_ADD_CAP, COMBO_SUSTAIN_BASE_MAX_MULT_ADD + ascSustainMax);
        if (active.length === 0) {
            comboSustainAccumulator = 0;
            comboSustainPrimaryName = null;
            return;
        }
        const primary = getPrimaryComboName(active);
        if (primary !== comboSustainPrimaryName) {
            comboSustainPrimaryName = primary;
            comboSustainAccumulator = 0;
        }
        if (maxSustainAdd <= 0) {
            comboSustainAccumulator = 0;
            return;
        }
        comboSustainAccumulator = Math.min(COMBO_SUSTAIN_ACC_MAX, comboSustainAccumulator + fillPerTick);
    }
    const comboBubbleContainerEl = document.getElementById("combo-bubble-container");
    const COMBO_BUBBLE_DURATION_MS = 3500;
    const COMBO_PAGE_BTN_PULSE_MS = 2600;
    let combinationsBonusPulseClearT = 0;
    function pulseCombinationsPageButtonForNewBonus() {
        if (!combinationsPageBtn || combinationsPageBtn.style.display === "none") return;
        window.clearTimeout(combinationsBonusPulseClearT);
        combinationsPageBtn.classList.remove("page-btn--new-bonus-pulse");
        void combinationsPageBtn.offsetWidth;
        combinationsPageBtn.classList.add("page-btn--new-bonus-pulse");
        combinationsBonusPulseClearT = window.setTimeout(() => {
            combinationsPageBtn.classList.remove("page-btn--new-bonus-pulse");
        }, COMBO_PAGE_BTN_PULSE_MS);
    }
    function showComboBubble(newlyEarned) {
        if (!comboBubbleContainerEl || newlyEarned.length === 0) return;
        const tierProduct = newlyEarned.reduce((m, c) => m * c.bonus, 1);
        const text = newlyEarned.map(c => c.name + " ×" + c.bonus.toFixed(2)).join(" · ");
        const totalText = "New this tick: ×" + tierProduct.toFixed(2) + " within tier(s) — hand-count tiers add for total Bonus (patterns still multiply inside each tier)";
        const bubble = document.createElement("div");
        bubble.className = "combo-bubble";
        bubble.innerHTML = "<span class=\"combo-bubble-names\">" + text + "</span><span class=\"combo-bubble-total\">" + totalText + "</span>";
        comboBubbleContainerEl.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add("combo-bubble-visible"));
        setTimeout(() => { if (bubble.parentNode) bubble.parentNode.removeChild(bubble); }, COMBO_BUBBLE_DURATION_MS);
    }
    /**
     * Rebuilds the Combinations panel "Bonus breakdown" list.
     * @param {boolean} [forceRebuild=true] When false, skips work if called too soon from the panel auto-refresh path (game loop); all other call sites use default immediate rebuild.
     */
    function updateEarnedBonusesUI(forceRebuild) {
        const listEl = document.getElementById("earned-bonuses-list");
        if (!listEl) return;
        const force = forceRebuild !== false;
        const now = Date.now();
        if (!force && listEl.childElementCount > 0 && now - lastEarnedBonusesUiRebuildAtMs < EARNED_BONUSES_UI_AUTO_MIN_MS) {
            return;
        }
        lastEarnedBonusesUiRebuildAtMs = now;
        listEl.innerHTML = "";
        if (unlockedHands < 2) {
            const placeLi = document.createElement("li");
            placeLi.className = "earned-bonuses-placeholder";
            placeLi.textContent = "Unlock a second hand to discover pattern bonuses. Full achievement-style integration with the Achievements page — coming soon.";
            listEl.appendChild(placeLi);
            return;
        }
        const earnedSet = new Set(earnedComboNames);
        const byMinHands = getCombosByMinHands();
        const totals = computeAscensionGrantTotals();
        const tierLive = computeActiveEarnedComboTierProducts(totals);
        const combinedMult = getDisplayedTotalComboBonus();
        const appliedMult = getComboMultiplier();
        const combinedLi = document.createElement("li");
        combinedLi.className = "earned-bonuses-combined";
        combinedLi.textContent = "Total bonus: " + combinedMult.toFixed(2) + "× (everything earned × combo upgrades × full rhythm; Count/s breakdown uses this factor; live production uses " + appliedMult.toFixed(2) + "× until all earned patterns match your hands and rhythm fills)";
        listEl.appendChild(combinedLi);
        for (let n = 2; n <= 10; n++) {
            if (unlockedHands < n) continue;
            const group = byMinHands[n] || [];
            if (group.length === 0) continue;
            const earnedInGroup = group.filter(c => earnedSet.has(c.name));
            const allEarned = earnedInGroup.length === group.length;
            if (allEarned) {
                const totalMult = earnedInGroup.reduce((m, c) => m * c.bonus, 1);
                const ap = tierLive[n];
                const activePart = ap == null
                    ? "Matching your hands now: —"
                    : "Matching your hands now: ×" + ap.toFixed(2);
                const li = document.createElement("li");
                li.className = "earned-bonuses-summary";
                li.textContent = "All " + n + "-hand patterns discovered · reference ×" + totalMult.toFixed(2) + " (if all could apply at once) · " + activePart;
                listEl.appendChild(li);
            } else {
                group.forEach(c => {
                    const li = document.createElement("li");
                    const isEarned = earnedSet.has(c.name);
                    li.className = isEarned ? "earned-bonus-item-earned" : "earned-bonus-undiscovered";
                    li.textContent = c.name + " (×" + c.bonus.toFixed(2) + ")" + (isEarned ? "" : " — undiscovered");
                    listEl.appendChild(li);
                });
            }
        }
    }

    function refreshGlobalOverviewPanelIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "overview") return;
        pagePanelBodyEl.innerHTML = renderGlobalOverview();
    }
    function patchNumber1AscendControlIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension" || ascensionPageActiveNumber !== 1) return;
        const digest = getNumber1AscendControlLivePatchDigest();
        const control = pagePanelBodyEl.querySelector(".ascension-run-action");
        if (control && control.getAttribute("data-live-patch-digest") === digest) return;
        if (control) control.outerHTML = renderNumber1AscendControlHtml(digest);
    }
    function refreshAscensionPanelIfOpen() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension") return;
        patchNumber1AscendControlIfOpen();
        if (ascensionPageActiveNumber === 1 && (getBlackHolePhase() === 1 || getBlackHolePhase() === 2)) {
            const bhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
            if (bhEl && (patchBlackHolePhase1PanelLiveDom(bhEl) || patchBlackHolePhase2PanelLiveDom(bhEl))) {
                patchAscensionHubStatsPillsDomIfChanged();
                return;
            }
        }
        teardownAscensionMapPanZoom();
        pagePanelBodyEl.innerHTML = renderAscensionPageHtml();
        if (ascensionPageActiveNumber === 1 && number1HasAscended) {
            requestAnimationFrame(() => initAscensionMapPanZoom());
        }
    }
    function refreshOverviewAndAscensionPanelsIfOpen() {
        refreshGlobalOverviewPanelIfOpen();
        refreshAscensionPanelIfOpen();
    }
    /**
     * Overview always patches via refreshGlobalOverviewPanelIfOpen. Ascension: Number 1 tab uses
     * patchAscensionPanelLiveDom (no full body replace). Number 2 tab or missing ascension page skips
     * N1 patch; if ascension is open on tab 2, falls back to refreshAscensionPanelIfOpen.
     * Full innerHTML on the open Number 1 ascension tab was restarting CSS (Phase 3 disk numerals) when
     * triggered from frequent events (claps, warp essence, Number 2 background rolls).
     */
    function refreshOverviewAndAscensionHubLiveIfOpen() {
        refreshGlobalOverviewPanelIfOpen();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension") return;
        if (ascensionPageActiveNumber === 1) {
            patchAscensionPanelLiveDom();
            return;
        }
        refreshAscensionPanelIfOpen();
    }
    /**
     * Game loop calls this ~1/s. Must NOT replace overview innerHTML — only patch overview cards + ascend controls.
     * Ascension hub live updates are in patchAscensionPanelLiveDom.
     */
    function patchGlobalOverviewLiveDom() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "overview") return;
        getUnlockedNumberModules().forEach(function (entry) {
            const card = pagePanelBodyEl.querySelector('.overview-card[data-overview-number="' + entry.number + '"]');
            if (!card) return;
            const m = entry.module;
            const milestone = m.getMilestone();
            const rateStr = formatCount(Math.round(m.getRatePerSec() * 100) / 100) + "/s";
            const pct = Math.max(0, Math.min(100, milestone.pct));
            const stats = card.querySelectorAll(".overview-stat");
            if (stats[0]) {
                const v = stats[0].querySelector(".overview-stat-value");
                if (v && v.textContent !== rateStr) v.textContent = rateStr;
            }
            if (stats[1]) {
                const v = stats[1].querySelector(".overview-stat-milestone-text");
                const fill = stats[1].querySelector(".overview-mini-fill");
                const bar = stats[1].querySelector(".overview-mini-progress");
                const milestoneTxt = milestone.text + " · " + pct.toFixed(1) + "%";
                const pctStr = String(pct.toFixed(1));
                if (v && v.textContent !== milestoneTxt) v.textContent = milestoneTxt;
                if (fill) {
                    const w = pct + "%";
                    if (fill.style.width !== w) fill.style.width = w;
                }
                if (bar && bar.getAttribute("aria-valuenow") !== pctStr) bar.setAttribute("aria-valuenow", pctStr);
            }
            if (stats[2]) {
                const v = stats[2].querySelector(".overview-stat-value");
                const detailsStr = m.getOverviewDetails();
                if (v && v.textContent !== detailsStr) v.textContent = detailsStr;
            }
            if (entry.number === 1) {
                const ascReady = m.isAscensionReady();
                const gainPreviewInfo = ascReady ? computeNumber1AscensionGainBreakdown(totalChanges) : null;
                const gainPreview = gainPreviewInfo ? gainPreviewInfo.finalGain : 0;
                const cell = card.querySelector(".overview-ascension-cell");
                if (cell) {
                    let ascPart = "Ascension: " + (ascReady ? "<span class=\"overview-asc-ready\">Ready</span>" : "Not ready");
                    ascPart += " · Essence: " + formatCount(number1AscensionEssence);
                    if (!ascReady) {
                        ascPart += " · Requirement: " + formatCount(ASCENSION_1_REQUIRED_TOTAL) + " total and " + getNumber1AscensionRequiredHands() + " hands";
                    }
                    if (ascReady) {
                        ascPart += " · Next gain: " + formatCount(gainPreview);
                        if (gainPreviewInfo && gainPreviewInfo.blackHoleMultiplierBonus > 0) {
                            ascPart += " (BH bonus +" + formatCount(gainPreviewInfo.blackHoleMultiplierBonus) + ")";
                        }
                        if (gainPreviewInfo && gainPreviewInfo.multiplierBonus > 0) {
                            ascPart += " (clap mult +" + formatCount(gainPreviewInfo.multiplierBonus) + ")";
                        }
                        ascPart += " <button type=\"button\" class=\"page-btn ascend-number-btn\" data-number=\"1\">Ascend Number 1</button>";
                    }
                    if (number1HasAscended) {
                        ascPart += " <button type=\"button\" class=\"page-btn overview-open-ascension-btn\" data-open-ascension>Skill tree</button>";
                    }
                    if (cell.dataset.overviewAscSnap !== ascPart) {
                        cell.innerHTML = ascPart;
                        cell.dataset.overviewAscSnap = ascPart;
                    }
                }
            }
            if (entry.number === 2) {
                const ascReady = m.isAscensionReady();
                const cell = card.querySelector(".overview-ascension-cell");
                if (cell) {
                    let ascPart = "Ascension: " + (ascReady ? "<span class=\"overview-asc-ready\">Ready</span>" : "Not ready");
                    if (!number2State.started) ascPart = "Ascension: inactive — switch to Number 2 in the sidebar to begin.";
                    ascPart += " · Luck essence: " + formatCount(number2State.ascensionEssence || 0);
                    if (number2State.started) {
                        if (ascReady) {
                            ascPart += " <button type=\"button\" class=\"page-btn overview-open-ascension-n2-btn\" data-open-ascension-n2>Luck table</button>";
                        } else {
                            ascPart += " · Gate: Number 2 total ≥ " + formatCount(NUMBER2_ASCENSION_READY_TOTAL) + ".";
                        }
                    }
                    if (cell.dataset.overviewAscSnap !== ascPart) {
                        cell.innerHTML = ascPart;
                        cell.dataset.overviewAscSnap = ascPart;
                    }
                }
            }
        });
    }
    function patchAscensionPanelLiveDom() {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension") return;
        if (ascensionPageActiveNumber !== 1) return;
        patchNumber1AscendControlIfOpen();
        if (isBlackHoleArcUnlocked() && getBlackHolePhase() >= 1) {
            refreshBlackHolePanelLiveDomIfOpen();
            return;
        }
        patchAscensionHubStatsPillsDomIfChanged();
        if (typeof updateAscensionMapDetailPanel === "function") updateAscensionMapDetailPanel();
    }

    function performNumber1Ascension() {
        if (!isNumber1AscensionReady()) return;
        const gainInfo = computeNumber1AscensionGainBreakdown(totalChanges);
        const baseGain = gainInfo.baseGain;
        const bonusGain = gainInfo.pendingBonus;
        const blackHoleBonusGain = gainInfo.blackHoleMultiplierBonus;
        const multBonusGain = gainInfo.multiplierBonus;
        const gain = gainInfo.finalGain;
        number1AscensionEssence += gain;
        number1BlackHoleState.phase6JetBestAscensionEssence = Math.max(number1BlackHoleState.phase6JetBestAscensionEssence || 0, gain);
        number1AscensionPendingBonusEssence = 0;
        number1AscensionClapEssenceMultiplier = 1;
        number1AscensionClapEssenceProcCount = 0;
        number1HasAscended = true;
        updateNumber2SidebarUnlockUI();

        shrinkSpeedRowsTo(1);
        while (hands.length > 1) {
            const h = hands.pop();
            if (h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
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
        slowdownUnlockLogged = false;
        timeWarpAuraActiveByHand = [];
        timeWarpAuraAppearedAtMsByHand = [];
        timeWarpNextSpawnInSec = 0;
        timeWarpUnlockLogged = false;
        {
            const autobuyDefaultAsc = ascensionAutobuyDefaultOnForNewHands();
            autoBuyUnlocked = autobuyDefaultAsc;
            autoBuyEnabledByHand = [autobuyDefaultAsc];
        }
        autoBuyCountdownSecondsByHand = [0];
        cheapenSectionUnlocked = false;
        cheapenAutoBuyCountdownByHand = [];
        slowdownAutoBuyCountdownByHand = [];

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

        earnedComboNames.length = 0;
        comboActivationCounts = {};
        comboIndexStatusFilter = "all";
        comboIndexHandsFilter = "all";
        previousTickActiveComboNames = new Set();
        comboSustainPrimaryName = null;
        comboSustainAccumulator = 0;
        comboRunBonusRampAccumulator = 0;
        objectives.forEach(o => { o.achieved = false; });

        const h0 = hands[0];
        if (h0) {
            h0.count = 1;
            h0.tickAccBig = 0n;
            if (h0.el && speedRowRefs[0] && speedRowRefs[0].handMountEl && h0.el.parentNode !== speedRowRefs[0].handMountEl) {
                speedRowRefs[0].handMountEl.appendChild(h0.el);
            }
            h0.render();
        }

        refreshTotalFromHandEarnings();
        if (upgradeContainer && totalChanges < 10) upgradeContainer.classList.remove("show-upgrade-content");

        incrementalEl.textContent = formatCount(totalChanges);
        ensureSpeedRows();
        updateObjectives();
        updateMilestoneUI();
        updateSpeedUpgradeUI();
        updateCheapenUpgradeUI();
        updateSlowdownUpgradeUI();
        updateTimeWarpAuraUI();
        updateRateDisplay();
        updateTurboBoostUI();
        updateComboUI();
        updateEarnedBonusesUI();
        updatePageButtonUnlocks();
        refreshOverviewAndAscensionPanelsIfOpen();
        const gainParts = bonusGain > 0
            ? (formatCount(baseGain) + " base + " + formatCount(bonusGain) + " bonus")
            : (formatCount(baseGain) + " base");
        const bhPart = blackHoleBonusGain > 0 ? (" + " + formatCount(blackHoleBonusGain) + " BH bonus") : "";
        const multPart = multBonusGain > 0 ? (" + " + formatCount(multBonusGain) + " clap multiplier") : "";
        addToLog("Ascended Number 1 — +" + formatCount(gain) + " Ascension Essence (" + gainParts + bhPart + multPart + "; total " + formatCount(number1AscensionEssence) + ")", "milestone");
        markMeaningfulProgress();
        autosaveNow();
    }

    function showAscensionConfirmDialog() {
        if (!ascensionConfirmOverlayEl || !ascensionConfirmBodyEl) return;
        const gainInfo = computeNumber1AscensionGainBreakdown(totalChanges);
        const baseGain = gainInfo.baseGain;
        const bonusGain = gainInfo.pendingBonus;
        const blackHoleBonusGain = gainInfo.blackHoleMultiplierBonus;
        const multBonusGain = gainInfo.multiplierBonus;
        const gain = gainInfo.finalGain;
        const nextTotal = number1AscensionEssence + gain;
        const gainBits = ["base " + formatCount(baseGain)];
        if (bonusGain > 0) gainBits.push("warp bonus " + formatCount(bonusGain));
        if (blackHoleBonusGain > 0) gainBits.push("BH bonus +" + formatCount(blackHoleBonusGain) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)");
            if (gainInfo.blackHoleFurnaceBonus > 0) gainBits.push("furnace +" + gainInfo.blackHoleFurnaceBonus.toFixed(2) + "x");
        if (multBonusGain > 0) gainBits.push("clap mult +" + formatCount(multBonusGain) + " (" + gainInfo.clapMult.toFixed(3) + "x)");
        const bonusLine = gainBits.length > 1 ? (" (" + gainBits.join(" + ") + ")") : "";
        ascensionConfirmBodyEl.textContent = "Your total count is " + formatCount(totalChanges) + ". Ascending now grants " + formatCount(gain) + " Ascension Essence" + bonusLine + " (you will have " + formatCount(nextTotal) + " total).\n\nThis resets Number 1 only: one hand, no upgrades, no combo bonuses, objectives unchecked, turbo reset.\n\nSpend Essence on permanent skill branches in Ascension. Respec is always free.";
        ascensionConfirmOverlayEl.style.display = "flex";
    }

    function maybeShowFirstAscensionIntroOnUnlock() {
        if (ascensionNumber1IntroSeen) return;
        if (!isNumber1AscensionReady()) return;
        if (!ascensionIntroOverlayEl) return;
        if (gameplaySimFrozen()) return;
        ascensionNumber1IntroSeen = true;
        gamePaused = true;
        ascensionIntroOverlayEl.style.display = "flex";
        autosaveNow();
    }

    function beginNumber1AscensionFlow() {
        if (!isNumber1AscensionReady()) return;
        gamePaused = true;
        showAscensionConfirmDialog();
    }

    function applyAscensionComboPulseProduction(active) {
        const frac = computeAscensionGrantTotals().comboTriggerProductionFrac;
        if (frac <= 0 || !active || active.length === 0) return;
        const newlyPulsing = active.filter(c => !previousTickActiveComboNames.has(c.name));
        if (newlyPulsing.length === 0) return;
        const cpsPerHand = getRawCpsPerHand();
        const rawCps = cpsPerHand.reduce((a, b) => a + b, 0);
        if (rawCps <= 0) return;
        const totalCps = rawCps * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult();
        const v = getHandValues();
        let any = false;
        newlyPulsing.forEach(combo => {
            const idxs = getComboParticipatingHandIndices(combo, v);
            const nPart = Math.max(1, idxs.length);
            const per = (totalCps * frac) / nPart;
            idxs.forEach(i => {
                if (i < 0 || i >= unlockedHands) return;
                handEarnings[i] = (handEarnings[i] || 0) + per;
                any = true;
            });
        });
        if (any) {
            refreshTotalFromHandEarnings();
            if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
        }
    }

    function updateComboUI() {
        if (unlockedHands < 2) return;
        const active = getActiveCombos();
        const newlyPulsingEdge = active.filter(c => !previousTickActiveComboNames.has(c.name));
        newlyPulsingEdge.forEach(c => {
            comboActivationCounts[c.name] = (comboActivationCounts[c.name] || 0) + 1;
        });
        if (newlyPulsingEdge.length > 0) applyAscensionComboTimeWarpDelayReduction(newlyPulsingEdge.length);
        updateComboSustainState(active);
        {
            const rampTick = computeAscensionGrantTotals().comboRunBonusAddPerTick || 0;
            if (active.length > 0 && rampTick > 0) {
                comboRunBonusRampAccumulator += rampTick;
            }
        }
        if (active.length > 0) applyAscensionComboPulseProduction(active);
        const newlyEarned = active.filter(c => earnedComboNames.indexOf(c.name) === -1).sort((a, b) => {
            if (b.minHands !== a.minHands) return b.minHands - a.minHands;
            if (b.bonus !== a.bonus) return b.bonus - a.bonus;
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        if (newlyEarned.length > 0) {
            newlyEarned.forEach(c => earnedComboNames.push(c.name));
            newlyEarned.forEach(c => addToLog("Discovered combo: " + c.name + " (x" + c.bonus.toFixed(2) + ")", "milestone"));
            markMeaningfulProgress();
            showComboBubble(newlyEarned);
            pulseCombinationsPageButtonForNewBonus();
            updateEarnedBonusesUI();
        }
        if (turboBoostUnlocked && active.length > 0) {
            const activeNames = new Set(active.map(c => c.name));
            active.forEach(c => {
                if (!previousTickActiveComboNames.has(c.name)) {
                    addTurboBoostMeter(getTurboComboPoints(c.minHands));
                }
            });
            previousTickActiveComboNames = activeNames;
        } else {
            previousTickActiveComboNames = new Set(active.map(c => c.name));
        }
        refreshCombinationsPanelIfOpen();
    }

    const CLAP_UNLOCK_HANDS = 8;
    const CLAP_BONUS_CHANCE = 0.1;
    const CLAP_MAX_PAIRS_PER_TICK = 2;
    const CLAP_ANIM_STAGGER_MS = 220;
    const CLAP_COOLDOWN_MS = 10000;
    /** Middle-branch Combo Claps: fixed 10% per roll (ascension nodes gate which rolls exist). */
    const COMBO_CLAP_INSTANT_CHANCE = 0.1;
    const COMBO_CLAP_CHAIN_MAX_WAVES = 64;
    const CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES = 64;
    const CLAP_BONUS_SLOWDOWN_CHAIN_MAX_WAVES = 64;
    function getClapCooldownMs() {
        const m = computeAscensionGrantTotals().clapCooldownMult || 1;
        return Math.max(2500, Math.floor(CLAP_COOLDOWN_MS * m));
    }
    function getClapBonusChance() {
        return Math.min(0.95, CLAP_BONUS_CHANCE + (computeAscensionGrantTotals().clapBonusChanceAdd || 0));
    }
    function isClappingUnlocked() {
        return unlockedHands >= CLAP_UNLOCK_HANDS;
    }
    function getClapCheapenBonusChance() {
        return Math.min(0.95, Math.max(0, computeAscensionGrantTotals().clapCheapenBonusChanceAdd || 0));
    }
    function getClapSlowdownBonusChance() {
        return Math.min(0.95, Math.max(0, computeAscensionGrantTotals().clapSlowdownBonusChanceAdd || 0));
    }
    function getClapEssenceProcChance() {
        return Math.min(0.95, Math.max(0, computeAscensionGrantTotals().clapEssenceProcChanceAdd || 0));
    }
    function getClapEssenceProcMultiplierStep() {
        const step = Number(computeAscensionGrantTotals().clapEssenceMultiplierStepAdd) || 0;
        return Math.max(0, step);
    }
    function maybeRunThumbClapChain(extraUnlocked, chainUnlocked, maxWaves, onWave) {
        if (!extraUnlocked || typeof onWave !== "function") return;
        if (Math.random() >= COMBO_CLAP_INSTANT_CHANCE) return;
        let waves = 0;
        while (waves < maxWaves) {
            onWave();
            waves++;
            if (!chainUnlocked || Math.random() >= COMBO_CLAP_INSTANT_CHANCE) break;
        }
    }
    function grantClapBonusCheapenLevelForHand(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        cheapenBonusLevel[handIndex] = (cheapenBonusLevel[handIndex] || 0) + 1;
    }
    function grantClapBonusSlowdownLevelForHand(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        slowdownBonusLevel[handIndex] = (slowdownBonusLevel[handIndex] || 0) + 1;
        // Same functional reset behavior as buying a slowdown level: purchased speed levels are reset.
        speedLevel[handIndex] = 0;
        const h = hands[handIndex];
        if (h) h.tickAccBig = 0n;
    }
    function tryGrantClapEssenceMultiplierForHand(handIndex) {
        if (handIndex < 0 || handIndex >= unlockedHands) return false;
        const chance = getClapEssenceProcChance();
        if (!(chance > 0) || Math.random() >= chance) return false;
        const step = getClapEssenceProcMultiplierStep();
        if (!(step > 0)) return false;
        number1AscensionClapEssenceMultiplier *= 1 + step;
        number1AscensionClapEssenceProcCount++;
        return true;
    }
    function rollClapSpeedBonusesForPairHands(a, b, bonusHandsOneIndexed, logIfNeitherMiss) {
        let bonusA = false;
        let bonusB = false;
        if (Math.random() < getClapBonusChance()) {
            speedBonusLevel[a] = (speedBonusLevel[a] || 0) + 1;
            bonusHandsOneIndexed.push(a + 1);
            if (hands[a]) hands[a].tickAccBig = 0n;
            bonusA = true;
        }
        if (Math.random() < getClapBonusChance()) {
            speedBonusLevel[b] = (speedBonusLevel[b] || 0) + 1;
            bonusHandsOneIndexed.push(b + 1);
            if (hands[b]) hands[b].tickAccBig = 0n;
            bonusB = true;
        }
        if (logIfNeitherMiss && !bonusA && !bonusB) {
            addToLog("Clap! Hand " + (a + 1) + " and Hand " + (b + 1) + "—no bonus this time. Better luck next round.", "tip");
        }
    }
    function maybeComboClapChainFromAscension(a, b, staggerStartMs, bonusHandsOneIndexed) {
        const asc = computeAscensionGrantTotals();
        if (!asc.comboClapExtraRoll || Math.random() >= COMBO_CLAP_INSTANT_CHANCE) return;
        let staggerMs = staggerStartMs;
        let chainCount = 0;
        while (true) {
            staggerMs += CLAP_ANIM_STAGGER_MS;
            playClapScreenAnimation(a, b, staggerMs);
            rollClapSpeedBonusesForPairHands(a, b, bonusHandsOneIndexed, false);
            chainCount++;
            if (!asc.comboClapChainRolls || chainCount >= COMBO_CLAP_CHAIN_MAX_WAVES) break;
            if (Math.random() >= COMBO_CLAP_INSTANT_CHANCE) break;
        }
    }
    function playClapScreenAnimation(handIndexA, handIndexB, staggerDelayMs) {
        function clapFxShouldDisplay() {
            if (settings.showClapAnimation === false) return false;
            if (typeof window.getCurrentNumberMode === "function" && window.getCurrentNumberMode() !== 1) return false;
            if (isPagePanelOpen() && pagePanelEl && (pagePanelEl.dataset.openPageId === "overview" || pagePanelEl.dataset.openPageId === "ascension")) return false;
            return true;
        }
        if (!clapFxShouldDisplay()) return;
        const root = document.getElementById("clap-animation-root");
        if (!root) return;
        const art5 = hands1[4];
        window.setTimeout(() => {
            if (!clapFxShouldDisplay()) return;
            const wrap = document.createElement("div");
            wrap.className = "clap-fx-burst";
            wrap.setAttribute("role", "presentation");
            wrap.style.setProperty("--clap-nudge-a", ((handIndexA * 7) % 24 - 12) + "px");
            wrap.style.setProperty("--clap-nudge-b", ((handIndexB * 11) % 24 - 12) + "px");
            const preL = document.createElement("pre");
            preL.className = "clap-fx-pre";
            preL.textContent = art5;
            const preR = document.createElement("pre");
            preR.className = "clap-fx-pre";
            preR.textContent = art5;
            const ha = document.createElement("div");
            ha.className = "clap-fx-hand clap-fx-hand--a";
            ha.appendChild(preL);
            const hb = document.createElement("div");
            hb.className = "clap-fx-hand clap-fx-hand--b";
            hb.appendChild(preR);
            wrap.appendChild(ha);
            wrap.appendChild(hb);
            root.appendChild(wrap);
            window.setTimeout(() => { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 1100);
        }, staggerDelayMs);
    }
    function processClappingThisTick() {
        if (!isClappingUnlocked() || gameplaySimFrozen()) return;
        const nowMs = Date.now();
        function handOffClapCooldown(handIndex) {
            const until = clapCooldownUntilMsByHand[handIndex] || 0;
            return nowMs >= until;
        }
        const current = [];
        for (let i = 0; i < unlockedHands; i++) current[i] = hands[i] ? hands[i].count : 0;
        const fives = [];
        for (let i = 0; i < unlockedHands; i++) {
            if (current[i] === 5) fives.push(i);
        }
        fives.sort((a, b) => a - b);
        const usedFiveSlot = new Array(fives.length).fill(false);
        let clapPairsThisTick = 0;
        let stagger = 0;
        const bonusHandsOneIndexed = [];
        const cheapenBonusHandsOneIndexed = [];
        const slowdownBonusHandsOneIndexed = [];
        let essenceProcCountThisTick = 0;
        const asc = computeAscensionGrantTotals();
        for (let ia = 0; ia < fives.length && clapPairsThisTick < CLAP_MAX_PAIRS_PER_TICK; ia++) {
            if (usedFiveSlot[ia]) continue;
            const a = fives[ia];
            for (let ib = ia + 1; ib < fives.length; ib++) {
                if (usedFiveSlot[ib]) continue;
                const b = fives[ib];
                const heldFromLastFrame = clapDigitPrevious[a] === 5 && clapDigitPrevious[b] === 5;
                // Both hands must be off cooldown; a cooling-down hand never claps with a ready hand.
                if (!heldFromLastFrame && handOffClapCooldown(a) && handOffClapCooldown(b)) {
                    usedFiveSlot[ia] = true;
                    usedFiveSlot[ib] = true;
                    clapPairsThisTick++;
                    playClapScreenAnimation(a, b, stagger);
                    stagger += CLAP_ANIM_STAGGER_MS;
                    const clapCd = getClapCooldownMs();
                    clapCooldownUntilMsByHand[a] = nowMs + clapCd;
                    clapCooldownUntilMsByHand[b] = nowMs + clapCd;
                    rollClapSpeedBonusesForPairHands(a, b, bonusHandsOneIndexed, true);
                    [a, b].forEach(handIndex => {
                        if (Math.random() < getClapCheapenBonusChance()) {
                            grantClapBonusCheapenLevelForHand(handIndex);
                            cheapenBonusHandsOneIndexed.push(handIndex + 1);
                            maybeRunThumbClapChain(
                                asc.clapCheapenExtraRoll,
                                asc.clapCheapenChainRolls,
                                CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES,
                                () => {
                                    grantClapBonusCheapenLevelForHand(handIndex);
                                    cheapenBonusHandsOneIndexed.push(handIndex + 1);
                                }
                            );
                        }
                        if (Math.random() < getClapSlowdownBonusChance()) {
                            grantClapBonusSlowdownLevelForHand(handIndex);
                            slowdownBonusHandsOneIndexed.push(handIndex + 1);
                            maybeRunThumbClapChain(
                                asc.clapSlowdownExtraRoll,
                                asc.clapSlowdownChainRolls,
                                CLAP_BONUS_SLOWDOWN_CHAIN_MAX_WAVES,
                                () => {
                                    grantClapBonusSlowdownLevelForHand(handIndex);
                                    slowdownBonusHandsOneIndexed.push(handIndex + 1);
                                }
                            );
                        }
                        if (tryGrantClapEssenceMultiplierForHand(handIndex)) essenceProcCountThisTick++;
                    });
                    maybeComboClapChainFromAscension(a, b, stagger, bonusHandsOneIndexed);
                    break;
                }
            }
        }
        for (let i = 0; i < unlockedHands; i++) clapDigitPrevious[i] = current[i];
        const hadClapBonusEvent = bonusHandsOneIndexed.length > 0 || cheapenBonusHandsOneIndexed.length > 0 || slowdownBonusHandsOneIndexed.length > 0 || essenceProcCountThisTick > 0;
        if (hadClapBonusEvent) {
            markMeaningfulProgress();
            const bits = [];
            if (bonusHandsOneIndexed.length > 0) bits.push("bonus speed on " + bonusHandsOneIndexed.map(n => "Hand " + n).join(", "));
            if (cheapenBonusHandsOneIndexed.length > 0) bits.push("bonus cheapen on " + cheapenBonusHandsOneIndexed.map(n => "Hand " + n).join(", "));
            if (slowdownBonusHandsOneIndexed.length > 0) bits.push("bonus slowdown on " + slowdownBonusHandsOneIndexed.map(n => "Hand " + n).join(", "));
            if (essenceProcCountThisTick > 0) {
                bits.push("essence multiplier proc ×" + essenceProcCountThisTick + " (now " + getNumber1AscensionClapEssenceMultiplier().toFixed(3) + "x)");
            }
            addToLog("Clap! " + bits.join(" · ") + ".", "tip");
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
            updateMilestoneUI();
            refreshOverviewAndAscensionHubLiveIfOpen();
        }
    }

    function runGameLoopStep() {
        const dt = GAME_LOOP_MS;
        const dtSec = GAME_LOOP_MS / 1000;
        tickBackgroundNumberModules(dtSec);
        updateBlackHolePhaseStep(dtSec);
        syncBlackHolePhase1Vfx();
        const mode = typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1;
        if (mode === 2 && isNumber2Unlocked() && number2State.started) {
            runNumber2GameLoopStep(dtSec);
            return;
        }
        if (getBlackHolePhase() === 7) {
            totalChanges = Math.floor(number1BlackHoleState.phase7EpilogueCounter || 0);
            handEarnings[0] = totalChanges;
            if (incrementalCountLabelEl) incrementalCountLabelEl.textContent = "Epilogue Count";
            if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
            updateRateDisplay();
            updateMilestoneUI();
            return;
        }
        updateTimeWarpSystem(dtSec);
        const ticksPerHand = Array(unlockedHands).fill(0);
        // Hands with the same speed multiplier share one tick phase and the same 1–10 digit
        // so pair-style combos stay achievable (stable bucket key: mult is an exact power of 2).
        // Slowdown only scales tick *value* per hand (see effectiveTicksPerHand); cadence follows Speed.
        const buckets = new Map();
        hands.forEach(h => {
            const handIndex = h.id - 1;
            if (handIndex < 0 || handIndex >= unlockedHands) return;
            const mult = getSpeedMultiplier(handIndex);
            const baseSpeed = (Number.isFinite(h.baseSpeed) && h.baseSpeed > 0) ? h.baseSpeed : HAND_BASE_SPEED;
            const intervalMs = getTickIntervalMs(baseSpeed, handIndex);
            if (intervalMs <= 0) return;
            const bucketKey = String(mult);
            if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
            buckets.get(bucketKey).push(h);
        });
        buckets.forEach((groupHands) => {
            groupHands.sort((a, b) => a.id - b.id);
            const leader = groupHands[0];
            const handIndexLeader = leader.id - 1;
            const levelEff = getEffectiveSpeedLevel(handIndexLeader);
            const multBig = getSpeedMultiplierBigForLevel(levelEff);
            const baseSpeed = (Number.isFinite(leader.baseSpeed) && leader.baseSpeed > 0) ? leader.baseSpeed : HAND_BASE_SPEED;
            const intervalMs = getTickIntervalMs(baseSpeed, handIndexLeader);
            if (intervalMs <= 0) return;
            const alignedCount = leader.count;
            let acc = leader.tickAccBig != null ? leader.tickAccBig : 0n;
            acc += BigInt(dt) * multBig;
            const ticksBig = acc / 1000n;
            acc %= 1000n;
            const ticksFloat = Number(ticksBig);
            const ticksNum = Number.isFinite(ticksFloat) ? ticksFloat : BLACK_HOLE_EVAPORATION_CAP;
            let targetCount = alignedCount;
            if (ticksBig > 0n) {
                const tMod = Number(ticksBig % 10n);
                targetCount = ((alignedCount - 1 + tMod) % 10 + 10) % 10 + 1;
            }
            groupHands.forEach(h => {
                h.count = targetCount;
                h.tickAccBig = acc;
                ticksPerHand[h.id - 1] = ticksNum;
                h.render();
            });
        });
        processClappingThisTick();
        const totalTicks = ticksPerHand.reduce((a, b) => a + b, 0);
        if (totalChanges >= TURBO_UNLOCK_COUNT) {
            let turboScensionAutobuyDidUpgrade = false;
            if (turboBoostUnlocked) {
                if (turboBoostEnabled && turboBoostMeter > 0) turboActivationCount++;
                updateTurboBurn(dtSec);
                applyTurboPassiveMeterRegen(dtSec);
            }
            if (isTurboScensionUpgradeAutobuyUnlocked()) {
                while (!gameplaySimFrozen() && tryTurboScensionActivationUpgrade({ skipLog: true, skipAutosave: true, skipUIUpdate: true })) {
                    turboScensionAutobuyDidUpgrade = true;
                }
                if (turboScensionAutobuyDidUpgrade) autosaveNow();
            }
            updateTurboBoostUI();
            if (turboScensionAutobuyDidUpgrade) updateRateDisplay();
        }
        updateComboUI();
        if (totalTicks > 0) {
            const comboMult = getComboMultiplier();
            const turboMult = getTurboCountMultiplier();
            const effectiveTicksPerHand = ticksPerHand.map((t, i) => t * getSlowdownMultiplier(i));
            const totalEffectiveTicks = effectiveTicksPerHand.reduce((a, b) => a + b, 0);
            if (totalEffectiveTicks > 0) {
                const bhMult = getNumber1BlackHoleProductionMult();
                const rawBonusTicks = totalEffectiveTicks * comboMult * turboMult * bhMult;
                const bonusTicks = Number.isFinite(rawBonusTicks) ? Math.max(0, Math.min(BLACK_HOLE_EVAPORATION_CAP, Math.round(rawBonusTicks))) : BLACK_HOLE_EVAPORATION_CAP;
                for (let i = 0; i < unlockedHands; i++) {
                    handEarnings[i] += Math.round((effectiveTicksPerHand[i] / totalEffectiveTicks) * bonusTicks);
                }
            }
            refreshTotalFromHandEarnings();
            incrementalEl.textContent = formatCount(totalChanges);
            updateObjectives();
            maybeShowFirstAscensionIntroOnUnlock();
            maybeAutoBuySpeedUpgrade();
            maybeAutoBuyCheapen();
            maybeAutoBuySlowdown();
            const now = Date.now();
            if (now - lastUIUpdateMs >= UI_UPDATE_THROTTLE_MS || batchedUpgradeUiFlush) {
                if (now - lastUIUpdateMs >= UI_UPDATE_THROTTLE_MS) lastUIUpdateMs = now;
                if (batchedUpgradeUiFlush) batchedUpgradeUiFlush = false;
                updateSpeedUpgradeUI();
                updateCheapenUpgradeUI();
                updateSlowdownUpgradeUI();
                updateTimeWarpAuraUI();
                updateRateDisplay({ throttleCpsHeadline: true });
            }
        }
    }

    let lastUIUpdateMs = 0;
    let lastOverviewUpdateMs = 0;
    const OVERVIEW_PANEL_LIVE_PATCH_MS = 1000;
    const UI_UPDATE_THROTTLE_MS = 150;
    /** When autobuy / warp-assist skips per-purchase upgrade DOM, flush once this step (or with the normal throttle). */
    let batchedUpgradeUiFlush = false;

    function gameLoopTick() {
        if (gameplaySimFrozen()) {
            lastGameLoopPerfMs = null;
            simLagMs = 0;
            return;
        }
        const perfNow = performance.now();
        let elapsed = lastGameLoopPerfMs != null ? perfNow - lastGameLoopPerfMs : GAME_LOOP_MS;
        lastGameLoopPerfMs = perfNow;
        if (!Number.isFinite(elapsed) || elapsed < 0) elapsed = GAME_LOOP_MS;
        elapsed = Math.min(elapsed, GAME_LOOP_MAX_ELAPSED_MS);
        simLagMs += elapsed;
        if (simLagMs > GAME_LOOP_MAX_LAG_MS) simLagMs = GAME_LOOP_MAX_LAG_MS;
        let catchUpSteps = 0;
        while (simLagMs >= GAME_LOOP_MS && catchUpSteps < GAME_LOOP_MAX_CATCHUP_STEPS) {
            runGameLoopStep();
            simLagMs -= GAME_LOOP_MS;
            catchUpSteps++;
        }
        const nowOverview = Date.now();
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
    if (!gameLoopTimer) gameLoopTimer = setInterval(gameLoopTick, GAME_LOOP_MS);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) beginHiddenOfflineTracking();
        else endHiddenOfflineTracking();
    });

    setInterval(() => {
        if (gameplaySimFrozen()) return;
        const source = LOG_MESSAGE_ENTRIES.filter(e => isLogCategoryVisible(e.category));
        if (source.length === 0) return;
        const allowed = source.filter(e => !recentRandomLogMessages.includes(e.text));
        const pool = allowed.length > 0 ? allowed : source;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setAmbientMessage(pick);
        recentRandomLogMessages.push(pick.text);
        if (recentRandomLogMessages.length > RECENT_RANDOM_LOG_COUNT) recentRandomLogMessages.shift();
    }, 20000);

    setTimeout(() => {
        const first = LOG_MESSAGE_ENTRIES[0];
        if (first) setAmbientMessage(first);
    }, 2000);
    setInterval(() => {
        maybeEmitAdaptiveTip(Date.now());
    }, 2000);

    if (speedUpgradesContainerEl) {
        function positionTooltipForButton(btn) {
            const tip = btn && btn.querySelector(".upgrade-details-tooltip");
            if (!tip) return;
            const prevDisplay = tip.style.display;
            const prevVisibility = tip.style.visibility;
            const hiddenByCss = getComputedStyle(tip).display === "none";
            if (hiddenByCss) {
                tip.style.visibility = "hidden";
                tip.style.display = "block";
            }
            const margin = 8;
            const btnRect = btn.getBoundingClientRect();
            const tipRect = tip.getBoundingClientRect();
            let left = btnRect.left;
            if (left + tipRect.width > window.innerWidth - margin) left = window.innerWidth - margin - tipRect.width;
            if (left < margin) left = margin;
            let top = btnRect.bottom + 8;
            if (top + tipRect.height > window.innerHeight - margin) {
                top = btnRect.top - tipRect.height - 8;
            }
            if (top < margin) top = margin;
            tip.style.left = Math.round(left) + "px";
            tip.style.top = Math.round(top) + "px";
            if (hiddenByCss) {
                tip.style.display = prevDisplay;
                tip.style.visibility = prevVisibility;
            }
        }
        function positionVisibleTooltips() {
            speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open, .upgrade-btn:hover, .upgrade-btn:focus-within").forEach(positionTooltipForButton);
        }
        function onWindowScrollResizeForUpgrades() {
            positionVisibleTooltips();
            scheduleHandUpgradeScrollHintUpdate();
        }
        speedUpgradesContainerEl.addEventListener("mouseover", function(e) {
            const btn = e.target.closest(".upgrade-btn");
            if (!btn) return;
            requestAnimationFrame(() => positionTooltipForButton(btn));
        });
        speedUpgradesContainerEl.addEventListener("focusin", function(e) {
            const btn = e.target.closest(".upgrade-btn");
            if (!btn) return;
            requestAnimationFrame(() => positionTooltipForButton(btn));
        });
        window.addEventListener("resize", onWindowScrollResizeForUpgrades);
        window.addEventListener("scroll", onWindowScrollResizeForUpgrades, true);
        window.addEventListener("pointerup", function () {
            stopUpgradeHoldRepeat(true);
        }, true);
        window.addEventListener("pointercancel", function () {
            stopUpgradeHoldRepeat(true);
        }, true);
        speedUpgradesContainerEl.addEventListener("pointerdown", function (e) {
            if (e.button != null && e.button !== 0) return;
            const speedBtn = e.target.closest(".speed-upgrade-btn");
            const cheapenBtn = e.target.closest(".cheapen-upgrade-btn");
            const slowdownBtn = e.target.closest(".slowdown-upgrade-btn");
            const btn = speedBtn || cheapenBtn || slowdownBtn;
            if (!btn) return;
            if (btn.disabled) return;
            const handIndex = parseInt(btn.getAttribute("data-hand-index"), 10);
            if (isNaN(handIndex) || handIndex < 0 || handIndex >= unlockedHands) return;
            e.preventDefault();
            stopUpgradeHoldRepeat(false);
            upgradeHoldSuppressClickBtn = null;
            let buyFn;
            if (speedBtn) {
                buyFn = function () {
                    buySpeedUpgradeForHand(handIndex, { confettiOrigin: btn });
                };
            } else if (cheapenBtn) {
                buyFn = function () {
                    buyCheapenUpgradeForHand(handIndex, btn);
                };
            } else {
                buyFn = function () {
                    buySlowdownUpgradeForHand(handIndex, btn);
                };
            }
            buyFn();
            let firstTick = true;
            const intervalId = setInterval(function () {
                if (firstTick) {
                    firstTick = false;
                    if (!upgradeHoldRepeatTipLogged) {
                        upgradeHoldRepeatTipLogged = true;
                        addToLog("Hold the mouse (or finger) on Speed, Cheapen, or Slowdown to buy upgrades one after another while you have enough currency.", "tip");
                    }
                }
                buyFn();
            }, UPGRADE_HOLD_REPEAT_MS);
            upgradeHoldRepeatState = { intervalId: intervalId, buttonEl: btn };
        }, true);
        speedUpgradesContainerEl.addEventListener("click", function(e) {
            const suppressSpeed = e.target.closest(".speed-upgrade-btn");
            const suppressCheap = e.target.closest(".cheapen-upgrade-btn");
            const suppressSlow = e.target.closest(".slowdown-upgrade-btn");
            const suppressBtn = suppressSpeed || suppressCheap || suppressSlow;
            if (suppressBtn && upgradeHoldSuppressClickBtn === suppressBtn) {
                upgradeHoldSuppressClickBtn = null;
                return;
            }
            const auraBtn = e.target.closest(".time-warp-aura-btn");
            if (auraBtn) {
                const handIndex = parseInt(auraBtn.getAttribute("data-hand-index"), 10);
                if (!isNaN(handIndex)) {
                    ensureTimeWarpArrays();
                    const willActivate = isTimeWarpUnlocked() && !!timeWarpAuraActiveByHand[handIndex];
                    if (willActivate) playTimeWarpScreenEffect(auraBtn);
                    activateTimeWarpAuraForHand(handIndex);
                }
                return;
            }
            const btn = e.target.closest(".speed-upgrade-btn");
            if (btn) {
                if (btn.disabled) {
                    const wasOpen = btn.classList.contains("tooltip-open");
                    speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
                    if (!wasOpen) {
                        btn.classList.add("tooltip-open");
                        requestAnimationFrame(() => positionTooltipForButton(btn));
                    }
                    return;
                }
                const handIndex = parseInt(btn.getAttribute("data-hand-index"), 10);
                if (!isNaN(handIndex)) buySpeedUpgradeForHand(handIndex, { confettiOrigin: btn });
                return;
            }
            const cheapenBtn = e.target.closest(".cheapen-upgrade-btn");
            if (cheapenBtn) {
                if (cheapenBtn.disabled) {
                    const wasOpen = cheapenBtn.classList.contains("tooltip-open");
                    speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
                    if (!wasOpen) {
                        cheapenBtn.classList.add("tooltip-open");
                        requestAnimationFrame(() => positionTooltipForButton(cheapenBtn));
                    }
                    return;
                }
                const handIndex = parseInt(cheapenBtn.getAttribute("data-hand-index"), 10);
                if (!isNaN(handIndex)) buyCheapenUpgradeForHand(handIndex, cheapenBtn);
                return;
            }
            const slowdownBtn = e.target.closest(".slowdown-upgrade-btn");
            if (slowdownBtn) {
                if (slowdownBtn.disabled) {
                    const wasOpen = slowdownBtn.classList.contains("tooltip-open");
                    speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
                    if (!wasOpen) {
                        slowdownBtn.classList.add("tooltip-open");
                        requestAnimationFrame(() => positionTooltipForButton(slowdownBtn));
                    }
                    return;
                }
                const handIndex = parseInt(slowdownBtn.getAttribute("data-hand-index"), 10);
                if (!isNaN(handIndex)) buySlowdownUpgradeForHand(handIndex, slowdownBtn);
            }
        });
        speedUpgradesContainerEl.addEventListener("change", function(e) {
            const cb = e.target.closest(".speed-autobuy-toggle");
            if (!cb) return;
            const i = parseInt(cb.getAttribute("data-hand-index"), 10);
            if (!isNaN(i) && i >= 0 && i < unlockedHands) autoBuyEnabledByHand[i] = cb.checked;
        });
    }
    document.addEventListener("click", function(e) {
        if (!speedUpgradesContainerEl) return;
        if (e.target.closest(".upgrade-btn")) return;
        speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
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
    try {
        const rawSave = localStorage.getItem(SAVE_KEY);
        if (rawSave) {
            const data = JSON.parse(rawSave);
            applyLoadedState(data);
            const savedAt = Number(data.savedAt) || Date.now();
            applyOfflineProgress(Date.now() - savedAt, { showSummary: true });
        }
    } catch (_) {}
    syncPlayStageForNumberMode(typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1);
    try {
        number2.bindUI();
    } catch (err) {
        if (typeof console !== "undefined" && console.error) console.error("Number 2 UI bind failed:", err);
    }
    /* ---------------------------------------------------------
       DEV TOOLS (toggle on/off)
    --------------------------------------------------------- */
    const devToolsToggle = document.getElementById("dev-tools-toggle");
    const devToolsPanel = document.getElementById("dev-tools-panel");
    const devSecondsElapsed = document.getElementById("dev-seconds-elapsed");
    const devAddCountInput = document.getElementById("dev-add-count-input");
    const devAddCountBtn = document.getElementById("dev-add-count-btn");
    const devAddAscensionEssenceInput = document.getElementById("dev-add-ascension-essence-input");
    const devAddAscensionEssenceBtn = document.getElementById("dev-add-ascension-essence-btn");
    const devAllAutobuyCheckbox = document.getElementById("dev-all-autobuy");
    const devAutobuyDelay01Checkbox = document.getElementById("dev-autobuy-delay-01");
    const devAutobuyCheapenCheckbox = document.getElementById("dev-autobuy-cheapen");
    const devAutobuySlowdownCheckbox = document.getElementById("dev-autobuy-slowdown");
    const devBlackHolePhaseSelect = document.getElementById("dev-black-hole-phase-select");
    const devBlackHolePhaseApplyBtn = document.getElementById("dev-black-hole-phase-apply");
    const devPauseGameCheckbox = document.getElementById("dev-pause-game");

    const devToolsLoadTime = Date.now();
    let devSecondsInterval = null;

    function updateDevSeconds() {
        if (!devSecondsElapsed) return;
        devSecondsElapsed.textContent = ((Date.now() - devToolsLoadTime) / 1000).toFixed(1);
    }
    function updateDevBlackHolePhaseSelect() {
        if (devBlackHolePhaseSelect) devBlackHolePhaseSelect.value = String(getBlackHolePhase());
    }
    function devEnsureBlackHoleUnlockedForPhase(phase) {
        if (phase <= 0) return;
        number1HasAscended = true;
        if (Array.isArray(ASCENSION_MAP_NODES) && ASCENSION_MAP_NODES.length > 0) {
            number1AscensionNodeIds = ASCENSION_MAP_NODES.map(n => n.id);
        }
        if (number1AscensionEssence < 5000) number1AscensionEssence = 5000;
    }
    function devSetUnlockedHandsCount(count) {
        const target = Math.max(1, Math.min(maxHands, Math.floor(Number(count) || 1)));
        unlockedHandsCap = target;
        unlockedHands = target;
        for (let i = 0; i < maxHands; i++) {
            if (i < target && !(handEarnings[i] > 0)) handEarnings[i] = 1;
            if (i >= target) {
                handEarnings[i] = 0;
                autoBuyEnabledByHand[i] = false;
                autoBuyCountdownSecondsByHand[i] = 0;
                timeWarpAuraActiveByHand[i] = false;
                timeWarpAuraAppearedAtMsByHand[i] = 0;
            }
        }
        shrinkSpeedRowsTo(target);
        ensureSpeedRows();
        while (hands.length > target) {
            const h = hands.pop();
            if (h && h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
        while (hands.length < target) {
            const handNum = hands.length + 1;
            const slot = speedRowRefs[handNum - 1]?.handMountEl;
            hands.push(new HandCounter(handNum, HAND_BASE_SPEED, slot));
        }
    }
    function devApplyBlackHolePhase() {
        if (!devBlackHolePhaseSelect) return;
        const phase = Math.max(0, Math.min(7, parseInt(devBlackHolePhaseSelect.value, 10) || 0));
        devEnsureBlackHoleUnlockedForPhase(phase);
        Object.assign(number1BlackHoleState, createNumber1BlackHoleDevPhasePreset(phase, {
            currentState: number1BlackHoleState,
            nowMs: Date.now()
        }));
        if (phase === 0) {
            number1HasAscended = false;
            number1AscensionNodeIds = [];
            number1BlackHoleState.phase = 0;
            number1BlackHoleState.phase1EssenceSpent = 0;
        }
        devSetUnlockedHandsCount(phase >= 6 ? 1 : 10);
        if (phase === 0) {
            handEarnings[0] = Math.max(handEarnings[0] || 0, 1e36);
        }
        if (phase === 6) {
            handEarnings[0] = Math.max(handEarnings[0] || 0, ASCENSION_1_REQUIRED_TOTAL);
        }
        if (phase === 7) {
            totalChanges = 0;
            handEarnings[0] = 0;
        }
        if (phase > 0 && phase < 7) {
            applyAscensionHandUnlockStartingCountFloorToUnlockedHands();
        }
        refreshTotalFromHandEarnings();
        syncBlackHolePhase1Vfx();
        updateN1GravityCpsStrip();
        updateObjectives();
        updateSpeedUpgradeUI();
        updateCheapenUpgradeUI();
        updateSlowdownUpgradeUI();
        updateTimeWarpAuraUI();
        updateTurboBoostUI();
        updateRateDisplay();
        updateMilestoneUI();
        updateEarnedBonusesUI();
        updatePageButtonUnlocks();
        refreshOverviewAndAscensionPanelsIfOpen();
        updateDevBlackHolePhaseSelect();
        addToLog("Dev: jumped to Black Hole Phase " + phase + ".", "warning");
        autosaveNow();
    }

    function isDevToolsPanelHidden() {
        if (!devToolsPanel) return true;
        if (devToolsPanel.style.display === "none") return true;
        try {
            return window.getComputedStyle(devToolsPanel).display === "none";
        } catch (_) {
            return true;
        }
    }

    if (devToolsToggle && devToolsPanel) {
        devToolsToggle.addEventListener("click", () => {
            const show = isDevToolsPanelHidden();
            devToolsPanel.style.display = show ? "block" : "none";
            if (show) {
                updateDevSeconds();
                updateDevBlackHolePhaseSelect();
                if (devPauseGameCheckbox) devPauseGameCheckbox.checked = devFreezeGame;
                if (!devSecondsInterval) devSecondsInterval = setInterval(updateDevSeconds, 100);
            } else {
                if (devSecondsInterval) clearInterval(devSecondsInterval);
                devSecondsInterval = null;
            }
        });
    }
    if (devBlackHolePhaseApplyBtn) {
        devBlackHolePhaseApplyBtn.addEventListener("click", devApplyBlackHolePhase);
    }
    if (devPauseGameCheckbox) {
        devPauseGameCheckbox.addEventListener("change", () => {
            devFreezeGame = !!devPauseGameCheckbox.checked;
        });
    }

    if (devAllAutobuyCheckbox) {
        devAllAutobuyCheckbox.addEventListener("change", () => {
            const on = devAllAutobuyCheckbox.checked;
            if (on) autoBuyUnlocked = true;
            ensureSpeedRows();
            for (let i = 0; i < unlockedHands; i++) autoBuyEnabledByHand[i] = on;
            updateSpeedUpgradeUI();
        });
    }
    if (devAutobuyDelay01Checkbox) {
        devAutobuyDelay01Checkbox.addEventListener("change", () => {
            const useFast = devAutobuyDelay01Checkbox.checked;
            devAutoBuyDelaySeconds = useFast ? 0.1 : null;
            const delay = useFast ? 0.1 : AUTO_BUY_DELAY_SECONDS;
            for (let i = 0; i < unlockedHands; i++) {
                if (autoBuyEnabledByHand[i] && (autoBuyCountdownSecondsByHand[i] || 0) > 0) {
                    autoBuyCountdownSecondsByHand[i] = delay;
                }
            }
        });
    }
    if (devAutobuyCheapenCheckbox) {
        devAutobuyCheapenCheckbox.addEventListener("change", () => {
            devCheapenAutobuyOn = devAutobuyCheapenCheckbox.checked;
            if (devCheapenAutobuyOn) {
                while (cheapenAutoBuyCountdownByHand.length < unlockedHands) cheapenAutoBuyCountdownByHand.push(0);
                for (let i = 0; i < unlockedHands; i++) {
                    const level = cheapenLevel[i] ?? 0;
                    if (level >= getMaxCheapenLevel()) continue;
                    const cost = getCheapenUpgradeCost(i, level + 1);
                    if ((handEarnings[i] || 0) >= cost) cheapenAutoBuyCountdownByHand[i] = DEV_CHEAPEN_AUTOBUY_DELAY;
                }
            }
        });
    }
    if (devAutobuySlowdownCheckbox) {
        devAutobuySlowdownCheckbox.addEventListener("change", () => {
            devSlowdownAutobuyOn = devAutobuySlowdownCheckbox.checked;
            if (devSlowdownAutobuyOn && isSlowdownUnlocked()) {
                while (slowdownAutoBuyCountdownByHand.length < unlockedHands) slowdownAutoBuyCountdownByHand.push(0);
                for (let i = 0; i < unlockedHands; i++) {
                    const level = slowdownLevel[i] ?? 0;
                    if (level >= getMaxSlowdownLevelCap()) continue;
                    const cost = getSlowdownUpgradeCost(level + 1);
                    if (cost !== null && (handEarnings[i] || 0) >= cost) slowdownAutoBuyCountdownByHand[i] = DEV_SLOWDOWN_AUTOBUY_DELAY;
                }
            }
        });
    }

    if (devDeleteSaveBtn) {
        devDeleteSaveBtn.addEventListener("click", () => {
            if (devToolsPanel) devToolsPanel.style.display = "none";
            showDeleteSaveConfirmDialog();
        });
    }

    if (devAddCountBtn && devAddCountInput) {
        devAddCountBtn.addEventListener("click", () => {
            const val = parseInt(devAddCountInput.value, 10) || 0;
            if (val <= 0) return;
            handEarnings[0] = (handEarnings[0] || 0) + val;
            refreshTotalFromHandEarnings();
            if (incrementalEl) incrementalEl.textContent = formatCount(totalChanges);
            updateObjectives();
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        });
    }
    if (devAddAscensionEssenceBtn && devAddAscensionEssenceInput) {
        devAddAscensionEssenceBtn.addEventListener("click", () => {
            const val = parseInt(devAddAscensionEssenceInput.value, 10) || 0;
            if (val <= 0) return;
            const add = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(val));
            number1AscensionEssence = Math.min(Number.MAX_SAFE_INTEGER, number1AscensionEssence + add);
            markMeaningfulProgress();
            updateMilestoneUI();
            patchAscensionPanelLiveDom();
            refreshGlobalOverviewPanelIfOpen();
            autosaveNow();
        });
    }

    updateObjectives();
    updateMilestoneUI();
    updateTurboBoostUI();
    updateRateDisplay();
    updateSlowdownUpgradeUI();
    updateTimeWarpAuraUI();
    updateEarnedBonusesUI();
    updatePageButtonUnlocks();
    updateNumber2SidebarUnlockUI();
    maybeShowFirstAscensionIntroOnUnlock();
    setInterval(autosaveNow, AUTOSAVE_INTERVAL_MS);
    window.addEventListener("beforeunload", autosaveNow);

    /* ---------------------------------------------------------
       Hand milestones: checkUnlockHands() via syncUnlocksWithTotalCount → refreshTotalFromHandEarnings()
    --------------------------------------------------------- */
