import { describe, expect, it } from "vitest";

import { BLACK_HOLE_EVAPORATION_CAP, BLACK_HOLE_MAX_LEVEL } from "./black-hole/number1-black-hole.js";
import { COMBO_ACTIVATION_EDGE_SAVE_VERSION } from "../n1-save.js";
import { createNumber1Runtime } from "./state/n1-runtime.js";
import {
    createNumber1HydrateEnv,
    createNumber1SaveState,
    hydrateNumber1RuntimeFromSave,
    serializeNumber1RuntimeFields
} from "./n1-persist.js";

const ASCENSION_TREE_EXPECTED_SAVE_VERSION = 15;

function makeHydrateEnv(rt: ReturnType<typeof createNumber1Runtime>) {
    return createNumber1HydrateEnv({
        maxHands: 10,
        ascensionTreeVersionExpected: ASCENSION_TREE_EXPECTED_SAVE_VERSION,
        comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION,
        blackHoleMaxLevel: BLACK_HOLE_MAX_LEVEL,
        blackHoleEvaporationCap: BLACK_HOLE_EVAPORATION_CAP,
        comboDiscoveryCooldownBaseMs: 60000,
        comboDiscoveryCooldownMinMs: 100,
        session: rt.session,
        ascension: rt.ascension,
        autobuy: rt.autobuy
    });
}

describe("n1-persist", () => {
    it("hydrates runtime stores from a minimal save blob", () => {
        const rt = createNumber1Runtime({ maxHands: 10 });
        const futureClapCooldown = Array(10).fill(0);
        futureClapCooldown[1] = Date.now() + 60_000;
        const snap = hydrateNumber1RuntimeFromSave(rt, {
            handEarnings: [5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            unlockedHands: 1,
            turboBoostMeter: 3,
            number1AscensionEssence: 12,
            autoBuyUnlocked: true,
            timeWarpNextSpawnInSec: 12.5,
            timeWarpUnlockLogged: true,
            timeWarpAuraActiveByHand: [true, false],
            timeWarpAuraAppearedAtMsByHand: [1000, 0],
            speedLevel: [3, 2, 0, 0, 0, 0, 0, 0, 0, 0],
            speedBonusLevel: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            clapCooldownUntilMsByHand: futureClapCooldown,
            earnedComboNames: ["pair"],
            comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION,
            comboActivationCounts: { pair: 2 },
            comboDiscoveryMilestonePendingQueue: ["flush"],
            comboDiscoveryMilestoneReadyAtMs: 1234,
            comboDiscoveryMilestoneCooldownSpanMs: 60000,
            previousTickActiveComboNames: ["pair", "straight"],
            shownBannerIds: ["intro", "hand-2"],
            closedBanners: [{ id: "intro", title: "Intro", body: "Hi", closedAt: 1 }],
            objectivesAchieved: [true, false, false, false, false, false, false, false],
            longTermObjectivesAchieved: [true, false]
        }, makeHydrateEnv(rt));
        expect(snap).toBeTruthy();
        expect(rt.run.handEarnings[0]).toBe(5);
        expect(rt.turbo.turboBoostMeter).toBe(3);
        expect(rt.ascension.number1AscensionEssence).toBe(12);
        expect(rt.autobuy.autoBuyUnlocked).toBe(true);
        expect(rt.timewarp.timeWarpNextSpawnInSec).toBe(12.5);
        expect(rt.timewarp.timeWarpUnlockLogged).toBe(true);
        expect(rt.timewarp.timeWarpAuraActiveByHand[0]).toBe(true);
        expect(rt.timewarp.timeWarpAuraActiveByHand[1]).toBe(false);
        expect(rt.timewarp.timeWarpAuraActiveByHand.length).toBe(10);
        expect(rt.timewarp.timeWarpAuraAppearedAtMsByHand[0]).toBe(1000);
        expect(rt.timewarp.timeWarpAuraAppearedAtMsByHand[1]).toBe(0);
        expect(rt.hands.speedLevel[0]).toBe(3);
        expect(rt.hands.speedBonusLevel[0]).toBe(1);
        expect(rt.hands.clapCooldownUntilMsByHand[1]).toBeGreaterThan(Date.now());
        expect(rt.hands.clapDigitPrevious.every(v => v === -1)).toBe(true);
        expect(rt.combo.earnedComboNames).toEqual(["pair"]);
        expect(rt.combo.comboActivationCounts).toEqual({ pair: 2 });
        expect(rt.combo.comboDiscoveryMilestonePendingQueue).toEqual(["flush"]);
        expect(rt.combo.comboDiscoveryMilestoneReadyAtMs).toBe(1234);
        expect(rt.combo.comboDiscoveryMilestoneCooldownSpanMs).toBe(60000);
        expect(Array.from(rt.combo.previousTickActiveComboNames)).toEqual(["pair", "straight"]);
        expect(Array.from(rt.story.shownBannerIds)).toEqual(["intro", "hand-2"]);
        expect(rt.story.closedBanners).toEqual([{ id: "intro", title: "Intro", body: "Hi", closedAt: 1 }]);
        expect(rt.objectives.objectivesAchieved[0]).toBe(true);
        expect(rt.objectives.longTermObjectivesAchieved[0]).toBe(true);
        expect(rt.upgrades.cheapenLevel[0]).toBe(0);
        expect(rt.autobuy.autoBuyEnabledByHand).toEqual([]);
    });

    it("createNumber1SaveState round-trips runtime fields through hydrate", () => {
        const rt = createNumber1Runtime({ maxHands: 10 });
        rt.run.handEarnings[0] = 42;
        rt.run.unlockedHands = 2;
        rt.upgrades.cheapenLevel[0] = 3;
        rt.upgrades.slowdownUnlockLogged = true;
        rt.autobuy.autoBuyUnlocked = true;
        rt.autobuy.autoBuyEnabledByHand.push(true, false);
        rt.autobuy.autoBuyCountdownSecondsByHand.push(5, 0);
        rt.combo.earnedComboNames.push("pair");
        rt.combo.comboActivationCounts = { pair: 1 };

        const saved = createNumber1SaveState(999, rt, {
            ascensionTreeVersion: ASCENSION_TREE_EXPECTED_SAVE_VERSION,
            totalPlayTimeMs: 5000
        });
        const rt2 = createNumber1Runtime({ maxHands: 10 });
        const snap = hydrateNumber1RuntimeFromSave(rt2, saved, makeHydrateEnv(rt2));

        expect(snap).toBeTruthy();
        expect(rt2.run.handEarnings[0]).toBe(42);
        expect(rt2.run.unlockedHands).toBe(2);
        expect(rt2.upgrades.cheapenLevel[0]).toBe(3);
        expect(rt2.upgrades.slowdownUnlockLogged).toBe(true);
        expect(rt2.autobuy.autoBuyUnlocked).toBe(true);
        expect(rt2.autobuy.autoBuyEnabledByHand).toEqual([true, false]);
        expect(rt2.combo.earnedComboNames).toEqual(["pair"]);
        expect(rt2.combo.comboActivationCounts).toEqual({ pair: 1 });
    });

    it("serializeNumber1RuntimeFields includes runtime slices", () => {
        const rt = createNumber1Runtime({ maxHands: 10 });
        rt.run.totalChanges = 99;
        const payload = serializeNumber1RuntimeFields(rt);
        expect(payload.unlockedHands).toBe(1);
        expect(payload.autoBuyUnlocked).toBe(false);
        expect(payload.timeWarpNextSpawnInSec).toBe(0);
        expect(payload.speedLevel.length).toBe(10);
        expect(payload.earnedComboNames).toEqual([]);
        expect(payload.previousTickActiveComboNames).toEqual([]);
        expect(payload.shownBannerIds).toEqual([]);
        expect(payload.closedBanners).toEqual([]);
        expect(payload.objectivesAchieved).toEqual([]);
        expect(payload.longTermObjectivesAchieved).toEqual([]);
        expect(payload.cheapenLevel.length).toBe(10);
        expect(payload.autoBuyEnabledByHand).toEqual([]);
    });
});
