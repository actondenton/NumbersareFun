import { ASCENSION_1_REQUIRED_TOTAL } from "./n1-ascension.js";
import { NUMBER2_ASCENSION_READY_TOTAL } from "./number2-rules.js";

/** Overview refresh, ascension hub refresh/live patch, and periodic overview DOM patches. */
export function createOverviewAscensionPanelsRefresh(deps) {
    function refreshGlobalOverviewPanelIfOpen() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "overview") return;
        pagePanelBodyEl.innerHTML = deps.renderGlobalOverview();
    }

    function patchNumber1AscendControlIfOpen() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension" || deps.getAscensionPageActiveNumber() !== 1) return;
        const digest = deps.getNumber1AscendControlLivePatchDigest();
        const control = pagePanelBodyEl.querySelector(".ascension-run-action");
        if (control && control.getAttribute("data-live-patch-digest") === digest) return;
        if (control) control.outerHTML = deps.renderNumber1AscendControlHtml(digest);
    }

    function refreshAscensionPanelIfOpen() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension") return;
        patchNumber1AscendControlIfOpen();
        if (deps.getAscensionPageActiveNumber() === 1 && (deps.getBlackHolePhase() === 1 || deps.getBlackHolePhase() === 2)) {
            const bhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
            if (bhEl && (deps.patchBlackHolePhase1PanelLiveDom(bhEl) || deps.patchBlackHolePhase2PanelLiveDom(bhEl))) {
                deps.patchAscensionHubStatsPillsDomIfChanged();
                deps.syncPhase1MassFillCssVars();
                deps.syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
                return;
            }
        }
        deps.teardownAscensionMapPanZoom();
        pagePanelBodyEl.innerHTML = deps.renderAscensionPageHtml();
        if (deps.getAscensionPageActiveNumber() === 1 && deps.number1HasAscended()) {
            requestAnimationFrame(() => deps.initAscensionMapPanZoom());
        }
        deps.syncPhase1MassFillCssVars();
        deps.syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
        if (typeof deps.afterBlackHolePanelMounted === "function") {
            const bhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
            if (bhEl) deps.afterBlackHolePanelMounted(bhEl);
        }
    }

    function refreshOverviewAndAscensionPanelsIfOpen() {
        refreshGlobalOverviewPanelIfOpen();
        refreshAscensionPanelIfOpen();
    }

    function refreshOverviewAndAscensionHubLiveIfOpen() {
        refreshGlobalOverviewPanelIfOpen();
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension") return;
        if (deps.getAscensionPageActiveNumber() === 1) {
            patchAscensionPanelLiveDom();
            return;
        }
        refreshAscensionPanelIfOpen();
    }

    function patchGlobalOverviewLiveDom() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "overview") return;
        deps.getUnlockedNumberModules().forEach(function (entry) {
            const card = pagePanelBodyEl.querySelector('.overview-card[data-overview-number="' + entry.number + '"]');
            if (!card) return;
            const m = entry.module;
            const milestone = m.getMilestone();
            const rateStr = deps.formatCount(Math.round(m.getRatePerSec() * 100) / 100) + "/s";
            const pct = Math.max(0, Math.min(100, milestone.pct));
            const stats = card.querySelectorAll(".overview-stat");
            if (stats[0]) {
                const v = stats[0].querySelector(".overview-stat-value");
                if (v && v.textContent !== rateStr) v.textContent = rateStr;
            }
            if (stats[1]) {
                const v = stats[1].querySelector(".overview-stat-milestone-text");
                const fill = stats[1].querySelector(".overview-mini-fill");
                const bar = stats[1].querySelector(".overview-mini-progress");
                const milestoneTxt = milestone.text + " · " + pct.toFixed(1) + "%";
                const pctStr = String(pct.toFixed(1));
                if (v && v.textContent !== milestoneTxt) v.textContent = milestoneTxt;
                if (fill) {
                    const w = pct + "%";
                    if (fill.style.width !== w) fill.style.width = w;
                }
                if (bar && bar.getAttribute("aria-valuenow") !== pctStr) bar.setAttribute("aria-valuenow", pctStr);
            }
            if (stats[2]) {
                const v = stats[2].querySelector(".overview-stat-value");
                const detailsStr = m.getOverviewDetails();
                if (v && v.textContent !== detailsStr) v.textContent = detailsStr;
            }
            if (entry.number === 1) {
                const ascReady = m.isAscensionReady();
                const gainPreviewInfo = ascReady
                    ? deps.computeNumber1AscensionGainBreakdown(deps.getNumber1AscensionEssenceFormulaTotal())
                    : null;
                const gainPreview = gainPreviewInfo ? gainPreviewInfo.finalGain : 0;
                const cell = card.querySelector(".overview-ascension-cell");
                if (cell) {
                    let ascPart = "Ascension: " + (ascReady ? "<span class=\"overview-asc-ready\">Ready</span>" : "Not ready");
                    ascPart += " · Essence: " + deps.formatCount(deps.getNumber1AscensionEssence());
                    if (!ascReady) {
                        ascPart +=
                            " · Requirement: " +
                            deps.formatCount(ASCENSION_1_REQUIRED_TOTAL) +
                            " total and " +
                            deps.getNumber1AscensionRequiredHands() +
                            " hands";
                    }
                    if (ascReady) {
                        ascPart += " · Next gain: " + deps.formatCount(gainPreview);
                        if (gainPreviewInfo && gainPreviewInfo.blackHoleMultiplierBonus > 0) {
                            ascPart +=
                                " (" +
                                deps.getArcEssenceMultiplierBonusPhraseTitle() +
                                " +" +
                                deps.formatCount(gainPreviewInfo.blackHoleMultiplierBonus) +
                                ")";
                        }
                        if (gainPreviewInfo && gainPreviewInfo.multiplierBonus > 0) {
                            ascPart +=
                                " (clap mult +" + deps.formatCount(gainPreviewInfo.multiplierBonus) + ")";
                        }
                        ascPart +=
                            ' <button type="button" class="page-btn ascend-number-btn" data-number="1">Ascend Number 1</button>';
                    }
                    if (deps.number1HasAscended()) {
                        ascPart +=
                            ' <button type="button" class="page-btn overview-open-ascension-btn" data-open-ascension>Skill tree</button>';
                    }
                    if (cell.dataset.overviewAscSnap !== ascPart) {
                        cell.innerHTML = ascPart;
                        cell.dataset.overviewAscSnap = ascPart;
                    }
                }
            }
            if (entry.number === 2) {
                const ascReady = m.isAscensionReady();
                const cell = card.querySelector(".overview-ascension-cell");
                const number2State = deps.getNumber2State();
                if (cell) {
                    let ascPart = "Ascension: " + (ascReady ? "<span class=\"overview-asc-ready\">Ready</span>" : "Not ready");
                    if (!number2State.started) ascPart = "Ascension: inactive — switch to Number 2 in the sidebar to begin.";
                    ascPart += " · Luck essence: " + deps.formatCount(number2State.ascensionEssence || 0);
                    if (number2State.started) {
                        if (ascReady) {
                            ascPart +=
                                ' <button type="button" class="page-btn overview-open-ascension-n2-btn" data-open-ascension-n2>Luck table</button>';
                        } else {
                            ascPart += " · Gate: Number 2 total ≥ " + deps.formatCount(NUMBER2_ASCENSION_READY_TOTAL) + ".";
                        }
                    }
                    if (cell.dataset.overviewAscSnap !== ascPart) {
                        cell.innerHTML = ascPart;
                        cell.dataset.overviewAscSnap = ascPart;
                    }
                }
            }
        });
    }

    function patchAscensionPanelLiveDom() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension") return;
        if (deps.getAscensionPageActiveNumber() !== 1) return;
        patchNumber1AscendControlIfOpen();
        if (deps.isBlackHoleArcUnlocked() && deps.getBlackHolePhase() >= 1) {
            deps.refreshBlackHolePanelLiveDomIfOpen();
            return;
        }
        deps.patchAscensionHubStatsPillsDomIfChanged();
        deps.updateAscensionMapDetailPanel();
    }

    return {
        refreshGlobalOverviewPanelIfOpen,
        patchNumber1AscendControlIfOpen,
        refreshAscensionPanelIfOpen,
        refreshOverviewAndAscensionPanelsIfOpen,
        refreshOverviewAndAscensionHubLiveIfOpen,
        patchGlobalOverviewLiveDom,
        patchAscensionPanelLiveDom
    };
}
