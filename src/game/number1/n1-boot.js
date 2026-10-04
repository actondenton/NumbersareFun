import { hydrateNumber1RuntimeFromSave } from "./n1-persist.js";
import { applyHydratedSnapshotToLiveGame } from "./n1-load-orchestration.js";
import { wireNumber1SaveLoad } from "./n1-save-wire.js";
import { runNumber1Boot } from "./n1-boot-body.js";

/**
 * Thin Number 1 entry: save hydrate hooks + boot(). Domain wiring lives in n1-boot-body.js.
 *
 * @param {{
 *   runtime: ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>,
 *   dom: ReturnType<typeof import("./shell-ui/n1-dom-refs.js").collectNumber1DomRefs>
 * }} deps
 */
export function createN1Boot(deps) {
    /** @type {(snap: NonNullable<ReturnType<typeof hydrateNumber1RuntimeFromSave>>) => void} */
    let applyLiveGameLoad = () => {};

    const api = {
        runtime: deps.runtime,
        dom: deps.dom,
        registerLiveGameLoad(fn) {
            applyLiveGameLoad = fn;
        },
        applyLoadedSave(rawSave, hydrateEnv) {
            const snap = hydrateNumber1RuntimeFromSave(deps.runtime, rawSave, hydrateEnv);
            if (!snap) return false;
            applyHydratedSnapshotToLiveGame(snap, { applyLiveGameLoad: s => applyLiveGameLoad(s) });
            return true;
        },
        wireSaveLoad(dep) {
            return wireNumber1SaveLoad(api, dep);
        },
        boot() {
            return runNumber1Boot({ n1Boot: api, runtime: deps.runtime, dom: deps.dom });
        }
    };

    return api;
}
