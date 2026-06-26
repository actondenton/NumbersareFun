import { describe, expect, it, vi } from "vitest";

import { createN1StoryStore } from "../state/n1-story-store.js";
import { createNumber1StoryBannerBoot } from "./n1-story-banner-boot.js";

function storyBootDeps(overrides: Record<string, unknown> = {}) {
    const story = createN1StoryStore();
    return {
        story,
        storyBanners: [
            { id: "a", order: 1, trigger: () => false, title: "T", body: "B" }
        ],
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
        setGamePaused: () => {},
        getAscensionMapCollapsePending: () => false,
        getNumber1BlackHoleState: () => ({ phase1MapCollapseSeen: true }) as Record<string, unknown>,
        startAscensionMapCollapseTransition: () => {},
        refreshStoryArchiveSectionIfOpen: () => {},
        ...overrides
    };
}

describe("createNumber1StoryBannerBoot", () => {
    it("exposes getStoryBannerById and attaches guarded listeners when DOM nodes exist", () => {
        const addEventListener = vi.fn();
        const closeBtn = { addEventListener } as unknown as HTMLButtonElement;
        const boot = createNumber1StoryBannerBoot(storyBootDeps({
            storyBannerCloseBtn: closeBtn
        }));
        expect(boot.getStoryBannerById("a")?.id).toBe("a");
        expect(boot.getStoryBannerById("missing")).toBeNull();
        expect(addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("closeStoryBanner persists first-time dismissal via shownBannerIds + closedBanners", () => {
        const banner = { id: "welcome", order: 1, trigger: () => true, title: "Hi", body: "There" };
        const story = createN1StoryStore();
        const overlay = { style: { display: "flex" } };
        let paused = false;
        const boot = createNumber1StoryBannerBoot(storyBootDeps({
            story,
            storyBanners: [banner],
            storyBannerOverlayEl: overlay as unknown as HTMLElement,
            getGamePaused: () => paused,
            setGamePaused: v => {
                paused = v;
            }
        }));
        boot.showStoryBanner(banner);
        expect(paused).toBe(true);
        expect(overlay.style.display).toBe("flex");
        boot.closeStoryBanner();
        expect(story.shownBannerIds.has("welcome")).toBe(true);
        expect(story.closedBanners.length).toBe(1);
        expect(overlay.style.display).toBe("none");
        expect(paused).toBe(false);
    });

    it("suppresses story banners during dev black-hole jump and acknowledges them silently", () => {
        const banner = { id: "welcome", order: 1, trigger: () => true, title: "Hi", body: "There" };
        const story = createN1StoryStore();
        const overlay = { style: { display: "none" } };
        let paused = false;
        const boot = createNumber1StoryBannerBoot(storyBootDeps({
            story,
            storyBanners: [banner],
            storyBannerOverlayEl: overlay as unknown as HTMLElement,
            getGamePaused: () => paused,
            setGamePaused: v => {
                paused = v;
            }
        }));

        boot.setStoryBannerSuppression(true);
        boot.checkStoryBanners();
        expect(overlay.style.display).toBe("none");
        expect(paused).toBe(false);
        expect(story.shownBannerIds.has("welcome")).toBe(true);

        boot.setStoryBannerSuppression(false);
        boot.showStoryBanner({ id: "later", order: 2, title: "Later", body: "Beat" });
        expect(overlay.style.display).toBe("flex");
        expect(paused).toBe(true);
    });
});
