import { describe, expect, it } from "vitest";
import {
    BASE_MAX_CHEAPEN_LEVEL,
    DEV_CHEAPEN_AUTOBUY_DELAY,
    DEV_SLOWDOWN_AUTOBUY_DELAY,
    MAX_SLOWDOWN_LEVEL,
    SLOWDOWN_UNLOCK_COUNT,
    getCheapenEffectTextForAchievedLevel,
    getCheapenMultiplierForLevel,
    getCheapenUpgradeCost,
    getEffectiveUpgradeLevel,
    getSlowdownMultiplierForLevel,
    getSlowdownUpgradeCost,
    getSpeedMultiplierBigForLevel,
    getSpeedMultiplierForLevel,
    getSpeedUpgradeCost
} from "./n1-upgrades.js";

describe("Number 1 upgrade helpers", () => {
    it("exports upgrade constants", () => {
        expect(BASE_MAX_CHEAPEN_LEVEL).toBe(10);
        expect(DEV_CHEAPEN_AUTOBUY_DELAY).toBe(0.1);
        expect(DEV_SLOWDOWN_AUTOBUY_DELAY).toBe(0.1);
        expect(SLOWDOWN_UNLOCK_COUNT).toBe(1e15);
        expect(MAX_SLOWDOWN_LEVEL).toBe(4);
    });

    it("computes speed levels, multipliers, and costs", () => {
        expect(getEffectiveUpgradeLevel(2, 3)).toBe(5);
        expect(getSpeedMultiplierForLevel(0)).toBe(1);
        expect(getSpeedMultiplierForLevel(5)).toBe(32);
        expect(getSpeedMultiplierBigForLevel(60)).toBe(1n << 60n);
        expect(getSpeedUpgradeCost(2, 1, 1)).toBe(26);
        expect(getSpeedUpgradeCost(2, 0.01, 1)).toBe(1);
    });

    it("computes cheapen multipliers, costs, and copy", () => {
        expect(getCheapenMultiplierForLevel(0)).toBe(1);
        expect(getCheapenMultiplierForLevel(1)).toBe(0.01);
        expect(getCheapenUpgradeCost(1)).toBe(1000);
        expect(getCheapenUpgradeCost(7)).toBe(1e9);
        expect(getCheapenUpgradeCost(10)).toBe(1.5e24);
        expect(getCheapenUpgradeCost(11)).toBe(1.5e27);
        expect(getCheapenEffectTextForAchievedLevel(0)).toBe("");
        expect(getCheapenEffectTextForAchievedLevel(1)).toBe("99% off speed upgrade cost");
        expect(getCheapenEffectTextForAchievedLevel(3)).toBe("99.99% off speed upgrade cost");
    });

    it("computes compaction multipliers and costs", () => {
        expect(getSlowdownMultiplierForLevel(0)).toBe(1);
        expect(getSlowdownMultiplierForLevel(3)).toBe(1000);
        expect(getSlowdownUpgradeCost(0, 4, 1)).toBeNull();
        expect(getSlowdownUpgradeCost(1, 4, 1)).toBe(1e16);
        expect(getSlowdownUpgradeCost(4, 4, 1)).toBe(10e24);
        expect(getSlowdownUpgradeCost(5, 4, 1)).toBeNull();
        expect(getSlowdownUpgradeCost(1, 4, 0.5)).toBe(5e15);
    });
});
