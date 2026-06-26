import { BASE_MAX_CHEAPEN_LEVEL } from "../upgrades/n1-upgrades.js";
import {
    getTimeWarpAuraSpawnSpanMaxSecFromTotals,
    getTimeWarpOverflowRatioFromTotals
} from "../upgrades/n1-time-warp.js";
import {
    getTurboCountMultiplierMaxFromState,
    getTurboMeterMaxFromState,
    turboMeterCurveScaleFromTotals as turboMeterCurveScaleFromTotalsRule
} from "../upgrades/n1-turbo.js";
import { applyAutobuyGrantToUnlockedHands } from "../upgrades/n1-autobuy-state.js";

const ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID = "asc_ix_00";
const ASCENSION_NODE_AUTOBUY_CHEAPEN_ID = "asc_ix_05";
const ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID = "asc_ix_10";

/**
 * Ascension-tree grant accessors + autobuy/hand-floor side effects (Phase 21c).
 *
 * @param {object} dep
 */
export function createAscensionGrantAccessorsBoot(dep) {
    function ascensionAutobuyDefaultOnForNewHands() {
        return dep.ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID);
    }

    function ascensionAutobuyIncludesCheapen() {
        return dep.ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_CHEAPEN_ID);
    }

    function ascensionAutobuyIncludesSlowdown() {
        return dep.ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID);
    }

    function applyAscensionAutobuyGrantToUnlockedHands() {
        if (!ascensionAutobuyDefaultOnForNewHands()) return;
        dep.getAutobuy().autoBuyUnlocked = true;
        dep.ensureSpeedRows();
        applyAutobuyGrantToUnlockedHands(
            dep.getAutoBuyEnabledByHand(),
            dep.getUnlockedHands(),
            true
        );
        dep.syncAllAutobuyTogglesFromState();
    }

    function getAscensionHandUnlockStartingCountFloor() {
        const raw = dep.computeAscensionGrantTotals().handUnlockStartingCount;
        if (typeof raw === "bigint") {
            if (raw <= 0n) return 0;
            const cap = BigInt(Number.MAX_SAFE_INTEGER);
            return raw > cap ? Number.MAX_SAFE_INTEGER : Number(raw);
        }
        return Math.max(0, Math.floor(Number(raw) || 0));
    }

    function applyAscensionHandUnlockStartingCountFloorToUnlockedHands() {
        if (!dep.getNumber1HasAscended()) return false;
        const floor = getAscensionHandUnlockStartingCountFloor();
        if (floor <= 0) return false;
        const run = dep.getRun();
        let any = false;
        for (let i = 0; i < run.unlockedHands; i++) {
            const cur = run.handEarnings[i] || 0;
            if (cur < floor) {
                run.handEarnings[i] = floor;
                any = true;
            }
        }
        if (any) {
            dep.refreshTotalFromHandEarnings();
            if (dep.incrementalEl) dep.incrementalEl.textContent = dep.formatCount(run.totalChanges);
            dep.updateObjectives();
            dep.updateMilestoneUI();
            dep.updateSpeedUpgradeUI();
            dep.updateCheapenUpgradeUI();
            dep.updateSlowdownUpgradeUI();
            dep.updateTimeWarpAuraUI();
            dep.getComboForward().updateEarnedBonusesUI();
            dep.updatePageButtonUnlocks();
        }
        return any;
    }

    function getAscensionCheapenCapBonusFromTree() {
        return dep.computeAscensionGrantTotals().cheapenCap;
    }

    function getAscensionTurboScalingBonusFromTree() {
        return dep.computeAscensionGrantTotals().turboScaling;
    }

    function getAscensionWarpOverflowBonusFromTree() {
        return dep.computeAscensionGrantTotals().warpOverflow;
    }

    function getMaxCheapenLevel() {
        return BASE_MAX_CHEAPEN_LEVEL + getAscensionCheapenCapBonusFromTree();
    }

    function turboMeterCurveScaleFromTotals(t) {
        return turboMeterCurveScaleFromTotalsRule(t);
    }

    function getTurboMeterCurveScale() {
        return turboMeterCurveScaleFromTotals(dep.computeAscensionGrantTotals());
    }

    function getTurboMeterMax() {
        return getTurboMeterMaxFromState(dep.computeAscensionGrantTotals(), dep.getTurboScensionTankLevel());
    }

    function getTurboCountMultiplierMax() {
        return getTurboCountMultiplierMaxFromState(
            getAscensionTurboScalingBonusFromTree(),
            dep.getTurboScensionMultLevel()
        );
    }

    function getTimeWarpOverflowRatio() {
        return getTimeWarpOverflowRatioFromTotals(dep.computeAscensionGrantTotals());
    }

    function getTimeWarpAuraSpawnSpanMaxSec() {
        return getTimeWarpAuraSpawnSpanMaxSecFromTotals(dep.computeAscensionGrantTotals());
    }

    return {
        ascensionAutobuyDefaultOnForNewHands,
        ascensionAutobuyIncludesCheapen,
        ascensionAutobuyIncludesSlowdown,
        applyAscensionAutobuyGrantToUnlockedHands,
        getAscensionHandUnlockStartingCountFloor,
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
        getAscensionCheapenCapBonusFromTree,
        getAscensionTurboScalingBonusFromTree,
        getAscensionWarpOverflowBonusFromTree,
        getMaxCheapenLevel,
        turboMeterCurveScaleFromTotals,
        getTurboMeterCurveScale,
        getTurboMeterMax,
        getTurboCountMultiplierMax,
        getTimeWarpOverflowRatio,
        getTimeWarpAuraSpawnSpanMaxSec
    };
}
