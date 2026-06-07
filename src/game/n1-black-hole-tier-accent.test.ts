import { describe, expect, it } from "vitest";

import {
    BH_TIER_ACCENT_CLASSES,
    applyBlackHoleTierAccentClass,
    getBlackHoleTierAccentClass
} from "./n1-black-hole-tier-accent.js";

function makeMockEl() {
    const classes = new Set<string>();
    return {
        classList: {
            add(c: string) {
                classes.add(c);
            },
            remove(c: string) {
                classes.delete(c);
            },
            has(c: string) {
                return classes.has(c);
            }
        }
    } as unknown as Element;
}

describe("n1-black-hole-tier-accent", () => {
    it("maps tiers to accent classes", () => {
        expect(getBlackHoleTierAccentClass(0)).toBe("");
        expect(getBlackHoleTierAccentClass(1)).toBe("bh-tier-accent--1");
        expect(getBlackHoleTierAccentClass(2)).toBe("bh-tier-accent--2");
        expect(getBlackHoleTierAccentClass(3)).toBe("bh-tier-accent--3");
        expect(getBlackHoleTierAccentClass(9)).toBe("bh-tier-accent--3");
    });

    it("applies and clears accent classes on an element", () => {
        const el = makeMockEl();
        const cls = el.classList as Set<string> & { add: (c: string) => void; remove: (c: string) => void };

        applyBlackHoleTierAccentClass(el, 2);
        expect(cls.has("bh-tier-accent--2")).toBe(true);

        applyBlackHoleTierAccentClass(el, 3);
        expect(cls.has("bh-tier-accent--2")).toBe(false);
        expect(cls.has("bh-tier-accent--3")).toBe(true);

        applyBlackHoleTierAccentClass(el, 0);
        for (const c of BH_TIER_ACCENT_CLASSES) {
            expect(cls.has(c)).toBe(false);
        }
    });
});
