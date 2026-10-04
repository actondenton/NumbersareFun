import { GAME_LOOP_MS } from "../loop/n1-game-loop.js";
import { getEffectiveUpgradeLevel } from "./n1-upgrades.js";

/**
 * Generic capped per-hand upgrade track (cheapen / compaction).
 * Track-specific behavior lives in `def`; shared economy/UI helpers in `deps`.
 *
 * @param {object} def
 * @param {object} deps
 */
export function createUpgradeTrack(def, deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getHandEarnings,
        setHandEarningBalance,
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        addToLog,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        formatUpgradeAffordEtaLine,
        flashSpeedAutobuyToast,
        setBatchedUpgradeUiFlush,
        refreshUpgradeColumnsUi,
        scheduleHandUpgradeScrollHintUpdate,
        getAutoBuyUnlocked,
        getAutoBuyEnabledByHand,
        getAutoBuyDelaySeconds
    } = deps;

    const wrapKey = def.wrapKey;
    const btnKey = def.btnKey;
    const levelKey = def.levelKey;

    function updateUpgradeUI() {
        if (typeof def.beforeUpdateUi === "function") def.beforeUpdateUi();
        const unlocked = def.isTrackUnlocked();
        if (unlocked && typeof def.onTrackUnlockedUi === "function") def.onTrackUnlockedUi();
        if (!unlocked) {
            const speedRowRefs = getSpeedRowRefs();
            for (let i = 0; i < speedRowRefs.length; i++) {
                const ref = speedRowRefs[i];
                if (ref && ref[wrapKey]) ref[wrapKey].style.display = "none";
                if (ref && ref[btnKey]) ref[btnKey].classList.remove("upgrade-btn--afford-pulse");
            }
            scheduleHandUpgradeScrollHintUpdate();
            return;
        }
        const unlockedHands = getUnlockedHands();
        const baseLevels = def.getBaseLevels();
        const bonusLevels = def.getBonusLevels();
        const cap = def.getCap();
        for (let i = 0; i < unlockedHands; i++) {
            const ref = getSpeedRowRefs()[i];
            if (!ref || !ref[wrapKey]) continue;
            ref[wrapKey].style.display = "";
            const level = baseLevels[i] ?? 0;
            const bonusLevel = bonusLevels[i] ?? 0;
            const effectiveLevel = getEffectiveUpgradeLevel(level, bonusLevel);
            const nextLevel = level + 1;
            const cost = level >= cap ? null : def.getCost(i, nextLevel);
            const balance = getHandEarnings(i);
            const canAfford = cost !== null && balance >= cost;
            const btn = ref[btnKey];
            const levelEl = ref[levelKey];
            if (levelEl) {
                levelEl.innerHTML =
                    level > 0 || bonusLevel > 0
                        ? level +
                          "/" +
                          cap +
                          (bonusLevel > 0
                              ? ' <span class="speed-level-bonus" title="Clap bonus">+' +
                                bonusLevel +
                                "</span>"
                              : "")
                        : "";
                levelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
            }
            const lbl = btn && btn.querySelector(".upgrade-btn-label");
            if (lbl) lbl.textContent = level > 0 ? "" : def.defaultLabel;
            if (btn) btn.style.display = "";
            if (level >= cap) {
                if (btn) {
                    btn.disabled = true;
                    setUpgradeButtonProgress(btn, 1);
                    btn.classList.add("upgrade-btn-maxed");
                    btn.classList.remove("upgrade-btn--afford-pulse");
                    setUpgradeTooltipText(
                        btn,
                        "Base level: " +
                            level +
                            "/" +
                            cap +
                            "\nBonus (clap): " +
                            bonusLevel +
                            "\nEffective: " +
                            effectiveLevel +
                            "\nBalance/Cost: MAX\nEffect: " +
                            def.formatEffectAchieved(effectiveLevel)
                    );
                }
            } else if (btn) {
                btn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(btn, progress);
                btn.classList.remove("upgrade-btn-maxed");
                btn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(
                    btn,
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
                        def.formatEffectNext(nextLevel) +
                        formatUpgradeAffordEtaLine(balance, cost, i)
                );
            }
        }
        scheduleHandUpgradeScrollHintUpdate();
    }

    function buyUpgradeForHand(handIndex, originEl, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        if (def.gateBuyByTrackUnlock !== false && !def.isTrackUnlocked()) return;
        const level = def.getBaseLevels()[handIndex] ?? 0;
        const cap = def.getCap();
        if (level >= cap) return;
        const nextLevel = level + 1;
        const cost = def.getCost(handIndex, nextLevel);
        if (cost === null) return;
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        def.applyPurchase(handIndex, nextLevel);
        if (typeof def.afterPurchase === "function") def.afterPurchase(handIndex, opts);
        const handNum = handIndex + 1;
        const lvlNow = def.getBaseLevels()[handIndex] ?? nextLevel;
        if (!(opts && opts.silentLog)) addToLog(def.formatLog(handNum, lvlNow), "system");
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        const rowRefs = getSpeedRowRefs();
        const origin =
            originEl ||
            (rowRefs[handIndex] &&
                rowRefs[handIndex][btnKey] &&
                rowRefs[handIndex][btnKey].closest(".speed-upgrade-row"));
        if (origin && !(opts && opts.fromAutobuy)) {
            sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            refreshUpgradeColumnsUi();
        }
    }

    function maybeAutoBuy() {
        if (def.gateAutobuyByTrackUnlock !== false && !def.isTrackUnlocked()) return;
        const useDev = typeof def.devAutobuyOn === "function" && def.devAutobuyOn();
        const useAsc =
            !useDev &&
            typeof def.ascensionAutobuyIncludes === "function" &&
            def.ascensionAutobuyIncludes() &&
            getAutoBuyUnlocked();
        if (!useDev && !useAsc) return;
        const unlockedHands = getUnlockedHands();
        const countdownByHand = def.getAutoBuyCountdownByHand();
        while (countdownByHand.length < unlockedHands) countdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay =
            useDev && typeof def.devAutobuyDelaySec === "number"
                ? def.devAutobuyDelaySec
                : getAutoBuyDelaySeconds();
        const cap = def.getCap();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!getAutoBuyEnabledByHand(i)) continue;
                if (typeof def.ascAutobuyHandGate === "function" && !def.ascAutobuyHandGate(i)) continue;
            }
            const level = def.getBaseLevels()[i] ?? 0;
            if (level >= cap) continue;
            const nextLevel = level + 1;
            const cost = def.getCost(i, nextLevel);
            const canAfford = cost !== null && getHandEarnings(i) >= cost;
            const countdown = countdownByHand[i] || 0;
            if (countdown > 0) {
                def.setAutoBuyCountdown(i, countdown - dtSec);
                const nextCd = countdownByHand[i] || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        buyUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        const lvlNow = def.getBaseLevels()[i] | 0;
                        flashSpeedAutobuyToast(i, def.autobuyToastPrefix + " " + lvlNow);
                        const lv = def.getBaseLevels()[i] ?? 0;
                        const nextCost = lv >= cap ? null : def.getCost(i, lv + 1);
                        const stillCanAfford = nextCost !== null && getHandEarnings(i) >= nextCost;
                        def.setAutoBuyCountdown(i, stillCanAfford && lv < cap ? tickDelay : 0);
                    } else {
                        def.setAutoBuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                def.setAutoBuyCountdown(i, tickDelay);
            }
        }
    }

    return { updateUpgradeUI, buyUpgradeForHand, maybeAutoBuy };
}
