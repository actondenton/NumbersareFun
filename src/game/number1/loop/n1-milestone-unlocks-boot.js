/**
 * Milestone gates keyed off total count (Phase 21c).
 * Run whenever `totalChanges` changes so gates cannot desync (load, offline, dev tools, …).
 *
 * @param {object} dep
 */
export function createSyncUnlocksWithTotalCount(dep) {
    return function syncUnlocksWithTotalCount() {
        dep.checkUnlockHands();
        dep.tryUnlockTurboIfEligible();
        if (dep.run.totalChanges >= 100) dep.autobuy.autoBuyUnlocked = true;
        if (dep.run.totalChanges >= 10 && dep.upgradeContainer) {
            dep.upgradeContainer.classList.add("show-upgrade-content");
        }
        if ((dep.run.handEarnings[0] || 0) >= 1000 && !dep.getCheapenSectionUnlocked()) {
            dep.setCheapenSectionUnlocked(true);
            dep.ensureSpeedRows();
            dep.updateCheapenUpgradeUI();
        }
        if (dep.isSlowdownUnlocked() && !dep.upgrades.slowdownUnlockLogged) {
            dep.upgrades.slowdownUnlockLogged = true;
            dep.addToLog("Compaction unlocked (all hands).", "milestone");
        }
        if (dep.isTimeWarpUnlocked() && !dep.timewarp.timeWarpUnlockLogged) {
            dep.timewarp.timeWarpUnlockLogged = true;
            dep.addToLog("Time Warp system unlocked (auras can now appear).", "milestone");
        }
    };
}
