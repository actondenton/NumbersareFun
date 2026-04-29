import { describe, expect, it } from "vitest";
import {
    BLACK_HOLE_DIGEST_BASE_MS,
    BLACK_HOLE_EVAPORATION_CAP,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP,
    clampBlackHolePhase,
    clampBlackHolePhase2CollapseTier,
    createNumber1BlackHoleDevPhasePreset,
    createNumber1BlackHoleState,
    createNumber1BlackHoleUxFlags,
    getBlackHoleFurnaceEssenceBonus,
    getBlackHoleFurnaceMult,
    getBlackHolePhase2CollapseUpgradeCost,
    getBlackHolePhase2CostAtLevel,
    getBlackHolePhase2MassCouplingCostMult,
    getBlackHolePhase2PhotonHawkingCdTrimSec,
    getBlackHolePhase2PhotonShellMult,
    getBlackHolePhase1AscensionEssenceMult,
    getBlackHolePhase1FillRatio,
    getBlackHolePhase1RunCpsMult,
    getBlackHolePhase1SlowdownCapBonus,
    getBlackHolePhase3TrackCost,
    getBlackHolePhase3TrackLevel,
    getBlackHolePhase3UpgradeFrac,
    getBlackHolePhase4NextCostEssenceForWave,
    getBlackHolePhase5DigestCurve,
    getBlackHolePhase5DigestProgressAt,
    getBlackHolePhase5EffectiveFurnacePower,
    getBlackHolePhase5EssenceRefineryBonus,
    getBlackHolePhase5HotterCoreMult,
    getBlackHolePhase5MutationTotal,
    getBlackHolePhase5ShorterOrbitMult,
    getBlackHolePhase6NextJetUpgradeCostEssence,
    getBlackHolePhase6TrackCost,
    getBlackHolePhase6TrackLevel,
    getBlackHoleWaveIntervalSec,
    isBlackHolePhase3Complete,
    isBlackHolePhase2MassPourUnlocked,
    normalizeNumber1BlackHoleStateFromSaveData,
    syncNumber1BlackHolePhase3LegacyLevel
} from "./number1-black-hole.js";

describe("number1 black hole defaults", () => {
    it("creates isolated persistent state with expected phase defaults", () => {
        const a = createNumber1BlackHoleState();
        const b = createNumber1BlackHoleState();

        a.phase = 5;
        a.phase5MutationHotterCore = 2;

        expect(b.phase).toBe(0);
        expect(b.phase1EssenceSpent).toBe(0);
        expect(b.phase2CollapseMassTier).toBe(0);
        expect(b.phase2CollapsePhotonTier).toBe(0);
        expect(b.phase2CollapseErgosphereTier).toBe(0);
        expect(b.phase5NextSacrificeHand).toBe(10);
        expect(b.phase6JetActive).toBe(false);
        expect(b.evaporationComplete).toBe(false);
    });

    it("creates isolated non-persistent UX flags", () => {
        const a = createNumber1BlackHoleUxFlags();
        const b = createNumber1BlackHoleUxFlags();

        a.waveReadyAnnounced = true;
        a.lastPhase2MassFeedAtMs = 1234;

        expect(b.waveReadyAnnounced).toBe(false);
        expect(b.digestReadyAnnounced).toBe(false);
        expect(b.jetReadyAnnounced).toBe(false);
        expect(b.jetDryAnnounced).toBe(false);
        expect(b.lastPhase2MassFeedAtMs).toBe(0);
    });

    it("keeps core tuning constants stable", () => {
        expect(BLACK_HOLE_PHASE1_ESSENCE_TARGET).toBe(350);
        expect(BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER).toBe(3);
        expect(BLACK_HOLE_DIGEST_BASE_MS).toBe(24 * 3600 * 1000);
        expect(BLACK_HOLE_EVAPORATION_CAP).toBe(1e308);
    });

    it("clamps phase and Phase 2 collapse tiers", () => {
        expect(clampBlackHolePhase(-4)).toBe(0);
        expect(clampBlackHolePhase(4.9)).toBe(4);
        expect(clampBlackHolePhase(99)).toBe(7);
        expect(clampBlackHolePhase2CollapseTier(-1)).toBe(0);
        expect(clampBlackHolePhase2CollapseTier(2.9)).toBe(2);
        expect(clampBlackHolePhase2CollapseTier(99)).toBe(3);
    });

    it("creates dev phase presets with phase-owned black-hole state", () => {
        const currentState = createNumber1BlackHoleState();
        currentState.phase3HawkingStrength = 6;
        currentState.phase6JetBestAscensionEssence = 2400;
        currentState.phase7EpilogueCounter = 12;

        const phase4 = createNumber1BlackHoleDevPhasePreset(4, {
            currentState,
            nowMs: 1000
        });

        expect(phase4.phase).toBe(4);
        expect(phase4.phase1EssenceSpent).toBe(BLACK_HOLE_PHASE1_ESSENCE_TARGET);
        expect(phase4.phase2Mass).toBe(BLACK_HOLE_PHASE2_MASS_CAP);
        expect(phase4.phase3LuminosityLevel).toBe(6);
        expect(phase4.phase3HawkingStrength).toBe(6);
        expect(phase4.phase4WaveLevel).toBe(2);
        expect(phase4.phase4ManualReadyAtMs).toBe(1000);
        expect(phase4.phase4NextWaveAtMs).toBe(1000 + Math.round(getBlackHoleWaveIntervalSec(phase4) * 1000));
        expect(phase4.phase7EpilogueCounter).toBe(12);

        const phase7 = createNumber1BlackHoleDevPhasePreset(7, {
            currentState,
            nowMs: 2000
        });

        expect(phase7.phase6JetBestAscensionEssence).toBe(2400);
        expect(phase7.phase6JetIgnited).toBe(true);
        expect(phase7.phase7EpilogueCounter).toBe(0);
        expect(phase7.phase7EnteredAtMs).toBe(2000);
        expect(phase7.evaporationComplete).toBe(true);
    });

    it("computes Phase 2 collapse unlocks and costs from state", () => {
        const state = createNumber1BlackHoleState();
        expect(isBlackHolePhase2MassPourUnlocked(state)).toBe(false);
        expect(getBlackHolePhase2CollapseUpgradeCost(state, "mass")).toBe(300);

        state.phase2CollapseMassTier = 3;
        state.phase2CollapsePhotonTier = 1;
        state.phase2CollapseErgosphereTier = 3;

        expect(isBlackHolePhase2MassPourUnlocked(state)).toBe(false);
        expect(getBlackHolePhase2CollapseUpgradeCost(state, "mass")).toBe(0);
        expect(getBlackHolePhase2CollapseUpgradeCost(state, "photon")).toBe(707);
        expect(getBlackHolePhase2MassCouplingCostMult(state, 2)).toBeCloseTo(1 / 1.27);
        expect(getBlackHolePhase2MassCouplingCostMult(state, 3)).toBe(1);
        expect(getBlackHolePhase2PhotonShellMult(state)).toBeCloseTo(1.045);
        expect(getBlackHolePhase2PhotonHawkingCdTrimSec(state)).toBe(0.75);
        expect(getBlackHolePhase2CostAtLevel(0, getBlackHolePhase2MassCouplingCostMult(state, 2))).toBe(3140);

        state.phase2CollapsePhotonTier = 3;
        expect(isBlackHolePhase2MassPourUnlocked(state)).toBe(true);
    });

    it("computes Phase 5 digestion and furnace mutation math", () => {
        const state = createNumber1BlackHoleState();
        state.phase5MutationHotterCore = 2;
        state.phase5MutationEssenceRefinery = 1;
        state.phase5MutationShorterOrbit = 2;
        state.phase5FurnaceLevel = 3;
        state.phase5DigestStartedAtMs = 1000;
        state.phase5DigestEndsAtMs = 2000;

        const progress = getBlackHolePhase5DigestProgressAt(state, 1500, 1000);
        const curved = getBlackHolePhase5DigestCurve(progress);
        const effectivePower = getBlackHolePhase5EffectiveFurnacePower(state, 5, progress);

        expect(progress).toBe(0.5);
        expect(curved).toBeCloseTo(Math.pow(0.5, 1.225));
        expect(getBlackHolePhase5MutationTotal(state)).toBe(5);
        expect(getBlackHolePhase5HotterCoreMult(state)).toBeCloseTo(1.36);
        expect(getBlackHolePhase5EssenceRefineryBonus(state)).toBeCloseTo(0.18);
        expect(getBlackHolePhase5ShorterOrbitMult(state)).toBeCloseTo(0.92 * 0.92);
        expect(effectivePower).toBeCloseTo(3 + curved);
        expect(getBlackHoleFurnaceEssenceBonus(state, 5, effectivePower)).toBeCloseTo(0.53 * effectivePower);
        expect(getBlackHoleFurnaceMult(state, 5, effectivePower)).toBeCloseTo(Math.pow(2.5 * 1.36, effectivePower));
        expect(getBlackHoleFurnaceMult(state, 4, effectivePower)).toBe(1);
    });

    it("computes Phase 1 fill bonuses and wave interval", () => {
        const state = createNumber1BlackHoleState();
        state.phase1EssenceSpent = 175;
        state.phase2Mass = 125;

        expect(getBlackHolePhase1FillRatio(state)).toBe(0.5);
        expect(getBlackHolePhase1RunCpsMult(state)).toBe(1.625);
        expect(getBlackHolePhase1AscensionEssenceMult(state)).toBe(1.3);
        expect(getBlackHolePhase1SlowdownCapBonus(state)).toBe(3);
        expect(getBlackHoleWaveIntervalSec(state)).toBe(37.5);

        state.phase1EssenceSpent = 999;
        state.phase2Mass = 999;
        expect(getBlackHolePhase1FillRatio(state)).toBe(1);
        expect(getBlackHoleWaveIntervalSec(state)).toBe(15);
    });

    it("computes Phase 3 track levels, costs, completion, and banked progress", () => {
        const state = createNumber1BlackHoleState();
        state.phase3LuminosityLevel = 2.9;
        state.phase3ViscousLevel = 2;
        state.phase3CoronalLevel = 3;
        state.phase3EssenceBank = 75;

        expect(getBlackHolePhase3TrackLevel(state, "luminosity")).toBe(2);
        expect(getBlackHolePhase3TrackCost(state, "luminosity")).toBe(125);
        expect(getBlackHolePhase3TrackCost(state, "viscous")).toBe(135);
        expect(getBlackHolePhase3TrackCost(state, "coronal")).toBe(170);
        expect(getBlackHolePhase3UpgradeFrac(state, 3)).toBeCloseTo(75 / 125);
        expect(getBlackHolePhase3UpgradeFrac(state, 4)).toBe(0);
        expect(isBlackHolePhase3Complete(state)).toBe(false);

        state.phase3LuminosityLevel = 6;
        state.phase3ViscousLevel = 6;
        state.phase3CoronalLevel = 6;
        expect(getBlackHolePhase3TrackCost(state, "luminosity")).toBe(0);
        expect(isBlackHolePhase3Complete(state)).toBe(true);
    });

    it("computes Phase 4 and Phase 6 costs from state", () => {
        const state = createNumber1BlackHoleState();
        state.phase6JetBoostLevel = 2;
        state.phase6JetEfficiencyLevel = 1;
        state.phase6JetBankLevel = 3;

        expect(getBlackHolePhase4NextCostEssenceForWave(0)).toBe(200);
        expect(getBlackHolePhase4NextCostEssenceForWave(3)).toBe(440);
        expect(getBlackHolePhase4NextCostEssenceForWave(6)).toBe(0);
        expect(getBlackHolePhase6TrackLevel(state, "drain")).toBe(1);
        expect(getBlackHolePhase6TrackLevel(state, "boost")).toBe(2);
        expect(getBlackHolePhase6TrackLevel(state, "bank")).toBe(3);
        expect(getBlackHolePhase6TrackCost(state, "drain")).toBe(420);
        expect(getBlackHolePhase6TrackCost(state, "boost")).toBe(580);
        expect(getBlackHolePhase6TrackCost(state, "bank")).toBe(680);
        expect(getBlackHolePhase6NextJetUpgradeCostEssence(state)).toBe(540);
    });

    it("normalizes legacy black-hole level saves into Phase 2 state", () => {
        const state = normalizeNumber1BlackHoleStateFromSaveData(null, {
            legacyBlackHoleLevel: 12,
            maxHands: 10,
            nowMs: 1000
        });

        expect(state.phase).toBe(2);
        expect(state.phase2Mass).toBe(12);
        expect(state.phase2CollapseMassTier).toBe(3);
        expect(state.phase2CollapsePhotonTier).toBe(3);
        expect(state.phase2CollapseErgosphereTier).toBe(3);
    });

    it("normalizes saved state clamps, Phase 3 migration, and Phase 2 tier repair", () => {
        const state = normalizeNumber1BlackHoleStateFromSaveData({
            phase: 99,
            phase2Mass: 4,
            phase2CollapseMassTier: -2,
            phase2CollapsePhotonTier: 99,
            phase2CollapseErgosphereTier: 1,
            phase3HawkingStrength: 4,
            phase3LuminosityLevel: 0,
            phase3ViscousLevel: 0,
            phase3CoronalLevel: 0
        }, {
            maxHands: 10,
            nowMs: 1000
        });

        expect(state.phase).toBe(7);
        expect(state.phase2CollapseMassTier).toBe(0);
        expect(state.phase2CollapsePhotonTier).toBe(3);
        expect(state.phase2CollapseErgosphereTier).toBe(1);
        expect(state.phase3LuminosityLevel).toBe(4);
        expect(state.phase3ViscousLevel).toBe(4);
        expect(state.phase3CoronalLevel).toBe(4);
        expect(state.phase3HawkingRate).toBe(4);
        expect(state.phase3HawkingDuration).toBe(4);

        const repaired = normalizeNumber1BlackHoleStateFromSaveData({
            phase: 2,
            phase2EssenceBank: 100,
            phase2CollapseMassTier: 0,
            phase2CollapsePhotonTier: 0,
            phase2CollapseErgosphereTier: 0
        }, {
            maxHands: 10,
            nowMs: 1000
        });

        expect(repaired.phase2CollapseMassTier).toBe(3);
        expect(repaired.phase2CollapsePhotonTier).toBe(3);
        expect(repaired.phase2CollapseErgosphereTier).toBe(3);
    });

    it("normalizes active and expired digestion timers", () => {
        const active = normalizeNumber1BlackHoleStateFromSaveData({
            phase: 5,
            phase5MutationShorterOrbit: 1,
            phase5NextSacrificeHand: 9,
            phase5DigestHandNumber: 0,
            phase5DigestStartedAtMs: 0,
            phase5DigestDurationMs: 0,
            phase5DigestEndsAtMs: 2000,
            phase5PendingMutationHand: 99,
            phase5LastDigestedHand: 99
        }, {
            maxHands: 10,
            nowMs: 1000
        });

        expect(active.phase5DigestEndsAtMs).toBe(2000);
        expect(active.phase5DigestStartedAtMs).toBeLessThan(2000);
        expect(active.phase5DigestDurationMs).toBe(2000 - active.phase5DigestStartedAtMs);
        expect(active.phase5DigestHandNumber).toBe(10);
        expect(active.phase5PendingMutationHand).toBe(10);
        expect(active.phase5LastDigestedHand).toBe(10);

        const expired = normalizeNumber1BlackHoleStateFromSaveData({
            phase: 5,
            phase5DigestStartedAtMs: 1000,
            phase5DigestDurationMs: 1000,
            phase5DigestEndsAtMs: 1500,
            phase5DigestHandNumber: 8
        }, {
            maxHands: 10,
            nowMs: 2000
        });

        expect(expired.phase5DigestStartedAtMs).toBe(0);
        expect(expired.phase5DigestDurationMs).toBe(0);
        expect(expired.phase5DigestEndsAtMs).toBe(0);
        expect(expired.phase5DigestHandNumber).toBe(0);
    });

    it("syncs Phase 3 legacy aggregate fields from individual track levels", () => {
        const state = createNumber1BlackHoleState();
        state.phase3HawkingStrength = 1;
        state.phase3LuminosityLevel = 3;
        state.phase3ViscousLevel = 4;
        state.phase3CoronalLevel = 5;

        syncNumber1BlackHolePhase3LegacyLevel(state);

        expect(state.phase3HawkingStrength).toBe(3);
        expect(state.phase3HawkingRate).toBe(4);
        expect(state.phase3HawkingDuration).toBe(5);
    });
});
