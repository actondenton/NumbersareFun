import { describe, expect, it } from "vitest";
import { createN1HandsStore } from "./n1-hands-store.js";

describe("createN1HandsStore", () => {
    it("creates per-hand speed/clap arrays and empty counter list", () => {
        const h = createN1HandsStore({ maxHands: 3 });
        expect(h.speedLevel).toEqual([0, 0, 0]);
        expect(h.speedBonusLevel).toEqual([0, 0, 0]);
        expect(h.clapDigitPrevious).toEqual([-1, -1, -1]);
        expect(h.clapCooldownUntilMsByHand).toEqual([0, 0, 0]);
        expect(h.hands).toEqual([]);
    });
});
