import { describe, expect, it } from "vitest";

import {
    buildBlackHolePhase2TrackEffectHtml,
    formatBlackHolePhase1EffectLines,
    formatBlackHolePhase1PourHoverLines,
    getBlackHolePhase1EffectsAtSpent,
    getBlackHolePhase1PourPreview,
    getBlackHolePhase2TrackPreview,
    resolvePhase1PourHoverPreviewPour
} from "./black-hole-effect-copy.js";
import { BLACK_HOLE_PHASE1_ESSENCE_TARGET } from "../../number1-black-hole.js";

describe("black-hole-effect-copy", () => {
    it("scales Phase 1 effects with essence spent", () => {
        const empty = getBlackHolePhase1EffectsAtSpent(0);
        const half = getBlackHolePhase1EffectsAtSpent(BLACK_HOLE_PHASE1_ESSENCE_TARGET / 2);
        const full = getBlackHolePhase1EffectsAtSpent(BLACK_HOLE_PHASE1_ESSENCE_TARGET);
        expect(empty.inertialMult).toBe(1);
        expect(half.inertialMult).toBeGreaterThan(1);
        expect(full.inertialMult).toBeGreaterThan(half.inertialMult);
        expect(full.dragCapBonus).toBe(6);
        expect(full.essenceMult).toBeGreaterThan(empty.essenceMult);
    });

    it("pour preview raises inertial fold when pouring essence", () => {
        const spent = 10000;
        const pour = 8000;
        const preview = getBlackHolePhase1PourPreview({ phase1EssenceSpent: spent }, pour, 100);
        expect(preview.afterSpent).toBe(spent + pour);
        expect(preview.after.inertialMult).toBeGreaterThan(preview.now.inertialMult);
        expect(preview.inertialFold).toBeGreaterThan(1);
        const lines = formatBlackHolePhase1PourHoverLines(
            preview,
            {
                formatCount: n => String(n),
                formatCompactMultiplier: n => String(n),
                formatCpsMult: n => String(n)
            },
            { pour, ready: true, gainNow: {}, gainAfterPour: {} }
        );
        expect(lines.inertial.hintHtml).toContain("preview-now");
        expect(lines.inertial.hintHtml).toContain("preview-after");
        expect(lines.essence.hintHtml).toContain("preview-after");
        expect(lines.drag.hintHtml).toContain("preview-after");
    });

    it("Phase 2 track preview includes next tier summary", () => {
        const state = { phase2CollapseMassTier: 0, phase2CollapsePhotonTier: 0, phase2CollapseErgosphereTier: 0 };
        const mass = getBlackHolePhase2TrackPreview(state, "mass");
        expect(mass.tier).toBe(0);
        expect(mass.next).not.toBeNull();
        expect(mass.next.summary).toMatch(/coupling|÷/i);
        const html = buildBlackHolePhase2TrackEffectHtml(state, "mass", s => s);
        expect(html).toContain("Now:");
        expect(html).toContain("Next:");
    });

    it("Phase 1 live effect lines show pour deltas when essence is available", () => {
        const spent = 10000;
        const pour = 8000;
        const preview = getBlackHolePhase1PourPreview({ phase1EssenceSpent: spent }, pour, 100);
        const ascendCtx = {
            pour,
            ready: true,
            gainNow: { finalGain: 1000, blackHolePhase1Mult: 1.05, runTimeMultPct: 112 },
            gainAfterPour: { finalGain: 1200, blackHolePhase1Mult: 1.12 },
            runDurationSec: 45,
            runTimeMultPct: 112
        };
        const lines = formatBlackHolePhase1EffectLines(
            preview,
            {
                formatCount: n => String(n),
                formatCompactMultiplier: n => String(n),
                formatCpsMult: n => String(n)
            },
            { ascendCtx }
        );
        expect(lines.inertial.hint).toContain("Pour 8000");
        expect(lines.essence.hint).toContain("Pour 8000");
        expect(lines.ascend.val).toContain("1000");
        expect(lines.ascend.hint).toContain("1200");
    });

    it("Phase 1 pour hover highlights mass couplings and keeps ascend row live", () => {
        const spent = 10000;
        const pour = 8000;
        const preview = getBlackHolePhase1PourPreview({ phase1EssenceSpent: spent }, pour, 100);
        const ascendCtx = {
            pour,
            ready: true,
            gainNow: { finalGain: 1000, blackHolePhase1Mult: 1.05 },
            gainAfterPour: { finalGain: 1200, blackHolePhase1Mult: 1.12 },
            runDurationSec: 45,
            runTimeMultPct: 112,
            pourPreview: preview
        };
        const lines = formatBlackHolePhase1PourHoverLines(
            preview,
            {
                formatCount: n => String(n),
                formatCompactMultiplier: n => String(n),
                formatCpsMult: n => String(n)
            },
            ascendCtx
        );
        expect(lines.inertial.hintHtml).toContain("Now ×");
        expect(lines.inertial.hintHtml).toContain("preview-after");
        expect(lines.ascend.val).toContain("1000");
        expect(lines.ascend.hintHtml).toBeUndefined();
        expect(lines.ascend.hint).toContain("Run time");
    });

    it("Phase 1 pour hover with no banked essence previews mass couplings using example pour", () => {
        const ascendCtx = {
            pour: 0,
            ready: true,
            gainNow: { finalGain: 2000, blackHolePhase1Mult: 1.02 },
            gainAfterPour: { finalGain: 2000, blackHolePhase1Mult: 1.02 },
            runDurationSec: 90,
            runTimeMultPct: 130
        };
        const resolved = resolvePhase1PourHoverPreviewPour({ phase1EssenceSpent: 0 }, 0, ascendCtx);
        expect(resolved.hypothetical).toBe(true);
        expect(resolved.previewPour).toBe(2000);
        const preview = getBlackHolePhase1PourPreview({ phase1EssenceSpent: 0 }, resolved.previewPour, 100);
        const lines = formatBlackHolePhase1PourHoverLines(
            preview,
            {
                formatCount: n => String(n),
                formatCompactMultiplier: n => String(n),
                formatCpsMult: n => String(n)
            },
            { ...ascendCtx, hypotheticalPreviewPour: resolved.previewPour }
        );
        expect(lines.inertial.hintHtml).toContain("example 2000");
        expect(lines.inertial.hintHtml).toContain("preview-after");
        expect(lines.ascend.val).toContain("2000");
        expect(lines.ascend.hintHtml).toBeUndefined();
    });
});
