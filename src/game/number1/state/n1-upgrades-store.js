/**
 * Cheapen / slowdown upgrade levels per hand (run-scoped).
 * @param {{ maxHands: number }} config
 */
export function createN1UpgradesStore({ maxHands }) {
    return {
        cheapenLevel: Array(maxHands).fill(0),
        cheapenBonusLevel: Array(maxHands).fill(0),
        slowdownLevel: Array(maxHands).fill(0),
        slowdownBonusLevel: Array(maxHands).fill(0),
        slowdownUnlockLogged: false
    };
}
