import { accumulateNumber1DetachedCps } from "./n1-detached-cps-progress.js";

/**
 * Detached CPS integration while Number 2 is focused or during offline windows (Phase 21c).
 *
 * @param {object} dep
 */
export function createNumber1DetachedCpsBoot(dep) {
    function applyNumber1DetachedCpsProgress(dtSec) {
        return accumulateNumber1DetachedCps(dtSec, {
            getBlackHolePhase: dep.getBlackHolePhase,
            getUnlockedHands: dep.getUnlockedHands,
            getRawCpsPerHand: dep.getRawCpsPerHand,
            getComboMultiplier: dep.getComboMultiplier,
            getTurboMultiplier: dep.getTurboMultiplier,
            getBlackHoleOfflineProductionMult: dep.getBlackHoleOfflineProductionMult,
            mergeHandEarningsFromDetachedSlice(gainsByHand) {
                dep.mergeHandEarningsFromDetachedSlice(gainsByHand);
            },
            refreshTotalsFromHands: dep.refreshTotalsFromHands
        });
    }

    function tickNumber1BackgroundCps(dtSec) {
        applyNumber1DetachedCpsProgress(dtSec);
        if (dep.incrementalEl) {
            dep.incrementalEl.textContent = dep.formatCount(dep.getTotalChanges());
        }
    }

    return { applyNumber1DetachedCpsProgress, tickNumber1BackgroundCps };
}
