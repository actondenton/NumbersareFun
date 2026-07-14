import { describe, expect, it, vi } from "vitest";

import { wireNumber1GameLoop } from "./n1-game-loop-boot.js";

describe("wireNumber1GameLoop", () => {
    it("returns loop runtime and tick-apply forward hooks", () => {
        let flushRef = () => {};
        const wire = wireNumber1GameLoop({
            clap: {
                getUnlockedHands: () => 1,
                getHands: () => [],
                computeAscensionGrantTotals: () => ({}),
                getCheapenBonusLevel: () => [0],
                getSlowdownBonusLevel: () => [0],
                getSpeedLevel: () => [0],
                getSpeedBonusLevel: () => [0],
                getClapCooldownUntilMsByHand: () => [0],
                getClapDigitPrevious: () => [-1],
                gameplaySimFrozen: () => true,
                addToLog: vi.fn(),
                markMeaningfulProgress: vi.fn(),
                updateSpeedUpgradeUI: vi.fn(),
                updateCheapenUpgradeUI: vi.fn(),
                updateSlowdownUpgradeUI: vi.fn(),
                updateRateDisplay: vi.fn(),
                updateMilestoneUI: vi.fn(),
                refreshOverviewAndAscensionHubLiveIfOpen: vi.fn(),
                snapshotHandLedgerBonusDisplays: vi.fn(),
                ledgerBeamAfterClapBonuses: vi.fn(),
                settings: {},
                isPagePanelOpen: () => false,
                pagePanelEl: null,
                getNumber1AscensionClapEssenceMultiplier: () => 1,
                applyClapEssenceMultiplierProc: vi.fn()
            },
            turboStep: {
                getTotalChanges: () => 1,
                getTurboBoostUnlocked: () => false,
                getTurboBoostEnabled: () => false,
                getTurboBoostMeter: () => 0,
                incrementTurboActivationCount: vi.fn(),
                updateTurboBurn: vi.fn(),
                applyTurboPassiveMeterRegen: vi.fn(),
                isTurboScensionUpgradeAutobuyUnlocked: () => false,
                gameplaySimFrozen: () => true,
                tryTurboScensionActivationUpgrade: vi.fn(),
                autosaveNow: vi.fn(),
                updateTurboBoostUI: vi.fn(),
                updateRateDisplay: vi.fn()
            },
            tickApply: {
                getUnlockedHands: () => 1,
                getHandEarnings: () => [1],
                refreshTotalFromHandEarnings: vi.fn(),
                getIncrementalCountEl: () => null,
                formatCount: n => String(n),
                getTotalChanges: () => 1,
                updateObjectives: vi.fn(),
                maybeShowFirstAscensionIntroOnUnlock: vi.fn()
            },
            loopStep: {
                tickBackgroundNumberModules: vi.fn(),
                updateBlackHolePhaseStep: vi.fn(),
                syncBlackHolePhase1Vfx: vi.fn(),
                getCurrentNumberMode: () => 1,
                shouldRunNumber2Foreground: () => false,
                runNumber2GameLoopStep: vi.fn(),
                processComboDiscoveryMilestoneIfUnlocked: vi.fn(),
                getBlackHolePhase: () => 0,
                runBlackHolePhase7Step: vi.fn(),
                updateTimeWarpSystem: vi.fn(),
                getUnlockedHands: () => 1,
                getHands: () => [],
                getTickIntervalMs: () => 100,
                getHandSpeedSyncBucketKey: () => "0",
                getEffectiveSpeedLevel: () => 0,
                getSpeedMultiplierBigForLevel: () => 1,
                updateComboStep: vi.fn(),
                getComboMultiplier: () => 1,
                getTurboCountMultiplier: () => 1,
                getNumber1BlackHoleProductionMult: () => 1,
                getSlowdownMultiplier: () => 1,
                runAutobuyStep: vi.fn(),
                flushLoopUi: vi.fn()
            },
            loopRuntime: {
                isGameplayFrozen: () => false,
                isDocumentHidden: () => false,
                shouldRunHiddenFixedStep: () => false,
                applyOfflineProgress: vi.fn()
            },
            onTickApplyWired: step => {
                flushRef = step.flushAutobuyDeferredTotalsIfAny;
            }
        });

        expect(wire.number1LoopRuntime).toBeTruthy();
        expect(typeof wire.runGameLoopStep).toBe("function");
        expect(typeof flushRef).toBe("function");
        expect(typeof wire.attachVisibilityOfflineTracking).toBe("function");
    });
});
