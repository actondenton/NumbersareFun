/**
 * Shared Number 1 game context. Domains install methods onto `g`; callers use
 * late-bound wrappers from `g.bind(name)` so setup order does not need forward stubs.
 *
 * @param {ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>} runtime
 * @param {ReturnType<typeof import("./shell-ui/n1-dom-refs.js").collectNumber1DomRefs>} [dom]
 */
export function createN1GameContext(runtime, dom = null) {
    const g = {
        runtime,
        dom,
        run: runtime.run,
        ascension: runtime.ascension,
        blackHole: runtime.blackHole,
        turbo: runtime.turbo,
        upgrades: runtime.upgrades,
        autobuy: runtime.autobuy,
        timewarp: runtime.timewarp,
        hands: runtime.hands,
        combo: runtime.combo,
        story: runtime.story,
        objectives: runtime.objectives,
        session: runtime.session
    };

    /**
     * Register a placeholder on `g` and return a function that always calls the
     * current `g[name]` (so later `install` updates are visible to early closures).
     * @param {string} name
     * @param {Function} [fallback]
     */
    g.bind = function bind(name, fallback) {
        const fb =
            typeof fallback === "function"
                ? fallback
                : function () {
                      return undefined;
                  };
        g[name] = fb;
        return function boundGameMethod(...args) {
            return g[name](...args);
        };
    };

    /** @param {Record<string, unknown>} partial */
    g.install = function install(partial) {
        if (partial && typeof partial === "object") Object.assign(g, partial);
        return partial;
    };

    return g;
}
