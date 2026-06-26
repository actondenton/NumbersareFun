import { describe, expect, it, vi } from "vitest";

import { createOverviewAscensionPanelsRefresh } from "./n1-overview-ascension-panels.js";

describe("createOverviewAscensionPanelsRefresh", () => {
    it("refills overview HTML when the overview panel is open", () => {
        const pagePanelBodyEl = { innerHTML: "" };
        const pagePanelEl = {
            style: { display: "block" },
            dataset: { openPageId: "overview" }
        };

        const { refreshGlobalOverviewPanelIfOpen } = createOverviewAscensionPanelsRefresh({
            getPagePanelEl: () => pagePanelEl,
            getPagePanelBodyEl: () => pagePanelBodyEl,
            getAscensionPageActiveNumber: () => 1,
            renderGlobalOverview: () => '<p id="overview-stub"></p>',
            renderAscensionPageHtml: () => "",
            renderNumber1AscendControlHtml: () => "",
            getNumber1AscendControlLivePatchDigest: () => "",
            teardownAscensionMapPanZoom: () => {},
            initAscensionMapPanZoom: () => {},
            patchBlackHolePhase1PanelLiveDom: () => false,
            patchBlackHolePhase2PanelLiveDom: () => false,
            patchAscensionHubStatsPillsDomIfChanged: () => false,
            syncPhase1MassFillCssVars: () => {},
            syncPhase1TesseractCanvasesInRoot: () => {},
            getBlackHolePhase: () => 0,
            isBlackHoleArcUnlocked: () => false,
            refreshBlackHolePanelLiveDomIfOpen: () => {},
            updateAscensionMapDetailPanel: vi.fn(),
            getUnlockedNumberModules: () => [],
            formatCount: n => String(n),
            computeNumber1AscensionGainBreakdown: () => ({ finalGain: 0 }),
            getNumber1AscensionEssenceFormulaTotal: () => 0,
            getNumber1AscensionRequiredHands: () => 1,
            getNumber1AscensionEssence: () => 0,
            number1HasAscended: () => false,
            getArcEssenceMultiplierBonusPhraseTitle: () => "BH",
            getNumber2State: () => ({ started: false })
        });

        refreshGlobalOverviewPanelIfOpen();
        expect(pagePanelBodyEl.innerHTML).toBe('<p id="overview-stub"></p>');
    });
});
