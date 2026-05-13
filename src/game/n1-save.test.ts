import { describe, expect, it } from "vitest";
import {
    AUTOSAVE_INTERVAL_MS,
    COMBO_ACTIVATION_EDGE_SAVE_VERSION,
    SAVE_KEY,
    applyNumberModulesSaveState,
    applyAchievementFlags,
    collectNumberModulesSaveState,
    createGameSaveState,
    hasPositiveNumberEntry,
    isSaveVersionAtLeast,
    mergeNumber1AscensionEssenceSaveValue,
    normalizeArrayPrefix,
    normalizeArrayFromSave,
    normalizeBooleanIfSaved,
    normalizeComboActivationCounts,
    normalizeNonNegativeInteger,
    normalizeNonNegativeNumber,
    normalizeNonNegativeTimestamp,
    normalizeNumberAtLeast,
    normalizeNumberInRange,
    normalizeFixedArray,
    normalizeFixedBooleanArray,
    normalizeFutureTimestampArray,
    normalizePositiveTimestamp,
    normalizePositiveTimestampArray,
    normalizeQueuedComboDiscoveryCooldownSpan,
    normalizeSettingsFromSave,
    normalizeStringArrayFromSave,
    normalizeStringSetFromSave,
    normalizeStringQueue,
    parseNumber1AscensionEssenceFromSaveValue,
    readSaveData,
    replaceArrayContents,
    writeSaveData
} from "./n1-save.js";

describe("Number 1 save helpers", () => {
    it("exports stable save keys and version constants", () => {
        expect(SAVE_KEY).toBe("naf.save.v2");
        expect(AUTOSAVE_INTERVAL_MS).toBe(10000);
        expect(COMBO_ACTIVATION_EDGE_SAVE_VERSION).toBe(2);
    });

    it("parses valid non-negative essence values", () => {
        expect(parseNumber1AscensionEssenceFromSaveValue(12.9)).toBe(12);
        expect(parseNumber1AscensionEssenceFromSaveValue("1.9e3")).toBe(1900);
        expect(parseNumber1AscensionEssenceFromSaveValue(7n)).toBe(7);
    });

    it("rejects invalid or negative essence values", () => {
        expect(parseNumber1AscensionEssenceFromSaveValue(null)).toBeNull();
        expect(parseNumber1AscensionEssenceFromSaveValue("12 apples")).toBeNull();
        expect(parseNumber1AscensionEssenceFromSaveValue(-1)).toBeNull();
        expect(parseNumber1AscensionEssenceFromSaveValue(-1n)).toBeNull();
    });

    it("merges top-level and Number 1 module essence without wiping current progress", () => {
        const merged = mergeNumber1AscensionEssenceSaveValue({
            number1AscensionEssence: 0,
            numberModulesState: {
                "1": { ascensionEssence: "42" }
            }
        }, 10);

        expect(merged).toBe(42);
        expect(mergeNumber1AscensionEssenceSaveValue({ number1AscensionEssence: 0 }, 99)).toBe(99);
    });

    it("reads and writes save JSON defensively", () => {
        const store = new Map();
        const storage = {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => { store.set(key, value); }
        };

        expect(writeSaveData(storage, { savedAt: 123 })).toBe(true);
        expect(readSaveData(storage)).toEqual({ savedAt: 123 });

        store.set(SAVE_KEY, "{bad json");
        expect(readSaveData(storage)).toBeNull();
    });

    it("collects module saves and creates the aggregate save DTO", () => {
        const numberModulesState = collectNumberModulesSaveState({
            "1": { getSaveData: () => ({ total: 1 }) },
            "2": { getSaveData: () => ({ total: "2" }) }
        });
        expect(numberModulesState).toEqual({
            "1": { total: 1 },
            "2": { total: "2" }
        });

        expect(createGameSaveState(123, {
            totalPlayTimeMs: 50,
            numberModulesState
        })).toEqual({
            savedAt: 123,
            totalPlayTimeMs: 50,
            numberModulesState,
            comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION
        });
    });

    it("applies module save data only to known number modules", () => {
        const applied: unknown[] = [];
        applyNumberModulesSaveState({
            "1": { applySaveData: (data: unknown) => applied.push(["1", data]) }
        }, {
            "1": { total: 1 },
            "missing": { total: 999 }
        });

        expect(applied).toEqual([["1", { total: 1 }]]);
    });

    it("normalizes fixed-length arrays for loaded save fields", () => {
        expect(normalizeFixedArray([1, 2], 4, 0)).toEqual([1, 2, 0, 0]);
        expect(normalizeFixedArray([1, 2, 3], 2, 0)).toEqual([1, 2]);
        expect(normalizeFixedArray("not array", 2, 0)).toBeNull();
        expect(normalizeFixedArray(["1", "bad"], 2, 0, v => Number(v) || 0)).toEqual([1, 0]);
    });

    it("normalizes boolean and timestamp arrays for loaded save fields", () => {
        const now = 1000;
        expect(normalizeFixedBooleanArray([1, "", "yes"], 4)).toEqual([true, false, true, false]);
        expect(normalizePositiveTimestampArray([10, -5, "bad"], 4)).toEqual([10, 0, 0, 0]);
        expect(normalizeFutureTimestampArray([500, 1001, "2000"], 4, now)).toEqual([0, 1001, 2000, 0]);
    });

    it("normalizes combo activation counts and pending milestone queues", () => {
        expect(normalizeComboActivationCounts(2, { a: 2.8, b: -1, c: "bad" })).toEqual({ a: 2, b: 0, c: 0 });
        expect(normalizeComboActivationCounts(1, { a: 2 })).toEqual({});
        expect(normalizeStringQueue(["combo", "", 3, "other"])).toEqual(["combo", "other"]);
        expect(normalizeNonNegativeTimestamp("1200")).toBe(1200);
        expect(normalizeNonNegativeTimestamp(-1)).toBe(0);
    });

    it("normalizes collection-shaped save values", () => {
        const source = ["a", 1];
        const copy = normalizeArrayFromSave(source);
        expect(copy).toEqual(source);
        expect(copy).not.toBe(source);
        expect(normalizeArrayPrefix([1, 2, 3], 2)).toEqual([1, 2]);
        expect(normalizeArrayPrefix(["1", "bad"], 2, v => Number(v) || 0)).toEqual([1, 0]);
        expect(normalizeArrayFromSave("bad")).toBeNull();
        expect(normalizeStringArrayFromSave(["a", 1, "b"])).toEqual(["a", "b"]);
        expect(Array.from(normalizeStringSetFromSave(["a", "b", "a"]) || [])).toEqual(["a", "b"]);
        expect(normalizeStringSetFromSave("bad")).toBeNull();

        const target = ["old"];
        expect(replaceArrayContents(target, ["new", "next"])).toBe(true);
        expect(target).toEqual(["new", "next"]);
        expect(replaceArrayContents(target, null)).toBe(false);
        expect(target).toEqual(["new", "next"]);
    });

    it("applies saved objective achievement flags", () => {
        const targets = [{ achieved: false }, { achieved: true }, { achieved: false }];
        expect(applyAchievementFlags(targets, [1, 0])).toBe(true);
        expect(targets.map(o => o.achieved)).toEqual([true, false, false]);
        expect(applyAchievementFlags(targets, "bad")).toBe(false);
    });

    it("normalizes scalar counters and timestamps", () => {
        expect(normalizeNonNegativeInteger(2.9)).toBe(2);
        expect(normalizeNonNegativeInteger(-1, 7)).toBe(7);
        expect(normalizeNonNegativeInteger(99, 0, 10)).toBe(10);
        expect(normalizeNonNegativeNumber(2.9)).toBe(2.9);
        expect(normalizeNonNegativeNumber(-1, 7)).toBe(7);
        expect(normalizeNumberAtLeast(1.5, 1, 1)).toBe(1.5);
        expect(normalizeNumberAtLeast(0.5, 1, 1)).toBe(1);
        expect(normalizeNumberInRange(99, 1, 10, 5)).toBe(10);
        expect(normalizeNumberInRange("bad", 1, 10, 5)).toBe(5);
        expect(normalizePositiveTimestamp(123, 9)).toBe(123);
        expect(normalizePositiveTimestamp(0, 9)).toBe(9);
    });

    it("normalizes save version checks, boolean fields, and positive-entry probes", () => {
        expect(isSaveVersionAtLeast(3, 2)).toBe(true);
        expect(isSaveVersionAtLeast(1, 2)).toBe(false);
        expect(normalizeBooleanIfSaved(false, true)).toBe(false);
        expect(normalizeBooleanIfSaved("false", true)).toBe(true);
        expect(hasPositiveNumberEntry([0, "0", "2"])).toBe(true);
        expect(hasPositiveNumberEntry([0, -1, "bad"])).toBe(false);
    });

    it("normalizes combo discovery cooldown spans", () => {
        expect(normalizeQueuedComboDiscoveryCooldownSpan(90_000, [], 0, 1000, 60_000, 100)).toBe(60_000);
        expect(normalizeQueuedComboDiscoveryCooldownSpan(0, ["combo"], 5000, 1000, 60_000, 100)).toBe(4000);
        expect(normalizeQueuedComboDiscoveryCooldownSpan(0, ["combo"], 1050, 1000, 60_000, 100)).toBe(100);
        expect(normalizeQueuedComboDiscoveryCooldownSpan(0, [], 5000, 1000, 60_000, 100)).toBe(0);
    });

    it("normalizes saved settings while preserving current offline cap fallback", () => {
        const current = {
            theme: "light",
            adaptiveTipsEnabled: true,
            curtainEnabled: true,
            humorEnabled: true,
            showClapAnimation: true,
            offlineCapHours: 8
        };

        expect(normalizeSettingsFromSave(null, current)).toBeNull();
        expect(normalizeSettingsFromSave({
            theme: "dark",
            adaptiveTipsEnabled: false,
            curtainEnabled: false,
            humorEnabled: false,
            showClapAnimation: false,
            offlineCapHours: 2
        }, current)).toEqual({
            theme: "dark",
            adaptiveTipsEnabled: false,
            curtainEnabled: false,
            humorEnabled: false,
            showClapAnimation: false,
            offlineCapHours: 2
        });
        expect(normalizeSettingsFromSave({ offlineCapHours: -1 }, current)?.offlineCapHours).toBe(8);
    });
});
