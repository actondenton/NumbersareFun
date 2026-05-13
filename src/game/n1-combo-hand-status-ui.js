import {
    buildComboHandStatusCardsHtml as buildComboHandStatusCardsHtmlForRows,
    renderComboPagePerHandStatusSectionHtml as renderComboPagePerHandStatusSectionHtmlForRows
} from "./n1-combo-ui.js";

/**
 * @param {{
 *   pagePanelEl: HTMLElement | null | undefined,
 *   pagePanelTitleEl: HTMLElement | null | undefined,
 *   getUnlockedHands: () => number,
 *   getHandEarning: (i: number) => number,
 *   getHandBaseCpsBeforeSlowdownMult: (i: number) => number,
 *   getHandPerHandRawCps: (i: number) => number,
 *   getHandEffectiveCps: (i: number) => number,
 *   getHandComboFactorForDisplay: () => number,
 *   getHandTurboFactorForDisplay: () => number,
 *   getHandSlowdownFactorForDisplay: (i: number) => number,
 *   formatCount: (n: number | bigint | string) => string,
 *   formatCpsForDisplay: (cps: number) => string,
 * }} deps
 */
export function createComboHandStatusUi(deps) {
    function getComboHandStatusRows() {
        const rows = [];
        const n = deps.getUnlockedHands();
        for (let i = 0; i < n; i++) {
            rows.push({
                handIndex: i,
                balance: deps.getHandEarning(i),
                baseCps: deps.getHandBaseCpsBeforeSlowdownMult(i),
                rawCps: deps.getHandPerHandRawCps(i),
                effectiveCps: deps.getHandEffectiveCps(i),
                comboFactor: deps.getHandComboFactorForDisplay(),
                turboFactor: deps.getHandTurboFactorForDisplay(),
                slowdownFactor: deps.getHandSlowdownFactorForDisplay(i)
            });
        }
        return rows;
    }

    function buildComboHandStatusCardsHtml() {
        return buildComboHandStatusCardsHtmlForRows(getComboHandStatusRows(), {
            formatCount: deps.formatCount,
            formatCps: deps.formatCpsForDisplay
        });
    }

    function renderComboPagePerHandStatusSectionHtml() {
        return renderComboPagePerHandStatusSectionHtmlForRows(getComboHandStatusRows(), {
            formatCount: deps.formatCount,
            formatCps: deps.formatCpsForDisplay
        });
    }

    function refreshCombinationsHandStatusIfOpen() {
        if (!deps.pagePanelEl || deps.pagePanelEl.style.display === "none" || !deps.pagePanelTitleEl) return;
        if (deps.pagePanelTitleEl.textContent !== "Combinations") return;
        const listEl = document.getElementById("combo-per-hand-status-list");
        if (!listEl) return;
        listEl.innerHTML = buildComboHandStatusCardsHtml();
    }

    return {
        getComboHandStatusRows,
        buildComboHandStatusCardsHtml,
        renderComboPagePerHandStatusSectionHtml,
        refreshCombinationsHandStatusIfOpen
    };
}
