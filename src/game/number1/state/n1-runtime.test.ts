import { describe, expect, it } from "vitest";

import { createNumber1Runtime } from "./n1-runtime.js";
import { N1_DEFAULT_SETTINGS } from "./n1-session-store.js";

describe("createNumber1Runtime", () => {
    it("composes stores with expected defaults", () => {
        const rt = createNumber1Runtime({ maxHands: 10 });
        expect(rt.run.totalChanges).toBe(1);
        expect(rt.run.handEarnings[0]).toBe(1);
        expect(rt.run.unlockedHands).toBe(1);
        expect(rt.ascension.number1AscensionEssence).toBe(0);
        expect(rt.blackHole.number1BlackHoleState).toBeTruthy();
        expect(rt.turbo.turboBoostMeter).toBe(0);
        expect(rt.upgrades.cheapenLevel.length).toBe(10);
        expect(rt.autobuy.autoBuyUnlocked).toBe(false);
        expect(rt.timewarp.timeWarpNextSpawnInSec).toBe(0);
        expect(rt.hands.speedLevel.length).toBe(10);
        expect(rt.combo.earnedComboNames).toEqual([]);
        expect(rt.story.shownBannerIds).toEqual(new Set());
        expect(rt.objectives.objectivesAchieved).toEqual([]);
        expect(rt.session.settings).toEqual(N1_DEFAULT_SETTINGS);
        expect(rt.session.gamePaused).toBe(false);
        expect(rt.session.unlockedNumbers).toEqual(new Set([1, 2]));
    });

    it("mutations on slice objects are visible via runtime", () => {
        const rt = createNumber1Runtime({ maxHands: 5 });
        rt.run.totalChanges = 42;
        rt.ascension.number1AscensionNodeIds.push("tempo-1");
        expect(rt.run.totalChanges).toBe(42);
        expect(rt.ascension.number1AscensionNodeIds).toEqual(["tempo-1"]);
    });
});
