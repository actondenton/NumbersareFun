import { TURBO_UNLOCK_COUNT } from "./n1-turbo.js";

/**
 * Turbo meter burn/regen, turbo-scension autobuy loop, and related UI flush hooks for {@link runNumber1GameLoopStep}.
 *
 * @param {object} deps
 * @param {() => number} deps.getTotalChanges
 * @param {() => boolean} deps.getTurboBoostUnlocked
 * @param {() => boolean} deps.getTurboBoostEnabled
 * @param {() => number} deps.getTurboBoostMeter
 * @param {() => void} deps.incrementTurboActivationCount
 * @param {(dtSec: number) => void} deps.updateTurboBurn
 * @param {(dtSec: number) => void} deps.applyTurboPassiveMeterRegen
 * @param {() => boolean} deps.isTurboScensionUpgradeAutobuyUnlocked
 * @param {() => boolean} deps.gameplaySimFrozen
 * @param {(opts: object) => boolean} deps.tryTurboScensionActivationUpgrade
 * @param {() => void} deps.autosaveNow
 * @param {() => void} deps.updateTurboBoostUI
 * @param {(opts?: object) => void} deps.updateRateDisplay
 */
export function createNumber1TurboGameLoopStep(deps) {
    const {
        getTotalChanges,
        getTurboBoostUnlocked,
        getTurboBoostEnabled,
        getTurboBoostMeter,
        incrementTurboActivationCount,
        updateTurboBurn,
        applyTurboPassiveMeterRegen,
        isTurboScensionUpgradeAutobuyUnlocked,
        gameplaySimFrozen,
        tryTurboScensionActivationUpgrade,
        autosaveNow,
        updateTurboBoostUI,
        updateRateDisplay
    } = deps;

    function updateTurboStep(dtSec, backgroundTab) {
        if (getTotalChanges() < TURBO_UNLOCK_COUNT) return;
        let turboScensionAutobuyDidUpgrade = false;
        if (getTurboBoostUnlocked()) {
            if (getTurboBoostEnabled() && getTurboBoostMeter() > 0) incrementTurboActivationCount();
            updateTurboBurn(dtSec);
            applyTurboPassiveMeterRegen(dtSec);
        }
        if (isTurboScensionUpgradeAutobuyUnlocked()) {
            while (!gameplaySimFrozen() && tryTurboScensionActivationUpgrade({ skipLog: true, skipAutosave: true, skipUIUpdate: true })) {
                turboScensionAutobuyDidUpgrade = true;
            }
            if (turboScensionAutobuyDidUpgrade) autosaveNow();
        }
        if (!backgroundTab) {
            updateTurboBoostUI();
            if (turboScensionAutobuyDidUpgrade) updateRateDisplay();
        }
    }

    return { updateTurboStep };
}
