import { createNumber1StoryBannerBoot } from "./n1-story-banner-boot.js";

/**
 * Story banner boot + `checkStoryBanners` on store + optional BH bridge patch (Phase 21b).
 *
 * @param {Parameters<typeof createNumber1StoryBannerBoot>[0]} dep
 * @param {{ showStoryBanner?: (banner: unknown, opts?: unknown) => void, showStoryBannerById?: (id: string) => void }} [storyBannerBridge]
 */
export function wireNumber1Story(dep, storyBannerBridge) {
    const boot = createNumber1StoryBannerBoot(dep);
    dep.story.checkStoryBanners = boot.checkStoryBanners;
    if (storyBannerBridge) {
        Object.assign(storyBannerBridge, {
            showStoryBanner: boot.showStoryBanner,
            showStoryBannerById: boot.showStoryBannerById
        });
    }
    return boot;
}

/**
 * @param {Parameters<typeof createNumber1StoryBannerBoot>[0]} ctx
 */
export function createNumber1StoryWireDeps(ctx) {
    return ctx;
}
