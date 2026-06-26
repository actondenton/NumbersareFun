import { describe, expect, it } from "vitest";

import { createNumber1RateTickBoot } from "./n1-rate-tick-boot.js";

function baseDeps() {
    return {
        getUnlockedHands: () => 2,
        getHands: () => [{ baseSpeed: 1000 }, { baseSpeed: 1000 }],
        getSpeedMultiplier: (i: number) => (i === 0 ? 2 : 4),
        getSlowdownMultiplier: () => 10,
        formatCount: (n: number | bigint | string) => String(n),
        getComboMultiplier: () => 3,
        getTurboCountMultiplier: () => 5,
        getNumber1BlackHoleProductionMult: () => 7,
        isSlowdownUnlocked: () => true,
        getTurboBoostUnlocked: () => true
    };
}

describe("createNumber1RateTickBoot", () => {
    it("computes tick interval from base speed and speed multiplier", () => {
        const b = createNumber1RateTickBoot(baseDeps());
        expect(b.getTickIntervalMs(1000, 0)).toBe(500);
        expect(b.getTickIntervalMs(1000, 1)).toBe(250);
    });

    it("raw CPS embeds slowdown; effective CPS applies combo × turbo × BH", () => {
        const b = createNumber1RateTickBoot(baseDeps());
        // hand 0: 1000/2 = 500ms tick → 2/s × slow 10 = 20/s raw
        expect(b.getHandPerHandRawCps(0)).toBe(20);
        expect(b.getHandEffectiveCps(0)).toBe(20 * 3 * 5 * 7);
    });

    it("hides turbo factor in multiplier display when turbo is not unlocked for UI", () => {
        const b = createNumber1RateTickBoot({
            ...baseDeps(),
            getTurboBoostUnlocked: () => false
        });
        expect(b.getHandTurboFactorForDisplay()).toBe(1);
    });

    it("getRawCpsPerHand returns one entry per unlocked hand", () => {
        const b = createNumber1RateTickBoot({
            ...baseDeps(),
            getUnlockedHands: () => 1,
            getHands: () => [{ baseSpeed: 1000 }]
        });
        expect(b.getRawCpsPerHand()).toEqual([20]);
    });
});
