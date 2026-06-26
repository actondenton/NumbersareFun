import {
    alignSameSpeedHandPhases,
    createNumber1LoopRuntime,
    runNumber1GameLoopStep
} from "./n1-game-loop.js";
import { assembleNumber1GameLoopStepDeps } from "./n1-game-loop-step-deps.js";
import { createNumber1ClapTick } from "./n1-clap-tick.js";
import { createNumber1TurboGameLoopStep } from "../upgrades/n1-turbo-game-loop-step.js";
import { createNumber1TickApplyStep } from "./n1-tick-apply-step.js";
import { HAND_BASE_SPEED } from "../hands/n1-hands.js";

const SAME_SPEED_HAND_ALIGN_INTERVAL_MS = 1000;
const OVERVIEW_PANEL_LIVE_PATCH_MS = 1000;

/**
 * Clap tick, turbo step, tick-apply, loop runtime, and step-deps assembly (Phase 21c).
 *
 * @param {{
 *   clap: Parameters<typeof createNumber1ClapTick>[0],
 *   turboStep: Parameters<typeof createNumber1TurboGameLoopStep>[0],
 *   tickApply: Parameters<typeof createNumber1TickApplyStep>[0],
 *   loopStep: Omit<Parameters<typeof assembleNumber1GameLoopStepDeps>[0],
 *     "maybeAlignSameSpeedHandPhasesFromWallClock" | "processClappingThisTick" | "updateTurboStep" | "applyTickGains" | "flushAutobuyDeferredTotalsIfAny">,
 *   loopRuntime: Omit<Parameters<typeof createNumber1LoopRuntime>[0], "runGameLoopStep" | "patchOverviewIfNeeded"> & {
 *     patchOverviewIfNeeded?: (nowOverview: number, ctx: { lastOverviewUpdateMs: number, overviewPatchMs: number }) => void
 *   },
 *   onTickApplyWired?: (step: ReturnType<typeof createNumber1TickApplyStep>) => void
 * }} dep
 */
export function wireNumber1GameLoop(dep) {
    const number1ClapTick = createNumber1ClapTick(dep.clap);
    const number1TurboGameLoopStep = createNumber1TurboGameLoopStep(dep.turboStep);
    const number1TickApplyStep = createNumber1TickApplyStep(dep.tickApply);
    dep.onTickApplyWired?.(number1TickApplyStep);

    let lastSameSpeedHandAlignWallMs = Date.now();
    function maybeAlignSameSpeedHandPhasesFromWallClock() {
        if (dep.turboStep.gameplaySimFrozen()) return;
        const now = Date.now();
        if (now - lastSameSpeedHandAlignWallMs < SAME_SPEED_HAND_ALIGN_INTERVAL_MS) return;
        lastSameSpeedHandAlignWallMs = now;
        alignSameSpeedHandPhases({
            hands: dep.clap.getHands(),
            unlockedHands: dep.clap.getUnlockedHands(),
            handBaseSpeed: HAND_BASE_SPEED,
            getTickIntervalMs: dep.loopStep.getTickIntervalMs,
            getHandSpeedSyncBucketKey: dep.loopStep.getHandSpeedSyncBucketKey
        });
    }

    const number1GameLoopStepDeps = assembleNumber1GameLoopStepDeps({
        ...dep.loopStep,
        maybeAlignSameSpeedHandPhasesFromWallClock,
        processClappingThisTick: number1ClapTick.processClappingThisTick,
        updateTurboStep: number1TurboGameLoopStep.updateTurboStep,
        applyTickGains: number1TickApplyStep.applyTickGains,
        flushAutobuyDeferredTotalsIfAny: number1TickApplyStep.flushAutobuyDeferredTotalsIfAny
    });

    function runGameLoopStep(opts) {
        runNumber1GameLoopStep(number1GameLoopStepDeps, opts);
    }

    let lastOverviewUpdateMs = 0;
    const { patchOverviewIfNeeded: patchOverviewHook, ...loopRuntimeRest } = dep.loopRuntime;
    const number1LoopRuntime = createNumber1LoopRuntime({
        ...loopRuntimeRest,
        runGameLoopStep: opts => runGameLoopStep(opts),
        patchOverviewIfNeeded: nowOverview => {
            if (!patchOverviewHook) return;
            const ctx = { lastOverviewUpdateMs, overviewPatchMs: OVERVIEW_PANEL_LIVE_PATCH_MS };
            patchOverviewHook(nowOverview, ctx);
            lastOverviewUpdateMs = ctx.lastOverviewUpdateMs;
        }
    });

    return {
        number1LoopRuntime,
        runGameLoopStep,
        number1ClapTick,
        number1TurboGameLoopStep,
        number1TickApplyStep,
        beginHiddenOfflineTracking: () => number1LoopRuntime.beginHiddenOfflineTracking(),
        endHiddenOfflineTracking: () => number1LoopRuntime.endHiddenOfflineTracking(),
        attachVisibilityOfflineTracking() {
            if (typeof document === "undefined") return;
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) number1LoopRuntime.beginHiddenOfflineTracking();
                else number1LoopRuntime.endHiddenOfflineTracking();
            });
        }
    };
}
