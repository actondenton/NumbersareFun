export const ASCENSION_1_MIN_HANDS = 10;
export const ASCENSION_1_REQUIRED_TOTAL = 1e35;

const ASC_ESSENCE_ANCHOR_X0 = 35;
const ASC_ESSENCE_ANCHOR_Y0 = 35;
const ASC_ESSENCE_ANCHOR_X1 = 42;
const ASC_ESSENCE_ANCHOR_Y1 = 75;
const ASC_ESSENCE_ANCHOR_X2 = 100;
const ASC_ESSENCE_ANCHOR_Y2 = 1000;
const ASC_ESSENCE_SEGMENT1_POWER = 1.08;
const ASC_ESSENCE_SEGMENT2_POWER = 1.22;

export function getNumber1AscensionPendingBonusEssence(value) {
    const b = Math.floor(Number(value) || 0);
    return b > 0 ? b : 0;
}

export function getNumber1AscensionClapEssenceMultiplier(value) {
    const m = Number(value);
    return Number.isFinite(m) && m >= 1 ? m : 1;
}

/**
 * Base ascension essence scaling on log10(total count).
 * Anchors: 1e35 -> ~35, 1e42 -> ~75, 1e100 -> ~1000.
 */
export function computeNumber1AscensionBaseGain(fromTotal) {
    const t = Math.max(1, Number(fromTotal) || 1);
    const x = Math.max(0, Math.log10(t));
    let y;
    if (x <= ASC_ESSENCE_ANCHOR_X0) {
        y = Math.max(1, x);
    } else if (x <= ASC_ESSENCE_ANCHOR_X1) {
        const u = (x - ASC_ESSENCE_ANCHOR_X0) / (ASC_ESSENCE_ANCHOR_X1 - ASC_ESSENCE_ANCHOR_X0);
        y = ASC_ESSENCE_ANCHOR_Y0 + (ASC_ESSENCE_ANCHOR_Y1 - ASC_ESSENCE_ANCHOR_Y0) * Math.pow(Math.max(0, Math.min(1, u)), ASC_ESSENCE_SEGMENT1_POWER);
    } else if (x <= ASC_ESSENCE_ANCHOR_X2) {
        const u = (x - ASC_ESSENCE_ANCHOR_X1) / (ASC_ESSENCE_ANCHOR_X2 - ASC_ESSENCE_ANCHOR_X1);
        y = ASC_ESSENCE_ANCHOR_Y1 + (ASC_ESSENCE_ANCHOR_Y2 - ASC_ESSENCE_ANCHOR_Y1) * Math.pow(Math.max(0, Math.min(1, u)), ASC_ESSENCE_SEGMENT2_POWER);
    } else {
        const over = x - ASC_ESSENCE_ANCHOR_X2;
        y = ASC_ESSENCE_ANCHOR_Y2 + 80 * Math.pow(over, 0.72);
    }
    return Math.max(1, Math.floor(y));
}

export function computeNumber1AscensionGainBreakdown(fromTotal, opts) {
    const options = opts || {};
    const baseGain = computeNumber1AscensionBaseGain(fromTotal);
    const pendingBonus = getNumber1AscensionPendingBonusEssence(options.pendingBonus);
    const blackHolePhase1Mult = Number(options.blackHolePhase1Mult) || 1;
    const blackHoleParallelBonus = Number(options.blackHoleParallelBonus) || 0;
    const blackHoleFurnaceBonus = Number(options.blackHoleFurnaceBonus) || 0;
    const phaseMult = blackHolePhase1Mult + blackHoleParallelBonus + blackHoleFurnaceBonus;
    const beforeMultRaw = (baseGain + pendingBonus) * Math.max(1, phaseMult);
    const beforeMult = Math.max(baseGain + pendingBonus, Math.floor(beforeMultRaw));
    const clapMult = getNumber1AscensionClapEssenceMultiplier(options.clapMult);
    const finalGain = Math.max(beforeMult, Math.floor(beforeMult * clapMult));
    return {
        baseGain,
        pendingBonus,
        blackHolePhase1Mult,
        blackHoleParallelBonus,
        blackHoleFurnaceBonus,
        blackHolePhaseMult: phaseMult,
        blackHoleMultiplierBonus: Math.max(0, beforeMult - (baseGain + pendingBonus)),
        beforeMult,
        clapMult,
        multiplierBonus: Math.max(0, finalGain - beforeMult),
        finalGain
    };
}

export function computeNumber1AscensionGain(fromTotal, opts) {
    return computeNumber1AscensionGainBreakdown(fromTotal, opts).finalGain;
}

export function getNumber1AscensionRequiredHands(phase, minHands = ASCENSION_1_MIN_HANDS) {
    return phase >= 5 && phase < 7 ? 1 : minHands;
}

export function isNumber1AscensionReady(opts) {
    const options = opts || {};
    if (options.phase === 7) return false;
    const requiredHands = getNumber1AscensionRequiredHands(options.phase, options.minHands);
    return options.unlockedHands >= requiredHands &&
        options.totalChanges >= (options.requiredTotal || ASCENSION_1_REQUIRED_TOTAL);
}
