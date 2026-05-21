import { assembleNumber1GameLoopStepDeps, runNumber1GameLoopStep } from "./modules/number1/core.js";
import { createNumber1LegacyLoopFlushUi } from "./modules/number1/number1-legacy-loop-flush.js";

/**
 * Throttled UI flush + `assembleNumber1GameLoopStepDeps` + `runNumber1GameLoopStep` wrapper (legacy-boot orchestration).
 *
 * @param {object} p
 * @param {object} p.legacyLoopFlush — args for {@link createNumber1LegacyLoopFlushUi} (without `uiUpdateThrottleMs`, set here).
 * @param {object} p.gameLoopStep — remainder passed to {@link assembleNumber1GameLoopStepDeps}; `flushLoopUi` is injected.
 */
export function createNumber1GameLoopAssembly(p) {
    const UI_UPDATE_THROTTLE_MS = 150;
    const flushLoopUiThrottled = createNumber1LegacyLoopFlushUi({
        uiUpdateThrottleMs: UI_UPDATE_THROTTLE_MS,
        ...p.legacyLoopFlush
    });
    const number1GameLoopStepDeps = assembleNumber1GameLoopStepDeps({
        ...p.gameLoopStep,
        flushLoopUi: flushLoopUiThrottled
    });
    function runGameLoopStep(opts) {
        runNumber1GameLoopStep(number1GameLoopStepDeps, opts);
    }
    return {
        UI_UPDATE_THROTTLE_MS,
        flushLoopUiThrottled,
        number1GameLoopStepDeps,
        runGameLoopStep
    };
}
