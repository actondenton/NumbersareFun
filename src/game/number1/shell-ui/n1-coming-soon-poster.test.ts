import { describe, expect, it } from "vitest";

import { renderComingSoonPoster } from "./n1-coming-soon-poster.js";

describe("renderComingSoonPoster", () => {
    it("wraps heading and body in coming-soon poster markup", () => {
        const html = renderComingSoonPoster("Title", "<p>Body</p>");
        expect(html).toContain("coming-soon-poster");
        expect(html).toContain("coming-soon-poster-title\">Title</h4>");
        expect(html).toContain("<p>Body</p>");
    });
});
