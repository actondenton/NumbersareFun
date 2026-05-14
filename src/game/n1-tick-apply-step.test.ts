import { describe, expect, it } from "vitest";

import { createNumber1TickApplyStep } from "./n1-tick-apply-step.js";

describe("createNumber1TickApplyStep", () => {
    it("applies tick gains, refreshes totals, and updates foreground UI hooks", () => {
        const handEarnings = [10, 20];
        const calls: string[] = [];
        const el = { textContent: "" };

        const step = createNumber1TickApplyStep({
            getUnlockedHands: () => 2,
            getHandEarnings: () => handEarnings,
            refreshTotalFromHandEarnings: () => {
                calls.push("refresh");
            },
            getIncrementalCountEl: () => el as unknown as Element,
            formatCount: n => `n=${n}`,
            getTotalChanges: () => 999,
            updateObjectives: () => calls.push("objectives"),
            maybeShowFirstAscensionIntroOnUnlock: () => calls.push("intro")
        });

        step.applyTickGains([3, 4], false);

        expect(handEarnings).toEqual([13, 24]);
        expect(calls).toEqual(["refresh", "objectives", "intro"]);
        expect(el.textContent).toBe("n=999");
    });

    it("skips objective and intro work in background-tab ticks", () => {
        const handEarnings = [0];
        const calls: string[] = [];

        const step = createNumber1TickApplyStep({
            getUnlockedHands: () => 1,
            getHandEarnings: () => handEarnings,
            refreshTotalFromHandEarnings: () => calls.push("refresh"),
            getIncrementalCountEl: () => null,
            formatCount: n => String(n),
            getTotalChanges: () => 1,
            updateObjectives: () => calls.push("objectives"),
            maybeShowFirstAscensionIntroOnUnlock: () => calls.push("intro")
        });

        step.applyTickGains([5], true);

        expect(handEarnings).toEqual([5]);
        expect(calls).toEqual(["refresh"]);
    });

    it("flushes deferred autobuy totals once and patches the incremental label", () => {
        let total = 0;
        const calls: string[] = [];
        const el = { textContent: "" };

        const step = createNumber1TickApplyStep({
            getUnlockedHands: () => 1,
            getHandEarnings: () => [],
            refreshTotalFromHandEarnings: () => {
                total++;
                calls.push("refresh");
            },
            getIncrementalCountEl: () => el as unknown as Element,
            formatCount: n => `fmt(${n})`,
            getTotalChanges: () => 42,
            updateObjectives: () => {},
            maybeShowFirstAscensionIntroOnUnlock: () => {}
        });

        step.flushAutobuyDeferredTotalsIfAny();
        expect(calls).toEqual([]);

        step.markAutobuyDeferredTotalsPending();
        step.flushAutobuyDeferredTotalsIfAny();

        expect(calls).toEqual(["refresh"]);
        expect(el.textContent).toBe("fmt(42)");

        step.flushAutobuyDeferredTotalsIfAny();
        expect(calls).toEqual(["refresh"]);
    });
});
