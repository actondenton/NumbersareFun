import { describe, expect, it, vi } from "vitest";

import { createMessageStoryLogPageBoot } from "./n1-message-story-log-page.js";

describe("createMessageStoryLogPageBoot", () => {
    it("composes message log and story archive sections", () => {
        const boot = createMessageStoryLogPageBoot({
            logTickerRt: {
                renderMessageLogPageHtml: vi.fn(() => "<div class=\"msg\">line</div>")
            },
            escapeHtml: (s: string) => s,
            renderStoryArchiveHtmlForState: () => "<section class=\"story-log-section\">archive</section>",
            getStoryBanners: () => [],
            story: { closedBanners: [], shownBannerIds: [] },
            pagePanelEl: null,
            pagePanelBodyEl: null
        });
        const html = boot.renderMessageAndStoryLogPageHtml();
        expect(html).toContain("message-log-section");
        expect(html).toContain("Message Log");
        expect(html).toContain("msg");
        expect(html).toContain("archive");
    });

    it("patches story archive section when messages page is open", () => {
        const section = { outerHTML: "" };
        const pagePanelBodyEl = {
            querySelector: vi.fn(() => section)
        };
        const pagePanelEl = {
            style: { display: "block" },
            dataset: { openPageId: "messages" }
        };
        const boot = createMessageStoryLogPageBoot({
            logTickerRt: { renderMessageLogPageHtml: () => "" },
            escapeHtml: (s: string) => s,
            renderStoryArchiveHtmlForState: () => "<section class=\"story-log-section\">new</section>",
            getStoryBanners: () => [],
            story: { closedBanners: [], shownBannerIds: [] },
            pagePanelEl,
            pagePanelBodyEl
        });
        boot.refreshStoryArchiveSectionIfOpen();
        expect(section.outerHTML).toBe("<section class=\"story-log-section\">new</section>");
    });
});
