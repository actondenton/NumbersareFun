import { describe, expect, it } from "vitest";
import { BLACK_HOLE_PHASE1_ESSENCE_TARGET, createNumber1BlackHoleState } from "./number1-black-hole.js";
import { applyPhase1PourAll, applyPhase2CollapseBuyTrack } from "./n1-black-hole-spend-sim.js";
import { getBlackHoleUpgradePreview, getProjectedEssenceBudget, getPhase2CollapseEffectHtml } from "./n1-black-hole-upgrade-preview.js";

describe("n1-black-hole-upgrade-preview", () => {
    it("sums held essence and ascend gain when ready", () => {
        const budget = getProjectedEssenceBudget({
            getHeldEssence: () => 40,
            isAscendReady: () => true,
            getAscensionGainBreakdown: () => ({ finalGain: 60 })
        });
        expect(budget).toBe(100);
    });

    it("uses held essence only when ascend is not ready", () => {
        const budget = getProjectedEssenceBudget({
            getHeldEssence: () => 40,
            isAscendReady: () => false,
            getAscensionGainBreakdown: () => ({ finalGain: 60 })
        });
        expect(budget).toBe(40);
    });

    it("previews Phase 1 pour with combined budget", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 1;
        state.phase1EssenceSpent = 0;
        const preview = getBlackHoleUpgradePreview("p1-pour", {
            getHeldEssence: () => 100,
            isAscendReady: () => true,
            getAscensionGainBreakdown: () => ({ finalGain: 50 }),
            getBlackHolePhase: () => 1,
            getBlackHoleState: () => state,
            getSlowdownCapBase: () => 96,
            formatBlackHolePhase1CpsMultForUi: m => String(m),
            previewHintReady: "ready",
            previewHintHeldOnly: "held"
        });
        expect(preview).not.toBeNull();
        expect(preview.future.massMeter).toContain(String(150));
        expect(preview.future.massMeter).toContain(String(BLACK_HOLE_PHASE1_ESSENCE_TARGET));
    });

    it("caps Phase 1 pour at remaining target", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 1;
        state.phase1EssenceSpent = BLACK_HOLE_PHASE1_ESSENCE_TARGET - 20;
        const { state: next, spent } = applyPhase1PourAll(state, 500);
        expect(spent).toBe(20);
        expect(next.phase1EssenceSpent).toBe(BLACK_HOLE_PHASE1_ESSENCE_TARGET);
    });

    it("buys Phase 2 collapse tiers until budget exhausted", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        const { state: next, spent } = applyPhase2CollapseBuyTrack(state, "mass", 5000);
        expect(spent).toBeGreaterThan(0);
        expect(next.phase2CollapseMassTier).toBeGreaterThan(0);
        expect(next.phase2ParallelBonusPool).toBeGreaterThan(0);
    });

    it("previews Phase 2 collapse track tier and effect changes", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        const preview = getBlackHoleUpgradePreview("p2-mass", {
            getHeldEssence: () => 500,
            isAscendReady: () => false,
            getAscensionGainBreakdown: () => ({ finalGain: 0 }),
            getBlackHolePhase: () => 2,
            getBlackHoleState: () => state,
            getSlowdownCapBase: () => 96,
            formatBlackHolePhase1CpsMultForUi: m => String(m),
            escapeHtml: s => String(s),
            formatCount: n => String(n),
            previewHintReady: "ready",
            previewHintHeldOnly: "held"
        });
        expect(preview).not.toBeNull();
        expect(preview!.future["p2-tier-mass"]).not.toBe(preview!.current["p2-tier-mass"]);
        expect(preview!.future["p2-effect-mass"]).toContain("25%");
        expect(preview!.future["p2-effect-mass"]).toMatch(/ascend/i);
    });

    it("describes mass coupling ascension essence bonus", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        const html = getPhase2CollapseEffectHtml("mass", state, {
            escapeHtml: s => String(s),
            formatCount: n => String(n),
            getBlackHolePhase: () => 2
        });
        expect(html).toContain("Tier 1");
        expect(html).toContain("25%");
        expect(html).toContain("100%");
    });

    it("describes photon shell off-turbo combo fill bonus", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        state.phase2CollapsePhotonTier = 0;
        const html = getPhase2CollapseEffectHtml("photon", state, {
            escapeHtml: s => String(s),
            getBlackHolePhase: () => 2
        });
        expect(html).toContain("25%");
        expect(html).toMatch(/Turbo is.*off/i);
        expect(html).not.toMatch(/counting mult/i);
    });

    it("describes ergosphere turbo activation earn bonus", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        const html = getPhase2CollapseEffectHtml("ergosphere", state, {
            escapeHtml: s => String(s),
            getBlackHolePhase: () => 2
        });
        expect(html).toContain("Tier 1");
        expect(html).toContain("25%");
        expect(html).toContain("Turbo activations");
    });

    it("shows next-tier preview when collapse budget is zero", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        const preview = getBlackHoleUpgradePreview("p2-photon", {
            getHeldEssence: () => 0,
            isAscendReady: () => false,
            getAscensionGainBreakdown: () => ({ finalGain: 0 }),
            getBlackHolePhase: () => 2,
            getBlackHoleState: () => state,
            getSlowdownCapBase: () => 96,
            formatBlackHolePhase1CpsMultForUi: m => String(m),
            escapeHtml: s => String(s),
            formatCount: n => String(n),
            previewHintReady: "ready",
            previewHintHeldOnly: "held"
        });
        expect(preview).not.toBeNull();
        expect(preview!.future["p2-tier-photon"]).toBe("1/3");
    });

    it("previews Phase 2 mass pour total mult and phase stats", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        state.phase1EssenceSpent = 150;
        state.phase2CollapseMassTier = 3;
        state.phase2CollapsePhotonTier = 3;
        state.phase2CollapseErgosphereTier = 3;
        const preview = getBlackHoleUpgradePreview("p2-pour-mass", {
            getHeldEssence: () => 5000,
            isAscendReady: () => false,
            getAscensionGainBreakdown: () => ({ finalGain: 0 }),
            getBlackHolePhase: () => 2,
            getBlackHoleState: () => state,
            formatBlackHolePhase1CpsMultForUi: m => m.toFixed(2),
            escapeHtml: s => String(s),
            formatCount: n => String(n),
            previewHintReady: "ready",
            previewHintHeldOnly: "held"
        });
        expect(preview).not.toBeNull();
        expect(preview!.future.totalMult).not.toBe(preview!.current.totalMult);
        expect(preview!.future.phaseStats).toContain("Total gain");
        expect(preview!.future.phaseStats).toContain(preview!.future.totalMult.slice(1));
    });

    it("previews Phase 2 photon buy total mult change", () => {
        const state = createNumber1BlackHoleState();
        state.phase = 2;
        state.phase1EssenceSpent = 150;
        const preview = getBlackHoleUpgradePreview("p2-photon", {
            getHeldEssence: () => 5000,
            isAscendReady: () => false,
            getAscensionGainBreakdown: () => ({ finalGain: 0 }),
            getBlackHolePhase: () => 2,
            getBlackHoleState: () => state,
            formatBlackHolePhase1CpsMultForUi: m => m.toFixed(2),
            escapeHtml: s => String(s),
            formatCount: n => String(n),
            previewHintReady: "ready",
            previewHintHeldOnly: "held"
        });
        expect(preview).not.toBeNull();
        expect(preview!.future["p2-tier-photon"]).not.toBe(preview!.current["p2-tier-photon"]);
        expect(preview!.future["p2-effect-photon"]).toContain("25%");
    });
});
