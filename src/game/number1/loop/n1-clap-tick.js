import { hands1 } from "../hands/n1-hand-ascii.js";
import {
    CLAP_ANIM_STAGGER_MS,
    CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES,
    CLAP_BONUS_SLOWDOWN_CHAIN_MAX_WAVES,
    CLAP_MAX_PAIRS_PER_TICK,
    COMBO_CLAP_CHAIN_MAX_WAVES,
    COMBO_CLAP_INSTANT_CHANCE,
    getClapBonusChanceFromTotals,
    getClapCheapenBonusChanceFromTotals,
    getClapCooldownMsFromTotals,
    getClapEssenceProcChanceFromTotals,
    getClapEssenceProcMultiplierStepFromTotals,
    getClapSlowdownBonusChanceFromTotals,
    isClappingUnlockedForHands,
    runChanceChain
} from "./n1-clap.js";

export function createNumber1ClapTick(deps) {
    const {
        getUnlockedHands,
        getHands,
        computeAscensionGrantTotals,
        getCheapenBonusLevel,
        getSlowdownBonusLevel,
        getSpeedLevel,
        getSpeedBonusLevel,
        getClapCooldownUntilMsByHand,
        getClapDigitPrevious,
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

    /** Live lane arrays — must re-resolve each use (load/ascension may replace handsRt arrays). */
    function speedLevels() {
        return getSpeedLevel();
    }
    function speedBonusLevels() {
        return getSpeedBonusLevel();
    }
    function clapCooldowns() {
        return getClapCooldownUntilMsByHand();
    }
    function clapDigitsPrev() {
        return getClapDigitPrevious();
    }
    function cheapenBonusLevels() {
        return getCheapenBonusLevel();
    }
    function slowdownBonusLevels() {
        return getSlowdownBonusLevel();
    }

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
        const cheapenBonusLevel = cheapenBonusLevels();
        cheapenBonusLevel[handIndex] = (cheapenBonusLevel[handIndex] || 0) + 1;
    }
    function grantClapBonusSlowdownLevelForHand(handIndex) {
        const unlockedHands = getUnlockedHands();
        const handsArr = getHands();
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const slowdownBonusLevel = slowdownBonusLevels();
        slowdownBonusLevel[handIndex] = (slowdownBonusLevel[handIndex] || 0) + 1;
        // Same functional reset behavior as buying a Compaction level: purchased speed levels are reset.
        speedLevels()[handIndex] = 0;
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
        const speedBonusLevel = speedBonusLevels();
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
        const clapCooldownUntilMsByHand = clapCooldowns();
        const clapDigitPrevious = clapDigitsPrev();
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
