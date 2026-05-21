import { describe, expect, it } from "vitest";
import { wireNumber1SlowdownCheapenSpeedAndTimeWarpBoots } from "./n1-upgrades-rate-turbo-boot.js";

describe("n1-upgrades-rate-turbo-boot", () => {
    it("exports wire factory", () => {
        expect(typeof wireNumber1SlowdownCheapenSpeedAndTimeWarpBoots).toBe("function");
    });
});
