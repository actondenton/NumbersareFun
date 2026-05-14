import { describe, expect, it, vi } from "vitest";

import { createNumber1StoryBannerBoot } from "./n1-story-banner-boot.js";

describe("createNumber1StoryBannerBoot", () => {
    it("exposes getStoryBannerById and attaches guarded listeners when DOM nodes exist", () => {
        const addEventListener = vi.fn();
        const closeBtn = { addEventListener } as unknown as HTMLButtonElement;
        const boot = createNumber1StoryBannerBoot({
            storyBanners: [
                { id: "a", order: 1, trigger: () => false, title: "T", body: "B" }
            ],
            shownBannerIds: new Set(),
            closedBanners: [],
            storyBannerOverlayEl: null,
            storyBannerTitleEl: null,
            storyBannerBodyEl: null,
            storyBannerCloseBtn: closeBtn,
            storyReviewBtn: null,
            storyReviewPanelEl: null,
            storyReviewListEl: null,
            storyReviewCloseBtn: null,
            gameplaySimFrozen: () => false,
            getGamePaused: () => false,
            setGamePaused: () => {},
            getAscensionMapCollapsePending: () => false,
            getNumber1BlackHoleState: () => ({ phase1MapCollapseSeen: true }) as Record<string, unknown>,
            startAscensionMapCollapseTransition: () => {},
            refreshStoryArchiveSectionIfOpen: () => {}
        });
        expect(boot.getStoryBannerById("a")?.id).toBe("a");
        expect(boot.getStoryBannerById("missing")).toBeNull();
        expect(addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("closeStoryBanner persists first-time dismissal via shownBannerIds + closedBanners", () => {
        const banner = { id: "welcome", order: 1, trigger: () => true, title: "Hi", body: "There" };
        const shownBannerIds = new Set<string>();
        const closedBanners: object[] = [];
        const overlay = { style: { display: "flex" } };
        let paused = false;
        const boot = createNumber1StoryBannerBoot({
            storyBanners: [banner],
            shownBannerIds,
            closedBanners,
            storyBannerOverlayEl: overlay as unknown as HTMLElement,
            storyBannerTitleEl: null,
            storyBannerBodyEl: null,
            storyBannerCloseBtn: null,
            storyReviewBtn: null,
            storyReviewPanelEl: null,
            storyReviewListEl: null,
            storyReviewCloseBtn: null,
            gameplaySimFrozen: () => false,
            getGamePaused: () => paused,
            setGamePaused: v => {
                paused = v;
            },
            getAscensionMapCollapsePending: () => false,
            getNumber1BlackHoleState: () => ({ phase1MapCollapseSeen: true }) as Record<string, unknown>,
            startAscensionMapCollapseTransition: () => {},
            refreshStoryArchiveSectionIfOpen: () => {}
        });
        boot.showStoryBanner(banner);
        expect(paused).toBe(true);
        expect(overlay.style.display).toBe("flex");
        boot.closeStoryBanner();
        expect(shownBannerIds.has("welcome")).toBe(true);
        expect(closedBanners.length).toBe(1);
        expect(overlay.style.display).toBe("none");
        expect(paused).toBe(false);
    });
});
