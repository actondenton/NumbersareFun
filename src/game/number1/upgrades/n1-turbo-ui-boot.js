import { createSyncBhCollapseTurboTierAccents } from "../black-hole/n1-bh-collapse-turbo-tier-accents.js";
import { formatCount, formatTurboBoostMultiplierForDisplay, formatTurboScensionLevelDisplay } from "../shell-ui/n1-format.js";
import { TURBO_SCENSION_AXIS_TITLES } from "./n1-turbo.js";

const TURBO_BOOST_UI_FULL_MIN_MS = 120;

/**
 * Turbo gauge + Turbo-scension panel DOM paint (meter strip + full scision pass).
 *
 * @param {object} dep
 */
export function createTurboUiBoot(dep) {
    let turboBoostUiFullLastMs = 0;
    let turboBoostUiFullDigest = "";
    let turboBoostUiStripLastMeterRounded = NaN;
    let turboBoostUiStripLastMeterMaxRounded = NaN;
    let turboBoostUiStripLastPctRounded = NaN;
    let turboBoostUiStripLastMultStr = "";
    let turboBoostUiStripLastActCount = NaN;
    let turboBoostUiStripLastEnabled = null;

    const syncBhCollapseTurboTierAccents = createSyncBhCollapseTurboTierAccents({
        blackHoleState: dep.getBlackHoleState(),
        getGrantTotals: dep.computeAscensionGrantTotals,
        turboBoostActivationsEl: dep.turboBoostActivationsEl,
        turboBoostToggleLabelEl: dep.turboBoostToggleLabelEl,
        turboScensionLevelerLineEl: dep.turboScensionLevelerLineEl,
        setUpgradeTooltipText: dep.setUpgradeTooltipText
    });
    dep.registerSyncBhCollapseTurboTierAccents(syncBhCollapseTurboTierAccents);

    function computeTurboBoostUiFullDigest() {
        const turbo = dep.getTurbo();
        const u = turbo.turboBoostUnlocked ? 1 : 0;
        if (!u) return "u0";
        const s = dep.isTurboScensionUnlocked() ? 1 : 0;
        if (!s) return "u1|s0|" + Math.round(dep.getTurboMeterMax());
        const actCost = dep.getTurboScensionActivationCost();
        const grants = dep.computeAscensionGrantTotals();
        return [
            "u1|s1",
            Math.round(Number(turbo.turboScensionBurnLevel) || 0),
            Math.round(Number(turbo.turboScensionTankLevel) || 0),
            Math.round(Number(turbo.turboScensionMultLevel) || 0),
            Math.round(Number(turbo.turboScensionFillLevel) || 0),
            actCost, turbo.turboActivationCount,
            dep.getTurboScensionUpgradeRollCount(),
            grants.turboScensionAllAxesUpgrade ? 1 : 0,
            grants.turboLeveler ? 1 : 0,
            grants.turboLeveler ? turbo.turboLevelerBank : 0,
            grants.turboLeveler ? dep.getTurboLevelerNextPointCost() : 0,
            Math.round(dep.getTurboMeterMax()),
        ].join("|");
    }

    function paintTurboBoostScisionFull() {
        const turbo = dep.getTurbo();
        const showScisionPanel = dep.isTurboScensionUnlocked() && turbo.turboBoostUnlocked;
        if (dep.turboScensionPanelEl) {
            dep.turboScensionPanelEl.style.display = showScisionPanel ? "" : "none";
            dep.turboScensionPanelEl.setAttribute("aria-hidden", showScisionPanel ? "false" : "true");
        }
        if (dep.turboRightClusterEl) dep.turboRightClusterEl.classList.toggle("turbo-right-cluster--scision", showScisionPanel);
        if (!showScisionPanel && dep.turboScensionLevelerLineEl) {
            dep.turboScensionLevelerLineEl.style.display = "none";
            dep.turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
        }
        if (showScisionPanel) {
            if (dep.turboScensionBurnLineEl) {
                const lab = dep.turboScensionBurnLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Burn " + Math.round(Number(turbo.turboScensionBurnLevel) || 0);
                dep.setUpgradeTooltipText(dep.turboScensionBurnLineEl, TURBO_SCENSION_AXIS_TITLES[0]);
                dep.turboScensionBurnLineEl.removeAttribute("title");
            }
            if (dep.turboScensionTankLineEl) {
                const lab = dep.turboScensionTankLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Tank " + Math.round(Number(turbo.turboScensionTankLevel) || 0);
                dep.setUpgradeTooltipText(dep.turboScensionTankLineEl, TURBO_SCENSION_AXIS_TITLES[1]);
                dep.turboScensionTankLineEl.removeAttribute("title");
            }
            if (dep.turboScensionMultLineEl) {
                const lab = dep.turboScensionMultLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Mult " + Math.round(Number(turbo.turboScensionMultLevel) || 0);
                dep.setUpgradeTooltipText(dep.turboScensionMultLineEl, TURBO_SCENSION_AXIS_TITLES[2]);
                dep.turboScensionMultLineEl.removeAttribute("title");
            }
            if (dep.turboScensionFillLineEl) {
                const lab = dep.turboScensionFillLineEl.querySelector(".turbo-scension-level-line-label");
                if (lab) lab.textContent = "Fill " + Math.round(Number(turbo.turboScensionFillLevel) || 0);
                dep.setUpgradeTooltipText(dep.turboScensionFillLineEl, TURBO_SCENSION_AXIS_TITLES[3]);
                dep.turboScensionFillLineEl.removeAttribute("title");
            }
            if (dep.turboScensionUpgradeBtn) {
                const actCost = dep.getTurboScensionActivationCost();
                const can = turbo.turboActivationCount >= actCost;
                const rollN = dep.getTurboScensionUpgradeRollCount();
                const allAxes = !!dep.computeAscensionGrantTotals().turboScensionAllAxesUpgrade;
                dep.turboScensionUpgradeBtn.disabled = !can;
                const progress = actCost > 0 ? Math.max(0, Math.min(1, turbo.turboActivationCount / actCost)) : 1;
                dep.setUpgradeButtonProgress(dep.turboScensionUpgradeBtn, progress);
                dep.turboScensionUpgradeBtn.classList.toggle("upgrade-btn--afford-pulse", can);
                const spendLine = can
                    ? (allAxes
                        ? "Spend " + formatCount(actCost) + " activations for +" + rollN + " level each on Burn, Tank, Mult, and Fill (all four, no random)."
                        : "Spend " + formatCount(actCost) + " activations for " + rollN + " independent random level" + (rollN === 1 ? "" : "s") + " among Burn, Tank, Mult, or Fill (equal chance per roll).")
                    : ("Need " + formatCount(actCost) + " activations (have " + formatCount(turbo.turboActivationCount) + ").");
                const eta = dep.getTurboScensionUpgradeActivationEtaHint();
                const foot = "\n\nHover Burn, Tank, Mult, or Fill above to see what each upgrade type does.";
                dep.setUpgradeTooltipText(dep.turboScensionUpgradeBtn, spendLine + eta + foot);
                dep.turboScensionUpgradeBtn.removeAttribute("title");
            }
            if (dep.turboScensionLevelerLineEl) {
                const tl = dep.computeAscensionGrantTotals().turboLeveler === true;
                if (tl) {
                    dep.turboScensionLevelerLineEl.style.display = "";
                    dep.turboScensionLevelerLineEl.setAttribute("aria-hidden", "false");
                    const next = dep.getTurboLevelerNextPointCost();
                    const lab = dep.turboScensionLevelerLineEl.querySelector(".turbo-scension-level-line-label");
                    if (lab) lab.textContent = "Leveler " + formatTurboScensionLevelDisplay(turbo.turboLevelerBank) + " / " + formatTurboScensionLevelDisplay(next) + " pts";
                    dep.turboScensionLevelerLineEl.removeAttribute("title");
                } else {
                    dep.turboScensionLevelerLineEl.style.display = "none";
                    dep.turboScensionLevelerLineEl.setAttribute("aria-hidden", "true");
                }
            }
        }
        syncBhCollapseTurboTierAccents();
    }

    function paintTurboBoostMeterStrip() {
        const turbo = dep.getTurbo();
        if (!dep.turboBoostWrapEl || !turbo.turboBoostUnlocked) return;
        const en = !!turbo.turboBoostEnabled;
        if (turboBoostUiStripLastEnabled !== en) {
            turboBoostUiStripLastEnabled = en;
            if (dep.turboBoostEnabledCheckbox) dep.turboBoostEnabledCheckbox.checked = en;
            if (dep.turboBoostToggleLabelEl) dep.turboBoostToggleLabelEl.textContent = en ? "On" : "Off";
        }
        const meterMax = dep.getTurboMeterMax();
        const pct = Math.min(100, (turbo.turboBoostMeter / meterMax) * 100);
        const pctRounded = Math.round(pct * 10) / 10;
        if (dep.turboBoostFillEl && pctRounded !== turboBoostUiStripLastPctRounded) {
            turboBoostUiStripLastPctRounded = pctRounded;
            dep.turboBoostFillEl.style.width = pctRounded + "%";
        }
        const mr = Math.round(turbo.turboBoostMeter);
        const mmx = Math.round(meterMax);
        if (dep.turboBoostGaugeEl) {
            if (mr !== turboBoostUiStripLastMeterRounded) {
                turboBoostUiStripLastMeterRounded = mr;
                dep.turboBoostGaugeEl.setAttribute("aria-valuenow", mr);
            }
            if (mmx !== turboBoostUiStripLastMeterMaxRounded) {
                turboBoostUiStripLastMeterMaxRounded = mmx;
                dep.turboBoostGaugeEl.setAttribute("aria-valuemax", mmx);
            }
        }
        const multStr = formatTurboBoostMultiplierForDisplay(dep.getTurboCountMultiplierFromMeter());
        if (dep.turboBoostMultiplierEl && multStr !== turboBoostUiStripLastMultStr) {
            turboBoostUiStripLastMultStr = multStr;
            dep.turboBoostMultiplierEl.textContent = multStr;
        }
        if (dep.turboBoostActivationsEl && turbo.turboActivationCount !== turboBoostUiStripLastActCount) {
            turboBoostUiStripLastActCount = turbo.turboActivationCount;
            dep.turboBoostActivationsEl.textContent = "Activations: " + formatCount(turbo.turboActivationCount);
        }
        syncBhCollapseTurboTierAccents();
    }

    /**
     * @param {{ force?: boolean }} [opts] force: immediate Turbo-scision pass (purchases, toggle, load).
     */
    function updateTurboBoostUI(opts) {
        opts = opts || {};
        const force = opts.force === true;
        dep.tryUnlockTurboIfEligible();
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

    return { updateTurboBoostUI };
}
