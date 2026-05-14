import { describe, expect, it } from "vitest";

import { TIME_WARP_UNLOCK_COUNT } from "./n1-time-warp.js";
import { createNumber1TimeWarpBoot } from "./n1-time-warp-boot.js";

function noop() {}

function baseDeps() {
    const active: boolean[] = [];
    const appeared: number[] = [];
    let nextSpawn = 30;
    let unlockLogged = true;
    const speedLevel = [0];
    const cheapenLevel = [0];
    const slowdownLevel = [0];
    let handEarning = 0;
    let totalChanges = TIME_WARP_UNLOCK_COUNT;
    return {
        getUnlockedHands: () => 1,
        getHands: () => [{ baseSpeed: 1000 }],
        getSpeedRowRefs: () => [],
        getTotalChanges: () => totalChanges,
        getHandEarnings: (i: number) => (i === 0 ? handEarning : 0),
        getHandPerHandRawCps: () => 100,
        getTimeWarpComboMultiplier: () => 2,
        getTurboCountMultiplier: () => 3,
        getNumber1BlackHoleProductionMult: () => 5,
        getTimeWarpAuraActiveByHand: () => active,
        getTimeWarpAuraAppearedAtMsByHand: () => appeared,
        setTimeWarpAuraActiveByHand: (v: boolean[]) => {
            active.length = 0;
            active.push(...v);
        },
        setTimeWarpAuraAppearedAtMsByHand: (v: number[]) => {
            appeared.length = 0;
            appeared.push(...v);
        },
        getTimeWarpNextSpawnInSec: () => nextSpawn,
        setTimeWarpNextSpawnInSec: (v: number) => {
            nextSpawn = v;
        },
        getTimeWarpUnlockLogged: () => unlockLogged,
        setTimeWarpUnlockLogged: (v: boolean) => {
            unlockLogged = v;
        },
        computeAscensionGrantTotals: () => ({}),
        getIncrementalCountEl: () => null,
        formatCount: (n: number) => String(n),
        setHandEarningBalance: (i: number, v: number) => {
            if (i === 0) handEarning = v;
        },
        refreshTotalFromHandEarnings: () => {
            totalChanges = handEarning;
        },
        updateObjectives: noop,
        updateSpeedUpgradeUI: noop,
        updateCheapenUpgradeUI: noop,
        updateSlowdownUpgradeUI: noop,
        updateRateDisplay: noop,
        updateMilestoneUI: noop,
        addToLog: noop,
        markMeaningfulProgress: noop,
        scheduleHandUpgradeScrollHintUpdate: noop,
        handScrollHintHasUpgradeReason: () => false,
        flushAutobuyDeferredTotalsIfAny: noop,
        getNumber1HasAscended: () => false,
        getAscensionPendingBonusEssence: () => 0,
        setAscensionPendingBonusEssence: noop,
        refreshOverviewAndAscensionHubLiveIfOpen: noop,
        autosaveNow: noop,
        getSpeedLevel: () => speedLevel,
        getCheapenLevel: () => cheapenLevel,
        getSlowdownLevel: () => slowdownLevel,
        getMaxCheapenLevel: () => 99,
        getMaxSlowdownLevelCap: () => 99,
        getUpgradeCost: () => 1e30,
        getCheapenUpgradeCost: () => 1e30,
        getSlowdownUpgradeCost: () => null,
        isSlowdownUnlocked: () => false,
        buySpeedUpgradeForHand: noop,
        buyCheapenUpgradeForHand: noop,
        buySlowdownUpgradeForHand: noop
    };
}

describe("createNumber1TimeWarpBoot", () => {
    it("isTimeWarpUnlocked follows totalChanges vs unlock threshold", () => {
        const low = createNumber1TimeWarpBoot({
            ...baseDeps(),
            getTotalChanges: () => 0
        });
        expect(low.isTimeWarpUnlocked()).toBe(false);
        const hi = createNumber1TimeWarpBoot({
            ...baseDeps(),
            getTotalChanges: () => TIME_WARP_UNLOCK_COUNT
        });
        expect(hi.isTimeWarpUnlocked()).toBe(true);
    });

    it("getTimeWarpGrantForHand scales raw CPS × combo × turbo × BH × seconds bonus", () => {
        const tw = createNumber1TimeWarpBoot(baseDeps());
        // effectiveCps = clamp(100*2*3*5) = 3000; default TIME_WARP_SECONDS_BONUS from rules
        const gain = tw.getTimeWarpGrantForHand(0, 1);
        expect(gain).toBeGreaterThan(1);
        expect(gain % 3000).toBe(0);
    });

    it("handHasActiveTimeWarpAura honors unlock and array flags", () => {
        const d = baseDeps();
        const tw = createNumber1TimeWarpBoot(d);
        const active = d.getTimeWarpAuraActiveByHand() as boolean[];
        expect(tw.handHasActiveTimeWarpAura(0)).toBe(false);
        active[0] = true;
        expect(tw.handHasActiveTimeWarpAura(0)).toBe(true);
        const locked = createNumber1TimeWarpBoot({
            ...d,
            getTotalChanges: () => 0
        });
        expect(locked.handHasActiveTimeWarpAura(0)).toBe(false);
    });
});
