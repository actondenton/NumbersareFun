/**
 * Player-facing copy for black-hole effect previews (Phase 1 pour hover, Phase 2 tier rows).
 * Rules live in number1-black-hole.js; formatters from format.js.
 */

import {
    BLACK_HOLE_PHASE1_ASCENSION_ESSENCE_BONUS_AT_FULL,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE1_RUN_CPS_MULT_MAX,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_COUPLING_COST_DIVISORS,
    BLACK_HOLE_PHASE2_ERGO_TURBO_PER_SEC,
    BLACK_HOLE_PHASE2_PHOTON_COMBO_PERSIST_MIN_HANDS,
    BLACK_HOLE_PHASE2_PHOTON_SHELL_MULT,
    getBlackHolePhase2CollapseErgosphereTier,
    getBlackHolePhase2CollapseMassTier,
    getBlackHolePhase2CollapsePhotonTier,
    getBlackHolePhase2MassCouplingCostMult,
    getBlackHolePhase2ErgosphereTurboDefaultOn,
    getBlackHolePhase2ErgosphereTurboLevelerPassive,
    getBlackHolePhase2ErgosphereTurboPassivePerSec,
    getBlackHolePhase2ErgosphereTurboPassiveRequiresOn
} from "../../number1-black-hole.js";
import { formatCompactMultiplier, formatCount } from "./format.js";
import {
    formatAscensionRunDuration,
    formatAscensionRunTimeMultPct,
    isNumber1AscensionRunTimeRampIncomplete
} from "./ascension-run-time.js";

const PHASE1_DRAG_CAP_STEPS = 6;

/** @param {number} spent */
export function getBlackHolePhase1EffectsAtSpent(spent) {
    const s = Math.max(0, Math.min(BLACK_HOLE_PHASE1_ESSENCE_TARGET, Math.floor(Number(spent) || 0)));
    const fillRatio = s / BLACK_HOLE_PHASE1_ESSENCE_TARGET;
    return {
        spent: s,
        fillRatio,
        fillPct: Math.round(fillRatio * 100),
        inertialMult: Math.pow(BLACK_HOLE_PHASE1_RUN_CPS_MULT_MAX, fillRatio),
        essenceMult: 1 + BLACK_HOLE_PHASE1_ASCENSION_ESSENCE_BONUS_AT_FULL * fillRatio,
        dragCapBonus: Math.floor(PHASE1_DRAG_CAP_STEPS * fillRatio)
    };
}

/**
 * @param {object} state
 * @param {number} pourEssence
 * @param {number} slowdownCapBase — run base before mass bonus (e.g. MAX_SLOWDOWN_LEVEL)
 */
export function getBlackHolePhase1PourPreview(state, pourEssence, slowdownCapBase) {
    const spent = Math.max(0, Math.floor(Number(state && state.phase1EssenceSpent) || 0));
    const pour = Math.max(0, Math.floor(Number(pourEssence) || 0));
    const now = getBlackHolePhase1EffectsAtSpent(spent);
    const afterSpent = Math.min(BLACK_HOLE_PHASE1_ESSENCE_TARGET, spent + pour);
    const after = getBlackHolePhase1EffectsAtSpent(afterSpent);
    const base = Math.max(0, Math.floor(Number(slowdownCapBase) || 0));
    const capNow = base + now.dragCapBonus;
    const capAfter = base + after.dragCapBonus;
    let essenceToNextCap = null;
    if (after.dragCapBonus < PHASE1_DRAG_CAP_STEPS) {
        const needSpent = Math.ceil(((after.dragCapBonus + 1) / PHASE1_DRAG_CAP_STEPS) * BLACK_HOLE_PHASE1_ESSENCE_TARGET);
        essenceToNextCap = Math.max(0, needSpent - afterSpent);
    }
    const inertialFold =
        now.inertialMult > 0 && after.inertialMult > now.inertialMult ? after.inertialMult / now.inertialMult : after.inertialMult;
    return {
        pour,
        spent,
        afterSpent,
        now,
        after,
        capNow,
        capAfter,
        essenceToNextCap,
        inertialFold
    };
}

/** @param {number} actualPour banked essence available now */
export function resolvePhase1PourHoverPreviewPour(state, actualPour, ascendCtx) {
    const spent = Math.max(0, Math.floor(Number(state && state.phase1EssenceSpent) || 0));
    const rem = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - spent);
    const pour = Math.max(0, Math.floor(Number(actualPour) || 0));
    if (pour > 0) return { previewPour: pour, hypothetical: false };
    if (ascendCtx && ascendCtx.ready) {
        const example = Math.min(
            rem,
            Math.max(0, Math.floor(Number(ascendCtx.gainNow && ascendCtx.gainNow.finalGain) || 0))
        );
        if (example > 0) return { previewPour: example, hypothetical: true };
    }
    return { previewPour: 0, hypothetical: false };
}

function formatPhase1MassCompareLine(nowLabel, afterLabel, extra) {
    let html =
        '<span class="asc-black-hole__effect-hint--compare">' +
        '<span class="asc-black-hole__preview-now">' +
        nowLabel +
        "</span>" +
        '<span class="asc-black-hole__preview-arrow"> → </span>' +
        '<span class="asc-black-hole__preview-after">' +
        afterLabel +
        "</span>";
    if (extra) {
        html += '<span class="asc-black-hole__preview-extra"> · ' + extra + "</span>";
    }
    html += "</span>";
    return { hint: "", hintHtml: html };
}

/**
 * @param {object} fmt
 * @param {object} ascendCtx
 */
function formatBlackHolePhase1AscendEffectLine(ascendCtx, fmt) {
    const gainNow = ascendCtx.gainNow || {};
    const gainAfterPour = ascendCtx.gainAfterPour || {};
    const ready = !!ascendCtx.ready;
    const pour = Math.max(0, Math.floor(Number(ascendCtx.pour) || 0));
    const runDurationSec = Math.max(0, Math.floor(Number(ascendCtx.runDurationSec) || 0));
    const runTimeMultPct = Number(ascendCtx.runTimeMultPct) || 0;
    const gainNowVal = Math.max(0, Math.floor(Number(gainNow.finalGain) || 0));
    const gainAfterVal = Math.max(0, Math.floor(Number(gainAfterPour.finalGain) || 0));
    const delta = gainAfterVal - gainNowVal;
    const massNow = Number(gainNow.blackHolePhase1Mult) || 1;
    const massAfter = Number(gainAfterPour.blackHolePhase1Mult) || massNow;
    const runRampIncomplete = isNumber1AscensionRunTimeRampIncomplete(runDurationSec);

    if (!ready) {
        let hint = "Reach the ascension gate on this run first.";
        if (pour > 0) {
            hint =
                "Pour " +
                fmt.formatCount(pour) +
                " → mass payout ×" +
                massAfter.toFixed(2) +
                " (now ×" +
                massNow.toFixed(2) +
                ")";
        }
        return { val: "Not ready", hint };
    }

    let val = "+" + fmt.formatCount(gainNowVal) + " Essence";
    let hint =
        "Run time " +
        formatAscensionRunDuration(runDurationSec) +
        " (" +
        formatAscensionRunTimeMultPct(runTimeMultPct) +
        " payout) · mass ×" +
        massNow.toFixed(2);
    if (pour > 0) {
        hint +=
            " · pour " +
            fmt.formatCount(pour) +
            " → +" +
            fmt.formatCount(gainAfterVal) +
            " Essence";
        if (delta > 0) hint += " (+" + fmt.formatCount(delta) + " vs ascend now)";
        hint += " · mass ×" + massAfter.toFixed(2);
    }
    if (runRampIncomplete) {
        hint += " · waiting past 30s raises run-time payout on any ascend";
    }
    return { val, hint };
}

/**
 * Unified Phase 1 effect rows (mass + this-run ascend). mode: "live" | "pourHover"
 * @param {object} preview from getBlackHolePhase1PourPreview
 * @param {object} ascendCtx from buildPhase1AscendPourContext
 * @param {object} fmt
 * @param {"live"|"pourHover"} mode
 */
export function formatBlackHolePhase1PanelEffectLines(preview, ascendCtx, fmt, mode) {
    const pourHover = mode === "pourHover";
    const now = preview.now;
    const after = preview.after;
    const bankedPour = Math.max(0, Math.floor(Number(ascendCtx.pour) || 0));
    const hasPour = bankedPour > 0;
    const previewPour = Math.max(0, Math.floor(Number(preview.pour) || 0));
    const massPourHover = pourHover && previewPour > 0;
    const hypothetical =
        massPourHover &&
        !hasPour &&
        Math.floor(Number(ascendCtx.hypotheticalPreviewPour) || 0) === previewPour;
    const exampleExtra = hypothetical ? "example " + fmt.formatCount(previewPour) + " Essence" : "";

    const foldStr =
        now.inertialMult > 1 && preview.inertialFold > 1
            ? fmt.formatCompactMultiplier(preview.inertialFold) + "×"
            : "";

    let inertialVal;
    let inertialHint;
    let inertialHintHtml;
    if (massPourHover) {
        inertialVal = "run CPS ×" + fmt.formatCpsMult(after.inertialMult);
        const inertialCompare = formatPhase1MassCompareLine(
            "Now ×" + fmt.formatCpsMult(now.inertialMult),
            "×" + fmt.formatCpsMult(after.inertialMult) + (foldStr ? " (" + foldStr + ")" : ""),
            (exampleExtra || "bar " + after.fillPct + "%")
        );
        inertialHint = inertialCompare.hint;
        inertialHintHtml = inertialCompare.hintHtml;
    } else {
        inertialVal = "run CPS ×" + fmt.formatCpsMult(now.inertialMult);
        if (hasPour && after.inertialMult > now.inertialMult) {
            inertialHint =
                "Pour " +
                fmt.formatCount(bankedPour) +
                " → ×" +
                fmt.formatCpsMult(after.inertialMult) +
                " (now ×" +
                fmt.formatCpsMult(now.inertialMult) +
                ")";
        } else {
            inertialHint = "ticks feel heavier as the bar fills";
        }
    }

    let essenceVal;
    let essenceHint;
    let essenceHintHtml;
    if (massPourHover) {
        essenceVal = "Ascend payout ×" + after.essenceMult.toFixed(2);
        const essenceDelta = after.essenceMult - now.essenceMult;
        const essenceCompare = formatPhase1MassCompareLine(
            "Now ×" + now.essenceMult.toFixed(2),
            "×" +
                after.essenceMult.toFixed(2) +
                (essenceDelta > 0 ? " (+" + essenceDelta.toFixed(2) + ")" : ""),
            exampleExtra || "future ascends"
        );
        essenceHint = essenceCompare.hint;
        essenceHintHtml = essenceCompare.hintHtml;
    } else {
        essenceVal = "Ascend payout ×" + now.essenceMult.toFixed(2);
        if (hasPour && after.essenceMult > now.essenceMult) {
            essenceHint =
                "Pour " +
                fmt.formatCount(bankedPour) +
                " → ×" +
                after.essenceMult.toFixed(2) +
                " (now ×" +
                now.essenceMult.toFixed(2) +
                ")";
        } else {
            essenceHint = "next Number 1 ascend earns more Essence";
        }
    }

    let dragVal;
    let dragHint;
    let dragHintHtml;
    if (massPourHover) {
        dragVal = "Compaction cap " + preview.capAfter;
        const capDelta = preview.capAfter - preview.capNow;
        let dragExtra = "";
        if (preview.capAfter > preview.capNow) {
            dragExtra = "+" + capDelta + " cap";
        } else if (preview.essenceToNextCap != null && preview.essenceToNextCap > 0) {
            dragExtra = "+" + fmt.formatCount(preview.essenceToNextCap) + " to next";
        }
        if (exampleExtra) dragExtra = dragExtra ? exampleExtra + " · " + dragExtra : exampleExtra;
        const dragCompare = formatPhase1MassCompareLine(
            "Now cap " + preview.capNow,
            "cap " + preview.capAfter + (capDelta > 0 ? " (+" + capDelta + ")" : ""),
            dragExtra
        );
        dragHint = dragCompare.hint;
        dragHintHtml = dragCompare.hintHtml;
    } else {
        dragVal = "Compaction cap " + preview.capNow;
        if (hasPour && preview.capAfter > preview.capNow) {
            dragHint =
                "Pour " +
                fmt.formatCount(bankedPour) +
                " → cap " +
                preview.capAfter +
                " (now " +
                preview.capNow +
                ")";
        } else {
            dragHint = "room to lean on Compaction upgrades";
        }
    }

    const ascend = formatBlackHolePhase1AscendEffectLine(ascendCtx, fmt);

    return {
        inertial: { val: inertialVal, hint: inertialHint, hintHtml: inertialHintHtml },
        essence: { val: essenceVal, hint: essenceHint, hintHtml: essenceHintHtml },
        drag: { val: dragVal, hint: dragHint, hintHtml: dragHintHtml },
        ascend
    };
}

/**
 * @param {object} fmt
 * @param {(n: number) => string} fmt.formatCount
 * @param {(m: number) => string} fmt.formatCpsMult
 */
export function formatBlackHolePhase1EffectLines(preview, fmt, opts) {
    const ascendCtx = (opts && opts.ascendCtx) || { pour: 0, ready: false, gainNow: {}, gainAfterPour: {} };
    return formatBlackHolePhase1PanelEffectLines(preview, ascendCtx, fmt, "live");
}

/**
 * @param {object} preview from getBlackHolePhase1PourPreview
 * @param {object} fmt
 * @param {object} [ascendCtx]
 */
export function formatBlackHolePhase1PourHoverLines(preview, fmt, ascendCtx) {
    const ctx = ascendCtx || { pour: preview.pour, ready: false, gainNow: {}, gainAfterPour: {}, pourPreview: preview };
    return formatBlackHolePhase1PanelEffectLines(preview, ctx, fmt, "pourHover");
}

/** @param {object} state */
function stateWithCollapseTier(state, track, tier) {
    const t = Math.max(0, Math.min(BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER, Math.floor(Number(tier) || 0)));
    const s = Object.assign({}, state || {});
    if (track === "mass") s.phase2CollapseMassTier = t;
    else if (track === "photon") s.phase2CollapsePhotonTier = t;
    else if (track === "ergosphere") s.phase2CollapseErgosphereTier = t;
    return s;
}

function massTrackLinesAtTier(state, tierLevel) {
    if (tierLevel <= 0) {
        return {
            summary: "Unlocks Essence–mass coupling: each tier divides mass-step Essence cost by 1,000×."
        };
    }
    const s = stateWithCollapseTier(state, "mass", tierLevel);
    const pct = (getBlackHolePhase2MassCouplingCostMult(s, 2) * 100).toFixed(1);
    return {
        summary:
            "Mass-step Essence costs " +
            pct +
            "% of base (tier " +
            tierLevel +
            " coupling ÷" +
            formatCouplingDivisor(tierLevel) +
            ")."
    };
}

function formatCouplingDivisor(tierLevel) {
    const div = BLACK_HOLE_PHASE2_COUPLING_COST_DIVISORS[tierLevel];
    if (!(div >= 1000)) return String(div);
    const exp = Math.round(Math.log10(div));
    return "1e" + exp;
}

function photonTrackLinesAtTier(tierLevel) {
    if (tierLevel <= 0) {
        return { summary: "Unlocks the photon shell: counting multiplier and combo catalog retention." };
    }
    const mult = BLACK_HOLE_PHASE2_PHOTON_SHELL_MULT[tierLevel - 1] || 1;
    const hands = BLACK_HOLE_PHASE2_PHOTON_COMBO_PERSIST_MIN_HANDS[tierLevel] || 0;
    const handsNote = hands > 0 ? " · combos up to " + hands + " hands stay earned" : "";
    return {
        summary: "Counting ×" + formatCompactMultiplier(mult) + handsNote
    };
}

function ergoTrackLinesAtTier(state, tierLevel) {
    if (tierLevel <= 0) {
        return { summary: "Unlocks passive Turbo meter fill from the ergosphere." };
    }
    const s = stateWithCollapseTier(state, "ergosphere", tierLevel);
    const rate = getBlackHolePhase2ErgosphereTurboPassivePerSec(s);
    const parts = ["+" + formatCount(rate) + "/s Turbo meter"];
    if (getBlackHolePhase2ErgosphereTurboPassiveRequiresOn(s)) {
        parts.push("while Turbo is on");
    } else {
        parts.push("even when Turbo is off");
    }
    if (getBlackHolePhase2ErgosphereTurboLevelerPassive(s)) {
        parts.push("· works with Turbo Leveler");
    }
    if (getBlackHolePhase2ErgosphereTurboDefaultOn(s)) {
        parts.push("· tier 4+ can default Turbo on");
    }
    return { summary: parts.join(" ") };
}

/**
 * @param {object} state
 * @param {"mass"|"photon"|"ergosphere"} track
 */
export function getBlackHolePhase2TrackPreview(state, track) {
    const tier =
        track === "mass"
            ? getBlackHolePhase2CollapseMassTier(state)
            : track === "photon"
              ? getBlackHolePhase2CollapsePhotonTier(state)
              : getBlackHolePhase2CollapseErgosphereTier(state);
    const maxTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
    const current =
        track === "mass"
            ? massTrackLinesAtTier(state, tier)
            : track === "photon"
              ? photonTrackLinesAtTier(tier)
              : ergoTrackLinesAtTier(state, tier);
    const next =
        tier < maxTier
            ? track === "mass"
                ? massTrackLinesAtTier(state, tier + 1)
                : track === "photon"
                  ? photonTrackLinesAtTier(tier + 1)
                  : ergoTrackLinesAtTier(state, tier + 1)
            : null;
    return { tier, maxTier, current, next };
}

/**
 * @param {object} state
 * @param {"mass"|"photon"|"ergosphere"} track
 * @param {(s: string) => string} esc
 */
export function buildBlackHolePhase2TrackEffectHtml(state, track, esc) {
    const p = getBlackHolePhase2TrackPreview(state, track);
    let html = "<span class=\"asc-black-hole__p2-now\"><strong>Now:</strong> " + esc(p.current.summary) + "</span>";
    if (p.next) {
        html += "<span class=\"asc-black-hole__p2-next\"><strong>Next:</strong> " + esc(p.next.summary) + "</span>";
    } else {
        html += "<span class=\"asc-black-hole__p2-next asc-black-hole__p2-next--maxed\">All collapse tiers owned for this track.</span>";
    }
    return html;
}
