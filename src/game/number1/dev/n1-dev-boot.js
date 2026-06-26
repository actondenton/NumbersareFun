import { attachN1DevTools } from "./n1-dev-tools.js";

/**
 * Dev tools panel wiring (moved from legacy-boot Phase 4 wiring drain).
 *
 * @deps {number} devToolsLoadTimeMs
 * @deps {object} els - dev DOM elements
 * @deps {object} n1Gameplay - gameplay callbacks for dev mutations
 * FORBIDDEN: deps.runtime, entire legacy-boot closure bags
 */
export function wireNumber1DevTools(deps) {
    attachN1DevTools(deps);
}
