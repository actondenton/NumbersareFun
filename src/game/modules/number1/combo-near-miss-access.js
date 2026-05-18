import { getNearMissToleranceRanksFromNodes } from "./combo.js";

/** Near-miss digit ranks derived from Ascension ownership (glue next to HAND COMBOS boot). */
export function createNumber1ComboNearMissAccess(deps) {
    return {
        getNearMissToleranceRanks() {
            return getNearMissToleranceRanksFromNodes(deps.getAscensionNodeIds(), deps.getAscensionNodeById());
        }
    };
}
