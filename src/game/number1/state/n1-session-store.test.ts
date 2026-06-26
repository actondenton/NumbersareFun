import { describe, expect, it } from "vitest";

import { createN1SessionStore } from "./n1-session-store.js";

describe("createN1SessionStore", () => {
    it("defaults unlockedNumbers to Number 1 and 2", () => {
        const session = createN1SessionStore();
        expect(session.unlockedNumbers).toEqual(new Set([1, 2]));
        expect(session.unlockedNumbers.has(2)).toBe(true);
    });
});
