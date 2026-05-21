/**
 * Number 1 ascension run-time payout multiplier — discourages instant re-ascend loops.
 */

export const ASCENSION_RUN_TIME_RAMP_SEC = 30;
export const ASCENSION_RUN_TIME_TIER2_END_SEC = 120;
export const ASCENSION_RUN_TIME_TIER3_END_SEC = 600;
export const ASCENSION_RUN_TIME_MAX_SEC = 24 * 3600;
export const ASCENSION_RUN_TIME_POST600_STEP_SEC = 60;

/** @param {number} runStartedAtMs @param {number} [nowMs] */
export function getNumber1AscensionRunDurationSec(runStartedAtMs, nowMs) {
    const start = Math.floor(Number(runStartedAtMs) || 0);
    if (!(start > 0)) return 0;
    const now = nowMs != null ? Math.floor(Number(nowMs) || 0) : Date.now();
    return Math.max(0, Math.floor((now - start) / 1000));
}

/** Payout multiplier as a percentage (0–100 = ramp; 101+ = bonus). */
export function getNumber1AscensionRunTimeMultPct(runDurationSec) {
    const t = Math.min(Math.max(0, Math.floor(Number(runDurationSec) || 0)), ASCENSION_RUN_TIME_MAX_SEC);
    if (t <= ASCENSION_RUN_TIME_RAMP_SEC) {
        return (t / ASCENSION_RUN_TIME_RAMP_SEC) * 100;
    }
    if (t <= ASCENSION_RUN_TIME_TIER2_END_SEC) {
        return 101 + ((t - 31) / (ASCENSION_RUN_TIME_TIER2_END_SEC - 31)) * 99;
    }
    if (t <= ASCENSION_RUN_TIME_TIER3_END_SEC) {
        return 201 + ((t - 121) / (ASCENSION_RUN_TIME_TIER3_END_SEC - 121)) * 199;
    }
    return 400 + Math.floor((t - ASCENSION_RUN_TIME_TIER3_END_SEC) / ASCENSION_RUN_TIME_POST600_STEP_SEC);
}

export function isNumber1AscensionRunTimeRampIncomplete(runDurationSec) {
    return Math.floor(Number(runDurationSec) || 0) < ASCENSION_RUN_TIME_RAMP_SEC;
}

export function formatAscensionRunDuration(runDurationSec) {
    const s = Math.max(0, Math.floor(Number(runDurationSec) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return h + "h " + m + "m " + r + "s";
    if (m > 0) return m + "m " + r + "s";
    return r + "s";
}

export function formatAscensionRunTimeMultPct(pct) {
    const p = Number(pct) || 0;
    if (Math.abs(p - Math.round(p)) < 0.05) return Math.round(p) + "%";
    return p.toFixed(1) + "%";
}

/**
 * @param {object} opts
 * @param {number} opts.runDurationSec
 * @param {number} opts.runTimeMultPct
 * @param {(s: string) => string} [opts.esc]
 */
export function buildAscensionRunTimeBannerHtml(opts) {
    const esc = typeof opts.esc === "function" ? opts.esc : s => s;
    const runDurationSec = Math.max(0, Math.floor(Number(opts.runDurationSec) || 0));
    const runTimeMultPct = Number(opts.runTimeMultPct) || 0;
    const warning = isNumber1AscensionRunTimeRampIncomplete(runDurationSec);
    const durationStr = formatAscensionRunDuration(runDurationSec);
    const multStr = formatAscensionRunTimeMultPct(runTimeMultPct);
    const extraClass = warning ? " ascension-run-time-banner--warning" : "";
    const detail = warning
        ? "Reach 30s in this run for full payout — keep playing before you ascend."
        : runTimeMultPct > 100
          ? "Longer runs earn a time bonus on Ascension Essence."
          : "Run time sets your Essence payout multiplier for this ascend.";
    return (
        '<div class="ascension-run-time-banner' +
        extraClass +
        '" data-asc-run-time-banner role="status" aria-live="polite">' +
        '<span class="ascension-run-time-banner__timer">Run time: <strong>' +
        esc(durationStr) +
        "</strong></span>" +
        '<span class="ascension-run-time-banner__mult">Payout: <strong>' +
        esc(multStr) +
        "</strong></span>" +
        '<span class="ascension-run-time-banner__hint">' +
        esc(detail) +
        "</span></div>"
    );
}

/** Short line for confirm dialog / formula footnotes. */
export function formatAscensionRunTimeBreakdownLine(runDurationSec, runTimeMultPct) {
    const durationStr = formatAscensionRunDuration(runDurationSec);
    const multStr = formatAscensionRunTimeMultPct(runTimeMultPct);
    if (isNumber1AscensionRunTimeRampIncomplete(runDurationSec)) {
        return "run time " + durationStr + " (" + multStr + " payout — below 30s minimum)";
    }
    if (runTimeMultPct > 100) {
        return "run time " + durationStr + " (+" + multStr + " time bonus)";
    }
    return "run time " + durationStr + " (" + multStr + " payout)";
}
