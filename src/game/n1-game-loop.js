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

    function start() {
        if (!gameLoopTimer) gameLoopTimer = setInterval(gameLoopTick, GAME_LOOP_MS);
        return gameLoopTimer;
    }

    return {
        beginHiddenOfflineTracking,
        endHiddenOfflineTracking,
        gameLoopTick,
        getDisplayTotalPlayTimeMs,
        getTotalPlayTimeMs,
        resetSavePlayWallClock,
        setTotalPlayTimeMs,
        start
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
