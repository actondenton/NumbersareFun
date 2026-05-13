import { describe, expect, it } from "vitest";
import { CPS_HEADLINE_THROTTLE_MS } from "./n1-rate-display-ui.js";

describe("n1-rate-display-ui", () => {
    it("exposes a positive headline throttle interval", () => {
        expect(CPS_HEADLINE_THROTTLE_MS).toBeGreaterThan(0);
        expect(CPS_HEADLINE_THROTTLE_MS).toBe(1000);
    });
});
