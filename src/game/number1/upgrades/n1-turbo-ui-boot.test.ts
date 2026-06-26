import { describe, expect, it, vi } from "vitest";

import { createTurboUiBoot } from "./n1-turbo-ui-boot.js";

describe("createTurboUiBoot", () => {
    it("updates meter strip width when turbo is unlocked", () => {
        const turbo = {
            turboBoostUnlocked: true,
            turboBoostEnabled: true,
            turboBoostMeter: 50,
            turboActivationCount: 0,
            turboScensionBurnLevel: 0,
            turboScensionTankLevel: 0,
            turboScensionMultLevel: 0,
            turboScensionFillLevel: 0,
            turboLevelerBank: 0
        };
        const fillEl = { style: { width: "" } };
        const registerSyncBhCollapseTurboTierAccents = vi.fn();
        const boot = createTurboUiBoot({
            getTurbo: () => turbo,
            isTurboScensionUnlocked: () => false,
            getTurboMeterMax: () => 100,
            getTurboScensionActivationCost: () => 10000,
            getTurboScensionUpgradeRollCount: () => 1,
            getTurboLevelerNextPointCost: () => 48,
            getTurboScensionUpgradeActivationEtaHint: () => "",
            getTurboCountMultiplierFromMeter: () => 1.5,
            computeAscensionGrantTotals: () => ({}),
            getBlackHoleState: () => ({}),
            tryUnlockTurboIfEligible: () => {},
            registerSyncBhCollapseTurboTierAccents,
            setUpgradeTooltipText: () => {},
            setUpgradeButtonProgress: () => {},
            turboBoostWrapEl: {},
            turboBoostFillEl: fillEl,
            turboBoostGaugeEl: null,
            turboBoostMultiplierEl: null,
            turboBoostActivationsEl: null,
            turboBoostEnabledCheckbox: null,
            turboBoostToggleLabelEl: null,
            turboScensionPanelEl: null,
            turboRightClusterEl: null,
            turboScensionBurnLineEl: null,
            turboScensionTankLineEl: null,
            turboScensionMultLineEl: null,
            turboScensionFillLineEl: null,
            turboScensionUpgradeBtn: null,
            turboScensionLevelerLineEl: null
        });
        boot.updateTurboBoostUI({ force: true });
        expect(fillEl.style.width).toBe("50%");
        expect(registerSyncBhCollapseTurboTierAccents).toHaveBeenCalled();
    });
});
