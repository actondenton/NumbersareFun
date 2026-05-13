export function clampFiniteNonNegative(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatCpsForDisplay(cps, formatCount) {
    if (!isFinite(cps) || cps <= 0) return "0/s";
    const rounded = cps < 1e6 ? Math.round(cps * 100) / 100 : cps;
    return formatCount(rounded) + "/s";
}

export function getTickIntervalMsForMultiplier(baseSpeed, multiplier) {
    if (!Number.isFinite(multiplier) || multiplier <= 0) return 0;
    return baseSpeed / multiplier;
}
