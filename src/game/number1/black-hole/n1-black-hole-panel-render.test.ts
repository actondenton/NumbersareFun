import { describe, expect, it } from "vitest";

import { BLACK_HOLE_PHASE1_ESSENCE_TARGET, createNumber1BlackHoleState } from "./number1-black-hole.js";
import { createNumber1BlackHolePanelRender } from "./n1-black-hole-panel-render.js";

function baseDep(overrides: Record<string, unknown> = {}) {
    const state = createNumber1BlackHoleState();
    state.phase = 1;
    return {
        getNumber1HasAscended: () => false,
        isBlackHoleArcUnlocked: () => true,
        getBlackHolePhase: () => state.phase,
        ensureBlackHoleArcStarted: () => {},
        getNumber1BlackHoleProductionMult: () => 1,
        getBlackHoleState: () => state,
        getBlackHoleUxFlags: () => ({}),
        getNumber1AscensionEssence: () => 0,
        getBlackHolePhase1FillRatio: () => 0,
        getMaxSlowdownLevelCap: () => 96,
        formatBlackHolePhase1CpsMultForUi: (m: number) => String(m),
        getBlackHolePhase1RunCpsMult: () => 1,
        getBlackHolePhase1AscensionEssenceMult: () => 1,
        formatCount: (n: number) => String(n),
        getBlackHolePhase2NextCostEssence: () => 0,
        getBlackHolePhase2CollapseMassTier: () => 0,
        getBlackHolePhase2CollapsePhotonTier: () => 0,
        getBlackHolePhase2CollapseErgosphereTier: () => 0,
        isBlackHolePhase2MassPourUnlocked: () => false,
        getBlackHolePhase2CollapseUpgradeCost: () => 0,
        getBlackHolePhase3TrackLevel: () => 0,
        getBlackHolePhase3TrackCost: () => 0,
        getBlackHolePhase4NextCostEssence: () => 0,
        formatSeconds: (s: number) => String(s) + "s",
        getBlackHoleWaveIntervalSec: () => 10,
        getPhase5StokeMinRemainingMs: () => 8000,
        getBlackHolePhase5StokePreview: () => null,
        getBlackHolePhase5DigestProgressAt: () => 0,
        getBlackHolePhase5DigestCurve: (p: number) => p,
        getBlackHolePhase5EffectiveFurnacePower: () => 0,
        getBlackHolePhase5MutationLevel: () => 0,
        getBlackHoleFurnaceMult: () => 1,
        getBlackHolePhase5HotterCoreMult: () => 1,
        getBlackHoleFurnaceEssenceBonus: () => 0,
        getBlackHolePhase5ShorterOrbitMult: () => 1,
        getUnlockedHands: () => 1,
        getBlackHolePhase6TrackLevel: () => 0,
        getBlackHolePhase6TrackCost: () => 0,
        getTotalProductionMultLabelForPanel: () => "Total production",
        ...overrides
    };
}

describe("createNumber1BlackHolePanelRender", () => {
    it("returns empty html before first ascend", () => {
        const panel = createNumber1BlackHolePanelRender(baseDep());
        expect(panel.renderNumber1BlackHolePanelHtml()).toBe("");
    });

    it("returns empty html when black hole arc is locked", () => {
        const panel = createNumber1BlackHolePanelRender(baseDep({
            getNumber1HasAscended: () => true,
            isBlackHoleArcUnlocked: () => false
        }));
        expect(panel.renderNumber1BlackHolePanelHtml()).toBe("");
    });

    it("renders phase 1 mass accumulator panel", () => {
        const panel = createNumber1BlackHolePanelRender(baseDep({
            getNumber1HasAscended: () => true,
            getNumber1AscensionEssence: () => 25
        }));
        const html = panel.renderNumber1BlackHolePanelHtml();
        expect(html).toContain("asc-black-hole--phase1");
        expect(html).toContain("Numerical Mass Accumulator");
        expect(html).toContain(String(BLACK_HOLE_PHASE1_ESSENCE_TARGET));
        expect(html).toContain("Pour in all Essence");
    });
});
