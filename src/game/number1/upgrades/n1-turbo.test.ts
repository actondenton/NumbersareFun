import { describe, expect, it } from "vitest";

import {
    getTurboBoostMultiplierFromState,
    getTurboBurnDrainForStep,
    getTurboComboPointsForMinHands,
    getTurboCountMultiplierMaxFromState,
    getTurboDrainPiecewiseMultiplier,
    getTurboLevelerNextPointCost,
    getTurboMeterMaxFromState,
    getTurboNominalBurnPerSecFromState,
    getTurboScensionActivationCostFromTotals,
    earnFractionalTurboActivations,
    getTurboActivationEarnMultFromBonus,
    turboMeterCurveScaleFromTotals
} from "./n1-turbo.js";

describe("n1 turbo helpers", () => {
    it("scales meter capacity from ascension totals and tank levels", () => {
        const totals = { turboScaling: 2, turboTankSizeMult: 1.5 };

        expect(turboMeterCurveScaleFromTotals(totals)).toBe(150);
        expect(getTurboMeterMaxFromState(totals, 2)).toBe(900);
    });

    it("calculates combo meter points with fill and ascension bonuses", () => {
        const totals = {
            comboTurboPointsMult: 2,
            turboBoostComboFillAdd: 3,
            turboMeterFromComboMult: 1.5
        };

        expect(getTurboComboPointsForMinHands(6, totals, 1)).toBeCloseTo(105);
    });

    it("calculates multiplier and burn drain from current turbo state", () => {
        const totals = { turboBurnRateMult: 1, turboBurnEfficiencyReduceSum: 0.25, turboMeterDrainMult: 0.5 };
        const nominalBurnPerSec = getTurboNominalBurnPerSecFromState(totals, 1);
        const meterMax = 100;

        const multiplier = getTurboBoostMultiplierFromState({
            meter: 50,
            meterMax,
            curveScale: 100,
            nominalBurnPerSec,
            multiplierMax: getTurboCountMultiplierMaxFromState(0, 0)
        });
        const drain = getTurboBurnDrainForStep(2, { meter: 50, meterMax, nominalBurnPerSec, totals });

        expect(multiplier).toBeGreaterThan(1);
        expect(drain).toBeCloseTo(2 * nominalBurnPerSec * 0.75 * getTurboDrainPiecewiseMultiplier(0.5) * 0.5);
    });

    it("calculates turbo-scension costs", () => {
        expect(getTurboScensionActivationCostFromTotals({ turboScensionActivationCostMult: 0.5 })).toBe(5000);
        expect(getTurboLevelerNextPointCost(3)).toBe(384);
    });

    it("banks fractional turbo activations without decimal display", () => {
        expect(getTurboActivationEarnMultFromBonus(0)).toBe(1);
        expect(getTurboActivationEarnMultFromBonus(1)).toBe(2);
        let acc = 0;
        let earned = 0;
        for (let i = 0; i < 4; i++) {
            const step = earnFractionalTurboActivations(acc, 1.25);
            acc = step.accumulator;
            earned += step.earned;
        }
        expect(earned).toBe(5);
        expect(acc).toBeCloseTo(0);
    });
});
