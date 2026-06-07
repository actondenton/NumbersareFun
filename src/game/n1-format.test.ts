import { describe, expect, it } from "vitest";
import {
    formatBlackHoleMultForUi,
    formatCompactMultiplier,
    formatCount,
    formatSeconds,
    formatTurboBoostMultiplierForDisplay,
    formatTurboScensionLevelDisplay,
    formatWithCommas
} from "./n1-format.js";

describe("Number 1 format helpers", () => {
    it("formats counts with commas below one million", () => {
        expect(formatWithCommas(123456)).toBe("123,456");
        expect(formatCount(999999)).toBe("999,999");
    });

    it("formats large counts with magnitude names", () => {
        expect(formatCount(1_500_000)).toBe("1.50 million");
        expect(formatCount(1e36)).toBe("1.00 e36");
    });

    it("formats durations as compact hours, minutes, and seconds", () => {
        expect(formatSeconds(9)).toBe("9s");
        expect(formatSeconds(75)).toBe("1m 15s");
        expect(formatSeconds(3661)).toBe("1h 1m 1s");
    });

    it("keeps multiplier displays compact", () => {
        expect(formatCompactMultiplier(2.3456)).toBe("2.346");
        expect(formatCompactMultiplier(1234)).toBe("1234.0");
        expect(formatTurboBoostMultiplierForDisplay(99.96)).toBe("100×");
        expect(formatTurboBoostMultiplierForDisplay(1_250_000)).toBe("1.3 million×");
    });

    it("formats black hole mults with exponential notation at large magnitudes", () => {
        expect(formatBlackHoleMultForUi(1.234567)).toBe("1.235");
        expect(formatBlackHoleMultForUi(19306.98)).toBe("1.93e+4");
        expect(formatBlackHoleMultForUi(1.3894954943731345e17)).toBe("1.39e+17");
    });

    it("formats Turbo-scension levels as whole values", () => {
        expect(formatTurboScensionLevelDisplay(0)).toBe("0");
        expect(formatTurboScensionLevelDisplay(123456)).toBe("123,456");
        expect(formatTurboScensionLevelDisplay(1_500_000)).toBe("2 million");
    });
});
