import { describe, expect, it, vi } from "vitest";

import { buildNumber1GameLoopWireDep } from "./n1-game-loop-wire-deps.js";
import { wireNumber1GameLoop } from "./n1-game-loop-boot.js";

describe("buildNumber1GameLoopWireDep", () => {
    it("assembles wireLoop dep and flushLoopUi throttles upgrade DOM", () => {
        const updateSpeedUpgradeUI = vi.fn();
        let batched = false;
        const base = {
            onTickApplyWired: () => {},
            getUnlockedHands: () => 1,
            getHands: () => [],
            computeAscensionGrantTotals: () => ({}),
            getCheapenBonusLevel: () => [0],
            getSlowdownBonusLevel: () => [0],
            getSpeedLevel: () => [0],
            getSpeedBonusLevel: () => [0],
            getClapCooldownUntilMsByHand: () => [0],
            getClapDigitPrevious: () => [-1],
            gameplaySimFrozen: () => false,
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            updateSpeedUpgradeUI,
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateRateDisplay: () => {},
            updateMilestoneUI: () => {},
            refreshOverviewAndAscensionHubLiveIfOpen: () => {},
            snapshotHandLedgerBonusDisplays: () => ({}),
            ledgerBeamAfterClapBonuses: () => {},
            settings: {},
            isPagePanelOpen: () => false,
            isSettingsPanelOpen: () => false,
            pagePanelEl: null,
            getNumber1AscensionClapEssenceMultiplier: () => 1,
            applyClapEssenceMultiplierProc: () => {},
            getTotalChanges: () => 1,
            getTurboBoostUnlocked: () => false,
            getTurboBoostEnabled: () => false,
            getTurboBoostMeter: () => 0,
            incrementTurboActivationCount: () => {},
            updateTurboBurn: () => {},
            applyTurboPassiveMeterRegen: () => {},
            isTurboScensionUpgradeAutobuyUnlocked: () => false,
            tryTurboScensionActivationUpgrade: () => {},
            autosaveNow: () => {},
            updateTurboBoostUI: () => {},
            getHandEarnings: () => [1],
            refreshTotalFromHandEarnings: () => {},
            getIncrementalCountEl: () => null,
            formatCount: (n: number) => String(n),
            updateObjectives: () => {},
            maybeShowFirstAscensionIntroOnUnlock: () => {},
            tickBackgroundNumberModules: () => {},
            updateBlackHolePhaseStep: () => {},
            syncBlackHolePhase1Vfx: () => {},
            getCurrentNumberMode: () => 1,
            shouldRunNumber2Foreground: () => false,
            runNumber2GameLoopStep: () => {},
            processComboDiscoveryMilestoneIfUnlocked: () => {},
            getBlackHolePhase: () => 0,
            runBlackHolePhase7Step: () => {},
            updateTimeWarpSystem: () => {},
            getTickIntervalMs: () => 100,
            getHandSpeedSyncBucketKey: () => "0",
            getEffectiveSpeedLevel: () => 0,
            getSpeedMultiplierBigForLevel: () => 1n,
            updateComboStep: () => {},
            getComboMultiplier: () => 1,
            getTurboCountMultiplier: () => 1,
            getNumber1BlackHoleProductionMult: () => 1,
            getSlowdownMultiplier: () => 1,
            runAutobuyStep: () => {},
            getBatchedUpgradeUiFlush: () => batched,
            setBatchedUpgradeUiFlush: (v: boolean) => { batched = v; },
            updateTimeWarpAuraUI: () => {},
            isGameplayFrozen: () => false,
            isDocumentHidden: () => false,
            shouldRunHiddenFixedStep: () => false,
            applyOfflineProgress: () => {}
        };
        const wireDep = buildNumber1GameLoopWireDep(base);
        expect(wireDep.clap.updateSpeedUpgradeUI).toBe(updateSpeedUpgradeUI);
        batched = true;
        wireDep.loopStep.flushLoopUi(0, false);
        expect(updateSpeedUpgradeUI).toHaveBeenCalled();
        expect(wireNumber1GameLoop(wireDep).number1LoopRuntime).toBeTruthy();
    });

    it("defers flushLoopUi while Number 2 is focused, then flushes on return", () => {
        const updateSpeedUpgradeUI = vi.fn();
        let mode = 2;
        const base = {
            updateSpeedUpgradeUI,
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateTimeWarpAuraUI: () => {},
            updateRateDisplay: () => {},
            getBatchedUpgradeUiFlush: () => false,
            setBatchedUpgradeUiFlush: () => {},
            getCurrentNumberMode: () => mode,
            isPagePanelOpen: () => false,
            isSettingsPanelOpen: () => false,
            // Minimal stubs for build
            onTickApplyWired: () => {},
            getUnlockedHands: () => 1,
            getHands: () => [],
            computeAscensionGrantTotals: () => ({}),
            getCheapenBonusLevel: () => [0],
            getSlowdownBonusLevel: () => [0],
            getSpeedLevel: () => [0],
            getSpeedBonusLevel: () => [0],
            getClapCooldownUntilMsByHand: () => [0],
            getClapDigitPrevious: () => [-1],
            gameplaySimFrozen: () => false,
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            updateMilestoneUI: () => {},
            refreshOverviewAndAscensionHubLiveIfOpen: () => {},
            snapshotHandLedgerBonusDisplays: () => ({}),
            ledgerBeamAfterClapBonuses: () => {},
            settings: {},
            pagePanelEl: null,
            getNumber1AscensionClapEssenceMultiplier: () => 1,
            applyClapEssenceMultiplierProc: () => {},
            getTotalChanges: () => 1,
            getTurboBoostUnlocked: () => false,
            getTurboBoostEnabled: () => false,
            getTurboBoostMeter: () => 0,
            incrementTurboActivationCount: () => {},
            updateTurboBurn: () => {},
            applyTurboPassiveMeterRegen: () => {},
            isTurboScensionUpgradeAutobuyUnlocked: () => false,
            tryTurboScensionActivationUpgrade: () => {},
            autosaveNow: () => {},
            updateTurboBoostUI: () => {},
            getHandEarnings: () => [1],
            refreshTotalFromHandEarnings: () => {},
            getIncrementalCountEl: () => null,
            formatCount: (n: number) => String(n),
            updateObjectives: () => {},
            maybeShowFirstAscensionIntroOnUnlock: () => {},
            tickBackgroundNumberModules: () => {},
            updateBlackHolePhaseStep: () => {},
            syncBlackHolePhase1Vfx: () => {},
            shouldRunNumber2Foreground: () => false,
            runNumber2GameLoopStep: () => {},
            processComboDiscoveryMilestoneIfUnlocked: () => {},
            getBlackHolePhase: () => 0,
            runBlackHolePhase7Step: () => {},
            updateTimeWarpSystem: () => {},
            getTickIntervalMs: () => 100,
            getHandSpeedSyncBucketKey: () => "0",
            getEffectiveSpeedLevel: () => 0,
            getSpeedMultiplierBigForLevel: () => 1n,
            updateComboStep: () => {},
            getComboMultiplier: () => 1,
            getTurboCountMultiplier: () => 1,
            getNumber1BlackHoleProductionMult: () => 1,
            getSlowdownMultiplier: () => 1,
            runAutobuyStep: () => {},
            isGameplayFrozen: () => false,
            isDocumentHidden: () => false,
            shouldRunHiddenFixedStep: () => false,
            applyOfflineProgress: () => {}
        };
        const wireDep = buildNumber1GameLoopWireDep(base);
        wireDep.loopStep.flushLoopUi(5, false);
        expect(updateSpeedUpgradeUI).not.toHaveBeenCalled();
        mode = 1;
        wireDep.loopStep.flushLoopUi(5, false);
        expect(updateSpeedUpgradeUI).toHaveBeenCalledTimes(1);
    });
});
