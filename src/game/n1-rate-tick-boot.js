import { HAND_BASE_SPEED } from "./n1-hands.js";
import {
    clampFiniteNonNegative,
    formatCpsForDisplay as formatCpsForDisplayWithFormatter,
    getTickIntervalMsForMultiplier
} from "./n1-rate.js";

/** Per-hand tick interval, CPS bridges, and display formatters for Number 1 rate UI. */
export function createNumber1RateTickBoot(deps) {
    const {
        getUnlockedHands,
        getHands,
        getSpeedMultiplier,
        getSlowdownMultiplier,
        formatCount,
        getComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        isSlowdownUnlocked,
        getTurboBoostUnlocked
    } = deps;

    function formatCpsForDisplay(cps) {
        return formatCpsForDisplayWithFormatter(cps, formatCount);
    }

    function getTickIntervalMs(baseSpeed, handIndex) {
        return getTickIntervalMsForMultiplier(baseSpeed, getSpeedMultiplier(handIndex));
    }

    /**
     * Per-hand count/s from that hand before combo/turbo (matches gameLoopTick weighting).
     * Tick cadence embeds Speed (2^level); Compaction multiplies tick value only (10^level).
     */
    function getHandPerHandRawCps(handIndex) {
        const unlockedHands = getUnlockedHands();
        if (handIndex < 0 || handIndex >= unlockedHands) return 0;
        const hands = getHands();
        const h = hands[handIndex];
        if (!h) return 0;
        const baseSpeed = (Number.isFinite(h.baseSpeed) && h.baseSpeed > 0) ? h.baseSpeed : HAND_BASE_SPEED;
        const intervalMs = getTickIntervalMs(baseSpeed, handIndex);
        if (intervalMs <= 0) return 0;
        const animPerSec = 1000 / intervalMs;
        const slow = getSlowdownMultiplier(handIndex);
        return clampFiniteNonNegative(animPerSec * slow);
    }

    /** Speed-upgrade multiplier shown as the “base” in base × combo × turbo × Compaction (always ≥ 1). */
    function getHandBaseCpsBeforeSlowdownMult(handIndex) {
        if (handIndex < 0 || handIndex >= getUnlockedHands()) return 0;
        return getSpeedMultiplier(handIndex);
    }

    function getHandSlowdownFactorForDisplay(handIndex) {
        return isSlowdownUnlocked() ? getSlowdownMultiplier(handIndex) : 1;
    }

    function getHandComboFactorForDisplay() {
        return getUnlockedHands() >= 2 ? getComboMultiplier() : 1;
    }

    function getHandTurboFactorForDisplay() {
        return getTurboBoostUnlocked() ? getTurboCountMultiplier() : 1;
    }

    function getHandEffectiveCps(handIndex) {
        return clampFiniteNonNegative(
            getHandPerHandRawCps(handIndex) * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult()
        );
    }

    /** Sum of per-hand raw tick CPS (before combo × turbo). */
    function getTotalRawCpsSum() {
        let sum = 0;
        const n = getUnlockedHands();
        for (let i = 0; i < n; i++) sum += getHandPerHandRawCps(i);
        return sum;
    }

    /** Instantaneous total CPS from current sim state (hands, upgrades, combo, turbo, black hole). */
    function getInstantTotalCps() {
        const raw = getTotalRawCpsSum();
        return clampFiniteNonNegative(
            raw * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult()
        );
    }

    function getRawCpsPerHand() {
        const out = [];
        const n = getUnlockedHands();
        for (let i = 0; i < n; i++) out.push(getHandPerHandRawCps(i));
        return out;
    }

    return {
        formatCpsForDisplay,
        getTickIntervalMs,
        getHandPerHandRawCps,
        getHandBaseCpsBeforeSlowdownMult,
        getHandSlowdownFactorForDisplay,
        getHandComboFactorForDisplay,
        getHandTurboFactorForDisplay,
        getHandEffectiveCps,
        getTotalRawCpsSum,
        getInstantTotalCps,
        getRawCpsPerHand
    };
}
