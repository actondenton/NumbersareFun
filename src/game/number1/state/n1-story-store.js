/**
 * Story banner acknowledgment and archive state.
 */
export function createN1StoryStore() {
    return {
        shownBannerIds: new Set(),
        closedBanners: [],
        /** Patched after story-banner boot (turbo unlock runs before DOM story wiring). */
        checkStoryBanners: () => {}
    };
}
