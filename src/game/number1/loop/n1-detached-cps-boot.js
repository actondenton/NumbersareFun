import { accumulateNumber1DetachedCps } from "./n1-detached-cps-progress.js";

/**
 * Detached CPS integration while Number 2 is focused or during offline windows (Phase 21c).
 * Reads run / rate / turbo from shared game context `g`; other deps stay in `extras`.
 *
 * @param {ReturnType<typeof import("../n1-game-context.js").createN1GameContext>} g
 * @param {object} extras
 */
export function createNumber1DetachedCpsBoot(g, extras) {
    const run = g.run;

    function applyNumber1DetachedCpsProgress(dtSec) {
        return accumulateNumber1DetachedCps(dtSec, {
            getBlackHolePhase: extras.getBlackHolePhase,
            getUnlockedHands: () => run.unlockedHands,
            getRawCpsPerHand: () => g.getRawCpsPerHand(),
            getComboMultiplier: extras.getComboMultiplier,
            getTurboMultiplier: () => g.getTurboCountMultiplier(),
            getBlackHoleOfflineProductionMult: extras.getBlackHoleOfflineProductionMult,
            mergeHandEarningsFromDetachedSlice(gainsByHand) {
                for (let i = 0; i < run.unlockedHands; i++) {
                    run.handEarnings[i] = (run.handEarnings[i] || 0) + (gainsByHand[i] || 0);
                }
            },
            refreshTotalsFromHands: extras.refreshTotalsFromHands
        });
    }

    function tickNumber1BackgroundCps(dtSec) {
        applyNumber1DetachedCpsProgress(dtSec);
        const mode =
            typeof extras.getCurrentNumberMode === "function" ? extras.getCurrentNumberMode() : 1;
        // Count label lives on the Number 1 stage; skip DOM while focused elsewhere (mode switch refreshes).
        if (mode === 1 && extras.incrementalEl) {
            extras.incrementalEl.textContent = extras.formatCount(run.totalChanges);
        }
    }

    function refreshNumber1CountDisplay() {
        if (extras.incrementalEl) {
            extras.incrementalEl.textContent = extras.formatCount(run.totalChanges);
        }
    }

    return { applyNumber1DetachedCpsProgress, tickNumber1BackgroundCps, refreshNumber1CountDisplay };
}
