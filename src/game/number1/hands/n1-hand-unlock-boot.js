import { HAND_BASE_SPEED, shouldUnlockNextHand } from "./n1-hands.js";

/**
 * Hand unlock milestones and first-hand bootstrap (Phase 21c).
 *
 * @param {object} dep
 */
export function wireNumber1HandUnlock(dep) {
    function unlockHand() {
        const { run, maxHands, handsRt, speedRowRefs, HandCounter } = dep;
        if (run.unlockedHands >= maxHands) return;
        run.unlockedHands++;
        run.handEarnings[run.unlockedHands - 1] = dep.getAscensionHandUnlockStartingCountFloor();
        dep.markMeaningfulProgress();
        dep.ensureSpeedRows();
        dep.addToLog("Hand " + run.unlockedHands + " unlocked", "milestone");
        const slot = speedRowRefs[run.unlockedHands - 1]?.handMountEl;
        handsRt.hands.push(new HandCounter(run.unlockedHands, HAND_BASE_SPEED, slot));
        dep.checkStoryBanners();
        dep.comboForward.updateEarnedBonusesUI();
        dep.updatePageButtonUnlocks();
        dep.updateSlowdownUpgradeUI();
        dep.updateTimeWarpAuraUI();
    }

    function checkUnlockHands() {
        const { run, maxHands } = dep;
        while (shouldUnlockNextHand(run.unlockedHands, run.unlockedHandsCap, run.totalChanges, maxHands)) {
            unlockHand();
        }
    }

    function initFirstHand() {
        dep.ensureSpeedRows();
        dep.handsRt.hands.push(new dep.HandCounter(1, HAND_BASE_SPEED, dep.speedRowRefs[0]?.handMountEl));
    }

    return { unlockHand, checkUnlockHands, initFirstHand };
}
