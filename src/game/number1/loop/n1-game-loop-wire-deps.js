const UI_UPDATE_THROTTLE_MS = 150;

/**
 * Assembles the structured dep object for {@link wireNumber1GameLoop}.
 *
 * @param {object} dep
 */
export function buildNumber1GameLoopWireDep(dep) {
    let lastUIUpdateMs = 0;

    return {
        onTickApplyWired: step => {
            dep.onTickApplyWired?.(step);
        },
        clap: {
            getUnlockedHands: dep.getUnlockedHands,
            getHands: dep.getHands,
            computeAscensionGrantTotals: dep.computeAscensionGrantTotals,
            cheapenBonusLevel: dep.cheapenBonusLevel,
            slowdownBonusLevel: dep.slowdownBonusLevel,
            speedLevel: dep.speedLevel,
            speedBonusLevel: dep.speedBonusLevel,
            clapCooldownUntilMsByHand: dep.clapCooldownUntilMsByHand,
            clapDigitPrevious: dep.clapDigitPrevious,
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
                if (backgroundTab || (totalTicks <= 0 && !dep.getBatchedUpgradeUiFlush())) return;
                const now = Date.now();
                if (now - lastUIUpdateMs >= UI_UPDATE_THROTTLE_MS || dep.getBatchedUpgradeUiFlush()) {
                    if (now - lastUIUpdateMs >= UI_UPDATE_THROTTLE_MS) lastUIUpdateMs = now;
                    if (dep.getBatchedUpgradeUiFlush()) dep.setBatchedUpgradeUiFlush(false);
                    dep.updateSpeedUpgradeUI();
                    dep.updateCheapenUpgradeUI();
                    dep.updateSlowdownUpgradeUI();
                    dep.updateTimeWarpAuraUI();
                    dep.updateRateDisplay({ throttleCpsHeadline: true });
                }
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
