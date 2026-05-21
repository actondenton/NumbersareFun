/**
 * Number 1 ascension — runtime grants from purchased skill-tree nodes (extracted from legacy-boot).
 */

import { createAscensionMapUi } from "./modules/number1/ascension.js";
import { createNumber1ComboNearMissAccess } from "./modules/number1/combo-near-miss-access.js";

/**
 * @param {object} deps
 * @param {() => Set<string>} deps.ascensionPurchasedSet
 * @param {() => string[]} deps.getAscensionNodeIds
 * @param {(id: string) => object | undefined} deps.getAscensionNodeById
 * @param {() => boolean} deps.getHasAscended
 * @param {() => number} deps.getUnlockedHands
 * @param {() => number[]} deps.getHandEarnings
 * @param {(i: number, v: number) => void} deps.setHandEarning
 * @param {() => number} deps.getTotalChanges
 * @param {() => void} deps.refreshTotalFromHandEarnings
 * @param {() => Element | null} deps.getIncrementalEl
 * @param {(n: number) => string} deps.formatCount
 * @param {() => void} deps.updateObjectives
 * @param {() => void} deps.updateMilestoneUI
 * @param {() => void} deps.updateSpeedUpgradeUI
 * @param {() => void} deps.updateCheapenUpgradeUI
 * @param {() => void} deps.updateSlowdownUpgradeUI
 * @param {() => void} deps.updateTimeWarpAuraUI
 * @param {() => void} deps.updateEarnedBonusesUI
 * @param {() => void} deps.updatePageButtonUnlocks
 */
export function createN1AscensionGrants(deps) {

    const ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID = "asc_ix_00";
    const ASCENSION_NODE_AUTOBUY_CHEAPEN_ID = "asc_ix_05";
    const ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID = "asc_ix_10";
    function ascensionAutobuyDefaultOnForNewHands() {
        return deps.ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID);
    }
    function ascensionAutobuyIncludesCheapen() {
        return deps.ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_CHEAPEN_ID);
    }
    function ascensionAutobuyIncludesSlowdown() {
        return deps.ascensionPurchasedSet().has(ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID);
    }
    /** Integer grant value; digit strings preserve values beyond Number.MAX_SAFE_INTEGER. */
    function ascensionGrantHandUnlockCountToBigInt(v) {
        if (v == null || v === false) return 0n;
        if (typeof v === "bigint") return v < 0n ? 0n : v;
        if (typeof v === "number" && isFinite(v)) return BigInt(Math.max(0, Math.floor(v)));
        if (typeof v === "string" && /^[0-9]+$/.test(v)) {
            try {
                return BigInt(v);
            } catch (e) {
                return 0n;
            }
        }
        return 0n;
    }
    /** Min count each unlocked hand should have from Velocity ascension nodes; raises totals and can cascade milestone hand unlocks. */
    function getAscensionHandUnlockStartingCountFloor() {
        const raw = computeAscensionGrantTotals().handUnlockStartingCount;
        if (typeof raw === "bigint") {
            if (raw <= 0n) return 0;
            const cap = BigInt(Number.MAX_SAFE_INTEGER);
            return raw > cap ? Number.MAX_SAFE_INTEGER : Number(raw);
        }
        return Math.max(0, Math.floor(Number(raw) || 0));
    }
    function applyAscensionHandUnlockStartingCountFloorToUnlockedHands() {
        if (!deps.getHasAscended()) return false;
        const floor = getAscensionHandUnlockStartingCountFloor();
        if (floor <= 0) return false;
        let any = false;
        for (let i = 0; i < deps.getUnlockedHands(); i++) {
            const cur = deps.getHandEarnings()[i] || 0;
            if (cur < floor) {
                deps.setHandEarning(i, floor);
                any = true;
            }
        }
        if (any) {
            deps.refreshTotalFromHandEarnings();
            const __inc = deps.getIncrementalEl(); if (__inc) __inc.textContent = deps.formatCount(deps.getTotalChanges());
            deps.updateObjectives();
            deps.updateMilestoneUI();
            deps.updateSpeedUpgradeUI();
            deps.updateCheapenUpgradeUI();
            deps.updateSlowdownUpgradeUI();
            deps.updateTimeWarpAuraUI();
            deps.updateEarnedBonusesUI();
            deps.updatePageButtonUnlocks();
        }
        return any;
    }
    const ASCENSION_TURBO_BURN_EFFICIENCY_MAX_REDUCE = 0.99;
    /** Middle-finger only: `comboEarnedPatternMultAdd` multiplies as Π(1 + x) over purchased middle nodes; product capped. */
    const ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP = 10;
    /** Default gap between catalog “Discovered combo” milestones; reduced by middle `comboDiscoveryMilestoneCooldownMult` (× each, min 0.1s). */
    const COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS = 60000;
    const COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS = 100;
    /** `computeAscensionGrantTotals` only depends on purchased node ids — reuse until that set changes. */
    let _ascensionGrantTotalsCacheKey = "";
    let _ascensionGrantTotalsCache = null;
    function computeAscensionGrantTotals() {
        const cacheKey = deps.getAscensionNodeIds().length + "|" + deps.getAscensionNodeIds().slice().sort().join(",");
        if (_ascensionGrantTotalsCacheKey === cacheKey && _ascensionGrantTotalsCache) {
            return _ascensionGrantTotalsCache;
        }
        let cheapenCap = 0;
        let turboScaling = 0;
        let warpOverflow = 0;
        let speedMult = 1;
        let comboMultAdd = 0;
        let comboEarnedPatternMult = 1;
        let comboTurboPointsMult = 1;
        let turboBoostComboFillAdd = 0;
        let autoBuyDelayMult = 1;
        let slowdownCostMult = 1;
        let clapCooldownMult = 1;
        let clapBonusChanceAdd = 0;
        let clapCheapenBonusChanceAdd = 0;
        let clapSlowdownBonusChanceAdd = 0;
        let clapEssenceProcChanceAdd = 0;
        let clapEssenceMultiplierStepAdd = 0;
        let clapCheapenExtraRoll = false;
        let clapCheapenChainRolls = false;
        let clapSlowdownExtraRoll = false;
        let clapSlowdownChainRolls = false;
        let comboClapExtraRoll = false;
        let comboClapChainRolls = false;
        let comboTimeWarpDelayReduceSec = 0;
        let comboTimeWarpDelayReduceMult = 1;
        let warpSpawnIntervalMult = 1;
        let warpManualGrantSeconds = 60;
        let warpAutoBuyAssist = false;
        let warpFactor36AllHandsOverflow = false;
        let warpPotencyMaxTiers = 0;
        let warpClickAscensionEssenceChance = 0;
        let warpOverflowAscensionEssenceChance = 0;
        let turboScensionActivationCostMult = 1;
        let turboBurnEfficiencyReduceSum = 0;
        let turboTankSizeMult = 1;
        let turboBurnRateMult = 1;
        let turboScensionExtraUpgradeRolls = 0;
        let turboLeveler = false;
        let turboScensionAllAxesUpgrade = false;
        let turboMeterFromComboMult = 1;
        let turboMeterDrainMult = 1;
        let turboOffMeterFillMult = 1;
        let turboPassiveMeterPerSec = 0;
        let handUnlockStartingCount = 0n;
        let comboDiscoveryMilestoneCooldownMult = 1;
        deps.getAscensionNodeIds().forEach(id => {
            const def = deps.getAscensionNodeById(id);
            if (!def || !def.grants) return;
            const g = def.grants;
            const capBi = ascensionGrantHandUnlockCountToBigInt(g.handUnlockStartingCount);
            if (capBi > handUnlockStartingCount) handUnlockStartingCount = capBi;
            if (typeof g.cheapenCap === "number") cheapenCap += g.cheapenCap;
            if (typeof g.turboScaling === "number") turboScaling += g.turboScaling;
            if (typeof g.warpOverflow === "number") warpOverflow += g.warpOverflow;
            if (typeof g.speedCostMult === "number" && g.speedCostMult > 0 && g.speedCostMult <= 1) speedMult *= g.speedCostMult;
            if (typeof g.comboMultAdd === "number") comboMultAdd += g.comboMultAdd;
            if (def.finger === "middle" && typeof g.comboEarnedPatternMultAdd === "number" && g.comboEarnedPatternMultAdd > 0) {
                comboEarnedPatternMult *= 1 + g.comboEarnedPatternMultAdd;
            }
            if (def.finger === "middle") {
                if (g.comboClapExtraRoll === true) comboClapExtraRoll = true;
                if (g.comboClapChainRolls === true) comboClapChainRolls = true;
                if (typeof g.comboTimeWarpDelayReduceSec === "number" && g.comboTimeWarpDelayReduceSec > 0) {
                    comboTimeWarpDelayReduceSec += g.comboTimeWarpDelayReduceSec;
                }
                if (typeof g.comboTimeWarpDelayReduceMult === "number" && g.comboTimeWarpDelayReduceMult > 1) {
                    comboTimeWarpDelayReduceMult *= g.comboTimeWarpDelayReduceMult;
                }
                if (typeof g.comboDiscoveryMilestoneCooldownMult === "number" && g.comboDiscoveryMilestoneCooldownMult > 0 && g.comboDiscoveryMilestoneCooldownMult <= 1) {
                    comboDiscoveryMilestoneCooldownMult *= g.comboDiscoveryMilestoneCooldownMult;
                }
            }
            if (typeof g.comboTurboPointsMult === "number" && g.comboTurboPointsMult > 0) comboTurboPointsMult *= 1 + g.comboTurboPointsMult;
            if (typeof g.turboBoostComboFillAdd === "number" && g.turboBoostComboFillAdd > 0) turboBoostComboFillAdd += g.turboBoostComboFillAdd;
            if (typeof g.autoBuyDelayMult === "number" && g.autoBuyDelayMult > 0 && g.autoBuyDelayMult <= 1) autoBuyDelayMult *= g.autoBuyDelayMult;
            if (typeof g.slowdownCostMult === "number" && g.slowdownCostMult > 0 && g.slowdownCostMult <= 1) slowdownCostMult *= g.slowdownCostMult;
            if (typeof g.clapCooldownMult === "number" && g.clapCooldownMult > 0 && g.clapCooldownMult <= 1) clapCooldownMult *= g.clapCooldownMult;
            if (typeof g.clapBonusChanceAdd === "number" && g.clapBonusChanceAdd > 0) clapBonusChanceAdd += g.clapBonusChanceAdd;
            if (typeof g.clapCheapenBonusChanceAdd === "number" && g.clapCheapenBonusChanceAdd > 0) clapCheapenBonusChanceAdd += g.clapCheapenBonusChanceAdd;
            if (typeof g.clapSlowdownBonusChanceAdd === "number" && g.clapSlowdownBonusChanceAdd > 0) clapSlowdownBonusChanceAdd += g.clapSlowdownBonusChanceAdd;
            if (typeof g.clapEssenceProcChanceAdd === "number" && g.clapEssenceProcChanceAdd > 0) clapEssenceProcChanceAdd += g.clapEssenceProcChanceAdd;
            if (typeof g.clapEssenceMultiplierStepAdd === "number" && g.clapEssenceMultiplierStepAdd > 0) clapEssenceMultiplierStepAdd += g.clapEssenceMultiplierStepAdd;
            if (def.finger === "thumb" && g.clapCheapenExtraRoll === true) clapCheapenExtraRoll = true;
            if (def.finger === "thumb" && g.clapCheapenChainRolls === true) clapCheapenChainRolls = true;
            if (def.finger === "thumb" && g.clapSlowdownExtraRoll === true) clapSlowdownExtraRoll = true;
            if (def.finger === "thumb" && g.clapSlowdownChainRolls === true) clapSlowdownChainRolls = true;
            if (typeof g.warpSpawnIntervalMult === "number" && g.warpSpawnIntervalMult > 0 && g.warpSpawnIntervalMult <= 1) {
                warpSpawnIntervalMult *= g.warpSpawnIntervalMult;
            }
            if (def.finger === "pinky" && typeof g.warpManualGrantSeconds === "number" && Number.isFinite(g.warpManualGrantSeconds) && g.warpManualGrantSeconds >= 60) {
                warpManualGrantSeconds = Math.max(warpManualGrantSeconds, g.warpManualGrantSeconds);
            }
            if (def.finger === "pinky" && g.warpAutoBuyAssist === true) warpAutoBuyAssist = true;
            if (def.finger === "pinky" && g.warpFactor36AllHandsOverflow === true) warpFactor36AllHandsOverflow = true;
            if (def.finger === "pinky" && typeof g.warpPotencyMaxTiers === "number" && Number.isFinite(g.warpPotencyMaxTiers) && g.warpPotencyMaxTiers > 0) {
                warpPotencyMaxTiers += Math.floor(g.warpPotencyMaxTiers);
            }
            if (def.finger === "pinky" && typeof g.warpClickAscensionEssenceChance === "number" && Number.isFinite(g.warpClickAscensionEssenceChance) && g.warpClickAscensionEssenceChance > 0) {
                warpClickAscensionEssenceChance += g.warpClickAscensionEssenceChance;
            }
            if (def.finger === "pinky" && typeof g.warpOverflowAscensionEssenceChance === "number" && Number.isFinite(g.warpOverflowAscensionEssenceChance) && g.warpOverflowAscensionEssenceChance > 0) {
                warpOverflowAscensionEssenceChance += g.warpOverflowAscensionEssenceChance;
            }
            if (def.finger === "ring" && typeof g.turboScensionActivationCostMult === "number" && g.turboScensionActivationCostMult > 0 && g.turboScensionActivationCostMult <= 1) {
                turboScensionActivationCostMult *= g.turboScensionActivationCostMult;
            }
            if (def.finger === "ring" && typeof g.turboBurnEfficiencyReduce === "number" && g.turboBurnEfficiencyReduce > 0) {
                turboBurnEfficiencyReduceSum += g.turboBurnEfficiencyReduce;
            }
            if (def.finger === "ring" && typeof g.turboTankSizeMultAdd === "number" && g.turboTankSizeMultAdd > 0) {
                turboTankSizeMult *= 1 + g.turboTankSizeMultAdd;
            }
            if (def.finger === "ring" && typeof g.turboBurnRateMultAdd === "number" && g.turboBurnRateMultAdd > 0) {
                turboBurnRateMult *= 1 + g.turboBurnRateMultAdd;
            }
            if (def.finger === "ring" && g.turboScensionDoubleUpgrade === true) turboScensionExtraUpgradeRolls++;
            if (def.finger === "ring" && g.turboLeveler === true) turboLeveler = true;
            if (def.finger === "ring" && g.turboScensionAllAxesUpgrade === true) turboScensionAllAxesUpgrade = true;
            if (def.finger === "ring" && typeof g.turboMeterFromComboMultAdd === "number" && g.turboMeterFromComboMultAdd > 0) {
                turboMeterFromComboMult *= 1 + g.turboMeterFromComboMultAdd;
            }
            if (def.finger === "ring" && typeof g.turboMeterDrainMult === "number" && g.turboMeterDrainMult > 0 && g.turboMeterDrainMult <= 1) {
                turboMeterDrainMult *= g.turboMeterDrainMult;
            }
            if (def.finger === "ring" && typeof g.turboOffMeterFillMultAdd === "number" && g.turboOffMeterFillMultAdd > 0) {
                turboOffMeterFillMult *= 1 + g.turboOffMeterFillMultAdd;
            }
            if (def.finger === "ring" && typeof g.turboPassiveMeterPerSec === "number" && g.turboPassiveMeterPerSec > 0) {
                turboPassiveMeterPerSec += g.turboPassiveMeterPerSec;
            }
        });
        comboEarnedPatternMult = Math.min(ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP, comboEarnedPatternMult);
        clapBonusChanceAdd = Math.min(0.45, clapBonusChanceAdd);
        clapCheapenBonusChanceAdd = Math.min(0.9, clapCheapenBonusChanceAdd);
        clapSlowdownBonusChanceAdd = Math.min(0.75, clapSlowdownBonusChanceAdd);
        clapEssenceProcChanceAdd = Math.min(0.85, clapEssenceProcChanceAdd);
        clapEssenceMultiplierStepAdd = Math.min(0.05, clapEssenceMultiplierStepAdd);
        turboBurnEfficiencyReduceSum = Math.min(ASCENSION_TURBO_BURN_EFFICIENCY_MAX_REDUCE, turboBurnEfficiencyReduceSum);
        const out = {
            cheapenCap,
            turboScaling,
            warpOverflow,
            speedMult,
            comboMultAdd,
            comboEarnedPatternMult,
            comboTurboPointsMult,
            turboBoostComboFillAdd,
            autoBuyDelayMult,
            slowdownCostMult,
            clapCooldownMult,
            clapBonusChanceAdd,
            clapCheapenBonusChanceAdd,
            clapSlowdownBonusChanceAdd,
            clapEssenceProcChanceAdd,
            clapEssenceMultiplierStepAdd,
            clapCheapenExtraRoll,
            clapCheapenChainRolls,
            clapSlowdownExtraRoll,
            clapSlowdownChainRolls,
            comboClapExtraRoll,
            comboClapChainRolls,
            comboTimeWarpDelayReduceSec,
            comboTimeWarpDelayReduceMult,
            warpSpawnIntervalMult,
            warpManualGrantSeconds,
            warpAutoBuyAssist,
            warpFactor36AllHandsOverflow,
            warpPotencyMaxTiers,
            warpClickAscensionEssenceChance,
            warpOverflowAscensionEssenceChance,
            turboScensionActivationCostMult,
            turboBurnEfficiencyReduceSum,
            turboTankSizeMult,
            turboBurnRateMult,
            turboScensionExtraUpgradeRolls,
            turboLeveler,
            turboScensionAllAxesUpgrade,
            turboMeterFromComboMult,
            turboMeterDrainMult,
            turboOffMeterFillMult,
            turboPassiveMeterPerSec,
            handUnlockStartingCount,
            comboDiscoveryMilestoneCooldownMult
        };
        _ascensionGrantTotalsCacheKey = cacheKey;
        _ascensionGrantTotalsCache = out;
        return out;
    }
    /** Effective delay after a catalog discovery milestone before the next can apply (ascension reduces from 60s, floor 0.1s). */

    function getComboDiscoveryMilestoneCooldownMs() {
        const t = computeAscensionGrantTotals();
        const mult = Number(t.comboDiscoveryMilestoneCooldownMult) || 1;
        const m = Math.max(0, Math.min(1, mult));
        return Math.max(COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS, Math.min(COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS, Math.round(COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS * m)));
    }

    return {
        ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID,
        ASCENSION_NODE_AUTOBUY_CHEAPEN_ID,
        ASCENSION_NODE_AUTOBUY_SLOWDOWN_ID,
        ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP,
        COMBO_DISCOVERY_MILESTONE_COOLDOWN_BASE_MS,
        COMBO_DISCOVERY_MILESTONE_COOLDOWN_MIN_MS,
        ascensionAutobuyDefaultOnForNewHands,
        ascensionAutobuyIncludesCheapen,
        ascensionAutobuyIncludesSlowdown,
        ascensionGrantHandUnlockCountToBigInt,
        getAscensionHandUnlockStartingCountFloor,
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands,
        computeAscensionGrantTotals,
        getComboDiscoveryMilestoneCooldownMs
    };
}

/**
 * Ascension tree export, map UI, near-miss ranks, and “tree complete” gates (boot integration).
 *
 * @param {object} deps
 * @param {() => object} deps.getAscensionTreeExport — e.g. `() => window.ASCENSION_TREE_EXPORT`
 * @param {() => string[]} deps.getAscensionNodeIds
 * @param {(n: number) => string} deps.formatCount
 * @param {() => number} deps.getNumber1AscensionEssence
 * @param {() => boolean} deps.hasAscended
 */
export function createN1AscensionTreeRuntime(deps) {
    const ASCENSION_TREE_EXPORT = deps.getAscensionTreeExport();
    const ASCENSION_TREE_VERSION = ASCENSION_TREE_EXPORT.VERSION;
    const ASCENSION_MAP_NODES = ASCENSION_TREE_EXPORT.NODES;
    const ASCENSION_FINGER_KEYS = ["pinky", "ring", "middle", "index", "thumb"];
    const ASCENSION_MAP_NODE_BY_ID = {};
    ASCENSION_MAP_NODES.forEach(n => {
        ASCENSION_MAP_NODE_BY_ID[n.id] = n;
    });
    const { getNearMissToleranceRanks } = createNumber1ComboNearMissAccess({
        getAscensionNodeIds: deps.getAscensionNodeIds,
        getAscensionNodeById: () => ASCENSION_MAP_NODE_BY_ID
    });
    function ascensionPurchasedSet() {
        return new Set(deps.getAscensionNodeIds());
    }
    const ascMapUi = createAscensionMapUi({
        getAscensionMapNodes: () => ASCENSION_MAP_NODES,
        getAscensionMapNodeById: () => ASCENSION_MAP_NODE_BY_ID,
        ascensionPurchasedSet,
        formatCount: deps.formatCount,
        getNumber1AscensionEssence: deps.getNumber1AscensionEssence,
        hasAscended: deps.hasAscended,
        getAscensionTreeExport: deps.getAscensionTreeExport
    });
    function isNumber1AscensionTreeFullyPurchased() {
        if (!deps.hasAscended() || !ASCENSION_MAP_NODES || ASCENSION_MAP_NODES.length === 0) return false;
        const s = ascensionPurchasedSet();
        for (let i = 0; i < ASCENSION_MAP_NODES.length; i++) {
            if (!s.has(ASCENSION_MAP_NODES[i].id)) return false;
        }
        return true;
    }
    function isBlackHoleArcUnlocked() {
        return deps.hasAscended() && isNumber1AscensionTreeFullyPurchased();
    }
    return {
        ASCENSION_TREE_VERSION,
        ASCENSION_MAP_NODES,
        ASCENSION_FINGER_KEYS,
        ASCENSION_MAP_NODE_BY_ID,
        getNearMissToleranceRanks,
        ascensionPurchasedSet,
        ascMapUi,
        isNumber1AscensionTreeFullyPurchased,
        isBlackHoleArcUnlocked
    };
}
