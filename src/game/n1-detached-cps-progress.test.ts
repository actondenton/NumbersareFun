import { describe, expect, it, vi } from "vitest";
import { accumulateNumber1DetachedCps } from "./modules/number1/detached-cps-progress.js";

describe("accumulateNumber1DetachedCps", () => {
    it("returns 0 for non-positive dt or phase 7", () => {
        const noop = vi.fn();
        const deps = {
            getBlackHolePhase: vi.fn(() => 3),
            getUnlockedHands: () => 1,
            getRawCpsPerHand: () => [1],
            getComboMultiplier: () => 1,
            getTurboMultiplier: () => 1,
            getBlackHoleOfflineProductionMult: () => 1,
            mergeHandEarningsFromDetachedSlice: noop,
            refreshTotalsFromHands: noop
        };
        expect(accumulateNumber1DetachedCps(0, deps)).toBe(0);
        expect(accumulateNumber1DetachedCps(-1, deps)).toBe(0);
        expect(
            accumulateNumber1DetachedCps(1, {
                ...deps,
                getBlackHolePhase: () => 7
            })
        ).toBe(0);
        expect(noop).not.toHaveBeenCalled();
    });

    it("merges gains and refreshes totals when math produces progress", () => {
        const merged: unknown[] = [];
        const deps = {
            getBlackHolePhase: () => 1,
            getUnlockedHands: () => 2,
            getRawCpsPerHand: () => [10, 10],
            getComboMultiplier: () => 1,
            getTurboMultiplier: () => 1,
            getBlackHoleOfflineProductionMult: () => 1,
            mergeHandEarningsFromDetachedSlice: (arr: number[]) => merged.push([...arr]),
            refreshTotalsFromHands: vi.fn()
        };
        const got = accumulateNumber1DetachedCps(1, deps);
        expect(got).toBeGreaterThan(0);
        expect(merged.length).toBe(1);
        expect(merged[0]).toHaveLength(2);
        expect((merged[0] as number[]).reduce((a, b) => a + b, 0)).toBe(got);
        expect(deps.refreshTotalsFromHands).toHaveBeenCalledTimes(1);
    });
});
