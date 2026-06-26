import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as policy from "./n1-dev-autoplayer-policy.js";
import {
    AUTOPLAYER_POST_ASCEND_ENABLE_DELAY_MS,
    AUTOPLAYER_TICK_MS,
    createDevAutoplayer
} from "./n1-dev-autoplayer.js";

describe("createDevAutoplayer post-ascend enables", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    function makeDeps() {
        let now = 0;
        const autobuyEnabled: boolean[] = [false];
        let turboEnabled = false;
        let turboUnlocked = false;

        const deps = {
            getNowMs: () => now,
            getTotalChanges: () => 1,
            getRunPeakTotal: () => 1,
            getNumber1AscensionEssence: () => 0,
            getUnlockedHands: () => autobuyEnabled.length,
            getBlackHolePhase: () => 0,
            getBlackHoleState: () => ({}),
            hasAscended: () => true,
            isBlackHoleArcUnlocked: () => false,
            isNumber1AscensionTreeFullyPurchased: () => false,
            isNumber1AscensionReady: () => true,
            getAscensionMapNodes: () => [],
            getAscensionPurchaseChainInfoToNode: () => null,
            getAscensionGainBreakdown: () => ({ finalGain: 10 }),
            getAscensionGainAtTotal: () => 10,
            getEffectiveCps: () => 0,
            getSpeedLevel: () => 0,
            getCheapenLevel: () => 0,
            getSlowdownLevel: () => 0,
            canAffordSpeedUpgrade: () => false,
            canAffordCheapenUpgrade: () => false,
            canAffordSlowdownUpgrade: () => false,
            getSpeedUpgradeCost: () => 0,
            getCheapenUpgradeCost: () => 0,
            getSlowdownUpgradeCost: () => null,
            isBlackHolePhase2MassPourUnlocked: () => false,
            getBlackHolePhase2CollapseTier: () => 0,
            getBlackHolePhase2CollapseUpgradeCost: () => 0,
            getBlackHolePhase3TrackLevel: () => 0,
            getBlackHolePhase3TrackCost: () => 0,
            isBlackHolePhase3Complete: () => false,
            getBlackHolePhase6TrackCost: () => 0,
            getBlackHolePhase5DigestProgress: () => 0,
            isBlackHolePhase4ManualWaveReady: () => false,
            canSacrificeHandToFurnace: () => false,
            getPhase6JetChargeCap: () => 500,
            getTurboBoostUnlocked: () => turboUnlocked,
            getTurboBoostEnabled: () => turboEnabled,
            getTurboMeterFillRatio: () => 0,
            isStoryBannerOpen: () => false,
            performNumber1Ascension: () => {},
            enableAutobuyForAutoplayerOnAllHands: () => {
                for (let i = 0; i < autobuyEnabled.length; i++) autobuyEnabled[i] = true;
            },
            ensureTurboEnabledForAutoplayer: () => {
                turboEnabled = true;
            }
        };

        return {
            deps,
            autobuyEnabled,
            get turboEnabled() {
                return turboEnabled;
            },
            set turboUnlocked(v: boolean) {
                turboUnlocked = v;
            },
            advance(ms: number) {
                now += ms;
                vi.advanceTimersByTime(ms);
            }
        };
    }

    it("enables autobuy and turbo a few seconds after ascend", () => {
        let ascendTicks = 1;
        vi.spyOn(policy, "pickNextAction").mockImplementation(() => {
            if (ascendTicks > 0) {
                ascendTicks -= 1;
                return { kind: "ascend" };
            }
            return null;
        });

        const ctx = makeDeps();
        const autoplayer = createDevAutoplayer(ctx.deps);

        autoplayer.start({ personaId: "efficient" });
        ctx.advance(AUTOPLAYER_TICK_MS);

        expect(ctx.autobuyEnabled[0]).toBe(false);
        expect(ctx.turboEnabled).toBe(false);

        ctx.advance(AUTOPLAYER_POST_ASCEND_ENABLE_DELAY_MS);

        expect(ctx.autobuyEnabled[0]).toBe(true);
        expect(ctx.turboEnabled).toBe(true);
        autoplayer.stop();
    });

    it("keeps trying to enable turbo until it unlocks after ascend", () => {
        let ascendTicks = 1;
        vi.spyOn(policy, "pickNextAction").mockImplementation(() => {
            if (ascendTicks > 0) {
                ascendTicks -= 1;
                return { kind: "ascend" };
            }
            return null;
        });

        const ctx = makeDeps();
        ctx.turboUnlocked = false;
        const autoplayer = createDevAutoplayer(ctx.deps);

        autoplayer.start({ personaId: "efficient" });
        ctx.advance(AUTOPLAYER_TICK_MS);
        ctx.advance(AUTOPLAYER_POST_ASCEND_ENABLE_DELAY_MS);

        expect(ctx.turboEnabled).toBe(true);

        ctx.turboUnlocked = true;
        ctx.advance(AUTOPLAYER_TICK_MS);

        autoplayer.stop();
    });
});
