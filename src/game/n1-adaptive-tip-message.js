import { TIME_WARP_MANUAL_CLICK_SCALE } from "./n1-time-warp.js";

export function computeNumber1AdaptiveTipMessage(input) {
    const {
        totalChanges,
        unlockedHands,
        turboBoostUnlocked,
        slowdownUnlocked,
        timeWarpUnlocked,
        timeWarpProductionSecondsBonus
    } = input;

    if (totalChanges < 10) {
        return "Tip: Buy your first Speed upgrade to ramp up early count gain.";
    }
    if (unlockedHands < 2) {
        return "Tip: Keep upgrading Speed and Cheapen on Hand 1 to push toward unlocking Hand 2.";
    }
    if (!turboBoostUnlocked) {
        return "Tip: Match hand digits to discover combos and build stronger multipliers.";
    }
    if (!slowdownUnlocked) {
        return "Tip: Turbo is unlocked. Build meter from combos, then toggle Turbo on. Boost scales with your Burn tier; a full tank runs longer with a bigger cap, and the gauge eases off near empty.";
    }
    if (!timeWarpUnlocked) {
        return "Tip: Compaction can trade speed for heavier ticks per hand. Use it where upgrades are expensive.";
    }
    return (
        "Tip: Watch for Time Warp auras and click them for a large production burst (" +
        TIME_WARP_MANUAL_CLICK_SCALE +
        "× " +
        timeWarpProductionSecondsBonus +
        "s of that hand's rate)."
    );
}
