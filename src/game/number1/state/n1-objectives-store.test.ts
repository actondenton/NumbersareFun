import { describe, expect, it } from "vitest";
import {
    bindObjectiveAchievedToStore,
    createN1ObjectivesStore,
    hydrateObjectiveFlagsFromSnapshot,
    N1_SHORT_OBJECTIVES_COUNT
} from "./n1-objectives-store.js";

describe("createN1ObjectivesStore", () => {
    it("starts with empty achievement flag arrays", () => {
        const o = createN1ObjectivesStore();
        expect(o.objectivesAchieved).toEqual([]);
        expect(o.longTermObjectivesAchieved).toEqual([]);
        expect(N1_SHORT_OBJECTIVES_COUNT).toBe(8);
    });
});

describe("bindObjectiveAchievedToStore", () => {
    it("binds achieved getters/setters to store arrays", () => {
        const store = createN1ObjectivesStore();
        const objectives = [{ text: "a", achieved: false }, { text: "b", achieved: false }];
        const longTerm = [{ text: "lt", achieved: false }];
        bindObjectiveAchievedToStore(objectives, longTerm, store);

        objectives[0].achieved = true;
        expect(store.objectivesAchieved).toEqual([true, false]);
        store.longTermObjectivesAchieved[0] = true;
        expect(longTerm[0].achieved).toBe(true);
    });
});

describe("hydrateObjectiveFlagsFromSnapshot", () => {
    it("merges boolean achievement flags into the store by index", () => {
        const store = createN1ObjectivesStore();
        store.objectivesAchieved.push(false, false);
        store.longTermObjectivesAchieved.push(false, false);
        hydrateObjectiveFlagsFromSnapshot(
            { objectivesAchieved: [true, false], longTermObjectivesAchieved: [false, true] },
            store
        );
        expect(store.objectivesAchieved).toEqual([true, false]);
        expect(store.longTermObjectivesAchieved).toEqual([false, true]);
    });
});
