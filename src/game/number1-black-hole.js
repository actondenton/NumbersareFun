/** Number 1 black-hole tuning and state defaults. Runtime behavior is still wired from legacy-boot. */

/** Legacy phase-2 style mass constants. */
export const BLACK_HOLE_MULT_PER_LEVEL = 1.035;
export const BLACK_HOLE_COST_BASE = 400;
export const BLACK_HOLE_COST_GROWTH = 1.38;
export const BLACK_HOLE_MAX_LEVEL = 400;
export const BLACK_HOLE_PHASE1_ESSENCE_TARGET = 350;
export const BLACK_HOLE_PHASE4_WAVE_BASE_SEC = 60;
export const BLACK_HOLE_PHASE4_WAVE_MIN_SEC = 15;
export const BLACK_HOLE_PHASE4_WAVE_BOOST_MULT = 100;
export const BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC = 5;
export const BLACK_HOLE_FURNACE_MULT_PER_POWER = 2.5;
export const BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS = 0.18;
export const BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS = 0.18;
export const BLACK_HOLE_FURNACE_SHORTER_ORBIT_TRIM = 0.08;
export const BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS = 12000;
export const BLACK_HOLE_EVAPORATION_CAP = 1e308;
export const BLACK_HOLE_DIGEST_BASE_MS = 24 * 3600 * 1000;
/** Mass steps in Phase 2 before transition to accretion (Phase 3); must match tryBuy transition. */
export const BLACK_HOLE_PHASE2_MASS_CAP = 60;
/** Purchases per collapse track before Essence can pour into mass (Phase 2). */
export const BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER = 3;
/** Essence cost multiplier for all Phase 2 costs (upgrades + mass steps). */
export const BLACK_HOLE_PHASE2_COST_MULT = 10;
export const BLACK_HOLE_SCREEN_FX_MS = 1800;

export function createNumber1BlackHoleState() {
    return {
        phase: 0,
        phase1EssenceSpent: 0,
        phase2Mass: 0,
        /** Essence banked toward the next Phase 2 mass step (partial feeds). */
        phase2EssenceBank: 0,
        /** Phase 2 collapse upgrades (0-3 each). All three must reach 3 before mass pour unlocks. */
        phase2CollapseMassTier: 0,
        phase2CollapsePhotonTier: 0,
        phase2CollapseErgosphereTier: 0,
        phase2ParallelBonusPool: 0,
        phase3HawkingStrength: 0,
        phase3LuminosityLevel: 0,
        phase3ViscousLevel: 0,
        phase3CoronalLevel: 0,
        /** Essence banked toward the next Phase 3 disk upgrade (partial feeds). */
        phase3EssenceBank: 0,
        phase3HawkingRate: 0,
        phase3HawkingDuration: 0,
        phase3HawkingActiveUntilMs: 0,
        phase3NextHawkingAtMs: 0,
        phase4WaveLevel: 0,
        /** Essence banked toward the next Phase 4 wave upgrade (partial feeds). */
        phase4EssenceBank: 0,
        phase4WaveTriggered: false,
        phase4WaveActiveUntilMs: 0,
        phase4NextWaveAtMs: 0,
        phase4ManualReadyAtMs: 0,
        phase5DigestedHands: 0,
        phase5DigestHandNumber: 0,
        phase5DigestStartedAtMs: 0,
        phase5DigestDurationMs: 0,
        phase5DigestEndsAtMs: 0,
        phase5FurnaceLevel: 0,
        phase5NextSacrificeHand: 10,
        phase5MutationHotterCore: 0,
        phase5MutationEssenceRefinery: 0,
        phase5MutationShorterOrbit: 0,
        phase5PendingMutationHand: 0,
        phase5PendingMutationLevel: 0,
        phase5LastDigestedHand: 0,
        phase5LastDigestCompletedAtMs: 0,
        phase6JetCharge: 0,
        phase6JetActive: false,
        phase6JetBoostLevel: 0,
        phase6JetEfficiencyLevel: 0,
        phase6JetBankLevel: 0,
        /** Essence banked toward the next Phase 6 jet upgrade (legacy bundle fallback). */
        phase6EssenceBank: 0,
        phase6JetIgnited: false,
        phase6JetBestAscensionEssence: 0,
        phase7EpilogueCounter: 0,
        phase7EnteredAtMs: 0,
        evaporationComplete: false,
        /** One-shot "Mass Accumulator unlocked" spectacle (persisted so it plays once per save). */
        phase1VisualUnlockDone: false,
        /** One-shot ascension-map collapse transition after final node purchase. */
        phase1MapCollapseSeen: false
    };
}

export function createNumber1BlackHoleUxFlags() {
    return {
        waveReadyAnnounced: false,
        digestReadyAnnounced: false,
        jetReadyAnnounced: false,
        jetDryAnnounced: false,
        lastPhase2MassFeedAtMs: 0
    };
}

export function createNumber1BlackHoleDevPhasePreset(phase, opts = {}) {
    const p = clampBlackHolePhase(phase);
    const now = Number.isFinite(opts.nowMs) ? Number(opts.nowMs) : Date.now();
    const currentState = opts.currentState && typeof opts.currentState === "object" ? opts.currentState : {};
    const preset = {
        phase: p,
        phase1EssenceSpent: p >= 2 ? BLACK_HOLE_PHASE1_ESSENCE_TARGET : 0,
        phase2CollapseMassTier: p >= 3 ? BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER : 0,
        phase2CollapsePhotonTier: p >= 3 ? BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER : 0,
        phase2CollapseErgosphereTier: p >= 3 ? BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER : 0,
        phase2Mass: p >= 3 ? BLACK_HOLE_PHASE2_MASS_CAP : (p === 2 ? Math.min(10, BLACK_HOLE_PHASE2_MASS_CAP) : 0),
        phase2EssenceBank: 0,
        phase2ParallelBonusPool: p >= 3 ? 1.5 : (p === 2 ? 0.25 : 0),
        phase3LuminosityLevel: p >= 4 ? 6 : (p === 3 ? 2 : 0),
        phase3ViscousLevel: p >= 4 ? 6 : (p === 3 ? 2 : 0),
        phase3CoronalLevel: p >= 4 ? 6 : (p === 3 ? 2 : 0),
        phase3HawkingStrength: currentState.phase3HawkingStrength || 0,
        phase3EssenceBank: 0,
        phase3HawkingActiveUntilMs: 0,
        phase3NextHawkingAtMs: p >= 3 && p < 6 ? now + 6000 : 0,
        phase4WaveLevel: p >= 5 ? 6 : (p === 4 ? 2 : 0),
        phase4EssenceBank: 0,
        phase4WaveTriggered: p >= 5,
        phase4WaveActiveUntilMs: 0,
        phase4NextWaveAtMs: 0,
        phase4ManualReadyAtMs: p >= 4 && p < 6 ? now : 0,
        phase5DigestedHands: p >= 6 ? 9 : 0,
        phase5DigestHandNumber: 0,
        phase5DigestStartedAtMs: 0,
        phase5DigestDurationMs: 0,
        phase5DigestEndsAtMs: 0,
        phase5FurnaceLevel: p >= 6 ? 9 : 0,
        phase5NextSacrificeHand: p >= 6 ? 1 : 10,
        phase5MutationHotterCore: p >= 6 ? 3 : 0,
        phase5MutationEssenceRefinery: p >= 6 ? 3 : 0,
        phase5MutationShorterOrbit: p >= 6 ? 3 : 0,
        phase5PendingMutationHand: 0,
        phase5PendingMutationLevel: 0,
        phase5LastDigestedHand: p >= 6 ? 2 : 0,
        phase5LastDigestCompletedAtMs: 0,
        phase6JetCharge: p >= 6 ? 500 : 0,
        phase6JetActive: false,
        phase6JetBoostLevel: p >= 6 ? 1 : 0,
        phase6JetEfficiencyLevel: p >= 6 ? 1 : 0,
        phase6JetBankLevel: p >= 6 ? 1 : 0,
        phase6EssenceBank: 0,
        phase6JetIgnited: p >= 7,
        phase6JetBestAscensionEssence: p >= 6 ? Math.max(1000, currentState.phase6JetBestAscensionEssence || 0) : 0,
        phase7EpilogueCounter: p === 7 ? 0 : currentState.phase7EpilogueCounter || 0,
        phase7EnteredAtMs: p === 7 ? now : 0,
        evaporationComplete: p === 7
    };

    syncNumber1BlackHolePhase3LegacyLevel(preset);
    if (p >= 4 && p < 6) {
        preset.phase4NextWaveAtMs = now + Math.round(getBlackHoleWaveIntervalSec(preset) * 1000);
    }

    return preset;
}

export function getBlackHoleNextDigestDurationMs(state) {
    return Math.max(60 * 1000, Math.floor(BLACK_HOLE_DIGEST_BASE_MS * getBlackHolePhase5ShorterOrbitMult(state)));
}

export function syncNumber1BlackHolePhase3LegacyLevel(state) {
    if (!state) return;
    const lum = getBlackHolePhase3TrackLevel(state, "luminosity");
    const vis = getBlackHolePhase3TrackLevel(state, "viscous");
    const cor = getBlackHolePhase3TrackLevel(state, "coronal");
    const min = Math.min(lum, vis, cor);
    state.phase3HawkingStrength = Math.max(state.phase3HawkingStrength || 0, min);
    state.phase3HawkingRate = vis;
    state.phase3HawkingDuration = cor;
}

export function normalizeNumber1BlackHoleStateFromSaveData(savedState, opts = {}) {
    const maxHands = Math.max(1, Math.floor(Number(opts.maxHands) || 10));
    const now = Number.isFinite(opts.nowMs) ? Number(opts.nowMs) : Date.now();
    const legacyBlackHoleLevel = Math.max(0, Math.floor(Number(opts.legacyBlackHoleLevel) || 0));
    const hasSavedState = savedState && typeof savedState === "object";
    const state = hasSavedState
        ? Object.assign(createNumber1BlackHoleState(), savedState)
        : createNumber1BlackHoleState();

    if (hasSavedState) {
        state.phase = clampBlackHolePhase(state.phase);
        state.phase2CollapseMassTier = clampBlackHolePhase2CollapseTier(state.phase2CollapseMassTier);
        state.phase2CollapsePhotonTier = clampBlackHolePhase2CollapseTier(state.phase2CollapsePhotonTier);
        state.phase2CollapseErgosphereTier = clampBlackHolePhase2CollapseTier(state.phase2CollapseErgosphereTier);

        const oldS = Math.max(0, Math.min(6, Math.floor(Number(state.phase3HawkingStrength) || 0)));
        if (!(Number(state.phase3LuminosityLevel) > 0) && oldS > 0) state.phase3LuminosityLevel = oldS;
        if (!(Number(state.phase3ViscousLevel) > 0) && oldS > 0) state.phase3ViscousLevel = oldS;
        if (!(Number(state.phase3CoronalLevel) > 0) && oldS > 0) state.phase3CoronalLevel = oldS;
        syncNumber1BlackHolePhase3LegacyLevel(state);

        state.phase5MutationHotterCore = Math.max(0, Math.floor(Number(state.phase5MutationHotterCore) || 0));
        state.phase5MutationEssenceRefinery = Math.max(0, Math.floor(Number(state.phase5MutationEssenceRefinery) || 0));
        state.phase5MutationShorterOrbit = Math.max(0, Math.floor(Number(state.phase5MutationShorterOrbit) || 0));
        state.phase5PendingMutationHand = Math.max(0, Math.min(maxHands, Math.floor(Number(state.phase5PendingMutationHand) || 0)));
        state.phase5PendingMutationLevel = Math.max(0, Math.floor(Number(state.phase5PendingMutationLevel) || 0));
        state.phase5LastDigestedHand = Math.max(0, Math.min(maxHands, Math.floor(Number(state.phase5LastDigestedHand) || 0)));
        state.phase5LastDigestCompletedAtMs = Math.max(0, Number(state.phase5LastDigestCompletedAtMs) || 0);

        const end = Number(state.phase5DigestEndsAtMs) || 0;
        if (end > now) {
            let duration = Number(state.phase5DigestDurationMs);
            if (!Number.isFinite(duration) || duration <= 0) duration = getBlackHoleNextDigestDurationMs(state);
            let start = Number(state.phase5DigestStartedAtMs);
            if (!Number.isFinite(start) || start <= 0 || start >= end) start = end - duration;
            if (start >= end) start = now;
            state.phase5DigestStartedAtMs = start;
            state.phase5DigestDurationMs = Math.max(1, end - start);
            state.phase5DigestHandNumber = Math.max(1, Math.min(maxHands, Math.floor(Number(state.phase5DigestHandNumber) || state.phase5NextSacrificeHand + 1 || 1)));
        } else {
            state.phase5DigestStartedAtMs = 0;
            state.phase5DigestDurationMs = 0;
            state.phase5DigestEndsAtMs = 0;
            state.phase5DigestHandNumber = 0;
        }

        const phase2Mass = Math.floor(Number(state.phase2Mass) || 0);
        const phase2Bank = Math.floor(Number(state.phase2EssenceBank) || 0);
        const sumTiers =
            state.phase2CollapseMassTier +
            state.phase2CollapsePhotonTier +
            state.phase2CollapseErgosphereTier;
        if (clampBlackHolePhase(state.phase) === 2 && (phase2Mass > 0 || phase2Bank > 0) && sumTiers < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER * 3) {
            state.phase2CollapseMassTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
            state.phase2CollapsePhotonTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
            state.phase2CollapseErgosphereTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
        }
    } else if (legacyBlackHoleLevel > 0) {
        state.phase = 2;
        state.phase2Mass = Math.max(state.phase2Mass || 0, legacyBlackHoleLevel);
        state.phase2CollapseMassTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
        state.phase2CollapsePhotonTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
        state.phase2CollapseErgosphereTier = BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
    }

    return state;
}

export function clampBlackHolePhase(phase) {
    return Math.max(0, Math.min(7, Math.floor(Number(phase) || 0)));
}

export function clampBlackHolePhase2CollapseTier(n) {
    return Math.max(0, Math.min(BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER, Math.floor(Number(n) || 0)));
}

export function getBlackHolePhase2CollapseMassTier(state) {
    return clampBlackHolePhase2CollapseTier(state && state.phase2CollapseMassTier);
}

export function getBlackHolePhase2CollapsePhotonTier(state) {
    return clampBlackHolePhase2CollapseTier(state && state.phase2CollapsePhotonTier);
}

export function getBlackHolePhase2CollapseErgosphereTier(state) {
    return clampBlackHolePhase2CollapseTier(state && state.phase2CollapseErgosphereTier);
}

export function isBlackHolePhase2MassPourUnlocked(state) {
    return (
        getBlackHolePhase2CollapseMassTier(state) >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER &&
        getBlackHolePhase2CollapsePhotonTier(state) >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER &&
        getBlackHolePhase2CollapseErgosphereTier(state) >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER
    );
}

export function getBlackHolePhase2MassCouplingCostMult(state, phase) {
    const t = getBlackHolePhase2CollapseMassTier(state);
    if (t <= 0 || clampBlackHolePhase(phase) !== 2) return 1;
    return 1 / (1 + 0.09 * t);
}

export function getBlackHolePhase2PhotonShellMult(state) {
    const t = getBlackHolePhase2CollapsePhotonTier(state);
    if (t <= 0) return 1;
    return 1 + 0.045 * t;
}

export function getBlackHolePhase2PhotonHawkingCdTrimSec(state) {
    const t = getBlackHolePhase2CollapsePhotonTier(state);
    if (t <= 0) return 0;
    return Math.min(6, 0.75 * t);
}

export function getBlackHolePhase2CollapseUpgradeCost(state, track) {
    let tier = 0;
    let base = 32;
    if (track === "mass") {
        tier = getBlackHolePhase2CollapseMassTier(state);
        base = 30;
    } else if (track === "photon") {
        tier = getBlackHolePhase2CollapsePhotonTier(state);
        base = 34;
    } else if (track === "ergosphere") {
        tier = getBlackHolePhase2CollapseErgosphereTier(state);
        base = 38;
    } else {
        return Number.MAX_SAFE_INTEGER;
    }
    if (tier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER) return 0;
    const raw = base * Math.pow(2.08, tier);
    if (!Number.isFinite(raw) || raw <= 0) return Number.MAX_SAFE_INTEGER;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(raw * BLACK_HOLE_PHASE2_COST_MULT));
}

export function getBlackHolePhase2CostAtLevel(level, massCouplingCostMult) {
    const lv = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP - 1, Math.floor(level)));
    const raw = BLACK_HOLE_COST_BASE * Math.pow(BLACK_HOLE_COST_GROWTH, lv);
    if (!Number.isFinite(raw) || raw <= 0) return Number.MAX_SAFE_INTEGER;
    const scaled = Math.floor(raw * (Number(massCouplingCostMult) || 1));
    return Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.floor(scaled * BLACK_HOLE_PHASE2_COST_MULT)));
}

export function getBlackHolePhase3TrackLevel(state, track) {
    let v = 0;
    if (track === "luminosity") v = state && state.phase3LuminosityLevel;
    else if (track === "viscous") v = state && state.phase3ViscousLevel;
    else if (track === "coronal") v = state && state.phase3CoronalLevel;
    else v = state && state.phase3HawkingStrength;
    return Math.max(0, Math.min(6, Math.floor(Number(v) || 0)));
}

export function getBlackHolePhase3TrackCost(state, track) {
    const level = getBlackHolePhase3TrackLevel(state, track);
    if (level >= 6) return 0;
    const base = track === "luminosity" ? 75 : track === "viscous" ? 85 : 95;
    return base + 25 * level;
}

export function isBlackHolePhase3Complete(state) {
    return getBlackHolePhase3TrackLevel(state, "luminosity") >= 6 &&
        getBlackHolePhase3TrackLevel(state, "viscous") >= 6 &&
        getBlackHolePhase3TrackLevel(state, "coronal") >= 6;
}

export function getBlackHolePhase3UpgradeFrac(state, phase) {
    if (clampBlackHolePhase(phase) !== 3) return 0;
    const level = Math.min(
        getBlackHolePhase3TrackLevel(state, "luminosity"),
        getBlackHolePhase3TrackLevel(state, "viscous"),
        getBlackHolePhase3TrackLevel(state, "coronal")
    );
    if (level >= 6) return 0;
    const bank = Math.max(0, Math.floor(Number(state && state.phase3EssenceBank) || 0));
    const cost = 75 + 25 * level;
    if (!(cost > 0)) return 0;
    return Math.min(1, bank / cost);
}

export function getBlackHolePhase4NextCostEssenceForWave(waveLevel) {
    const level = Math.max(0, Math.floor(Number(waveLevel) || 0));
    if (level >= 6) return 0;
    return 200 + 80 * level;
}

export function getBlackHolePhase6TrackLevel(state, track) {
    let v = 0;
    if (track === "drain") v = state && state.phase6JetEfficiencyLevel;
    else if (track === "boost") v = state && state.phase6JetBoostLevel;
    else if (track === "bank") v = state && state.phase6JetBankLevel;
    return Math.max(0, Math.floor(Number(v) || 0));
}

export function getBlackHolePhase6TrackCost(state, track) {
    const level = getBlackHolePhase6TrackLevel(state, track);
    const base = track === "drain" ? 300 : track === "boost" ? 340 : 320;
    return base + 120 * level;
}

export function getBlackHolePhase6NextJetUpgradeCostEssence(state) {
    const boostLevel = Math.floor(Number(state && state.phase6JetBoostLevel) || 0);
    return 300 + 120 * boostLevel;
}

export function getBlackHolePhase1FillRatio(state) {
    const spent = Math.max(0, Math.floor(Number(state && state.phase1EssenceSpent) || 0));
    return Math.max(0, Math.min(1, spent / BLACK_HOLE_PHASE1_ESSENCE_TARGET));
}

export function getBlackHolePhase1RunCpsMult(state) {
    return 1 + 1.25 * getBlackHolePhase1FillRatio(state);
}

export function getBlackHolePhase1AscensionEssenceMult(state) {
    return 1 + 0.6 * getBlackHolePhase1FillRatio(state);
}

export function getBlackHolePhase1SlowdownCapBonus(state) {
    return Math.floor(6 * getBlackHolePhase1FillRatio(state));
}

export function getBlackHoleWaveIntervalSec(state) {
    const mass = Math.max(0, Math.floor(Number(state && state.phase2Mass) || 0));
    const t = Math.max(0, Math.min(1, mass / 250));
    return BLACK_HOLE_PHASE4_WAVE_BASE_SEC - (BLACK_HOLE_PHASE4_WAVE_BASE_SEC - BLACK_HOLE_PHASE4_WAVE_MIN_SEC) * t;
}

export function getBlackHolePhase5MutationLevel(state, kind) {
    let raw = 0;
    if (kind === "hotter-core") raw = state && state.phase5MutationHotterCore;
    else if (kind === "essence-refinery") raw = state && state.phase5MutationEssenceRefinery;
    else if (kind === "shorter-orbit") raw = state && state.phase5MutationShorterOrbit;
    return Math.max(0, Math.floor(Number(raw) || 0));
}

export function getBlackHolePhase5MutationTotal(state) {
    return getBlackHolePhase5MutationLevel(state, "hotter-core") +
        getBlackHolePhase5MutationLevel(state, "essence-refinery") +
        getBlackHolePhase5MutationLevel(state, "shorter-orbit");
}

export function getBlackHolePhase5HotterCoreMult(state) {
    return 1 + BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS * getBlackHolePhase5MutationLevel(state, "hotter-core");
}

export function getBlackHolePhase5EssenceRefineryBonus(state) {
    return BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS * getBlackHolePhase5MutationLevel(state, "essence-refinery");
}

export function getBlackHolePhase5ShorterOrbitMult(state) {
    const stacks = getBlackHolePhase5MutationLevel(state, "shorter-orbit");
    return Math.max(0.35, Math.pow(1 - BLACK_HOLE_FURNACE_SHORTER_ORBIT_TRIM, stacks));
}

export function getBlackHolePhase5DigestProgressAt(state, nowMs, durationMs) {
    const now = Number(nowMs) || 0;
    const end = Number(state && state.phase5DigestEndsAtMs) || 0;
    if (!(end > now)) return 0;
    const duration = Number(durationMs) || 0;
    let start = Number(state && state.phase5DigestStartedAtMs) || 0;
    if (!(start > 0)) start = end - duration;
    if (!(duration > 0) || now <= start) return 0;
    return Math.max(0, Math.min(1, (now - start) / duration));
}

export function getBlackHolePhase5DigestCurve(progress) {
    const p = Math.max(0, Math.min(1, Number(progress) || 0));
    // Late-weighted, but close to linear so players feel the hand coming online throughout digestion.
    return Math.max(0, Math.min(1, Math.pow(p, 1.225)));
}

export function getBlackHolePhase5EffectiveFurnacePower(state, phase, digestProgress) {
    const completed = Math.max(0, Math.floor(Number(state && state.phase5FurnaceLevel) || 0));
    if (clampBlackHolePhase(phase) !== 5) return completed;
    return completed + getBlackHolePhase5DigestCurve(digestProgress);
}

export function getBlackHoleFurnaceEssenceBonus(state, phase, effectiveFurnacePower) {
    if (clampBlackHolePhase(phase) < 5) return 0;
    return (0.35 + getBlackHolePhase5EssenceRefineryBonus(state)) * effectiveFurnacePower;
}

export function getBlackHoleFurnaceMult(state, phase, effectiveFurnacePower) {
    if (clampBlackHolePhase(phase) < 5) return 1;
    const basePerPower = BLACK_HOLE_FURNACE_MULT_PER_POWER * getBlackHolePhase5HotterCoreMult(state);
    return Math.pow(basePerPower, effectiveFurnacePower);
}
