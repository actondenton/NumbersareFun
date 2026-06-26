import { describe, expect, it, vi } from "vitest";

import {
    createCombinationsForwardRefHolder,
    patchCombinationsForwardRefs,
    wireNumber1Combinations
} from "./n1-combinations-wire.js";

describe("n1-combinations-wire", () => {
    it("patches forward holder when combinations boot wires", () => {
        const forward = createCombinationsForwardRefHolder();
        expect(forward.getComboMultiplier()).toBe(1);

        const boot = wireNumber1Combinations({
            forward,
            combo: {
                earnedComboNames: [],
                comboActivationCounts: {},
                comboDiscoveryMilestonePendingQueue: [],
                comboDiscoveryMilestoneReadyAtMs: 0,
                comboDiscoveryMilestoneCooldownSpanMs: 60000,
                previousTickActiveComboNames: new Set()
            },
            run: { unlockedHands: 1, handEarnings: [1], totalChanges: 1 },
            ascension: { number1AscensionNodeIds: [] },
            turbo: { turboBoostUnlocked: false },
            getHands: () => [],
            getNearMissToleranceRanks: () => 0,
            computeAscensionGrantTotals: () => ({}),
            formatCount: n => String(n),
            renderComboPagePerHandStatusSectionHtml: () => "",
            pagePanelEl: null,
            pagePanelBodyEl: null,
            pagePanelTitleEl: null,
            combinationsPageBtn: null,
            refreshCombinationsHandStatusIfOpen: vi.fn(),
            addToLog: vi.fn(),
            markMeaningfulProgress: vi.fn(),
            updateRateDisplay: vi.fn(),
            ledgerBeamPlayBonus: vi.fn(),
            applyAscensionComboTimeWarpDelayReduction: vi.fn(),
            addTurboBoostMeter: vi.fn(),
            getTurboComboPoints: () => 0,
            devTurboComboMeterGainDisabled: false
        });

        expect(typeof boot.getComboMultiplier).toBe("function");
        expect(forward.getComboMultiplier).toBe(boot.getComboMultiplier);
    });

    it("patchCombinationsForwardRefs copies boot exports onto holder", () => {
        const forward = createCombinationsForwardRefHolder();
        const boot = {
            getComboMultiplier: () => 42,
            getPatternCatalogMultiplier: () => 2,
            getAscensionComboPatternMult: () => 3,
            getTimeWarpComboMultiplier: () => 4,
            getComboDiscoveryMilestoneCooldownMs: () => 5,
            updateComboDiscoveryMilestonePanelIfOpen: vi.fn(),
            patchCombinationsPageLiveDom: vi.fn(),
            renderCombinationsPageHtml: () => "html",
            setComboIndexStatusFilter: vi.fn(),
            setComboIndexHandsFilter: vi.fn(),
            resetComboIndexFilters: vi.fn(),
            refreshCombinationsPanelIfOpen: vi.fn(),
            markCombinationsPanelOpenedClock: vi.fn(),
            consumeComboFilterClickDebounced: vi.fn(),
            tryProcessOneComboDiscoveryMilestone: vi.fn(),
            updateComboUI: vi.fn(),
            updateEarnedBonusesUI: vi.fn()
        };
        patchCombinationsForwardRefs(boot, forward);
        expect(forward.getComboMultiplier()).toBe(42);
    });
});
