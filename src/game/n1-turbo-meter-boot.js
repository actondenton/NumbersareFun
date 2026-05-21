import {
    GAME_LOOP_MS,
    TURBO_LEVELER_LINE_TOOLTIP,
    TURBO_SCENSION_AXIS_TITLES,
    createNumber1TurboBoot,
    getTurboBoostMultiplierFromTurboState,
    getTurboBurnDrainForStep,
    getTurboComboPointsForMinHands,
    getTurboLevelerNextPointCostForPurchases,
    getTurboNominalBurnPerSecFromState,
    getTurboScensionActivationCostFromTotals,
    getTurboScensionFillMultForLevel,
    getTurboScensionUpgradeRollCountFromTotals
} from "./modules/number1/core.js";
import { formatSignedCountGain } from "./modules/number1/format.js";
import { formatUpgradeAffordEtaDuration } from "./modules/number1/upgrades.js";

export function wireNumber1TurboMeterBoot(d) {
/* ---------------------------------------------------------
   TURBO BOOST (unlocks at 1T; gauge to right of total count)

   Design goals:
   - Meter is fueled by repeatable hand combos (after unlock).
   - Turbo can be toggled On/Off. Off: meter can grow, but no bonus and no burn.
   - On: count multiplier is burn-driven (Turbo-scension Burn + base rate); tank fullness and size
     scale how much of that ceiling you get; a larger full tank runs hotter for longer. Drain uses a
     piecewise curve so burn slows as the meter nears empty.

   Balance knobs:
   - Combo → meter points (`getTurboComboPoints`; Turbo-scension Fill doubles this and passive sustain feed per level)
   - Nominal burn rate → boost shape (`getTurboBurnIntensityRatio`, exponent)
   - Ring Mult cap (`d.getTurboCountMultiplierMax`), tank fullness × tank-size peak (`TURBO_TANK_PEAK_*`)
   - Piecewise drain floor / exponent (`TURBO_DRAIN_*`), Burn Efficiency ascension
   - Ring sustain: extra combo→meter mult, drain mult, Off-only fill mult, passive meter/sec while On (Fill scales passive regen too)
--------------------------------------------------------- */
function getTurboScensionActivationCost() {
    return getTurboScensionActivationCostFromTotals(d.computeAscensionGrantTotals());
}
/** Independent random Burn/Tank/Mult/Fill rolls per Upgrade click (1 base + ascension extras). */
function getTurboScensionUpgradeRollCount() {
    return getTurboScensionUpgradeRollCountFromTotals(d.computeAscensionGrantTotals());
}

let turboBoostMeter = 0;
let turboBoostUnlocked = false;
let turboBoostEnabled = false;
let turboActivationCount = 0;
/** Turbo Leveler (Ring): overflow combo fill while Turbo off + full meter → bank; spend for random scension levels. */
let turboLevelerBank = 0;
let turboLevelerPurchases = 0;
/** Patched after {@link createNumber1TurboBoot}; stubs keep earlier handlers valid. */
let tryUnlockTurboIfEligible = () => {};
let syncTurboBoostToggleDomFromBoot = () => {};

// Converts combo size (minHands) into meter points.
// Current mapping uses an exponential curve: points = base^(minHands-offset)
function getTurboScensionFillMult() {
    return getTurboScensionFillMultForLevel(d.getTurboScensionFillLevel());
}
function getTurboComboPoints(minHands) {
    return getTurboComboPointsForMinHands(minHands, d.computeAscensionGrantTotals(), d.getTurboScensionFillLevel());
}

function getTurboNominalBurnPerSec() {
    return getTurboNominalBurnPerSecFromState(d.computeAscensionGrantTotals(), d.getTurboScensionBurnLevel());
}
/** Burn-driven boost, scaled by tank fullness and (when full) larger tanks hit harder. */
function getTurboBoostMultiplierFromState() {
    return getTurboBoostMultiplierFromTurboState({
        meter: turboBoostMeter,
        meterMax: d.getTurboMeterMax(),
        curveScale: d.getTurboMeterCurveScale(),
        nominalBurnPerSec: getTurboNominalBurnPerSec(),
        multiplierMax: d.getTurboCountMultiplierMax()
    });
}
// Applied turbo multiplier. If turbo is toggled Off, this returns 1× (no effect).
function getTurboCountMultiplier() {
    if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return 1;
    return getTurboBoostMultiplierFromState();
}
// Display-only: potential multiplier from current meter (even if toggle Off).
function getTurboCountMultiplierFromMeter() {
    if (!turboBoostUnlocked || turboBoostMeter <= 0) return 1;
    return getTurboBoostMultiplierFromState();
}

const TURBO_GAIN_POPUP_DURATION_MS = 1000;

// Small, short-lived "+N" popup near the turbo gauge when meter increases.
// Positioned with slight randomness so multiple gains don't overlap perfectly.
function showTurboGainPopup(points) {
    const container = document.getElementById("turbo-gain-popup-container");
    const gaugeEl = d.turboBoostGaugeEl;
    const wrapEl = d.turboBoostWrapEl;
    if (!container || !gaugeEl || !wrapEl || points <= 0) return;
    const popup = document.createElement("div");
    popup.className = "turbo-gain-popup";
    popup.textContent = formatSignedCountGain(points);
    const gaugeRect = gaugeEl.getBoundingClientRect();
    const wrapRect = wrapEl.getBoundingClientRect();
    const offsetX = (Math.random() - 0.5) * 56;
    const offsetY = (Math.random() - 0.5) * 20;
    popup.style.left = (gaugeRect.left - wrapRect.left + offsetX) + "px";
    popup.style.top = (gaugeRect.top - wrapRect.top + offsetY) + "px";
    container.appendChild(popup);
    setTimeout(() => {
        popup.classList.add("turbo-gain-popup-gone");
        setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 350);
    }, TURBO_GAIN_POPUP_DURATION_MS);
}

function isTurboLevelerMode() {
    return turboBoostUnlocked && d.isTurboScensionUnlocked() && !!d.computeAscensionGrantTotals().turboLeveler && !turboBoostEnabled;
}
function getTurboLevelerNextPointCost() {
    return getTurboLevelerNextPointCostForPurchases(turboLevelerPurchases);
}
/** Spend bank on random Burn/Tank/Mult/Fill while Turbo is off (Turbo Leveler grant). */
function tryTurboLevelerPurchases() {
    if (!turboBoostUnlocked || !d.isTurboScensionUnlocked() || !d.computeAscensionGrantTotals().turboLeveler) return;
    if (turboBoostEnabled) return;
    let any = false;
    let nextCost = getTurboLevelerNextPointCost();
    while (turboLevelerBank >= nextCost) {
        turboLevelerBank -= nextCost;
        turboLevelerPurchases++;
        const axis = applyOneTurboScensionRandomLevel();
        const labels = ["Burn rate", "Boost tank", "Boost multiplier", "Meter fill"];
        const now = axis === 0 ? d.getTurboScensionBurnLevel() : axis === 1 ? d.getTurboScensionTankLevel() : axis === 2 ? d.getTurboScensionMultLevel() : d.getTurboScensionFillLevel();
        d.addToLog("Turbo Leveler: +1 " + labels[axis] + " (now level " + now + ").", "system");
        turboBoostMeter = Math.min(turboBoostMeter, d.getTurboMeterMax());
        any = true;
        nextCost = getTurboLevelerNextPointCost();
    }
    if (any) {
        d.markMeaningfulProgress();
        updateTurboBoostUI({ force: true });
        d.updateRateDisplay();
        d.autosaveNow();
    }
}
// Adds meter charge (clamped). This does NOT care whether turbo is toggled On;
// players can still build meter while turbo is Off.
function addTurboBoostMeter(points) {
    if (!turboBoostUnlocked || points <= 0) return;
    const totals = d.computeAscensionGrantTotals();
    if (!turboBoostEnabled) {
        points *= (totals.turboOffMeterFillMult || 1);
    }
    const maxM = d.getTurboMeterMax();
    const prev = turboBoostMeter;
    let popupPts = points;
    if (isTurboLevelerMode()) {
        const space = Math.max(0, maxM - turboBoostMeter);
        const toMeter = Math.min(points, space);
        if (toMeter > 0) turboBoostMeter = Math.min(maxM, turboBoostMeter + toMeter);
        popupPts = toMeter;
        const overflow = points - toMeter;
        if (overflow > 0 && turboBoostMeter >= maxM - 1e-12) {
            turboLevelerBank += overflow;
            tryTurboLevelerPurchases();
        }
    } else {
        turboBoostMeter = Math.min(maxM, turboBoostMeter + points);
    }
    if (turboBoostMeter > prev && d.turboBoostFillEl) {
        showTurboGainPopup(popupPts > 0 ? popupPts : points);
        d.turboBoostFillEl.classList.remove("turbo-boost-fill-gain");
        void d.turboBoostFillEl.offsetWidth;
        d.turboBoostFillEl.classList.add("turbo-boost-fill-gain");
        setTimeout(() => d.turboBoostFillEl.classList.remove("turbo-boost-fill-gain"), 400);
    }
    updateTurboBoostUI({ force: true });
}

// Burns meter while turbo is actively applying a multiplier (toggle On).
// Also auto-switches the toggle Off when the meter hits 0.
function updateTurboBurn(dtSec) {
    if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return;
    const meterMax = d.getTurboMeterMax();
    const totals = d.computeAscensionGrantTotals();
    const drain = getTurboBurnDrainForStep(dtSec, {
        meter: turboBoostMeter,
        meterMax,
        nominalBurnPerSec: getTurboNominalBurnPerSecFromState(totals, d.getTurboScensionBurnLevel()),
        totals
    });
    turboBoostMeter = Math.max(0, turboBoostMeter - drain);
    if (turboBoostMeter <= 0) {
        turboBoostEnabled = false;
        syncTurboBoostToggleDomFromBoot(false);
        d.updateRateDisplay();
    }
    if (drain > 0 && d.turboBoostGaugeEl) {
        d.turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning");
        void d.turboBoostGaugeEl.offsetWidth;
        d.turboBoostGaugeEl.classList.add("turbo-boost-gauge-burning");
        setTimeout(() => d.turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning"), 250);
    }
    updateTurboBoostUI({ force: true });
}

/** Flat meter per second while Turbo On and meter has charge (Ring sustain nodes). */
function applyTurboPassiveMeterRegen(dtSec) {
    if (!turboBoostUnlocked || !turboBoostEnabled || turboBoostMeter <= 0) return;
    const rate = d.computeAscensionGrantTotals().turboPassiveMeterPerSec || 0;
    if (!(rate > 0) || !(dtSec > 0)) return;
    const maxM = d.getTurboMeterMax();
    if (turboBoostMeter >= maxM) return;
    turboBoostMeter = Math.min(maxM, turboBoostMeter + rate * dtSec * getTurboScensionFillMult());
}

/** Run whenever `d.getTotalChanges()` changes so milestone gates cannot desync (load, offline, dev tools, etc.). */
function syncUnlocksWithTotalCount() {
    d.checkUnlockHands();
    tryUnlockTurboIfEligible();
    if (d.getTotalChanges() >= 100) d.setAutoBuyUnlocked(true);
    if (d.getTotalChanges() >= 10 && d.upgradeContainer) d.upgradeContainer.classList.add("show-upgrade-content");
    if ((d.getHandEarning(0) || 0) >= 1000 && !d.getCheapenSectionUnlocked()) {
        d.setCheapenSectionUnlocked(true);
        d.ensureSpeedRows();
        d.updateCheapenUpgradeUI();
    }
    if (d.isSlowdownUnlocked() && !d.getSlowdownUnlockLogged()) {
        d.setSlowdownUnlockLogged(true);
        d.addToLog("Compaction unlocked (all hands).", "milestone");
    }
    if (d.isTimeWarpUnlocked() && !d.getTimeWarpUnlockLogged()) {
        d.setTimeWarpUnlockLogged(true);
        d.addToLog("Time Warp system unlocked (auras can now appear).", "milestone");
    }
}

/** @returns {0|1|2|3} axis: 0 burn, 1 tank, 2 mult, 3 fill */
function applyOneTurboScensionRandomLevel() {
    const pick = Math.floor(Math.random() * 4);
    if (pick === 0) d.incTurboScensionBurnLevel();
    else if (pick === 1) d.incTurboScensionTankLevel();
    else if (pick === 2) d.incTurboScensionMultLevel();
    else d.incTurboScensionFillLevel();
    return pick;
}
function formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill) {
    const labels = ["Burn rate", "Boost tank", "Boost multiplier", "Meter fill"];
    const gained = [gainedBurn, gainedTank, gainedMult, gainedFill || 0];
    const parts = [];
    for (let i = 0; i < 4; i++) {
        const n = gained[i];
        if (n <= 0) continue;
        const now = i === 0 ? d.getTurboScensionBurnLevel() : i === 1 ? d.getTurboScensionTankLevel() : i === 2 ? d.getTurboScensionMultLevel() : d.getTurboScensionFillLevel();
        parts.push("+" + n + " " + labels[i] + " (now level " + now + ")");
    }
    return parts.length ? "Turbo-scension: " + parts.join("; ") + "." : "";
}
/** Extra sentence(s) for Turbo-scension Upgrade detail tooltip: rough time to afford next purchase in activations. */
function getTurboScensionUpgradeActivationEtaHint() {
    const cost = getTurboScensionActivationCost();
    const need = cost - turboActivationCount;
    if (need <= 0) return "";
    const perSec = 1000 / GAME_LOOP_MS;
    if (!turboBoostEnabled || turboBoostMeter <= 0) {
        return " Turn Turbo ON with charge in the meter to earn activations (~" + Math.round(perSec) + "/s — one per " + (GAME_LOOP_MS / 1000) + "s tick — only while boost runs). Refill the gauge with combos if it is empty.";
    }
    const secApprox = need / perSec;
    const dur = formatUpgradeAffordEtaDuration(secApprox).replace(/ at current rate/g, "").trim();
    return " Roughly " + dur + " of Turbo runtime at full tick rate to afford this if the meter stays charged (drain slows near empty; an empty meter turns Turbo off).";
}
/**
 * @param {object} [opts]
 * @param {boolean} [opts.skipLog] Omit tip log (autobuy).
 * @param {boolean} [opts.skipAutosave] Batch autobuy: caller saves once.
 * @param {boolean} [opts.skipUIUpdate] Batch autobuy: caller refreshes UI once.
 * @returns {boolean} true if a level was purchased
 */
function tryTurboScensionActivationUpgrade(opts) {
    opts = opts || {};
    if (!d.isTurboScensionUnlocked() || !turboBoostUnlocked || d.gameplaySimFrozen()) return false;
    const cost = getTurboScensionActivationCost();
    if (turboActivationCount < cost) return false;
    turboActivationCount -= cost;
    const rolls = getTurboScensionUpgradeRollCount();
    const allAxes = !!d.computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
    let gainedBurn = 0;
    let gainedTank = 0;
    let gainedMult = 0;
    let gainedFill = 0;
    if (allAxes) {
        for (let r = 0; r < rolls; r++) {
            d.incTurboScensionBurnLevel();
            d.incTurboScensionTankLevel();
            d.incTurboScensionMultLevel();
            d.incTurboScensionFillLevel();
            gainedBurn++;
            gainedTank++;
            gainedMult++;
            gainedFill++;
        }
    } else {
        for (let r = 0; r < rolls; r++) {
            const axis = applyOneTurboScensionRandomLevel();
            if (axis === 0) gainedBurn++;
            else if (axis === 1) gainedTank++;
            else if (axis === 2) gainedMult++;
            else gainedFill++;
        }
    }
    turboBoostMeter = Math.min(turboBoostMeter, d.getTurboMeterMax());
    d.markMeaningfulProgress();
    if (!opts.skipUIUpdate) {
        updateTurboBoostUI({ force: true });
        d.updateRateDisplay();
    }
    if (!opts.skipAutosave) d.autosaveNow();
    if (!opts.skipLog) {
        const line = formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill);
        if (line) d.addToLog(line, "system");
    }
    return true;
}
let turboBoostUiFullLastMs = 0;
let turboBoostUiFullDigest = "";
const TURBO_BOOST_UI_FULL_MIN_MS = 120;
let turboBoostUiStripLastMeterRounded = NaN;
let turboBoostUiStripLastMeterMaxRounded = NaN;
let turboBoostUiStripLastMultStr = "";
let turboBoostUiStripLastActCount = NaN;
let turboBoostUiStripLastEnabled = null;
function computeTurboBoostUiFullDigest() {
    const u = turboBoostUnlocked ? 1 : 0;
    if (!u) return "u0";
    const s = d.isTurboScensionUnlocked() ? 1 : 0;
    if (!s) return "u1|s0|" + Math.round(d.getTurboMeterMax());
    const actCost = getTurboScensionActivationCost();
    const grants = d.computeAscensionGrantTotals();
    return [
        "u1|s1",
        Math.round(Number(d.getTurboScensionBurnLevel()) || 0),
        Math.round(Number(d.getTurboScensionTankLevel()) || 0),
        Math.round(Number(d.getTurboScensionMultLevel()) || 0),
        Math.round(Number(d.getTurboScensionFillLevel()) || 0),
        actCost,
        turboActivationCount,
        getTurboScensionUpgradeRollCount(),
        grants.turboScensionAllAxesUpgrade ? 1 : 0,
        grants.turboLeveler ? 1 : 0,
        grants.turboLeveler ? turboLevelerBank : 0,
        grants.turboLeveler ? getTurboLevelerNextPointCost() : 0,
        Math.round(d.getTurboMeterMax()),
    ].join("|");
}
function paintTurboBoostScisionFull() {
    const showScisionPanel = d.isTurboScensionUnlocked() && turboBoostUnlocked;
    if (d.turboScensionPanelEl) {
        d.turboScensionPanelEl.style.display = showScisionPanel ? "" : "none";
        d.turboScensionPanelEl.setAttribute("aria-hidden", showScisionPanel ? "false" : "true");
    }
    if (d.turboRightClusterEl) d.turboRightClusterEl.classList.toggle("turbo-right-cluster--scision", showScisionPanel);
    if (!showScisionPanel && d.turboScensionLevelerLineEl) {
        d.turboScensionLevelerLineEl.style.display = "none";
        d.turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
    }
    if (showScisionPanel) {
        if (d.turboScensionBurnLineEl) {
            const lab = d.turboScensionBurnLineEl.querySelector(".turbo-scension-level-line-label");
            if (lab) lab.textContent = "Burn " + Math.round(Number(d.getTurboScensionBurnLevel()) || 0);
            d.setUpgradeTooltipText(d.turboScensionBurnLineEl, TURBO_SCENSION_AXIS_TITLES[0]);
            d.turboScensionBurnLineEl.removeAttribute("title");
        }
        if (d.turboScensionTankLineEl) {
            const lab = d.turboScensionTankLineEl.querySelector(".turbo-scension-level-line-label");
            if (lab) lab.textContent = "Tank " + Math.round(Number(d.getTurboScensionTankLevel()) || 0);
            d.setUpgradeTooltipText(d.turboScensionTankLineEl, TURBO_SCENSION_AXIS_TITLES[1]);
            d.turboScensionTankLineEl.removeAttribute("title");
        }
        if (d.turboScensionMultLineEl) {
            const lab = d.turboScensionMultLineEl.querySelector(".turbo-scension-level-line-label");
            if (lab) lab.textContent = "Mult " + Math.round(Number(d.getTurboScensionMultLevel()) || 0);
            d.setUpgradeTooltipText(d.turboScensionMultLineEl, TURBO_SCENSION_AXIS_TITLES[2]);
            d.turboScensionMultLineEl.removeAttribute("title");
        }
        if (d.turboScensionFillLineEl) {
            const lab = d.turboScensionFillLineEl.querySelector(".turbo-scension-level-line-label");
            if (lab) lab.textContent = "Fill " + Math.round(Number(d.getTurboScensionFillLevel()) || 0);
            d.setUpgradeTooltipText(d.turboScensionFillLineEl, TURBO_SCENSION_AXIS_TITLES[3]);
            d.turboScensionFillLineEl.removeAttribute("title");
        }
        if (d.turboScensionUpgradeBtn) {
            const actCost = getTurboScensionActivationCost();
            const can = turboActivationCount >= actCost;
            const rollN = getTurboScensionUpgradeRollCount();
            const allAxes = !!d.computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
            d.turboScensionUpgradeBtn.disabled = !can;
            const progress = actCost > 0 ? Math.max(0, Math.min(1, turboActivationCount / actCost)) : 1;
            d.setUpgradeButtonProgress(d.turboScensionUpgradeBtn, progress);
            d.turboScensionUpgradeBtn.classList.toggle("upgrade-btn--afford-pulse", can);
            const spendLine = can
                ? (allAxes
                    ? "Spend " + d.formatCount(actCost) + " activations for +" + rollN + " level each on Burn, Tank, Mult, and Fill (all four, no random)."
                    : "Spend " + d.formatCount(actCost) + " activations for " + rollN + " independent random level" + (rollN === 1 ? "" : "s") + " among Burn, Tank, Mult, or Fill (equal chance per roll).")
                : ("Need " + d.formatCount(actCost) + " activations (have " + d.formatCount(turboActivationCount) + ").");
            const eta = getTurboScensionUpgradeActivationEtaHint();
            const foot = "\n\nHover Burn, Tank, Mult, or Fill above to see what each upgrade type does.";
            d.setUpgradeTooltipText(d.turboScensionUpgradeBtn, spendLine + eta + foot);
            d.turboScensionUpgradeBtn.removeAttribute("title");
        }
        if (d.turboScensionLevelerLineEl) {
            const tl = d.computeAscensionGrantTotals().turboLeveler === true;
            if (tl) {
                d.turboScensionLevelerLineEl.style.display = "";
                d.turboScensionLevelerLineEl.setAttribute("aria-hidden", "false");
                const next = getTurboLevelerNextPointCost();
                const lab = d.turboScensionLevelerLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Leveler " + d.formatTurboScensionLevelDisplay(turboLevelerBank) + " / " + d.formatTurboScensionLevelDisplay(next) + " pts";
                d.setUpgradeTooltipText(d.turboScensionLevelerLineEl, TURBO_LEVELER_LINE_TOOLTIP);
                d.turboScensionLevelerLineEl.removeAttribute("title");
            } else {
                d.turboScensionLevelerLineEl.style.display = "none";
                d.turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
            }
        }
    }
}
function paintTurboBoostMeterStrip() {
    if (!d.turboBoostWrapEl || !turboBoostUnlocked) return;
    const en = !!turboBoostEnabled;
    if (turboBoostUiStripLastEnabled !== en) {
        turboBoostUiStripLastEnabled = en;
        if (d.turboBoostEnabledCheckbox) d.turboBoostEnabledCheckbox.checked = en;
        if (d.turboBoostToggleLabelEl) d.turboBoostToggleLabelEl.textContent = en ? "On" : "Off";
    }
    const meterMax = d.getTurboMeterMax();
    const pct = Math.min(100, (turboBoostMeter / meterMax) * 100);
    if (d.turboBoostFillEl) d.turboBoostFillEl.style.width = pct + "%";
    const mr = Math.round(turboBoostMeter);
    const mmx = Math.round(meterMax);
    if (d.turboBoostGaugeEl) {
        if (mr !== turboBoostUiStripLastMeterRounded) {
            turboBoostUiStripLastMeterRounded = mr;
            d.turboBoostGaugeEl.setAttribute("aria-valuenow", mr);
        }
        if (mmx !== turboBoostUiStripLastMeterMaxRounded) {
            turboBoostUiStripLastMeterMaxRounded = mmx;
            d.turboBoostGaugeEl.setAttribute("aria-valuemax", mmx);
        }
    }
    const multStr = d.formatTurboBoostMultiplierForDisplay(getTurboCountMultiplierFromMeter());
    if (d.turboBoostMultiplierEl && multStr !== turboBoostUiStripLastMultStr) {
        turboBoostUiStripLastMultStr = multStr;
        d.turboBoostMultiplierEl.textContent = multStr;
    }
    if (d.turboBoostActivationsEl && turboActivationCount !== turboBoostUiStripLastActCount) {
        turboBoostUiStripLastActCount = turboActivationCount;
        d.turboBoostActivationsEl.textContent = "Activations: " + d.formatCount(turboActivationCount);
    }
}
/**
 * @param {{ force?: boolean }} [opts] force: immediate Turbo-scision pass (purchases, toggle, load).
 */
function updateTurboBoostUI(opts) {
    opts = opts || {};
    const force = opts.force === true;
    tryUnlockTurboIfEligible();
    const now = Date.now();
    const digest = computeTurboBoostUiFullDigest();
    const paintFull = force || digest !== turboBoostUiFullDigest || now - turboBoostUiFullLastMs >= TURBO_BOOST_UI_FULL_MIN_MS;
    if (paintFull) {
        turboBoostUiFullDigest = digest;
        turboBoostUiFullLastMs = now;
        paintTurboBoostScisionFull();
    }
    paintTurboBoostMeterStrip();
}

const number1TurboBoot = createNumber1TurboBoot({
    d.turboScensionUpgradeBtn,
    d.turboBoostEnabledCheckbox,
    d.turboBoostToggleLabelEl,
    setTurboBoostEnabled: v => { turboBoostEnabled = v; },
    tryTurboLevelerPurchases,
    updateTurboBoostUI,
    d.updateRateDisplay,
    tryTurboScensionActivationUpgrade,
    getTotalChanges: () => d.getTotalChanges(),
    getTurboBoostUnlocked: () => turboBoostUnlocked,
    onTurboSystemFirstUnlock: () => {
        turboBoostUnlocked = true;
        turboBoostEnabled = false;
    },
    d.turboBoostWrapEl,
    d.addToLog,
    d.formatCount,
    checkStoryBanners: () => d.forwardCheckStoryBanners()
});
tryUnlockTurboIfEligible = number1TurboBoot.tryUnlockTurboIfEligible;
syncTurboBoostToggleDomFromBoot = number1TurboBoot.syncTurboBoostToggleDom;
    return {
        getTurboCountMultiplier,
        getTurboCountMultiplierFromMeter,
        getTurboComboPoints,
        addTurboBoostMeter,
        updateTurboBurn,
        applyTurboPassiveMeterRegen,
        syncUnlocksWithTotalCount,
        tryTurboScensionActivationUpgrade,
        updateTurboBoostUI,
        tryUnlockTurboIfEligible,
        syncTurboBoostToggleDomFromBoot,
        number1TurboBoot,
        getTurboBoostMeter: () => turboBoostMeter,
        setTurboBoostMeter: v => { turboBoostMeter = v; },
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        setTurboBoostUnlocked: v => { turboBoostUnlocked = v; },
        getTurboBoostEnabled: () => turboBoostEnabled,
        setTurboBoostEnabled: v => { turboBoostEnabled = v; }
    };
}
