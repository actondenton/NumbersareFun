/**
 * Speed / cheapen / compaction autobuy unlock and per-hand toggle state.
 * @param {{ maxHands: number }} config
 */
export function createN1AutobuyStore({ maxHands }) {
    return {
        autoBuyUnlocked: false,
        autoBuyEnabledByHand: [],
        autoBuyCountdownSecondsByHand: []
    };
}
