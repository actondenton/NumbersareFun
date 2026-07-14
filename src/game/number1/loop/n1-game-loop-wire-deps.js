const UI_UPDATE_THROTTLE_MS = 150;

/**
 * Assembles the structured dep object for {@link wireNumber1GameLoop}.
 *
 * @param {object} dep
 */
export function buildNumber1GameLoopWireDep(dep) {
    let lastUIUpdateMs = 0;
    /** True when play-column upgrade DOM was skipped (other Number / panel); flush once on return. */
    let loopUiNeedsFlushOnReturn = false;

    return {
        onTickApplyWired: step => {
            dep.onTickApplyWired?.(step);
        },
        clap: {
            getUnlockedHands: dep.getUnlockedHands,
            getHands: dep.getHands,
            computeAscensionGrantTotals: dep.computeAscensionGrantTotals,
            getCheapenBonusLevel: dep.getCheapenBonusLevel,
            getSlowdownBonusLevel: dep.getSlowdownBonusLevel,
            getSpeedLevel: dep.getSpeedLevel,
            getSpeedBonusLevel: dep.getSpeedBonusLevel,
            getClapCooldownUntilMsByHand: dep.getClapCooldownUntilMsByHand,
            getClapDigitPrevious: dep.getClapDigitPrevious,
            gameplaySimFrozen: dep.gameplaySimFrozen,
            addToLog: dep.addToLog,
            markMeaningfulProgress: dep.markMeaningfulProgress,
            updateSpeedUpgradeUI: dep.updateSpeedUpgradeUI,
            updateCheapenUpgradeUI: dep.updateCheapenUpgradeUI,
            updateSlowdownUpgradeUI: dep.updateSlowdownUpgradeUI,
            updateRateDisplay: dep.updateRateDisplay,
            updateMilestoneUI: dep.updateMilestoneUI,
            refreshOverviewAndAscensionHubLiveIfOpen: dep.refreshOverviewAndAscensionHubLiveIfOpen,
            snapshotHandLedgerBonusDisplays: dep.snapshotHandLedgerBonusDisplays,
            ledgerBeamAfterClapBonuses: dep.ledgerBeamAfterClapBonuses,
            settings: dep.settings,
            isPagePanelOpen: dep.isPagePanelOpen,
            pagePanelEl: dep.pagePanelEl,
            getNumber1AscensionClapEssenceMultiplier: dep.getNumber1AscensionClapEssenceMultiplier,
            applyClapEssenceMultiplierProc: dep.applyClapEssenceMultiplierProc
        },
        turboStep: {
            getTotalChanges: dep.getTotalChanges,
            getTurboBoostUnlocked: dep.getTurboBoostUnlocked,
            getTurboBoostEnabled: dep.getTurboBoostEnabled,
            getTurboBoostMeter: dep.getTurboBoostMeter,
            incrementTurboActivationCount: dep.incrementTurboActivationCount,
            updateTurboBurn: dep.updateTurboBurn,
            applyTurboPassiveMeterRegen: dep.applyTurboPassiveMeterRegen,
            isTurboScensionUpgradeAutobuyUnlocked: dep.isTurboScensionUpgradeAutobuyUnlocked,
            gameplaySimFrozen: dep.gameplaySimFrozen,
            tryTurboScensionActivationUpgrade: dep.tryTurboScensionActivationUpgrade,
            autosaveNow: dep.autosaveNow,
            updateTurboBoostUI: dep.updateTurboBoostUI,
            updateRateDisplay: dep.updateRateDisplay
        },
        tickApply: {
            getUnlockedHands: dep.getUnlockedHands,
            getHandEarnings: dep.getHandEarnings,
            refreshTotalFromHandEarnings: dep.refreshTotalFromHandEarnings,
            getIncrementalCountEl: dep.getIncrementalCountEl,
            formatCount: dep.formatCount,
            getTotalChanges: dep.getTotalChanges,
            updateObjectives: dep.updateObjectives,
            maybeShowFirstAscensionIntroOnUnlock: dep.maybeShowFirstAscensionIntroOnUnlock
        },
        loopStep: {
            tickBackgroundNumberModules: dep.tickBackgroundNumberModules,
            updateBlackHolePhaseStep: dep.updateBlackHolePhaseStep,
            syncBlackHolePhase1Vfx: dep.syncBlackHolePhase1Vfx,
            getCurrentNumberMode: dep.getCurrentNumberMode,
            shouldRunNumber2Foreground: dep.shouldRunNumber2Foreground,
            runNumber2GameLoopStep: dep.runNumber2GameLoopStep,
            processComboDiscoveryMilestoneIfUnlocked: dep.processComboDiscoveryMilestoneIfUnlocked,
            getBlackHolePhase: dep.getBlackHolePhase,
            runBlackHolePhase7Step: dep.runBlackHolePhase7Step,
            updateTimeWarpSystem: dep.updateTimeWarpSystem,
            getUnlockedHands: dep.getUnlockedHands,
            getHands: dep.getHands,
            getTickIntervalMs: dep.getTickIntervalMs,
            getHandSpeedSyncBucketKey: dep.getHandSpeedSyncBucketKey,
            getEffectiveSpeedLevel: dep.getEffectiveSpeedLevel,
            getSpeedMultiplierBigForLevel: dep.getSpeedMultiplierBigForLevel,
            updateComboStep: dep.updateComboStep,
            getComboMultiplier: dep.getComboMultiplier,
            getTurboCountMultiplier: dep.getTurboCountMultiplier,
            getNumber1BlackHoleProductionMult: dep.getNumber1BlackHoleProductionMult,
            getSlowdownMultiplier: dep.getSlowdownMultiplier,
            runAutobuyStep: dep.runAutobuyStep,
            flushLoopUi: (totalTicks, backgroundTab) => {
                if (backgroundTab || (totalTicks <= 0 && !dep.getBatchedUpgradeUiFlush() && !loopUiNeedsFlushOnReturn)) {
                    return;
                }
                const mode = typeof dep.getCurrentNumberMode === "function" ? dep.getCurrentNumberMode() : 1;
                const pageOpen = typeof dep.isPagePanelOpen === "function" && dep.isPagePanelOpen();
                const settingsOpen = typeof dep.isSettingsPanelOpen === "function" && dep.isSettingsPanelOpen();
                // Upgrade column is hidden while any page/settings panel is open, or on Number 2.
                if (mode !== 1 || pageOpen || settingsOpen) {
                    loopUiNeedsFlushOnReturn = true;
                    return;
                }
                const now = Date.now();
                // Panel-return forces a paint; batched hold/autobuy respects the throttle so a
                // 10Hz hold-repeat does not rebuild upgrade columns every game-loop tick.
                const forceReturn = loopUiNeedsFlushOnReturn;
                if (!forceReturn && now - lastUIUpdateMs < UI_UPDATE_THROTTLE_MS) return;
                lastUIUpdateMs = now;
                loopUiNeedsFlushOnReturn = false;
                if (dep.getBatchedUpgradeUiFlush()) dep.setBatchedUpgradeUiFlush(false);
                if (typeof dep.refreshUpgradeColumnsUi === "function") {
                    dep.refreshUpgradeColumnsUi();
                } else {
                    dep.updateSpeedUpgradeUI();
                    dep.updateCheapenUpgradeUI();
                    dep.updateSlowdownUpgradeUI();
                }
                dep.updateTimeWarpAuraUI();
                dep.updateRateDisplay({ throttleCpsHeadline: true });
            }
        },
        loopRuntime: {
            isGameplayFrozen: dep.isGameplayFrozen,
            isDocumentHidden: dep.isDocumentHidden,
            shouldRunHiddenFixedStep: dep.shouldRunHiddenFixedStep,
            applyOfflineProgress: dep.applyOfflineProgress,
            patchOverviewIfNeeded: dep.patchOverviewIfNeeded
        }
    };
}
