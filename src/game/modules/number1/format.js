const NAMES = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion"];

function magnitudeNameForTier(tier) {
    return NAMES[tier] || "e" + tier * 3;
}

/** Rounded mantissa for tier×3 exponent (avoids float noise like 1.000000000001). */
function formatScaledMantissa(n, tier, decimalPlaces) {
    const scale = Math.pow(10, tier * 3);
    let mant = n / scale;
    if (decimalPlaces <= 0) return String(Math.round(mant));
    const pow = Math.pow(10, decimalPlaces);
    mant = Math.round(mant * pow) / pow;
    return mant.toFixed(decimalPlaces);
}

export function formatWithCommas(n) {
    if (n < 1000) return String(n);
    const parts = String(n).split(".");
    const withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? withCommas + "." + parts[1] : withCommas;
}

export function formatCount(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x < 0) return "0";
    if (x < 1e6) {
        if (x < 1000) return formatWithCommas(x);
        return formatWithCommas(Math.round(x));
    }
    const exp = Math.floor(Math.log10(x));
    const tier = Math.floor(exp / 3);
    return formatScaledMantissa(x, tier, 2) + " " + magnitudeNameForTier(tier);
}

/** Short-lived “+N” turbo (or similar) popups — never stringify raw floats. */
export function formatSignedCountGain(points) {
    const x = Number(points);
    if (!Number.isFinite(x) || x <= 0) return "+0";
    return "+" + formatCount(x);
}

export function formatSeconds(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return h + "h " + m + "m " + r + "s";
    if (m > 0) return m + "m " + r + "s";
    return r + "s";
}

/** Compact multiplier text to keep top-center CPS line readable. */
export function formatCompactMultiplier(v) {
    const n = Number(v) || 0;
    if (!(n > 0)) return "0";
    if (n >= 1e6) return formatCount(n);
    if (n >= 1e3) return n.toFixed(1);
    if (n >= 10) return n.toFixed(2);
    return n.toFixed(3);
}

/**
 * Turbo multiplier (gauge + top row): commas under 1e6, magnitude names above.
 * At most one decimal; no decimals when the rounded value's integer part is 100+.
 */
export function formatTurboBoostMultiplierForDisplay(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return "0×";
    if (n < 1e6) {
        let x;
        if (n >= 100) {
            x = Math.round(n);
        } else {
            x = Math.round(n * 10) / 10;
            if (Math.abs(x - Math.round(x)) < 1e-6) x = Math.round(x);
        }
        return formatWithCommas(x) + "×";
    }
    const exp = Math.floor(Math.log10(n));
    const tier = Math.floor(exp / 3);
    const man = n / Math.pow(10, tier * 3);
    let manStr;
    if (man >= 100) {
        manStr = formatWithCommas(Math.round(man));
    } else {
        const r = Math.round(man * 10) / 10;
        if (Math.abs(r - Math.round(r)) < 1e-6) manStr = formatWithCommas(Math.round(r));
        else manStr = formatWithCommas(r);
    }
    return manStr + " " + magnitudeNameForTier(tier) + "×";
}

/** Turbo-scension level lines: whole numbers only (internal bank/cost may be fractional). */
export function formatTurboScensionLevelDisplay(n) {
    const r = Math.round(Number(n) || 0);
    if (!Number.isFinite(r) || r <= 0) return "0";
    if (r < 1e6) return formatWithCommas(r);
    const exp = Math.floor(Math.log10(r));
    const tier = Math.floor(exp / 3);
    const mantissa = Math.round(r / Math.pow(10, tier * 3));
    return mantissa + " " + magnitudeNameForTier(tier);
}
