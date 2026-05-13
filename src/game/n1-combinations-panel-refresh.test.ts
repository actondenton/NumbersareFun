import { describe, expect, it } from "vitest";
import { createCombinationsPanelRefresh } from "./n1-combinations-panel-refresh.js";

describe("createCombinationsPanelRefresh", () => {
    it("debounces combo filter clicks within the lock window", () => {
        const body = { innerHTML: "", style: { display: "block" } };
        const title = { textContent: "Combinations" };
        const panel = { style: { display: "block" } };

        const deps = {
            getPagePanelEl: () => panel,
            getPagePanelBodyEl: () => body,
            getPagePanelTitleEl: () => title,
            combinationsPageTitleText: "Combinations",
            getPatchCombinationsPageLiveDom: () => () => true,
            getRenderCombinationsPageHtml: () => () => "<div id=\"combo-index-live-summary\"></div><ul id=\"combo-index-list\"></ul>",
            refreshCombinationsHandStatusIfOpen: () => {},
            updateEarnedBonusesUI: () => {},
            updateComboDiscoveryMilestonePanelIfOpen: () => {}
        };
        const { consumeComboFilterClickDebounced } = createCombinationsPanelRefresh(deps);

        const t = 1_000_000;
        expect(consumeComboFilterClickDebounced(t)).toBe(true);
        expect(consumeComboFilterClickDebounced(t + 50)).toBe(false);
    });
});
