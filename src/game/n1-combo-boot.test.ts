import { describe, expect, it, vi } from "vitest";
import { createNumber1ComboBoot } from "./n1-combo-boot.js";

describe("n1-combo-boot", () => {
    it("returns discovery + panel handles", () => {
        const earnedComboNames = [];
        const comboActivationCounts = {};
        const pending = [];
        let readyAt = 0;
        let cooldownSpan = 0;
        let prev = new Set();
        let lastDigest = "";
        const out = createNumber1ComboBoot({
            getHands: () => [],
            getUnlockedHands: () => 1,
            getAscensionNodeIds: () => [],
            getNearMissToleranceRanks: () => [],
            formatCount: n => String(n),
            renderComboPagePerHandStatusSectionHtml: () => "",
            computeAscensionGrantTotals: () => ({}),
            ASCENSION_COMBO_EARNED_PATTERN_MULT_CAP: 10,
            combinationsPageBtn: null,
            getPagePanelEl: () => null,
            getPagePanelBodyEl: () => null,
            getPagePanelTitleEl: () => null,
            comboBubbleContainerEl: null,
            getComboDiscoveryMilestoneCooldownMs: () => 1000,
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            updateRateDisplay: () => {},
            playLedgerBeamBonus: () => {},
            applyAscensionComboTimeWarpDelayReduction: () => {},
            getTurboBoostUnlocked: () => false,
            addTurboBoostMeter: () => {},
            getTurboComboPoints: () => 0,
            refreshCombinationsHandStatusIfOpen: () => {},
            updateComboDiscoveryMilestonePanelIfOpen: () => {},
            earnedComboNames,
            getComboActivationCounts: () => comboActivationCounts,
            getMilestonePendingQueue: () => pending,
            getMilestoneReadyAtMs: () => readyAt,
            setMilestoneReadyAtMs: v => {
                readyAt = v;
            },
            setMilestoneCooldownSpanMs: v => {
                cooldownSpan = v;
            },
            getPreviousTickActiveComboNames: () => prev,
            setPreviousTickActiveComboNames: s => {
                prev = s;
            },
            getLastComboUiInputDigest: () => lastDigest,
            setLastComboUiInputDigest: v => {
                lastDigest = v;
            }
        });
        expect(typeof out.updateComboUI).toBe("function");
        expect(typeof out.getComboMultiplier).toBe("function");
        expect(out.getComboMultiplier()).toBe(1);
        expect(typeof out.refreshCombinationsPanelIfOpen).toBe("function");
    });
});
