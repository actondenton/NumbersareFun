/** Count/s headline, BH gravity strip text, and upgrade-column hand status blocks (Number 1). */

import { formatBlackHoleMultForUi } from "./n1-format.js";

export const CPS_HEADLINE_THROTTLE_MS = 1000;

/**
 * @param {{
 *   n1GravityCpsStripEl: HTMLElement | null | undefined,
 *   phase1EssenceTarget: number,
 *   getBlackHolePhase: () => number,
 *   isBlackHoleArcUnlocked: () => boolean,
 *   getNumber1BlackHoleState: () => { phase1EssenceSpent?: number, phase5FurnaceLevel?: number },
 *   getBlackHolePhase1RunCpsMult: () => number,
 *   formatBlackHolePhase1CpsMultForUi: (m: number) => string,
 *   getBlackHoleTotalMult: () => number,
 *   getBlackHoleFurnaceMult: () => number,
 *   getUnlockedHands: () => number,
 *   getHandPerHandRawCps: (i: number) => number,
 *   getComboMultiplier: () => number,
 *   getPatternCatalogMultiplier: () => number,
 *   getAscensionComboPatternMult: () => number,
 *   getTurboCountMultiplier: () => number,
 *   getTurboCountMultiplierFromMeter: () => number,
 *   getNumber1BlackHoleProductionMult: () => number,
 *   getInstantTotalCps: () => number,
 *   getTurboBoostUnlocked: () => boolean,
 *   getTurboBoostEnabled: () => boolean,
 *   getGravityStackTooltipPhrase: () => string,
 *   bonusMultiplierEl: HTMLElement | null | undefined,
 *   turboMultiplierDisplayEl: HTMLElement | null | undefined,
 *   incrementalRateEl: HTMLElement | null | undefined,
 *   formatCount: (n: number | bigint | string) => string,
 *   formatCompactMultiplier: (n: number) => string,
 *   formatTurboBoostMultiplierForDisplay: (n: number) => string,
 *   getSpeedRowRefs: () => unknown[],
 *   getHandEarning: (i: number) => number,
 *   getHandBaseCpsBeforeSlowdownMult: (i: number) => number,
 *   getHandSlowdownFactorForDisplay: (i: number) => number,
 *   getHandComboFactorForDisplay: () => number,
 *   getHandTurboFactorForDisplay: () => number,
 *   getHandEffectiveCps: (i: number) => number,
 *   formatCpsForDisplay: (cps: number) => string,
 *   refreshCombinationsHandStatusIfOpen: () => void,
 *   scheduleFitTopCountRow: () => void,
 * }} deps
 */
export function createRateDisplayUi(deps) {
    let cpsHeadlineLastPaintMs = 0;

    function updateN1GravityCpsStrip() {
        const strip = deps.n1GravityCpsStripEl;
        if (!strip) return;
        const p = deps.getBlackHolePhase();
        if (!deps.isBlackHoleArcUnlocked() || p < 1 || p === 7) {
            strip.hidden = true;
            strip.textContent = "";
            strip.className = "n1-gravity-cps-strip";
            return;
        }
        strip.hidden = false;
        if (p === 1) {
            const bh = deps.getNumber1BlackHoleState();
            const spent = Math.floor(Number(bh.phase1EssenceSpent) || 0);
            const m = deps.getBlackHolePhase1RunCpsMult();
            const ms = deps.formatBlackHolePhase1CpsMultForUi(m);
            strip.className = "n1-gravity-cps-strip n1-gravity-cps-strip--mass";
            strip.innerHTML =
                "<div class=\"n1-gravity-cps-strip__inner\" role=\"status\">" +
                "<span class=\"n1-gravity-cps-strip__glyph\" aria-hidden=\"true\">⊕</span>" +
                "<div class=\"n1-gravity-cps-strip__text\">" +
                "<span class=\"n1-gravity-cps-strip__line\"><span class=\"n1-gravity-cps-strip__name\">Numerical mass</span>" +
                "<span class=\"n1-gravity-cps-strip__mult\">CPS ×" + ms + "</span></span>" +
                "<span class=\"n1-gravity-cps-strip__sub\">Mass charge " + spent + " / " + deps.phase1EssenceTarget + "</span>" +
                "</div></div>";
            return;
        }
        if (p >= 2) {
            const t = deps.getBlackHoleTotalMult();
            const ts = formatBlackHoleMultForUi(t);
            let sub = "All phase effects apply here";
            if (p >= 5) {
                const bh = deps.getNumber1BlackHoleState();
                const f = deps.getBlackHoleFurnaceMult();
                const echoes = Math.max(0, Math.floor(Number(bh.phase5FurnaceLevel) || 0));
                sub = "Furnace ×" + (f >= 10 ? f.toFixed(2) : f.toFixed(3)) + " · Echo Hands " + echoes;
            }
            strip.className = "n1-gravity-cps-strip n1-gravity-cps-strip--void";
            strip.innerHTML =
                "<div class=\"n1-gravity-cps-strip__inner\" role=\"status\">" +
                "<span class=\"n1-gravity-cps-strip__glyph n1-gravity-cps-strip__glyph--void\" aria-hidden=\"true\">" +
                "<span class=\"n1-bh-visual\"><span class=\"n1-bh-visual__ring\"></span><span class=\"n1-bh-visual__core\"></span></span></span>" +
                "<div class=\"n1-gravity-cps-strip__text\">" +
                "<span class=\"n1-gravity-cps-strip__line\"><span class=\"n1-gravity-cps-strip__name\">Black hole</span>" +
                "<span class=\"n1-gravity-cps-strip__mult\">Counting ×" + ts + "</span></span>" +
                "<span class=\"n1-gravity-cps-strip__sub\">" + sub + "</span>" +
                "</div></div>";
        }
    }

    function updateHandStatusBlocks() {
        const n = deps.getUnlockedHands();
        const refs = deps.getSpeedRowRefs();
        for (let i = 0; i < n; i++) {
            const ref = refs[i];
            if (!ref || !ref.statusCountEl) continue;
            const baseCps = deps.getHandBaseCpsBeforeSlowdownMult(i);
            const slowF = deps.getHandSlowdownFactorForDisplay(i);
            const comboF = deps.getHandComboFactorForDisplay();
            const turboF = deps.getHandTurboFactorForDisplay();
            const rawHand = deps.getHandPerHandRawCps(i);
            const eff = deps.getHandEffectiveCps(i);
            const bal = deps.getHandEarning(i);
            ref.statusCountEl.textContent = deps.formatCount(bal);
            ref.statusBaseEl.textContent = deps.formatCpsForDisplay(baseCps);
            ref.statusEffectiveEl.textContent = deps.formatCpsForDisplay(eff);
            const baseStr = deps.formatCpsForDisplay(baseCps);
            ref.statusFormulaEl.textContent =
                "base × combo × turbo × Compaction: " + baseStr + " × " + comboF.toFixed(2) + " × " + turboF.toFixed(2) + " × " + slowF.toFixed(2) + " = " + deps.formatCpsForDisplay(eff);
            ref.statusCompactEl.textContent =
                "Hand " +
                (i + 1) +
                ": " +
                deps.formatCount(bal) +
                " · " +
                deps.formatCpsForDisplay(rawHand) +
                " → " +
                deps.formatCpsForDisplay(eff);
        }
    }

    function updateRateDisplay(opts) {
        opts = opts || {};
        const throttleCpsHeadline = opts.throttleCpsHeadline === true;
        const unlockedHands = deps.getUnlockedHands();
        const cpsPerHand = [];
        let cpsTotalRaw = 0;
        for (let i = 0; i < unlockedHands; i++) {
            const safeCps = deps.getHandPerHandRawCps(i);
            cpsPerHand.push(safeCps);
            cpsTotalRaw += safeCps;
        }
        const comboMult = deps.getComboMultiplier();
        const catalogMultRate = unlockedHands >= 2 ? deps.getPatternCatalogMultiplier() : 1;
        const ascComboMultRate = unlockedHands >= 2 ? deps.getAscensionComboPatternMult() : 1;
        const turboMult = deps.getTurboCountMultiplier();
        const turboDisplayMult = deps.getTurboCountMultiplierFromMeter();
        const bhMult = deps.getNumber1BlackHoleProductionMult();
        const blackHoleSectionActive = deps.isBlackHoleArcUnlocked() && deps.getBlackHolePhase() >= 1;
        const cpsTotal = deps.getInstantTotalCps();
        const bonusUnlocked = unlockedHands >= 2;
        const turboUnlocked = deps.getTurboBoostUnlocked();
        const gStack = deps.getGravityStackTooltipPhrase();
        const bonusMultiplierEl = deps.bonusMultiplierEl;
        if (bonusMultiplierEl) {
            bonusMultiplierEl.textContent =
                "Combo Catalog ×" + catalogMultRate.toFixed(2) + " · Ascended Combo ×" + ascComboMultRate.toFixed(2);
            bonusMultiplierEl.style.display = bonusUnlocked ? "" : "none";
            bonusMultiplierEl.title =
                "Count per second uses Combo Catalog × Ascended Combo (= ×" + comboMult.toFixed(2) + " combined) × turbo × " + gStack + ". Time Warp uses that stack × index-finger combo bonus × the bursting hand's share.";
        }
        const turboMultiplierDisplayEl = deps.turboMultiplierDisplayEl;
        if (turboMultiplierDisplayEl) {
            turboMultiplierDisplayEl.textContent = "Turbo: " + deps.formatTurboBoostMultiplierForDisplay(turboDisplayMult);
            turboMultiplierDisplayEl.style.display = turboUnlocked ? "" : "none";
        }
        const incrementalRateEl = deps.incrementalRateEl;
        if (incrementalRateEl) {
            incrementalRateEl.classList.toggle(
                "rate-turbo-active",
                deps.getTurboBoostEnabled() && turboMult > 1
            );
            incrementalRateEl.classList.toggle(
                "incremental-rate-value--pre-bh-wrap",
                !blackHoleSectionActive && unlockedHands >= 2
            );
            incrementalRateEl.title =
                "Total count per second: raw hand rates × Combo Catalog × Ascended Combo × turbo × " + gStack + ". Hand tooltips use the same stack; center line repaints at most once per second during play.";
        }
        const nowPaint = Date.now();
        const mayPaintHeadline =
            !throttleCpsHeadline || nowPaint - cpsHeadlineLastPaintMs >= CPS_HEADLINE_THROTTLE_MS;
        if (incrementalRateEl && mayPaintHeadline) {
            cpsHeadlineLastPaintMs = nowPaint;
            const formatCount = deps.formatCount;
            const formatCompactMultiplier = deps.formatCompactMultiplier;

            if (deps.getBlackHolePhase() === 7) {
                incrementalRateEl.textContent = "1 / second";
                incrementalRateEl.title =
                    "Evaporation epilogue: the power game is over, and the counter advances exactly once per second.";
            } else if (unlockedHands >= 2) {
                const totalFormatted = formatCount(cpsTotal < 1e6 ? Math.round(cpsTotal * 100) / 100 : cpsTotal);
                const baseFormatted = formatCount(cpsTotalRaw < 1e6 ? Math.round(cpsTotalRaw * 100) / 100 : cpsTotalRaw);
                const calcParts = ["base " + baseFormatted];
                if (bonusUnlocked) {
                    calcParts.push("Combo Catalog×" + formatCompactMultiplier(catalogMultRate));
                    calcParts.push("Ascended Combo×" + formatCompactMultiplier(ascComboMultRate));
                }
                if (turboUnlocked) calcParts.push("turbo×" + formatCompactMultiplier(turboMult));
                if (bhMult > 1.0005) {
                    const bhs = formatCompactMultiplier(bhMult);
                    let bhPart = "bh×" + bhs;
                    if (deps.isBlackHoleArcUnlocked()) {
                        const ph = deps.getBlackHolePhase();
                        if (ph === 1) bhPart = "mass×" + bhs;
                        else if (ph >= 2 && ph <= 6) bhPart = "black\u00a0hole×" + bhs;
                        else if (ph === 7) bhPart = "epilogue×" + bhs;
                    }
                    calcParts.push(bhPart);
                }
                const totalStr = "Total " + totalFormatted + "/s · " + calcParts.join(" · ");
                if (blackHoleSectionActive) {
                    incrementalRateEl.innerHTML = "<strong>" + totalStr + "</strong> · all hands";
                } else {
                    const handParts = cpsPerHand.slice(0, unlockedHands).map((cps, i) => {
                        const rawCps = cps;
                        return "H" + (i + 1) + ": " + formatCount(rawCps < 1e6 ? Math.round(rawCps * 100) / 100 : rawCps) + "/s";
                    });
                    incrementalRateEl.innerHTML = "<strong>" + totalStr + "</strong> · " + handParts.join(" · ");
                }
            } else {
                incrementalRateEl.textContent = formatCount(cpsTotal < 1e6 ? Math.round(cpsTotal * 100) / 100 : cpsTotal);
            }
        }
        updateN1GravityCpsStrip();
        updateHandStatusBlocks();
        deps.refreshCombinationsHandStatusIfOpen();
        deps.scheduleFitTopCountRow();
    }

    return { updateN1GravityCpsStrip, updateHandStatusBlocks, updateRateDisplay };
}
