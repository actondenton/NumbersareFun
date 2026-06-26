/**
 * Time Warp aura state and boot ref (DOM/runtime wiring lives in n1-time-warp-boot).
 * @param {{ maxHands: number }} config
 */
export function createN1TimewarpStore({ maxHands }) {
    return {
        timeWarpAuraActiveByHand: [],
        timeWarpAuraAppearedAtMsByHand: [],
        timeWarpNextSpawnInSec: 0,
        timeWarpUnlockLogged: false,
        number1TimeWarpBoot: null
    };
}
