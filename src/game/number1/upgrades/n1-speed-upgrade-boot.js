import { GAME_LOOP_MS } from "../loop/n1-game-loop.js";

/** Speed purchase + speed autobuy loop; sim/state lives in boot via deps. */
export function createNumber1SpeedUpgradeBoot(deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getSpeedLevel,
        getUpgradeCost,
        getHandEarnings,
        setHandEarningBalance,
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        incrementSpeedLevel,
        getHands,
        addToLog,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        restartAllHandTimers,
        getAutoBuyUnlocked,
        setSpeedAutobuyCountdown,
        getAutoBuyEnabledByHand,
        getAutoBuyCountdownSecondsByHand,
        getAutoBuyDelaySeconds,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setBatchedUpgradeUiFlush,
        refreshUpgradeColumnsUi,
        flashSpeedAutobuyToast
    } = deps;

    function buySpeedUpgradeForHand(handIndex, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const speedLevel = getSpeedLevel();
        const nextLevel = speedLevel[handIndex] + 1;
        const cost = getUpgradeCost(handIndex, nextLevel);
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        incrementSpeedLevel(handIndex);
        const handNum = handIndex + 1;
        const upgradedHand = getHands()[handIndex];
        if (upgradedHand) upgradedHand.tickAccBig = 0n;
        const lvlNow = getSpeedLevel()[handIndex];
        if (!(opts && opts.silentLog)) addToLog("Speed upgrade purchased for Hand " + handNum + " (level " + lvlNow + ")", "system");
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        getHands().forEach(h => h.restartTimer());
        if (getAutoBuyUnlocked()) {
            const nextCost = getUpgradeCost(handIndex, getSpeedLevel()[handIndex] + 1);
            if (getHandEarnings(handIndex) < nextCost) setSpeedAutobuyCountdown(handIndex, 0);
        }
        if (!(opts && opts.fromAutobuy)) {
            const rowRefs = getSpeedRowRefs();
            const origin =
                (opts && opts.confettiOrigin) ||
                (rowRefs[handIndex] && rowRefs[handIndex].btn && rowRefs[handIndex].btn.closest(".speed-upgrade-row"));
            if (origin) {
                sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
            }
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            refreshUpgradeColumnsUi();
        }
    }

    function maybeAutoBuySpeedUpgrade() {
        if (!getAutoBuyUnlocked()) return;
        const dtSec = GAME_LOOP_MS / 1000;
        const unlockedHands = getUnlockedHands();
        for (let i = 0; i < unlockedHands; i++) {
            if (!getAutoBuyEnabledByHand(i)) continue;
            const countdown = getAutoBuyCountdownSecondsByHand(i) || 0;
            const speedLevel = getSpeedLevel();
            const nextLevel = speedLevel[i] + 1;
            const cost = getUpgradeCost(i, nextLevel);
            const canAfford = getHandEarnings(i) >= cost;
            if (countdown > 0) {
                setSpeedAutobuyCountdown(i, countdown - dtSec);
                const nextCd = getAutoBuyCountdownSecondsByHand(i) || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        buySpeedUpgradeForHand(i, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        flashSpeedAutobuyToast(i, "Speed " + (getSpeedLevel()[i] | 0));
                        const stillCanAfford = getHandEarnings(i) >= getUpgradeCost(i, getSpeedLevel()[i] + 1);
                        setSpeedAutobuyCountdown(i, stillCanAfford ? getAutoBuyDelaySeconds() : 0);
                    } else {
                        setSpeedAutobuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                setSpeedAutobuyCountdown(i, getAutoBuyDelaySeconds());
            }
        }
    }

    return { buySpeedUpgradeForHand, maybeAutoBuySpeedUpgrade };
}
