import { describe, expect, it } from "vitest";
import {
    getLogEntrySig,
    getVisibleLogEntries,
    isLogCategoryVisible,
    logCategoryTag,
    normalizeLogCategory,
    renderMessageLogLineHtml,
    renderMessageLogPageHtml
} from "./n1-log.js";
import { escapeHtml } from "./n1-story.js";

describe("Number 1 log helpers", () => {
    it("normalizes legacy log categories and filters humor", () => {
        expect(normalizeLogCategory("action")).toBe("milestone");
        expect(normalizeLogCategory("message")).toBe("fact");
        expect(normalizeLogCategory("unknown")).toBe("fact");
        expect(isLogCategoryVisible("humor", false)).toBe(false);
        expect(isLogCategoryVisible("humor", true)).toBe(true);
    });

    it("renders category tags and log line HTML", () => {
        expect(logCategoryTag("warning")).toBe("WARN");
        expect(logCategoryTag("humor")).toBe("JOKE");
        expect(renderMessageLogLineHtml({ category: "warning", text: "<careful>" }, escapeHtml))
            .toContain("<span class=\"message-log-text\">&lt;careful&gt;</span>");
    });

    it("filters visible log entries and computes entry signatures", () => {
        const entries = [
            { category: "tip", text: "A" },
            { category: "humor", text: "B" }
        ];

        expect(getVisibleLogEntries(entries, false)).toEqual([{ category: "tip", text: "A" }]);
        expect(getVisibleLogEntries(entries, true)).toHaveLength(2);
        expect(getLogEntrySig(entries[0])).toBe("tip\nA");
        expect(getLogEntrySig(undefined)).toBe("");
    });

    it("renders empty and populated message log pages", () => {
        expect(renderMessageLogPageHtml([], escapeHtml)).toContain("message_feed // 0 line(s) visible");
        const html = renderMessageLogPageHtml([{ category: "milestone", text: "Done" }], escapeHtml);
        expect(html).toContain("message_feed // 1 line(s) visible");
        expect(html).toContain("[MILESTONE]");
        expect(html).toContain("Done");
    });
});
