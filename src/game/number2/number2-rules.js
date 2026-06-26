export const NUMBER2_ACTIVE_ROLLS_PER_SEC = 0.38;
export const NUMBER2_BG_ROLLS_PER_SEC = 0.11;
export const NUMBER2_ASCENSION_READY_TOTAL = 1024;

export const NUMBER_2_MILESTONES = [
    { goalStr: "256", text: "Reach total 256" },
    { goalStr: "65536", text: "Reach total 65,536" },
    { goalStr: "16777216", text: "Reach total 16,777,216" }
];

export function formatNumber2BigIntDisplay(value, formatSmallCount) {
    const b = typeof value === "bigint" ? value : BigInt(value || 0);
    if (b <= BigInt(Number.MAX_SAFE_INTEGER)) return formatSmallCount(Number(b));
    const s = b.toString();
    const exp = s.length - 1;
    const mant = (Number(s.slice(0, Math.min(4, s.length))) / Math.pow(10, Math.min(3, s.length - 1))).toFixed(2);
    return mant + "×10^" + exp;
}

export function isPrimeInt(n) {
    const x = Math.floor(Number(n) || 0);
    if (x < 2) return false;
    if (x === 2) return true;
    if (x % 2 === 0) return false;
    const lim = Math.floor(Math.sqrt(x));
    for (let d = 3; d <= lim; d += 2) {
        if (x % d === 0) return false;
    }
    return true;
}

export function computeNumber2EffectivePDouble(opts) {
    const o = opts || {};
    let p = typeof o.basePDouble === "number" ? o.basePDouble : 0.48;
    const minP = typeof o.minPDouble === "number" ? o.minPDouble : 0.05;
    const maxP = typeof o.maxPDouble === "number" ? o.maxPDouble : 0.95;
    if (o.chanceModsEnabled !== false) {
        if ((o.hotStreakLevel || 0) > 0 && o.hotStreakEnabled !== false) p += (o.hotStreakLevel || 0) * 0.015;
        if ((o.gamblersParadoxLevel || 0) > 0 && o.gamblersParadoxEnabled !== false) p -= (o.gamblersParadoxLevel || 0) * 0.018;
        if ((o.runTheTableLevel || 0) > 0 && o.runTheTableActive) {
            const L = o.runTheTableLevel || 0;
            p += L === 1 ? 0.30 : L === 2 ? 0.35 : 0.40;
        }
    }
    p += o.ascensionPDoubleAdd || 0;
    return Math.max(minP, Math.min(maxP, p));
}

export function computeNumber2ActiveRollsPerSec(ascensionActiveRollMult) {
    return NUMBER2_ACTIVE_ROLLS_PER_SEC * (1 + (ascensionActiveRollMult || 0));
}
