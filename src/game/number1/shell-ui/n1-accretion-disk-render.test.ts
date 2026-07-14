import { describe, expect, it } from "vitest";

import {
    initNumber1StageAccretionDiskBg,
    renderAccretionDiskHeroInnerHtml,
    renderAccretionDiskSpiralNumeralsHtml
} from "./n1-accretion-disk-render.js";

describe("n1-accretion-disk-render", () => {
    it("renders spiral numerals and hero inner markup", () => {
        const spiral = renderAccretionDiskSpiralNumeralsHtml();
        expect(spiral).toContain("asc-black-hole__disk-spiral");
        expect(spiral).toContain("1</span>");
        const hero = renderAccretionDiskHeroInnerHtml();
        expect(hero).toContain("asc-black-hole__disk-glow");
        expect(hero).toContain(spiral);
    });

    it("initNumber1StageAccretionDiskBg is idempotent when wrap missing or already filled", () => {
        const original = globalThis.document;
        globalThis.document = {
            getElementById: () => null
        } as unknown as Document;
        expect(() => initNumber1StageAccretionDiskBg()).not.toThrow();

        const wrap = {
            dataset: {} as Record<string, string>,
            innerHTML: ""
        };
        globalThis.document = {
            getElementById: (id: string) => (id === "number1-stage-disk-bg" ? wrap : null)
        } as unknown as Document;
        initNumber1StageAccretionDiskBg();
        expect(wrap.dataset.diskBgInit).toBe("1");
        expect(wrap.innerHTML).toContain("number1-stage-disk-hero");
        const htmlOnce = wrap.innerHTML;
        initNumber1StageAccretionDiskBg();
        expect(wrap.innerHTML).toBe(htmlOnce);
        globalThis.document = original;
    });
});
