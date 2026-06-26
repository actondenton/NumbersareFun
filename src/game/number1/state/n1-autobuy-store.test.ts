import { describe, expect, it } from "vitest";
import { createN1AutobuyStore } from "./n1-autobuy-store.js";

describe("createN1AutobuyStore", () => {
    it("starts locked with empty per-hand arrays", () => {
        const a = createN1AutobuyStore({ maxHands: 5 });
        expect(a.autoBuyUnlocked).toBe(false);
        expect(a.autoBuyEnabledByHand).toEqual([]);
        expect(a.autoBuyCountdownSecondsByHand).toEqual([]);
    });
});
