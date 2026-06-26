import { describe, expect, it } from "vitest";
import { BLACK_HOLE_EVAPORATION_CAP, BLACK_HOLE_MAX_LEVEL } from "./number1/black-hole/number1-black-hole.js";
import { COMBO_ACTIVATION_EDGE_SAVE_VERSION } from "./n1-save.js";
import {
    normalizeNumber1SaveSnapshot,
    patchTimeWarpAuraAppearedForActiveHands
} from "./n1-state-apply.js";

/** Must match VERSION in `/ascension-tree-data.js`. */
const ASCENSION_TREE_EXPECTED_SAVE_VERSION = 15;

const TEST_ENV_BASE = (
    overrides: Partial<Parameters<typeof normalizeNumber1SaveSnapshot>[1]> = {},
    rawNow = Date.now()
) =>
    ({
        maxHands: 10,
        ascensionTreeVersionExpected: ASCENSION_TREE_EXPECTED_SAVE_VERSION,
        comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION,
        blackHoleMaxLevel: BLACK_HOLE_MAX_LEVEL,
        blackHoleEvaporationCap: BLACK_HOLE_EVAPORATION_CAP,
        comboDiscoveryCooldownBaseMs: 60000,
        comboDiscoveryCooldownMinMs: 100,
        settingsFallback: {
            theme: "light",
            adaptiveTipsEnabled: true,
            curtainEnabled: true,
            humorEnabled: true,
            showClapAnimation: true,
            offlineCapHours: 72
        },
        currentAscensionNumber1IntroSeen: false,
        currentEssenceForMerge: 50,
        fallbackAutoBuyEnabled: [false, false],
        fallbackAutoBuyCountdown: [0, 0],
        nowMs: rawNow,
        ...overrides
    } as Parameters<typeof normalizeNumber1SaveSnapshot>[1]);

describe("n1-state-apply", () => {
    it("normalizeNumber1SaveSnapshot returns null for invalid input", () => {
        expect(normalizeNumber1SaveSnapshot(null, TEST_ENV_BASE())).toBeNull();
        expect(normalizeNumber1SaveSnapshot("x", TEST_ENV_BASE())).toBeNull();
    });

    it("clamps unlockedHands into cap (boot zeros tails after assign)", () => {
        const t = normalizeNumber1SaveSnapshot(
            {
                unlockedHandsCap: 2,
                unlockedHands: 99,
                handEarnings: Array(10).fill(100)
            },
            TEST_ENV_BASE()
        );
        expect(t).not.toBeNull();
        expect(t!.unlockedHandsCap).toBe(2);
        expect(t!.unlockedHands).toBe(2);
        expect(t!.handEarnings).not.toBeNull();
        expect(t!.handEarnings!.length).toBe(10);
        expect(t!.handEarnings![5]).toBe(100);
    });

    it("sets slowdownCompactionUnlockedLatched when slowdownLevel has positives", () => {
        const t = normalizeNumber1SaveSnapshot(
            {
                slowdownCompactionUnlockedLatched: false,
                slowdownLevel: [0, 0, 5, 0, 0, 0, 0, 0, 0, 0]
            },
            TEST_ENV_BASE()
        );
        expect(t!.slowdownCompactionUnlockedLatched).toBe(true);
    });

    it("drops ascension node ids when save tree version is too old", () => {
        const oldVersion = ASCENSION_TREE_EXPECTED_SAVE_VERSION > 1 ? ASCENSION_TREE_EXPECTED_SAVE_VERSION - 1 : -1;
        const tOld = normalizeNumber1SaveSnapshot(
            {
                ascensionTreeVersion: oldVersion,
                number1AscensionNodeIds: ["asc_ix_should_drop"]
            },
            TEST_ENV_BASE()
        );
        expect(tOld!.ascensionNodesLoadedFromSave).toBe(false);
        expect(tOld!.number1AscensionNodeIds).toEqual([]);
    });

    it("merges ascending essence across top-level and module slot", () => {
        const t = normalizeNumber1SaveSnapshot(
            {
                number1AscensionEssence: 0,
                numberModulesState: {
                    "1": { ascensionEssence: 100 }
                }
            },
            TEST_ENV_BASE({ currentEssenceForMerge: 37 })
        );
        expect(t!.mergedNumber1AscensionEssence).toBe(100);
    });

    it("patchTimeWarpAuraAppearedForActiveHands stamps now when aura on but appeared is zero", () => {
        const active = [true, false];
        const appeared = [0, 0];
        const now = 1_700_000_000_000;
        patchTimeWarpAuraAppearedForActiveHands(active, appeared, 1, now);
        expect(appeared[0]).toBe(now);
        expect(appeared[1]).toBe(0);
    });
});
