import { GAME_LOOP_MS } from "./n1-game-loop.js";
import { DEV_CHEAPEN_AUTOBUY_DELAY, getCheapenEffectTextForAchievedLevel, getEffectiveUpgradeLevel } from "./n1-upgrades.js";

/** Cheapen column UI, purchase, and autobuy; arrays + unlock flag live in boot via deps. */
export function createNumber1CheapenBoot(deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getHandEarnings,
        getCheapenLevel,
        getCheapenBonusLevel,
        getCheapenSectionUnlocked,
        setCheapenSectionUnlocked,
        getCheapenAutoBuyCountdownByHand,
        setCheapenAutoBuyCountdown,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        devCheapenAutobuyOn,
        ascensionAutobuyIncludesCheapen,
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
        getCheapenEffectText,
        setCheapenBaseLevel,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        formatUpgradeAffordEtaLine,
        flashSpeedAutobuyToast,
        setBatchedUpgradeUiFlush,
        updateSpeedUpgradeUI,
        updateSlowdownUpgradeUI,
        updateRateDisplay,
        ensureSpeedRows,
        updateHandUpgradeScrollHint,
        getAutoBuyDelaySeconds
    } = deps;

    function updateCheapenUpgradeUI() {
        const hand1Balance = getHandEarnings(0);
        if (!getCheapenSectionUnlocked() && hand1Balance >= 1000) {
            setCheapenSectionUnlocked(true);
            ensureSpeedRows();
        }
        if (!getCheapenSectionUnlocked()) {
            const speedRowRefs = getSpeedRowRefs();
            for (let i = 0; i < speedRowRefs.length; i++) {
                const ref = speedRowRefs[i];
                if (ref && ref.cheapenWrapEl) ref.cheapenWrapEl.style.display = "none";
                if (ref && ref.cheapenBtn) ref.cheapenBtn.classList.remove("upgrade-btn--afford-pulse");
            }
            updateHandUpgradeScrollHint();
            return;
        }
        const unlockedHands = getUnlockedHands();
        const cheapenLevel = getCheapenLevel();
        const cheapenBonusLevel = getCheapenBonusLevel();
        for (let i = 0; i < unlockedHands; i++) {
            const ref = getSpeedRowRefs()[i];
            if (!ref || !ref.cheapenWrapEl) continue;
            ref.cheapenWrapEl.style.display = "";
            const level = cheapenLevel[i] ?? 0;
            const bonusLevel = cheapenBonusLevel[i] ?? 0;
            const effectiveLevel = getEffectiveUpgradeLevel(level, bonusLevel);
            const nextLevel = level + 1;
            const cap = getMaxCheapenLevel();
            const cost = level >= cap ? null : getCheapenUpgradeCost(i, nextLevel);
            const balance = getHandEarnings(i);
            const canAfford = cost !== null && balance >= cost;
            if (level >= cap) {
                if (ref.cheapenLevelEl) {
                    ref.cheapenLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.cheapenLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                ref.cheapenBtn.style.display = "";
                ref.cheapenBtn.disabled = true;
                setUpgradeButtonProgress(ref.cheapenBtn, 1);
                ref.cheapenBtn.classList.add("upgrade-btn-maxed");
                ref.cheapenBtn.classList.remove("upgrade-btn--afford-pulse");
                setUpgradeTooltipText(
                    ref.cheapenBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: MAX\nEffect: " +
                        getCheapenEffectTextForAchievedLevel(effectiveLevel)
                );
                const cheapenLbl = ref.cheapenBtn && ref.cheapenBtn.querySelector(".upgrade-btn-label");
                if (cheapenLbl) cheapenLbl.textContent = level > 0 ? "" : "Cheapen";
            } else {
                if (ref.cheapenLevelEl) {
                    ref.cheapenLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.cheapenLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                const cheapenLbl = ref.cheapenBtn && ref.cheapenBtn.querySelector(".upgrade-btn-label");
                if (cheapenLbl) cheapenLbl.textContent = level > 0 ? "" : "Cheapen";
                ref.cheapenBtn.style.display = "";
                ref.cheapenBtn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.cheapenBtn, progress);
                ref.cheapenBtn.classList.remove("upgrade-btn-maxed");
                ref.cheapenBtn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(
                    ref.cheapenBtn,
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
                        getCheapenEffectText(nextLevel) +
                        formatUpgradeAffordEtaLine(balance, cost, i)
                );
            }
        }
        updateHandUpgradeScrollHint();
    }

    function buyCheapenUpgradeForHand(handIndex, confettiOriginEl, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const cheapenLevelArr = getCheapenLevel();
        const level = cheapenLevelArr[handIndex] ?? 0;
        if (level >= getMaxCheapenLevel()) return;
        const nextLevel = level + 1;
        const cost = getCheapenUpgradeCost(handIndex, nextLevel);
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        setCheapenBaseLevel(handIndex, level + 1);
        const handNum = handIndex + 1;
        const lvlNow = getCheapenLevel()[handIndex];
        if (!(opts && opts.silentLog)) addToLog("Speed cheapen purchased for Hand " + handNum + " (level " + lvlNow + ")", "system");
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        const rowRefs = getSpeedRowRefs();
        const origin =
            confettiOriginEl ||
            (rowRefs[handIndex] && rowRefs[handIndex].cheapenBtn && rowRefs[handIndex].cheapenBtn.closest(".speed-upgrade-row"));
        if (origin && !(opts && opts.fromAutobuy)) {
            sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        }
    }

    function maybeAutoBuyCheapen() {
        const useDev = devCheapenAutobuyOn();
        const useAsc = !useDev && ascensionAutobuyIncludesCheapen() && getAutoBuyUnlocked();
        if (!useDev && !useAsc) return;
        const unlockedHands = getUnlockedHands();
        const cheapenAutoBuyCountdownByHand = getCheapenAutoBuyCountdownByHand();
        while (cheapenAutoBuyCountdownByHand.length < unlockedHands) cheapenAutoBuyCountdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay = useDev ? DEV_CHEAPEN_AUTOBUY_DELAY : getAutoBuyDelaySeconds();
        const cheapenLevelArr = getCheapenLevel();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!getAutoBuyEnabledByHand(i)) continue;
                if (!getCheapenSectionUnlocked()) continue;
            }
            const level = cheapenLevelArr[i] ?? 0;
            if (level >= getMaxCheapenLevel()) continue;
            const nextLevel = level + 1;
            const cost = getCheapenUpgradeCost(i, nextLevel);
            const canAfford = getHandEarnings(i) >= cost;
            let countdown = cheapenAutoBuyCountdownByHand[i] || 0;
            if (countdown > 0) {
                setCheapenAutoBuyCountdown(i, countdown - dtSec);
                const nextCd = cheapenAutoBuyCountdownByHand[i] || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        buyCheapenUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        flashSpeedAutobuyToast(i, "Cheapen " + (getCheapenLevel()[i] | 0));
                        const stillCanAfford = getHandEarnings(i) >= getCheapenUpgradeCost(i, getCheapenLevel()[i] + 1);
                        setCheapenAutoBuyCountdown(
                            i,
                            stillCanAfford && getCheapenLevel()[i] < getMaxCheapenLevel() ? tickDelay : 0
                        );
                    } else {
                        setCheapenAutoBuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                setCheapenAutoBuyCountdown(i, tickDelay);
            }
        }
    }

    return {
        buyCheapenUpgradeForHand,
        maybeAutoBuyCheapen,
        updateCheapenUpgradeUI
    };
}
