import { applyNumberModulesSaveState } from "../n1-save.js";
import { patchTimeWarpAuraAppearedForActiveHands } from "../n1-state-apply.js";
import { applyAutobuyGrantToUnlockedHands } from "./upgrades/n1-autobuy-state.js";

/**
 * Post-hydrate live-game wiring (hands, DOM rows, UI refresh).
 *
 * @param {NonNullable<ReturnType<typeof import("./n1-persist.js").hydrateNumber1RuntimeFromSave>>} snap
 * @param {{ applyLiveGameLoad: (snap: unknown) => void }} ctx
 */
export function applyHydratedSnapshotToLiveGame(snap, ctx) {
    ctx.applyLiveGameLoad(snap);
}

/**
 * Restore hand lane arrays from save and rebuild HandCounter instances up to unlockedHands.
 * @param {NonNullable<ReturnType<typeof import("../n1-state-apply.js").normalizeNumber1SaveSnapshot>>} snap
 * @param {{
 *   handsRt: ReturnType<typeof import("./state/n1-hands-store.js").createN1HandsStore>,
 *   run: { unlockedHands: number },
 *   maxHands: number,
 *   getSpeedRowRefs: () => Array<{ handMountEl?: Element | null }>,
 *   ensureSpeedRows: () => void,
 *   createHandCounter: (handNum: number, slot: Element | null | undefined) => unknown
 * }} ctx
 */
function copyHandsRtArrayInPlace(target, source, fillValue = 0) {
    if (!Array.isArray(target)) return;
    const src = Array.isArray(source) ? source : [];
    for (let i = 0; i < target.length; i++) {
        target[i] = i < src.length ? (src[i] ?? fillValue) : fillValue;
    }
}

export function restoreHandsFromSaveSnapshot(snap, ctx) {
    const { handsRt, run, maxHands, getSpeedRowRefs, ensureSpeedRows, createHandCounter } = ctx;

    if (snap.speedLevel) copyHandsRtArrayInPlace(handsRt.speedLevel, snap.speedLevel, 0);
    copyHandsRtArrayInPlace(handsRt.speedBonusLevel, snap.speedBonusLevel, 0);
    for (let i = 0; i < handsRt.clapDigitPrevious.length; i++) handsRt.clapDigitPrevious[i] = -1;
    copyHandsRtArrayInPlace(handsRt.clapCooldownUntilMsByHand, snap.clapCooldownUntilMsByHand, 0);

    ensureSpeedRows();
    const speedRowRefs = getSpeedRowRefs();
    while (handsRt.hands.length < run.unlockedHands) {
        const handNum = handsRt.hands.length + 1;
        const slot = speedRowRefs[handNum - 1]?.handMountEl;
        handsRt.hands.push(createHandCounter(handNum, slot));
    }
}

/**
 * Live DOM / module / UI tail after passive hydrate (Phase 19).
 *
 * @param {NonNullable<ReturnType<typeof import("./n1-persist.js").hydrateNumber1RuntimeFromSave>>} snap
 * @param {{
 *   runtime: ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>,
 *   maxHands: number,
 *   handsBoot: { restoreFromSaveSnapshot: (snap: unknown) => void },
 *   loopRuntime: { setTotalPlayTimeMs: (ms: number) => void, resetSavePlayWallClock: () => void },
 *   logTickerRt: { setAdaptiveTipTimestampsFromSave: (progressMs: number, hintMs: number) => void },
 *   numberModules: Record<string, { applySaveData: (d: unknown) => void }>,
 *   tryTurboLevelerPurchases: () => void,
 *   reconcileNumber2LockState: () => void,
 *   updateNumber2SidebarUnlockUI: () => void,
 *   normalizeAscensionNodeIds: () => void,
 *   ascensionAutobuyDefaultOnForNewHands: () => boolean,
 *   syncAllAutobuyTogglesFromState: () => void,
 *   isNumber1AscensionTreeFullyPurchased: () => boolean,
 *   getBlackHolePhase: () => number,
 *   getTurboMeterMax: () => number,
 *   refreshTotalFromHandEarnings: () => void,
 *   syncBlackHolePhase1Vfx: () => void,
 *   updateRateDisplay: () => void,
 *   checkStoryBanners: () => void
 * }} ctx
 */
export function applyLiveGameLoadTail(snap, ctx) {
    const {
        runtime,
        maxHands,
        handsBoot,
        loopRuntime,
        logTickerRt,
        numberModules,
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
        updateRateDisplay,
        checkStoryBanners
    } = ctx;

    const { run, ascension, blackHole, turbo, autobuy, timewarp } = runtime;
    const { autoBuyEnabledByHand } = autobuy;

    loopRuntime.setTotalPlayTimeMs(snap.totalPlayTimeMs);
    loopRuntime.resetSavePlayWallClock();

    handsBoot.restoreFromSaveSnapshot(snap);

    timewarp.timeWarpAuraActiveByHand = snap.timeWarpAuraActiveByHand
        ? snap.timeWarpAuraActiveByHand
        : timewarp.timeWarpAuraActiveByHand;
    timewarp.timeWarpAuraAppearedAtMsByHand = snap.timeWarpAuraAppearedAtMsByHand;
    timewarp.timeWarpNextSpawnInSec = snap.timeWarpNextSpawnInSec;
    timewarp.timeWarpUnlockLogged = snap.timeWarpUnlockLogged;

    for (let i = run.unlockedHands; i < maxHands; i++) run.handEarnings[i] = 0;
    while (timewarp.timeWarpAuraAppearedAtMsByHand.length < maxHands) {
        timewarp.timeWarpAuraAppearedAtMsByHand.push(0);
    }
    patchTimeWarpAuraAppearedForActiveHands(
        timewarp.timeWarpAuraActiveByHand,
        timewarp.timeWarpAuraAppearedAtMsByHand,
        run.unlockedHands,
        Date.now()
    );

    syncAllAutobuyTogglesFromState();

    if (!turbo.turboBoostEnabled) tryTurboLevelerPurchases();

    logTickerRt.setAdaptiveTipTimestampsFromSave(snap.adaptiveLastProgressAtMs, snap.adaptiveLastHintAtMs);

    applyNumberModulesSaveState(numberModules, snap.numberModulesState);

    reconcileNumber2LockState();
    updateNumber2SidebarUnlockUI();

    ascension.number1AscensionNodeIds = [];
    if (snap.ascensionNodesLoadedFromSave) {
        snap.number1AscensionNodeIds.forEach(id => ascension.number1AscensionNodeIds.push(id));
        normalizeAscensionNodeIds();
    }

    if (ascensionAutobuyDefaultOnForNewHands()) {
        autobuy.autoBuyUnlocked = true;
        applyAutobuyGrantToUnlockedHands(autoBuyEnabledByHand, run.unlockedHands, true);
        syncAllAutobuyTogglesFromState();
    }

    if (ascension.number1HasAscended && isNumber1AscensionTreeFullyPurchased() && getBlackHolePhase() === 0) {
        blackHole.number1BlackHoleState.phase = 1;
    }
    if (turbo.turboBoostUnlocked) turbo.turboBoostMeter = Math.min(turbo.turboBoostMeter, getTurboMeterMax());

    refreshTotalFromHandEarnings();
    syncBlackHolePhase1Vfx();
    updateRateDisplay();
    checkStoryBanners();
}

