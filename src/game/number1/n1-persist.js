import { createGameSaveState } from "../n1-save.js";
import {
    normalizeNumber1SaveSnapshot,
    replaceClosedBannersFromSnapshot,
    replaceEarnedComboNamesFromSnapshot
} from "../n1-state-apply.js";
import { copyAutobuyArraysFromSave } from "./upgrades/n1-autobuy-state.js";
import { hydrateObjectiveFlagsFromSnapshot } from "./state/n1-objectives-store.js";

function copyUpgradeLevelsFromSnap(target, snapArr) {
    if (!snapArr) return;
    for (let i = 0; i < target.length; i++) target[i] = snapArr[i] || 0;
}

/** In-place copy so stale boot closures keep mutating the live array. */
function copyHandsRtArrayFromSnap(target, snapArr, fillValue = 0) {
    if (!Array.isArray(target) || !Array.isArray(snapArr)) return;
    for (let i = 0; i < target.length; i++) {
        target[i] = i < snapArr.length ? (snapArr[i] ?? fillValue) : fillValue;
    }
}

/**
 * Env bag for `normalizeNumber1SaveSnapshot` during load.
 * @param {{
 *   maxHands: number,
 *   ascensionTreeVersionExpected: number,
 *   comboActivationEdgeVersion: number,
 *   blackHoleMaxLevel: number,
 *   blackHoleEvaporationCap: number,
 *   comboDiscoveryCooldownBaseMs: number,
 *   comboDiscoveryCooldownMinMs: number,
 *   session: { settings: unknown },
 *   ascension: { ascensionNumber1IntroSeen: boolean, number1AscensionEssence: number },
 *   autobuy: { autoBuyEnabledByHand: boolean[], autoBuyCountdownSecondsByHand: number[] },
 *   nowMs?: number
 * }} ctx
 */
export function createNumber1HydrateEnv(ctx) {
    return {
        maxHands: ctx.maxHands,
        ascensionTreeVersionExpected: ctx.ascensionTreeVersionExpected,
        comboActivationEdgeVersion: ctx.comboActivationEdgeVersion,
        blackHoleMaxLevel: ctx.blackHoleMaxLevel,
        blackHoleEvaporationCap: ctx.blackHoleEvaporationCap,
        comboDiscoveryCooldownBaseMs: ctx.comboDiscoveryCooldownBaseMs,
        comboDiscoveryCooldownMinMs: ctx.comboDiscoveryCooldownMinMs,
        settingsFallback: ctx.session.settings,
        currentAscensionNumber1IntroSeen: ctx.ascension.ascensionNumber1IntroSeen,
        currentEssenceForMerge: ctx.ascension.number1AscensionEssence,
        fallbackAutoBuyEnabled: ctx.autobuy.autoBuyEnabledByHand,
        fallbackAutoBuyCountdown: ctx.autobuy.autoBuyCountdownSecondsByHand,
        nowMs: ctx.nowMs ?? Date.now()
    };
}

/**
 * Pure hydrate: JSON snapshot → runtime store fields. No DOM or HandCounter wiring.
 * @returns {import("../n1-state-apply.js").ReturnType<typeof normalizeNumber1SaveSnapshot> | null}
 */
export function hydrateNumber1RuntimeFromSave(runtime, rawSave, env) {
    const snap = normalizeNumber1SaveSnapshot(rawSave, env);
    if (!snap) return null;

    const { run, ascension, blackHole, turbo, session, upgrades, autobuy, timewarp, hands: handsRt, combo, story, objectives } = runtime;

    if (snap.handEarnings) run.handEarnings = snap.handEarnings;
    run.slowdownCompactionUnlockedLatched = snap.slowdownCompactionUnlockedLatched;
    run.unlockedHandsCap = snap.unlockedHandsCap;
    run.unlockedHands = snap.unlockedHands;
    run.number1RunPeakTotalCount = snap.number1RunPeakTotalCount;

    turbo.turboBoostMeter = snap.turboBoostMeter;
    turbo.turboBoostUnlocked = snap.turboBoostUnlocked;
    turbo.turboBoostEnabled = snap.turboBoostEnabled;
    turbo.turboActivationCount = snap.turboActivationCount;
    turbo.turboScensionBurnLevel = snap.turboScensionBurnLevel;
    turbo.turboScensionTankLevel = snap.turboScensionTankLevel;
    turbo.turboScensionMultLevel = snap.turboScensionMultLevel;
    turbo.turboScensionFillLevel = snap.turboScensionFillLevel;
    turbo.turboLevelerBank = snap.turboLevelerBank;
    turbo.turboLevelerPurchases = snap.turboLevelerPurchases;

    session.settings = snap.settings || session.settings;

    ascension.number1AscensionEssence = snap.mergedNumber1AscensionEssence;
    ascension.number1AscensionPendingBonusEssence = snap.number1AscensionPendingBonusEssence;
    ascension.number1AscensionClapEssenceMultiplier = snap.number1AscensionClapEssenceMultiplier;
    ascension.number1AscensionClapEssenceProcCount = snap.number1AscensionClapEssenceProcCount;
    ascension.number1HasAscended = snap.number1HasAscended;
    ascension.number1AscensionNodeIds = snap.ascensionNodesLoadedFromSave ? [...snap.number1AscensionNodeIds] : [];
    ascension.ascensionNumber1IntroSeen = snap.ascensionNumber1IntroSeen;

    blackHole.number1AscensionBlackHoleLevel = snap.number1AscensionBlackHoleLevel;
    blackHole.number1BlackHoleState = snap.number1BlackHoleState;

    if (typeof snap.autoBuyUnlocked === "boolean") {
        autobuy.autoBuyUnlocked = snap.autoBuyUnlocked;
    }
    copyAutobuyArraysFromSave(
        autobuy.autoBuyEnabledByHand,
        autobuy.autoBuyCountdownSecondsByHand,
        snap.autoBuyEnabledByHand,
        snap.autoBuyCountdownSecondsByHand
    );

    copyUpgradeLevelsFromSnap(upgrades.cheapenLevel, snap.cheapenLevel);
    copyUpgradeLevelsFromSnap(upgrades.cheapenBonusLevel, snap.cheapenBonusLevel);
    copyUpgradeLevelsFromSnap(upgrades.slowdownLevel, snap.slowdownLevel);
    copyUpgradeLevelsFromSnap(upgrades.slowdownBonusLevel, snap.slowdownBonusLevel);
    upgrades.slowdownUnlockLogged = snap.slowdownUnlockLogged;

    timewarp.timeWarpNextSpawnInSec = snap.timeWarpNextSpawnInSec;
    timewarp.timeWarpUnlockLogged = snap.timeWarpUnlockLogged;
    if (snap.timeWarpAuraActiveByHand) {
        timewarp.timeWarpAuraActiveByHand = snap.timeWarpAuraActiveByHand;
    }
    if (snap.timeWarpAuraAppearedAtMsByHand) {
        timewarp.timeWarpAuraAppearedAtMsByHand = snap.timeWarpAuraAppearedAtMsByHand;
    }

    if (snap.speedLevel) copyHandsRtArrayFromSnap(handsRt.speedLevel, snap.speedLevel, 0);
    if (snap.speedBonusLevel) copyHandsRtArrayFromSnap(handsRt.speedBonusLevel, snap.speedBonusLevel, 0);
    if (snap.clapCooldownUntilMsByHand) {
        copyHandsRtArrayFromSnap(handsRt.clapCooldownUntilMsByHand, snap.clapCooldownUntilMsByHand, 0);
    }
    for (let i = 0; i < handsRt.clapDigitPrevious.length; i++) handsRt.clapDigitPrevious[i] = -1;

    if (snap.earnedComboNames) {
        replaceEarnedComboNamesFromSnapshot(combo.earnedComboNames, snap.earnedComboNames);
    }
    if (snap.comboActivationCounts) {
        combo.comboActivationCounts = snap.comboActivationCounts;
    }
    if (snap.comboDiscoveryMilestonePendingQueue) {
        combo.comboDiscoveryMilestonePendingQueue = snap.comboDiscoveryMilestonePendingQueue;
    }
    combo.comboDiscoveryMilestoneReadyAtMs = snap.comboDiscoveryMilestoneReadyAtMs;
    combo.comboDiscoveryMilestoneCooldownSpanMs = snap.comboDiscoveryMilestoneCooldownSpanMs;
    if (snap.previousTickActiveComboNames) {
        combo.previousTickActiveComboNames = snap.previousTickActiveComboNames;
    }

    if (snap.shownBannerIds) {
        story.shownBannerIds.clear();
        snap.shownBannerIds.forEach(id => story.shownBannerIds.add(id));
    }
    replaceClosedBannersFromSnapshot(story.closedBanners, snap.closedBanners);

    hydrateObjectiveFlagsFromSnapshot(snap, objectives);

    return snap;
}

/**
 * Runtime-owned fields for Number 1 save envelope (non-runtime arrays passed via `extra`).
 * @param {ReturnType<import("./n1-runtime.js").createNumber1Runtime>} runtime
 * @param {Record<string, unknown>} [extra]
 */
export function serializeNumber1RuntimeFields(runtime, extra = {}) {
    const { run, ascension, blackHole, turbo, session, upgrades, autobuy, timewarp, hands: handsRt, combo, story, objectives } = runtime;
    return {
        handEarnings: run.handEarnings,
        unlockedHands: run.unlockedHands,
        unlockedHandsCap: run.unlockedHandsCap,
        slowdownCompactionUnlockedLatched: run.slowdownCompactionUnlockedLatched,
        number1RunPeakTotalCount: run.number1RunPeakTotalCount,
        turboBoostMeter: turbo.turboBoostMeter,
        turboBoostUnlocked: turbo.turboBoostUnlocked,
        turboBoostEnabled: turbo.turboBoostEnabled,
        turboActivationCount: turbo.turboActivationCount,
        turboScensionBurnLevel: turbo.turboScensionBurnLevel,
        turboScensionTankLevel: turbo.turboScensionTankLevel,
        turboScensionMultLevel: turbo.turboScensionMultLevel,
        turboScensionFillLevel: turbo.turboScensionFillLevel,
        turboLevelerBank: turbo.turboLevelerBank,
        turboLevelerPurchases: turbo.turboLevelerPurchases,
        settings: session.settings,
        number1AscensionEssence: ascension.number1AscensionEssence,
        number1AscensionPendingBonusEssence: ascension.number1AscensionPendingBonusEssence,
        number1AscensionClapEssenceMultiplier: ascension.number1AscensionClapEssenceMultiplier,
        number1AscensionClapEssenceProcCount: ascension.number1AscensionClapEssenceProcCount,
        number1HasAscended: ascension.number1HasAscended,
        number1AscensionNodeIds: ascension.number1AscensionNodeIds,
        number1AscensionBlackHoleLevel: Math.floor(Number(blackHole.number1BlackHoleState.phase2Mass) || 0),
        number1BlackHoleState: blackHole.number1BlackHoleState,
        ascensionNumber1IntroSeen: ascension.ascensionNumber1IntroSeen,
        cheapenLevel: upgrades.cheapenLevel,
        cheapenBonusLevel: upgrades.cheapenBonusLevel,
        slowdownLevel: upgrades.slowdownLevel,
        slowdownBonusLevel: upgrades.slowdownBonusLevel,
        slowdownUnlockLogged: upgrades.slowdownUnlockLogged,
        autoBuyUnlocked: autobuy.autoBuyUnlocked,
        autoBuyEnabledByHand: autobuy.autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand: autobuy.autoBuyCountdownSecondsByHand,
        timeWarpAuraActiveByHand: timewarp.timeWarpAuraActiveByHand,
        timeWarpAuraAppearedAtMsByHand: timewarp.timeWarpAuraAppearedAtMsByHand,
        timeWarpNextSpawnInSec: timewarp.timeWarpNextSpawnInSec,
        timeWarpUnlockLogged: timewarp.timeWarpUnlockLogged,
        speedLevel: handsRt.speedLevel,
        speedBonusLevel: handsRt.speedBonusLevel,
        clapCooldownUntilMsByHand: handsRt.clapCooldownUntilMsByHand,
        earnedComboNames: combo.earnedComboNames,
        comboActivationCounts: combo.comboActivationCounts,
        comboDiscoveryMilestonePendingQueue: combo.comboDiscoveryMilestonePendingQueue,
        comboDiscoveryMilestoneReadyAtMs: combo.comboDiscoveryMilestoneReadyAtMs,
        comboDiscoveryMilestoneCooldownSpanMs: combo.comboDiscoveryMilestoneCooldownSpanMs,
        previousTickActiveComboNames: Array.from(combo.previousTickActiveComboNames),
        shownBannerIds: Array.from(story.shownBannerIds),
        closedBanners: story.closedBanners,
        objectivesAchieved: objectives.objectivesAchieved,
        longTermObjectivesAchieved: objectives.longTermObjectivesAchieved,
        ...extra
    };
}

/**
 * Full Number 1 save envelope (runtime fields + boot `extra` such as number modules).
 * @param {number} savedAt
 * @param {ReturnType<import("./state/n1-runtime.js").createNumber1Runtime>} runtime
 * @param {Record<string, unknown>} [extra]
 */
export function createNumber1SaveState(savedAt, runtime, extra = {}) {
    return createGameSaveState(savedAt, serializeNumber1RuntimeFields(runtime, extra));
}
