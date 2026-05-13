import { describe, expect, it } from "vitest";
import { COMBOS } from "./n1-combos.js";
import { createCombinationsPanelUi } from "./n1-combinations-panel-ui.js";

describe("createCombinationsPanelUi", () => {
    it("shows lock message when fewer than two hands are unlocked", () => {
        const { renderCombinationsPageHtml } = createCombinationsPanelUi({
            combos: COMBOS,
            getUnlockedHands: () => 1,
            getEarnedComboNames: () => [],
            getActiveComboNames: () => [],
            getComboActivationCounts: () => ({}),
            formatCount: n => String(n),
            renderComboPagePerHandStatusSectionHtml: () => ""
        });
        expect(renderCombinationsPageHtml()).toContain("Unlock Hand 2");
    });
});
