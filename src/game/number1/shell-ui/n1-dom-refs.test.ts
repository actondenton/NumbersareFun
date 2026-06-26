import { describe, expect, it } from "vitest";

import { collectNumber1DomRefs } from "./n1-dom-refs.js";

describe("collectNumber1DomRefs", () => {
    it("returns an object with expected keys", () => {
        const doc = {
            getElementById: (id) => ({ id }),
            querySelector: () => null,
            querySelectorAll: () => []
        };
        const refs = collectNumber1DomRefs(doc);
        expect(refs.incrementalEl).toEqual({ id: "incremental-count" });
        expect(refs.pageButtons).toEqual([]);
        expect(refs.getUpgradeContainer()).toEqual({ id: "upgrade-container" });
    });
});
