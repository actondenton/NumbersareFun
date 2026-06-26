import { describe, expect, it } from "vitest";

import {
    CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES,
    CLAP_UNLOCK_HANDS,
    getClapBonusChanceFromTotals,
    getClapCheapenBonusChanceFromTotals,
    getClapCooldownMsFromTotals,
    getClapEssenceProcChanceFromTotals,
    getClapEssenceProcMultiplierStepFromTotals,
    getClapSlowdownBonusChanceFromTotals,
    isClappingUnlockedForHands,
    runChanceChain
} from "./n1-clap.js";

describe("n1 clap helpers", () => {
    it("checks unlock threshold", () => {
        expect(isClappingUnlockedForHands(CLAP_UNLOCK_HANDS - 1)).toBe(false);
        expect(isClappingUnlockedForHands(CLAP_UNLOCK_HANDS)).toBe(true);
    });

    it("calculates capped chance and cooldown values from totals", () => {
        expect(getClapCooldownMsFromTotals({ clapCooldownMult: 0.1 })).toBe(2500);
        expect(getClapCooldownMsFromTotals({ clapCooldownMult: 0.5 })).toBe(5000);
        expect(getClapBonusChanceFromTotals({ clapBonusChanceAdd: 1 })).toBe(0.95);
        expect(getClapCheapenBonusChanceFromTotals({ clapCheapenBonusChanceAdd: -1 })).toBe(0);
        expect(getClapSlowdownBonusChanceFromTotals({ clapSlowdownBonusChanceAdd: 2 })).toBe(0.95);
        expect(getClapEssenceProcChanceFromTotals({ clapEssenceProcChanceAdd: 0.2 })).toBe(0.2);
        expect(getClapEssenceProcMultiplierStepFromTotals({ clapEssenceMultiplierStepAdd: -0.1 })).toBe(0);
    });

    it("runs chance chains with injected randomness", () => {
        let waves = 0;
        const rngValues = [0.01, 0.01, 0.2];
        const count = runChanceChain(true, true, CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES, () => {
            waves++;
        }, () => rngValues.shift() ?? 1);

        expect(count).toBe(2);
        expect(waves).toBe(2);
    });
});
