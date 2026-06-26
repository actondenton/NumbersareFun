/**
 * Furnace / BH hand sacrifice — shrinks unlocked hands and resets per-hand state.
 *
 * @deps {number} maxHands
 * @deps {object} run - n1-run-store slice
 * @deps {Array} hands - HandCounter instances (mutated)
 * @deps {function} setAutoBuyEnabledForHand
 * @deps {number[]} autoBuyCountdownSecondsByHand
 * @deps {boolean[]} timeWarpAuraActiveByHand
 * @deps {number[]} timeWarpAuraAppearedAtMsByHand
 * @deps {function} shrinkSpeedRowsTo
 * @deps {function} ensureSpeedRows
 * @deps {function} updateSpeedUpgradeUI
 * @deps {function} updateCheapenUpgradeUI
 * @deps {function} updateSlowdownUpgradeUI
 * @deps {function} updateComboUI
 * @deps {function} updateTurboBoostUI
 * FORBIDDEN: deps.runtime, entire boot-number1 closures
 *
 * @param {object} deps
 * @returns {(handNum: number) => boolean}
 */
export function createApplyHandSacrifice(deps) {
    return function applyHandSacrifice(handNum) {
        const target = Math.max(1, Math.min(deps.maxHands, handNum | 0));
        const { run, hands } = deps;
        if (run.unlockedHands < target) return false;
        run.unlockedHandsCap = Math.max(1, Math.min(run.unlockedHandsCap, target - 1));
        run.unlockedHands = Math.min(run.unlockedHands, run.unlockedHandsCap);
        while (hands.length > run.unlockedHands) {
            const h = hands.pop();
            if (h && h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
        for (let i = run.unlockedHands; i < deps.maxHands; i++) {
            run.handEarnings[i] = 0;
            deps.setAutoBuyEnabledForHand(i, false);
            deps.autoBuyCountdownSecondsByHand[i] = 0;
            deps.timeWarpAuraActiveByHand[i] = false;
            deps.timeWarpAuraAppearedAtMsByHand[i] = 0;
        }
        deps.shrinkSpeedRowsTo(run.unlockedHands);
        deps.ensureSpeedRows();
        deps.updateSpeedUpgradeUI();
        deps.updateCheapenUpgradeUI();
        deps.updateSlowdownUpgradeUI();
        deps.updateComboUI();
        deps.updateTurboBoostUI({ force: true });
        return true;
    };
}
