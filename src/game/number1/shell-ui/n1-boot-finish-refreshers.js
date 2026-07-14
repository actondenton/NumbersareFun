/**
 * Post-init UI refresh batch for Number 1 boot finish.
 *
 * @param {object} dep
 * @returns {Array<() => void>}
 */
export function buildNumber1BootFinishRefreshers(dep) {
    return [
        dep.updateObjectives,
        dep.updateMilestoneUI,
        () => dep.updateTurboBoostUI({ force: true }),
        dep.updateRateDisplay,
        dep.updateSlowdownUpgradeUI,
        dep.updateTimeWarpAuraUI,
        dep.updateEarnedBonusesUI,
        dep.updatePageButtonUnlocks,
        dep.updateNumber2SidebarUnlockUI,
        dep.maybeShowFirstAscensionIntroOnUnlock,
        dep.syncPhase1MassFillCssVars
        // Phase 1 tesseract canvases mount only while mass VFX is live (syncBlackHolePhase1Vfx / panel open).
    ];
}
