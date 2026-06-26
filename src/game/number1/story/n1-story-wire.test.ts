import { describe, expect, it, vi } from "vitest";

import { wireNumber1Story } from "./n1-story-wire.js";

describe("wireNumber1Story", () => {
    it("registers checkStoryBanners on story slice and patches banner bridge", () => {
        const story = {
            shownBannerIds: new Set(),
            closedBanners: [],
            checkStoryBanners: undefined
        };
        const bridge = {};
        const boot = wireNumber1Story({
            story,
            storyBanners: [],
            storyBannerOverlayEl: null,
            storyBannerTitleEl: null,
            storyBannerBodyEl: null,
            storyBannerCloseBtn: null,
            storyReviewBtn: null,
            storyReviewPanelEl: null,
            storyReviewListEl: null,
            storyReviewCloseBtn: null,
            gameplaySimFrozen: () => false,
            getGamePaused: () => false,
            setGamePaused: vi.fn(),
            getAscensionMapCollapsePending: () => false,
            getNumber1BlackHoleState: () => ({ phase: 0 }),
            startAscensionMapCollapseTransition: vi.fn(),
            refreshStoryArchiveSectionIfOpen: vi.fn()
        }, bridge);

        expect(story.checkStoryBanners).toBe(boot.checkStoryBanners);
        expect(bridge.showStoryBanner).toBe(boot.showStoryBanner);
        expect(bridge.showStoryBannerById).toBe(boot.showStoryBannerById);
    });
});
