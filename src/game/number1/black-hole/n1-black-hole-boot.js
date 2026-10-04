import { createNumber1BlackHoleController } from "./n1-black-hole-controller.js";
import { createNumber1BlackHoleUi } from "./n1-black-hole-ui.js";
import { syncPhase1MassFillCssVarsInRoot } from "../../phase1-tesseract-canvas.js";

/**
 * Wires controller + BH UI bridge. Callers use `controller` / `bhUiBridge` directly
 * (no pass-through façade).
 *
 * @param {object} dep
 * @param {(bhUiBridge: object) => object} dep.getBlackHoleControllerDeps
 * @param {(ctx: {{ ctl: object, syncPhase1MassFillCssVars: () => void, getMaxSlowdownLevelCap: () => number }}) => object} dep.getBlackHoleUiDeps
 * @param {number} dep.maxSlowdownLevelBase
 * @param {{ documentElement?: unknown } | null | undefined} [dep.rootDocument]
 */
export function createNumber1BlackHoleBoot(dep) {
    const { getBlackHoleControllerDeps, getBlackHoleUiDeps, maxSlowdownLevelBase, rootDocument } = dep;
    const bhUiBridge = {};
    const syncBhCollapseTurboTierAccentsRef = { fn: () => {} };

    const ctl = createNumber1BlackHoleController(getBlackHoleControllerDeps(bhUiBridge));

    function syncPhase1MassFillCssVars() {
        const doc = rootDocument || (typeof document !== "undefined" ? document : null);
        syncPhase1MassFillCssVarsInRoot(doc, ctl.getBlackHolePhase1FillRatio());
    }

    function getMaxSlowdownLevelCap() {
        return maxSlowdownLevelBase + ctl.getBlackHolePhase1SlowdownCapBonus();
    }

    Object.assign(
        bhUiBridge,
        createNumber1BlackHoleUi({
            ...getBlackHoleUiDeps({ ctl, syncPhase1MassFillCssVars, getMaxSlowdownLevelCap }),
            syncBhCollapseTurboTierAccents: () => syncBhCollapseTurboTierAccentsRef.fn()
        })
    );

    return {
        controller: ctl,
        bhUiBridge,
        syncPhase1MassFillCssVars,
        getMaxSlowdownLevelCap,
        registerSyncBhCollapseTurboTierAccents(fn) {
            syncBhCollapseTurboTierAccentsRef.fn = typeof fn === "function" ? fn : () => {};
        }
    };
}
