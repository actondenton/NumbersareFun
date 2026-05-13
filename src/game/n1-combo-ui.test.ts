import { describe, expect, it } from "vitest";

import {
    buildComboHandStatusCardsHtml,
    buildComboIndexListItemsHtml,
    buildComboIndexLiveSummaryText,
    renderComboPagePerHandStatusSectionHtml
} from "./n1-combo-ui.js";

describe("n1 combo UI helpers", () => {
    it("renders combo index summary text", () => {
        const ctx = {
            discoveredCount: 2,
            available: [{}, {}, {}],
            activeNow: new Set(["Pair of 1s", "Two Pair"])
        };

        expect(buildComboIndexLiveSummaryText(ctx)).toBe("Discovered 2 / 3. Currently active: Pair of 1s, Two Pair.");
    });

    it("renders combo index list rows", () => {
        const ctx = {
            discovered: new Set(["Pair of 1s"]),
            activeNow: new Set(["Two Pair"]),
            comboActivationCounts: { "Two Pair": 3 },
            rows: [
                { name: "Pair of 1s", minHands: 2, bonus: 1.1 },
                { name: "Two Pair", minHands: 4, bonus: 1.15 }
            ]
        };

        const html = buildComboIndexListItemsHtml(ctx, value => String(value));

        expect(html).toContain("earned-bonus-item-earned");
        expect(html).toContain("Pair of 1s");
        expect(html).toContain("overview-card-badge--live");
        expect(html).toContain("Pulse count (edges): 3");
    });

    it("renders an empty filter result placeholder", () => {
        const html = buildComboIndexListItemsHtml({
            discovered: new Set(),
            activeNow: new Set(),
            rows: []
        }, value => String(value));

        expect(html).toContain("No combinations match the current filters.");
    });

    it("renders per-hand status cards", () => {
        const rows = [{
            handIndex: 0,
            balance: 1234,
            baseCps: 2,
            rawCps: 5,
            effectiveCps: 30,
            comboFactor: 2,
            turboFactor: 3,
            slowdownFactor: 1.5
        }];

        const html = buildComboHandStatusCardsHtml(rows, {
            formatCount: value => String(value),
            formatCps: value => value + "/s"
        });

        expect(html).toContain("Hand 1");
        expect(html).toContain("base × combo × turbo × Compaction: 2/s × 2.00 × 3.00 × 1.50 = 30/s");
        expect(html).toContain("Hand 1: 1234 · 5/s → 30/s");
    });

    it("renders the per-hand status section", () => {
        const html = renderComboPagePerHandStatusSectionHtml([], {
            formatCount: value => String(value),
            formatCps: value => String(value)
        });

        expect(html).toContain("combo-per-hand-status");
        expect(html).toContain("No hands.");
    });
});
