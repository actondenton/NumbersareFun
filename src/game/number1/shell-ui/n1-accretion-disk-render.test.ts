import { describe, expect, it } from "vitest";

import { renderAccretionDiskHeroInnerHtml, renderAccretionDiskSpiralNumeralsHtml } from "./n1-accretion-disk-render.js";

describe("n1-accretion-disk-render", () => {
    it("renders spiral numerals and hero inner markup", () => {
        const spiral = renderAccretionDiskSpiralNumeralsHtml();
        expect(spiral).toContain("asc-black-hole__disk-spiral");
        expect(spiral).toContain("1</span>");
        const hero = renderAccretionDiskHeroInnerHtml();
        expect(hero).toContain("asc-black-hole__disk-glow");
        expect(hero).toContain(spiral);
    });
});
