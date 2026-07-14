import { describe, expect, it } from "vitest";
import {
    GAME_LOOP_HIDDEN_MAX_CATCHUP_STEPS,
    GAME_LOOP_MAX_CATCHUP_STEPS,
    GAME_LOOP_MAX_ELAPSED_MS,
    GAME_LOOP_MS,
    alignSameSpeedHandPhases,
    advanceSyncedHandTickBuckets,
    calculateDetachedCpsProgress,
    calculateTickEarningsByHand,
    clampGameLoopElapsedMs,
    createNumber1LoopRuntime,
    getGameLoopCatchupStepCap,
    runNumber1GameLoopStep
} from "./n1-game-loop.js";

describe("Number 1 game loop helpers", () => {
    it("exports fixed-step loop constants", () => {
        expect(GAME_LOOP_MS).toBe(50);
        expect(GAME_LOOP_MAX_ELAPSED_MS).toBe(60000);
        expect(GAME_LOOP_MAX_CATCHUP_STEPS).toBe(240);
        expect(GAME_LOOP_HIDDEN_MAX_CATCHUP_STEPS).toBe(12);
    });

    it("clamps elapsed wall-clock time", () => {
        expect(clampGameLoopElapsedMs(-1)).toBe(GAME_LOOP_MS);
        expect(clampGameLoopElapsedMs(Number.NaN)).toBe(GAME_LOOP_MS);
        expect(clampGameLoopElapsedMs(123)).toBe(123);
        expect(clampGameLoopElapsedMs(999999)).toBe(GAME_LOOP_MAX_ELAPSED_MS);
    });

    it("selects foreground vs hidden catch-up caps", () => {
        expect(getGameLoopCatchupStepCap(false)).toBe(GAME_LOOP_MAX_CATCHUP_STEPS);
        expect(getGameLoopCatchupStepCap(true)).toBe(GAME_LOOP_HIDDEN_MAX_CATCHUP_STEPS);
    });

    it("advances hands in synchronized speed buckets", () => {
        const hands = [
            { id: 1, count: 1, tickAccBig: 0n, baseSpeed: 1, renderCount: 0, render() { this.renderCount++; } },
            { id: 2, count: 1, tickAccBig: 0n, baseSpeed: 1, renderCount: 0, render() { this.renderCount++; } },
            { id: 3, count: 9, tickAccBig: 900n, baseSpeed: 1, renderCount: 0, render() { this.renderCount++; } }
        ];

        const ticks = advanceSyncedHandTickBuckets({
            hands,
            unlockedHands: 3,
            dtMs: 50,
            handBaseSpeed: 1,
            tickCap: 999,
            getTickIntervalMs: () => 50,
            getHandSpeedSyncBucketKey: handIndex => handIndex < 2 ? "fast" : "slow",
            getEffectiveSpeedLevel: handIndex => handIndex < 2 ? 5 : 1,
            getSpeedMultiplierBigForLevel: level => BigInt(level === 5 ? 20 : 2)
        });

        expect(ticks).toEqual([1, 1, 1]);
        expect(hands[0].count).toBe(2);
        expect(hands[1].count).toBe(2);
        expect(hands[0].tickAccBig).toBe(0n);
        expect(hands[1].tickAccBig).toBe(0n);
        expect(hands[2].count).toBe(10);
        expect(hands[2].tickAccBig).toBe(0n);
        expect(hands[0].renderCount).toBe(1);
        expect(hands[1].renderCount).toBe(1);
        expect(hands[2].renderCount).toBe(1);
    });

    it("realigns hands in the same speed bucket to the lowest-id leader", () => {
        const hands = [
            { id: 1, count: 4, tickAccBig: 125n, baseSpeed: 1000, renderCount: 0, render() { this.renderCount++; } },
            { id: 2, count: 7, tickAccBig: 900n, baseSpeed: 1000, renderCount: 0, render() { this.renderCount++; } },
            { id: 3, count: 2, tickAccBig: 50n, baseSpeed: 1000, renderCount: 0, render() { this.renderCount++; } }
        ];

        const aligned = alignSameSpeedHandPhases({
            hands,
            unlockedHands: 3,
            handBaseSpeed: 1000,
            getTickIntervalMs: () => 100,
            getHandSpeedSyncBucketKey: handIndex => handIndex < 2 ? "paired" : "solo"
        });

        expect(aligned).toBe(1);
        expect(hands[1].count).toBe(4);
        expect(hands[1].tickAccBig).toBe(125n);
        expect(hands[1].renderCount).toBe(1);
        expect(hands[2].count).toBe(2);
        expect(hands[2].tickAccBig).toBe(50n);
        expect(hands[2].renderCount).toBe(0);
    });

    it("can align carries without repainting digits", () => {
        const hands = [
            { id: 1, count: 5, tickAccBig: 25n, baseSpeed: 1000, renderCount: 0, render() { this.renderCount++; } },
            { id: 2, count: 9, tickAccBig: 80n, baseSpeed: 1000, renderCount: 0, render() { this.renderCount++; } }
        ];

        const aligned = alignSameSpeedHandPhases({
            hands,
            unlockedHands: 2,
            handBaseSpeed: 1000,
            renderDigits: false,
            getTickIntervalMs: () => 100,
            getHandSpeedSyncBucketKey: () => "paired"
        });

        expect(aligned).toBe(1);
        expect(hands[1].count).toBe(5);
        expect(hands[1].tickAccBig).toBe(25n);
        expect(hands[1].renderCount).toBe(0);
    });

    it("distributes tick earnings by effective hand weight", () => {
        const gains = calculateTickEarningsByHand({
            ticksPerHand: [10, 10],
            unlockedHands: 2,
            comboMultiplier: 2,
            turboMultiplier: 3,
            blackHoleMultiplier: 1,
            tickCap: 999,
            getSlowdownMultiplier: handIndex => handIndex === 0 ? 1 : 3
        });

        expect(gains).toEqual([60, 180]);
    });

    it("caps non-finite tick earnings", () => {
        const gains = calculateTickEarningsByHand({
            ticksPerHand: [1, 1],
            unlockedHands: 2,
            comboMultiplier: Number.POSITIVE_INFINITY,
            turboMultiplier: 1,
            blackHoleMultiplier: 1,
            tickCap: 100,
            getSlowdownMultiplier: () => 1
        });

        expect(gains).toEqual([50, 50]);
    });

    it("calculates detached/background CPS progress by raw hand weights", () => {
        const progress = calculateDetachedCpsProgress({
            dtSec: 10,
            cpsPerHand: [2, 1],
            unlockedHands: 2,
            comboMultiplier: 2,
            turboMultiplier: 3,
            blackHoleMultiplier: 4
        });

        expect(progress.gained).toBe(720);
        expect(progress.gainsByHand).toEqual([480, 240]);
    });

    it("preserves detached CPS rounding behavior per hand", () => {
        const progress = calculateDetachedCpsProgress({
            dtSec: 1,
            cpsPerHand: [1, 1],
            unlockedHands: 2,
            comboMultiplier: 1,
            turboMultiplier: 1,
            blackHoleMultiplier: 1
        });

        expect(progress.gained).toBe(2);
        expect(progress.gainsByHand).toEqual([1, 1]);
    });

    it("returns zero detached progress for invalid elapsed time or no CPS", () => {
        expect(calculateDetachedCpsProgress({
            dtSec: 0,
            cpsPerHand: [10],
            unlockedHands: 1,
            comboMultiplier: 1,
            turboMultiplier: 1,
            blackHoleMultiplier: 1
        })).toEqual({ gained: 0, gainsByHand: [] });

        expect(calculateDetachedCpsProgress({
            dtSec: 1,
            cpsPerHand: [0, 0],
            unlockedHands: 2,
            comboMultiplier: 1,
            turboMultiplier: 1,
            blackHoleMultiplier: 1
        })).toEqual({ gained: 0, gainsByHand: [0, 0] });
    });

    it("runs the extracted Number 1 fixed-step agenda", () => {
        const calls: string[] = [];
        const hands = [
            { id: 1, count: 1, tickAccBig: 0n, baseSpeed: 1, render() { calls.push("render1"); } }
        ];
        let appliedGains: number[] = [];

        runNumber1GameLoopStep({
            handBaseSpeed: 1,
            tickCap: 999,
            tickBackgroundNumberModules: () => calls.push("background"),
            updateBlackHolePhaseStep: () => calls.push("black-hole-step"),
            syncBlackHolePhase1Vfx: () => calls.push("vfx"),
            getCurrentNumberMode: () => 1,
            shouldRunNumber2Foreground: () => false,
            runNumber2GameLoopStep: () => calls.push("n2"),
            processComboDiscoveryMilestoneIfUnlocked: () => calls.push("combo-milestone"),
            getBlackHolePhase: () => 0,
            runBlackHolePhase7Step: () => calls.push("phase7"),
            updateTimeWarpSystem: () => calls.push("warp"),
            maybeAlignSameSpeedHandPhasesFromWallClock: () => calls.push("align"),
            getUnlockedHands: () => 1,
            getHands: () => hands,
            getTickIntervalMs: () => 50,
            getHandSpeedSyncBucketKey: () => "hand-1",
            getEffectiveSpeedLevel: () => 1,
            getSpeedMultiplierBigForLevel: () => 20n,
            processClappingThisTick: () => calls.push("clap"),
            updateTurboStep: () => calls.push("turbo"),
            updateComboStep: () => calls.push("combo"),
            getComboMultiplier: () => 2,
            getTurboCountMultiplier: () => 3,
            getNumber1BlackHoleProductionMult: () => 1,
            getSlowdownMultiplier: () => 1,
            applyTickGains: gains => {
                calls.push("apply-gains");
                appliedGains = gains;
            },
            runAutobuyStep: () => calls.push("autobuy"),
            flushAutobuyDeferredTotalsIfAny: () => calls.push("deferred"),
            flushLoopUi: () => calls.push("ui")
        });

        expect(appliedGains).toEqual([6]);
        expect(calls).toEqual([
            "background",
            "black-hole-step",
            "vfx",
            "warp",
            "align",
            "render1",
            "clap",
            "turbo",
            "combo",
            "apply-gains",
            "autobuy",
            "deferred",
            "ui"
        ]);
    });

    it("short-circuits the extracted agenda for foreground Number 2", () => {
        const calls: string[] = [];

        runNumber1GameLoopStep({
            tickBackgroundNumberModules: () => calls.push("background"),
            updateBlackHolePhaseStep: () => calls.push("black-hole-step"),
            syncBlackHolePhase1Vfx: () => calls.push("vfx"),
            getCurrentNumberMode: () => 2,
            shouldRunNumber2Foreground: () => true,
            runNumber2GameLoopStep: () => calls.push("n2"),
            processComboDiscoveryMilestoneIfUnlocked: () => calls.push("combo-milestone")
        } as never, { backgroundTab: true });

        expect(calls).toEqual(["background", "black-hole-step", "n2", "combo-milestone"]);
    });

    it("skips BH stage VFX while Number 2 is focused (visible tab)", () => {
        const calls: string[] = [];

        runNumber1GameLoopStep({
            tickBackgroundNumberModules: () => calls.push("background"),
            updateBlackHolePhaseStep: () => calls.push("black-hole-step"),
            syncBlackHolePhase1Vfx: () => calls.push("vfx"),
            getCurrentNumberMode: () => 2,
            shouldRunNumber2Foreground: () => true,
            runNumber2GameLoopStep: () => calls.push("n2"),
            processComboDiscoveryMilestoneIfUnlocked: () => calls.push("combo-milestone")
        } as never);

        expect(calls).toEqual(["background", "black-hole-step", "n2", "combo-milestone"]);
        expect(calls).not.toContain("vfx");
    });

    it("runs fixed-step catch-up and tracks save playtime in the loop runtime", () => {
        let wallNow = 1000;
        let perfNow = 0;
        let steps = 0;
        const runtime = createNumber1LoopRuntime({
            getWallNow: () => wallNow,
            getPerfNow: () => perfNow,
            isGameplayFrozen: () => false,
            isDocumentHidden: () => false,
            shouldRunHiddenFixedStep: () => false,
            runGameLoopStep: () => { steps++; },
            applyOfflineProgress: () => {},
            patchOverviewIfNeeded: () => {}
        });

        runtime.setTotalPlayTimeMs(10);
        runtime.gameLoopTick();
        expect(steps).toBe(1);
        expect(runtime.getTotalPlayTimeMs()).toBe(10);

        wallNow += 100;
        perfNow += 100;
        runtime.gameLoopTick();

        expect(steps).toBe(3);
        expect(runtime.getTotalPlayTimeMs()).toBe(110);
        expect(runtime.getDisplayTotalPlayTimeMs()).toBe(110);
    });

    it("hands hidden-tab time to offline progress and prevents fixed-step catch-up", () => {
        let wallNow = 1000;
        let offlineMs = 0;
        let offlineOpts: { showSummary?: boolean } | undefined;
        const runtime = createNumber1LoopRuntime({
            getWallNow: () => wallNow,
            getPerfNow: () => wallNow,
            isGameplayFrozen: () => false,
            isDocumentHidden: () => false,
            shouldRunHiddenFixedStep: () => false,
            runGameLoopStep: () => {},
            applyOfflineProgress: (ms, opts) => {
                offlineMs = ms;
                offlineOpts = opts;
            },
            patchOverviewIfNeeded: () => {}
        });

        runtime.beginHiddenOfflineTracking();
        wallNow = 6500;
        runtime.endHiddenOfflineTracking();

        expect(offlineMs).toBe(5500);
        expect(offlineOpts).toEqual({ showSummary: false });
    });
});
