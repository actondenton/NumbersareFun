/** Smoothed per-hand CPS for upgrade button tooltip ETAs + shared duration wording. */

export const UPGRADE_ETA_CPS_SMOOTH_ALPHA = 0.08;

/** Human-readable duration for upgrade ETA: seconds if <60s, else whole minutes until multi-day/year. */
export function formatUpgradeAffordEtaDuration(secRaw) {
    if (!Number.isFinite(secRaw) || secRaw < 0) return "—";
    if (secRaw > 1e15) return "very long at current rate";
    if (secRaw < 60) {
        const s = Math.max(1, Math.ceil(secRaw));
        return "~" + s + "s at current rate";
    }
    if (secRaw < 86400 * 2) {
        const min = Math.max(1, Math.round(secRaw / 60));
        return "~" + min + " min at current rate";
    }
    if (secRaw < 86400 * 365) {
        const d = Math.max(1, Math.round(secRaw / 86400));
        return "~" + d + " d at current rate";
    }
    const y = secRaw / (86400 * 365);
    return "~" + (y >= 100 ? Math.round(y) + " yr" : Math.round(y * 10) / 10 + " yr") + " at current rate";
}

/**
 * @param {{ getHandEffectiveCps: (handIndex: number) => number }} deps
 */
export function createUpgradeEtaSmoother(deps) {
    const { getHandEffectiveCps } = deps;
    let passId = 0;
    /** @type {number[]} */
    const smoothedCpsByHand = [];
    /** @type {number[]} */
    const lastPassByHand = [];

    function bumpPass() {
        passId++;
    }

    function getSmoothedHandCpsForUpgradeEta(handIndex) {
        while (lastPassByHand.length <= handIndex) {
            lastPassByHand.push(-1);
            smoothedCpsByHand.push(0);
        }
        const pass = passId;
        const instant = getHandEffectiveCps(handIndex);
        if (lastPassByHand[handIndex] !== pass) {
            lastPassByHand[handIndex] = pass;
            const prev = smoothedCpsByHand[handIndex];
            /** @type {number} */
            let next;
            if (!(instant > 0)) {
                next = prev > 0 ? Math.max(0, prev * (1 - UPGRADE_ETA_CPS_SMOOTH_ALPHA * 2.5)) : 0;
            } else if (!(prev > 0)) {
                next = instant;
            } else {
                next = prev + UPGRADE_ETA_CPS_SMOOTH_ALPHA * (instant - prev);
            }
            smoothedCpsByHand[handIndex] = next;
        }
        return smoothedCpsByHand[handIndex];
    }

    /** ETA line for upgrade tooltips: covers cost shortfall at smoothed CPS for this hand. */
    function formatAffordEtaLine(balance, cost, handIndex) {
        const c = Number(cost);
        if (!Number.isFinite(c) || c <= 0) return "";
        const bal = Number(balance) || 0;
        const need = c - bal;
        if (need <= 0) return "\nEst.: ready now";
        const cps = getSmoothedHandCpsForUpgradeEta(handIndex);
        if (!(cps > 0)) return "\nEst.: — (no count/s on this hand right now)";
        const secRaw = need / cps;
        if (!Number.isFinite(secRaw)) return "\nEst.: —";
        return "\nEst.: " + formatUpgradeAffordEtaDuration(secRaw);
    }

    return { bumpPass, getSmoothedHandCpsForUpgradeEta, formatAffordEtaLine };
}
