/**
 * NUMBER_MODULES[1] factory — explicit deps only (no legacy-boot closures).
 *
 * @deps {function} createNumberModule - shell validator from game core
 * @deps {object} run - n1-run-store slice
 * @deps {object} ascension - n1-ascension-store slice
 * @deps {object} blackHole - n1-black-hole-store slice
 * FORBIDDEN: deps.runtime, entire legacy-boot closure bags
 */
export function createNumber1ModuleDefinition(deps) {
    const {
        createNumberModule,
        getLabel,
        getRatePerSec,
        getMilestone,
        isAscensionReady,
        getSaveData,
        applySaveData,
        getOverviewDetails
    } = deps;

    return createNumberModule({
        getLabel,
        getRatePerSec,
        getMilestone,
        isAscensionReady,
        tickBackground: () => {},
        getSaveData,
        applySaveData,
        getOverviewDetails
    });
}
