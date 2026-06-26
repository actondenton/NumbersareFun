import { describe, expect, it } from "vitest";
import {
    clampFiniteNonNegative,
    formatCpsForDisplay,
    getTickIntervalMsForMultiplier
} from "./n1-rate.js";

describe("Number 1 rate helpers", () => {
    it("clamps finite non-negative values", () => {
        expect(clampFiniteNonNegative(5)).toBe(5);
        expect(clampFiniteNonNegative(0)).toBe(0);
        expect(clampFiniteNonNegative(-1)).toBe(0);
        expect(clampFiniteNonNegative(Number.POSITIVE_INFINITY)).toBe(0);
    });

    it("formats CPS display values", () => {
        const formatCount = (n: number) => String(n);
        expect(formatCpsForDisplay(0, formatCount)).toBe("0/s");
        expect(formatCpsForDisplay(1.234, formatCount)).toBe("1.23/s");
        expect(formatCpsForDisplay(1e6, formatCount)).toBe("1000000/s");
    });

    it("computes tick interval from speed multiplier", () => {
        expect(getTickIntervalMsForMultiplier(1000, 4)).toBe(250);
        expect(getTickIntervalMsForMultiplier(1000, 0)).toBe(0);
        expect(getTickIntervalMsForMultiplier(1000, Number.NaN)).toBe(0);
    });
});
