// Number 1 Combinations Panel Module
// Merged from: n1-combinations-panel-refresh.js, n1-combinations-panel-ui.js

import { getComboIndexListContext as buildComboIndexListContext, buildComboIndexListItemsHtml, buildComboIndexLiveSummaryText } from "./combo.js";

// ==================== COMBINATIONS PANEL UI (from n1-combinations-panel-ui.js) ====================

/**
 * Combinations page: index summary + filter state, live patch, and full-page HTML.
 *
 * @param {{
 *   combos: unknown[],
 *   getUnlockedHands: () => number,
 *   getEarnedComboNames: () => string[],
 *   getActiveComboNames: () => string[],
 *   getComboActivationCounts: () => Record<string, number>,
 *   formatCount: (n: number | bigint | string) => string,
 *   renderComboPagePerHandStatusSectionHtml: () => string,
 * }} deps
 */
export function createCombinationsPanelUi(deps) {
    let comboIndexStatusFilter = "all";
    let comboIndexHandsFilter = "all";

    function setComboIndexStatusFilter(v) {
        comboIndexStatusFilter = v && typeof v === "string" ? v : "all";
    }

    function setComboIndexHandsFilter(v) {
        comboIndexHandsFilter = v && typeof v === "string" ? v : "all";
    }

    function resetComboIndexFilters() {
        comboIndexStatusFilter = "all";
        comboIndexHandsFilter = "all";
    }

    function getComboIndexListContext() {
        return buildComboIndexListContext({
            combos: deps.combos,
            unlockedHands: deps.getUnlockedHands(),
            earnedComboNames: deps.getEarnedComboNames(),
            activeComboNames: deps.getActiveComboNames(),
            statusFilter: comboIndexStatusFilter,
            handsFilter: comboIndexHandsFilter
        });
    }

    function buildComboIndexListItemsInnerHtml(ctx) {
        return buildComboIndexListItemsHtml(
            {
                ...ctx,
                comboActivationCounts: deps.getComboActivationCounts()
            },
            deps.formatCount
        );
    }

    function patchCombinationsPageLiveDom() {
        if (deps.getUnlockedHands() < 2) return false;
        const summaryEl = document.getElementById("combo-index-live-summary");
        const listEl = document.getElementById("combo-index-list");
        if (!summaryEl || !listEl) return false;
        const ctx = getComboIndexListContext();
        summaryEl.textContent = buildComboIndexLiveSummaryText(ctx);
        listEl.innerHTML = buildComboIndexListItemsInnerHtml(ctx);
        return true;
    }

    function renderCombinationsPageHtml() {
        if (deps.getUnlockedHands() < 2) return "<p class=\"message-log-empty\">Unlock Hand 2 to view combinations.</p>";
        const ctx = getComboIndexListContext();
        const handOptions = ["all"].concat(
            Array.from(new Set(ctx.available.map(c => c.minHands))).sort((a, b) => a - b).map(String)
        );
        const statusButtons = [
            { id: "all", label: "All" },
            { id: "discovered", label: "Discovered" },
            { id: "undiscovered", label: "Undiscovered" }
        ]
            .map(
                b =>
                    "<button type=\"button\" class=\"page-btn combo-filter-btn" +
                    (comboIndexStatusFilter === b.id ? " combo-filter-active" : "") +
                    "\" data-combo-status=\"" +
                    b.id +
                    "\">" +
                    b.label +
                    "</button>"
            )
            .join(" ");
        const handButtons = handOptions
            .map(h => {
                const label = h === "all" ? "All hand counts" : h + "-hand combos";
                return (
                    "<button type=\"button\" class=\"page-btn combo-filter-btn" +
                    (comboIndexHandsFilter === h ? " combo-filter-active" : "") +
                    "\" data-combo-hands=\"" +
                    h +
                    "\">" +
                    label +
                    "</button>"
                );
            })
            .join(" ");
        return (
            "<div class=\"coming-soon-sneak-peek\"><p class=\"coming-soon-sneak-title\">Combination Index</p><p id=\"combo-index-live-summary\">" +
            buildComboIndexLiveSummaryText(ctx) +
            "</p></div>" +
            deps.renderComboPagePerHandStatusSectionHtml() +
            "<section class=\"combo-earned-bonuses-section\" aria-labelledby=\"combo-bonus-breakdown-heading\">" +
            "<h3 id=\"combo-bonus-breakdown-heading\" class=\"combo-earned-bonuses-heading\">Combo Catalog breakdown</h3>" +
            '<div id="combo-discovery-milestone-ui" class="combo-discovery-milestone-ui" hidden aria-live="polite">' +
            '<p id="combo-discovery-milestone-line" class="combo-discovery-milestone-line"></p>' +
            '<div class="combo-discovery-milestone-bar-track" id="combo-discovery-milestone-bar-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Combo Catalog unlock cooldown">' +
            '<div id="combo-discovery-milestone-bar-fill" class="combo-discovery-milestone-bar-fill"></div></div></div>' +
            '<p class="combo-earned-bonuses-intro">Discovered patterns add to your <strong>Combo Catalog</strong> (hand-count tiers stack between tiers; patterns multiply within each tier). <strong>Count per second</strong> multiplies raw rates by <strong>Combo Catalog</strong> and by <strong>Ascended Combo</strong> (Middle-finger ascension). <strong>Time Warp</strong> uses that tick stack × your index-finger combo bonus × the bursting hand&rsquo;s combo share.</p>' +
            '<ul id="earned-bonuses-list" class="earned-bonuses-list--page"></ul></section>' +
            "<div class=\"combo-filter-row\">" +
            statusButtons +
            "</div>" +
            "<div class=\"combo-filter-row\">" +
            handButtons +
            "</div>" +
            '<ul id="combo-index-list">' +
            buildComboIndexListItemsInnerHtml(ctx) +
            "</ul>"
        );
    }

    return {
        patchCombinationsPageLiveDom,
        renderCombinationsPageHtml,
        setComboIndexStatusFilter,
        setComboIndexHandsFilter,
        resetComboIndexFilters
    };
}

// ==================== COMBINATIONS PANEL REFRESH (from n1-combinations-panel-refresh.js) ====================

const COMBO_FILTER_DEBOUNCE_MS = 220;
const COMBO_FILTER_LOCK_MS = 220;
const COMBO_FILTER_PAUSE_AUTO_REFRESH_MS = 1000;
const COMBINATIONS_FULL_REFRESH_MIN_MS = 350;

/**
 * @param {{
 *   getPagePanelEl: () => HTMLElement | null | undefined,
 *   getPagePanelBodyEl: () => HTMLElement | null | undefined,
 *   getPagePanelTitleEl: () => HTMLElement | null | undefined,
 *   combinationsPageTitleText: string,
 *   getPatchCombinationsPageLiveDom: () => () => boolean,
 *   getRenderCombinationsPageHtml: () => () => string,
 *   refreshCombinationsHandStatusIfOpen: () => void,
 *   updateEarnedBonusesUI: (forceRebuild?: boolean) => void,
 *   updateComboDiscoveryMilestonePanelIfOpen: () => void,
 * }} deps
 */
export function createCombinationsPanelRefresh(deps) {
    let comboFilterInteractionLockUntilMs = 0;
    let comboFilterLastApplyAtMs = 0;
    let comboFilterPauseAutoRefreshUntilMs = 0;
    let lastCombinationsFullRefreshMs = 0;

    /** Call when opening Combinations from the nav so the throttle clock matches user intent. */
    function markCombinationsPanelOpenedClock() {
        lastCombinationsFullRefreshMs = Date.now();
    }

    /** @returns {boolean} false when clicks should be ignored (debounce / interaction lock). */
    function consumeComboFilterClickDebounced(now) {
        if (now < comboFilterInteractionLockUntilMs) return false;
        if (now - comboFilterLastApplyAtMs < COMBO_FILTER_DEBOUNCE_MS) return false;
        comboFilterLastApplyAtMs = now;
        comboFilterInteractionLockUntilMs = now + COMBO_FILTER_LOCK_MS;
        comboFilterPauseAutoRefreshUntilMs = now + COMBO_FILTER_PAUSE_AUTO_REFRESH_MS;
        return true;
    }

    function refreshCombinationsPanelIfOpen(force) {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        const pagePanelTitleEl = deps.getPagePanelTitleEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl || !pagePanelTitleEl) return;
        if (pagePanelTitleEl.textContent !== deps.combinationsPageTitleText) return;
        const now = Date.now();
        const patchCombinationsPageLiveDom = deps.getPatchCombinationsPageLiveDom();
        const renderCombinationsPageHtml = deps.getRenderCombinationsPageHtml();
        if (!force && now < comboFilterPauseAutoRefreshUntilMs) {
            patchCombinationsPageLiveDom();
            deps.refreshCombinationsHandStatusIfOpen();
            deps.updateEarnedBonusesUI(false);
        } else if (!force && now - lastCombinationsFullRefreshMs < COMBINATIONS_FULL_REFRESH_MIN_MS) {
            patchCombinationsPageLiveDom();
            deps.refreshCombinationsHandStatusIfOpen();
            deps.updateEarnedBonusesUI(false);
        } else {
            lastCombinationsFullRefreshMs = now;
            if (force) {
                pagePanelBodyEl.innerHTML = renderCombinationsPageHtml();
                deps.updateEarnedBonusesUI();
            } else if (patchCombinationsPageLiveDom()) {
                deps.refreshCombinationsHandStatusIfOpen();
                deps.updateEarnedBonusesUI(false);
            } else {
                pagePanelBodyEl.innerHTML = renderCombinationsPageHtml();
                deps.updateEarnedBonusesUI();
            }
        }
        deps.updateComboDiscoveryMilestonePanelIfOpen();
    }

    return {
        refreshCombinationsPanelIfOpen,
        markCombinationsPanelOpenedClock,
        consumeComboFilterClickDebounced
    };
}
