/**
 * Milestone strip + ascension-ready chrome (objective rows stay in legacy-boot).
 *
 * @param {object} deps
 */
export function createN1StoryMilestoneBoot(deps) {
    const {
        getMilestoneTextEl,
        getMilestoneProgressFillEl,
        getMilestoneTitleEl,
        getMilestoneEssenceLineEl,
        getLongTermObjectives,
        getTotalChanges,
        formatCount,
        getObjectiveProgressForTotal,
        getNumber1AscensionEssence,
        isNumber1AscensionReady,
        getNumber1AscensionRequiredHands,
        getUnlockedHands,
        ASCENSION_1_REQUIRED_TOTAL,
        getNumber1AscensionPendingBonusEssence,
        getAscensionReadyBannerEssenceSuffixEl,
        getAscensionReadyBannerEl,
        getAscensionPageBtn,
        getNumber1HasAscended,
        computeNumber1AscensionGainBreakdown,
        getNumber1AscensionEssenceFormulaTotal,
        getArcEssenceMultiplierBonusPhraseTitle
    } = deps;

    function updateAscensionReadyChrome() {
        const ready = isNumber1AscensionReady();
        const ascensionReadyBannerEssenceSuffixEl = getAscensionReadyBannerEssenceSuffixEl();
        const ascensionReadyBannerEl = getAscensionReadyBannerEl();
        const ascensionPageBtn = getAscensionPageBtn();
        let gainInfo = null;
        let ascendGainStr = "";
        if (ready) {
            gainInfo = computeNumber1AscensionGainBreakdown(getNumber1AscensionEssenceFormulaTotal());
            ascendGainStr = formatCount(gainInfo.finalGain);
        }
        if (ascensionReadyBannerEssenceSuffixEl) {
            if (!ready) {
                ascensionReadyBannerEssenceSuffixEl.textContent = "";
            } else {
                const parts = ["base " + formatCount(gainInfo.baseGain)];
                if (gainInfo.pendingBonus > 0) parts.push("warp bonus " + formatCount(gainInfo.pendingBonus));
                if (gainInfo.blackHoleMultiplierBonus > 0) {
                    parts.push(getArcEssenceMultiplierBonusPhraseTitle() + " +" + formatCount(gainInfo.blackHoleMultiplierBonus) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)");
                }
                if (gainInfo.multiplierBonus > 0) {
                    parts.push("clap mult +" + formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)");
                }
                const bonusText = parts.length > 1 ? (" (" + parts.join(" + ") + ")") : "";
                ascensionReadyBannerEssenceSuffixEl.textContent =
                    "Ascend now for " + ascendGainStr + " essence" + bonusText + ".";
            }
        }
        if (ascensionReadyBannerEl) {
            ascensionReadyBannerEl.hidden = true;
            ascensionReadyBannerEl.setAttribute("aria-hidden", "true");
        }
        if (ascensionPageBtn) {
            ascensionPageBtn.style.display = (getNumber1HasAscended() || ready) ? "" : "none";
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

    function updateMilestoneUI() {
        const milestoneTextEl = getMilestoneTextEl();
        const milestoneProgressFillEl = getMilestoneProgressFillEl();
        if (!milestoneTextEl || !milestoneProgressFillEl) return;
        const longTermObjectives = getLongTermObjectives();
        const next = longTermObjectives.find(o => !o.achieved) || longTermObjectives[longTermObjectives.length - 1];
        if (!next) return;
        const totalChanges = getTotalChanges();
        const progress = getObjectiveProgressForTotal(next, totalChanges, formatCount);
        const pct = next.achieved ? 100 : progress.pct;
        const milestoneTitleEl = getMilestoneTitleEl();
        if (milestoneTitleEl) milestoneTitleEl.textContent = "Next milestone";
        milestoneTextEl.textContent = next.text + (progress.label ? " — " + progress.label : "") + " (" + pct.toFixed(2) + "%)";
        milestoneProgressFillEl.style.width = pct + "%";
        const milestoneEssenceLineEl = getMilestoneEssenceLineEl();
        if (milestoneEssenceLineEl) {
            if (getNumber1AscensionEssence() > 0 || isNumber1AscensionReady()) {
                milestoneEssenceLineEl.style.display = "";
                const ascPct = Math.max(0, Math.min(100, (totalChanges / ASCENSION_1_REQUIRED_TOTAL) * 100));
                const requiredHands = getNumber1AscensionRequiredHands();
                const handReqText = getUnlockedHands() >= requiredHands ? "hands ready" : ("hands: " + getUnlockedHands() + "/" + requiredHands);
                const readinessText = isNumber1AscensionReady()
                    ? " — Ascension ready! Use the glowing Ascension button."
                    : (" — Ascension: " + formatCount(totalChanges) + " / " + formatCount(ASCENSION_1_REQUIRED_TOTAL) + " (" + ascPct.toFixed(2) + "%), " + handReqText);
                const pendingBonus = getNumber1AscensionPendingBonusEssence();
                const pendingText = pendingBonus > 0 ? (" · Pending warp bonus: +" + formatCount(pendingBonus)) : "";
                milestoneEssenceLineEl.textContent = "Ascension Essence (Number 1): " + formatCount(getNumber1AscensionEssence()) + pendingText + readinessText;
            } else {
                milestoneEssenceLineEl.textContent = "";
                milestoneEssenceLineEl.style.display = "none";
            }
        }
        updateAscensionReadyChrome();
    }

    return { updateMilestoneUI, updateAscensionReadyChrome };
}
