import { describe, expect, it, vi } from "vitest";

import { createApplyHandSacrifice } from "./n1-hand-sacrifice.js";

describe("createApplyHandSacrifice", () => {
    it("shrinks unlocked hands and resets per-hand state", () => {
        const run = {
            unlockedHands: 3,
            unlockedHandsCap: 10,
            handEarnings: [1, 2, 3, 4, 5]
        };
        const hands = [{ el: { parentNode: { removeChild: vi.fn() } } }, { el: null }, { el: null }];
        const calls = [];
        const apply = createApplyHandSacrifice({
            maxHands: 5,
            run,
            hands,
            setAutoBuyEnabledForHand: (i, en) => calls.push(["autobuy", i, en]),
            autoBuyCountdownSecondsByHand: [0, 0, 0, 9, 9],
            timeWarpAuraActiveByHand: [true, true, true, true, true],
            timeWarpAuraAppearedAtMsByHand: [1, 2, 3, 4, 5],
            shrinkSpeedRowsTo: n => calls.push(["shrink", n]),
            ensureSpeedRows: () => calls.push(["ensure"]),
            updateSpeedUpgradeUI: () => calls.push(["speed"]),
            updateCheapenUpgradeUI: () => calls.push(["cheapen"]),
            updateSlowdownUpgradeUI: () => calls.push(["slowdown"]),
            updateComboUI: () => calls.push(["combo"]),
            updateTurboBoostUI: () => calls.push(["turbo"])
        });

        expect(apply(2)).toBe(true);
        expect(run.unlockedHands).toBe(1);
        expect(run.unlockedHandsCap).toBe(1);
        expect(hands.length).toBe(1);
        expect(run.handEarnings[1]).toBe(0);
        expect(calls).toContainEqual(["shrink", 1]);
        expect(calls).toContainEqual(["turbo"]);
    });

    it("returns false when target hand is not unlocked", () => {
        const run = { unlockedHands: 1, unlockedHandsCap: 10, handEarnings: [0] };
        const apply = createApplyHandSacrifice({
            maxHands: 10,
            run,
            hands: [{}],
            setAutoBuyEnabledForHand: () => {},
            autoBuyCountdownSecondsByHand: [],
            timeWarpAuraActiveByHand: [],
            timeWarpAuraAppearedAtMsByHand: [],
            shrinkSpeedRowsTo: () => {},
            ensureSpeedRows: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateComboUI: () => {},
            updateTurboBoostUI: () => {}
        });
        expect(apply(3)).toBe(false);
    });
});
