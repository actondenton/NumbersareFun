import { createNumber1TurboBoot } from "./n1-turbo-boot.js";

/**
 * Turbo gauge / scension DOM boot wiring (Phase 21a).
 *
 * @param {Parameters<typeof createNumber1TurboBoot>[0]} dep
 */
export function wireNumber1TurboBoot(dep) {
    const number1TurboBoot = createNumber1TurboBoot(dep);
    return {
        number1TurboBoot,
        tryUnlockTurboIfEligible: number1TurboBoot.tryUnlockTurboIfEligible,
        syncTurboBoostToggleDomFromBoot: number1TurboBoot.syncTurboBoostToggleDom
    };
}
