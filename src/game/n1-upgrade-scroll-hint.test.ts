import { describe, expect, it } from "vitest";
import { createN1UpgradeScrollHint } from "./n1-upgrade-scroll-hint.js";

describe("n1-upgrade-scroll-hint", () => {
    it("exports update + schedule + handScrollHintHasUpgradeReason", () => {
        const twApi = {
            handContributesToScrollHint: () => true,
            handContributesTimeWarpPriority: () => 0,
            handHasActiveTimeWarpAura: () => false
        };
        const out = createN1UpgradeScrollHint({
            upgradeScrollHintEl: null,
            upgradeScrollHintMessagesEl: null,
            upgradeScrollHintJumpsEl: null,
            getUnlockedHands: () => 1,
            getTotalChanges: () => 100,
            getHandEarning: () => 0,
            getSpeedLevel: () => [0],
            getUpgradeCost: () => 1e30,
            getCheapenSectionUnlocked: () => false,
            getCheapenLevel: () => [0],
            getMaxCheapenLevel: () => 10,
            getCheapenUpgradeCost: () => null,
            isSlowdownUnlocked: () => false,
            getSlowdownLevel: () => [0],
            getMaxSlowdownLevelCap: () => 4,
            getSlowdownUpgradeCost: () => null,
            getAutoBuyUnlocked: () => false,
            getAutoBuyEnabledByHand: () => false,
            getAutoBuyCountdownSecondsByHand: () => 0,
            getSpeedRowRefs: () => ({}),
            getTimeWarpScrollHintApi: () => twApi
        });
        expect(typeof out.updateHandUpgradeScrollHint).toBe("function");
        expect(typeof out.scheduleHandUpgradeScrollHintUpdate).toBe("function");
        expect(out.handScrollHintHasUpgradeReason(0)).toBe(false);
    });
});
