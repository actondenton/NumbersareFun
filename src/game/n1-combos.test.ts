import { describe, expect, it } from "vitest";

import {
    COMBOS,
    comboDiscoverySortCombos,
    computeComboUiInputDigest,
    computeEarnedBonusesUiDigestFromState,
    computeEarnedCatalogComboTierProducts,
    getActiveCombosForValues,
    getComboAscensionNodeSetFingerprint,
    getComboIndexListContext,
    getComboParticipatingHandIndicesForValues,
    getNearMissToleranceRanksFromNodes,
    getPatternCatalogMultiplierFromEarned,
    pairOfNMatchesStrictOrRelaxed
} from "./n1-combos.js";

describe("n1 combo helpers", () => {
    it("builds the combo catalog by minimum hand count", () => {
        expect(COMBOS.find(combo => combo.name === "Pair of 5s")?.bonus).toBeCloseTo(1.1);
        expect(COMBOS.find(combo => combo.name === "Full House")?.minHands).toBe(5);
    });

    it("matches strict and near-miss pairs on the first two hands", () => {
        expect(pairOfNMatchesStrictOrRelaxed(5, [5, 5], [])).toBe(true);
        expect(pairOfNMatchesStrictOrRelaxed(5, [5, 6], [])).toBe(false);
        expect(pairOfNMatchesStrictOrRelaxed(5, [6, 5], [5])).toBe(true);
        expect(pairOfNMatchesStrictOrRelaxed(1, [1, 2], [1])).toBe(true);
        expect(pairOfNMatchesStrictOrRelaxed(10, [9, 10], [10])).toBe(true);
    });

    it("derives capped near-miss ranks from middle ascension nodes", () => {
        const nodeById = {
            a: { finger: "middle", grants: { nearMissToleranceRank: 2 } },
            b: { finger: "ring", grants: { nearMissToleranceRank: 3 } },
            c: { finger: "middle", grants: { nearMissToleranceRank: 4 } },
            d: { finger: "middle", grants: { nearMissToleranceRank: 2 } },
            e: { finger: "middle", grants: { nearMissToleranceRank: 11 } }
        };

        expect(getNearMissToleranceRanksFromNodes(["d", "c", "b", "a", "e"], nodeById)).toEqual([2, 4]);
    });

    it("builds stable combo input digests from values and ascension nodes", () => {
        expect(getComboAscensionNodeSetFingerprint([])).toBe("0");
        expect(getComboAscensionNodeSetFingerprint(["z", "a", "m"])).toBe("3:a,m,z");
        expect(computeComboUiInputDigest([1, 2, 3], 2, ["b", "a"])).toBe("2,1,2|2:a,b");
    });

    it("finds active combos and participating hands", () => {
        const active = getActiveCombosForValues([3, 3, 3, 7, 7], []);
        const fullHouse = active.find(combo => combo.name === "Full House");

        expect(fullHouse).toBeTruthy();
        expect(getComboParticipatingHandIndicesForValues(fullHouse!, [3, 3, 3, 7, 7], 5, [])).toEqual([0, 1, 2, 3, 4]);
    });

    it("computes catalog tier products and summed multiplier", () => {
        const earned = ["Pair of 1s", "Pair of 2s", "Two Pair"];

        const tiers = computeEarnedCatalogComboTierProducts(earned, 4);

        expect(tiers[2]).toBeCloseTo(1.21);
        expect(tiers[4]).toBeCloseTo(1.15);
        expect(getPatternCatalogMultiplierFromEarned(earned, 4)).toBeCloseTo(2.36);
    });

    it("sorts discovery milestones by hand count, bonus, then name", () => {
        const combos = [
            { name: "B", minHands: 2, bonus: 1.1 },
            { name: "A", minHands: 2, bonus: 1.1 },
            { name: "C", minHands: 4, bonus: 1.15 }
        ];

        expect(combos.sort(comboDiscoverySortCombos).map(combo => combo.name)).toEqual(["C", "A", "B"]);
    });

    it("builds combo index context with status and hand filters", () => {
        const ctx = getComboIndexListContext({
            unlockedHands: 4,
            earnedComboNames: ["Pair of 1s"],
            activeComboNames: ["Two Pair"],
            statusFilter: "undiscovered",
            handsFilter: "4"
        });

        expect(ctx.discoveredCount).toBe(1);
        expect(ctx.activeNow.has("Two Pair")).toBe(true);
        expect(ctx.rows.every(combo => combo.minHands === 4)).toBe(true);
        expect(ctx.rows.map(combo => combo.name)).toContain("Two Pair");
        expect(ctx.rows.map(combo => combo.name)).not.toContain("Pair of 1s");
    });

    it("builds earned bonus UI digest from combo state", () => {
        const digest = computeEarnedBonusesUiDigestFromState({
            unlockedHands: 2,
            earnedComboNames: ["Pair of 1s"],
            pendingComboNames: ["Pair of 2s"],
            totals: { comboMultAdd: 0.25 },
            catalogMult: 1.1,
            ascPatternMult: 1.5,
            cpsComboMult: 1.65,
            warpComboMult: 2.0625
        });

        expect(digest).toContain("1.10#1.65#2.06#1.25#1.50#Pair of 1s#Pair of 2s|");
        expect(digest).toContain("Pair of 1s_1");
        expect(digest).toContain("Pair of 2s_q");
    });
});
