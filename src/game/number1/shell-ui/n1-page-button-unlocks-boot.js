/**
 * Page nav button visibility (combinations gate + ascension chrome) — Phase 21c.
 *
 * @param {object} dep
 */
export function createPageButtonUnlocksBoot(dep) {
    function updatePageButtonUnlocks() {
        const combinationsPageBtn = dep.combinationsPageBtn;
        if (combinationsPageBtn) {
            const unlocked = dep.getUnlockedHands() >= 2;
            combinationsPageBtn.style.display = unlocked ? "" : "none";
        }
        dep.updateAscensionReadyChrome();
    }

    return { updatePageButtonUnlocks };
}
