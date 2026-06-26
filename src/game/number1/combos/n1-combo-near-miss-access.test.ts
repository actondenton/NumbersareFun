import { describe, expect, it } from "vitest";

import { createNumber1ComboNearMissAccess } from "./n1-combo-near-miss-access.js";

describe("createNumber1ComboNearMissAccess", () => {
    it("delegates to ascension node ownership + map", () => {
        const nodeById = {
            a: { id: "a", finger: "middle", grants: { nearMissToleranceRank: 3 } }
        };
        const acc = createNumber1ComboNearMissAccess({
            getAscensionNodeIds: () => ["a"],
            getAscensionNodeById: () => nodeById
        });
        expect(acc.getNearMissToleranceRanks()).toEqual([3]);
    });
});
