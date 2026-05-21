/**
 * Number 1 save / load / offline — snapshot apply/build and thin autosave factory.
 * Live `let` bindings stay in the orchestrator; this module receives explicit deps.
 * Must not import legacy-boot.
 */

import {
    createGameSaveState,
    writeSaveData,
    normalizeNumber1SaveSnapshot,
    applyNumberModulesSaveState,
    collectNumberModulesSaveState,
    patchTimeWarpAuraAppearedForActiveHands,
    applyObjectiveFlagsFromSnapshot,
    replaceClosedBannersFromSnapshot,
    replaceEarnedComboNamesFromSnapshot
} from "./modules/number1/core.js";

/**
 * @typedef {object} Number1SaveApplyDeps
 * @property {{ setTotalPlayTimeMs: (n: number) => void, resetSavePlayWallClock: () => void }} loopRt
 * @property {number} maxHands
 * @property {(v: number[]) => void} setHandEarnings
 * @property {() => number[]} getHandEarnings
 * @property {(v: number[]) => void} setSpeedLevel
 * @property {(v: number[]) => void} setSpeedBonusLevel
 * @property {(v: number[]) => void} setClapDigitPrevious
 * @property {(v: number[]) => void} setClapCooldownUntilMsByHand
 * @property {(v: number[]) => void} setCheapenLevel
 * @property {(v: number[]) => void} setCheapenBonusLevel
 * @property {(v: number[]) => void} setSlowdownLevel
 * @property {(v: number[]) => void} setSlowdownBonusLevel
 * @property {(v: boolean) => void} setSlowdownUnlockLogged
 * @property {(v: boolean) => void} setSlowdownCompactionUnlockedLatched
 * @property {(v: boolean[]) => void} setTimeWarpAuraActiveByHand
 * @property {() => boolean[]} getTimeWarpAuraActiveByHand
 * @property {(v: number[]) => void} setTimeWarpAuraAppearedAtMsByHand
 * @property {() => number[]} getTimeWarpAuraAppearedAtMsByHand
 * @property {(v: number) => void} setTimeWarpNextSpawnInSec
 * @property {(v: boolean) => void} setTimeWarpUnlockLogged
 * @property {(v: number) => void} setUnlockedHandsCap
 * @property {(v: number) => void} setUnlockedHands
 * @property {() => void} ensureSpeedRows
 * @property {() => { length: number, push: (h: unknown) => number }} getHands
 * @property {(i: number) => { handMountEl?: Element | null } | undefined} getSpeedRowRef
 * @property {new (n: number, base: number, slot: unknown) => unknown} HandCounter
 * @property {number} HAND_BASE_SPEED
 * @property {(v: boolean) => void} setAutoBuyUnlocked
 * @property {(t: unknown[], s: unknown[], m: (x: unknown, i: number) => unknown) => void} copyArrayIntoExisting
 * @property {unknown[]} autoBuyEnabledByHand
 * @property {unknown[]} autoBuyCountdownSecondsByHand
 * @property {(v: number) => void} setTurboBoostMeter
 * @property {() => number} getTurboBoostMeter
 * @property {(v: boolean) => void} setTurboBoostUnlocked
 * @property {(v: boolean) => void} setTurboBoostEnabled
 * @property {() => boolean} getTurboBoostEnabled
 * @property {(v: number) => void} setTurboActivationCount
 * @property {(v: number) => void} setTurboScensionBurnLevel
 * @property {(v: number) => void} setTurboScensionTankLevel
 * @property {(v: number) => void} setTurboScensionMultLevel
 * @property {(v: number) => void} setTurboScensionFillLevel
 * @property {(v: number) => void} setTurboLevelerBank
 * @property {(v: number) => void} setTurboLevelerPurchases
 * @property {() => void} tryTurboLevelerPurchases
 * @property {{ setAdaptiveTipTimestampsFromSave: (a: unknown, b: unknown) => void }} logTickerRt
 * @property {unknown[]} earnedComboNames
 * @property {(v: Record<string, number>) => void} setComboActivationCounts
 * @property {(v: unknown[]) => void} setComboDiscoveryMilestonePendingQueue
 * @property {(v: number) => void} setComboDiscoveryMilestoneReadyAtMs
 * @property {(v: number) => void} setComboDiscoveryMilestoneCooldownSpanMs
 * @property {(s: Set<string>) => void} setPreviousTickActiveComboNames
 * @property {{ objectives: { achieved?: boolean }[], longTermObjectives: { achieved?: boolean }[] }} objectiveLists
 * @property {Set<string>} shownBannerIds
 * @property {unknown[]} closedBanners
 * @property {() => object} getSettings
 * @property {(v: object) => void} setSettings
 * @property {object} NUMBER_MODULES
 * @property {(v: number) => void} setNumber1AscensionEssence
 * @property {(v: number) => void} setNumber1AscensionPendingBonusEssence
 * @property {(v: number) => void} setNumber1AscensionClapEssenceMultiplier
 * @property {(v: number) => void} setNumber1AscensionClapEssenceProcCount
 * @property {(v: boolean) => void} setNumber1HasAscended
 * @property {() => void} reconcileNumber2LockState
 * @property {() => void} updateNumber2SidebarUnlockUI
 * @property {() => void} clearAscensionNodeIds
 * @property {(id: string) => void} pushAscensionNodeId
 * @property {() => void} normalizeAscensionNodeIds
 * @property {(v: boolean) => void} setAscensionNumber1IntroSeen
 * @property {(v: number) => void} setNumber1AscensionBlackHoleLevel
 * @property {(v: object) => void} setNumber1BlackHoleState
 * @property {() => boolean} isNumber1AscensionTreeFullyPurchased
 * @property {() => number} getBlackHolePhase
 * @property {() => void} promoteBlackHoleToPhase1IfNeeded
 * @property {() => boolean} getTurboBoostUnlocked
 * @property {() => number} getTurboMeterMax
 * @property {(v: number) => void} setNumber1RunPeakTotalCount
 * @property {() => void} refreshTotalFromHandEarnings
 * @property {() => void} syncBlackHolePhase1Vfx
 * @property {() => void} updateN1GravityCpsStrip
 * @property {() => void} checkStoryBanners
 */

/**
 * Apply a normalized Number 1 snapshot to live simulation (orchestrator-owned state via deps).
 * @param {Number1SaveApplyDeps} d
 * @param {Record<string, unknown>} snap
 */
export function applyNumber1SnapToRuntime(d, snap) {
    d.loopRt.setTotalPlayTimeMs(/** @type {number} */ (snap.totalPlayTimeMs));
    d.loopRt.resetSavePlayWallClock();

    if (snap.handEarnings) d.setHandEarnings(/** @type {number[]} */ (snap.handEarnings));
    if (snap.speedLevel) d.setSpeedLevel(/** @type {number[]} */ (snap.speedLevel));
    d.setSpeedBonusLevel(/** @type {number[]} */ (snap.speedBonusLevel));
    d.setClapDigitPrevious(Array(d.maxHands).fill(-1));
    d.setClapCooldownUntilMsByHand(/** @type {number[]} */ (snap.clapCooldownUntilMsByHand));

    if (snap.cheapenLevel) d.setCheapenLevel(/** @type {number[]} */ (snap.cheapenLevel));
    d.setCheapenBonusLevel(/** @type {number[]} */ (snap.cheapenBonusLevel));

    if (snap.slowdownLevel) d.setSlowdownLevel(/** @type {number[]} */ (snap.slowdownLevel));
    d.setSlowdownBonusLevel(/** @type {number[]} */ (snap.slowdownBonusLevel));

    d.setSlowdownUnlockLogged(!!snap.slowdownUnlockLogged);
    d.setSlowdownCompactionUnlockedLatched(!!snap.slowdownCompactionUnlockedLatched);

    d.setTimeWarpAuraActiveByHand(
        snap.timeWarpAuraActiveByHand
            ? /** @type {boolean[]} */ (snap.timeWarpAuraActiveByHand)
            : d.getTimeWarpAuraActiveByHand()
    );
    d.setTimeWarpAuraAppearedAtMsByHand(
        snap.timeWarpAuraAppearedAtMsByHand
            ? /** @type {number[]} */ (snap.timeWarpAuraAppearedAtMsByHand)
            : d.getTimeWarpAuraAppearedAtMsByHand()
    );
    d.setTimeWarpNextSpawnInSec(/** @type {number} */ (snap.timeWarpNextSpawnInSec));
    d.setTimeWarpUnlockLogged(!!snap.timeWarpUnlockLogged);

    d.setUnlockedHandsCap(/** @type {number} */ (snap.unlockedHandsCap));
    d.setUnlockedHands(/** @type {number} */ (snap.unlockedHands));

    const unlockedHands = /** @type {number} */ (snap.unlockedHands);
    const handEarnings = d.getHandEarnings();
    for (let i = unlockedHands; i < d.maxHands; i++) handEarnings[i] = 0;

    const twAppear = d.getTimeWarpAuraAppearedAtMsByHand();
    while (twAppear.length < d.maxHands) twAppear.push(0);
    patchTimeWarpAuraAppearedForActiveHands(
        /** @type {never} */ (d.getTimeWarpAuraActiveByHand()),
        /** @type {never} */ (twAppear),
        unlockedHands,
        Date.now()
    );

    d.ensureSpeedRows();
    const handsArr = d.getHands();
    while (handsArr.length < unlockedHands) {
        const handNum = handsArr.length + 1;
        const slot = d.getSpeedRowRef(handNum - 1)?.handMountEl;
        handsArr.push(new d.HandCounter(handNum, d.HAND_BASE_SPEED, slot));
    }

    d.setAutoBuyUnlocked(!!snap.autoBuyUnlocked);
    if (Array.isArray(snap.autoBuyEnabledByHand)) {
        d.copyArrayIntoExisting(d.autoBuyEnabledByHand, snap.autoBuyEnabledByHand, v => !!v);
    }
    if (Array.isArray(snap.autoBuyCountdownSecondsByHand)) {
        d.copyArrayIntoExisting(
            d.autoBuyCountdownSecondsByHand,
            snap.autoBuyCountdownSecondsByHand,
            v => Number(v) || 0
        );
    }

    d.setTurboBoostMeter(/** @type {number} */ (snap.turboBoostMeter));
    d.setTurboBoostUnlocked(!!snap.turboBoostUnlocked);
    d.setTurboBoostEnabled(!!snap.turboBoostEnabled);
    d.setTurboActivationCount(/** @type {number} */ (snap.turboActivationCount));
    d.setTurboScensionBurnLevel(/** @type {number} */ (snap.turboScensionBurnLevel));
    d.setTurboScensionTankLevel(/** @type {number} */ (snap.turboScensionTankLevel));
    d.setTurboScensionMultLevel(/** @type {number} */ (snap.turboScensionMultLevel));
    d.setTurboScensionFillLevel(/** @type {number} */ (snap.turboScensionFillLevel));
    d.setTurboLevelerBank(/** @type {number} */ (snap.turboLevelerBank));
    d.setTurboLevelerPurchases(/** @type {number} */ (snap.turboLevelerPurchases));
    if (!d.getTurboBoostEnabled()) d.tryTurboLevelerPurchases();

    d.logTickerRt.setAdaptiveTipTimestampsFromSave(snap.adaptiveLastProgressAtMs, snap.adaptiveLastHintAtMs);

    replaceEarnedComboNamesFromSnapshot(d.earnedComboNames, snap.earnedComboNames);
    d.setComboActivationCounts(/** @type {Record<string, number>} */ (snap.comboActivationCounts));
    d.setComboDiscoveryMilestonePendingQueue(snap.comboDiscoveryMilestonePendingQueue);
    d.setComboDiscoveryMilestoneReadyAtMs(/** @type {number} */ (snap.comboDiscoveryMilestoneReadyAtMs));
    d.setComboDiscoveryMilestoneCooldownSpanMs(/** @type {number} */ (snap.comboDiscoveryMilestoneCooldownSpanMs));

    if (snap.previousTickActiveComboNames) {
        d.setPreviousTickActiveComboNames(
            new Set(Array.isArray(snap.previousTickActiveComboNames) ? snap.previousTickActiveComboNames : [])
        );
    }
    applyObjectiveFlagsFromSnapshot(snap, d.objectiveLists);

    if (snap.shownBannerIds) {
        d.shownBannerIds.clear();
        /** @type {unknown[]} */ (snap.shownBannerIds).forEach(id => d.shownBannerIds.add(/** @type {string} */ (id)));
    }

    replaceClosedBannersFromSnapshot(d.closedBanners, snap.closedBanners);
    d.setSettings(snap.settings || d.getSettings());

    applyNumberModulesSaveState(d.NUMBER_MODULES, snap.numberModulesState);
    d.setNumber1AscensionEssence(/** @type {number} */ (snap.mergedNumber1AscensionEssence));

    d.setNumber1AscensionPendingBonusEssence(/** @type {number} */ (snap.number1AscensionPendingBonusEssence));
    d.setNumber1AscensionClapEssenceMultiplier(/** @type {number} */ (snap.number1AscensionClapEssenceMultiplier));
    d.setNumber1AscensionClapEssenceProcCount(/** @type {number} */ (snap.number1AscensionClapEssenceProcCount));
    d.setNumber1HasAscended(!!snap.number1HasAscended);

    d.reconcileNumber2LockState();
    d.updateNumber2SidebarUnlockUI();

    d.clearAscensionNodeIds();
    if (snap.ascensionNodesLoadedFromSave) {
        /** @type {string[]} */ (snap.number1AscensionNodeIds).forEach(id => d.pushAscensionNodeId(id));
        d.normalizeAscensionNodeIds();
    }

    d.setAscensionNumber1IntroSeen(!!snap.ascensionNumber1IntroSeen);

    d.setNumber1AscensionBlackHoleLevel(/** @type {number} */ (snap.number1AscensionBlackHoleLevel));
    d.setNumber1BlackHoleState(snap.number1BlackHoleState);

    d.promoteBlackHoleToPhase1IfNeeded();

    if (d.getTurboBoostUnlocked()) {
        d.setTurboBoostMeter(Math.min(d.getTurboBoostMeter(), d.getTurboMeterMax()));
    }

    d.setNumber1RunPeakTotalCount(/** @type {number} */ (snap.number1RunPeakTotalCount));
    d.setNumber1RunStartedAtMs(/** @type {number} */ (snap.number1RunStartedAtMs) || Date.now());

    d.refreshTotalFromHandEarnings();
    d.syncBlackHolePhase1Vfx();
    d.updateN1GravityCpsStrip();
    d.checkStoryBanners();
}

/**
 * @typedef {object} Number1SavePayloadRead
 * (getters for every field in the save payload object — built by legacy orchestrator.)
 */
/** @param {Record<string, () => unknown>} r */
export function buildNumber1SavePayload(r) {
    return {
        handEarnings: r.handEarnings(),
        unlockedHands: r.unlockedHands(),
        speedLevel: r.speedLevel(),
        speedBonusLevel: r.speedBonusLevel(),
        cheapenLevel: r.cheapenLevel(),
        cheapenBonusLevel: r.cheapenBonusLevel(),
        slowdownLevel: r.slowdownLevel(),
        slowdownBonusLevel: r.slowdownBonusLevel(),
        slowdownUnlockLogged: r.slowdownUnlockLogged(),
        slowdownCompactionUnlockedLatched: r.slowdownCompactionUnlockedLatched(),
        timeWarpAuraActiveByHand: r.timeWarpAuraActiveByHand(),
        timeWarpAuraAppearedAtMsByHand: r.timeWarpAuraAppearedAtMsByHand(),
        timeWarpNextSpawnInSec: r.timeWarpNextSpawnInSec(),
        timeWarpUnlockLogged: r.timeWarpUnlockLogged(),
        autoBuyUnlocked: r.autoBuyUnlocked(),
        autoBuyEnabledByHand: r.autoBuyEnabledByHand(),
        autoBuyCountdownSecondsByHand: r.autoBuyCountdownSecondsByHand(),
        turboBoostMeter: r.turboBoostMeter(),
        turboBoostUnlocked: r.turboBoostUnlocked(),
        turboBoostEnabled: r.turboBoostEnabled(),
        turboActivationCount: r.turboActivationCount(),
        turboScensionBurnLevel: r.turboScensionBurnLevel(),
        turboScensionTankLevel: r.turboScensionTankLevel(),
        turboScensionMultLevel: r.turboScensionMultLevel(),
        turboScensionFillLevel: r.turboScensionFillLevel(),
        turboLevelerBank: r.turboLevelerBank(),
        turboLevelerPurchases: r.turboLevelerPurchases(),
        earnedComboNames: r.earnedComboNames(),
        comboActivationCounts: r.comboActivationCounts(),
        comboDiscoveryMilestonePendingQueue: r.comboDiscoveryMilestonePendingQueue(),
        comboDiscoveryMilestoneReadyAtMs: r.comboDiscoveryMilestoneReadyAtMs(),
        comboDiscoveryMilestoneCooldownSpanMs: r.comboDiscoveryMilestoneCooldownSpanMs(),
        adaptiveLastProgressAtMs: r.adaptiveLastProgressAtMs(),
        adaptiveLastHintAtMs: r.adaptiveLastHintAtMs(),
        previousTickActiveComboNames: r.previousTickActiveComboNames(),
        objectivesAchieved: r.objectivesAchieved(),
        longTermObjectivesAchieved: r.longTermObjectivesAchieved(),
        shownBannerIds: r.shownBannerIds(),
        closedBanners: r.closedBanners(),
        settings: r.settings(),
        numberModulesState: collectNumberModulesSaveState(/** @type {object} */ (r.numberModules())),
        number1RunPeakTotalCount: r.number1RunPeakTotalCount(),
        number1RunStartedAtMs: r.number1RunStartedAtMs(),
        number1AscensionEssence: r.number1AscensionEssence(),
        number1AscensionPendingBonusEssence: r.number1AscensionPendingBonusEssence(),
        number1AscensionClapEssenceMultiplier: r.number1AscensionClapEssenceMultiplier(),
        number1AscensionClapEssenceProcCount: r.number1AscensionClapEssenceProcCount(),
        number1HasAscended: r.number1HasAscended(),
        number1AscensionNodeIds: r.number1AscensionNodeIds(),
        number1AscensionBlackHoleLevel: r.number1AscensionBlackHoleLevel(),
        number1BlackHoleState: r.number1BlackHoleState(),
        unlockedHandsCap: r.unlockedHandsCap(),
        ascensionNumber1IntroSeen: r.ascensionNumber1IntroSeen(),
        ascensionTreeVersion: r.ascensionTreeVersion(),
        clapCooldownUntilMsByHand: r.clapCooldownUntilMsByHand(),
        totalPlayTimeMs: r.totalPlayTimeMs()
    };
}

/**
 * @param {Record<string, () => unknown>} read
 * @param {{
 *   ascensionTreeVersionExpected: string,
 *   comboActivationEdgeVersion: string,
 *   blackHoleMaxLevel: number,
 *   blackHoleEvaporationCap: number,
 *   comboDiscoveryCooldownBaseMs: number,
 *   comboDiscoveryCooldownMinMs: number
 * }} fixed
 */
export function buildNumber1NormalizeSnapshotOptions(read, fixed) {
    return {
        maxHands: /** @type {number} */ (read.maxHands()),
        ascensionTreeVersionExpected: fixed.ascensionTreeVersionExpected,
        comboActivationEdgeVersion: fixed.comboActivationEdgeVersion,
        blackHoleMaxLevel: fixed.blackHoleMaxLevel,
        blackHoleEvaporationCap: fixed.blackHoleEvaporationCap,
        comboDiscoveryCooldownBaseMs: fixed.comboDiscoveryCooldownBaseMs,
        comboDiscoveryCooldownMinMs: fixed.comboDiscoveryCooldownMinMs,
        settingsFallback: read.settings(),
        currentAscensionNumber1IntroSeen: /** @type {boolean} */ (read.ascensionNumber1IntroSeen()),
        currentEssenceForMerge: /** @type {number} */ (read.number1AscensionEssence()),
        fallbackAutoBuyEnabled: read.autoBuyEnabledByHand(),
        fallbackAutoBuyCountdown: read.autoBuyCountdownSecondsByHand(),
        nowMs: Date.now
    };
}

/**
 * @typedef {object} Number1OfflineAdvanceDeps
 * @property {() => object} getSettings
 * @property {(sec: number) => void} tickBackgroundNumberModules
 * @property {(sec: number) => void} updateBlackHolePhaseStep
 * @property {() => number} getBlackHolePhase
 * @property {(v: number) => void} setTotalChanges
 * @property {() => number} getTotalChanges
 * @property {{ phase7EpilogueCounter?: number }} getNumber1BlackHoleState
 * @property {(i: number, v: number) => void} setHandEarning
 * @property {(v: number) => void} setNumber1RunPeakTotalCount
 * @property {() => number} getNumber1RunPeakTotalCount
 * @property {() => number[]} getRawCpsPerHand
 * @property {(sec: number) => number} applyNumber1DetachedCpsProgress
 * @property {Element | null} offlineSummaryBodyEl
 * @property {Element | null} offlineSummaryPanelEl
 * @property {(n: number) => string} formatCount
 * @property {() => void} syncBlackHolePhase1Vfx
 */

/**
 * @param {Number1OfflineAdvanceDeps} d
 * @param {number} offlineMs
 * @param {{ showSummary?: boolean }} [opts]
 */
export function applyNumber1OfflineAdvance(d, offlineMs, opts) {
    const options = opts || {};
    const showSummary = options.showSummary !== false;
    const settings = d.getSettings();
    const capMs = Math.max(0, settings.offlineCapHours * 3600 * 1000);
    const effectiveMs = Math.min(Math.max(0, offlineMs), capMs);
    if (effectiveMs <= 0) return;
    const offlineSec = effectiveMs / 1000;
    d.tickBackgroundNumberModules(offlineSec);
    d.updateBlackHolePhaseStep(offlineSec);
    try {
        if (d.getBlackHolePhase() === 7) {
            const st = d.getNumber1BlackHoleState();
            const total = Math.floor(Number(st.phase7EpilogueCounter) || 0);
            d.setTotalChanges(total);
            d.setHandEarning(0, total);
            if (total > d.getNumber1RunPeakTotalCount()) d.setNumber1RunPeakTotalCount(total);
            return;
        }
        const cpsPerHandProbe = d.getRawCpsPerHand();
        const rawCpsProbe = cpsPerHandProbe.reduce((a, b) => a + b, 0);
        if (rawCpsProbe <= 0) return;
        const gained = d.applyNumber1DetachedCpsProgress(offlineSec);
        if (showSummary && d.offlineSummaryBodyEl && d.offlineSummaryPanelEl) {
            const capped = offlineMs > capMs;
            d.offlineSummaryBodyEl.textContent =
                "Simulated " +
                (effectiveMs / 1000).toFixed(1) +
                "s offline and gained " +
                d.formatCount(gained) +
                (capped ? " (capped)." : ".");
            d.offlineSummaryPanelEl.style.display = "flex";
        }
    } finally {
        d.syncBlackHolePhase1Vfx();
    }
}

/**
 * @param {object} parts
 * @param {() => object} parts.buildSavePayload
 * @param {() => object} parts.getNormalizeSnapshotOptions
 * @param {(snap: object) => void} parts.applySnapToRuntime
 * @param {(offlineMs: number, opts: object) => void} parts.applyOfflineAdvance
 * @param {() => Storage} parts.getLocalStorage
 * @param {() => boolean} parts.getSuppressAutosave
 */
export function createN1SaveOffline(parts) {
    const {
        buildSavePayload,
        getNormalizeSnapshotOptions,
        applySnapToRuntime,
        applyOfflineAdvance,
        getLocalStorage,
        getSuppressAutosave
    } = parts;

    function getSaveState(savedAt) {
        return createGameSaveState(savedAt, buildSavePayload());
    }

    function autosaveNow() {
        if (getSuppressAutosave()) return;
        writeSaveData(getLocalStorage(), getSaveState(Date.now()));
    }

    function applyLoadedState(data) {
        const snap = normalizeNumber1SaveSnapshot(data, getNormalizeSnapshotOptions());
        if (!snap) return;
        applySnapToRuntime(snap);
    }

    function applyOfflineProgress(offlineMs, opts) {
        applyOfflineAdvance(offlineMs, opts || {});
    }

    /**
     * @param {Window & typeof globalThis} win
     * @param {number} intervalMs
     */
    function registerWindowAutosave(win, intervalMs) {
        win.setInterval(autosaveNow, intervalMs);
        win.addEventListener("beforeunload", autosaveNow);
    }

    return {
        getSaveState,
        autosaveNow,
        applyLoadedState,
        applyOfflineProgress,
        registerWindowAutosave
    };
}
