import { describe, expect, it } from "vitest";
import {
    AUTOPLAYER_GAP_THRESHOLD_MS,
    buildAutoplayerReport,
    computePlayGaps,
    formatAutoplayerReportMarkdown
} from "./n1-dev-autoplayer-report.js";

describe("computePlayGaps", () => {
    it("derives gaps above threshold from sessionMs deltas", () => {
        const events = [
            { type: "buy_speed", sessionMs: 0, at: "t0" },
            { type: "ascend", sessionMs: 25_000, at: "t1", metrics: { blackHolePhase: 2 } }
        ];
        const { gaps, gapCount, totalGapMs, longestGap } = computePlayGaps(events, {
            thresholdMs: AUTOPLAYER_GAP_THRESHOLD_MS
        });
        expect(gapCount).toBe(1);
        expect(totalGapMs).toBe(25_000);
        expect(longestGap?.fromType).toBe("buy_speed");
        expect(longestGap?.toType).toBe("ascend");
        expect(gaps.length).toBe(1);
    });

    it("ignores gaps below threshold", () => {
        const events = [
            { type: "buy_speed", sessionMs: 0 },
            { type: "buy_speed", sessionMs: 5000 }
        ];
        expect(computePlayGaps(events).gapCount).toBe(0);
    });
});

describe("buildAutoplayerReport", () => {
    it("aggregates ascensions and plan comparison", () => {
        const report = buildAutoplayerReport({
            meta: { sessionId: "s1", personaId: "efficient", simulatedClicks: 3, ascensionCount: 1 },
            events: [
                { type: "buy_speed", sessionMs: 1000, metrics: { blackHolePhase: 2 } },
                {
                    type: "ascend",
                    sessionMs: 60_000,
                    peakTotalAtAscend: 1.5e100,
                    ascensionGain: 80,
                    metrics: { blackHolePhase: 2 }
                }
            ]
        });
        expect(report.global.totalAscensions).toBe(1);
        expect(report.ascensions[0].peakTotalAtAscend).toBe(1.5e100);
        expect(report.planComparison.find(r => r.phase === 2)?.ascensionsInPhase).toBe(1);
    });
});

describe("formatAutoplayerReportMarkdown", () => {
    it("includes persona and plan table header", () => {
        const md = formatAutoplayerReportMarkdown(
            buildAutoplayerReport({
                meta: { personaId: "patient", sessionId: "x", simulatedClicks: 0, ascensionCount: 0 },
                events: []
            })
        );
        expect(md).toContain("patient");
        expect(md).toContain("Plan comparison");
    });
});
