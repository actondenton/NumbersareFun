import { describe, expect, it } from "vitest";

import { renderAscensionPageShellHtml } from "./n1-ascension-page-shell.js";

describe("renderAscensionPageShellHtml", () => {
    it("wraps Number 1 body when tab 2 is locked", () => {
        const html = renderAscensionPageShellHtml({
            activeTabNumber: 1,
            number2TabsUnlocked: false,
            renderNumber1AscensionBody: () => "<div class=\"n1\">x</div>",
            renderNumber2AscensionBody: () => "<div class=\"n2\">y</div>",
            renderAscensionFallbackBody: () => "<div class=\"fb\">z</div>"
        });
        expect(html).toBe(
            "<div class=\"ascension-page\"><div class=\"ascension-page-body\"><div class=\"n1\">x</div></div></div>"
        );
    });

    it("renders both tabs and routes to Number 2 body", () => {
        const html = renderAscensionPageShellHtml({
            activeTabNumber: 2,
            number2TabsUnlocked: true,
            renderNumber1AscensionBody: () => "A",
            renderNumber2AscensionBody: () => "B",
            renderAscensionFallbackBody: () => "C"
        });
        expect(html).toBe(
            "<div class=\"ascension-page\">" +
            "<div class=\"ascension-page-tabs\" role=\"tablist\" aria-label=\"Ascension by number\">" +
            "<button type=\"button\" class=\"page-btn ascension-number-tab\" data-asc-tab=\"1\" role=\"tab\" aria-selected=\"false\">Number 1</button>" +
            "<button type=\"button\" class=\"page-btn ascension-number-tab ascension-number-tab--active\" data-asc-tab=\"2\" role=\"tab\" aria-selected=\"true\">Number 2</button>" +
            "</div>" +
            "<div class=\"ascension-page-body\">B</div></div>"
        );
    });

    it("uses fallback when tab 2 active but tabs hidden", () => {
        const html = renderAscensionPageShellHtml({
            activeTabNumber: 2,
            number2TabsUnlocked: false,
            renderNumber1AscensionBody: () => "A",
            renderNumber2AscensionBody: () => "B",
            renderAscensionFallbackBody: () => "<p>fb</p>"
        });
        expect(html).toBe(
            "<div class=\"ascension-page\"><div class=\"ascension-page-body\"><p>fb</p></div></div>"
        );
    });
});
