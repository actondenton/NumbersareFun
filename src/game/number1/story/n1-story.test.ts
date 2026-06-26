import { describe, expect, it } from "vitest";
import {
    createClosedStoryBannerRecord,
    escapeHtml,
    getBlackHoleDevJumpStoryBannerIdsForPhase,
    getNextPendingStoryBanner,
    getStoryArchiveChapters,
    getStoryBannerById,
    hasUnlockedStoryBanner,
    renderStoryArchiveHtml,
    silentlyAcknowledgeEligibleStoryBanners,
    silentlyAcknowledgeStoryBannerIds
} from "./n1-story.js";

describe("Number 1 story helpers", () => {
    const banners = [
        { id: "b", order: 2, title: "Second", body: "Second body", trigger: () => true },
        { id: "a", order: 1, title: "First", body: "First body", trigger: () => true },
        { id: "c", order: 3, title: "Third", body: "Third body", trigger: () => false }
    ];

    it("finds banners and selects the next pending trigger by order", () => {
        expect(getStoryBannerById(banners, "a")?.title).toBe("First");
        expect(getStoryBannerById(banners, "missing")).toBeNull();
        expect(getNextPendingStoryBanner(banners, new Set())?.id).toBe("a");
        expect(getNextPendingStoryBanner(banners, new Set(["a"]))?.id).toBe("b");
    });

    it("tracks unlocked banners from shown and closed state", () => {
        expect(hasUnlockedStoryBanner("a", new Set(["a"]), [])).toBe(true);
        expect(hasUnlockedStoryBanner("legacy", new Set(), [{ id: "legacy" }])).toBe(true);
        expect(hasUnlockedStoryBanner("missing", new Set(), [])).toBe(false);
    });

    it("creates closed banner records", () => {
        expect(createClosedStoryBannerRecord(banners[0], 123)).toEqual({
            id: "b",
            order: 2,
            title: "Second",
            body: "Second body",
            closedAt: 123
        });
    });

    it("combines canonical and legacy story archive chapters", () => {
        const chapters = getStoryArchiveChapters(banners, [{ id: "legacy", order: 0, title: "Old", body: "Old body" }]);
        expect(chapters.map(c => c.id)).toEqual(["legacy", "a", "b", "c"]);
    });

    it("renders locked and unlocked story archive rows", () => {
        const html = renderStoryArchiveHtml(banners, [], new Set(["a"]));

        expect(html).toContain("1 / 3 transmissions recovered");
        expect(html).toContain("data-story-replay-id=\"a\"");
        expect(html).toContain("<strong class=\"story-review-item-title\">First</strong>");
        expect(html).toContain("<strong class=\"story-review-item-title\">???</strong>");
    });

    it("escapes story archive HTML without DOM access", () => {
        expect(escapeHtml("<tag attr=\"x\">Tom & Jerry's</tag>")).toBe("&lt;tag attr=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/tag&gt;");
    });

    it("silently acknowledges eligible banners without showing them", () => {
        const shownBannerIds = new Set<string>();
        const closedBanners: object[] = [];
        expect(silentlyAcknowledgeEligibleStoryBanners(banners, shownBannerIds, closedBanners, 99)).toBe(2);
        expect(shownBannerIds).toEqual(new Set(["a", "b"]));
        expect(closedBanners).toHaveLength(2);
        expect(getNextPendingStoryBanner(banners, shownBannerIds)).toBeNull();
    });

    it("maps black-hole dev-jump phases to arc story banner ids", () => {
        expect(getBlackHoleDevJumpStoryBannerIdsForPhase(0)).toEqual([]);
        expect(getBlackHoleDevJumpStoryBannerIdsForPhase(1)).toEqual([
            "black-hole-mass-accumulator-intro",
            "ascension-map-collapse-ready"
        ]);
        expect(getBlackHoleDevJumpStoryBannerIdsForPhase(3)).toEqual([
            "black-hole-mass-accumulator-intro",
            "ascension-map-collapse-ready",
            "black-hole-phase-1-collapse",
            "black-hole-phase-2-disk"
        ]);
        expect(getBlackHoleDevJumpStoryBannerIdsForPhase(7)).toContain("black-hole-phase-6-evaporation");
    });

    it("silently acknowledges explicit banner ids when present", () => {
        const shownBannerIds = new Set<string>();
        const closedBanners: object[] = [];
        const count = silentlyAcknowledgeStoryBannerIds(["a", "missing"], banners, shownBannerIds, closedBanners, 5);
        expect(count).toBe(1);
        expect(shownBannerIds.has("a")).toBe(true);
    });
});
