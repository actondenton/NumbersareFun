// Number 1 Clap Module
// Merged from: n1-clap.js, n1-clap-tick.js

import { hands1 } from "./hands.js";

export const CLAP_UNLOCK_HANDS = 8;
export const CLAP_BONUS_CHANCE = 0.1;
export const CLAP_MAX_PAIRS_PER_TICK = 2;
export const CLAP_ANIM_STAGGER_MS = 220;
export const CLAP_COOLDOWN_MS = 10000;
/** Middle-branch Combo Claps: fixed 10% per roll (ascension nodes gate which rolls exist). */
export const COMBO_CLAP_INSTANT_CHANCE = 0.1;
export const COMBO_CLAP_CHAIN_MAX_WAVES = 64;
export const CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES = 64;
export const CLAP_BONUS_SLOWDOWN_CHAIN_MAX_WAVES = 64;

export function isClappingUnlockedForHands(unlockedHands) {
    return unlockedHands >= CLAP_UNLOCK_HANDS;
}

export function getClapCooldownMsFromTotals(totals) {
    const mult = (totals && totals.clapCooldownMult) || 1;
    return Math.max(2500, Math.floor(CLAP_COOLDOWN_MS * mult));
}

export function getClapBonusChanceFromTotals(totals) {
    return Math.min(0.95, CLAP_BONUS_CHANCE + ((totals && totals.clapBonusChanceAdd) || 0));
}

export function getClapCheapenBonusChanceFromTotals(totals) {
    return Math.min(0.95, Math.max(0, (totals && totals.clapCheapenBonusChanceAdd) || 0));
}

export function getClapSlowdownBonusChanceFromTotals(totals) {
    return Math.min(0.95, Math.max(0, (totals && totals.clapSlowdownBonusChanceAdd) || 0));
}

export function getClapEssenceProcChanceFromTotals(totals) {
    return Math.min(0.95, Math.max(0, (totals && totals.clapEssenceProcChanceAdd) || 0));
}

export function getClapEssenceProcMultiplierStepFromTotals(totals) {
    const step = Number((totals && totals.clapEssenceMultiplierStepAdd) || 0);
    return Math.max(0, step);
}

export function runChanceChain(extraUnlocked, chainUnlocked, maxWaves, onWave, rng) {
    if (!extraUnlocked || typeof onWave !== "function") return 0;
    const random = typeof rng === "function" ? rng : Math.random;
    if (random() >= COMBO_CLAP_INSTANT_CHANCE) return 0;
    let waves = 0;
    while (waves < maxWaves) {
        onWave();
        waves++;
        if (!chainUnlocked || random() >= COMBO_CLAP_INSTANT_CHANCE) break;
    }
    return waves;
}

export function createNumber1ClapTick(deps) {
    const {
        getUnlockedHands,
        getHands,
        computeAscensionGrantTotals,
        cheapenBonusLevel,
        slowdownBonusLevel,
        speedLevel,
        speedBonusLevel,
        clapCooldownUntilMsByHand,
        clapDigitPrevious,
        gameplaySimFrozen,
        addToLog,
        markMeaningfulProgress,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateRateDisplay,
        updateMilestoneUI,
        refreshOverviewAndAscensionHubLiveIfOpen,
        snapshotHandLedgerBonusDisplays,
        ledgerBeamAfterClapBonuses,
        settings,
        isPagePanelOpen,
        pagePanelEl,
        getNumber1AscensionClapEssenceMultiplier,
        applyClapEssenceMultiplierProc
    } = deps;

    function getClapCooldownMs() {
        return getClapCooldownMsFromTotals(computeAscensionGrantTotals());
    }
    function getClapBonusChance() {
        return getClapBonusChanceFromTotals(computeAscensionGrantTotals());
    }
    function isClappingUnlocked() {
        return isClappingUnlockedForHands(getUnlockedHands());
    }
    function getClapCheapenBonusChance() {
        return getClapCheapenBonusChanceFromTotals(computeAscensionGrantTotals());
    }
    function getClapSlowdownBonusChance() {
        return getClapSlowdownBonusChanceFromTotals(computeAscensionGrantTotals());
    }
    function getClapEssenceProcChance() {
        return getClapEssenceProcChanceFromTotals(computeAscensionGrantTotals());
    }
    function getClapEssenceProcMultiplierStep() {
        return getClapEssenceProcMultiplierStepFromTotals(computeAscensionGrantTotals());
    }
    function maybeRunThumbClapChain(extraUnlocked, chainUnlocked, maxWaves, onWave) {
        runChanceChain(extraUnlocked, chainUnlocked, maxWaves, onWave);
    }
    function grantClapBonusCheapenLevelForHand(handIndex) {
        const unlockedHands = getUnlockedHands();
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        cheapenBonusLevel[handIndex] = (cheapenBonusLevel[handIndex] || 0) + 1;
    }
    function grantClapBonusSlowdownLevelForHand(handIndex) {
        const unlockedHands = getUnlockedHands();
        const handsArr = getHands();
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        slowdownBonusLevel[handIndex] = (slowdownBonusLevel[handIndex] || 0) + 1;
        // Same functional reset behavior as buying a Compaction level: purchased speed levels are reset.
        speedLevel[handIndex] = 0;
        const h = handsArr[handIndex];
        if (h) h.tickAccBig = 0n;
    }
    function tryGrantClapEssenceMultiplierForHand(handIndex) {
        const unlockedHands = getUnlockedHands();
        if (handIndex < 0 || handIndex >= unlockedHands) return false;
        const chance = getClapEssenceProcChance();
        if (!(chance > 0) || Math.random() >= chance) return false;
        const step = getClapEssenceProcMultiplierStep();
        if (!(step > 0)) return false;
        applyClapEssenceMultiplierProc(step);
        return true;
    }
    function rollClapSpeedBonusesForPairHands(a, b, bonusHandsOneIndexed, logIfNeitherMiss) {
        const handsArr = getHands();
        let bonusA = false;
        let bonusB = false;
        if (Math.random() < getClapBonusChance()) {
            speedBonusLevel[a] = (speedBonusLevel[a] || 0) + 1;
            bonusHandsOneIndexed.push(a + 1);
            if (handsArr[a]) handsArr[a].tickAccBig = 0n;
            bonusA = true;
        }
        if (Math.random() < getClapBonusChance()) {
            speedBonusLevel[b] = (speedBonusLevel[b] || 0) + 1;
            bonusHandsOneIndexed.push(b + 1);
            if (handsArr[b]) handsArr[b].tickAccBig = 0n;
            bonusB = true;
        }
        if (logIfNeitherMiss && !bonusA && !bonusB) {
            addToLog("Clap! Hand " + (a + 1) + " and Hand " + (b + 1) + "—no bonus this time. Better luck next round.", "system");
        }
    }
    function maybeComboClapChainFromAscension(a, b, staggerStartMs, bonusHandsOneIndexed) {
        const asc = computeAscensionGrantTotals();
        if (!asc.comboClapExtraRoll || Math.random() >= COMBO_CLAP_INSTANT_CHANCE) return;
        let staggerMs = staggerStartMs;
        let chainCount = 0;
        while (true) {
            staggerMs += CLAP_ANIM_STAGGER_MS;
            playClapScreenAnimation(a, b, staggerMs);
            rollClapSpeedBonusesForPairHands(a, b, bonusHandsOneIndexed, false);
            chainCount++;
            if (!asc.comboClapChainRolls || chainCount >= COMBO_CLAP_CHAIN_MAX_WAVES) break;
            if (Math.random() >= COMBO_CLAP_INSTANT_CHANCE) break;
        }
    }
    function playClapScreenAnimation(handIndexA, handIndexB, staggerDelayMs) {
        function clapFxShouldDisplay() {
            if (settings.showClapAnimation === false) return false;
            if (typeof window.getCurrentNumberMode === "function" && window.getCurrentNumberMode() !== 1) return false;
            if (isPagePanelOpen() && pagePanelEl && (pagePanelEl.dataset.openPageId === "overview" || pagePanelEl.dataset.openPageId === "ascension"))
                return false;
            return true;
        }
        if (!clapFxShouldDisplay()) return;
        const root = document.getElementById("clap-animation-root");
        if (!root) return;
        const art5 = hands1[4];
        window.setTimeout(() => {
            if (!clapFxShouldDisplay()) return;
            const wrap = document.createElement("div");
            wrap.className = "clap-fx-burst";
            wrap.setAttribute("role", "presentation");
            wrap.style.setProperty("--clap-nudge-a", ((handIndexA * 7) % 24 - 12) + "px");
            wrap.style.setProperty("--clap-nudge-b", ((handIndexB * 11) % 24 - 12) + "px");
            const preL = document.createElement("pre");
            preL.className = "clap-fx-pre";
            preL.textContent = art5;
            const preR = document.createElement("pre");
            preR.className = "clap-fx-pre";
            preR.textContent = art5;
            const ha = document.createElement("div");
            ha.className = "clap-fx-hand clap-fx-hand--a";
            ha.appendChild(preL);
            const hb = document.createElement("div");
            hb.className = "clap-fx-hand clap-fx-hand--b";
            hb.appendChild(preR);
            wrap.appendChild(ha);
            wrap.appendChild(hb);
            root.appendChild(wrap);
            window.setTimeout(() => {
                if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
            }, 1100);
        }, staggerDelayMs);
    }
    function processClappingThisTick() {
        if (!isClappingUnlocked() || gameplaySimFrozen()) return;
        const clapLedgerSnapBefore = snapshotHandLedgerBonusDisplays();
        const nowMs = Date.now();
        function handOffClapCooldown(handIndex) {
            const until = clapCooldownUntilMsByHand[handIndex] || 0;
            return nowMs >= until;
        }
        const unlockedHands = getUnlockedHands();
        const handsArr = getHands();
        const current = [];
        for (let i = 0; i < unlockedHands; i++) current[i] = handsArr[i] ? handsArr[i].count : 0;
        const fives = [];
        for (let i = 0; i < unlockedHands; i++) {
            if (current[i] === 5) fives.push(i);
        }
        fives.sort((a, b) => a - b);
        const usedFiveSlot = new Array(fives.length).fill(false);
        let clapPairsThisTick = 0;
        let stagger = 0;
        const bonusHandsOneIndexed = [];
        const cheapenBonusHandsOneIndexed = [];
        const slowdownBonusHandsOneIndexed = [];
        let essenceProcCountThisTick = 0;
        const asc = computeAscensionGrantTotals();
        for (let ia = 0; ia < fives.length && clapPairsThisTick < CLAP_MAX_PAIRS_PER_TICK; ia++) {
            if (usedFiveSlot[ia]) continue;
            const a = fives[ia];
            for (let ib = ia + 1; ib < fives.length; ib++) {
                if (usedFiveSlot[ib]) continue;
                const b = fives[ib];
                const heldFromLastFrame = clapDigitPrevious[a] === 5 && clapDigitPrevious[b] === 5;
                // Both hands must be off cooldown; a cooling-down hand never claps with a ready hand.
                if (!heldFromLastFrame && handOffClapCooldown(a) && handOffClapCooldown(b)) {
                    usedFiveSlot[ia] = true;
                    usedFiveSlot[ib] = true;
                    clapPairsThisTick++;
                    playClapScreenAnimation(a, b, stagger);
                    stagger += CLAP_ANIM_STAGGER_MS;
                    const clapCd = getClapCooldownMs();
                    clapCooldownUntilMsByHand[a] = nowMs + clapCd;
                    clapCooldownUntilMsByHand[b] = nowMs + clapCd;
                    rollClapSpeedBonusesForPairHands(a, b, bonusHandsOneIndexed, true);
                    [a, b].forEach(handIndex => {
                        if (Math.random() < getClapCheapenBonusChance()) {
                            grantClapBonusCheapenLevelForHand(handIndex);
                            cheapenBonusHandsOneIndexed.push(handIndex + 1);
                            maybeRunThumbClapChain(
                                asc.clapCheapenExtraRoll,
                                asc.clapCheapenChainRolls,
                                CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES,
                                () => {
                                    grantClapBonusCheapenLevelForHand(handIndex);
                                    cheapenBonusHandsOneIndexed.push(handIndex + 1);
                                }
                            );
                        }
                        if (Math.random() < getClapSlowdownBonusChance()) {
                            grantClapBonusSlowdownLevelForHand(handIndex);
                            slowdownBonusHandsOneIndexed.push(handIndex + 1);
                            maybeRunThumbClapChain(
                                asc.clapSlowdownExtraRoll,
                                asc.clapSlowdownChainRolls,
                                CLAP_BONUS_SLOWDOWN_CHAIN_MAX_WAVES,
                                () => {
                                    grantClapBonusSlowdownLevelForHand(handIndex);
                                    slowdownBonusHandsOneIndexed.push(handIndex + 1);
                                }
                            );
                        }
                        if (tryGrantClapEssenceMultiplierForHand(handIndex)) essenceProcCountThisTick++;
                    });
                    maybeComboClapChainFromAscension(a, b, stagger, bonusHandsOneIndexed);
                    break;
                }
            }
        }
        for (let i = 0; i < unlockedHands; i++) clapDigitPrevious[i] = current[i];
        const hadClapBonusEvent =
            bonusHandsOneIndexed.length > 0 ||
            cheapenBonusHandsOneIndexed.length > 0 ||
            slowdownBonusHandsOneIndexed.length > 0 ||
            essenceProcCountThisTick > 0;
        if (hadClapBonusEvent) {
            markMeaningfulProgress();
            const bits = [];
            if (bonusHandsOneIndexed.length > 0)
                bits.push("bonus speed on " + bonusHandsOneIndexed.map(n => "Hand " + n).join(", "));
            if (cheapenBonusHandsOneIndexed.length > 0)
                bits.push("bonus cheapen on " + cheapenBonusHandsOneIndexed.map(n => "Hand " + n).join(", "));
            if (slowdownBonusHandsOneIndexed.length > 0)
                bits.push(
                    "bonus Compaction on " + slowdownBonusHandsOneIndexed.map(n => "Hand " + n).join(", ")
                );
            if (essenceProcCountThisTick > 0) {
                bits.push(
                    "essence multiplier proc ×" +
                        essenceProcCountThisTick +
                        " (now " +
                        getNumber1AscensionClapEssenceMultiplier().toFixed(3) +
                        "x)"
                );
            }
            addToLog("Clap! " + bits.join(" · ") + ".", "system");
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
            updateMilestoneUI();
            refreshOverviewAndAscensionHubLiveIfOpen();
            ledgerBeamAfterClapBonuses(clapLedgerSnapBefore);
        }
    }

    return { processClappingThisTick };
}
