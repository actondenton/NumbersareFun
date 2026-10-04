import {
    getBlackHoleErgosphereActivationsTooltipSuffix,
    getBlackHolePhotonShellLevelerTooltipSuffix
} from "./number1-black-hole.js";
import { TURBO_ACTIVATIONS_LINE_TOOLTIP, TURBO_LEVELER_LINE_TOOLTIP } from "../upgrades/n1-turbo.js";

/** Tier accent classes for Phase 2 collapse tracks that buff Turbo UI (Photon shell, Ergosphere). */
export const BH_TIER_ACCENT_CLASSES = ["bh-tier-accent--1", "bh-tier-accent--2", "bh-tier-accent--3"];

/** @param {number} tier Owned collapse tier (1–3). */
export function getBlackHoleTierAccentClass(tier) {
    const t = Math.floor(Number(tier) || 0);
    if (t <= 0) return "";
    if (t === 1) return "bh-tier-accent--1";
    if (t === 2) return "bh-tier-accent--2";
    return "bh-tier-accent--3";
}

/** @param {Element | null | undefined} el */
export function applyBlackHoleTierAccentClass(el, tier) {
    if (!el) return;
    for (let i = 0; i < BH_TIER_ACCENT_CLASSES.length; i++) el.classList.remove(BH_TIER_ACCENT_CLASSES[i]);
    const next = getBlackHoleTierAccentClass(tier);
    if (next) el.classList.add(next);
}

/**
 * Sync Photon/Ergosphere tier accent colors on Turbo UI after BH collapse upgrades.
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
