/**
 * Pure black-hole state spend simulation for upgrade previews.
 * Mirrors purchase logic in n1-black-hole-controller.js without side effects.
 */
import {
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP,
    clampBlackHolePhase,
    getBlackHolePhase2CollapseUpgradeCost,
    getBlackHolePhase2CostAtLevel,
    getBlackHolePhase2MassMultFromEffectiveLevel,
    getBlackHolePhase3TrackCost,
    getBlackHolePhase3TrackLevel,
    getBlackHolePhase4NextCostEssenceForWave,
    getBlackHolePhase6TrackCost,
    getBlackHolePhase6TrackLevel,
    syncNumber1BlackHolePhase3LegacyLevel
} from "./number1-black-hole.js";

export function getPhase2MassMultFromState(state, phase) {
    const s = state;
    const p = clampBlackHolePhase(phase);
    const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(s.phase2Mass) || 0)));
    if (p > 2) {
        if (L <= 0) return 1;
        return getBlackHolePhase2MassMultFromEffectiveLevel(L);
    }
    const bank = Math.max(0, Math.floor(Number(s.phase2EssenceBank) || 0));
    if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return getBlackHolePhase2MassMultFromEffectiveLevel(BLACK_HOLE_PHASE2_MASS_CAP);
    if (L <= 0 && bank <= 0) return 1;
    const cost = getBlackHolePhase2CostAtLevel(L, 1);
    const frac = cost > 0 ? Math.min(1, bank / cost) : 0;
    return getBlackHolePhase2MassMultFromEffectiveLevel(L + frac);
}

export function cloneBlackHoleState(state) {
    return Object.assign({}, state);
}

export function addPhase2ParallelBonusFromEssence(state, spentEssence) {
    const spend = Math.max(0, Math.floor(Number(spentEssence) || 0));
    if (spend <= 0) return 0;
    const before = Math.max(0, Number(state.phase2ParallelBonusPool) || 0);
    const after = Math.min(1.5, before + spend * 0.0001);
    state.phase2ParallelBonusPool = after;
    return Math.max(0, after - before);
}

/** @returns {{ state: object, spent: number }} */
export function applyPhase1PourAll(state, budget) {
    const next = cloneBlackHoleState(state);
    const remaining = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - (next.phase1EssenceSpent || 0));
    const spend = Math.min(remaining, Math.max(0, Math.floor(Number(budget) || 0)));
    if (spend < 1) return { state: next, spent: 0 };
    next.phase1EssenceSpent = Math.min(
        BLACK_HOLE_PHASE1_ESSENCE_TARGET,
        (next.phase1EssenceSpent || 0) + spend
    );
    return { state: next, spent: spend };
}

function incrementPhase2CollapseTier(state, track) {
    if (track === "mass") {
        if (state.phase2CollapseMassTier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return false;
        state.phase2CollapseMassTier = (state.phase2CollapseMassTier || 0) + 1;
        return true;
    }
    if (track === "photon") {
        if (state.phase2CollapsePhotonTier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return false;
        state.phase2CollapsePhotonTier = (state.phase2CollapsePhotonTier || 0) + 1;
        return true;
    }
    if (track === "ergosphere") {
        if (state.phase2CollapseErgosphereTier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return false;
        state.phase2CollapseErgosphereTier = (state.phase2CollapseErgosphereTier || 0) + 1;
        return true;
    }
    return false;
}

/** Buy tiers on one collapse track until budget exhausted. */
export function applyPhase2CollapseBuyTrack(state, track, budget) {
    const next = cloneBlackHoleState(state);
    let pool = Math.max(0, Math.floor(Number(budget) || 0));
    let totalSpent = 0;
    while (pool > 0) {
        const cost = getBlackHolePhase2CollapseUpgradeCost(next, track);
        if (!(cost > 0) || pool < cost) break;
        if (!incrementPhase2CollapseTier(next, track)) break;
        pool -= cost;
        totalSpent += cost;
        addPhase2ParallelBonusFromEssence(next, cost);
    }
    return { state: next, spent: totalSpent };
}

/** State after +1 tier on a collapse track (for display when purchase is not yet affordable). */
export function previewPhase2CollapseAfterOneTier(state, track) {
    const next = cloneBlackHoleState(state);
    if (!incrementPhase2CollapseTier(next, track)) return null;
    return next;
}

/** Pour all Essence into Phase 2 mass (requires mass pour unlocked). */
export function applyPhase2MassPourAll(state, budget) {
    const next = cloneBlackHoleState(state);
    let pool = Math.max(0, Math.floor(Number(budget) || 0));
    if (pool < 1) return { state: next, spent: 0 };
    let L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(next.phase2Mass) || 0)));
    if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return { state: next, spent: 0 };
    let bank = Math.max(0, Math.floor(Number(next.phase2EssenceBank) || 0)) + pool;
    const spent = pool;
    const coupling = 1;
    while (L < BLACK_HOLE_PHASE2_MASS_CAP) {
        const c = getBlackHolePhase2CostAtLevel(L, coupling);
        if (!(c > 0) || bank < c) break;
        bank -= c;
        L++;
    }
    next.phase2Mass = L;
    next.phase2EssenceBank = bank;
    addPhase2ParallelBonusFromEssence(next, spent);
    return { state: next, spent };
}

function incrementPhase3Track(state, track) {
    if (track === "luminosity") {
        if (getBlackHolePhase3TrackLevel(state, track) >= 6) return false;
        state.phase3LuminosityLevel = getBlackHolePhase3TrackLevel(state, track) + 1;
    } else if (track === "viscous") {
        if (getBlackHolePhase3TrackLevel(state, track) >= 6) return false;
        state.phase3ViscousLevel = getBlackHolePhase3TrackLevel(state, track) + 1;
    } else if (track === "coronal") {
        if (getBlackHolePhase3TrackLevel(state, track) >= 6) return false;
        state.phase3CoronalLevel = getBlackHolePhase3TrackLevel(state, track) + 1;
    } else {
        return false;
    }
    syncNumber1BlackHolePhase3LegacyLevel(state);
    return true;
}

export function applyPhase3TrackBuyUntilBroke(state, track, budget) {
    const next = cloneBlackHoleState(state);
    let pool = Math.max(0, Math.floor(Number(budget) || 0));
    let totalSpent = 0;
    while (pool > 0) {
        const cost = getBlackHolePhase3TrackCost(next, track);
        if (!(cost > 0) || pool < cost) break;
        if (!incrementPhase3Track(next, track)) break;
        pool -= cost;
        totalSpent += cost;
    }
    return { state: next, spent: totalSpent };
}

export function applyPhase4WavePourAll(state, budget) {
    const next = cloneBlackHoleState(state);
    let pool = Math.max(0, Math.floor(Number(budget) || 0));
    if (pool < 1) return { state: next, spent: 0 };
    let W = Math.floor(Number(next.phase4WaveLevel) || 0);
    if (W >= 6) return { state: next, spent: 0 };
    let bank = Math.max(0, Math.floor(Number(next.phase4EssenceBank) || 0)) + pool;
    const spent = pool;
    while (W < 6) {
        const c = getBlackHolePhase4NextCostEssenceForWave(W);
        if (bank < c) break;
        bank -= c;
        W++;
    }
    next.phase4WaveLevel = W;
    next.phase4EssenceBank = bank;
    return { state: next, spent };
}

export function applyPhase6TrackBuyUntilBroke(state, track, budget) {
    const next = cloneBlackHoleState(state);
    let pool = Math.max(0, Math.floor(Number(budget) || 0));
    let totalSpent = 0;
    while (pool > 0) {
        const cost = getBlackHolePhase6TrackCost(next, track);
        if (!(cost > 0) || pool < cost) break;
        pool -= cost;
        totalSpent += cost;
        if (track === "drain") {
            next.phase6JetEfficiencyLevel = getBlackHolePhase6TrackLevel(next, track) + 1;
        } else if (track === "boost") {
            next.phase6JetBoostLevel = getBlackHolePhase6TrackLevel(next, track) + 1;
        } else if (track === "bank") {
            next.phase6JetBankLevel = getBlackHolePhase6TrackLevel(next, track) + 1;
        } else {
            break;
        }
    }
    return { state: next, spent: totalSpent };
}
