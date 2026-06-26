/**
 * Per-hand speed/clap lane state and live HandCounter instances.
 * @param {{ maxHands: number }} config
 */
export function createN1HandsStore({ maxHands }) {
    return {
        speedLevel: Array(maxHands).fill(0),
        speedBonusLevel: Array(maxHands).fill(0),
        clapDigitPrevious: Array(maxHands).fill(-1),
        clapCooldownUntilMsByHand: Array(maxHands).fill(0),
        hands: []
    };
}
