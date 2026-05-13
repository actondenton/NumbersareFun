export const TURBO_UNLOCK_COUNT = 1e12;
export const TURBO_BOOST_METER_BASE_MAX = 100;
export const TURBO_COMBO_POINTS_BASE = 2;
export const TURBO_COMBO_POINTS_EXP_OFFSET = 2;
export const TURBO_COUNT_MULTIPLIER_BASE_MAX = 100;
export const TURBO_MULTIPLIER_CURVE_EXPONENT = 2;
export const TURBO_BURN_RATE_PER_SEC = 3;
export const TURBO_BURN_INTENSITY_K = 8;
export const TURBO_TANK_PEAK_MAX_RATIO = 16;
export const TURBO_TANK_PEAK_WEIGHT = 0.06;
export const TURBO_DRAIN_FLOOR = 0.07;
export const TURBO_DRAIN_PIECE_EXP = 0.55;
export const TURBO_SCENSION_ACTIVATION_BASE_COST = 10000;
export const TURBO_LEVELER_BASE_POINT_COST = 48;
export const TURBO_LEVELER_LINE_TOOLTIP =
    "While Turbo is off, combo fill past a full meter banks here. With Turbo still off, meeting the point cost buys one random Burn/Tank/Mult/Fill level; that cost doubles each purchase.";

/** Burn/Tank/Mult/Fill row copy for upgrade-style detail tooltips (Turbo-scension panel). */
export const TURBO_SCENSION_AXIS_TITLES = [
    "Burn — Each level doubles how fast the meter drains while Turbo is on and strengthens how strongly burn drives boost toward your Mult ceiling. Higher burn empties the tank faster unless you refill with combos or Fill upgrades.",
    "Tank — Each level doubles max meter capacity. Larger tanks hold more charge per fill and adjust peak boost when the gauge is full.",
    "Mult — Each level doubles your Turbo boost ceiling (the × you can approach when burn, tank fullness, and meter align).",
    "Fill — Each level doubles combo-driven meter gains and boosts passive meter regen from Ring while Turbo is on."
];

export function turboMeterCurveScaleFromTotals(totals) {
    return Math.max(1, TURBO_BOOST_METER_BASE_MAX + ((totals && totals.turboScaling) || 0) * 25);
}

export function getTurboMeterMaxFromState(totals, tankLevel) {
    return turboMeterCurveScaleFromTotals(totals) * ((totals && totals.turboTankSizeMult) || 1) * Math.pow(2, Math.max(0, tankLevel));
}

export function getTurboCountMultiplierMaxFromState(turboScaling, multLevel) {
    const base = TURBO_COUNT_MULTIPLIER_BASE_MAX * Math.pow(1.25, turboScaling || 0);
    return base * Math.pow(2, Math.max(0, multLevel));
}

export function getTurboScensionActivationCostFromTotals(totals) {
    const mult = (totals && totals.turboScensionActivationCostMult) || 1;
    return Math.max(1, Math.floor(TURBO_SCENSION_ACTIVATION_BASE_COST * mult));
}

export function getTurboScensionUpgradeRollCountFromTotals(totals) {
    return 1 + ((totals && totals.turboScensionExtraUpgradeRolls) || 0);
}

export function getTurboScensionFillMult(fillLevel) {
    return Math.pow(2, Math.max(0, fillLevel));
}

export function getTurboComboPointsForMinHands(minHands, totals, fillLevel) {
    if (minHands < 2) return 0;
    const basePoints = Math.pow(TURBO_COMBO_POINTS_BASE, minHands - TURBO_COMBO_POINTS_EXP_OFFSET);
    const comboMult = (totals && totals.comboTurboPointsMult) || 1;
    const flatAdd = (totals && totals.turboBoostComboFillAdd) || 0;
    const meterExtra = (totals && totals.turboMeterFromComboMult) || 1;
    return (basePoints * comboMult + flatAdd) * meterExtra * getTurboScensionFillMult(fillLevel);
}

export function getTurboNominalBurnPerSecFromState(totals, burnLevel) {
    const ascBurn = (totals && totals.turboBurnRateMult) || 1;
    return TURBO_BURN_RATE_PER_SEC * Math.pow(2, Math.max(0, burnLevel)) * ascBurn;
}

export function getTurboBurnIntensityRatioFromNominal(nominalBurnPerSec) {
    return nominalBurnPerSec / (nominalBurnPerSec + TURBO_BURN_INTENSITY_K);
}

export function getTurboTankPeakMult(meterMax, curveScale) {
    const tankRatio = Math.min(TURBO_TANK_PEAK_MAX_RATIO, meterMax / Math.max(1e-9, curveScale));
    return 1 + TURBO_TANK_PEAK_WEIGHT * (tankRatio - 1);
}

export function getTurboBoostMultiplierFromState(state) {
    const meterMax = state.meterMax;
    const curveScale = state.curveScale;
    const meter = state.meter;
    const fullness = Math.min(1, meter / Math.max(1e-9, meterMax));
    const burnCurve = Math.pow(
        getTurboBurnIntensityRatioFromNominal(state.nominalBurnPerSec),
        TURBO_MULTIPLIER_CURVE_EXPONENT
    );
    const tankPeakMult = getTurboTankPeakMult(meterMax, curveScale);
    return 1 + burnCurve * (state.multiplierMax - 1) * fullness * tankPeakMult;
}

export function getTurboDrainPiecewiseMultiplier(fullness) {
    const u = Math.max(0, Math.min(1, fullness));
    return TURBO_DRAIN_FLOOR + (1 - TURBO_DRAIN_FLOOR) * Math.pow(u, TURBO_DRAIN_PIECE_EXP);
}

export function getTurboBurnDrainForStep(dtSec, state) {
    const meterMax = state.meterMax;
    const fullness = Math.max(0, Math.min(1, state.meter / Math.max(1e-9, meterMax)));
    const piecewise = getTurboDrainPiecewiseMultiplier(fullness);
    const reduce = (state.totals && state.totals.turboBurnEfficiencyReduceSum) || 0;
    const efficiencyMult = Math.max(0, 1 - reduce);
    const drainMult = (state.totals && state.totals.turboMeterDrainMult) || 1;
    return dtSec * state.nominalBurnPerSec * efficiencyMult * piecewise * drainMult;
}

export function getTurboLevelerNextPointCost(purchases) {
    return TURBO_LEVELER_BASE_POINT_COST * Math.pow(2, purchases);
}
