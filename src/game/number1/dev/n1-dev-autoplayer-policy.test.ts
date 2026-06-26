import { describe, expect, it } from "vitest";
import {
    AUTOPLAYER_PERSONA_EFFICIENT,
    AUTOPLAYER_PERSONA_PATIENT,
    getAutoplayerPersonaConfig,
    pickNextAction,
    shouldAscendNow
} from "./n1-dev-autoplayer-policy.js";

describe("shouldAscendNow", () => {
    const base = {
        isAscensionReady: true,
        ascendReadySinceMs: 0,
        nowMs: 100_000,
        hasAffordableRunUpgrade: false,
        totalChanges: 1e35,
        effectiveCps: 1e30,
        getAscensionGainAtTotal: t => Math.floor(Math.log10(Math.max(1, t))),
        ascendConfig: getAutoplayerPersonaConfig(AUTOPLAYER_PERSONA_EFFICIENT).ascend
    };

    it("blocks while affordable run upgrades exist", () => {
        expect(shouldAscendNow({ ...base, hasAffordableRunUpgrade: true })).toBe(false);
    });

    it("blocks before min dwell elapsed", () => {
        expect(
            shouldAscendNow({
                ...base,
                ascendReadySinceMs: 100_000 - 10_000,
                nowMs: 100_000
            })
        ).toBe(false);
    });

    it("ascends after max defer even if marginal gain remains high", () => {
        expect(
            shouldAscendNow({
                ...base,
                ascendReadySinceMs: 100_000,
                nowMs: 800_000,
                getAscensionGainAtTotal: () => 100
            })
        ).toBe(true);
    });

    it("ascends when marginal gain falls below floor after dwell", () => {
        expect(
            shouldAscendNow({
                ...base,
                ascendReadySinceMs: 100_000 - 60_000,
                nowMs: 100_000,
                effectiveCps: 0,
                getAscensionGainAtTotal: () => 50
            })
        ).toBe(true);
    });
});

describe("pickNextAction", () => {
    it("prefers collapse track buy before mass pour in phase 2", () => {
        const action = pickNextAction(
            {
                isArcUnlocked: true,
                blackHolePhase: 2,
                ascensionEssence: 500,
                phase2MassPourUnlocked: false,
                collapseMaxTier: 3,
                collapseTierByTrack: { mass: 0, photon: 3, ergosphere: 3 },
                collapseCostByTrack: { mass: 100, photon: 999, ergosphere: 999 },
                unlockedHands: 10,
                canBuySpeed: []
            },
            getAutoplayerPersonaConfig(AUTOPLAYER_PERSONA_EFFICIENT)
        );
        expect(action).toEqual({ kind: "bh_collapse_buy", track: "mass" });
    });

    it("picks mutation when pending in phase 5", () => {
        const action = pickNextAction(
            {
                blackHolePhase: 5,
                phase5PendingMutationLevel: 2,
                phase5DigestActive: false
            },
            getAutoplayerPersonaConfig(AUTOPLAYER_PERSONA_EFFICIENT)
        );
        expect(action?.kind).toBe("bh_mutation");
    });

    it("Patient persona skips manual wave unless idle threshold met", () => {
        const action = pickNextAction(
            {
                blackHolePhase: 4,
                phase4ManualWaveReady: true,
                nowMs: 10_000,
                lastActionAtMs: 9_000,
                sessionStartMs: 0,
                isArcUnlocked: true,
                ascensionEssence: 0,
                unlockedHands: 10,
                canBuySpeed: [false]
            },
            getAutoplayerPersonaConfig(AUTOPLAYER_PERSONA_PATIENT)
        );
        expect(action).toBe(null);
    });
});
