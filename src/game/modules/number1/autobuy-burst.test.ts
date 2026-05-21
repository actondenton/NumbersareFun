import { describe, expect, it, vi } from "vitest";
import { applyAffordableUpgradeBurstForHand, isCollapseAutobuyBurstUnlocked } from "./autobuy-burst.js";

describe("isCollapseAutobuyBurstUnlocked", () => {
    it("is false before Black Hole Collapse (phase 2)", () => {
        expect(isCollapseAutobuyBurstUnlocked(() => 0)).toBe(false);
        expect(isCollapseAutobuyBurstUnlocked(() => 1)).toBe(false);
    });

    it("is true from phase 2 onward", () => {
        expect(isCollapseAutobuyBurstUnlocked(() => 2)).toBe(true);
        expect(isCollapseAutobuyBurstUnlocked(() => 7)).toBe(true);
    });
});

describe("applyAffordableUpgradeBurstForHand", () => {
    it("buys speed until unaffordable and returns deltas", () => {
        const speedLevel = [0];
        const cheapenLevel = [0];
        const slowdownLevel = [0];
        let balance = 1000;
        const buySpeed = vi.fn(() => {
            balance -= 10;
            speedLevel[0]++;
        });
        const result = applyAffordableUpgradeBurstForHand(
            0,
            {
                getUnlockedHands: () => 1,
                getSpeedLevel: () => speedLevel,
                getCheapenLevel: () => cheapenLevel,
                getSlowdownLevel: () => slowdownLevel,
                getHandEarnings: () => balance,
                getMaxCheapenLevel: () => 0,
                getCheapenUpgradeCost: () => 1e18,
                getUpgradeCost: (_i, next) => 10 + next,
                getSlowdownUpgradeCost: () => null,
                getMaxSlowdownLevelCap: () => 0,
                isSlowdownUnlocked: () => false,
                buyCheapenUpgradeForHand: vi.fn(),
                buySpeedUpgradeForHand: buySpeed,
                buySlowdownUpgradeForHand: vi.fn(),
                flushAutobuyDeferredTotalsIfAny: vi.fn(),
                markMeaningfulProgress: vi.fn()
            },
            { flushDeferredTotals: false }
        );
        expect(result.any).toBe(true);
        expect(result.speedDelta).toBeGreaterThan(1);
        expect(buySpeed.mock.calls.length).toBe(result.speedDelta);
        expect(balance).toBeLessThan(10 + speedLevel[0] + 1);
    });

    it("stops when no upgrade type can progress", () => {
        const buySpeed = vi.fn();
        const result = applyAffordableUpgradeBurstForHand(0, {
            getUnlockedHands: () => 1,
            getSpeedLevel: () => [0],
            getCheapenLevel: () => [0],
            getSlowdownLevel: () => [0],
            getHandEarnings: () => 0,
            getMaxCheapenLevel: () => 10,
            getCheapenUpgradeCost: () => 100,
            getUpgradeCost: () => 100,
            getSlowdownUpgradeCost: () => 100,
            getMaxSlowdownLevelCap: () => 10,
            isSlowdownUnlocked: () => true,
            buyCheapenUpgradeForHand: vi.fn(),
            buySpeedUpgradeForHand: buySpeed,
            buySlowdownUpgradeForHand: vi.fn()
        });
        expect(result.any).toBe(false);
        expect(buySpeed).not.toHaveBeenCalled();
    });

    it("invokes onAfterBurst when purchases occurred", () => {
        const onAfterBurst = vi.fn();
        const speedLevel = [0];
        applyAffordableUpgradeBurstForHand(
            0,
            {
                getUnlockedHands: () => 1,
                getSpeedLevel: () => speedLevel,
                getCheapenLevel: () => [0],
                getSlowdownLevel: () => [0],
                getHandEarnings: () => 100,
                getMaxCheapenLevel: () => 0,
                getCheapenUpgradeCost: () => 1e18,
                getUpgradeCost: () => 5,
                getSlowdownUpgradeCost: () => null,
                getMaxSlowdownLevelCap: () => 0,
                isSlowdownUnlocked: () => false,
                buyCheapenUpgradeForHand: vi.fn(),
                buySpeedUpgradeForHand: () => {
                    speedLevel[0]++;
                },
                buySlowdownUpgradeForHand: vi.fn()
            },
            { onAfterBurst }
        );
        expect(onAfterBurst).toHaveBeenCalledOnce();
    });
});
