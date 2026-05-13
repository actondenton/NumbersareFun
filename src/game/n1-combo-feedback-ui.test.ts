import { describe, expect, it } from "vitest";
import { createComboFeedbackUi } from "./n1-combo-feedback-ui.js";

describe("createComboFeedbackUi", () => {
    it("computes digest for locked combo state (<2 hands)", () => {
        const { computeEarnedBonusesUiDigest } = createComboFeedbackUi({
            comboBubbleContainerEl: null,
            combinationsPageBtn: null,
            computeAscensionGrantTotals: () => ({}),
            getUnlockedHands: () => 1,
            getEarnedComboNames: () => [],
            getComboDiscoveryPendingQueue: () => [],
            getPatternCatalogMultiplier: () => 1,
            getAscensionComboPatternMult: () => 1,
            getComboMultiplier: () => 1,
            getTimeWarpComboMultiplier: () => 1,
            getCombosByMinHands: () => ({})
        });
        expect(computeEarnedBonusesUiDigest()).toBe("u1");
    });
});
