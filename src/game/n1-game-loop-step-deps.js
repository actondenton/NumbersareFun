import { HAND_BASE_SPEED } from "./n1-hands.js";
import { BLACK_HOLE_EVAPORATION_CAP } from "./number1-black-hole.js";

/**
 * Compose the deps object passed to {@link runNumber1GameLoopStep}. Keeps invariant constants (`handBaseSpeed`, `tickCap`) in one import site.
 *
 * @param {Record<string, unknown>} injected Boots hooks and getters (everything except the two invariant fields).
 */
export function assembleNumber1GameLoopStepDeps(injected) {
    return {
        ...injected,
        handBaseSpeed: HAND_BASE_SPEED,
        tickCap: BLACK_HOLE_EVAPORATION_CAP
    };
}
