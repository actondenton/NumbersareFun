import { describe, expect, it } from "vitest";

import { createNumber1StoryBanners } from "./n1-story-banners-catalog.js";
import { getStoryBannerById } from "./n1-story.js";

describe("createNumber1StoryBanners", () => {
    it("returns hand-unlock and black-hole milestone banners", () => {
        const run = { unlockedHands: 1, totalChanges: 0 };
        const banners = createNumber1StoryBanners({
            run,
            ascension: { number1HasAscended: false },
            formatCount: n => String(n),
            isBlackHoleArcUnlocked: () => false,
            getBlackHolePhase: () => 1
        });
        expect(banners.length).toBeGreaterThan(10);
        expect(getStoryBannerById(banners, "second-hand")?.order).toBe(1);
        run.unlockedHands = 2;
        expect(banners.find(b => b.id === "second-hand")?.trigger()).toBe(true);
    });
});
