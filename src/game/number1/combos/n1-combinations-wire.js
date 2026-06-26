import { createNumber1CombinationsBoot } from "./n1-combinations-boot.js";

/** Stubs for combo APIs referenced before combinations boot wires (forward-ref holder). */
export function createCombinationsForwardRefHolder() {
    return {
        getComboMultiplier: () => 1,
        getPatternCatalogMultiplier: () => 1,
        getAscensionComboPatternMult: () => 1,
        getTimeWarpComboMultiplier: () => 1,
        getComboDiscoveryMilestoneCooldownMs: () => 60000,
        tryProcessOneComboDiscoveryMilestone: function() {},
        updateComboUI: function() {},
        patchCombinationsPageLiveDom: () => false,
        renderCombinationsPageHtml: () =>
            "<p class=\"message-log-empty\">Unlock Hand 2 to view combinations.</p>",
        setComboIndexStatusFilter: function() {},
        setComboIndexHandsFilter: function() {},
        resetComboIndexFilters: function() {},
        refreshCombinationsPanelIfOpen: function() {},
        markCombinationsPanelOpenedClock: function() {},
        consumeComboFilterClickDebounced: function() {
            return false;
        },
        updateComboDiscoveryMilestonePanelIfOpen: function() {},
        updateEarnedBonusesUI: function() {}
    };
}

const COMBINATIONS_FORWARD_REF_KEYS = [
    "getComboDiscoveryMilestoneCooldownMs",
    "updateComboDiscoveryMilestonePanelIfOpen",
    "getComboMultiplier",
    "getPatternCatalogMultiplier",
    "getAscensionComboPatternMult",
    "getTimeWarpComboMultiplier",
    "patchCombinationsPageLiveDom",
    "renderCombinationsPageHtml",
    "setComboIndexStatusFilter",
    "setComboIndexHandsFilter",
    "resetComboIndexFilters",
    "refreshCombinationsPanelIfOpen",
    "markCombinationsPanelOpenedClock",
    "consumeComboFilterClickDebounced",
    "tryProcessOneComboDiscoveryMilestone",
    "updateComboUI",
    "updateEarnedBonusesUI"
];

/**
 * @param {ReturnType<typeof createNumber1CombinationsBoot>} boot
 * @param {ReturnType<typeof createCombinationsForwardRefHolder>} forward
 */
export function patchCombinationsForwardRefs(boot, forward) {
    for (const key of COMBINATIONS_FORWARD_REF_KEYS) {
        forward[key] = boot[key];
    }
}

/**
 * @param {Parameters<typeof createNumber1CombinationsBoot>[0] & {
 *   forward?: ReturnType<typeof createCombinationsForwardRefHolder>
 * }} dep
 */
export function wireNumber1Combinations(dep) {
    const forward = dep.forward;
    const bootDep = { ...dep };
    delete bootDep.forward;
    const boot = createNumber1CombinationsBoot(bootDep);
    if (forward) patchCombinationsForwardRefs(boot, forward);
    return boot;
}

/**
 * @param {Parameters<typeof createNumber1CombinationsBoot>[0]} ctx
 */
export function createNumber1CombinationsWireDeps(ctx) {
    return ctx;
}
