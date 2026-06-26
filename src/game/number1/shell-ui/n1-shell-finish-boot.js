import { readSaveData } from "../../n1-save.js";

/**
 * Post-loop shell init: upgrade listeners, settings, save load, n2 bind (Phase 21c).
 *
 * @param {object} dep
 */
export function finishNumber1ShellBoot(dep) {
    const {
        upgradeDom,
        onWindowScrollResizeForUpgrades,
        addToLog,
        buySpeedUpgradeForHand,
        buyCheapenUpgradeForHand,
        buySlowdownUpgradeForHand,
        activateTimeWarpAuraForHand,
        ensureTimeWarpArrays,
        isTimeWarpUnlocked,
        timewarp,
        playTimeWarpScreenEffect,
        initTopCountRowFitObservers,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateTimeWarpAuraUI,
        updateRateDisplay,
        updateMilestoneUI,
        comboForward,
        updatePageButtonUnlocks,
        updateNumber2SidebarUnlockUI,
        initInlineRightPanels,
        initNumber1StageAccretionDiskBg,
        loadSettings,
        applyTheme,
        applySettingsToUI,
        storage,
        applyLoadedState,
        applyOfflineProgress,
        syncPlayStageForNumberMode,
        number2
    } = dep;

    upgradeDom.attachUpgradeInteractionListeners({
        onWindowScrollResizeForUpgrades,
        addToLog,
        buySpeedUpgradeForHand,
        buyCheapenUpgradeForHand,
        buySlowdownUpgradeForHand,
        activateTimeWarpAuraForHand,
        ensureTimeWarpArrays,
        isTimeWarpUnlocked,
        timeWarpAuraActiveByHand: timewarp.timeWarpAuraActiveByHand,
        playTimeWarpScreenEffect
    });
    initTopCountRowFitObservers();
    updateSpeedUpgradeUI();
    updateCheapenUpgradeUI();
    updateSlowdownUpgradeUI();
    updateTimeWarpAuraUI();
    updateRateDisplay();
    updateMilestoneUI();
    comboForward.updateComboUI();
    comboForward.updateEarnedBonusesUI();
    updatePageButtonUnlocks();
    updateNumber2SidebarUnlockUI();
    initInlineRightPanels();
    initNumber1StageAccretionDiskBg();
    loadSettings();
    applyTheme();
    applySettingsToUI();
    const savedGameData = readSaveData(storage);
    if (savedGameData) {
        applyLoadedState(savedGameData);
        const savedAt = Number(savedGameData.savedAt) || Date.now();
        applyOfflineProgress(Date.now() - savedAt, { showSummary: true });
    }
    syncPlayStageForNumberMode(typeof window.getCurrentNumberMode === "function" ? window.getCurrentNumberMode() : 1);
    try {
        number2.bindUI();
    } catch (err) {
        if (typeof console !== "undefined" && console.error) console.error("Number 2 UI bind failed:", err);
    }
}
