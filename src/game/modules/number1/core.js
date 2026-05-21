// Number 1 Core Module
// Merged from: n1-game-loop.js, n1-game-loop-step-deps.js, n1-tick-apply-step.js, n1-state-apply.js, n1-turbo.js, n1-turbo-game-loop-step.js, n1-turbo-boot.js, n1-save.js

import { HAND_BASE_SPEED } from "./hands.js";
import { BLACK_HOLE_EVAPORATION_CAP, normalizeNumber1BlackHoleStateFromSaveData } from "../../number1-black-hole.js";

// ==================== SAVE/LOAD UTILITIES (from n1-save.js) ====================

export const SAVE_KEY = "naf.save.v2";
export const AUTOSAVE_INTERVAL_MS = 10000;

/** Save/load: activation counts are edge-based (combo appears after being absent); version mismatch clears counts on load. */
export const COMBO_ACTIVATION_EDGE_SAVE_VERSION = 2;

export function readSaveData(storage, key = SAVE_KEY) {
    try {
        const raw = storage?.getItem?.(key);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data && typeof data === "object" ? data : null;
    } catch (_) {
        return null;
    }
}

export function writeSaveData(storage, state, key = SAVE_KEY) {
    try {
        storage?.setItem?.(key, JSON.stringify(state));
        return true;
    } catch (_) {
        return false;
    }
}

export function collectNumberModulesSaveState(numberModules) {
    const numberModulesState = {};
    Object.keys(numberModules || {}).forEach(k => {
        const m = numberModules[k];
        numberModulesState[k] = m.getSaveData();
    });
    return numberModulesState;
}

export function applyNumberModulesSaveState(numberModules, numberModulesState) {
    if (!numberModulesState || typeof numberModulesState !== "object") return;
    Object.keys(numberModulesState).forEach(k => {
        const m = numberModules?.[k];
        if (m) m.applySaveData(numberModulesState[k]);
    });
}

export function createGameSaveState(savedAt, fields) {
    return {
        savedAt: savedAt || Date.now(),
        ...fields,
        comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION
    };
}

export function normalizeFixedArray(value, length, fillValue, mapValue = v => v) {
    if (!Array.isArray(value)) return null;
    const out = value.slice(0, length).map(mapValue);
    while (out.length < length) out.push(fillValue);
    return out;
}

export function normalizeFixedBooleanArray(value, length, fillValue = false) {
    return normalizeFixedArray(value, length, fillValue, v => !!v);
}

export function normalizePositiveTimestampArray(value, length, fillValue = 0) {
    return normalizeFixedArray(value, length, fillValue, v => {
        const t = Number(v);
        return Number.isFinite(t) && t > 0 ? t : fillValue;
    });
}

export function normalizeFutureTimestampArray(value, length, nowMs, fillValue = 0) {
    return normalizeFixedArray(value, length, fillValue, v => {
        const t = Number(v);
        return Number.isFinite(t) && t > nowMs ? t : fillValue;
    });
}

export function normalizeComboActivationCounts(savedVersion, counts, expectedVersion = COMBO_ACTIVATION_EDGE_SAVE_VERSION) {
    if (Number(savedVersion) !== expectedVersion || !counts || typeof counts !== "object") return {};
    const out = {};
    Object.keys(counts).forEach(k => {
        const v = Number(counts[k]);
        out[k] = Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    });
    return out;
}

export function normalizeStringQueue(value) {
    return Array.isArray(value) ? value.filter(nm => typeof nm === "string" && nm.length > 0) : [];
}

export function normalizeArrayFromSave(value) {
    return Array.isArray(value) ? value.slice() : null;
}

export function normalizeArrayPrefix(value, length, mapValue = v => v) {
    return Array.isArray(value) ? value.slice(0, length).map(mapValue) : null;
}

export function normalizeStringArrayFromSave(value) {
    return Array.isArray(value) ? value.filter(v => typeof v === "string") : [];
}

export function normalizeStringSetFromSave(value) {
    return Array.isArray(value) ? new Set(value) : null;
}

export function applyAchievementFlags(targets, flags) {
    if (!Array.isArray(flags)) return false;
    targets.forEach((o, i) => { o.achieved = !!flags[i]; });
    return true;
}

export function replaceArrayContents(target, source) {
    if (!Array.isArray(source)) return false;
    target.length = 0;
    source.forEach(v => target.push(v));
    return true;
}

export function normalizeNonNegativeTimestamp(value) {
    const t = Number(value);
    return Number.isFinite(t) && t >= 0 ? t : 0;
}

export function normalizeNonNegativeNumber(value, fallback = 0, max = Number.MAX_VALUE) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(max, n) : fallback;
}

export function normalizePositiveTimestamp(value, fallback = 0) {
    const t = Number(value);
    return Number.isFinite(t) && t > 0 ? t : fallback;
}

export function normalizeNonNegativeInteger(value, fallback = 0, max = Number.MAX_SAFE_INTEGER) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(max, Math.floor(n)) : fallback;
}

export function normalizeNumberAtLeast(value, min, fallback = min) {
    const n = Number(value);
    return Number.isFinite(n) && n >= min ? n : fallback;
}

export function normalizeNumberInRange(value, min, max, fallback) {
    const n = Number(value);
    const safeFallback = fallback ?? min;
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : safeFallback;
}

export function hasPositiveNumberEntry(value) {
    return Array.isArray(value) && value.some(v => (Number(v) || 0) > 0);
}

export function isSaveVersionAtLeast(value, minVersion) {
    const n = Number(value);
    return Number.isFinite(n) && n >= minVersion;
}

export function normalizeBooleanIfSaved(value, currentValue) {
    return typeof value === "boolean" ? value : currentValue;
}

export function normalizeComboDiscoveryCooldownSpan(value, maxMs) {
    const sp = Number(value);
    return Number.isFinite(sp) && sp > 0 ? Math.min(maxMs, Math.floor(sp)) : 0;
}

export function normalizeQueuedComboDiscoveryCooldownSpan(value, pendingQueue, readyAtMs, nowMs, maxMs, minMs) {
    let span = normalizeComboDiscoveryCooldownSpan(value, maxMs);
    if (span <= 0 && Array.isArray(pendingQueue) && pendingQueue.length > 0 && readyAtMs > nowMs) {
        span = Math.max(minMs, readyAtMs - nowMs);
    }
    return span;
}

export function normalizeSettingsFromSave(savedSettings, currentSettings) {
    if (!savedSettings) return null;
    const data = typeof savedSettings === "object" ? savedSettings : {};
    return {
        theme: data.theme === "dark" ? "dark" : "light",
        adaptiveTipsEnabled: data.adaptiveTipsEnabled !== false,
        curtainEnabled: data.curtainEnabled !== false,
        humorEnabled: data.humorEnabled !== false,
        showClapAnimation: data.showClapAnimation !== false,
        offlineCapHours: Number.isFinite(data.offlineCapHours) && data.offlineCapHours >= 0
            ? data.offlineCapHours
            : currentSettings.offlineCapHours
    };
}

/** Non-null only for valid non-negative saved essence (Number 1); avoids losing essence to parse quirks. */
export function parseNumber1AscensionEssenceFromSaveValue(v) {
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

/**
 * Essence is stored top-level and under numberModulesState[1]; use max so 0 in one field cannot wipe the other.
 * The current in-memory value participates as a candidate to preserve already-loaded progress.
 */
export function mergeNumber1AscensionEssenceSaveValue(data, currentEssence) {
    const candidates = [];
    const add = (v) => {
        const p = parseNumber1AscensionEssenceFromSaveValue(v);
        if (p !== null) candidates.push(p);
    };
    add(currentEssence);
    if (data && typeof data === "object") {
        add(data.number1AscensionEssence);
        if (data.numberModulesState && typeof data.numberModulesState === "object") {
            const n1 = data.numberModulesState["1"];
            if (n1 && typeof n1 === "object" && n1.ascensionEssence != null) add(n1.ascensionEssence);
        }
    }
    if (candidates.length === 0) return currentEssence;
    return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.max(...candidates)));
}

// ==================== GAME LOOP (from n1-game-loop.js) ====================

export const GAME_LOOP_MS = 50;
export const GAME_LOOP_MAX_ELAPSED_MS = 60000;
export const GAME_LOOP_MAX_LAG_MS = 120000;
export const GAME_LOOP_MAX_CATCHUP_STEPS = 240;
export const GAME_LOOP_HIDDEN_MAX_CATCHUP_STEPS = 12;

export function clampGameLoopElapsedMs(elapsedMs) {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return GAME_LOOP_MS;
    return Math.min(elapsedMs, GAME_LOOP_MAX_ELAPSED_MS);
}

export function getGameLoopCatchupStepCap(isHidden) {
    return isHidden ? GAME_LOOP_HIDDEN_MAX_CATCHUP_STEPS : GAME_LOOP_MAX_CATCHUP_STEPS;
}

export function createNumber1LoopRuntime(deps) {
    let lastGameLoopPerfMs = null;
    let simLagMs = 0;
    let hiddenStartedAtMs = null;
    let saveTotalPlayTimeMs = 0;
    let lastSavePlayWallMs = null;
    let gameLoopTimer = null;

    function getWallNow() {
        return typeof deps.getWallNow === "function" ? deps.getWallNow() : Date.now();
    }

    function getPerfNow() {
        if (typeof deps.getPerfNow === "function") return deps.getPerfNow();
        return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : getWallNow();
    }

    function resetFixedStepLag() {
        lastGameLoopPerfMs = null;
        simLagMs = 0;
    }

    function setTotalPlayTimeMs(value) {
        const t = Number(value);
        saveTotalPlayTimeMs = Number.isFinite(t) && t >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(t)) : 0;
    }

    function getTotalPlayTimeMs() {
        return saveTotalPlayTimeMs;
    }

    function resetSavePlayWallClock() {
        lastSavePlayWallMs = null;
    }

    function getDisplayTotalPlayTimeMs() {
        let displayMs = saveTotalPlayTimeMs;
        if (!deps.isGameplayFrozen() && lastSavePlayWallMs != null) {
            const extra = Math.min(GAME_LOOP_MAX_ELAPSED_MS, Math.max(0, getWallNow() - lastSavePlayWallMs));
            displayMs = Math.min(Number.MAX_SAFE_INTEGER, displayMs + extra);
        }
        return displayMs;
    }

    function beginHiddenOfflineTracking() {
        if (deps.isGameplayFrozen()) {
            hiddenStartedAtMs = null;
            resetFixedStepLag();
            return;
        }
        if (hiddenStartedAtMs == null) hiddenStartedAtMs = getWallNow();
        resetFixedStepLag();
    }

    function endHiddenOfflineTracking() {
        const hiddenAt = hiddenStartedAtMs;
        hiddenStartedAtMs = null;
        if (hiddenAt == null) {
            resetFixedStepLag();
            return;
        }
        const offlineMs = Math.max(0, getWallNow() - hiddenAt);
        if (!deps.isGameplayFrozen() && offlineMs > 0) {
            deps.applyOfflineProgress(offlineMs, { showSummary: false });
        }
        resetFixedStepLag();
    }

    function gameLoopTick() {
        const wallNow = getWallNow();
        if (deps.isGameplayFrozen()) {
            resetFixedStepLag();
            resetSavePlayWallClock();
            return;
        }
        if (lastSavePlayWallMs != null) {
            let d = wallNow - lastSavePlayWallMs;
            if (d > 0) {
                if (d > GAME_LOOP_MAX_ELAPSED_MS) d = GAME_LOOP_MAX_ELAPSED_MS;
                saveTotalPlayTimeMs = Math.min(Number.MAX_SAFE_INTEGER, saveTotalPlayTimeMs + d);
            }
        }
        lastSavePlayWallMs = wallNow;

        const docHidden = deps.isDocumentHidden();
        const perfNow = getPerfNow();
        if (docHidden && !deps.shouldRunHiddenFixedStep()) {
            lastGameLoopPerfMs = perfNow;
            simLagMs = 0;
            return;
        }

        let elapsed = lastGameLoopPerfMs != null ? perfNow - lastGameLoopPerfMs : GAME_LOOP_MS;
        lastGameLoopPerfMs = perfNow;
        elapsed = clampGameLoopElapsedMs(elapsed);
        simLagMs += elapsed;
        if (simLagMs > GAME_LOOP_MAX_LAG_MS) simLagMs = GAME_LOOP_MAX_LAG_MS;

        let catchUpSteps = 0;
        const maxCatch = getGameLoopCatchupStepCap(docHidden);
        while (simLagMs >= GAME_LOOP_MS && catchUpSteps < maxCatch) {
            deps.runGameLoopStep({ backgroundTab: docHidden });
            simLagMs -= GAME_LOOP_MS;
            catchUpSteps++;
        }
        deps.patchOverviewIfNeeded(getWallNow());
    }

    function startGameLoop() {
        if (gameLoopTimer != null) return;
        gameLoopTimer = setInterval(gameLoopTick, GAME_LOOP_MS);
    }

    function stopGameLoop() {
        if (gameLoopTimer == null) return;
        clearInterval(gameLoopTimer);
        gameLoopTimer = null;
        resetFixedStepLag();
    }

    return {
        getDisplayTotalPlayTimeMs,
        getTotalPlayTimeMs,
        setTotalPlayTimeMs,
        resetSavePlayWallClock,
        resetFixedStepLag,
        beginHiddenOfflineTracking,
        endHiddenOfflineTracking,
        gameLoopTick,
        startGameLoop,
        stopGameLoop
    };
}

export function advanceSyncedHandTickBuckets(opts) {
    const ticksPerHand = Array(opts.unlockedHands).fill(0);
    const buckets = new Map();
    opts.hands.forEach(hand => {
        const handIndex = hand.id - 1;
        if (handIndex < 0 || handIndex >= opts.unlockedHands) return;
        const baseSpeed = (Number.isFinite(hand.baseSpeed) && hand.baseSpeed > 0) ? hand.baseSpeed : opts.handBaseSpeed;
        const intervalMs = opts.getTickIntervalMs(baseSpeed, handIndex);
        if (intervalMs <= 0) return;
        const bucketKey = opts.getHandSpeedSyncBucketKey(handIndex);
        if (bucketKey == null) return;
        if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
        buckets.get(bucketKey).push(hand);
    });
    buckets.forEach(groupHands => {
        groupHands.sort((a, b) => a.id - b.id);
        const leader = groupHands[0];
        const handIndexLeader = leader.id - 1;
        const levelEff = opts.getEffectiveSpeedLevel(handIndexLeader);
        const multBig = opts.getSpeedMultiplierBigForLevel(levelEff);
        const baseSpeed = (Number.isFinite(leader.baseSpeed) && leader.baseSpeed > 0) ? leader.baseSpeed : opts.handBaseSpeed;
        const intervalMs = opts.getTickIntervalMs(baseSpeed, handIndexLeader);
        if (intervalMs <= 0) return;
        const alignedCount = leader.count;
        let acc = leader.tickAccBig != null ? leader.tickAccBig : 0n;
        acc += BigInt(opts.dtMs) * multBig;
        const ticksBig = acc / 1000n;
        acc %= 1000n;
        const ticksFloat = Number(ticksBig);
        const ticksNum = Number.isFinite(ticksFloat) ? ticksFloat : opts.tickCap;
        let targetCount = alignedCount;
        if (ticksBig > 0n) {
            const tickMod = Number(ticksBig % 10n);
            targetCount = ((alignedCount - 1 + tickMod) % 10 + 10) % 10 + 1;
        }
        groupHands.forEach(hand => {
            const needDigitPaint = hand.count !== targetCount;
            hand.count = targetCount;
            hand.tickAccBig = acc;
            ticksPerHand[hand.id - 1] = ticksNum;
            if (needDigitPaint && opts.renderDigits !== false) hand.render();
        });
    });
    return ticksPerHand;
}

export function alignSameSpeedHandPhases(opts) {
    const buckets = new Map();
    opts.hands.forEach(hand => {
        const handIndex = hand.id - 1;
        if (handIndex < 0 || handIndex >= opts.unlockedHands) return;
        const baseSpeed = (Number.isFinite(hand.baseSpeed) && hand.baseSpeed > 0) ? hand.baseSpeed : opts.handBaseSpeed;
        const intervalMs = opts.getTickIntervalMs(baseSpeed, handIndex);
        if (intervalMs <= 0) return;
        const bucketKey = opts.getHandSpeedSyncBucketKey(handIndex);
        if (bucketKey == null) return;
        if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
        buckets.get(bucketKey).push(hand);
    });

    let alignedHands = 0;
    buckets.forEach(groupHands => {
        if (groupHands.length < 2) return;
        groupHands.sort((a, b) => a.id - b.id);
        const leader = groupHands[0];
        const acc = leader.tickAccBig != null ? leader.tickAccBig : 0n;
        const cnt = leader.count;
        groupHands.forEach(hand => {
            if (hand.count === cnt && hand.tickAccBig === acc) return;
            const needDigitPaint = hand.count !== cnt;
            hand.count = cnt;
            hand.tickAccBig = acc;
            alignedHands++;
            if (needDigitPaint && opts.renderDigits !== false) hand.render();
        });
    });
    return alignedHands;
}

export function calculateTickEarningsByHand(opts) {
    const ticksPerHand = Array.isArray(opts.ticksPerHand) ? opts.ticksPerHand : [];
    const handCount = Math.max(0, opts.unlockedHands | 0);
    const effectiveTicksPerHand = Array(handCount).fill(0);
    let totalEffectiveTicks = 0;
    for (let i = 0; i < handCount; i++) {
        const slowMult = opts.getSlowdownMultiplier(i);
        const effectiveTicks = (ticksPerHand[i] || 0) * slowMult;
        effectiveTicksPerHand[i] = effectiveTicks;
        totalEffectiveTicks += effectiveTicks;
    }
    if (!(totalEffectiveTicks > 0)) return effectiveTicksPerHand.map(() => 0);
    const rawBonusTicks = totalEffectiveTicks * opts.comboMultiplier * opts.turboMultiplier * opts.blackHoleMultiplier;
    const cap = opts.tickCap;
    const bonusTicks = Number.isFinite(rawBonusTicks)
        ? Math.max(0, Math.min(cap, Math.round(rawBonusTicks)))
        : cap;
    return effectiveTicksPerHand.map(effectiveTicks => Math.round((effectiveTicks / totalEffectiveTicks) * bonusTicks));
}

export function calculateDetachedCpsProgress(opts) {
    const dtSec = Number(opts.dtSec);
    if (!(dtSec > 0)) return { gained: 0, gainsByHand: [] };
    const cpsPerHand = Array.isArray(opts.cpsPerHand) ? opts.cpsPerHand : [];
    const handCount = Math.max(0, opts.unlockedHands | 0);
    const rawCps = cpsPerHand.reduce((a, b) => a + (Number(b) || 0), 0);
    if (rawCps <= 0) return { gained: 0, gainsByHand: Array(handCount).fill(0) };

    const comboMultiplier = Number(opts.comboMultiplier) || 0;
    const turboMultiplier = Number(opts.turboMultiplier) || 0;
    const blackHoleMultiplier = Number(opts.blackHoleMultiplier) || 0;
    const gained = Math.round(dtSec * rawCps * comboMultiplier * turboMultiplier * blackHoleMultiplier);
    const totalWeight = rawCps || 1;
    const gainsByHand = Array(handCount).fill(0);
    for (let i = 0; i < handCount; i++) {
        const weight = Number(cpsPerHand[i]) || 0;
        gainsByHand[i] = Math.round((weight / totalWeight) * gained);
    }
    return { gained, gainsByHand };
}

export function runNumber1GameLoopStep(deps, opts) {
    opts = opts || {};
    const backgroundTab = opts.backgroundTab === true;
    const dt = GAME_LOOP_MS;
    const dtSec = GAME_LOOP_MS / 1000;

    deps.tickBackgroundNumberModules(dtSec);
    deps.updateBlackHolePhaseStep(dtSec);
    if (!backgroundTab) deps.syncBlackHolePhase1Vfx();

    const mode = deps.getCurrentNumberMode();
    if (deps.shouldRunNumber2Foreground(mode)) {
        deps.runNumber2GameLoopStep(dtSec);
        deps.processComboDiscoveryMilestoneIfUnlocked();
        return;
    }

    if (deps.getBlackHolePhase() === 7) {
        deps.runBlackHolePhase7Step(backgroundTab);
        return;
    }

    deps.updateTimeWarpSystem(dtSec);
    deps.maybeAlignSameSpeedHandPhasesFromWallClock();

    const unlockedHands = deps.getUnlockedHands();
    const ticksPerHand = advanceSyncedHandTickBuckets({
        hands: deps.getHands(),
        unlockedHands,
        dtMs: dt,
        handBaseSpeed: deps.handBaseSpeed,
        tickCap: deps.tickCap,
        renderDigits: !backgroundTab,
        getTickIntervalMs: deps.getTickIntervalMs,
        getHandSpeedSyncBucketKey: deps.getHandSpeedSyncBucketKey,
        getEffectiveSpeedLevel: deps.getEffectiveSpeedLevel,
        getSpeedMultiplierBigForLevel: deps.getSpeedMultiplierBigForLevel
    });

    deps.processClappingThisTick();

    let totalTicks = 0;
    for (let i = 0; i < ticksPerHand.length; i++) totalTicks += ticksPerHand[i] || 0;

    deps.updateTurboStep(dtSec, backgroundTab);
    deps.updateComboStep(backgroundTab);

    if (totalTicks > 0) {
        const tickGains = calculateTickEarningsByHand({
            ticksPerHand,
            unlockedHands,
            comboMultiplier: deps.getComboMultiplier(),
            turboMultiplier: deps.getTurboCountMultiplier(),
            blackHoleMultiplier: deps.getNumber1BlackHoleProductionMult(),
            tickCap: deps.tickCap,
            getSlowdownMultiplier: deps.getSlowdownMultiplier
        });
        deps.applyTickGains(tickGains, backgroundTab);
    }

    deps.runAutobuyStep();
    deps.flushAutobuyDeferredTotalsIfAny();
    deps.flushLoopUi(totalTicks, backgroundTab);
}

// ==================== TURBO (from n1-turbo.js) ====================

export const TURBO_UNLOCK_COUNT = 1e12;
export const TURBO_BOOST_METER_BASE_MAX = 100;
export const TURBO_COMBO_POINTS_BASE = 2;
export const TURBO_COMBO_POINTS_EXP_OFFSET = 2;
export const TURBO_COUNT_MULTIPLIER_BASE_MAX = 100;
export const TURBO_MULTIPLIER_CURVE_EXPONENT = 2;
export const TURBO_BURN_RATE_PER_SEC = 3;
export const TURBO_BURN_INTENSITY_K = 8;
export const TURBO_TANK_PEAK_MAX_RATIO = 16;
export const TURBO_TANK_PEAK_WEIGHT = 0.06;
export const TURBO_DRAIN_FLOOR = 0.07;
export const TURBO_DRAIN_PIECE_EXP = 0.55;
export const TURBO_SCENSION_ACTIVATION_BASE_COST = 10000;
export const TURBO_LEVELER_BASE_POINT_COST = 48;
export const TURBO_LEVELER_LINE_TOOLTIP =
    "While Turbo is off, combo fill past a full meter banks here. With Turbo still off, meeting the point cost buys one random Burn/Tank/Mult/Fill level; that cost doubles each purchase.";

/** Burn/Tank/Mult/Fill row copy for upgrade-style detail tooltips (Turbo-scension panel). */
export const TURBO_SCENSION_AXIS_TITLES = [
    "Burn — Each level doubles how fast the meter drains while Turbo is on and strengthens how strongly burn drives boost toward your Mult ceiling. Higher burn empties the tank faster unless you refill with combos or Fill upgrades.",
    "Tank — Each level doubles max meter capacity. Larger tanks hold more charge per fill and adjust peak boost when the gauge is full.",
    "Mult — Each level doubles your Turbo boost ceiling (the × you can approach when burn, tank fullness, and meter align).",
    "Fill — Each level doubles combo-driven meter gains and boosts passive meter regen from Ring while Turbo is on."
];

export function turboMeterCurveScaleFromTotals(totals) {
    return Math.max(1, TURBO_BOOST_METER_BASE_MAX + ((totals && totals.turboScaling) || 0) * 25);
}

export function getTurboMeterMaxFromState(totals, tankLevel) {
    return turboMeterCurveScaleFromTotals(totals) * ((totals && totals.turboTankSizeMult) || 1) * Math.pow(2, Math.max(0, tankLevel));
}

export function getTurboCountMultiplierMaxFromState(turboScaling, multLevel) {
    const base = TURBO_COUNT_MULTIPLIER_BASE_MAX * Math.pow(1.25, turboScaling || 0);
    return base * Math.pow(2, Math.max(0, multLevel));
}

export function getTurboScensionActivationCostFromTotals(totals) {
    const mult = (totals && totals.turboScensionActivationCostMult) || 1;
    return Math.max(1, Math.floor(TURBO_SCENSION_ACTIVATION_BASE_COST * mult));
}

export function getTurboScensionUpgradeRollCountFromTotals(totals) {
    return 1 + ((totals && totals.turboScensionExtraUpgradeRolls) || 0);
}

export function getTurboScensionFillMult(fillLevel) {
    return Math.pow(2, Math.max(0, fillLevel));
}

export function getTurboComboPointsForMinHands(minHands, totals, fillLevel) {
    if (minHands < 2) return 0;
    const basePoints = Math.pow(TURBO_COMBO_POINTS_BASE, minHands - TURBO_COMBO_POINTS_EXP_OFFSET);
    const comboMult = (totals && totals.comboTurboPointsMult) || 1;
    const flatAdd = (totals && totals.turboBoostComboFillAdd) || 0;
    const meterExtra = (totals && totals.turboMeterFromComboMult) || 1;
    return (basePoints * comboMult + flatAdd) * meterExtra * getTurboScensionFillMult(fillLevel);
}

export function getTurboNominalBurnPerSecFromState(totals, burnLevel) {
    const ascBurn = (totals && totals.turboBurnRateMult) || 1;
    return TURBO_BURN_RATE_PER_SEC * Math.pow(2, Math.max(0, burnLevel)) * ascBurn;
}

export function getTurboBurnIntensityRatioFromNominal(nominalBurnPerSec) {
    return nominalBurnPerSec / (nominalBurnPerSec + TURBO_BURN_INTENSITY_K);
}

export function getTurboTankPeakMult(meterMax, curveScale) {
    const tankRatio = Math.min(TURBO_TANK_PEAK_MAX_RATIO, meterMax / Math.max(1e-9, curveScale));
    return 1 + TURBO_TANK_PEAK_WEIGHT * (tankRatio - 1);
}

export function getTurboBoostMultiplierFromState(state) {
    const meterMax = state.meterMax;
    const curveScale = state.curveScale;
    const meter = state.meter;
    const fullness = Math.min(1, meter / Math.max(1e-9, meterMax));
    const burnCurve = Math.pow(
        getTurboBurnIntensityRatioFromNominal(state.nominalBurnPerSec),
        TURBO_MULTIPLIER_CURVE_EXPONENT
    );
    const tankPeakMult = getTurboTankPeakMult(meterMax, curveScale);
    return 1 + burnCurve * (state.multiplierMax - 1) * fullness * tankPeakMult;
}

export function getTurboDrainPiecewiseMultiplier(fullness) {
    const u = Math.max(0, Math.min(1, fullness));
    return TURBO_DRAIN_FLOOR + (1 - TURBO_DRAIN_FLOOR) * Math.pow(u, TURBO_DRAIN_PIECE_EXP);
}

export function getTurboBurnDrainForStep(dtSec, state) {
    const meterMax = state.meterMax;
    const fullness = Math.max(0, Math.min(1, state.meter / Math.max(1e-9, meterMax)));
    const piecewise = getTurboDrainPiecewiseMultiplier(fullness);
    const reduce = (state.totals && state.totals.turboBurnEfficiencyReduceSum) || 0;
    const efficiencyMult = Math.max(0, 1 - reduce);
    const drainMult = (state.totals && state.totals.turboMeterDrainMult) || 1;
    return dtSec * state.nominalBurnPerSec * efficiencyMult * piecewise * drainMult;
}

export function getTurboLevelerNextPointCost(purchases) {
    return TURBO_LEVELER_BASE_POINT_COST * Math.pow(2, Math.max(0, purchases));
}

// ==================== GAME LOOP STEP DEPS (from n1-game-loop-step-deps.js) ====================

/**
 * Compose the deps object passed to {@link runNumber1GameLoopStep}. Keeps invariant constants (`handBaseSpeed`, `tickCap`) in one import site.
 *
 * @param {Record<string, unknown>} injected Boots hooks and getters (everything except the two invariant fields).
 */
export function assembleNumber1GameLoopStepDeps(injected) {
    return {
        ...injected,
        handBaseSpeed: HAND_BASE_SPEED,
        tickCap: BLACK_HOLE_EVAPORATION_CAP
    };
}

// ==================== TICK APPLY STEP (from n1-tick-apply-step.js) ====================

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

// ==================== TURBO GAME LOOP STEP (from n1-turbo-game-loop-step.js) ====================

/**
 * Turbo meter burn/regen, turbo-scension autobuy loop, and related UI flush hooks for {@link runNumber1GameLoopStep}.
 *
 * @param {object} deps
 * @param {() => number} deps.getTotalChanges
 * @param {() => boolean} deps.getTurboBoostUnlocked
 * @param {() => boolean} deps.getTurboBoostEnabled
 * @param {() => number} deps.getTurboBoostMeter
 * @param {() => void} deps.incrementTurboActivationCount
 * @param {(dtSec: number) => void} deps.updateTurboBurn
 * @param {(dtSec: number) => void} deps.applyTurboPassiveMeterRegen
 * @param {() => boolean} deps.isTurboScensionUpgradeAutobuyUnlocked
 * @param {() => boolean} deps.gameplaySimFrozen
 * @param {(opts: object) => boolean} deps.tryTurboScensionActivationUpgrade
 * @param {() => void} deps.autosaveNow
 * @param {() => void} deps.updateTurboBoostUI
 * @param {(opts?: object) => void} deps.updateRateDisplay
 */
export function createNumber1TurboGameLoopStep(deps) {
    const {
        getTotalChanges,
        getTurboBoostUnlocked,
        getTurboBoostEnabled,
        getTurboBoostMeter,
        incrementTurboActivationCount,
        updateTurboBurn,
        applyTurboPassiveMeterRegen,
        isTurboScensionUpgradeAutobuyUnlocked,
        gameplaySimFrozen,
        tryTurboScensionActivationUpgrade,
        autosaveNow,
        updateTurboBoostUI,
        updateRateDisplay
    } = deps;

    function updateTurboStep(dtSec, backgroundTab) {
        if (getTotalChanges() < TURBO_UNLOCK_COUNT) return;
        let turboScensionAutobuyDidUpgrade = false;
        if (getTurboBoostUnlocked()) {
            if (getTurboBoostEnabled() && getTurboBoostMeter() > 0) incrementTurboActivationCount();
            updateTurboBurn(dtSec);
            applyTurboPassiveMeterRegen(dtSec);
        }
        if (isTurboScensionUpgradeAutobuyUnlocked()) {
            while (!gameplaySimFrozen() && tryTurboScensionActivationUpgrade({ skipLog: true, skipAutosave: true, skipUIUpdate: true })) {
                turboScensionAutobuyDidUpgrade = true;
            }
            if (turboScensionAutobuyDidUpgrade) autosaveNow();
        }
        if (!backgroundTab) {
            updateTurboBoostUI();
            if (turboScensionAutobuyDidUpgrade) updateRateDisplay();
        }
    }

    return { updateTurboStep };
}

// ==================== TURBO BOOT (from n1-turbo-boot.js) ====================

/** Turbo Boost DOM listeners + gated reveal (meter burn/regen stays in legacy / game-loop slice). Rules stay pure in `n1-turbo.js`. */
export function createNumber1TurboBoot(deps) {
    const {
        turboScensionUpgradeBtn,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        setTurboBoostEnabled,
        tryTurboLevelerPurchases,
        updateTurboBoostUI,
        updateRateDisplay,
        tryTurboScensionActivationUpgrade,
        getTotalChanges,
        getTurboBoostUnlocked,
        onTurboSystemFirstUnlock,
        turboBoostWrapEl,
        addToLog,
        formatCount,
        checkStoryBanners
    } = deps;

    function syncTurboBoostToggleDom(enabled) {
        const on = !!enabled;
        if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = on;
        if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = on ? "On" : "Off";
    }

    /** Called from update UI + sync pathways so milestone gates surface the Turbo cluster reliably. */
    function tryUnlockTurboIfEligible() {
        if (getTotalChanges() < TURBO_UNLOCK_COUNT) return;
        if (!getTurboBoostUnlocked()) {
            onTurboSystemFirstUnlock();
            syncTurboBoostToggleDom(false);
            addToLog("Turbo system unlocked at " + formatCount(TURBO_UNLOCK_COUNT) + ".", "milestone");
            checkStoryBanners();
        }
        if (turboBoostWrapEl) {
            turboBoostWrapEl.style.display = "";
            turboBoostWrapEl.setAttribute("aria-hidden", "false");
        }
    }

    if (turboScensionUpgradeBtn) {
        turboScensionUpgradeBtn.addEventListener("click", () => { tryTurboScensionActivationUpgrade(); });
    }
    if (turboBoostEnabledCheckbox) {
        turboBoostEnabledCheckbox.addEventListener("change", () => {
            const on = turboBoostEnabledCheckbox.checked;
            setTurboBoostEnabled(on);
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = on ? "On" : "Off";
            if (!on) tryTurboLevelerPurchases();
            updateTurboBoostUI({ force: true });
            updateRateDisplay();
        });
    }

    return { tryUnlockTurboIfEligible, syncTurboBoostToggleDom };
}

// ==================== STATE APPLY (from n1-state-apply.js) ====================

/**
 * Pure Number 1 save hydration: maps raw persisted JSON to normalized fields.
 * Side effects (DOM, hands[] construction, loops) stay in legacy-boot.
 *
 * @param {unknown} raw
 * @param {{
 *   maxHands: number,
 *   ascensionTreeVersionExpected: number,
 *   blackHoleMaxLevel: number,
 *   blackHoleEvaporationCap: number,
 *   comboDiscoveryCooldownBaseMs: number,
 *   comboDiscoveryCooldownMinMs: number,
 *   comboActivationEdgeVersion?: number,
 *   settingsFallback: object,
 *   currentAscensionNumber1IntroSeen: boolean,
 *   currentEssenceForMerge: number,
 *   fallbackAutoBuyEnabled: unknown[],
 *   fallbackAutoBuyCountdown: unknown[],
 *   nowMs?: number,
 * }} env
 */
export function normalizeNumber1SaveSnapshot(raw, env) {
    if (!raw || typeof raw !== "object") return null;
    const data = raw;
    const maxHands = Math.max(1, Math.floor(Number(env.maxHands) || 10));
    const nowMs = Number.isFinite(env.nowMs) ? Number(env.nowMs) : Date.now();
    const comboEdgeV = Number(env.comboActivationEdgeVersion ?? COMBO_ACTIVATION_EDGE_SAVE_VERSION);

    const treeOk = isSaveVersionAtLeast(data.ascensionTreeVersion, env.ascensionTreeVersionExpected);

    let slowdownCompactionUnlockedLatched = !!data.slowdownCompactionUnlockedLatched;
    if (!slowdownCompactionUnlockedLatched && hasPositiveNumberEntry(data.slowdownLevel)) {
        slowdownCompactionUnlockedLatched = true;
    }

    const unlockedHandsCap = normalizeNumberInRange(Number(data.unlockedHandsCap) || maxHands, 1, maxHands, maxHands);
    const unlockedHands = normalizeNumberInRange(Number(data.unlockedHands) || 1, 1, unlockedHandsCap, 1);

    const number1AscensionBlackHoleLevel = normalizeNonNegativeInteger(
        data.number1AscensionBlackHoleLevel,
        0,
        env.blackHoleMaxLevel
    );

    const normalizedBlackHoleState = normalizeNumber1BlackHoleStateFromSaveData(data.number1BlackHoleState, {
        legacyBlackHoleLevel: number1AscensionBlackHoleLevel,
        maxHands,
        nowMs
    });

    const comboDiscoveryMilestonePendingQueue = normalizeStringQueue(data.comboDiscoveryMilestonePendingQueue);
    const comboDiscoveryMilestoneReadyAtMs = normalizeNonNegativeTimestamp(data.comboDiscoveryMilestoneReadyAtMs);
    const comboDiscoveryMilestoneCooldownSpanMs = normalizeQueuedComboDiscoveryCooldownSpan(
        data.comboDiscoveryMilestoneCooldownSpanMs,
        comboDiscoveryMilestonePendingQueue,
        comboDiscoveryMilestoneReadyAtMs,
        nowMs,
        env.comboDiscoveryCooldownBaseMs,
        env.comboDiscoveryCooldownMinMs
    );

    const mergedAscensionEssence = mergeNumber1AscensionEssenceSaveValue(data, env.currentEssenceForMerge);
    const autoBuyHandSrc = data.autoBuyEnabledByHand != null ? data.autoBuyEnabledByHand : data.autoBuyEnabled;
    const autoBuyCdSrc = data.autoBuyCountdownSecondsByHand != null ? data.autoBuyCountdownSecondsByHand : data.autoBuyCountdown;
    const warpActiveSrc = data.timeWarpAuraActiveByHand != null ? data.timeWarpAuraActiveByHand : data.timeWarpAuraActive;

    return {
        totalPlayTimeMs: normalizeNonNegativeNumber(data.totalPlayTimeMs),

        handEarnings: normalizeFixedArray(data.handEarnings, maxHands, 0) || Array(maxHands).fill(0),
        speedLevel: normalizeFixedArray(data.speedLevel, maxHands, 0) || Array(maxHands).fill(0),
        speedBonusLevel: normalizeFixedArray(data.speedBonusLevel, maxHands, 0) || Array(maxHands).fill(0),
        cheapenLevel: normalizeFixedArray(data.cheapenLevel, maxHands, 0),
        cheapenBonusLevel: normalizeFixedArray(data.cheapenBonusLevel, maxHands, 0) || Array(maxHands).fill(0),
        slowdownLevel: normalizeFixedArray(data.slowdownLevel, maxHands, 0),
        slowdownBonusLevel: normalizeFixedArray(data.slowdownBonusLevel, maxHands, 0) || Array(maxHands).fill(0),
        clapCooldownUntilMsByHand:
            normalizeFixedArray(data.clapCooldownUntilMsByHand, maxHands, 0) || Array(maxHands).fill(0),

        unlockedHandsCap,
        unlockedHands,

        slowdownUnlockLogged: !!data.slowdownUnlockLogged,
        slowdownCompactionUnlockedLatched,

        timeWarpAuraActiveByHand: normalizeFixedBooleanArray(warpActiveSrc, maxHands, false) || Array(maxHands).fill(false),
        timeWarpAuraAppearedAtMsByHand:
            normalizeFixedArray(data.timeWarpAuraAppearedAtMsByHand, maxHands, 0) || Array(maxHands).fill(0),
        timeWarpNextSpawnInSec: normalizeNonNegativeNumber(data.timeWarpNextSpawnInSec, 0),
        timeWarpUnlockLogged: !!data.timeWarpUnlockLogged,

        number1AscensionEssence: mergedAscensionEssence,
        mergedNumber1AscensionEssence: mergedAscensionEssence,
        number1AscensionNodeIds: normalizeStringArrayFromSave(data.number1AscensionNodeIds),
        number1AscensionBlackHoleLevel,
        number1BlackHoleState: normalizedBlackHoleState,
        ascensionNumber1IntroSeen: normalizeBooleanIfSaved(data.ascensionNumber1IntroSeen, env.currentAscensionNumber1IntroSeen),

        number1AscensionPendingBonusEssence: normalizeNonNegativeNumber(data.number1AscensionPendingBonusEssence, 0),
        number1AscensionClapEssenceMultiplier: Math.max(1, normalizeNonNegativeNumber(data.number1AscensionClapEssenceMultiplier, 1)),
        number1AscensionClapEssenceProcCount: normalizeNonNegativeInteger(data.number1AscensionClapEssenceProcCount, 0),
        number1HasAscended: typeof data.number1HasAscended === "boolean" ? data.number1HasAscended : !!data.number1HasAscended,
        ascensionNodesLoadedFromSave: treeOk,

        comboActivationCounts: normalizeComboActivationCounts(data.comboActivationEdgeVersion, data.comboActivationCounts, comboEdgeV),
        comboDiscoveryMilestonePendingQueue,
        comboDiscoveryMilestoneReadyAtMs,
        comboDiscoveryMilestoneCooldownSpanMs,

        turboBoostEnabled: normalizeBooleanIfSaved(data.turboBoostEnabled, false),
        turboBoostUnlocked: normalizeBooleanIfSaved(data.turboBoostUnlocked, false),
        turboBoostMeter: normalizeNonNegativeNumber(data.turboBoostMeter, 0),
        turboBoostBankedPoints: normalizeNonNegativeNumber(data.turboBoostBankedPoints, 0),
        turboActivationCount: normalizeNonNegativeInteger(data.turboActivationCount, 0),

        turboScensionBurnLevel: normalizeNonNegativeInteger(data.turboScensionBurnLevel, 0),
        turboScensionTankLevel: normalizeNonNegativeInteger(data.turboScensionTankLevel, 0),
        turboScensionMultLevel: normalizeNonNegativeInteger(data.turboScensionMultLevel, 0),
        turboScensionFillLevel: normalizeNonNegativeInteger(data.turboScensionFillLevel, 0),
        turboLevelerBank: normalizeNonNegativeNumber(data.turboLevelerBank, 0),
        turboLevelerPurchases: normalizeNonNegativeInteger(data.turboLevelerPurchases, 0),

        settings: normalizeSettingsFromSave(data.settings, env.settingsFallback),

        autoBuyUnlocked: typeof data.autoBuyUnlocked === "boolean" ? data.autoBuyUnlocked : !!data.autoBuyUnlocked,
        autoBuyEnabledByHand: normalizeFixedBooleanArray(autoBuyHandSrc, maxHands, false) || env.fallbackAutoBuyEnabled,
        autoBuyCountdownSecondsByHand: normalizeFixedArray(autoBuyCdSrc, maxHands, 0) || env.fallbackAutoBuyCountdown,

        adaptiveLastProgressAtMs: normalizeNonNegativeTimestamp(data.adaptiveLastProgressAtMs),
        adaptiveLastHintAtMs: normalizeNonNegativeTimestamp(data.adaptiveLastHintAtMs),
        earnedComboNames: normalizeStringArrayFromSave(data.earnedComboNames) ?? [],
        previousTickActiveComboNames: normalizeStringArrayFromSave(data.previousTickActiveComboNames) ?? [],
        objectivesAchieved: normalizeArrayPrefix(data.objectivesAchieved, 64, v => !!v),
        longTermObjectivesAchieved: normalizeArrayPrefix(data.longTermObjectivesAchieved, 160, v => !!v),
        shownBannerIds: normalizeStringArrayFromSave(data.shownBannerIds) ?? [],
        closedBanners: normalizeArrayFromSave(data.closedBanners) ?? [],
        numberModulesState: data.numberModulesState && typeof data.numberModulesState === "object" ? data.numberModulesState : null,

        number1RunPeakTotalCount: normalizeNonNegativeNumber(data.number1RunPeakTotalCount, 0),
        number1RunStartedAtMs: normalizeNonNegativeTimestamp(data.number1RunStartedAtMs) || Date.now(),

        ascensionTreeVersion: data.ascensionTreeVersion
    };
}

export function patchTimeWarpAuraAppearedForActiveHands(state, activeHands) {
    if (!state || !Array.isArray(state.timeWarpAuraActiveLatched)) return;
    const latched = state.timeWarpAuraActiveLatched;
    for (let i = 0; i < activeHands.length; i++) {
        if (activeHands[i] && !latched[i]) {
            latched[i] = true;
        }
    }
}

/** @param {{ objectives: { achieved?: boolean }[], longTermObjectives: { achieved?: boolean }[] }} lists */
export function applyObjectiveFlagsFromSnapshot(snap, lists) {
    if (snap.objectivesAchieved) applyAchievementFlags(lists.objectives, snap.objectivesAchieved);
    if (snap.longTermObjectivesAchieved) applyAchievementFlags(lists.longTermObjectives, snap.longTermObjectivesAchieved);
}

export function replaceEarnedComboNamesFromSnapshot(target, earnedComboNames) {
    if (Array.isArray(earnedComboNames)) {
        target.length = 0;
        for (let i = 0; i < earnedComboNames.length; i++) {
            target.push(earnedComboNames[i]);
        }
    }
}

export function replaceClosedBannersFromSnapshot(target, closedBanners) {
    if (Array.isArray(closedBanners)) {
        target.length = 0;
        for (let i = 0; i < closedBanners.length; i++) {
            target.push(closedBanners[i]);
        }
    }
}
