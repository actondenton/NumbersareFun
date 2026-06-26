import { describe, expect, it } from "vitest";
import { createN1UpgradesStore } from "./n1-upgrades-store.js";

describe("createN1UpgradesStore", () => {
    it("creates per-hand cheapen/slowdown arrays", () => {
        const u = createN1UpgradesStore({ maxHands: 3 });
        expect(u.cheapenLevel).toEqual([0, 0, 0]);
        expect(u.slowdownLevel).toEqual([0, 0, 0]);
        expect(u.slowdownUnlockLogged).toBe(false);
    });
});
