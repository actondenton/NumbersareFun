import { bindObjectiveAchievedToStore } from "../state/n1-objectives-store.js";
import {
    getObjectiveProgress,
    isObjectiveComplete,
    renderObjective
} from "./n1-objectives.js";
import { createNumber1LongTermObjectives, NUMBER1_SHORT_TERM_OBJECTIVES } from "./n1-objectives-catalog.js";
import { createConfettiSprayer } from "../shell-ui/n1-vfx.js";

/**
 * Objectives catalog + DOM flush UI (Phase 21c).
 *
 * @param {object} dep
 */
export function wireNumber1ObjectivesLive(dep) {
    const objectives = NUMBER1_SHORT_TERM_OBJECTIVES.map(o => ({ ...o }));
    const longTermObjectives = createNumber1LongTermObjectives(dep.catalog);
    bindObjectiveAchievedToStore(objectives, longTermObjectives, dep.objectivesRt);

    const objectivesEl = document.getElementById("objectives");
    const sprayConfettiFrom = createConfettiSprayer({ defaultOriginEl: objectivesEl });

    function sprayShortTermConfetti() {
        sprayConfettiFrom(objectivesEl);
    }

    function updateObjectives() {
        const wasAchieved = objectives.map(o => o.achieved);
        objectives.forEach(obj => {
            if (dep.run.totalChanges >= obj.goal) obj.achieved = true;
        });
        const justCompleted = objectives.some((o, i) => !wasAchieved[i] && o.achieved);
        if (justCompleted) sprayShortTermConfetti();
        const lastCompleted = objectives.filter(o => o.achieved).pop();
        const nextUncompleted = objectives.find(o => !o.achieved);
        const shortTermToShow = [lastCompleted, nextUncompleted].filter(Boolean);
        dep.objectiveList.innerHTML = "";
        shortTermToShow.forEach(obj => {
            dep.objectiveList.appendChild(renderObjective(obj, dep.run.totalChanges, dep.formatCount));
        });
        longTermObjectives.forEach(obj => {
            if (isObjectiveComplete(obj, dep.run.totalChanges)) obj.achieved = true;
        });
        const longLastCompleted = longTermObjectives.filter(o => o.achieved).pop();
        const longNextUncompleted = longTermObjectives.find(o => !o.achieved);
        const longTermToShow = [longLastCompleted, longNextUncompleted].filter(Boolean);
        dep.longObjectiveList.innerHTML = "";
        longTermToShow.forEach(obj => {
            dep.longObjectiveList.appendChild(renderObjective(obj, dep.run.totalChanges, dep.formatCount));
        });
        updateMilestoneUI();
    }

    function updateMilestoneUI() {
        const {
            milestoneTextEl,
            milestoneProgressFillEl,
            milestoneTitleEl,
            milestoneEssenceLineEl
        } = dep;
        if (!milestoneTextEl || !milestoneProgressFillEl) return;
        const next = longTermObjectives.find(o => !o.achieved) || longTermObjectives[longTermObjectives.length - 1];
        if (!next) return;
        const progress = getObjectiveProgress(next, dep.run.totalChanges, dep.formatCount);
        const pct = next.achieved ? 100 : progress.pct;
        if (milestoneTitleEl) milestoneTitleEl.textContent = "Next milestone";
        milestoneTextEl.textContent = next.text + (progress.label ? " — " + progress.label : "") + " (" + pct.toFixed(2) + "%)";
        milestoneProgressFillEl.style.width = pct + "%";
        if (milestoneEssenceLineEl) {
            if (dep.ascension.number1AscensionEssence > 0 || dep.isNumber1AscensionReady()) {
                milestoneEssenceLineEl.style.display = "";
                const ascPct = Math.max(0, Math.min(100, (dep.run.totalChanges / dep.ascensionRequiredTotal) * 100));
                const requiredHands = dep.getNumber1AscensionRequiredHands();
                const handReqText = dep.run.unlockedHands >= requiredHands
                    ? "hands ready"
                    : ("hands: " + dep.run.unlockedHands + "/" + requiredHands);
                const readinessText = dep.isNumber1AscensionReady()
                    ? " — Ascension ready! Use the glowing Ascension button."
                    : (" — Ascension: " + dep.formatCount(dep.run.totalChanges) + " / " + dep.formatCount(dep.ascensionRequiredTotal) + " (" + ascPct.toFixed(2) + "%), " + handReqText);
                const pendingBonus = dep.getNumber1AscensionPendingBonusEssence();
                const pendingText = pendingBonus > 0 ? (" · Pending warp bonus: +" + dep.formatCount(pendingBonus)) : "";
                milestoneEssenceLineEl.textContent = "Ascension Essence (Number 1): " + dep.formatCount(dep.ascension.number1AscensionEssence) + pendingText + readinessText;
            } else {
                milestoneEssenceLineEl.textContent = "";
                milestoneEssenceLineEl.style.display = "none";
            }
        }
        dep.updateAscensionReadyChrome();
    }

    return {
        objectives,
        longTermObjectives,
        updateObjectives,
        updateMilestoneUI,
        sprayShortTermConfetti
    };
}
