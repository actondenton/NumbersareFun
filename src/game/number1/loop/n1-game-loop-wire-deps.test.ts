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
            cheapenBonusLevel: [0],
            slowdownBonusLevel: [0],
            speedLevel: [0],
            speedBonusLevel: [0],
            clapCooldownUntilMsByHand: [0],
            clapDigitPrevious: [-1],
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
});
