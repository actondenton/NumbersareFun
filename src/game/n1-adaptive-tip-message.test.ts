import { describe, expect, it } from "vitest";
import { TIME_WARP_MANUAL_CLICK_SCALE } from "./n1-time-warp.js";
import { computeNumber1AdaptiveTipMessage } from "./n1-adaptive-tip-message.js";

const defaultInputs = {
    totalChanges: 100,
    unlockedHands: 2,
    turboBoostUnlocked: true,
    slowdownUnlocked: true,
    timeWarpUnlocked: true,
    timeWarpProductionSecondsBonus: 60
};

function base(over: Partial<typeof defaultInputs> = {}) {
    return { ...defaultInputs, ...over };
}

describe("computeNumber1AdaptiveTipMessage", () => {
    it("gates on progression milestones", () => {
        expect(computeNumber1AdaptiveTipMessage(base({ totalChanges: 9 }))).toMatch(/first Speed/i);
        expect(
            computeNumber1AdaptiveTipMessage(base({ totalChanges: 20, unlockedHands: 1 }))
        ).toMatch(/Hand 2/);
        expect(
            computeNumber1AdaptiveTipMessage(base({ unlockedHands: 2, turboBoostUnlocked: false }))
        ).toMatch(/combo/i);
        expect(
            computeNumber1AdaptiveTipMessage(
                base({ turboBoostUnlocked: true, slowdownUnlocked: false })
            )
        ).toMatch(/Turbo is unlocked/i);
        expect(
            computeNumber1AdaptiveTipMessage(
                base({ slowdownUnlocked: true, timeWarpUnlocked: false })
            )
        ).toMatch(/Compaction/i);
        const tw = computeNumber1AdaptiveTipMessage(base({ timeWarpUnlocked: true }));
        expect(tw).toContain(String(TIME_WARP_MANUAL_CLICK_SCALE));
        expect(tw).toContain("60");
    });
});
