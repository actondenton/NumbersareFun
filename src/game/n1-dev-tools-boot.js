/**
 * Builds the payload for {@link attachN1DevTools} from legacy orchestration accessors.
 *
 * @param {object} deps
 * @returns {Parameters<typeof import("./modules/number1/dev-tools.js").attachN1DevTools>[0]}
 */
export function buildN1DevToolsAttachPayload(deps) {
    return {
        devToolsLoadTimeMs: deps.devToolsLoadTimeMs,
        els: deps.els,
        n1Gameplay: deps.n1Gameplay
    };
}
