import { GAME_LOOP_MS } from "../loop/n1-game-loop.js";
import { formatUpgradeAffordEtaDuration } from "./n1-upgrade-eta.js";
import {
    earnFractionalTurboActivations,
    getTurboActivationEarnMultFromBonus,
    getTurboBoostMultiplierFromState as getTurboBoostMultiplierFromTurboState,
    getTurboBurnDrainForStep,
    getTurboComboPointsForMinHands,
    getTurboLevelerNextPointCost as getTurboLevelerNextPointCostForPurchases,
    getTurboNominalBurnPerSecFromState,
    getTurboScensionActivationCostFromTotals,
    getTurboScensionFillMult as getTurboScensionFillMultForLevel,
    getTurboScensionUpgradeRollCountFromTotals
} from "./n1-turbo.js";
import { getBlackHolePhase2ErgosphereTurboActivationBonus, getBlackHolePhase2PhotonShellOffTurboFillBonus } from "../black-hole/number1-black-hole.js";

const TURBO_GAIN_POPUP_DURATION_MS = 1000;

/**
 * Turbo meter, burn, combo points, scension upgrades (simulation; DOM in boot/UI slice).
 *
 * @param {object} dep
 */
export function createTurboRuntimeBoot(dep) {
    function getTurboScensionActivationCost() {
        return getTurboScensionActivationCostFromTotals(dep.computeAscensionGrantTotals());
    }

    function getTurboScensionUpgradeRollCount() {
        return getTurboScensionUpgradeRollCountFromTotals(dep.computeAscensionGrantTotals());
    }

    function getTurboScensionFillMult() {
        return getTurboScensionFillMultForLevel(dep.getTurbo().turboScensionFillLevel);
    }

    function getTurboComboPoints(minHands) {
        const turbo = dep.getTurbo();
        return getTurboComboPointsForMinHands(minHands, dep.computeAscensionGrantTotals(), turbo.turboScensionFillLevel);
    }

    function getTurboNominalBurnPerSec() {
        const turbo = dep.getTurbo();
        return getTurboNominalBurnPerSecFromState(dep.computeAscensionGrantTotals(), turbo.turboScensionBurnLevel);
    }

    function getTurboBoostMultiplierFromState() {
        const turbo = dep.getTurbo();
        return getTurboBoostMultiplierFromTurboState({
            meter: turbo.turboBoostMeter,
            meterMax: dep.getTurboMeterMax(),
            curveScale: dep.getTurboMeterCurveScale(),
            nominalBurnPerSec: getTurboNominalBurnPerSec(),
            multiplierMax: dep.getTurboCountMultiplierMax()
        });
    }

    function getTurboCountMultiplier() {
        const turbo = dep.getTurbo();
        if (!turbo.turboBoostUnlocked || !turbo.turboBoostEnabled || turbo.turboBoostMeter <= 0) return 1;
        return getTurboBoostMultiplierFromState();
    }

    function getTurboCountMultiplierFromMeter() {
        const turbo = dep.getTurbo();
        if (!turbo.turboBoostUnlocked || turbo.turboBoostMeter <= 0) return 1;
        return getTurboBoostMultiplierFromState();
    }

    function showTurboGainPopup(points) {
        const container = document.getElementById("turbo-gain-popup-container");
        const gaugeEl = dep.turboBoostGaugeEl;
        const wrapEl = dep.turboBoostWrapEl;
        if (!container || !gaugeEl || !wrapEl || points <= 0) return;
        const popup = document.createElement("div");
        popup.className = "turbo-gain-popup";
        popup.textContent = "+" + points;
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
        const turbo = dep.getTurbo();
        return turbo.turboBoostUnlocked
            && dep.isTurboScensionUnlocked()
            && !!dep.computeAscensionGrantTotals().turboLeveler
            && !turbo.turboBoostEnabled;
    }

    function getTurboLevelerNextPointCost() {
        return getTurboLevelerNextPointCostForPurchases(dep.getTurbo().turboLevelerPurchases);
    }

    function applyOneTurboScensionRandomLevel() {
        const turbo = dep.getTurbo();
        const pick = Math.floor(Math.random() * 4);
        if (pick === 0) turbo.turboScensionBurnLevel++;
        else if (pick === 1) turbo.turboScensionTankLevel++;
        else if (pick === 2) turbo.turboScensionMultLevel++;
        else turbo.turboScensionFillLevel++;
        return pick;
    }

    function tryTurboLevelerPurchases() {
        const turbo = dep.getTurbo();
        if (!turbo.turboBoostUnlocked || !dep.isTurboScensionUnlocked() || !dep.computeAscensionGrantTotals().turboLeveler) return;
        if (turbo.turboBoostEnabled) return;
        let any = false;
        let nextCost = getTurboLevelerNextPointCost();
        while (turbo.turboLevelerBank >= nextCost) {
            turbo.turboLevelerBank -= nextCost;
            turbo.turboLevelerPurchases++;
            const axis = applyOneTurboScensionRandomLevel();
            const labels = ["Burn rate", "Boost tank", "Boost multiplier", "Meter fill"];
            const now = axis === 0 ? turbo.turboScensionBurnLevel : axis === 1 ? turbo.turboScensionTankLevel : axis === 2 ? turbo.turboScensionMultLevel : turbo.turboScensionFillLevel;
            dep.addToLog("Turbo Leveler: +1 " + labels[axis] + " (now level " + now + ").", "system");
            turbo.turboBoostMeter = Math.min(turbo.turboBoostMeter, dep.getTurboMeterMax());
            any = true;
            nextCost = getTurboLevelerNextPointCost();
        }
        if (any) {
            dep.markMeaningfulProgress();
            dep.updateTurboBoostUI({ force: true });
            dep.updateRateDisplay();
            dep.autosaveNow();
        }
    }

    function addTurboBoostMeter(points) {
        const turbo = dep.getTurbo();
        if (!turbo.turboBoostUnlocked || points <= 0) return;
        const totals = dep.computeAscensionGrantTotals();
        if (!turbo.turboBoostEnabled) {
            points *= (totals.turboOffMeterFillMult || 1);
            points *= 1 + getBlackHolePhase2PhotonShellOffTurboFillBonus(dep.getBlackHoleState());
        }
        const maxM = dep.getTurboMeterMax();
        const prev = turbo.turboBoostMeter;
        let popupPts = points;
        if (isTurboLevelerMode()) {
            const space = Math.max(0, maxM - turbo.turboBoostMeter);
            const toMeter = Math.min(points, space);
            if (toMeter > 0) turbo.turboBoostMeter = Math.min(maxM, turbo.turboBoostMeter + toMeter);
            popupPts = toMeter;
            const overflow = points - toMeter;
            if (overflow > 0 && turbo.turboBoostMeter >= maxM - 1e-12) {
                turbo.turboLevelerBank += overflow;
                tryTurboLevelerPurchases();
            }
        } else {
            turbo.turboBoostMeter = Math.min(maxM, turbo.turboBoostMeter + points);
        }
        if (turbo.turboBoostMeter > prev && dep.turboBoostFillEl) {
            showTurboGainPopup(popupPts > 0 ? popupPts : points);
            dep.turboBoostFillEl.classList.remove("turbo-boost-fill-gain");
            void dep.turboBoostFillEl.offsetWidth;
            dep.turboBoostFillEl.classList.add("turbo-boost-fill-gain");
            setTimeout(() => dep.turboBoostFillEl.classList.remove("turbo-boost-fill-gain"), 400);
        }
        dep.updateTurboBoostUI({ force: true });
    }

    function updateTurboBurn(dtSec) {
        const turbo = dep.getTurbo();
        if (!turbo.turboBoostUnlocked || !turbo.turboBoostEnabled || turbo.turboBoostMeter <= 0) return;
        const meterMax = dep.getTurboMeterMax();
        const totals = dep.computeAscensionGrantTotals();
        const drain = getTurboBurnDrainForStep(dtSec, {
            meter: turbo.turboBoostMeter,
            meterMax,
            nominalBurnPerSec: getTurboNominalBurnPerSecFromState(totals, turbo.turboScensionBurnLevel),
            totals
        });
        turbo.turboBoostMeter = Math.max(0, turbo.turboBoostMeter - drain);
        if (turbo.turboBoostMeter <= 0) {
            turbo.turboBoostEnabled = false;
            dep.syncTurboBoostToggleDomFromBoot(false);
            dep.updateRateDisplay();
        }
        if (drain > 0 && dep.turboBoostGaugeEl) {
            dep.turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning");
            void dep.turboBoostGaugeEl.offsetWidth;
            dep.turboBoostGaugeEl.classList.add("turbo-boost-gauge-burning");
            setTimeout(() => dep.turboBoostGaugeEl.classList.remove("turbo-boost-gauge-burning"), 250);
        }
        dep.updateTurboBoostUI({ force: true });
    }

    function getTurboActivationEarnMultPerTick() {
        return getTurboActivationEarnMultFromBonus(
            getBlackHolePhase2ErgosphereTurboActivationBonus(dep.getBlackHoleState())
        );
    }

    function earnTurboActivationsFromTick() {
        const turbo = dep.getTurbo();
        const result = earnFractionalTurboActivations(turbo.turboActivationEarnAccumulator, getTurboActivationEarnMultPerTick());
        turbo.turboActivationEarnAccumulator = result.accumulator;
        if (result.earned > 0) turbo.turboActivationCount += result.earned;
    }

    function applyTurboPassiveMeterRegen(dtSec) {
        const turbo = dep.getTurbo();
        if (!turbo.turboBoostUnlocked || !turbo.turboBoostEnabled || turbo.turboBoostMeter <= 0) return;
        const rate = dep.computeAscensionGrantTotals().turboPassiveMeterPerSec || 0;
        if (!(rate > 0) || !(dtSec > 0)) return;
        const maxM = dep.getTurboMeterMax();
        if (turbo.turboBoostMeter >= maxM) return;
        turbo.turboBoostMeter = Math.min(maxM, turbo.turboBoostMeter + rate * dtSec * getTurboScensionFillMult());
    }

    function formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill) {
        const turbo = dep.getTurbo();
        const labels = ["Burn rate", "Boost tank", "Boost multiplier", "Meter fill"];
        const gained = [gainedBurn, gainedTank, gainedMult, gainedFill || 0];
        const parts = [];
        for (let i = 0; i < 4; i++) {
            const n = gained[i];
            if (n <= 0) continue;
            const now = i === 0 ? turbo.turboScensionBurnLevel : i === 1 ? turbo.turboScensionTankLevel : i === 2 ? turbo.turboScensionMultLevel : turbo.turboScensionFillLevel;
            parts.push("+" + n + " " + labels[i] + " (now level " + now + ")");
        }
        return parts.length ? "Turbo-scension: " + parts.join("; ") + "." : "";
    }

    function getTurboScensionUpgradeActivationEtaHint() {
        const turbo = dep.getTurbo();
        const cost = getTurboScensionActivationCost();
        const need = cost - turbo.turboActivationCount;
        if (need <= 0) return "";
        const basePerSec = 1000 / GAME_LOOP_MS;
        const perSec = basePerSec * getTurboActivationEarnMultPerTick();
        if (!turbo.turboBoostEnabled || turbo.turboBoostMeter <= 0) {
            return " Turn Turbo ON with charge in the meter to earn activations (~" + Math.round(perSec) + "/s — one per " + (GAME_LOOP_MS / 1000) + "s tick while boost runs). Refill the gauge with combos if it is empty.";
        }
        const secApprox = need / perSec;
        const dur = formatUpgradeAffordEtaDuration(secApprox).replace(/ at current rate/g, "").trim();
        return " Roughly " + dur + " of Turbo runtime at full tick rate to afford this if the meter stays charged (drain slows near empty; an empty meter turns Turbo off).";
    }

    function tryTurboScensionActivationUpgrade(opts) {
        opts = opts || {};
        const turbo = dep.getTurbo();
        if (!dep.isTurboScensionUnlocked() || !turbo.turboBoostUnlocked || dep.gameplaySimFrozen()) return false;
        const cost = getTurboScensionActivationCost();
        if (turbo.turboActivationCount < cost) return false;
        turbo.turboActivationCount -= cost;
        const rolls = getTurboScensionUpgradeRollCount();
        const allAxes = !!dep.computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
        let gainedBurn = 0;
        let gainedTank = 0;
        let gainedMult = 0;
        let gainedFill = 0;
        if (allAxes) {
            for (let r = 0; r < rolls; r++) {
                turbo.turboScensionBurnLevel++;
                turbo.turboScensionTankLevel++;
                turbo.turboScensionMultLevel++;
                turbo.turboScensionFillLevel++;
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
        turbo.turboBoostMeter = Math.min(turbo.turboBoostMeter, dep.getTurboMeterMax());
        dep.markMeaningfulProgress();
        if (!opts.skipUIUpdate) {
            dep.updateTurboBoostUI({ force: true });
            dep.updateRateDisplay();
        }
        if (!opts.skipAutosave) dep.autosaveNow();
        if (!opts.skipLog) {
            const line = formatTurboScensionUpgradeTipLine(gainedBurn, gainedTank, gainedMult, gainedFill);
            if (line) dep.addToLog(line, "system");
        }
        return true;
    }

    return {
        getTurboScensionActivationCost,
        getTurboScensionUpgradeRollCount,
        getTurboScensionFillMult,
        getTurboComboPoints,
        getTurboNominalBurnPerSec,
        getTurboBoostMultiplierFromState,
        getTurboCountMultiplier,
        getTurboCountMultiplierFromMeter,
        tryTurboLevelerPurchases,
        addTurboBoostMeter,
        updateTurboBurn,
        getTurboActivationEarnMultPerTick,
        earnTurboActivationsFromTick,
        applyTurboPassiveMeterRegen,
        getTurboLevelerNextPointCost,
        getTurboScensionUpgradeActivationEtaHint,
        tryTurboScensionActivationUpgrade
    };
}
