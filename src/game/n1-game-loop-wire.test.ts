import { describe, expect, it, vi } from "vitest";
import { createNumber1GameLoopAssembly } from "./n1-game-loop-wire.js";

describe("n1-game-loop-wire", () => {
    it("returns runGameLoopStep and deps objects", () => {
        const flushStub = vi.fn();
        const out = createNumber1GameLoopAssembly({
            legacyLoopFlush: {
                getBatchedUpgradeUiFlush: () => false,
                setBatchedUpgradeUiFlush: () => {},
                updateSpeedUpgradeUI: () => {},
                updateCheapenUpgradeUI: () => {},
                updateSlowdownUpgradeUI: () => {},
                updateTimeWarpAuraUI: () => {},
                updateRateDisplay: () => {}
            },
            gameLoopStep: {
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
                maybeAlignSameSpeedHandPhasesFromWallClock: () => {},
                getUnlockedHands: () => 1,
                getHands: () => [],
                getTickIntervalMs: () => 1000,
                getHandSpeedSyncBucketKey: () => "",
                getEffectiveSpeedLevel: () => 0,
                getSpeedMultiplierBigForLevel: () => 1n,
                processClappingThisTick: () => {},
                updateTurboStep: () => {},
                updateComboStep: () => {},
                getComboMultiplier: () => 1,
                getTurboCountMultiplier: () => 1,
                getNumber1BlackHoleProductionMult: () => 1,
                getSlowdownMultiplier: () => 1,
                applyTickGains: () => {},
                runAutobuyStep: () => {},
                flushAutobuyDeferredTotalsIfAny: () => {},
                flushLoopUi: flushStub
            }
        });
        expect(out.UI_UPDATE_THROTTLE_MS).toBe(150);
        expect(typeof out.runGameLoopStep).toBe("function");
        expect(out.number1GameLoopStepDeps).toBeTruthy();
        expect(out.flushLoopUiThrottled).toBeTruthy();
    });
});
