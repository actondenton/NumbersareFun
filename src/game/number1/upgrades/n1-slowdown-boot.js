import { GAME_LOOP_MS } from "../loop/n1-game-loop.js";
import { DEV_SLOWDOWN_AUTOBUY_DELAY, getEffectiveUpgradeLevel, getSlowdownMultiplierForLevel } from "./n1-upgrades.js";

/** Compaction (slowdown) column UI, purchase, and autobuy; arrays live in boot via deps. */
export function createNumber1SlowdownBoot(deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getHandEarnings,
        getSlowdownLevel,
        getSlowdownBonusLevel,
        getSlowdownAutoBuyCountdownByHand,
        setSlowdownAutoBuyCountdown,
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        isSlowdownUnlocked,
        devSlowdownAutobuyOn,
        ascensionAutobuyIncludesSlowdown,
        getAutoBuyUnlocked,
        getAutoBuyEnabledByHand,
        setHandEarningBalance,
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        addToLog,
        setSlowdownBaseLevel,
        resetSpeedLevelForCompaction,
        getHands,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        formatUpgradeAffordEtaLine,
        flashSpeedAutobuyToast,
        setBatchedUpgradeUiFlush,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateRateDisplay,
        updateHandUpgradeScrollHint,
        getAutoBuyDelaySeconds,
        onSlowdownUnlockedFirstUi
    } = deps;

    function getSlowdownEffectText(level) {
        if (level <= 0) return "No Compaction";
        return (
            "+" +
            formatCount(getSlowdownMultiplierForLevel(level)) +
            "× tick value; digit speed scales with Speed upgrades"
        );
    }

    function updateSlowdownUpgradeUIFn() {
        const unlocked = isSlowdownUnlocked();
        if (unlocked) onSlowdownUnlockedFirstUi();
        const unlockedHands = getUnlockedHands();
        const slowdownLevel = getSlowdownLevel();
        const slowdownBonusLevel = getSlowdownBonusLevel();
        for (let i = 0; i < unlockedHands; i++) {
            const ref = getSpeedRowRefs()[i];
            if (!ref || !ref.slowdownWrapEl) continue;
            if (!unlocked) {
                ref.slowdownWrapEl.style.display = "none";
                if (ref.slowdownBtn) ref.slowdownBtn.classList.remove("upgrade-btn--afford-pulse");
                continue;
            }
            ref.slowdownWrapEl.style.display = "";
            const level = slowdownLevel[i] ?? 0;
            const bonusLevel = slowdownBonusLevel[i] ?? 0;
            const effectiveLevel = getEffectiveUpgradeLevel(level, bonusLevel);
            const nextLevel = level + 1;
            const cap = getMaxSlowdownLevelCap();
            const cost = level >= cap ? null : getSlowdownUpgradeCost(nextLevel);
            const balance = getHandEarnings(i);
            const canAfford = cost !== null && balance >= cost;
            if (level >= cap) {
                if (ref.slowdownLevelEl) {
                    ref.slowdownLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.slowdownLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                ref.slowdownBtn.style.display = "";
                ref.slowdownBtn.disabled = true;
                setUpgradeButtonProgress(ref.slowdownBtn, 1);
                ref.slowdownBtn.classList.add("upgrade-btn-maxed");
                ref.slowdownBtn.classList.remove("upgrade-btn--afford-pulse");
                setUpgradeTooltipText(
                    ref.slowdownBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: MAX\nEffect: " +
                        getSlowdownEffectText(effectiveLevel)
                );
                const slowLbl = ref.slowdownBtn && ref.slowdownBtn.querySelector(".upgrade-btn-label");
                if (slowLbl) slowLbl.textContent = level > 0 ? "" : "Compaction";
            } else {
                if (ref.slowdownLevelEl) {
                    ref.slowdownLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.slowdownLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                const slowLbl = ref.slowdownBtn && ref.slowdownBtn.querySelector(".upgrade-btn-label");
                if (slowLbl) slowLbl.textContent = level > 0 ? "" : "Compaction";
                ref.slowdownBtn.style.display = "";
                ref.slowdownBtn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.slowdownBtn, progress);
                ref.slowdownBtn.classList.remove("upgrade-btn-maxed");
                ref.slowdownBtn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(
                    ref.slowdownBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: " +
                        formatCount(balance) +
                        " / " +
                        formatCount(cost) +
                        "\nEffect next base: " +
                        getSlowdownEffectText(nextLevel) +
                        formatUpgradeAffordEtaLine(balance, cost, i)
                );
            }
        }
        updateHandUpgradeScrollHint();
    }

    function buySlowdownUpgradeForHand(handIndex, originEl, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        if (!isSlowdownUnlocked()) return;
        const slowdownLevelArr = getSlowdownLevel();
        const level = slowdownLevelArr[handIndex] ?? 0;
        const cap = getMaxSlowdownLevelCap();
        if (level >= cap) return;
        const nextLevel = level + 1;
        const cost = getSlowdownUpgradeCost(nextLevel);
        if (cost === null) return;
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        setSlowdownBaseLevel(handIndex, nextLevel);
        resetSpeedLevelForCompaction(handIndex);
        const handNum = handIndex + 1;
        if (!(opts && opts.silentLog)) {
            addToLog("Compaction purchased for Hand " + handNum + " (level " + nextLevel + "). Speed level reset.", "system");
        }
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        const targetHand = getHands()[handIndex];
        if (targetHand) targetHand.tickAccBig = 0n;
        const rowRefs = getSpeedRowRefs();
        const origin =
            originEl ||
            (rowRefs[handIndex] && rowRefs[handIndex].slowdownBtn && rowRefs[handIndex].slowdownBtn.closest(".speed-upgrade-row"));
        if (origin && !(opts && opts.fromAutobuy)) {
            sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUIFn();
            updateRateDisplay();
        }
    }

    function maybeAutoBuySlowdown() {
        if (!isSlowdownUnlocked()) return;
        const useDev = devSlowdownAutobuyOn();
        const useAsc = !useDev && ascensionAutobuyIncludesSlowdown() && getAutoBuyUnlocked();
        if (!useDev && !useAsc) return;
        const unlockedHands = getUnlockedHands();
        const slowdownAutoBuyCountdownByHand = getSlowdownAutoBuyCountdownByHand();
        while (slowdownAutoBuyCountdownByHand.length < unlockedHands) slowdownAutoBuyCountdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay = useDev ? DEV_SLOWDOWN_AUTOBUY_DELAY : getAutoBuyDelaySeconds();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!getAutoBuyEnabledByHand(i)) continue;
            }
            const slowdownLevelArr = getSlowdownLevel();
            const level = slowdownLevelArr[i] ?? 0;
            const cap = getMaxSlowdownLevelCap();
            if (level >= cap) continue;
            const nextLevel = level + 1;
            const cost = getSlowdownUpgradeCost(nextLevel);
            const canAfford = cost !== null && getHandEarnings(i) >= cost;
            let countdown = slowdownAutoBuyCountdownByHand[i] || 0;
            if (countdown > 0) {
                setSlowdownAutoBuyCountdown(i, countdown - dtSec);
                const nextCd = slowdownAutoBuyCountdownByHand[i] || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        buySlowdownUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        flashSpeedAutobuyToast(i, "Compact " + (getSlowdownLevel()[i] | 0));
                        const lv = getSlowdownLevel()[i] ?? 0;
                        const nextCost = lv >= cap ? null : getSlowdownUpgradeCost(lv + 1);
                        const stillCanAfford = nextCost !== null && getHandEarnings(i) >= nextCost;
                        setSlowdownAutoBuyCountdown(i, stillCanAfford ? tickDelay : 0);
                    } else {
                        setSlowdownAutoBuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                setSlowdownAutoBuyCountdown(i, tickDelay);
            }
        }
    }

    return {
        buySlowdownUpgradeForHand,
        maybeAutoBuySlowdown,
        updateSlowdownUpgradeUI: updateSlowdownUpgradeUIFn
    };
}
