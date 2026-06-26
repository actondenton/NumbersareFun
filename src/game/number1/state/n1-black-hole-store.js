import {
    createNumber1BlackHoleState,
    createNumber1BlackHoleUxFlags
} from "../black-hole/number1-black-hole.js";

/**
 * Black hole progression state and UX flags.
 */
export function createN1BlackHoleStore() {
    return {
        /** Legacy save field; mapped into phase state on load. */
        number1AscensionBlackHoleLevel: 0,
        number1BlackHoleState: createNumber1BlackHoleState(),
        number1BlackHoleUxFlags: createNumber1BlackHoleUxFlags()
    };
}
