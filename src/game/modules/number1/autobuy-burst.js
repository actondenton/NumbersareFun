/** Buy-until-broke burst (cheapen → speed → slowdown) shared by warp assist and collapse autobuy. */

export const AFFORDABLE_BURST_OUTER_GUARD = 400;
export const AFFORDABLE_BURST_CHEAPEN_INNER_GUARD = 500;
export const AFFORDABLE_BURST_SPEED_INNER_GUARD = 5000;

/** @returns {boolean} Black Hole Collapse (phase 2)+ enables timed autobuy burst. */
export function isCollapseAutobuyBurstUnlocked(getBlackHolePhase) {
    return (getBlackHolePhase() | 0) >= 2;
}

/**
 * @param {number} handIndex
 * @param {object} burstDeps
 * @param {{ buyOpts?: object, flushDeferredTotals?: boolean, onAfterBurst?: (r: object) => void }} [opts]
 */
export function applyAffordableUpgradeBurstForHand(handIndex, burstDeps, opts) {
    const {
        getUnlockedHands,
        getSpeedLevel,
        getCheapenLevel,
        getSlowdownLevel,
        getHandEarnings,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        getUpgradeCost,
        getSlowdownUpgradeCost,
        getMaxSlowdownLevelCap,
        isSlowdownUnlocked,
        buyCheapenUpgradeForHand,
        buySpeedUpgradeForHand,
        buySlowdownUpgradeForHand,
        flushAutobuyDeferredTotalsIfAny,
        markMeaningfulProgress
    } = burstDeps;
    opts = opts || {};
    const buyOpts = Object.assign(
        { fromAutobuy: true, silentLog: true, skipUpgradeDom: true, burstInnerBuy: true },
        opts.buyOpts || {}
    );
    const empty = { speedDelta: 0, cheapenDelta: 0, slowdownDelta: 0, any: false };
    if (handIndex < 0 || handIndex >= getUnlockedHands()) return empty;
    const speedLevel = getSpeedLevel();
    const cheapenLevel = getCheapenLevel();
    const slowdownLevel = getSlowdownLevel();
    const sl0 = speedLevel[handIndex] ?? 0;
    const ch0 = cheapenLevel[handIndex] ?? 0;
    const sd0 = slowdownLevel[handIndex] ?? 0;
    let guard = 0;
    while (guard++ < AFFORDABLE_BURST_OUTER_GUARD) {
        let progressed = false;
        let inner = 0;
        while (inner++ < AFFORDABLE_BURST_CHEAPEN_INNER_GUARD) {
            const ch = cheapenLevel[handIndex] ?? 0;
            if (ch >= getMaxCheapenLevel()) break;
            const nextCh = ch + 1;
            const cCost = getCheapenUpgradeCost(handIndex, nextCh);
            if ((getHandEarnings(handIndex) || 0) < cCost) break;
            buyCheapenUpgradeForHand(handIndex, null, buyOpts);
            progressed = true;
        }
        inner = 0;
        while (inner++ < AFFORDABLE_BURST_SPEED_INNER_GUARD) {
            const nextSp = speedLevel[handIndex] + 1;
            const sCost = getUpgradeCost(handIndex, nextSp);
            if ((getHandEarnings(handIndex) || 0) < sCost) break;
            buySpeedUpgradeForHand(handIndex, buyOpts);
            progressed = true;
        }
        if (isSlowdownUnlocked()) {
            const sd = slowdownLevel[handIndex] ?? 0;
            if (sd < getMaxSlowdownLevelCap()) {
                const nextSd = sd + 1;
                const dCost = getSlowdownUpgradeCost(nextSd);
                if (dCost != null && (getHandEarnings(handIndex) || 0) >= dCost) {
                    buySlowdownUpgradeForHand(handIndex, null, buyOpts);
                    progressed = true;
                }
            }
        }
        if (!progressed) break;
    }
    const speedDelta = (speedLevel[handIndex] ?? 0) - sl0;
    const cheapenDelta = (cheapenLevel[handIndex] ?? 0) - ch0;
    const slowdownDelta = (slowdownLevel[handIndex] ?? 0) - sd0;
    const any = speedDelta !== 0 || cheapenDelta !== 0 || slowdownDelta !== 0;
    if (any && typeof markMeaningfulProgress === "function") markMeaningfulProgress();
    if (opts.flushDeferredTotals !== false && typeof flushAutobuyDeferredTotalsIfAny === "function") {
        flushAutobuyDeferredTotalsIfAny();
    }
    const result = { speedDelta, cheapenDelta, slowdownDelta, any };
    if (any && typeof opts.onAfterBurst === "function") opts.onAfterBurst(result);
    return result;
}
