import { describe, expect, it } from "vitest";
import {
    HAND_BASE_SPEED,
    UNLOCK_THRESHOLDS,
    getEffectiveUnlockedHandsCap,
    shouldUnlockNextHand,
    storyTotalCountLead
} from "./n1-hands.js";

describe("Number 1 hand helpers", () => {
    it("exports hand unlock constants", () => {
        expect(HAND_BASE_SPEED).toBe(1000);
        expect(UNLOCK_THRESHOLDS[0]).toBe(1e9);
        expect(UNLOCK_THRESHOLDS.at(-1)).toBe(1e33);
    });

    it("formats story threshold lead text", () => {
        expect(storyTotalCountLead(1000, n => `${n}`)).toBe("At 1000 total count on your counter, ");
    });

    it("clamps effective unlock caps", () => {
        expect(getEffectiveUnlockedHandsCap(99, 10)).toBe(10);
        expect(getEffectiveUnlockedHandsCap(0, 10)).toBe(1);
        expect(getEffectiveUnlockedHandsCap(5, 10)).toBe(5);
    });

    it("checks whether the next hand should unlock", () => {
        expect(shouldUnlockNextHand(1, 10, 1e9, 10)).toBe(true);
        expect(shouldUnlockNextHand(1, 10, 1e9 - 1, 10)).toBe(false);
        expect(shouldUnlockNextHand(10, 10, 1e40, 10)).toBe(false);
        expect(shouldUnlockNextHand(4, 4, 1e40, 10)).toBe(false);
    });
});
