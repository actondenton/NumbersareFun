import { describe, expect, it } from "vitest";

import {
    createN1AscensionGrants,
    createN1AscensionTreeRuntime,
    resolveAutobuyLanesAfterAscensionReset
} from "./n1-ascension.js";

describe("resolveAutobuyLanesAfterAscensionReset", () => {
    it("keeps autobuy unlocked after ascend without re-hitting 100 total", () => {
        expect(
            resolveAutobuyLanesAfterAscensionReset({
                ascensionDefaultOnForNewHands: false,
                hasAscended: true,
                anyHandHadAutobuyEnabled: false
            })
        ).toEqual({ unlocked: true, hand0Enabled: false });
    });

    it("preserves hand autobuy on when it was enabled before reset", () => {
        expect(
            resolveAutobuyLanesAfterAscensionReset({
                ascensionDefaultOnForNewHands: false,
                hasAscended: true,
                anyHandHadAutobuyEnabled: true
            })
        ).toEqual({ unlocked: true, hand0Enabled: true });
    });

    it("ascension default-on node forces unlock and enabled", () => {
        expect(
            resolveAutobuyLanesAfterAscensionReset({
                ascensionDefaultOnForNewHands: true,
                hasAscended: false,
                anyHandHadAutobuyEnabled: false
            })
        ).toEqual({ unlocked: true, hand0Enabled: true });
    });
});

describe("createN1AscensionGrants", () => {
    it("returns defaults for empty node list", () => {
        const g = createN1AscensionGrants({
            ascensionPurchasedSet: () => new Set(),
            getAscensionNodeIds: () => [],
            getAscensionNodeById: _id => undefined,
            getHasAscended: () => true,
            getUnlockedHands: () => 1,
            getHandEarnings: () => [1],
            setHandEarning: () => {},
            getTotalChanges: () => 1,
            refreshTotalFromHandEarnings: () => {},
            getIncrementalEl: () => null,
            formatCount: n => String(n),
            updateObjectives: () => {},
            updateMilestoneUI: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateTimeWarpAuraUI: () => {},
            updateEarnedBonusesUI: () => {},
            updatePageButtonUnlocks: () => {}
        });
        const t = g.computeAscensionGrantTotals();
        expect(t.cheapenCap).toBe(0);
        expect(t.speedMult).toBe(1);
        expect(t.handUnlockStartingCount).toBe(0n);
    });
});

describe("createN1AscensionTreeRuntime", () => {
    it("reports tree fully purchased when all nodes owned", () => {
        const tree = {
            VERSION: 99,
            NODES: [
                { id: "node_a", finger: "ring", grants: {} },
                { id: "node_b", finger: "index", grants: {} }
            ]
        };
        const rt = createN1AscensionTreeRuntime({
            getAscensionTreeExport: () => tree,
            getAscensionNodeIds: () => ["node_a", "node_b"],
            formatCount: n => String(n),
            getNumber1AscensionEssence: () => 0,
            hasAscended: () => true
        });
        expect(rt.ASCENSION_TREE_VERSION).toBe(99);
        expect(rt.isNumber1AscensionTreeFullyPurchased()).toBe(true);
        expect(rt.isBlackHoleArcUnlocked()).toBe(true);
    });
});
