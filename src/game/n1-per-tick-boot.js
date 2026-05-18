import { HAND_BASE_SPEED } from "./modules/number1/hands.js";
import { alignSameSpeedHandPhases } from "./modules/number1/core.js";
import { createNumber1ClapTick } from "./modules/number1/clap.js";
import { createNumber1TurboGameLoopStep } from "./modules/number1/core.js";
import { createNumber1TickApplyStep } from "./modules/number1/core.js";

/**
 * Clap tick, turbo game-loop step, tick-apply, and same-speed hand alignment (legacy orchestration).
 *
 * @param {object} deps
 */
export function wireNumber1PerTickBoot(deps) {
    const number1ClapTick = createNumber1ClapTick({
        getUnlockedHands: deps.getUnlockedHands,
        getHands: deps.getHands,
        computeAscensionGrantTotals: deps.computeAscensionGrantTotals,
        cheapenBonusLevel: deps.cheapenBonusLevel,
        slowdownBonusLevel: deps.slowdownBonusLevel,
        speedLevel: deps.speedLevel,
        speedBonusLevel: deps.speedBonusLevel,
        clapCooldownUntilMsByHand: deps.clapCooldownUntilMsByHand,
        clapDigitPrevious: deps.clapDigitPrevious,
        gameplaySimFrozen: deps.gameplaySimFrozen,
        addToLog: deps.addToLog,
        markMeaningfulProgress: deps.markMeaningfulProgress,
        updateSpeedUpgradeUI: deps.updateSpeedUpgradeUI,
        updateCheapenUpgradeUI: deps.updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI: deps.updateSlowdownUpgradeUI,
        updateRateDisplay: deps.updateRateDisplay,
        updateMilestoneUI: deps.updateMilestoneUI,
        refreshOverviewAndAscensionHubLiveIfOpen: deps.refreshOverviewAndAscensionHubLiveIfOpen,
        snapshotHandLedgerBonusDisplays: deps.snapshotHandLedgerBonusDisplays,
        ledgerBeamAfterClapBonuses: deps.ledgerBeamAfterClapBonuses,
        settings: deps.settings,
        isPagePanelOpen: deps.isPagePanelOpen,
        pagePanelEl: deps.pagePanelEl,
        getNumber1AscensionClapEssenceMultiplier: deps.getNumber1AscensionClapEssenceMultiplier,
        applyClapEssenceMultiplierProc: deps.applyClapEssenceMultiplierProc
    });

    let lastSameSpeedHandAlignWallMs = Date.now();
    const SAME_SPEED_HAND_ALIGN_INTERVAL_MS = 1000;

    function maybeAlignSameSpeedHandPhasesFromWallClock() {
        if (deps.gameplaySimFrozen()) return;
        const now = Date.now();
        if (now - lastSameSpeedHandAlignWallMs < SAME_SPEED_HAND_ALIGN_INTERVAL_MS) return;
        lastSameSpeedHandAlignWallMs = now;
        alignSameSpeedHandPhases({
            hands: deps.getHands(),
            unlockedHands: deps.getUnlockedHands(),
            handBaseSpeed: HAND_BASE_SPEED,
            getTickIntervalMs: deps.getTickIntervalMs,
            getHandSpeedSyncBucketKey: deps.getHandSpeedSyncBucketKey
        });
    }

    const number1TurboGameLoopStep = createNumber1TurboGameLoopStep({
        getTotalChanges: deps.getTotalChanges,
        getTurboBoostUnlocked: deps.getTurboBoostUnlocked,
        getTurboBoostEnabled: deps.getTurboBoostEnabled,
        getTurboBoostMeter: deps.getTurboBoostMeter,
        incrementTurboActivationCount: deps.incrementTurboActivationCount,
        updateTurboBurn: deps.updateTurboBurn,
        applyTurboPassiveMeterRegen: deps.applyTurboPassiveMeterRegen,
        isTurboScensionUpgradeAutobuyUnlocked: deps.isTurboScensionUpgradeAutobuyUnlocked,
        gameplaySimFrozen: deps.gameplaySimFrozen,
        tryTurboScensionActivationUpgrade: deps.tryTurboScensionActivationUpgrade,
        autosaveNow: deps.autosaveNow,
        updateTurboBoostUI: deps.updateTurboBoostUI,
        updateRateDisplay: deps.updateRateDisplay
    });

    const number1TickApplyStep = createNumber1TickApplyStep({
        getUnlockedHands: deps.getUnlockedHands,
        getHandEarnings: deps.getHandEarnings,
        refreshTotalFromHandEarnings: deps.refreshTotalFromHandEarnings,
        getIncrementalCountEl: deps.getIncrementalCountEl,
        formatCount: deps.formatCount,
        getTotalChanges: deps.getTotalChanges,
        updateObjectives: deps.updateObjectives,
        maybeShowFirstAscensionIntroOnUnlock: deps.maybeShowFirstAscensionIntroOnUnlock
    });

    return {
        number1ClapTick,
        maybeAlignSameSpeedHandPhasesFromWallClock,
        number1TurboGameLoopStep,
        number1TickApplyStep,
        flushAutobuyDeferredTotalsIfAny: number1TickApplyStep.flushAutobuyDeferredTotalsIfAny,
        markAutobuyDeferredTotalsPending: number1TickApplyStep.markAutobuyDeferredTotalsPending
    };
}
