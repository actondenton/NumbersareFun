import { clampFiniteNonNegative } from "./n1-rate.js";
import {
    TIME_WARP_MANUAL_CLICK_SCALE,
    TIME_WARP_UNLOCK_COUNT,
    WARP_POTENCY_TIER1_SEC,
    WARP_POTENCY_TIER2_SEC,
    WARP_POTENCY_TIER3_SEC,
    applyTimeWarpDelayReductionCountdown,
    getAscensionComboTimeWarpDelayReductionPerTriggerSecFromTotals,
    getTimeWarpAuraSpawnSpanMaxSecFromTotals,
    getTimeWarpOverflowRatioFromTotals,
    getTimeWarpProductionSecondsBonusFromTotals,
    getWarpPotencyMaxTiersFromTotals,
    getWarpPotencyMultiplierForTier,
    getWarpPotencyTier
} from "./n1-time-warp.js";

const TIME_WARP_SCREEN_FX_MS = 960;

/** Time Warp aura runtime + aura DOM; rules live in `n1-time-warp.js`. */
export function createNumber1TimeWarpBoot(deps) {
    let afterWarpAssistDomFlush = function() {};

    function wireAfterWarpAssist(fn) {
        afterWarpAssistDomFlush = fn;
    }

    function twActive() {
        return deps.getTimeWarpAuraActiveByHand();
    }

    function twAppeared() {
        return deps.getTimeWarpAuraAppearedAtMsByHand();
    }

    function isTimeWarpUnlocked() {
        return deps.getTotalChanges() >= TIME_WARP_UNLOCK_COUNT;
    }

    function ensureTimeWarpArrays() {
        const active = twActive();
        const appeared = twAppeared();
        const n = deps.getUnlockedHands();
        while (active.length < n) active.push(false);
        while (appeared.length < n) appeared.push(0);
    }

    function handHasActiveTimeWarpAura(handIndex) {
        if (handIndex < 0 || handIndex >= deps.getUnlockedHands() || !isTimeWarpUnlocked()) return false;
        ensureTimeWarpArrays();
        return !!twActive()[handIndex];
    }

    function handContributesTimeWarpPriority(handIndex) {
        return handHasActiveTimeWarpAura(handIndex) ? 1 : 0;
    }

    function handContributesToScrollHint(handIndex) {
        if (handHasActiveTimeWarpAura(handIndex)) return true;
        return deps.handScrollHintHasUpgradeReason(handIndex);
    }

    function getWarpPotencyMaxTiersEffective() {
        return getWarpPotencyMaxTiersFromTotals(deps.computeAscensionGrantTotals());
    }

    function getWarpPotencyTierForHandNow(handIndex, nowMs) {
        const cap = getWarpPotencyMaxTiersEffective();
        if (cap <= 0) return 0;
        if (handIndex < 0 || handIndex >= deps.getUnlockedHands() || !isTimeWarpUnlocked()) return 0;
        ensureTimeWarpArrays();
        if (!twActive()[handIndex]) return 0;
        const t0 = twAppeared()[handIndex];
        if (!(t0 > 0)) return 0;
        const elapsedSec = (nowMs - t0) / 1000;
        return getWarpPotencyTier(elapsedSec, cap);
    }

    function getWarpPotencyMultiplierForHandNow(handIndex, nowMs) {
        return getWarpPotencyMultiplierForTier(getWarpPotencyTierForHandNow(handIndex, nowMs));
    }

    function getTimeWarpAuraSpawnSpanMaxSec() {
        return getTimeWarpAuraSpawnSpanMaxSecFromTotals(deps.computeAscensionGrantTotals());
    }

    function scheduleNextTimeWarpSpawn() {
        deps.setTimeWarpNextSpawnInSec(Math.random() * getTimeWarpAuraSpawnSpanMaxSec());
    }

    function getTimeWarpProductionSecondsBonus() {
        return getTimeWarpProductionSecondsBonusFromTotals(deps.computeAscensionGrantTotals());
    }

    function getTimeWarpGrantForHand(handIndex, scale) {
        const effectiveCps = clampFiniteNonNegative(
            deps.getHandPerHandRawCps(handIndex) * deps.getTimeWarpComboMultiplier() * deps.getTurboCountMultiplier()
                * deps.getNumber1BlackHoleProductionMult()
        );
        const secBonus = getTimeWarpProductionSecondsBonus();
        return Math.max(1, Math.round(effectiveCps * secBonus * (scale || 1)));
    }

    function applyTimeWarpGrant(handIndex, scale, reasonLabel, opts) {
        opts = opts || {};
        if (handIndex < 0 || handIndex >= deps.getUnlockedHands()) return;
        const gain = getTimeWarpGrantForHand(handIndex, scale);
        deps.setHandEarningBalance(handIndex, deps.getHandEarnings(handIndex) + gain);
        deps.refreshTotalFromHandEarnings();
        const inc = deps.getIncrementalCountEl();
        if (inc) inc.textContent = deps.formatCount(deps.getTotalChanges());
        deps.updateObjectives();
        deps.updateSpeedUpgradeUI();
        deps.updateCheapenUpgradeUI();
        deps.updateSlowdownUpgradeUI();
        deps.updateRateDisplay();
        updateTimeWarpAuraUI();
        if (!opts.silentLog) {
            deps.addToLog(
                "Time Warp " + (reasonLabel || "activated") + " on Hand " + (handIndex + 1) + " for +" + deps.formatCount(gain) + ".",
                "milestone"
            );
        }
    }

    function tryGrantAscensionBonusEssenceFromWarp(sourceLabel, opts) {
        opts = opts || {};
        if (!deps.getNumber1HasAscended()) return false;
        const t = deps.computeAscensionGrantTotals();
        const chance = sourceLabel === "overflow"
            ? (Number(t.warpOverflowAscensionEssenceChance) || 0)
            : (Number(t.warpClickAscensionEssenceChance) || 0);
        if (!(chance > 0) || Math.random() >= chance) return false;
        deps.setAscensionPendingBonusEssence(deps.getAscensionPendingBonusEssence() + 1);
        deps.updateMilestoneUI();
        deps.refreshOverviewAndAscensionHubLiveIfOpen();
        deps.autosaveNow();
        if (!opts.silentLog) {
            deps.addToLog(
                "Warp essence bonus: banked +1 Ascension Essence for your next ascend (" + sourceLabel + " trigger).",
                "milestone"
            );
        }
        return true;
    }

    function applyTimeWarpOverflowToAllHands(ratio, opts) {
        opts = opts || {};
        const unlockedHands = deps.getUnlockedHands();
        if (unlockedHands <= 0) return;
        const pct = (ratio * 100).toFixed(0);
        const bits = [];
        for (let i = 0; i < unlockedHands; i++) {
            const gain = getTimeWarpGrantForHand(i, ratio);
            deps.setHandEarningBalance(i, deps.getHandEarnings(i) + gain);
            bits.push("H" + (i + 1) + " +" + deps.formatCount(gain));
        }
        deps.refreshTotalFromHandEarnings();
        const inc = deps.getIncrementalCountEl();
        if (inc) inc.textContent = deps.formatCount(deps.getTotalChanges());
        deps.updateObjectives();
        deps.updateSpeedUpgradeUI();
        deps.updateCheapenUpgradeUI();
        deps.updateSlowdownUpgradeUI();
        deps.updateRateDisplay();
        updateTimeWarpAuraUI();
        if (!opts.silentLog) {
            deps.addToLog(
                "Time Warp overflow (all hands, " + pct + "% of each hand's rate — Warp Factor 36): " + bits.join(" · ") + ".",
                "milestone"
            );
        }
    }

    function applyTimeWarpManualAutoBuyAssistForHand(handIndex) {
        if (handIndex < 0 || handIndex >= deps.getUnlockedHands()) return;
        if (!deps.computeAscensionGrantTotals().warpAutoBuyAssist) return;
        const buyOpts = { fromAutobuy: true, silentLog: true, skipUpgradeDom: true };
        const speedLevel = deps.getSpeedLevel();
        const cheapenLevel = deps.getCheapenLevel();
        const slowdownLevel = deps.getSlowdownLevel();
        const sl0 = speedLevel[handIndex] ?? 0;
        const ch0 = cheapenLevel[handIndex] ?? 0;
        const sd0 = slowdownLevel[handIndex] ?? 0;
        let guard = 0;
        while (guard++ < 400) {
            let progressed = false;
            let inner = 0;
            while (inner++ < 500) {
                const ch = cheapenLevel[handIndex] ?? 0;
                if (ch >= deps.getMaxCheapenLevel()) break;
                const nextCh = ch + 1;
                const cCost = deps.getCheapenUpgradeCost(handIndex, nextCh);
                if ((deps.getHandEarnings(handIndex) || 0) < cCost) break;
                deps.buyCheapenUpgradeForHand(handIndex, null, buyOpts);
                progressed = true;
            }
            inner = 0;
            while (inner++ < 5000) {
                const nextSp = speedLevel[handIndex] + 1;
                const sCost = deps.getUpgradeCost(handIndex, nextSp);
                if ((deps.getHandEarnings(handIndex) || 0) < sCost) break;
                deps.buySpeedUpgradeForHand(handIndex, buyOpts);
                progressed = true;
            }
            if (deps.isSlowdownUnlocked()) {
                const sd = slowdownLevel[handIndex] ?? 0;
                if (sd < deps.getMaxSlowdownLevelCap()) {
                    const nextSd = sd + 1;
                    const dCost = deps.getSlowdownUpgradeCost(nextSd);
                    if (dCost != null && (deps.getHandEarnings(handIndex) || 0) >= dCost) {
                        deps.buySlowdownUpgradeForHand(handIndex, null, buyOpts);
                        progressed = true;
                    }
                }
            }
            if (!progressed) break;
        }
        deps.flushAutobuyDeferredTotalsIfAny();
        const any = (speedLevel[handIndex] ?? 0) !== sl0 || (cheapenLevel[handIndex] ?? 0) !== ch0 || (slowdownLevel[handIndex] ?? 0) !== sd0;
        if (any) {
            afterWarpAssistDomFlush();
            deps.addToLog("Warp auto buy assist: bought upgrades for Hand " + (handIndex + 1) + " after your manual Time Warp.", "system");
        }
    }

    function updateTimeWarpAuraUI() {
        const unlocked = isTimeWarpUnlocked();
        ensureTimeWarpArrays();
        const active = twActive();
        const twSec = getTimeWarpProductionSecondsBonus();
        const nowMs = Date.now();
        const potencyUnlocked = getWarpPotencyMaxTiersEffective() > 0;
        const n = deps.getUnlockedHands();
        const refs = deps.getSpeedRowRefs();
        for (let i = 0; i < n; i++) {
            const ref = refs[i];
            if (!ref || !ref.timeWarpAuraBtn) continue;
            const isActive = unlocked && !!active[i];
            ref.timeWarpAuraBtn.style.display = isActive ? "" : "none";
            const hi = i + 1;
            const btn = ref.timeWarpAuraBtn;
            btn.classList.remove("time-warp-aura-btn--potency-1", "time-warp-aura-btn--potency-2", "time-warp-aura-btn--potency-3");
            let titleExtra = "";
            let ariaExtra = "";
            if (isActive && potencyUnlocked) {
                const tier = getWarpPotencyTierForHandNow(i, nowMs);
                const cap = getWarpPotencyMaxTiersEffective();
                if (tier >= 3) {
                    btn.classList.add("time-warp-aura-btn--potency-3");
                    titleExtra = " — ×8 potency (idle " + WARP_POTENCY_TIER3_SEC + "s+)";
                    ariaExtra = ", ×8 potency charged";
                } else if (tier >= 2) {
                    btn.classList.add("time-warp-aura-btn--potency-2");
                    titleExtra = " — ×4 potency (idle " + WARP_POTENCY_TIER2_SEC + "s+)";
                    ariaExtra = ", ×4 potency charged";
                } else if (tier >= 1) {
                    btn.classList.add("time-warp-aura-btn--potency-1");
                    titleExtra = " — ×2 potency (idle " + WARP_POTENCY_TIER1_SEC + "s+)";
                    ariaExtra = ", ×2 potency charged";
                } else if (cap >= 3) {
                    titleExtra = " — charging: ×2 after " + WARP_POTENCY_TIER1_SEC + "s idle, ×4 after " + WARP_POTENCY_TIER2_SEC + "s, ×8 after " + WARP_POTENCY_TIER3_SEC + "s";
                    ariaExtra = "; charges ×2 / ×4 / ×8 when left unclicked";
                } else if (cap >= 2) {
                    titleExtra = " — charging: ×2 after " + WARP_POTENCY_TIER1_SEC + "s idle, ×4 after " + WARP_POTENCY_TIER2_SEC + "s";
                    ariaExtra = "; charges ×2 / ×4 when left unclicked";
                } else {
                    titleExtra = " — charging: ×2 after " + WARP_POTENCY_TIER1_SEC + "s idle";
                    ariaExtra = "; charges ×2 when left unclicked";
                }
            }
            btn.setAttribute(
                "aria-label",
                "Activate Time Warp on hand " + hi + ": " + TIME_WARP_MANUAL_CLICK_SCALE + "× " + twSec + " seconds of production" + ariaExtra
            );
            btn.title = "Grants " + TIME_WARP_MANUAL_CLICK_SCALE + "× " + twSec + "s of this hand's effective rate" + titleExtra;
        }
        deps.scheduleHandUpgradeScrollHintUpdate();
    }

    function playTimeWarpScreenEffect(anchorEl) {
        if (!anchorEl || !(anchorEl instanceof Element)) return;
        const r = anchorEl.getBoundingClientRect();
        if (r.width <= 0 && r.height <= 0) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const wrap = document.createElement("div");
        wrap.className = "time-warp-screen-fx";
        wrap.setAttribute("aria-hidden", "true");
        wrap.style.setProperty("--tw-x", cx + "px");
        wrap.style.setProperty("--tw-y", cy + "px");
        wrap.innerHTML =
            "<div class=\"time-warp-screen-fx-vignette\"></div>" +
            "<div class=\"time-warp-screen-fx-twist\"></div>" +
            "<div class=\"time-warp-screen-fx-spiral\"></div>";
        document.body.appendChild(wrap);
        window.setTimeout(() => {
            if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        }, TIME_WARP_SCREEN_FX_MS);
    }

    function activateTimeWarpAuraForHand(handIndex) {
        ensureTimeWarpArrays();
        const active = twActive();
        const appeared = twAppeared();
        if (!isTimeWarpUnlocked()) return;
        if (!active[handIndex]) return;
        const nowMs = Date.now();
        const potencyMult = getWarpPotencyMultiplierForHandNow(handIndex, nowMs);
        active[handIndex] = false;
        appeared[handIndex] = 0;
        deps.markMeaningfulProgress();
        let reason = "aura (" + TIME_WARP_MANUAL_CLICK_SCALE + "× manual)";
        if (potencyMult > 1) reason += ", ×" + potencyMult + " potency";
        applyTimeWarpGrant(handIndex, TIME_WARP_MANUAL_CLICK_SCALE * potencyMult, reason);
        tryGrantAscensionBonusEssenceFromWarp("manual");
        applyTimeWarpManualAutoBuyAssistForHand(handIndex);
    }

    function updateTimeWarpSystem(dtSec) {
        if (!isTimeWarpUnlocked()) return;
        ensureTimeWarpArrays();
        if (!deps.getTimeWarpUnlockLogged()) {
            deps.setTimeWarpUnlockLogged(true);
            deps.addToLog("Time Warp system unlocked (auras can now appear).", "milestone");
        }
        let next = deps.getTimeWarpNextSpawnInSec();
        if (next <= 0) scheduleNextTimeWarpSpawn();
        next = deps.getTimeWarpNextSpawnInSec();
        next -= dtSec;
        deps.setTimeWarpNextSpawnInSec(next);
        if (next > 0) {
            updateTimeWarpAuraUI();
            return;
        }
        const active = twActive();
        const appeared = twAppeared();
        const unlockedHands = deps.getUnlockedHands();
        const available = [];
        for (let i = 0; i < unlockedHands; i++) {
            if (!active[i]) available.push(i);
        }
        if (available.length > 0) {
            const idx = available[Math.floor(Math.random() * available.length)];
            active[idx] = true;
            appeared[idx] = Date.now();
            deps.addToLog("A Time Warp aura appeared on Hand " + (idx + 1) + ".", "milestone");
        } else if (unlockedHands > 0) {
            const twTotals = deps.computeAscensionGrantTotals();
            const ratio = getTimeWarpOverflowRatioFromTotals(twTotals);
            if (twTotals.warpFactor36AllHandsOverflow) applyTimeWarpOverflowToAllHands(ratio, { silentLog: true });
            else {
                const idx = Math.floor(Math.random() * unlockedHands);
                applyTimeWarpGrant(idx, ratio, "overflow", { silentLog: true });
            }
            tryGrantAscensionBonusEssenceFromWarp("overflow", { silentLog: true });
        }
        scheduleNextTimeWarpSpawn();
        updateTimeWarpAuraUI();
    }

    function getAscensionComboTimeWarpDelayReductionPerTriggerSec() {
        return getAscensionComboTimeWarpDelayReductionPerTriggerSecFromTotals(deps.computeAscensionGrantTotals());
    }

    function applyAscensionComboTimeWarpDelayReduction(newComboTriggerCount) {
        if (newComboTriggerCount <= 0 || !isTimeWarpUnlocked()) return;
        const per = getAscensionComboTimeWarpDelayReductionPerTriggerSec();
        if (per <= 0) return;
        deps.setTimeWarpNextSpawnInSec(
            applyTimeWarpDelayReductionCountdown(deps.getTimeWarpNextSpawnInSec(), newComboTriggerCount, per)
        );
    }

    return {
        wireAfterWarpAssist,
        isTimeWarpUnlocked,
        handHasActiveTimeWarpAura,
        handContributesTimeWarpPriority,
        handContributesToScrollHint,
        ensureTimeWarpArrays,
        getWarpPotencyMaxTiersEffective,
        getWarpPotencyTierForHandNow,
        getWarpPotencyMultiplierForHandNow,
        scheduleNextTimeWarpSpawn,
        getTimeWarpProductionSecondsBonus,
        getTimeWarpGrantForHand,
        applyTimeWarpGrant,
        tryGrantAscensionBonusEssenceFromWarp,
        applyTimeWarpOverflowToAllHands,
        applyTimeWarpManualAutoBuyAssistForHand,
        updateTimeWarpAuraUI,
        playTimeWarpScreenEffect,
        activateTimeWarpAuraForHand,
        updateTimeWarpSystem,
        getAscensionComboTimeWarpDelayReductionPerTriggerSec,
        applyAscensionComboTimeWarpDelayReduction
    };
}
