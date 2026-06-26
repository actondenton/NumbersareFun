export const TIME_WARP_UNLOCK_COUNT = 1e18;
export const TIME_WARP_SECONDS_BONUS = 60;
export const TIME_WARP_MANUAL_CLICK_SCALE = 10;
export const TIME_WARP_OVERFLOW_BASE_RATIO = 0.25;
export const WARP_POTENCY_TIER1_SEC = 10;
export const WARP_POTENCY_TIER2_SEC = 100;
export const WARP_POTENCY_TIER3_SEC = 1000;

export function getTimeWarpProductionSecondsBonusFromTotals(totals) {
    const s = totals && totals.warpManualGrantSeconds;
    return Number.isFinite(s) && s >= 60 ? s : TIME_WARP_SECONDS_BONUS;
}

export function getTimeWarpOverflowRatioFromTotals(totals) {
    const w = Number(totals && totals.warpOverflow) || 0;
    let r = Math.min(0.9, TIME_WARP_OVERFLOW_BASE_RATIO + w * 0.05);
    if (totals && totals.warpFactor36AllHandsOverflow) r *= 0.75;
    return r;
}

export function getTimeWarpAuraSpawnSpanMaxSecFromTotals(totals) {
    const m = (totals && totals.warpSpawnIntervalMult) || 1;
    return Math.max(1, 60 * m);
}

export function getWarpPotencyMaxTiersFromTotals(totals) {
    const raw = Math.floor(Number(totals && totals.warpPotencyMaxTiers) || 0);
    return Math.max(0, Math.min(3, raw));
}

export function getWarpPotencyTier(elapsedSec, cap) {
    if (cap >= 3 && elapsedSec >= WARP_POTENCY_TIER3_SEC) return 3;
    if (cap >= 2 && elapsedSec >= WARP_POTENCY_TIER2_SEC) return 2;
    if (cap >= 1 && elapsedSec >= WARP_POTENCY_TIER1_SEC) return 1;
    return 0;
}

export function getWarpPotencyMultiplierForTier(tier) {
    return Math.pow(2, Math.max(0, tier | 0));
}

export function getAscensionComboTimeWarpDelayReductionPerTriggerSecFromTotals(totals) {
    const base = Number(totals && totals.comboTimeWarpDelayReduceSec) || 0;
    const mult = Number(totals && totals.comboTimeWarpDelayReduceMult) || 1;
    if (base <= 0 || mult <= 0) return 0;
    return base * mult;
}

export function applyTimeWarpDelayReductionCountdown(currentSeconds, newComboTriggerCount, perTriggerSeconds) {
    if (newComboTriggerCount <= 0 || perTriggerSeconds <= 0 || !(currentSeconds > 0)) return currentSeconds;
    const minLeft = 1e-4;
    return Math.max(minLeft, currentSeconds - perTriggerSeconds * newComboTriggerCount);
}
