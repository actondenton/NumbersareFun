import { describe, expect, it, vi } from "vitest";

import { createTurboRuntimeBoot } from "./n1-turbo-runtime-boot.js";

describe("createTurboRuntimeBoot", () => {
    it("returns 1x multiplier when turbo is off", () => {
        const turbo = {
            turboBoostUnlocked: true,
            turboBoostEnabled: false,
            turboBoostMeter: 50,
            turboScensionBurnLevel: 0,
            turboScensionTankLevel: 0,
            turboScensionMultLevel: 0,
            turboScensionFillLevel: 0
        };
        const boot = createTurboRuntimeBoot({
            computeAscensionGrantTotals: () => ({}),
            getTurbo: () => turbo,
            getTurboMeterMax: () => 100,
            getTurboMeterCurveScale: () => 100,
            getTurboCountMultiplierMax: () => 2,
            isTurboScensionUnlocked: () => false,
            turboBoostGaugeEl: null,
            turboBoostWrapEl: null,
            turboBoostFillEl: null,
            getBlackHoleState: () => ({}),
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            updateTurboBoostUI: () => {},
            updateRateDisplay: () => {},
            autosaveNow: () => {},
            syncTurboBoostToggleDomFromBoot: () => {},
            gameplaySimFrozen: () => false
        });
        expect(boot.getTurboCountMultiplier()).toBe(1);
    });

    it("clamps meter when adding turbo points", () => {
        const turbo = {
            turboBoostUnlocked: true,
            turboBoostEnabled: true,
            turboBoostMeter: 90,
            turboScensionFillLevel: 0,
            turboLevelerBank: 0,
            turboLevelerPurchases: 0
        };
        const updateTurboBoostUI = vi.fn();
        const boot = createTurboRuntimeBoot({
            computeAscensionGrantTotals: () => ({ turboOffMeterFillMult: 1 }),
            getTurbo: () => turbo,
            getTurboMeterMax: () => 100,
            getTurboMeterCurveScale: () => 100,
            getTurboCountMultiplierMax: () => 2,
            isTurboScensionUnlocked: () => false,
            turboBoostGaugeEl: null,
            turboBoostWrapEl: null,
            turboBoostFillEl: null,
            getBlackHoleState: () => ({}),
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            updateTurboBoostUI,
            updateRateDisplay: () => {},
            autosaveNow: () => {},
            syncTurboBoostToggleDomFromBoot: () => {},
            gameplaySimFrozen: () => false
        });
        boot.addTurboBoostMeter(25);
        expect(turbo.turboBoostMeter).toBe(100);
        expect(updateTurboBoostUI).toHaveBeenCalled();
    });
});
