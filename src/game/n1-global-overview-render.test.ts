import { describe, expect, it } from "vitest";

import { renderNumber1GlobalOverviewHtml } from "./n1-global-overview-render.js";

const fmt = (n: number) => `§${n}`;

describe("renderNumber1GlobalOverviewHtml", () => {
    it("renders empty-save placeholder when there are no cards", () => {
        const html = renderNumber1GlobalOverviewHtml({
            formatCount: fmt,
            getOverviewCards: () => []
        });
        expect(html).toBe(
            "<div class=\"overview-empty\">No unlocked numbers on this save. Additional number modules — " +
                "<span class=\"coming-soon-inline\">coming soon</span>.</div>"
        );
    });

    it("renders Number 1 card with not-ready ascension copy", () => {
        const html = renderNumber1GlobalOverviewHtml({
            formatCount: fmt,
            getOverviewCards: () => [{
                number: 1,
                label: "Number I",
                milestone: { text: "Reach 10", pct: 44.44 },
                ascensionReady: false,
                ratePerSec: 3.456,
                details: "Essence detail line",
                number1Ascension: {
                    ascensionEssence: 20,
                    ascensionRequiredTotal: 500,
                    ascensionRequiredHands: 4,
                    hasAscended: false,
                    gainPreview: null
                },
                number2Ascension: null
            }]
        });
        expect(html).toBe(
            "<article class=\"overview-card overview-card--n1\" data-overview-number=\"1\">" +
            "<header class=\"overview-card-header\">" +
            "<span class=\"overview-card-poster-glyph\" aria-hidden=\"true\">1</span>" +
            "<div class=\"overview-card-heading\">" +
            "<h3 class=\"overview-card-title\">Number I</h3>" +
            "<span class=\"overview-card-badge overview-card-badge--live\">Main stage · live</span>" +
            "</div></header>" +
            "<div class=\"overview-card-body\">" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Progress rate</span>" +
            "<span class=\"overview-stat-value\">§3.46/s</span></div>" +
            "<div class=\"overview-stat overview-stat--milestone\">" +
            "<span class=\"overview-stat-label\">Next milestone</span>" +
            "<span class=\"overview-stat-value overview-stat-milestone-text\">Reach 10 · 44.4%</span>" +
            "<div class=\"overview-mini-progress\" role=\"progressbar\" aria-valuenow=\"44.4\" aria-valuemin=\"0\" aria-valuemax=\"100\">" +
            "<div class=\"overview-mini-fill\" style=\"width:44.44%\"></div></div></div>" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Module details</span>" +
            "<span class=\"overview-stat-value\">Essence detail line</span></div>" +
            "<div class=\"overview-ascension-cell\">" +
            "Ascension: Not ready · Essence: §20 · Requirement: §500 total and 4 hands" +
            "</div></div></article>"
        );
    });

    it("renders ready Number 1 preview lines plus Number 2 gate and sidebar note", () => {
        const html = renderNumber1GlobalOverviewHtml({
            formatCount: fmt,
            getOverviewCards: () => [
                {
                    number: 1,
                    label: "N1",
                    milestone: { text: "Victory", pct: 100 },
                    ascensionReady: true,
                    ratePerSec: 0,
                    details: "D1",
                    number1Ascension: {
                        ascensionEssence: 99,
                        ascensionRequiredTotal: 1,
                        ascensionRequiredHands: 1,
                        hasAscended: true,
                        gainPreview: {
                            finalGain: 1000,
                            blackHoleMultiplierBonus: 40,
                            multiplierBonus: 7,
                            arcEssenceMultiplierBonusTitle: "BH bonus"
                        }
                    },
                    number2Ascension: null
                },
                {
                    number: 2,
                    label: "N2",
                    milestone: { text: "Wait", pct: 0 },
                    ascensionReady: false,
                    ratePerSec: 2.001,
                    details: "D2",
                    number1Ascension: null,
                    number2Ascension: {
                        started: true,
                        luckAscensionEssence: 3,
                        ascensionGateTotal: 888
                    }
                }
            ]
        });
        expect(html).toBe(
            "<article class=\"overview-card overview-card--n1\" data-overview-number=\"1\">" +
            "<header class=\"overview-card-header\">" +
            "<span class=\"overview-card-poster-glyph\" aria-hidden=\"true\">1</span>" +
            "<div class=\"overview-card-heading\">" +
            "<h3 class=\"overview-card-title\">N1</h3>" +
            "<span class=\"overview-card-badge overview-card-badge--live\">Main stage · live</span>" +
            "</div></header>" +
            "<div class=\"overview-card-body\">" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Progress rate</span>" +
            "<span class=\"overview-stat-value\">§0/s</span></div>" +
            "<div class=\"overview-stat overview-stat--milestone\">" +
            "<span class=\"overview-stat-label\">Next milestone</span>" +
            "<span class=\"overview-stat-value overview-stat-milestone-text\">Victory · 100.0%</span>" +
            "<div class=\"overview-mini-progress\" role=\"progressbar\" aria-valuenow=\"100.0\" aria-valuemin=\"0\" aria-valuemax=\"100\">" +
            "<div class=\"overview-mini-fill\" style=\"width:100%\"></div></div></div>" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Module details</span>" +
            "<span class=\"overview-stat-value\">D1</span></div>" +
            "<div class=\"overview-ascension-cell\">" +
            "Ascension: <span class=\"overview-asc-ready\">Ready</span> · Essence: §99 · Next gain: §1000 " +
            "(BH bonus +§40) (clap mult +§7)" +
            " <button type=\"button\" class=\"ascend-number-btn\" data-number=\"1\">Ascend Number 1</button>" +
            " <button type=\"button\" class=\"page-btn overview-open-ascension-btn\" data-open-ascension>Skill tree</button>" +
            "</div></div></article>" +
            "<article class=\"overview-card overview-card--n2\" data-overview-number=\"2\">" +
            "<header class=\"overview-card-header\">" +
            "<span class=\"overview-card-poster-glyph\" aria-hidden=\"true\">2</span>" +
            "<div class=\"overview-card-heading\">" +
            "<h3 class=\"overview-card-title\">N2</h3>" +
            "<span class=\"overview-card-badge overview-card-badge--bg\">Background · summarized</span>" +
            "</div></header>" +
            "<div class=\"overview-card-body\">" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Progress rate</span>" +
            "<span class=\"overview-stat-value\">§2/s</span></div>" +
            "<div class=\"overview-stat overview-stat--milestone\">" +
            "<span class=\"overview-stat-label\">Next milestone</span>" +
            "<span class=\"overview-stat-value overview-stat-milestone-text\">Wait · 0.0%</span>" +
            "<div class=\"overview-mini-progress\" role=\"progressbar\" aria-valuenow=\"0.0\" aria-valuemin=\"0\" aria-valuemax=\"100\">" +
            "<div class=\"overview-mini-fill\" style=\"width:0%\"></div></div></div>" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Module details</span>" +
            "<span class=\"overview-stat-value\">D2</span></div>" +
            "<p class=\"overview-coming-soon-note\">Switch to <strong>Number 2</strong> in the sidebar for Double or Nothing.</p>" +
            "<div class=\"overview-ascension-cell\">" +
            "Ascension: Not ready · Luck essence: §3 · Gate: Number 2 total ≥ §888." +
            "</div></div></article>"
        );
    });
});
