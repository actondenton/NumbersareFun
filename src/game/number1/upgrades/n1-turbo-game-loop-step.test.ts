import { describe, expect, it, vi } from "vitest";
import { TURBO_UNLOCK_COUNT } from "./n1-turbo.js";
import { createNumber1TurboGameLoopStep } from "./n1-turbo-game-loop-step.js";

function baseDeps(overrides: Record<string, unknown> = {}) {
    return {
        getTotalChanges: () => TURBO_UNLOCK_COUNT,
        getTurboBoostUnlocked: () => false,
        getTurboBoostEnabled: () => false,
        getTurboBoostMeter: () => 0,
        incrementTurboActivationCount: () => {},
        updateTurboBurn: () => {},
        applyTurboPassiveMeterRegen: () => {},
        isTurboScensionUpgradeAutobuyUnlocked: () => false,
        gameplaySimFrozen: () => false,
        tryTurboScensionActivationUpgrade: () => false,
        autosaveNow: () => {},
        updateTurboBoostUI: () => {},
        updateRateDisplay: () => {},
        ...overrides
    };
}

describe("createNumber1TurboGameLoopStep", () => {
    it("skips turbo work when total is below turbo unlock", () => {
        const tryTurbo = vi.fn(() => true);
        const autosaveNow = vi.fn();
        const updateTurboBurn = vi.fn();
        const { updateTurboStep } = createNumber1TurboGameLoopStep(
            baseDeps({
                getTotalChanges: () => TURBO_UNLOCK_COUNT - 1,
                tryTurboScensionActivationUpgrade: tryTurbo,
                autosaveNow,
                updateTurboBurn
            })
        );
        updateTurboStep(0.1, false);
        expect(tryTurbo).not.toHaveBeenCalled();
        expect(autosaveNow).not.toHaveBeenCalled();
        expect(updateTurboBurn).not.toHaveBeenCalled();
    });

    it("runs turbo-scension autobuy loop and autosaves when an upgrade succeeds", () => {
        const tryTurbo = vi.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const autosaveNow = vi.fn();
        const { updateTurboStep } = createNumber1TurboGameLoopStep(
            baseDeps({
                isTurboScensionUpgradeAutobuyUnlocked: () => true,
                tryTurboScensionActivationUpgrade: tryTurbo,
                autosaveNow
            })
        );
        updateTurboStep(0.05, false);
        expect(tryTurbo).toHaveBeenCalled();
        expect(tryTurbo.mock.calls[0][0]).toMatchObject({
            skipLog: true,
            skipAutosave: true,
            skipUIUpdate: true
        });
        expect(autosaveNow).toHaveBeenCalledTimes(1);
    });

    it("does not autosave or call tryTurbo when gameplay is frozen", () => {
        const tryTurbo = vi.fn(() => true);
        const autosaveNow = vi.fn();
        const { updateTurboStep } = createNumber1TurboGameLoopStep(
            baseDeps({
                isTurboScensionUpgradeAutobuyUnlocked: () => true,
                gameplaySimFrozen: () => true,
                tryTurboScensionActivationUpgrade: tryTurbo,
                autosaveNow
            })
        );
        updateTurboStep(0.05, false);
        expect(tryTurbo).not.toHaveBeenCalled();
        expect(autosaveNow).not.toHaveBeenCalled();
    });

    it("throttles turbo UI updates in background tab", () => {
        const updateTurboBoostUI = vi.fn();
        const updateRateDisplay = vi.fn();
        const tryTurbo = vi.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const { updateTurboStep } = createNumber1TurboGameLoopStep(
            baseDeps({
                isTurboScensionUpgradeAutobuyUnlocked: () => true,
                tryTurboScensionActivationUpgrade: tryTurbo,
                updateTurboBoostUI,
                updateRateDisplay
            })
        );
        updateTurboStep(0.05, true);
        expect(updateTurboBoostUI).not.toHaveBeenCalled();
        expect(updateRateDisplay).not.toHaveBeenCalled();
    });

    it("increments turbo activations when boost is active with meter charge", () => {
        const increment = vi.fn();
        const { updateTurboStep } = createNumber1TurboGameLoopStep(
            baseDeps({
                getTurboBoostUnlocked: () => true,
                getTurboBoostEnabled: () => true,
                getTurboBoostMeter: () => 1,
                incrementTurboActivationCount: increment
            })
        );
        updateTurboStep(0.02, false);
        expect(increment).toHaveBeenCalledTimes(1);
    });
});
