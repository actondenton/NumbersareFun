import { describe, expect, it, vi } from "vitest";

import { createSpeedUpgradeUiBoot } from "./n1-speed-upgrade-ui-boot.js";

describe("createSpeedUpgradeUiBoot", () => {
    it("paints afford pulse on speed row when balance covers cost", () => {
        const container = { classList: { add: vi.fn() } };
        const btn = {
            disabled: true,
            classList: { toggle: vi.fn(), remove: vi.fn() },
            querySelector: () => ({ textContent: "" })
        };
        const boot = createSpeedUpgradeUiBoot({
            bumpUpgradeEtaSmoothPass: () => {},
            getTotalChanges: () => 100,
            upgradeContainer: container,
            addToLog: () => {},
            speedUpgradesContainerEl: {},
            ensureSpeedRows: () => {},
            getUnlockedHands: () => 1,
            getSpeedRowRefs: () => [{ btn, speedLevelEl: null, autobuyToggleEl: null, autobuyMessageEl: null }],
            getSpeedLevel: () => [0],
            getSpeedBonusLevel: () => [0],
            getUpgradeCost: () => 10,
            getHandEarnings: () => 50,
            getEffectiveSpeedLevel: () => 0,
            formatCount: (n: number) => String(n),
            setUpgradeButtonProgress: () => {},
            setUpgradeTooltipText: () => {},
            formatUpgradeAffordEtaLine: () => "",
            getAutoBuyUnlocked: () => false,
            setAutoBuyUnlocked: () => {},
            getAutoBuyEnabledByHand: () => false,
            getAutoBuyCountdownSecondsByHand: () => 0,
            getCheapenSectionUnlocked: () => false,
            getCheapenLevel: () => [],
            getMaxCheapenLevel: () => 10,
            getCheapenUpgradeCost: () => null,
            isSlowdownUnlocked: () => false,
            getSlowdownLevel: () => [],
            getMaxSlowdownLevelCap: () => 4,
            getSlowdownUpgradeCost: () => null,
            handContributesToScrollHint: () => false,
            handContributesTimeWarpPriority: () => 0,
            handHasActiveTimeWarpAura: () => false,
            upgradeScrollHintEl: null,
            upgradeScrollHintMessagesEl: null,
            upgradeScrollHintJumpsEl: null
        });
        boot.updateSpeedUpgradeUI();
        expect(btn.disabled).toBe(false);
        expect(btn.classList.toggle).toHaveBeenCalledWith("upgrade-btn--afford-pulse", true);
    });
});
