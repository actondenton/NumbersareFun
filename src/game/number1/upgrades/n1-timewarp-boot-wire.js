import { createNumber1TimeWarpBoot } from "./n1-time-warp-boot.js";

/**
 * Creates time-warp boot on the timewarp store slice and wires post-assist UI refresh (Phase 21a).
 *
 * @param {{
 *   timewarp: { number1TimeWarpBoot?: ReturnType<typeof createNumber1TimeWarpBoot> },
 *   boot: Parameters<typeof createNumber1TimeWarpBoot>[0],
 *   afterWarpAssist: {
 *     setBatchedUpgradeUiFlush: (v: boolean) => void,
 *     updateSpeedUpgradeUI: () => void,
 *     updateCheapenUpgradeUI: () => void,
 *     updateSlowdownUpgradeUI: () => void,
 *     updateRateDisplay: () => void
 *   }
 * }} dep
 */
export function wireNumber1TimeWarpBoot(dep) {
    dep.timewarp.number1TimeWarpBoot = createNumber1TimeWarpBoot(dep.boot);
    const boot = dep.timewarp.number1TimeWarpBoot;

    boot.wireAfterWarpAssist(() => {
        dep.afterWarpAssist.setBatchedUpgradeUiFlush(false);
        dep.afterWarpAssist.updateSpeedUpgradeUI();
        dep.afterWarpAssist.updateCheapenUpgradeUI();
        dep.afterWarpAssist.updateSlowdownUpgradeUI();
        dep.afterWarpAssist.updateRateDisplay();
        boot.updateTimeWarpAuraUI();
    });

    return {
        handHasActiveTimeWarpAura: boot.handHasActiveTimeWarpAura,
        handContributesTimeWarpPriority: boot.handContributesTimeWarpPriority,
        handContributesToScrollHint: boot.handContributesToScrollHint,
        ensureTimeWarpArrays: boot.ensureTimeWarpArrays,
        getWarpPotencyMaxTiersEffective: boot.getWarpPotencyMaxTiersEffective,
        getWarpPotencyTierForHandNow: boot.getWarpPotencyTierForHandNow,
        getWarpPotencyMultiplierForHandNow: boot.getWarpPotencyMultiplierForHandNow,
        scheduleNextTimeWarpSpawn: boot.scheduleNextTimeWarpSpawn,
        getTimeWarpGrantForHand: boot.getTimeWarpGrantForHand,
        applyTimeWarpGrant: boot.applyTimeWarpGrant,
        tryGrantAscensionBonusEssenceFromWarp: boot.tryGrantAscensionBonusEssenceFromWarp,
        applyTimeWarpOverflowToAllHands: boot.applyTimeWarpOverflowToAllHands,
        applyTimeWarpManualAutoBuyAssistForHand: boot.applyTimeWarpManualAutoBuyAssistForHand,
        updateTimeWarpAuraUI: boot.updateTimeWarpAuraUI,
        playTimeWarpScreenEffect: boot.playTimeWarpScreenEffect,
        activateTimeWarpAuraForHand: boot.activateTimeWarpAuraForHand,
        updateTimeWarpSystem: boot.updateTimeWarpSystem,
        getAscensionComboTimeWarpDelayReductionPerTriggerSec: boot.getAscensionComboTimeWarpDelayReductionPerTriggerSec,
        applyAscensionComboTimeWarpDelayReduction: boot.applyAscensionComboTimeWarpDelayReduction
    };
}
