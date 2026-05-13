import { describe, expect, it } from "vitest";
import {
    ASCENSION_1_MIN_HANDS,
    ASCENSION_1_REQUIRED_TOTAL,
    computeNumber1AscensionBaseGain,
    computeNumber1AscensionGain,
    computeNumber1AscensionGainBreakdown,
    getNumber1AscensionClapEssenceMultiplier,
    getNumber1AscensionPendingBonusEssence,
    getNumber1AscensionRequiredHands,
    isNumber1AscensionReady
} from "./n1-ascension.js";

describe("Number 1 ascension helpers", () => {
    it("exports the Number 1 ascension requirements", () => {
        expect(ASCENSION_1_MIN_HANDS).toBe(10);
        expect(ASCENSION_1_REQUIRED_TOTAL).toBe(1e35);
    });

    it("keeps essence scaling anchored across early and deep runs", () => {
        expect(computeNumber1AscensionBaseGain(1)).toBe(1);
        expect(computeNumber1AscensionBaseGain(1e35)).toBe(35);
        expect(computeNumber1AscensionBaseGain(1e42)).toBe(75);
        expect(computeNumber1AscensionBaseGain(1e100)).toBe(1000);
        expect(computeNumber1AscensionBaseGain(1e120)).toBeGreaterThan(1000);
    });

    it("normalizes pending bonus essence and clap multipliers", () => {
        expect(getNumber1AscensionPendingBonusEssence(2.9)).toBe(2);
        expect(getNumber1AscensionPendingBonusEssence(-1)).toBe(0);
        expect(getNumber1AscensionClapEssenceMultiplier(1.5)).toBe(1.5);
        expect(getNumber1AscensionClapEssenceMultiplier(0.5)).toBe(1);
        expect(getNumber1AscensionClapEssenceMultiplier(Number.NaN)).toBe(1);
    });

    it("breaks down black-hole and clap bonuses without mutating inputs", () => {
        const breakdown = computeNumber1AscensionGainBreakdown(1e35, {
            pendingBonus: 5,
            blackHolePhase1Mult: 1.5,
            blackHoleParallelBonus: 0.25,
            blackHoleFurnaceBonus: 0.25,
            clapMult: 2
        });

        expect(breakdown).toMatchObject({
            baseGain: 35,
            pendingBonus: 5,
            blackHolePhase1Mult: 1.5,
            blackHoleParallelBonus: 0.25,
            blackHoleFurnaceBonus: 0.25,
            blackHolePhaseMult: 2,
            blackHoleMultiplierBonus: 40,
            beforeMult: 80,
            clapMult: 2,
            multiplierBonus: 80,
            finalGain: 160
        });
        expect(computeNumber1AscensionGain(1e35, { pendingBonus: 5 })).toBe(40);
    });

    it("allows one-hand ascension only during black-hole phases 5 and 6", () => {
        expect(getNumber1AscensionRequiredHands(0)).toBe(10);
        expect(getNumber1AscensionRequiredHands(5)).toBe(1);
        expect(getNumber1AscensionRequiredHands(6)).toBe(1);
        expect(getNumber1AscensionRequiredHands(7)).toBe(10);
    });

    it("checks readiness from explicit state", () => {
        expect(isNumber1AscensionReady({
            phase: 0,
            unlockedHands: 10,
            totalChanges: ASCENSION_1_REQUIRED_TOTAL
        })).toBe(true);
        expect(isNumber1AscensionReady({
            phase: 0,
            unlockedHands: 9,
            totalChanges: ASCENSION_1_REQUIRED_TOTAL
        })).toBe(false);
        expect(isNumber1AscensionReady({
            phase: 5,
            unlockedHands: 1,
            totalChanges: ASCENSION_1_REQUIRED_TOTAL
        })).toBe(true);
        expect(isNumber1AscensionReady({
            phase: 7,
            unlockedHands: 10,
            totalChanges: ASCENSION_1_REQUIRED_TOTAL
        })).toBe(false);
    });
});
