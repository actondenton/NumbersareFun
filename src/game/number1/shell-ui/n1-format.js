const NAMES = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion"];

export function formatWithCommas(n) {
    if (n < 1000) return String(n);
    const parts = String(n).split(".");
    const withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? withCommas + "." + parts[1] : withCommas;
}

export function formatCount(n) {
    if (n < 1e6) return formatWithCommas(n);
    const exp = Math.floor(Math.log10(n));
    const tier = Math.floor(exp / 3);
    const mantissa = (n / Math.pow(10, tier * 3)).toFixed(2);
    const name = NAMES[tier] || "e" + (tier * 3);
    return mantissa + " " + name;
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

/** Black hole run / production multiplier (ascension panel, preview, gravity strip). */
export function formatBlackHoleMultForUi(v) {
    const x = Number(v);
    if (!Number.isFinite(x) || x < 1) return "1";
    if (x >= 1e4) return x.toExponential(2);
    if (x >= 10) return x.toFixed(2);
    return x.toFixed(3);
}

/** Compact multiplier text to keep top-center CPS line readable. */
export function formatCompactMultiplier(v) {
    const n = Number(v) || 0;
    if (!(n > 0)) return "0";
    if (n >= 1e9) return n.toExponential(2);
    if (n >= 1e6) return n.toExponential(2);
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
    const name = NAMES[tier] || "e" + (tier * 3);
    return manStr + " " + name + "×";
}

/** Turbo-scension level lines: whole numbers only (internal bank/cost may be fractional). */
export function formatTurboScensionLevelDisplay(n) {
    const r = Math.round(Number(n) || 0);
    if (!Number.isFinite(r) || r <= 0) return "0";
    if (r < 1e6) return formatWithCommas(r);
    const exp = Math.floor(Math.log10(r));
    const tier = Math.floor(exp / 3);
    const mantissa = Math.round(r / Math.pow(10, tier * 3));
    const name = NAMES[tier] || "e" + (tier * 3);
    return mantissa + " " + name;
}
