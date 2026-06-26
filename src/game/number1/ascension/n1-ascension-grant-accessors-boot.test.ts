import { describe, expect, it, vi } from "vitest";

import { createAscensionGrantAccessorsBoot } from "./n1-ascension-grant-accessors-boot.js";

describe("createAscensionGrantAccessorsBoot", () => {
    it("reads autobuy default from purchased node ids", () => {
        const boot = createAscensionGrantAccessorsBoot({
            ascensionPurchasedSet: () => new Set(["asc_ix_00"]),
            computeAscensionGrantTotals: () => ({ handUnlockStartingCount: 0, cheapenCap: 0 }),
            getAutobuy: () => ({ autoBuyUnlocked: false }),
            ensureSpeedRows: () => {},
            getAutoBuyEnabledByHand: () => [],
            getUnlockedHands: () => 1,
            syncAllAutobuyTogglesFromState: () => {},
            getNumber1HasAscended: () => false,
            getRun: () => ({ unlockedHands: 1, handEarnings: [0], totalChanges: 0 }),
            refreshTotalFromHandEarnings: () => {},
            incrementalEl: null,
            formatCount: (n: number) => String(n),
            updateObjectives: () => {},
            updateMilestoneUI: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateTimeWarpAuraUI: () => {},
            getComboForward: () => ({ updateEarnedBonusesUI: () => {} }),
            updatePageButtonUnlocks: () => {},
            getTurboScensionTankLevel: () => 0,
            getTurboScensionMultLevel: () => 0
        });
        expect(boot.ascensionAutobuyDefaultOnForNewHands()).toBe(true);
        expect(boot.getMaxCheapenLevel()).toBeGreaterThan(0);
    });

    it("raises hand earnings to ascension floor and refreshes UI", () => {
        const run = { unlockedHands: 2, handEarnings: [1, 5], totalChanges: 6 };
        const updatePageButtonUnlocks = vi.fn();
        const boot = createAscensionGrantAccessorsBoot({
            ascensionPurchasedSet: () => new Set(),
            computeAscensionGrantTotals: () => ({ handUnlockStartingCount: 10n, cheapenCap: 0, turboScaling: 0, warpOverflow: 0 }),
            getAutobuy: () => ({ autoBuyUnlocked: false }),
            ensureSpeedRows: () => {},
            getAutoBuyEnabledByHand: () => [],
            getUnlockedHands: () => run.unlockedHands,
            syncAllAutobuyTogglesFromState: () => {},
            getNumber1HasAscended: () => true,
            getRun: () => run,
            refreshTotalFromHandEarnings: () => {},
            incrementalEl: { textContent: "" },
            formatCount: (n: number) => String(n),
            updateObjectives: () => {},
            updateMilestoneUI: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateTimeWarpAuraUI: () => {},
            getComboForward: () => ({ updateEarnedBonusesUI: () => {} }),
            updatePageButtonUnlocks,
            getTurboScensionTankLevel: () => 0,
            getTurboScensionMultLevel: () => 0
        });
        expect(boot.applyAscensionHandUnlockStartingCountFloorToUnlockedHands()).toBe(true);
        expect(run.handEarnings).toEqual([10, 10]);
        expect(updatePageButtonUnlocks).toHaveBeenCalled();
    });
});
