import { describe, expect, it } from "vitest";
import { createN1TimewarpStore } from "./n1-timewarp-store.js";

describe("createN1TimewarpStore", () => {
    it("starts with empty aura arrays and no boot ref", () => {
        const tw = createN1TimewarpStore({ maxHands: 5 });
        expect(tw.timeWarpAuraActiveByHand).toEqual([]);
        expect(tw.timeWarpAuraAppearedAtMsByHand).toEqual([]);
        expect(tw.timeWarpNextSpawnInSec).toBe(0);
        expect(tw.timeWarpUnlockLogged).toBe(false);
        expect(tw.number1TimeWarpBoot).toBeNull();
    });
});
