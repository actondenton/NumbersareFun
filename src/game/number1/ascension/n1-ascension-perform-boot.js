import { resetAutobuyHandArrays } from "../upgrades/n1-autobuy-state.js";
import { createNumber1AscensionPerform } from "./n1-ascension-perform.js";

function resetLevelArray(arr, maxHands) {
    arr.length = maxHands;
    for (let i = 0; i < maxHands; i++) arr[i] = 0;
}

/**
 * Ascension perform side-effect hooks (economy reset, lanes, turbo, UI refresh) — Phase 21c.
 *
 * @param {object} dep
 */
export function wireNumber1AscensionPerform(dep) {
    return createNumber1AscensionPerform({
        isNumber1AscensionReady: dep.isNumber1AscensionReady,
        clearActionLogBacklogOnAscension: dep.clearActionLogBacklogOnAscension,
        getAscensionGainBreakdown: dep.getAscensionGainBreakdown,
        getNumber1AscensionEssence: dep.getNumber1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle: dep.getArcEssenceMultiplierBonusPhraseTitle,
        addToLog: dep.addToLog,
        markMeaningfulProgress: dep.markMeaningfulProgress,
        autosaveNow: dep.autosaveNow,
        applyAscensionEssenceGrantAndResetWarpClapBonuses(gain) {
            const ascension = dep.getAscension();
            const blackHole = dep.getBlackHole();
            ascension.number1AscensionEssence += gain;
            blackHole.number1BlackHoleState.phase6JetBestAscensionEssence = Math.max(
                blackHole.number1BlackHoleState.phase6JetBestAscensionEssence || 0,
                gain
            );
            ascension.number1AscensionPendingBonusEssence = 0;
            ascension.number1AscensionClapEssenceMultiplier = 1;
            ascension.number1AscensionClapEssenceProcCount = 0;
            ascension.number1HasAscended = true;
            dep.updateNumber2SidebarUnlockUI();
        },
        shrinkHandsUiToSingleHandKeepingFirst() {
            dep.shrinkSpeedRowsTo(1);
            const handsRt = dep.getHandsRt();
            while (handsRt.hands.length > 1) {
                const h = handsRt.hands.pop();
                if (h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
            }
        },
        bootstrapLanesArraysAutobuyTimeWarpCheapenFlagsForAscension() {
            const run = dep.getRun();
            const maxHands = dep.getMaxHands();
            const handsRt = dep.getHandsRt();
            const upgrades = dep.getUpgrades();
            const timewarp = dep.getTimewarp();
            const autobuy = dep.getAutobuy();

            run.unlockedHands = 1;
            run.handEarnings = Array(maxHands).fill(0);
            const ascHandStartFloor = dep.getAscensionHandUnlockStartingCountFloor();
            run.handEarnings[0] = ascHandStartFloor > 0 ? ascHandStartFloor : 1;
            resetLevelArray(handsRt.speedLevel, maxHands);
            resetLevelArray(handsRt.speedBonusLevel, maxHands);
            resetLevelArray(handsRt.clapCooldownUntilMsByHand, maxHands);
            handsRt.clapDigitPrevious.length = maxHands;
            for (let i = 0; i < maxHands; i++) handsRt.clapDigitPrevious[i] = -1;
            resetLevelArray(upgrades.cheapenLevel, maxHands);
            resetLevelArray(upgrades.cheapenBonusLevel, maxHands);
            resetLevelArray(upgrades.slowdownLevel, maxHands);
            resetLevelArray(upgrades.slowdownBonusLevel, maxHands);
            run.slowdownCompactionUnlockedLatched = false;
            upgrades.slowdownUnlockLogged = false;
            timewarp.timeWarpAuraActiveByHand = [];
            timewarp.timeWarpAuraAppearedAtMsByHand = [];
            timewarp.timeWarpNextSpawnInSec = 0;
            timewarp.timeWarpUnlockLogged = false;
            const autobuyDefaultAsc = dep.ascensionAutobuyDefaultOnForNewHands();
            autobuy.autoBuyUnlocked = autobuyDefaultAsc;
            resetAutobuyHandArrays(
                dep.getAutoBuyEnabledByHand(),
                dep.getAutoBuyCountdownSecondsByHand(),
                autobuyDefaultAsc
            );
            dep.setCheapenSectionUnlocked(false);
            dep.getCheapenAutoBuyCountdownByHand().length = 0;
            dep.getSlowdownAutoBuyCountdownByHand().length = 0;
        },
        resetTurboAfterAscension() {
            const turbo = dep.getTurbo();
            turbo.turboBoostMeter = 0;
            turbo.turboBoostUnlocked = false;
            turbo.turboBoostEnabled = true;
            turbo.turboActivationCount = 0;
            turbo.turboActivationEarnAccumulator = 0;
            turbo.turboScensionBurnLevel = 0;
            turbo.turboScensionTankLevel = 0;
            turbo.turboScensionMultLevel = 0;
            turbo.turboScensionFillLevel = 0;
            turbo.turboLevelerBank = 0;
            turbo.turboLevelerPurchases = 0;
            const turboBoostEnabledCheckbox = dep.turboBoostEnabledCheckbox;
            if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = true;
            const turboBoostToggleLabelEl = dep.turboBoostToggleLabelEl;
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = "On";
            const turboBoostWrapEl = dep.turboBoostWrapEl;
            if (turboBoostWrapEl) {
                turboBoostWrapEl.style.display = "none";
                turboBoostWrapEl.setAttribute("aria-hidden", "true");
            }
        },
        resetCombosDiscoveryAndObjectivesAfterAscension() {
            const combo = dep.getCombo();
            const objectivesRt = dep.getObjectivesRt();
            combo.earnedComboNames.length = 0;
            combo.comboActivationCounts = {};
            combo.comboDiscoveryMilestonePendingQueue.length = 0;
            combo.comboDiscoveryMilestoneReadyAtMs = 0;
            combo.comboDiscoveryMilestoneCooldownSpanMs = 0;
            dep.getComboForward().resetComboIndexFilters();
            combo.previousTickActiveComboNames = new Set();
            objectivesRt.objectivesAchieved.fill(false);
        },
        rebindPrimaryHandIntoFirstMountAndRender() {
            const handsRt = dep.getHandsRt();
            const speedRowRefs = dep.getSpeedRowRefs();
            const h0 = handsRt.hands[0];
            if (!h0) return;
            h0.count = 1;
            h0.tickAccBig = 0n;
            if (h0.el && speedRowRefs[0] && speedRowRefs[0].handMountEl && h0.el.parentNode !== speedRowRefs[0].handMountEl) {
                speedRowRefs[0].handMountEl.appendChild(h0.el);
            }
            h0.render();
        },
        recalculateTotalsHideUpgradeStripeIfBare() {
            const run = dep.getRun();
            run.number1RunPeakTotalCount = 0;
            dep.refreshTotalFromHandEarnings();
            const upgradeContainer = dep.upgradeContainer;
            if (upgradeContainer && run.totalChanges < 10) {
                upgradeContainer.classList.remove("show-upgrade-content");
            }
            dep.incrementalEl.textContent = dep.formatCount(run.totalChanges);
        },
        refreshAllStaleUiAfterAscension() {
            dep.ensureSpeedRows();
            dep.applyAscensionAutobuyGrantToUnlockedHands();
            dep.syncAllAutobuyTogglesFromState();
            dep.updateObjectives();
            dep.updateMilestoneUI();
            dep.updateSpeedUpgradeUI();
            dep.updateCheapenUpgradeUI();
            dep.updateSlowdownUpgradeUI();
            dep.updateTimeWarpAuraUI();
            dep.updateRateDisplay();
            dep.updateTurboBoostUI({ force: true });
            dep.getComboForward().updateComboUI();
            dep.getComboForward().updateEarnedBonusesUI();
            dep.updatePageButtonUnlocks();
            dep.refreshOverviewAndAscensionPanelsIfOpen();
        }
    });
}
