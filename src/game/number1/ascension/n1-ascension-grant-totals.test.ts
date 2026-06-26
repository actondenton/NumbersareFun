import { describe, expect, it } from "vitest";

import {
    ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP,
    computeAscensionGrantTotalsFromNodeIds
} from "./n1-ascension-grant-totals.js";

describe("n1-ascension-grant-totals", () => {
    it("returns zeroed defaults for empty node list", () => {
        const t = computeAscensionGrantTotalsFromNodeIds([], () => undefined);
        expect(t.cheapenCap).toBe(0);
        expect(t.comboEarnedPatternMult).toBe(1);
        expect(t.handUnlockStartingCount).toBe(0n);
    });

    it("aggregates cheapenCap from node grants", () => {
        const t = computeAscensionGrantTotalsFromNodeIds(["a", "b"], id => ({
            grants: id === "a" ? { cheapenCap: 2 } : { cheapenCap: 3 }
        }));
        expect(t.cheapenCap).toBe(5);
    });

    it("caps combo earned pattern mult", () => {
        const t = computeAscensionGrantTotalsFromNodeIds(["m1", "m2"], id => ({
            finger: "middle",
            grants: { comboEarnedPatternMultAdd: id === "m1" ? 9 : 9 }
        }));
        expect(t.comboEarnedPatternMult).toBe(ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP);
    });
});
