import { normalizeNumber1BlackHoleStateFromSaveData } from "./number1-black-hole.js";
import {
    COMBO_ACTIVATION_EDGE_SAVE_VERSION,
    applyAchievementFlags,
    hasPositiveNumberEntry,
    isSaveVersionAtLeast,
    mergeNumber1AscensionEssenceSaveValue,
    normalizeArrayFromSave,
    normalizeArrayPrefix,
    normalizeBooleanIfSaved,
    normalizeComboActivationCounts,
    normalizeFixedArray,
    normalizeFixedBooleanArray,
    normalizeFutureTimestampArray,
    normalizeNonNegativeInteger,
    normalizeNonNegativeNumber,
    normalizeNonNegativeTimestamp,
    normalizeNumberAtLeast,
    normalizeNumberInRange,
    normalizePositiveTimestamp,
    normalizePositiveTimestampArray,
    normalizeQueuedComboDiscoveryCooldownSpan,
    normalizeSettingsFromSave,
    normalizeStringArrayFromSave,
    normalizeStringQueue,
    normalizeStringSetFromSave,
    replaceArrayContents
} from "./n1-save.js";

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

    return {
        totalPlayTimeMs: normalizeNonNegativeNumber(data.totalPlayTimeMs),

        handEarnings: normalizeFixedArray(data.handEarnings, maxHands, 0),
        speedLevel: normalizeFixedArray(data.speedLevel, maxHands, 0),
        speedBonusLevel: normalizeFixedArray(data.speedBonusLevel, maxHands, 0) || Array(maxHands).fill(0),
        cheapenLevel: normalizeFixedArray(data.cheapenLevel, maxHands, 0),
        cheapenBonusLevel: normalizeFixedArray(data.cheapenBonusLevel, maxHands, 0) || Array(maxHands).fill(0),
        slowdownLevel: normalizeFixedArray(data.slowdownLevel, maxHands, 0),
        slowdownBonusLevel: normalizeFixedArray(data.slowdownBonusLevel, maxHands, 0) || Array(maxHands).fill(0),

        clapCooldownUntilMsByHand:
            normalizeFutureTimestampArray(data.clapCooldownUntilMsByHand, maxHands, nowMs) || Array(maxHands).fill(0),

        slowdownUnlockLogged: !!data.slowdownUnlockLogged,
        slowdownCompactionUnlockedLatched,

        timeWarpAuraActiveByHand:
            normalizeFixedBooleanArray(data.timeWarpAuraActiveByHand, maxHands, false),
        timeWarpAuraAppearedAtMsByHand:
            normalizePositiveTimestampArray(data.timeWarpAuraAppearedAtMsByHand, maxHands, 0) || Array(maxHands).fill(0),
        timeWarpNextSpawnInSec: normalizeNonNegativeNumber(data.timeWarpNextSpawnInSec),
        timeWarpUnlockLogged: !!data.timeWarpUnlockLogged,

        unlockedHandsCap,
        unlockedHands,

        autoBuyUnlocked: !!data.autoBuyUnlocked,
        autoBuyEnabledByHand:
            normalizeArrayPrefix(data.autoBuyEnabledByHand, maxHands, v => !!v) ??
            env.fallbackAutoBuyEnabled.slice(0, maxHands),
        autoBuyCountdownSecondsByHand:
            normalizeArrayPrefix(data.autoBuyCountdownSecondsByHand, maxHands, v => {
                const n = Number(v);
                return Number.isFinite(n) ? n : 0;
            }) ?? env.fallbackAutoBuyCountdown.slice(0, maxHands),

        turboBoostMeter: Number(data.turboBoostMeter) || 0,
        turboBoostUnlocked: !!data.turboBoostUnlocked,
        turboBoostEnabled: data.turboBoostEnabled !== false,
        turboActivationCount: normalizeNonNegativeInteger(data.turboActivationCount),
        turboScensionBurnLevel: normalizeNonNegativeInteger(data.turboScensionBurnLevel),
        turboScensionTankLevel: normalizeNonNegativeInteger(data.turboScensionTankLevel),
        turboScensionMultLevel: normalizeNonNegativeInteger(data.turboScensionMultLevel),
        turboScensionFillLevel: normalizeNonNegativeInteger(data.turboScensionFillLevel),
        turboLevelerBank: (() => {
            const b = Number(data.turboLevelerBank);
            return Number.isFinite(b) && b >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, b) : 0;
        })(),
        turboLevelerPurchases: normalizeNonNegativeInteger(data.turboLevelerPurchases),

        adaptiveLastProgressAtMs: normalizePositiveTimestamp(data.adaptiveLastProgressAtMs, nowMs),
        adaptiveLastHintAtMs: normalizePositiveTimestamp(data.adaptiveLastHintAtMs, 0),

        earnedComboNames: normalizeArrayFromSave(data.earnedComboNames),
        comboActivationCounts: normalizeComboActivationCounts(data.comboActivationEdgeVersion, data.comboActivationCounts, comboEdgeV),
        comboDiscoveryMilestonePendingQueue,
        comboDiscoveryMilestoneReadyAtMs,
        comboDiscoveryMilestoneCooldownSpanMs,

        previousTickActiveComboNames: normalizeStringSetFromSave(data.previousTickActiveComboNames),

        objectivesAchieved: Array.isArray(data.objectivesAchieved) ? data.objectivesAchieved : null,
        longTermObjectivesAchieved: Array.isArray(data.longTermObjectivesAchieved) ? data.longTermObjectivesAchieved : null,

        shownBannerIds: normalizeStringSetFromSave(data.shownBannerIds),
        closedBanners: normalizeArrayFromSave(data.closedBanners),

        settings: normalizeSettingsFromSave(data.settings, env.settingsFallback),

        numberModulesState: data.numberModulesState,

        mergedNumber1AscensionEssence: mergeNumber1AscensionEssenceSaveValue(data, env.currentEssenceForMerge),

        number1AscensionPendingBonusEssence: normalizeNonNegativeInteger(data.number1AscensionPendingBonusEssence),
        number1AscensionClapEssenceMultiplier: normalizeNumberAtLeast(data.number1AscensionClapEssenceMultiplier, 1, 1),
        number1AscensionClapEssenceProcCount: normalizeNonNegativeInteger(data.number1AscensionClapEssenceProcCount),
        number1HasAscended: !!data.number1HasAscended,

        number1AscensionNodeIds: treeOk ? normalizeStringArrayFromSave(data.number1AscensionNodeIds) : [],
        ascensionNodesLoadedFromSave: treeOk,

        ascensionNumber1IntroSeen: normalizeBooleanIfSaved(
            data.ascensionNumber1IntroSeen,
            env.currentAscensionNumber1IntroSeen
        ),
        number1AscensionBlackHoleLevel,

        number1BlackHoleState: normalizedBlackHoleState,

        number1RunPeakTotalCount: normalizeNonNegativeInteger(
            data.number1RunPeakTotalCount,
            0,
            env.blackHoleEvaporationCap
        )
    };
}

/** Matches legacy-boot fixup: active aura rows need a positive appeared timestamp after load. */
export function patchTimeWarpAuraAppearedForActiveHands(timeWarpAuraActiveByHand, timeWarpAuraAppearedAtMsByHand, unlockedHands, nowMs = Date.now()) {
    while (timeWarpAuraAppearedAtMsByHand.length < timeWarpAuraActiveByHand.length) {
        timeWarpAuraAppearedAtMsByHand.push(0);
    }
    const n = Math.min(unlockedHands | 0, timeWarpAuraActiveByHand.length, timeWarpAuraAppearedAtMsByHand.length);
    for (let i = 0; i < n; i++) {
        if (timeWarpAuraActiveByHand[i] && !(timeWarpAuraAppearedAtMsByHand[i] > 0)) {
            timeWarpAuraAppearedAtMsByHand[i] = nowMs;
        }
    }
}

/** @param {{ objectives: { achieved?: boolean }[], longTermObjectives: { achieved?: boolean }[] }} lists */
export function applyObjectiveFlagsFromSnapshot(snap, lists) {
    if (snap.objectivesAchieved) applyAchievementFlags(lists.objectives, snap.objectivesAchieved);
    if (snap.longTermObjectivesAchieved) applyAchievementFlags(lists.longTermObjectives, snap.longTermObjectivesAchieved);
}

export function replaceEarnedComboNamesFromSnapshot(target, earnedComboNames) {
    if (Array.isArray(earnedComboNames)) replaceArrayContents(target, earnedComboNames);
}

export function replaceClosedBannersFromSnapshot(target, closedBanners) {
    if (Array.isArray(closedBanners)) replaceArrayContents(target, closedBanners);
}
