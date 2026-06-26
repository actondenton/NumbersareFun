import { describe, expect, it } from "vitest";

import { createGlobalOverviewBoot } from "./n1-global-overview-cards.js";

const fmt = (n: number) => `§${n}`;

function baseDep(overrides: Record<string, unknown> = {}) {
    return {
        formatCount: fmt,
        getUnlockedNumberModules: () => [] as { number: number; module: Record<string, unknown> }[],
        computeNumber1AscensionGainBreakdown: () => ({
            finalGain: 100,
            blackHoleMultiplierBonus: 10,
            multiplierBonus: 5
        }),
        getNumber1AscensionEssenceFormulaTotal: () => 500,
        getArcEssenceMultiplierBonusPhraseTitle: () => "BH bonus",
        getNumber1AscensionEssence: () => 20,
        getNumber1AscensionRequiredHands: () => 4,
        getNumber1HasAscended: () => false,
        getNumber2Started: () => true,
        getNumber2AscensionEssence: () => 3,
        ...overrides
    };
}

describe("createGlobalOverviewBoot", () => {
    it("renders empty overview when no modules are unlocked", () => {
        const boot = createGlobalOverviewBoot(baseDep());
        expect(boot.renderGlobalOverview()).toContain("overview-empty");
    });

    it("builds Number 1 card with gain preview when ascension is ready", () => {
        const boot = createGlobalOverviewBoot(baseDep({
            getUnlockedNumberModules: () => [{
                number: 1,
                module: {
                    getMilestone: () => ({ text: "Reach 10", pct: 50 }),
                    isAscensionReady: () => true,
                    getLabel: () => "Number I",
                    getRatePerSec: () => 1.5,
                    getOverviewDetails: () => "Essence line"
                }
            }]
        }));
        const html = boot.renderGlobalOverview();
        expect(html).toContain("overview-card--n1");
        expect(html).toContain("overview-asc-ready");
        expect(html).toContain("(BH bonus +§10)");
    });

    it("builds Number 2 ascension gate fields", () => {
        const cards = createGlobalOverviewBoot(baseDep({
            getUnlockedNumberModules: () => [{
                number: 2,
                module: {
                    getMilestone: () => ({ text: "Wait", pct: 0 }),
                    isAscensionReady: () => false,
                    getLabel: () => "N2",
                    getRatePerSec: () => 2,
                    getOverviewDetails: () => "D2"
                }
            }]
        })).buildGlobalOverviewCardsForHtml();
        expect(cards[0].number2Ascension).toEqual({
            started: true,
            luckAscensionEssence: 3,
            ascensionGateTotal: expect.any(Number)
        });
    });
});
