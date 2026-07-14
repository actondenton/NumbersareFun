import { describe, expect, it, vi } from "vitest";

import { createNumber1DetachedCpsBoot } from "./n1-detached-cps-boot.js";

describe("createNumber1DetachedCpsBoot", () => {
    it("skips count DOM while Number 2 is focused and refreshes on demand", () => {
        const incrementalEl = { textContent: "" };
        const boot = createNumber1DetachedCpsBoot({
            getBlackHolePhase: () => 0,
            getUnlockedHands: () => 1,
            getRawCpsPerHand: () => [10],
            getComboMultiplier: () => 1,
            getTurboMultiplier: () => 1,
            getBlackHoleOfflineProductionMult: () => 1,
            mergeHandEarningsFromDetachedSlice: () => {},
            refreshTotalsFromHands: () => {},
            incrementalEl,
            formatCount: (n: number) => "fmt:" + n,
            getTotalChanges: () => 42,
            getCurrentNumberMode: () => 2
        });

        boot.tickNumber1BackgroundCps(1);
        expect(incrementalEl.textContent).toBe("");

        boot.refreshNumber1CountDisplay();
        expect(incrementalEl.textContent).toBe("fmt:42");
    });
});
