import { describe, expect, it } from "vitest";
import {
    createClosedStoryBannerRecord,
    escapeHtml,
    getNextPendingStoryBanner,
    getStoryArchiveChapters,
    getStoryBannerById,
    hasUnlockedStoryBanner,
    renderStoryArchiveHtml
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
});
