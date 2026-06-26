/**
 * Combo catalog earn state and discovery milestone queue (runtime-owned).
 */
export function createN1ComboStore() {
    return {
        earnedComboNames: [],
        comboActivationCounts: {},
        comboDiscoveryMilestonePendingQueue: [],
        comboDiscoveryMilestoneReadyAtMs: 0,
        comboDiscoveryMilestoneCooldownSpanMs: 0,
        previousTickActiveComboNames: new Set()
    };
}
