/**
 * Number 1 run-scoped counters (reset on ascend).
 * @param {{ maxHands: number }} config
 */
export function createN1RunStore({ maxHands }) {
    const handEarnings = Array(maxHands).fill(0);
    handEarnings[0] = 1;
    return {
        maxHands,
        totalChanges: 1,
        handEarnings,
        unlockedHands: 1,
        unlockedHandsCap: maxHands,
        number1RunPeakTotalCount: 1,
        slowdownCompactionUnlockedLatched: false
    };
}
