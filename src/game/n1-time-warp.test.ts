import { describe, expect, it } from "vitest";
import {
    TIME_WARP_MANUAL_CLICK_SCALE,
    TIME_WARP_SECONDS_BONUS,
    TIME_WARP_UNLOCK_COUNT,
    WARP_POTENCY_TIER1_SEC,
    WARP_POTENCY_TIER2_SEC,
    WARP_POTENCY_TIER3_SEC,
    applyTimeWarpDelayReductionCountdown,
    getAscensionComboTimeWarpDelayReductionPerTriggerSecFromTotals,
    getTimeWarpAuraSpawnSpanMaxSecFromTotals,
    getTimeWarpOverflowRatioFromTotals,
    getTimeWarpProductionSecondsBonusFromTotals,
    getWarpPotencyMaxTiersFromTotals,
    getWarpPotencyMultiplierForTier,
    getWarpPotencyTier
} from "./n1-time-warp.js";

describe("Number 1 Time Warp helpers", () => {
    it("exports Time Warp constants", () => {
        expect(TIME_WARP_UNLOCK_COUNT).toBe(1e18);
        expect(TIME_WARP_SECONDS_BONUS).toBe(60);
        expect(TIME_WARP_MANUAL_CLICK_SCALE).toBe(10);
        expect(WARP_POTENCY_TIER1_SEC).toBe(10);
        expect(WARP_POTENCY_TIER2_SEC).toBe(100);
        expect(WARP_POTENCY_TIER3_SEC).toBe(1000);
    });

    it("computes manual seconds, overflow ratios, and aura spawn spans", () => {
        expect(getTimeWarpProductionSecondsBonusFromTotals({ warpManualGrantSeconds: 30 })).toBe(60);
        expect(getTimeWarpProductionSecondsBonusFromTotals({ warpManualGrantSeconds: 90 })).toBe(90);
        expect(getTimeWarpOverflowRatioFromTotals({ warpOverflow: 2 })).toBe(0.35);
        expect(getTimeWarpOverflowRatioFromTotals({ warpOverflow: 20 })).toBe(0.9);
        expect(getTimeWarpOverflowRatioFromTotals({ warpOverflow: 20, warpFactor36AllHandsOverflow: true })).toBe(0.675);
        expect(getTimeWarpAuraSpawnSpanMaxSecFromTotals({ warpSpawnIntervalMult: 0.25 })).toBe(15);
        expect(getTimeWarpAuraSpawnSpanMaxSecFromTotals({ warpSpawnIntervalMult: 0 })).toBe(60);
    });

    it("computes potency tiers and multipliers", () => {
        expect(getWarpPotencyMaxTiersFromTotals({ warpPotencyMaxTiers: 99 })).toBe(3);
        expect(getWarpPotencyMaxTiersFromTotals({ warpPotencyMaxTiers: -1 })).toBe(0);
        expect(getWarpPotencyTier(9, 3)).toBe(0);
        expect(getWarpPotencyTier(10, 3)).toBe(1);
        expect(getWarpPotencyTier(100, 3)).toBe(2);
        expect(getWarpPotencyTier(1000, 3)).toBe(3);
        expect(getWarpPotencyTier(1000, 2)).toBe(2);
        expect(getWarpPotencyMultiplierForTier(3)).toBe(8);
    });

    it("computes combo delay reductions", () => {
        expect(getAscensionComboTimeWarpDelayReductionPerTriggerSecFromTotals({
            comboTimeWarpDelayReduceSec: 2,
            comboTimeWarpDelayReduceMult: 3
        })).toBe(6);
        expect(getAscensionComboTimeWarpDelayReductionPerTriggerSecFromTotals({
            comboTimeWarpDelayReduceSec: -1,
            comboTimeWarpDelayReduceMult: 3
        })).toBe(0);
        expect(applyTimeWarpDelayReductionCountdown(10, 2, 3)).toBe(4);
        expect(applyTimeWarpDelayReductionCountdown(1, 2, 3)).toBe(1e-4);
        expect(applyTimeWarpDelayReductionCountdown(0, 2, 3)).toBe(0);
    });
});
