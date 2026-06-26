import { applyBlackHoleTierAccentClass } from "./n1-black-hole-tier-accent.js";
import {
    getBlackHoleErgosphereActivationsTooltipSuffix,
    getBlackHolePhotonShellLevelerTooltipSuffix
} from "./number1-black-hole.js";
import { TURBO_ACTIVATIONS_LINE_TOOLTIP, TURBO_LEVELER_LINE_TOOLTIP } from "../upgrades/n1-turbo.js";

/**
 * Sync Photon/Ergosphere tier accent colors on Turbo UI after BH collapse upgrades.
 *
 * @deps {object} blackHoleState - number1BlackHoleState
 * @deps {function} getGrantTotals - () => import("../ascension/n1-ascension-grant-totals.js").GrantTotals
 * @deps {HTMLElement | null} turboBoostActivationsEl
 * @deps {HTMLElement | null} turboBoostToggleLabelEl
 * @deps {HTMLElement | null} turboScensionLevelerLineEl
 * @deps {function} setUpgradeTooltipText - (el, text) => void
 * FORBIDDEN: deps.runtime
 *
 * @param {object} deps
 * @returns {() => void}
 */
export function createSyncBhCollapseTurboTierAccents(deps) {
    return function syncBhCollapseTurboTierAccents() {
        const state = deps.blackHoleState;
        const photonTier = Math.max(0, Math.min(3, Math.floor(Number(state.phase2CollapsePhotonTier) || 0)));
        const ergoTier = Math.max(0, Math.min(3, Math.floor(Number(state.phase2CollapseErgosphereTier) || 0)));

        applyBlackHoleTierAccentClass(deps.turboBoostActivationsEl, ergoTier);

        let photonTarget = deps.turboBoostToggleLabelEl;
        const levelerEl = deps.turboScensionLevelerLineEl;
        const levelerVisible =
            levelerEl &&
            levelerEl.style.display !== "none" &&
            levelerEl.getAttribute("aria-hidden") !== "true" &&
            !!deps.getGrantTotals().turboLeveler;
        if (levelerVisible) {
            const lab = levelerEl.querySelector(".turbo-scension-level-line-label");
            if (lab) photonTarget = lab;
        }

        applyBlackHoleTierAccentClass(photonTarget, photonTier);
        if (photonTarget === levelerEl?.querySelector(".turbo-scension-level-line-label")) {
            applyBlackHoleTierAccentClass(deps.turboBoostToggleLabelEl, 0);
        } else {
            const lab = levelerEl?.querySelector(".turbo-scension-level-line-label");
            applyBlackHoleTierAccentClass(lab, 0);
        }

        if (deps.turboBoostActivationsEl) {
            deps.turboBoostActivationsEl.title =
                TURBO_ACTIVATIONS_LINE_TOOLTIP + getBlackHoleErgosphereActivationsTooltipSuffix(state);
        }
        if (levelerVisible) {
            deps.setUpgradeTooltipText(
                levelerEl,
                TURBO_LEVELER_LINE_TOOLTIP + getBlackHolePhotonShellLevelerTooltipSuffix(state)
            );
        }
    };
}
