import { describe, expect, it } from "vitest";
import { createN1StoryStore } from "./n1-story-store.js";

describe("createN1StoryStore", () => {
    it("starts with empty banner tracking and no-op checkStoryBanners", () => {
        const s = createN1StoryStore();
        expect(s.shownBannerIds).toEqual(new Set());
        expect(s.closedBanners).toEqual([]);
        expect(s.checkStoryBanners()).toBeUndefined();
    });
});
