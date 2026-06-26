/**
 * Number 1 ascension prestige state (persists across runs).
 */
export function createN1AscensionStore() {
    return {
        number1AscensionEssence: 0,
        number1AscensionPendingBonusEssence: 0,
        number1AscensionClapEssenceMultiplier: 1,
        number1AscensionClapEssenceProcCount: 0,
        number1HasAscended: false,
        number1AscensionNodeIds: [],
        ascensionMapCollapseActiveUntilMs: 0,
        ascensionMapCollapseTimerId: 0,
        ascensionMapCollapsePending: false,
        ascensionNumber1IntroSeen: false,
        ascensionPageActiveNumber: 1
    };
}
