import { describe, expect, it } from "vitest";
import { createComboHandStatusUi } from "./n1-combo-hand-status-ui.js";

describe("createComboHandStatusUi", () => {
    function makeUi() {
        return createComboHandStatusUi({
            pagePanelEl: null,
            pagePanelTitleEl: null,
            getUnlockedHands: () => 2,
            getHandEarning: i => (i === 0 ? 10 : 99),
            getHandBaseCpsBeforeSlowdownMult: () => 1,
            getHandPerHandRawCps: () => 2,
            getHandEffectiveCps: () => 4,
            getHandComboFactorForDisplay: () => 1.25,
            getHandTurboFactorForDisplay: () => 1.5,
            getHandSlowdownFactorForDisplay: () => 1,
            formatCount: n => String(n),
            formatCpsForDisplay: n => String(n)
        });
    }

    it("maps per-hand CPS snapshot rows", () => {
        const { getComboHandStatusRows } = makeUi();
        const rows = getComboHandStatusRows();
        expect(rows).toHaveLength(2);
        expect(rows[0].handIndex).toBe(0);
        expect(rows[0].balance).toBe(10);
        expect(rows[1].effectiveCps).toBe(4);
    });

    it("wraps per-hand section with list id for live refresh", () => {
        const { renderComboPagePerHandStatusSectionHtml } = makeUi();
        const html = renderComboPagePerHandStatusSectionHtml();
        expect(html).toContain('id="combo-per-hand-status-list"');
        expect(html).toContain("combo-hand-status-grid");
    });
});
