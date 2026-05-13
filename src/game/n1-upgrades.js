export const BASE_MAX_CHEAPEN_LEVEL = 10;
export const DEV_CHEAPEN_AUTOBUY_DELAY = 0.1;
export const DEV_SLOWDOWN_AUTOBUY_DELAY = 0.1;
export const SLOWDOWN_UNLOCK_COUNT = 1e15;
export const MAX_SLOWDOWN_LEVEL = 4;

const CHEAPEN_EXTENDED_COST_BASE = 1e9;
const CHEAPEN_LEGACY_MAX_NEXT_LEVEL = 6;
const CHEAPEN_EXTENDED_START_NEXT_LEVEL = 7;
const CHEAPEN_COST_LEVEL_10_RAW = 1.5e24;
const CHEAPEN_COST_RAW_BY_NEXT_LEVEL = [
    1.5e27,
    1.5e30,
    1.5e33,
    1.5e36,
    1.5e39,
    1.5e42
];

const SLOWDOWN_COSTS = [1e16, 1e19, 1e22];
const SLOWDOWN_COST_LEVEL_4_RAW = 10e24;

export function getEffectiveUpgradeLevel(baseLevel, bonusLevel) {
    return Math.max(0, (baseLevel ?? 0) + (bonusLevel ?? 0));
}

export function getSpeedMultiplierForLevel(level) {
    if (level === 0) return 1;
    return Math.pow(2, level);
}

/** Exact 2^level for tick math (float Math.pow loses integers past ~2^53). */
export function getSpeedMultiplierBigForLevel(level) {
    const lv = level | 0;
    if (lv <= 0) return 1n;
    return 1n << BigInt(lv);
}

export function getSpeedUpgradeCost(nextLevel, cheapenMultiplier, ascensionSpeedCostMultiplier) {
    const baseCost = 10 + Math.floor(Math.pow(4, nextLevel));
    return Math.max(1, Math.floor(baseCost * cheapenMultiplier * ascensionSpeedCostMultiplier));
}

export function getCheapenMultiplierForLevel(level) {
    return level === 0 ? 1 : Math.pow(10, -(level + 1));
}

export function getCheapenUpgradeCost(nextLevel) {
    const n = Math.max(1, Math.floor(Number(nextLevel) || 1));
    if (n <= CHEAPEN_LEGACY_MAX_NEXT_LEVEL) {
        return 1000 * Math.pow(10, n - 1);
    }
    if (n === 10) {
        return Math.floor(CHEAPEN_COST_LEVEL_10_RAW);
    }
    if (n > 10) {
        const idx = n - 11;
        if (idx >= 0 && idx < CHEAPEN_COST_RAW_BY_NEXT_LEVEL.length) {
            return Math.floor(CHEAPEN_COST_RAW_BY_NEXT_LEVEL[idx]);
        }
        const last = CHEAPEN_COST_RAW_BY_NEXT_LEVEL[CHEAPEN_COST_RAW_BY_NEXT_LEVEL.length - 1];
        const extraTiers = idx - CHEAPEN_COST_RAW_BY_NEXT_LEVEL.length + 1;
        return Math.floor(last * Math.pow(1000, extraTiers));
    }
    return Math.floor(CHEAPEN_EXTENDED_COST_BASE * Math.pow(1000, n - CHEAPEN_EXTENDED_START_NEXT_LEVEL));
}

/** Discount / wording for a given achieved Cheapen level (1...cap). */
export function getCheapenEffectTextForAchievedLevel(level) {
    if (level <= 0) return "";
    if (level === 1) return "99% off speed upgrade cost";
    const decimals = level - 1;
    return "99." + "9".repeat(decimals) + "% off speed upgrade cost";
}

export function getSlowdownMultiplierForLevel(level) {
    if (level <= 0) return 1;
    return Math.pow(10, level);
}

export function getSlowdownUpgradeCost(nextLevel, cap, ascensionCostMultiplier) {
    if (nextLevel <= 0 || nextLevel > cap) return null;
    let raw;
    if (nextLevel === 4) {
        raw = SLOWDOWN_COST_LEVEL_4_RAW;
    } else {
        const idx = Math.min(SLOWDOWN_COSTS.length - 1, nextLevel - 1);
        raw = SLOWDOWN_COSTS[idx] * Math.pow(10, Math.max(0, nextLevel - SLOWDOWN_COSTS.length));
    }
    return Math.max(1, Math.floor(raw * (ascensionCostMultiplier || 1)));
}
