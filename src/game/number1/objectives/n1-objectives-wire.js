import { createNumber1ObjectivesBoot } from "./n1-objectives-boot.js";

/** Objectives DOM flush boot (Phase 21b). */
export function wireNumber1Objectives(dep) {
    return createNumber1ObjectivesBoot(dep);
}

/**
 * @param {Parameters<typeof createNumber1ObjectivesBoot>[0]} ctx
 */
export function createNumber1ObjectivesWireDeps(ctx) {
    return ctx;
}
