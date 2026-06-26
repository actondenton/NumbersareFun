import { describe, expect, it } from "vitest";

import { ASCENSION_1_REQUIRED_TOTAL } from "./n1-ascension.js";
import { createAscensionPageRender } from "./n1-ascension-page-render.js";

function baseDep(overrides: Record<string, unknown> = {}) {
    return {
        getNumber1AscensionEssence: () => 0,
        getNumber1HasAscended: () => false,
        getUnlockedHands: () => 1,
        getTotalChanges: () => 0,
        getBlackHolePhase: () => 0,
        getNumber1AscensionRequiredHands: () => 1,
        isNumber1AscensionReady: () => false,
        computeNumber1AscensionGainBreakdown: () => ({
            finalGain: 0,
            baseGain: 0,
            pendingBonus: 0,
            blackHolePhaseMult: 1,
            beforeMult: 0,
            clapMult: 1,
            blackHoleMultiplierBonus: 0,
            multiplierBonus: 0
        }),
        getNumber1AscensionEssenceFormulaTotal: () => 1,
        formatCount: (n: number) => String(n),
        getArcEssenceMultiplierBonusPhraseLower: () => "arc bonus",
        ascensionPurchasedSet: () => new Set<string>(),
        isAscensionMapCollapseTransitionActive: () => false,
        isBlackHoleArcUnlocked: () => false,
        getNumber1AscensionNodeIds: () => [] as string[],
        getAscensionMapNodeById: () => ({}),
        computeAscensionHandLayout: () => ({}),
        getAscensionMapViewBoxHeight: () => 100,
        getAscensionTreeExport: () => null,
        getAscensionMapNodes: () => [] as { id: string; route: string; title: string }[],
        ascensionNodePrereqsMet: () => false,
        renderAscensionMapColumnGuidesSvg: () => "",
        renderAscensionMapEdgesSvg: () => "",
        renderAscensionMapDebugOverlaySvg: () => "",
        renderAscensionHubStatsPillsHtml: () => "",
        renderAscensionHubGrantsHtml: () => "",
        renderNumber1BlackHolePanelHtml: () => "",
        normalizeAscensionPageActiveNumber: () => {},
        getAscensionPageActiveNumber: () => 1,
        isNumber2Unlocked: () => false,
        renderNumber2AscensionShell: () => "<div class=\"n2\">shell</div>",
        ...overrides
    };
}

describe("createAscensionPageRender", () => {
    it("digest reports pre-ascend state", () => {
        const page = createAscensionPageRender(baseDep({
            getUnlockedHands: () => 2,
            getTotalChanges: () => 50,
            getNumber1AscensionEssence: () => 3
        }));
        expect(page.getNumber1AscendControlLivePatchDigest()).toBe("pre|2|50|3");
    });

    it("renders locked placeholder before first ascend", () => {
        const page = createAscensionPageRender(baseDep());
        expect(page.renderAscensionUpgradesHtml()).toContain("Ascension map locked");
    });

    it("renders ascend control with requirement copy", () => {
        const page = createAscensionPageRender(baseDep({
            getNumber1HasAscended: () => true,
            getTotalChanges: () => 10,
            getUnlockedHands: () => 1
        }));
        const html = page.renderNumber1AscendControlHtml();
        expect(html).toContain("ascension-run-action");
        expect(html).toContain(String(ASCENSION_1_REQUIRED_TOTAL));
    });

    it("wraps Number 1 body in ascension page shell", () => {
        const page = createAscensionPageRender(baseDep({
            getNumber1HasAscended: () => true
        }));
        const html = page.renderAscensionPageHtml();
        expect(html).toContain("ascension-page");
        expect(html).toContain("ascension-hub");
    });
});
