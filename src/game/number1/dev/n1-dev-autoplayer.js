/**
 * Dev auto-player orchestrator: tick loop, action execution, session recording.
 */
import { createAutoplayerRecorder } from "./n1-dev-autoplayer-recorder.js";
import {
    getAutoplayerPersonaConfig,
    mapActionKindToEventType,
    pickNextAction
} from "./n1-dev-autoplayer-policy.js";
import { buildAutoplayerReport, formatAutoplayerReportMarkdown } from "./n1-dev-autoplayer-report.js";

export const AUTOPLAYER_TICK_MS = 1000;
export const AUTOPLAYER_STUCK_IDLE_MINUTES = 15;
/** Wall-clock delay after ascend before enabling autobuy / turbo for the new run. */
export const AUTOPLAYER_POST_ASCEND_ENABLE_DELAY_MS = 3000;

export function createDevAutoplayer(deps) {
    const recorder = createAutoplayerRecorder();
    let running = false;
    let paused = false;
    let tickTimerId = null;
    let personaId = "efficient";
    let stopAtPhase = null;
    let autoDismissStoryBanners = true;
    let runPeakTotal = 0;
    let ascendReadySinceMs = null;
    let lastActionAtMs = 0;
    let lastRecordedPhase = null;
    let sessionStartMs = 0;
    let consecutiveIdleTicks = 0;
    let lastActionKind = null;
    let postAscendEnableDueAtMs = null;
    let postAscendMaintainAutobuy = false;
    let postAscendTurboPending = false;

    function nowMs() {
        return typeof deps.getNowMs === "function" ? deps.getNowMs() : Date.now();
    }

    function readMetrics() {
        return {
            totalChanges: deps.getTotalChanges(),
            ascensionEssence: deps.getNumber1AscensionEssence(),
            blackHolePhase: deps.getBlackHolePhase(),
            unlockedHands: deps.getUnlockedHands()
        };
    }

    function updateRunPeak() {
        const total = deps.getTotalChanges();
        const fromGame =
            typeof deps.getRunPeakTotal === "function" ? Number(deps.getRunPeakTotal()) || 0 : 0;
        runPeakTotal = Math.max(runPeakTotal, total, fromGame);
    }

    function syncAscendReadyClock(isReady) {
        const t = nowMs();
        if (isReady) {
            if (ascendReadySinceMs == null) ascendReadySinceMs = t;
        } else {
            ascendReadySinceMs = null;
        }
    }

    function resetPostAscendEnableState() {
        postAscendEnableDueAtMs = null;
        postAscendMaintainAutobuy = false;
        postAscendTurboPending = false;
    }

    function schedulePostAscendEnables() {
        postAscendEnableDueAtMs = nowMs() + AUTOPLAYER_POST_ASCEND_ENABLE_DELAY_MS;
        postAscendMaintainAutobuy = true;
        postAscendTurboPending = true;
    }

    function applyPostAscendAutobuyEnable() {
        if (typeof deps.enableAutobuyForAutoplayerOnAllHands === "function") {
            deps.enableAutobuyForAutoplayerOnAllHands();
        }
    }

    function applyPostAscendTurboEnable() {
        if (typeof deps.ensureTurboEnabledForAutoplayer === "function") {
            deps.ensureTurboEnabledForAutoplayer();
        }
        const unlocked =
            typeof deps.getTurboBoostUnlocked === "function" ? deps.getTurboBoostUnlocked() : false;
        const enabled =
            typeof deps.getTurboBoostEnabled === "function" ? deps.getTurboBoostEnabled() : false;
        if (unlocked && enabled) {
            postAscendTurboPending = false;
        }
    }

    function maybeApplyPostAscendEnables() {
        const t = nowMs();
        if (postAscendEnableDueAtMs != null && t >= postAscendEnableDueAtMs) {
            applyPostAscendAutobuyEnable();
            applyPostAscendTurboEnable();
            postAscendEnableDueAtMs = null;
        }
        if (postAscendEnableDueAtMs != null) return;
        if (postAscendMaintainAutobuy) {
            applyPostAscendAutobuyEnable();
        }
        if (postAscendTurboPending) {
            applyPostAscendTurboEnable();
        }
    }

    function findCheapestAscensionNodeId() {
        if (typeof deps.isNumber1AscensionTreeFullyPurchased === "function" && deps.isNumber1AscensionTreeFullyPurchased()) {
            return null;
        }
        const nodes = typeof deps.getAscensionMapNodes === "function" ? deps.getAscensionMapNodes() : [];
        if (!Array.isArray(nodes) || nodes.length === 0) return null;
        let bestId = null;
        let bestCost = Infinity;
        for (const node of nodes) {
            if (!node || !node.id) continue;
            const chain =
                typeof deps.getAscensionPurchaseChainInfoToNode === "function"
                    ? deps.getAscensionPurchaseChainInfoToNode(node.id)
                    : null;
            if (!chain || chain.targetOwned) continue;
            const cost = Number(chain.missingCost) || 0;
            if (cost > 0 && cost < bestCost && (deps.getNumber1AscensionEssence() || 0) >= cost) {
                bestCost = cost;
                bestId = node.id;
            }
        }
        return bestId;
    }

    function buildPolicyState() {
        const t = nowMs();
        const hands = Math.max(0, deps.getUnlockedHands());
        const canBuySpeed = [];
        const canBuyCheapen = [];
        const canBuySlowdown = [];
        const speedCostByHand = [];
        const cheapenCostByHand = [];
        const slowdownCostByHand = [];

        for (let i = 0; i < hands; i++) {
            const canS = typeof deps.canAffordSpeedUpgrade === "function" ? deps.canAffordSpeedUpgrade(i) : false;
            const canC = typeof deps.canAffordCheapenUpgrade === "function" ? deps.canAffordCheapenUpgrade(i) : false;
            const canSl = typeof deps.canAffordSlowdownUpgrade === "function" ? deps.canAffordSlowdownUpgrade(i) : false;
            canBuySpeed[i] = canS;
            canBuyCheapen[i] = canC;
            canBuySlowdown[i] = canSl;
            speedCostByHand[i] = canS && typeof deps.getSpeedUpgradeCost === "function" ? deps.getSpeedUpgradeCost(i) : 0;
            cheapenCostByHand[i] = canC && typeof deps.getCheapenUpgradeCost === "function" ? deps.getCheapenUpgradeCost(i) : 0;
            slowdownCostByHand[i] =
                canSl && typeof deps.getSlowdownUpgradeCost === "function" ? deps.getSlowdownUpgradeCost(i) : null;
        }

        const bh = typeof deps.getBlackHoleState === "function" ? deps.getBlackHoleState() : {};
        const phase = deps.getBlackHolePhase();
        const digestActive = !!(bh.phase5DigestEndsAtMs && t < bh.phase5DigestEndsAtMs);

        const collapseCostByTrack = {};
        const collapseTierByTrack = {};
        for (const track of ["mass", "photon", "ergosphere"]) {
            collapseTierByTrack[track] =
                typeof deps.getBlackHolePhase2CollapseTier === "function"
                    ? deps.getBlackHolePhase2CollapseTier(track)
                    : 0;
            collapseCostByTrack[track] =
                typeof deps.getBlackHolePhase2CollapseUpgradeCost === "function"
                    ? deps.getBlackHolePhase2CollapseUpgradeCost(track)
                    : 0;
        }

        const diskLevelByTrack = {};
        const diskCostByTrack = {};
        for (const track of ["luminosity", "viscous", "coronal"]) {
            diskLevelByTrack[track] =
                typeof deps.getBlackHolePhase3TrackLevel === "function" ? deps.getBlackHolePhase3TrackLevel(track) : 0;
            diskCostByTrack[track] =
                typeof deps.getBlackHolePhase3TrackCost === "function" ? deps.getBlackHolePhase3TrackCost(track) : 0;
        }

        const jetCostByTrack = {};
        for (const track of ["drain", "boost", "bank"]) {
            jetCostByTrack[track] =
                typeof deps.getBlackHolePhase6TrackCost === "function" ? deps.getBlackHolePhase6TrackCost(track) : 0;
        }

        const isReady =
            typeof deps.isNumber1AscensionReady === "function" ? deps.isNumber1AscensionReady() : false;
        syncAscendReadyClock(isReady);

        return {
            nowMs: t,
            sessionStartMs,
            lastActionAtMs,
            storyBannerOpen: typeof deps.isStoryBannerOpen === "function" ? deps.isStoryBannerOpen() : false,
            autoDismissStoryBanners,
            blackHolePhase: phase,
            totalChanges: deps.getTotalChanges(),
            ascensionEssence: deps.getNumber1AscensionEssence(),
            unlockedHands: hands,
            hasAscended: typeof deps.hasAscended === "function" ? deps.hasAscended() : false,
            isArcUnlocked: typeof deps.isBlackHoleArcUnlocked === "function" ? deps.isBlackHoleArcUnlocked() : false,
            treeFullyPurchased:
                typeof deps.isNumber1AscensionTreeFullyPurchased === "function"
                    ? deps.isNumber1AscensionTreeFullyPurchased()
                    : false,
            isAscensionReady: isReady,
            ascendReadySinceMs,
            effectiveCps: typeof deps.getEffectiveCps === "function" ? deps.getEffectiveCps() : 0,
            getAscensionGainAtTotal:
                typeof deps.getAscensionGainAtTotal === "function" ? deps.getAscensionGainAtTotal : () => 0,
            cheapestAscensionNodeId: findCheapestAscensionNodeId(),
            canBuySpeed,
            canBuyCheapen,
            canBuySlowdown,
            speedCostByHand,
            cheapenCostByHand,
            slowdownCostByHand,
            phase2MassPourUnlocked:
                typeof deps.isBlackHolePhase2MassPourUnlocked === "function"
                    ? deps.isBlackHolePhase2MassPourUnlocked()
                    : false,
            collapseMaxTier: 3,
            collapseTierByTrack,
            collapseCostByTrack,
            diskMaxLevel: 6,
            diskLevelByTrack,
            diskCostByTrack,
            phase3Complete:
                typeof deps.isBlackHolePhase3Complete === "function" ? deps.isBlackHolePhase3Complete() : false,
            phase4WaveLevel: bh.phase4WaveLevel || 0,
            phase4ManualWaveReady:
                typeof deps.isBlackHolePhase4ManualWaveReady === "function"
                    ? deps.isBlackHolePhase4ManualWaveReady()
                    : false,
            phase5PendingMutationLevel: bh.phase5PendingMutationLevel || 0,
            phase5DigestActive: digestActive,
            phase5DigestProgress:
                typeof deps.getBlackHolePhase5DigestProgress === "function"
                    ? deps.getBlackHolePhase5DigestProgress()
                    : 0,
            canSacrificeHand:
                typeof deps.canSacrificeHandToFurnace === "function" ? deps.canSacrificeHandToFurnace() : false,
            phase6JetActive: !!bh.phase6JetActive,
            phase6JetCharge: bh.phase6JetCharge || 0,
            phase6JetChargeCap:
                typeof deps.getPhase6JetChargeCap === "function" ? deps.getPhase6JetChargeCap() : 500,
            jetCostByTrack,
            turboBoostUnlocked:
                typeof deps.getTurboBoostUnlocked === "function" ? deps.getTurboBoostUnlocked() : false,
            turboBoostEnabled:
                typeof deps.getTurboBoostEnabled === "function" ? deps.getTurboBoostEnabled() : false,
            turboMeterFillRatio:
                typeof deps.getTurboMeterFillRatio === "function" ? deps.getTurboMeterFillRatio() : 0
        };
    }

    function maybeRecordPhaseEnter(metrics) {
        const phase = metrics.blackHolePhase;
        if (lastRecordedPhase === null) {
            lastRecordedPhase = phase;
            return;
        }
        if (phase !== lastRecordedPhase) {
            recorder.recordEvent(
                { type: "phase_enter", blackHolePhase: phase, metrics: { ...metrics, blackHolePhase: phase } },
                { nowMs: nowMs() }
            );
            lastRecordedPhase = phase;
        }
    }

    function executeAction(action) {
        if (!action || !action.kind) return { ok: false };
        const kind = action.kind;
        const metricsBefore = readMetrics();
        let ok = false;
        /** @type {object} */
        const detail = { type: mapActionKindToEventType(kind) };

        switch (kind) {
            case "dismiss_story":
                if (typeof deps.closeStoryBanner === "function") deps.closeStoryBanner();
                ok = true;
                detail.type = "dismiss_story";
                break;
            case "buy_speed":
                if (typeof deps.buySpeedUpgradeForHand === "function") {
                    const before = deps.getSpeedLevel?.(action.handIndex);
                    deps.buySpeedUpgradeForHand(action.handIndex, { silentLog: true, skipUpgradeDom: true });
                    const after = deps.getSpeedLevel?.(action.handIndex);
                    ok = after > before;
                    detail.hand = action.handIndex + 1;
                    detail.levelAfter = after;
                    detail.cost = action.cost;
                }
                break;
            case "buy_cheapen":
                if (typeof deps.buyCheapenUpgradeForHand === "function") {
                    const before = deps.getCheapenLevel?.(action.handIndex);
                    deps.buyCheapenUpgradeForHand(action.handIndex, { silentLog: true, skipUpgradeDom: true });
                    const after = deps.getCheapenLevel?.(action.handIndex);
                    ok = after > before;
                    detail.hand = action.handIndex + 1;
                    detail.levelAfter = after;
                    detail.cost = action.cost;
                }
                break;
            case "buy_slowdown":
                if (typeof deps.buySlowdownUpgradeForHand === "function") {
                    const before = deps.getSlowdownLevel?.(action.handIndex);
                    deps.buySlowdownUpgradeForHand(action.handIndex, { silentLog: true, skipUpgradeDom: true });
                    const after = deps.getSlowdownLevel?.(action.handIndex);
                    ok = after > before;
                    detail.hand = action.handIndex + 1;
                    detail.levelAfter = after;
                    detail.cost = action.cost;
                }
                break;
            case "ascend": {
                if (typeof deps.performNumber1Ascension === "function" && deps.isNumber1AscensionReady()) {
                    const gainInfo =
                        typeof deps.getAscensionGainBreakdown === "function" ? deps.getAscensionGainBreakdown() : null;
                    detail.peakTotalAtAscend = runPeakTotal;
                    detail.ascensionGain = gainInfo?.finalGain;
                    deps.performNumber1Ascension();
                    ok = true;
                    runPeakTotal = 0;
                    ascendReadySinceMs = null;
                    schedulePostAscendEnables();
                }
                break;
            }
            case "buy_ascension_node":
                if (typeof deps.tryBuyAscensionNode === "function" && action.nodeId) {
                    const essenceBefore = deps.getNumber1AscensionEssence();
                    deps.tryBuyAscensionNode(action.nodeId);
                    ok = deps.getNumber1AscensionEssence() < essenceBefore;
                    detail.nodeId = action.nodeId;
                }
                break;
            case "bh_pour":
            case "bh_stoke":
                if (typeof deps.tryBuyNumber1BlackHole === "function") {
                    const essenceBefore = deps.getNumber1AscensionEssence();
                    deps.tryBuyNumber1BlackHole();
                    ok = deps.getNumber1AscensionEssence() !== essenceBefore || kind === "bh_stoke";
                    detail.type = kind;
                }
                break;
            case "bh_collapse_buy":
                if (typeof deps.tryBuyBlackHolePhase2CollapseUpgrade === "function") {
                    deps.tryBuyBlackHolePhase2CollapseUpgrade(action.track);
                    ok = true;
                    detail.track = action.track;
                }
                break;
            case "bh_disk_buy":
                if (typeof deps.tryBuyBlackHolePhase3DiskUpgrade === "function") {
                    deps.tryBuyBlackHolePhase3DiskUpgrade(action.track);
                    ok = true;
                    detail.track = action.track;
                }
                break;
            case "bh_jet_buy":
                if (typeof deps.tryBuyBlackHolePhase6JetUpgrade === "function") {
                    deps.tryBuyBlackHolePhase6JetUpgrade(action.track);
                    ok = true;
                    detail.track = action.track;
                }
                break;
            case "bh_wave_manual":
                if (typeof deps.triggerBlackHoleWaveManual === "function") {
                    deps.triggerBlackHoleWaveManual();
                    ok = true;
                }
                break;
            case "bh_sacrifice":
                if (typeof deps.sacrificeNextHandToFurnace === "function") {
                    deps.sacrificeNextHandToFurnace();
                    ok = true;
                }
                break;
            case "bh_mutation":
                if (typeof deps.chooseBlackHoleFurnaceMutation === "function") {
                    deps.chooseBlackHoleFurnaceMutation(action.mutationKind || "essence-refinery");
                    ok = true;
                    detail.mutationKind = action.mutationKind;
                }
                break;
            case "bh_jet_toggle":
                if (typeof deps.tryToggleJet === "function") {
                    deps.tryToggleJet(!!action.active);
                    ok = true;
                    detail.active = !!action.active;
                }
                break;
            case "turbo_toggle":
                if (typeof deps.setTurboBoostEnabled === "function") {
                    deps.setTurboBoostEnabled(!!action.enabled);
                    ok = true;
                    detail.enabled = !!action.enabled;
                }
                break;
            default:
                break;
        }

        if (!ok) return { ok: false };

        const metrics = readMetrics();
        maybeRecordPhaseEnter(metrics);
        detail.metrics = metrics;
        if (kind !== "dismiss_story") {
            recorder.recordEvent(detail, { nowMs: nowMs() });
            lastActionAtMs = nowMs();
            lastActionKind = kind;
            consecutiveIdleTicks = 0;
        }
        void metricsBefore;
        return { ok: true, detail };
    }

    function shouldAutoStop() {
        const phase = deps.getBlackHolePhase();
        if (stopAtPhase != null && phase >= stopAtPhase) return true;
        if (phase >= 7) {
            const bh = typeof deps.getBlackHoleState === "function" ? deps.getBlackHoleState() : {};
            if ((bh.phase7EpilogueCounter || 0) >= 60) return true;
        }
        return false;
    }

    function tick() {
        if (!running || paused) return;
        updateRunPeak();
        maybeApplyPostAscendEnables();

        if (shouldAutoStop()) {
            stop({ reason: "milestone" });
            return;
        }

        const persona = getAutoplayerPersonaConfig(personaId);
        const state = buildPolicyState();
        const action = pickNextAction(state, persona);

        if (!action) {
            consecutiveIdleTicks += 1;
            if (
                consecutiveIdleTicks >= (AUTOPLAYER_STUCK_IDLE_MINUTES * 60 * 1000) / AUTOPLAYER_TICK_MS &&
                !state.isAscensionReady
            ) {
                stop({ reason: "stuck" });
            }
            notifyStatus();
            return;
        }

        executeAction(action);
        notifyStatus();
    }

    let onStatusChange = deps.onStatusChange;

    function notifyStatus() {
        if (typeof onStatusChange === "function") {
            onStatusChange(getStatus());
        }
    }

    function setStatusListener(fn) {
        onStatusChange = typeof fn === "function" ? fn : null;
    }

    function getStatus() {
        updateRunPeak();
        const snap = recorder.getSnapshot();
        const startedMs = recorder.getSessionStartedAtMs();
        const wallMs = startedMs > 0 ? Math.max(0, nowMs() - startedMs) : 0;
        return {
            running,
            paused,
            personaId,
            blackHolePhase: deps.getBlackHolePhase(),
            ascensions: snap.ascensionCount,
            simulatedClicks: snap.simulatedClicks,
            sessionWallSec: Math.round(wallMs / 1000),
            runPeakTotal,
            lastActionKind,
            sessionId: snap.sessionId
        };
    }

    function start(opts) {
        const options = opts || {};
        stop({ silent: true });
        personaId = options.personaId || personaId || "efficient";
        stopAtPhase =
            options.stopAtPhase != null && options.stopAtPhase !== ""
                ? Math.max(0, parseInt(String(options.stopAtPhase), 10) || 0)
                : null;
        if (options.autoDismissStoryBanners != null) {
            autoDismissStoryBanners = !!options.autoDismissStoryBanners;
        }
        runPeakTotal = 0;
        ascendReadySinceMs = null;
        lastActionAtMs = 0;
        lastRecordedPhase = null;
        consecutiveIdleTicks = 0;
        lastActionKind = null;
        resetPostAscendEnableState();
        sessionStartMs = nowMs();

        recorder.beginSession({
            personaId,
            startSnapshot: {
                blackHolePhase: deps.getBlackHolePhase(),
                totalChanges: deps.getTotalChanges(),
                ascensionEssence: deps.getNumber1AscensionEssence(),
                unlockedHands: deps.getUnlockedHands(),
                treeFullyPurchased:
                    typeof deps.isNumber1AscensionTreeFullyPurchased === "function"
                        ? deps.isNumber1AscensionTreeFullyPurchased()
                        : false
            }
        });
        lastRecordedPhase = deps.getBlackHolePhase();

        running = true;
        paused = false;
        if (!tickTimerId) {
            tickTimerId = setInterval(tick, AUTOPLAYER_TICK_MS);
        }
        tick();
        notifyStatus();
    }

    function stop(opts) {
        const options = opts || {};
        if (!options.silent && recorder.hasSession()) {
            recorder.markStopped(nowMs());
        }
        running = false;
        paused = false;
        if (tickTimerId) {
            clearInterval(tickTimerId);
            tickTimerId = null;
        }
        if (!options.silent) notifyStatus();
    }

    function pause() {
        if (!running) return;
        paused = true;
        notifyStatus();
    }

    function resume() {
        if (!running) return;
        paused = false;
        notifyStatus();
    }

    function clearSession() {
        stop({ silent: true });
        recorder.clearSession();
        runPeakTotal = 0;
        ascendReadySinceMs = null;
        lastActionKind = null;
        resetPostAscendEnableState();
        notifyStatus();
    }

    function exportJson() {
        const report = buildAutoplayerReport(recorder.exportSession());
        const payload = recorder.exportSession(report);
        return payload;
    }

    function copySummaryMarkdown() {
        const report = buildAutoplayerReport(recorder.exportSession());
        return formatAutoplayerReportMarkdown(report);
    }

    function downloadJson() {
        const payload = exportJson();
        if (!payload || typeof document === "undefined") return false;
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "autoplayer-session-" + (payload.meta?.sessionId || "export") + ".json";
        a.click();
        URL.revokeObjectURL(url);
        return true;
    }

    async function copySummaryToClipboard() {
        const text = copySummaryMarkdown();
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        return false;
    }

    return {
        start,
        stop,
        pause,
        resume,
        clearSession,
        getStatus,
        exportJson,
        copySummaryMarkdown,
        downloadJson,
        copySummaryToClipboard,
        isRunning: () => running,
        isPaused: () => paused,
        setStatusListener
    };
}
