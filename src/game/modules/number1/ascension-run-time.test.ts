import { describe, expect, it } from "vitest";

import {
    ASCENSION_RUN_TIME_MAX_SEC,
    getNumber1AscensionRunDurationSec,
    getNumber1AscensionRunTimeMultPct,
    isNumber1AscensionRunTimeRampIncomplete
} from "./ascension-run-time.js";

describe("ascension run time multiplier", () => {
    it("ramps 0–100% over the first 30 seconds", () => {
        expect(getNumber1AscensionRunTimeMultPct(0)).toBe(0);
        expect(getNumber1AscensionRunTimeMultPct(15)).toBeCloseTo(50, 5);
        expect(getNumber1AscensionRunTimeMultPct(30)).toBeCloseTo(100, 5);
        expect(isNumber1AscensionRunTimeRampIncomplete(29)).toBe(true);
        expect(isNumber1AscensionRunTimeRampIncomplete(30)).toBe(false);
    });

    it("steps through tier 2 and tier 3 bonuses", () => {
        expect(getNumber1AscensionRunTimeMultPct(31)).toBeCloseTo(101, 5);
        expect(getNumber1AscensionRunTimeMultPct(120)).toBeCloseTo(200, 5);
        expect(getNumber1AscensionRunTimeMultPct(121)).toBeCloseTo(201, 5);
        expect(getNumber1AscensionRunTimeMultPct(600)).toBeCloseTo(400, 5);
    });

    it("adds +1% per minute after 600s and caps at 24h", () => {
        expect(getNumber1AscensionRunTimeMultPct(659)).toBe(400);
        expect(getNumber1AscensionRunTimeMultPct(660)).toBe(401);
        expect(getNumber1AscensionRunTimeMultPct(720)).toBe(402);
        expect(getNumber1AscensionRunTimeMultPct(ASCENSION_RUN_TIME_MAX_SEC)).toBe(400 + Math.floor((ASCENSION_RUN_TIME_MAX_SEC - 600) / 60));
    });

    it("computes duration from run start timestamp", () => {
        expect(getNumber1AscensionRunDurationSec(1000, 45000)).toBe(44);
        expect(getNumber1AscensionRunDurationSec(0, 45000)).toBe(0);
    });
});
