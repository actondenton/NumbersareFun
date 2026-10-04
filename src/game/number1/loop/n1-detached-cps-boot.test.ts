import { describe, expect, it } from "vitest";

import { createNumber1Runtime } from "../state/n1-runtime.js";
import { createN1GameContext } from "../n1-game-context.js";
import { createNumber1DetachedCpsBoot } from "./n1-detached-cps-boot.js";

describe("createNumber1DetachedCpsBoot", () => {
    it("skips count DOM while Number 2 is focused and refreshes on demand", () => {
        const runtime = createNumber1Runtime({ maxHands: 1 });
        runtime.run.totalChanges = 42;
        const g = createN1GameContext(runtime, null);
        g.install({
            getRawCpsPerHand: () => [10],
            getTurboCountMultiplier: () => 1
        });
        const incrementalEl = { textContent: "" };
        const boot = createNumber1DetachedCpsBoot(g, {
            getBlackHolePhase: () => 0,
            getComboMultiplier: () => 1,
            getBlackHoleOfflineProductionMult: () => 1,
            refreshTotalsFromHands: () => {},
            incrementalEl,
            formatCount: (n: number) => "fmt:" + n,
            getCurrentNumberMode: () => 2
        });

        boot.tickNumber1BackgroundCps(1);
        expect(incrementalEl.textContent).toBe("");

        boot.refreshNumber1CountDisplay();
        expect(incrementalEl.textContent).toBe("fmt:42");
    });
});
