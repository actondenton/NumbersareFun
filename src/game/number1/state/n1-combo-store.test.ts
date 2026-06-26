import { describe, expect, it } from "vitest";
import { createN1ComboStore } from "./n1-combo-store.js";

describe("createN1ComboStore", () => {
    it("starts with empty catalog and discovery milestone state", () => {
        const c = createN1ComboStore();
        expect(c.earnedComboNames).toEqual([]);
        expect(c.comboActivationCounts).toEqual({});
        expect(c.comboDiscoveryMilestonePendingQueue).toEqual([]);
        expect(c.comboDiscoveryMilestoneReadyAtMs).toBe(0);
        expect(c.comboDiscoveryMilestoneCooldownSpanMs).toBe(0);
        expect(c.previousTickActiveComboNames).toEqual(new Set());
    });
});
