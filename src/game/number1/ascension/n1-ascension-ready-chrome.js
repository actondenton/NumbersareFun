/**
 * Sidebar ascension page button + ready-banner chrome (Phase 21c).
 *
 * @param {object} dep
 */
export function createAscensionReadyChrome(dep) {
    function updateAscensionReadyChrome() {
        const ready = dep.isNumber1AscensionReady();
        let gainInfo = null;
        let ascendGainStr = "";
        if (ready) {
            gainInfo = dep.computeNumber1AscensionGainBreakdown(dep.getNumber1AscensionEssenceFormulaTotal());
            ascendGainStr = dep.formatCount(gainInfo.finalGain);
        }
        const ascensionReadyBannerEssenceSuffixEl = dep.ascensionReadyBannerEssenceSuffixEl;
        if (ascensionReadyBannerEssenceSuffixEl) {
            if (!ready) {
                ascensionReadyBannerEssenceSuffixEl.textContent = "";
            } else {
                const parts = ["base " + dep.formatCount(gainInfo.baseGain)];
                if (gainInfo.pendingBonus > 0) parts.push("warp bonus " + dep.formatCount(gainInfo.pendingBonus));
                if (gainInfo.blackHoleMultiplierBonus > 0) {
                    parts.push(
                        dep.getArcEssenceMultiplierBonusPhraseTitle() +
                        " +" + dep.formatCount(gainInfo.blackHoleMultiplierBonus) +
                        " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)"
                    );
                }
                if (gainInfo.multiplierBonus > 0) {
                    parts.push("clap mult +" + dep.formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)");
                }
                const bonusText = parts.length > 1 ? (" (" + parts.join(" + ") + ")") : "";
                ascensionReadyBannerEssenceSuffixEl.textContent =
                    "Ascend now for " + ascendGainStr + " essence" + bonusText + ".";
            }
        }
        const ascensionReadyBannerEl = dep.ascensionReadyBannerEl;
        if (ascensionReadyBannerEl) {
            ascensionReadyBannerEl.hidden = true;
            ascensionReadyBannerEl.setAttribute("aria-hidden", "true");
        }
        const ascensionPageBtn = dep.ascensionPageBtn;
        if (ascensionPageBtn) {
            ascensionPageBtn.style.display = (dep.getNumber1HasAscended() || ready) ? "" : "none";
            ascensionPageBtn.classList.toggle("page-btn--ascension-ready", ready);
            ascensionPageBtn.textContent = ready ? ("Ascension: " + ascendGainStr) : "Ascension";
            if (ready) {
                ascensionPageBtn.setAttribute("title", "Ascension ready — click to ascend or manage Essence");
                ascensionPageBtn.setAttribute("aria-label", "Ascension ready — " + ascendGainStr + " Essence on ascend");
            } else {
                ascensionPageBtn.removeAttribute("title");
                ascensionPageBtn.removeAttribute("aria-label");
            }
        }
    }

    return { updateAscensionReadyChrome };
}
