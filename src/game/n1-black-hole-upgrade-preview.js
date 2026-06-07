/**
 * Black-hole ascension upgrade preview: projected Essence budget + stat snapshots.
 */
import {
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP,
    clampBlackHolePhase,
    getBlackHolePhase1AscensionEssenceMult,
    getBlackHolePhase1FillRatio,
    getBlackHolePhase1RunCpsMult,
    getBlackHolePhase1SlowdownCapBonus,
    getBlackHolePhase2CollapseErgosphereTier,
    getBlackHolePhase2ErgosphereNextTierTurboActivationBonusPct,
    getBlackHolePhase2ErgosphereTurboActivationBonusPct,
    getBlackHolePhase2CollapseMassTier,
    getBlackHolePhase2CollapsePhotonTier,
    getBlackHolePhase2CostAtLevel,
    getBlackHolePhase2MassCouplingAscensionEssenceBonusPct,
    getBlackHolePhase2MassCouplingNextTierEssenceBonusPct,
    getBlackHolePhase2PhotonShellNextTierOffTurboFillBonusPct,
    getBlackHolePhase2PhotonShellOffTurboFillBonusPct,
    getBlackHolePhase3TrackLevel,
    getBlackHolePhase6TrackLevel,
    getBlackHoleWaveIntervalSec,
    getBlackHoleFurnaceMult,
    getBlackHolePhase5EffectiveFurnacePower,
    isBlackHolePhase2MassPourUnlocked
} from "./number1-black-hole.js";
import { formatBlackHoleMultForUi } from "./n1-format.js";
import {
    applyPhase1PourAll,
    applyPhase2CollapseBuyTrack,
    applyPhase2MassPourAll,
    applyPhase3TrackBuyUntilBroke,
    applyPhase4WavePourAll,
    applyPhase6TrackBuyUntilBroke,
    cloneBlackHoleState,
    getPhase2MassMultFromState,
    previewPhase2CollapseAfterOneTier
} from "./n1-black-hole-spend-sim.js";

/**
 * @param {object} deps
 * @param {() => number} deps.getHeldEssence
 * @param {() => boolean} deps.isAscendReady
 * @param {() => { finalGain: number }} deps.getAscensionGainBreakdown
 */
export function getProjectedEssenceBudget(deps) {
    const held = Math.max(0, Math.floor(Number(deps.getHeldEssence()) || 0));
    if (!deps.isAscendReady()) return held;
    const gain = Math.max(0, Math.floor(Number(deps.getAscensionGainBreakdown().finalGain) || 0));
    return held + gain;
}

function formatCpsMult(m, formatBlackHolePhase1CpsMultForUi) {
    if (typeof formatBlackHolePhase1CpsMultForUi === "function") {
        return formatBlackHolePhase1CpsMultForUi(m);
    }
    return formatBlackHoleMultForUi(m);
}

function formatProductionMult(m, formatBlackHolePhase1CpsMultForUi) {
    if (typeof formatBlackHolePhase1CpsMultForUi === "function") {
        return formatBlackHolePhase1CpsMultForUi(m);
    }
    return formatBlackHoleMultForUi(m);
}

/** Persistent mult (no active Hawking/wave burst windows). */
export function computePreviewProductionMult(state, phase, helpers) {
    const p = clampBlackHolePhase(phase);
    if (p < 1) return 1;
    const massMult = p >= 2 ? getPhase2MassMultFromState(state, p) : 1;
    const p1 = getBlackHolePhase1RunCpsMult(state);
    const furnace =
        p >= 5
            ? getBlackHoleFurnaceMult(state, p, getBlackHolePhase5EffectiveFurnacePower(state, p, 0))
            : 1;
    const jet = p >= 6 && typeof helpers.getJetMult === "function" ? helpers.getJetMult() : 1;
    return massMult * p1 * furnace * jet;
}

function buildPhase1Stats(state, deps) {
    const spent = Math.floor(state.phase1EssenceSpent || 0);
    const fillPct = Math.round(getBlackHolePhase1FillRatio(state) * 100);
    const cpsM = formatCpsMult(getBlackHolePhase1RunCpsMult(state), deps.formatBlackHolePhase1CpsMultForUi);
    const ascM = getBlackHolePhase1AscensionEssenceMult(state).toFixed(2);
    const dragCap = deps.getSlowdownCapBase() + getBlackHolePhase1SlowdownCapBonus(state);
    const mult = computePreviewProductionMult(state, 1, deps);
    return {
        massMeter: "<strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%",
        massFillWidth: String(fillPct),
        inertial: "run CPS ×" + cpsM,
        essence: "Ascend payout ×" + ascM,
        drag: "Compaction cap " + dragCap,
        totalMult: "×" + formatProductionMult(mult, deps.formatBlackHolePhase1CpsMultForUi)
    };
}

function formatEssence(n, formatCount) {
    const v = Math.floor(Number(n) || 0);
    return typeof formatCount === "function" ? formatCount(v) : String(v);
}

function massStepLevel(state) {
    return Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP - 1, Math.floor(Number(state.phase2Mass) || 0)));
}

function buildMassCouplingEffectHtml(state, _phase, esc, _formatCount) {
    const tier = getBlackHolePhase2CollapseMassTier(state);
    const bonusPct = getBlackHolePhase2MassCouplingAscensionEssenceBonusPct(state);
    const nextPct = getBlackHolePhase2MassCouplingNextTierEssenceBonusPct(state);
    const maxTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;

    if (tier <= 0) {
        return (
            "Couples Essence to the mass feed. <strong>Tier 1</strong>: ascend payout <strong>+" +
            esc(String(nextPct)) +
            "%</strong> (additive bonus to Essence at ascension). Tiers stack (+25%, +35%, +40% → <strong>+100%</strong> at tier 3)."
        );
    }

    if (tier >= maxTier) {
        return (
            "Ascend Essence bonus <strong>+" +
            esc(String(bonusPct)) +
            "%</strong> (max · doubles Essence before clap bonuses)."
        );
    }

    return (
        "Ascend Essence bonus <strong>+" +
        esc(String(bonusPct)) +
        "%</strong> · tier <strong>" +
        tier +
        "/" +
        maxTier +
        "</strong>. Next tier: <strong>+" +
        esc(String(nextPct)) +
        "%</strong> more."
    );
}

function buildPhotonShellEffectHtml(state, _phase, esc) {
    const tier = getBlackHolePhase2CollapsePhotonTier(state);
    const bonusPct = getBlackHolePhase2PhotonShellOffTurboFillBonusPct(state);
    const nextPct = getBlackHolePhase2PhotonShellNextTierOffTurboFillBonusPct(state);
    const maxTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;

    if (tier <= 0) {
        return (
            "Wraps the core in a photon shell. <strong>Tier 1</strong>: combo meter fill while Turbo is <strong>off</strong> earns <strong>+" +
            esc(String(nextPct)) +
            "%</strong> (combos still fill the gauge; Turbo-on burn unchanged)."
        );
    }

    if (tier >= maxTier) {
        return (
            "Off-Turbo combo fill <strong>+" +
            esc(String(bonusPct)) +
            "%</strong> (max · doubles meter points from combos with Turbo off)."
        );
    }

    return (
        "Off-Turbo combo fill <strong>+" +
        esc(String(bonusPct)) +
        "%</strong> · tier <strong>" +
        tier +
        "/" +
        maxTier +
        "</strong>. Next tier: <strong>+" +
        esc(String(nextPct)) +
        "%</strong> more."
    );
}

function buildErgosphereEffectHtml(state, esc) {
    const tier = getBlackHolePhase2CollapseErgosphereTier(state);
    const bonusPct = getBlackHolePhase2ErgosphereTurboActivationBonusPct(state);
    const nextPct = getBlackHolePhase2ErgosphereNextTierTurboActivationBonusPct(state);
    const maxTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;

    if (tier <= 0) {
        return (
            "Couples the ergosphere to Turbo-scension. <strong>Tier 1</strong>: earn <strong>+" +
            esc(String(nextPct)) +
            "%</strong> more Turbo activations per second while Turbo is running (spend activations on Burn, Tank, Mult, and Fill)."
        );
    }

    if (tier >= maxTier) {
        return (
            "Turbo activation earn <strong>+" +
            esc(String(bonusPct)) +
            "%</strong> while Turbo runs (max · doubles activations per second)."
        );
    }

    return (
        "Turbo activation earn <strong>+" +
        esc(String(bonusPct)) +
        "%</strong> while Turbo runs · tier <strong>" +
        tier +
        "/" +
        maxTier +
        "</strong>. Next tier: <strong>+" +
        esc(String(nextPct)) +
        "%</strong> more."
    );
}

function buildPhase2CollapseEffectHtml(track, state, esc, formatCount, phase) {
    const p = clampBlackHolePhase(phase);
    if (track === "mass") return buildMassCouplingEffectHtml(state, p, esc, formatCount);
    if (track === "photon") return buildPhotonShellEffectHtml(state, p, esc);
    return buildErgosphereEffectHtml(state, esc);
}

/** Shared copy for panel render + previews. */
export function getPhase2CollapseEffectHtml(track, state, deps) {
    const esc = v => (typeof deps.escapeHtml === "function" ? deps.escapeHtml(String(v)) : String(v));
    const phase = typeof deps.getBlackHolePhase === "function" ? deps.getBlackHolePhase() : 2;
    return buildPhase2CollapseEffectHtml(track, state, esc, deps.formatCount, phase);
}

function buildPhase2TierLabel(track, state) {
    const tier =
        track === "mass"
            ? getBlackHolePhase2CollapseMassTier(state)
            : track === "photon"
              ? getBlackHolePhase2CollapsePhotonTier(state)
              : getBlackHolePhase2CollapseErgosphereTier(state);
    const maxed = tier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
    return maxed ? "max" : tier + "/" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
}

function buildPhase2PhaseStatsLine(state, deps, esc, includeBankLine) {
    const phase = typeof deps.getBlackHolePhase === "function" ? deps.getBlackHolePhase() : 2;
    const mult = computePreviewProductionMult(state, phase, deps);
    const L = Math.floor(state.phase2Mass || 0);
    const massPourUnlock = isBlackHolePhase2MassPourUnlocked(state);
    let bankLine = "";
    if (includeBankLine) {
        const level = massStepLevel(state);
        const nextCost = getBlackHolePhase2CostAtLevel(level, 1);
        const bank = Math.floor(state.phase2EssenceBank || 0);
        bankLine =
            nextCost > 0 && bank > 0
                ? " · Banked toward next step: <strong>" + esc(formatEssence(bank, deps.formatCount)) + "</strong> / " + esc(formatEssence(nextCost, deps.formatCount))
                : nextCost > 0
                  ? " · Next step: <strong>" + esc(formatEssence(nextCost, deps.formatCount)) + "</strong> Essence"
                  : "";
    }
    return (
        "Phase: <strong>2</strong> · Mass pour: <strong>" +
        (massPourUnlock ? "unlocked" : "locked") +
        "</strong> · Mass: <strong>" +
        L +
        "</strong> · Total gain: <strong>×" +
        esc(formatProductionMult(mult, deps.formatBlackHolePhase1CpsMultForUi)) +
        "</strong>" +
        bankLine
    );
}

function buildPhase2Stats(state, deps, actionKey, esc) {
    const parallel = Math.max(0, Number(state.phase2ParallelBonusPool) || 0);
    const parallelPct = Math.min(100, Math.round((parallel / 1.5) * 100));
    const mult = computePreviewProductionMult(state, 2, deps);
    const phase = typeof deps.getBlackHolePhase === "function" ? deps.getBlackHolePhase() : 2;
    const track = actionKey.replace(/^p2-/, "");
    const stats = {
        parallelMeter:
            "<strong>+" + esc((parallel * 100).toFixed(1)) + "%</strong> / +150.0% Essence",
        parallelFillWidth: String(parallelPct),
        totalMult: "×" + formatProductionMult(mult, deps.formatBlackHolePhase1CpsMultForUi),
        phaseStats: buildPhase2PhaseStatsLine(state, deps, esc, track === "pour-mass")
    };
    if (track === "mass" || track === "photon" || track === "ergosphere") {
        stats["p2-tier-" + track] = buildPhase2TierLabel(track, state);
        stats["p2-effect-" + track] = buildPhase2CollapseEffectHtml(track, state, esc, deps.formatCount, phase);
    }
    return stats;
}

function buildPhase3Stats(state, deps, actionKey, esc) {
    const lum = getBlackHolePhase3TrackLevel(state, "luminosity");
    const vis = getBlackHolePhase3TrackLevel(state, "viscous");
    const cor = getBlackHolePhase3TrackLevel(state, "coronal");
    const mult = computePreviewProductionMult(state, 3, deps);
    const track = actionKey.replace(/^p3-/, "");
    const tier = getBlackHolePhase3TrackLevel(state, track);
    const stats = {
        phaseStats:
            "Phase: <strong>3</strong> · Luminosity: <strong>" +
            lum +
            "</strong> · Viscous: <strong>" +
            vis +
            "</strong> · Coronal: <strong>" +
            cor +
            "</strong>",
        totalMult: "×" + formatProductionMult(mult, deps.formatBlackHolePhase1CpsMultForUi)
    };
    stats["p3-tier-" + track] = tier >= 6 ? "max" : tier + "/6";
    return stats;
}

function buildPhase4Stats(state, deps, esc) {
    const W = Math.floor(state.phase4WaveLevel || 0);
    const iv = getBlackHoleWaveIntervalSec(state).toFixed(1);
    return {
        phaseStats:
            "Phase: <strong>4</strong> · Wave lvl: <strong>" +
            W +
            "</strong> · Interval: <strong>" +
            esc(iv) +
            "s</strong>",
        totalMult: "×" + formatProductionMult(computePreviewProductionMult(state, 4, deps), deps.formatBlackHolePhase1CpsMultForUi)
    };
}

function buildPhase6Stats(state, deps, actionKey) {
    const track = actionKey.replace(/^p6-/, "");
    const tier = getBlackHolePhase6TrackLevel(state, track);
    const drain = getBlackHolePhase6TrackLevel(state, "drain");
    const boost = getBlackHolePhase6TrackLevel(state, "boost");
    const bankLvl = getBlackHolePhase6TrackLevel(state, "bank");
    return {
        ["p6-tier-" + track]: String(tier),
        phaseStats:
            "Phase: <strong>6</strong> · Drain: <strong>" +
            drain +
            "</strong> · Boost: <strong>" +
            boost +
            "</strong> · Bank: <strong>" +
            bankLvl +
            "</strong>"
    };
}

function simulateForAction(actionKey, state, budget, phase) {
    if (actionKey === "p1-pour") return applyPhase1PourAll(state, budget).state;
    if (actionKey === "p2-pour-mass") return applyPhase2MassPourAll(state, budget).state;
    if (actionKey.startsWith("p2-")) {
        const track = actionKey.slice(3);
        if (track === "pour-mass") return applyPhase2MassPourAll(state, budget).state;
        return applyPhase2CollapseBuyTrack(state, track, budget).state;
    }
    if (actionKey.startsWith("p3-")) {
        return applyPhase3TrackBuyUntilBroke(state, actionKey.slice(3), budget).state;
    }
    if (actionKey === "p4-pour") return applyPhase4WavePourAll(state, budget).state;
    if (actionKey.startsWith("p6-")) {
        return applyPhase6TrackBuyUntilBroke(state, actionKey.slice(3), budget).state;
    }
    return cloneBlackHoleState(state);
}

function buildStatsForPhase(state, phase, deps, actionKey) {
    const esc = v => (typeof deps.escapeHtml === "function" ? deps.escapeHtml(String(v)) : String(v));
    if (phase === 1 || phase === 0) return buildPhase1Stats(state, deps);
    if (phase === 2) return buildPhase2Stats(state, deps, actionKey, esc);
    if (phase === 3) return buildPhase3Stats(state, deps, actionKey, esc);
    if (phase === 4) return buildPhase4Stats(state, deps, esc);
    if (phase === 6) return buildPhase6Stats(state, deps, actionKey);
    return {};
}

const PHASE2_COLLAPSE_TRACKS = ["mass", "photon", "ergosphere"];

function isPhase2CollapseTrackAction(actionKey) {
    if (!actionKey || !actionKey.startsWith("p2-")) return false;
    const track = actionKey.slice(3);
    return PHASE2_COLLAPSE_TRACKS.indexOf(track) >= 0;
}

function statsEqual(a, b) {
    return Object.keys(b).every(k => a[k] === b[k]);
}

/**
 * @returns {{ current: Record<string, string>, future: Record<string, string>, hint: string } | null}
 */
export function getBlackHoleUpgradePreview(actionKey, deps) {
    if (!actionKey) return null;
    const phase = clampBlackHolePhase(deps.getBlackHolePhase());
    const state = deps.getBlackHoleState();
    if (!state) return null;

    const budget = getProjectedEssenceBudget(deps);
    const current = buildStatsForPhase(state, phase, deps, actionKey);

    if (actionKey === "p5-stoke") {
        if (typeof deps.getStokePreviewStats !== "function") return null;
        const stoke = deps.getStokePreviewStats(budget);
        if (!stoke) return null;
        return {
            current: stoke.current,
            future: stoke.future,
            hint: deps.isAscendReady() ? deps.previewHintReady : deps.previewHintHeldOnly
        };
    }

    const futureState = simulateForAction(actionKey, state, budget, phase);
    let future = buildStatsForPhase(futureState, phase, deps, actionKey);

    let unchanged = statsEqual(current, future);
    if (unchanged && isPhase2CollapseTrackAction(actionKey)) {
        const track = actionKey.slice(3);
        const oneTierState = previewPhase2CollapseAfterOneTier(state, track);
        if (oneTierState) {
            future = buildStatsForPhase(oneTierState, phase, deps, actionKey);
            unchanged = statsEqual(current, future);
        }
    }

    if (budget < 1 && unchanged) return null;

    return {
        current,
        future,
        hint: deps.isAscendReady() ? deps.previewHintReady : deps.previewHintHeldOnly
    };
}

export const PREVIEW_HINT_READY =
    "Preview assumes Essence on hand plus what you'd earn from ascending now, then spending all of it on this action.";
export const PREVIEW_HINT_HELD_ONLY = "Preview uses Essence on hand only (ascend not ready yet).";
