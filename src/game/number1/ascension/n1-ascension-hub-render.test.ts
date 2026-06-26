import { describe, expect, it } from "vitest";

import {
    collectPurchasedAscensionGrantFlags,
    createAscensionHubRender
} from "./n1-ascension-hub-render.js";

function baseDep(overrides: Record<string, unknown> = {}) {
    return {
        getNumber1HasAscended: () => false,
        getNumber1AscensionNodeIds: () => [] as string[],
        getAscensionMapNodeById: () => ({} as Record<string, { finger?: string; grants?: Record<string, unknown> }>),
        getAscensionMapNodeCount: () => 10,
        computeAscensionGrantTotals: () => ({}),
        getNearMissToleranceRanks: () => [] as number[],
        getUnlockedHands: () => 1,
        getPatternCatalogMultiplier: () => 1,
        getAscensionComboPatternMult: () => 1,
        getTimeWarpComboMultiplier: () => 1,
        getTurboCountMultiplierMax: () => 1,
        getTurboMeterMax: () => 100,
        formatCount: (n: number) => String(n),
        getTimeWarpOverflowRatio: () => 0,
        getTimeWarpAuraSpawnSpanMaxSec: () => 60,
        getMaxCheapenLevel: () => 10,
        getAscensionEssenceInvestedInNodes: () => 0,
        getNumber1AscensionPendingBonusEssence: () => 0,
        getNumber1BlackHoleProductionMult: () => 1,
        getBlackHolePhase: () => 0,
        getPhase1EssenceSpent: () => 0,
        getPhase2Mass: () => 0,
        getPhase2ParallelBonusPool: () => 0,
        isBlackHoleArcUnlocked: () => false,
        formatBlackHolePhase1CpsMultForUi: (m: number) => String(m),
        getBlackHolePhase1RunCpsMult: () => 1,
        getNumber1AscensionEssence: () => 0,
        ...overrides
    };
}

describe("createAscensionHubRender", () => {
    it("returns empty grants html before first ascend", () => {
        const hub = createAscensionHubRender(baseDep());
        expect(hub.renderAscensionHubGrantsHtml()).toBe("");
        expect(hub.renderAscensionHubStatsPillsHtml()).toBe("");
    });

    it("lists economy grants when ascended with purchased nodes", () => {
        const hub = createAscensionHubRender(baseDep({
            getNumber1HasAscended: () => true,
            getNumber1AscensionNodeIds: () => ["a"],
            computeAscensionGrantTotals: () => ({ cheapenCap: 2, speedMult: 1, slowdownCostMult: 1, autoBuyDelayMult: 1, handUnlockStartingCount: 0n })
        }));
        const html = hub.renderAscensionHubGrantsHtml();
        expect(html).toContain("asc-hub-grants-inner");
        expect(html).toContain("+2 bonus Cheapen cap tiers");
    });

    it("renders gem count pills when ascended", () => {
        const hub = createAscensionHubRender(baseDep({
            getNumber1HasAscended: () => true,
            getNumber1AscensionNodeIds: () => ["a", "b"],
            getAscensionMapNodeCount: () => 12,
            getNumber1AscensionEssence: () => 50
        }));
        expect(hub.renderAscensionHubStatsPillsHtml()).toContain("2 / 12");
        expect(hub.renderAscensionHubStatsPillsHtml()).toContain("50");
    });
});

describe("collectPurchasedAscensionGrantFlags", () => {
    it("detects ring turbo-scension unlock flags", () => {
        const flags = collectPurchasedAscensionGrantFlags({
            getNumber1AscensionNodeIds: () => ["ring1"],
            getAscensionMapNodeById: () => ({
                ring1: { finger: "ring", grants: { turboScensionUnlock: true } }
            })
        });
        expect(flags.turboScensionUnlock).toBe(true);
    });
});
