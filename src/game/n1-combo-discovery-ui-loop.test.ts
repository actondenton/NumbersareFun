import { describe, expect, it, vi } from "vitest";

import { COMBOS } from "./n1-combos.js";
import { createComboDiscoveryUiLoop } from "./n1-combo-discovery-ui-loop.js";

function findCombo(name: string) {
    const c = COMBOS.find(x => x.name === name);
    if (!c) throw new Error("missing combo " + name);
    return c;
}

describe("createComboDiscoveryUiLoop", () => {
    it("does not enqueue a combo twice when it is already in the milestone queue", () => {
        const pendingQueue = ["Two Pair"];
        let readyMs = Number.MAX_SAFE_INTEGER;
        let spanMs = 0;
        let lastDigest = "";

        let prevTick = new Set<string>();
        const activationCounts: Record<string, number> = {};
        let rafScheduled = false;
        globalThis.requestAnimationFrame = ((cb: () => void) => {
            rafScheduled = true;
            return 0;
        }) as typeof requestAnimationFrame;

        const { updateComboUI } = createComboDiscoveryUiLoop({
            getUnlockedHands: () => 5,
            getEarnedComboNames: () => [],
            getMilestonePendingQueue: () => pendingQueue,
            getMilestoneReadyAtMs: () => readyMs,
            setMilestoneReadyAtMs: ms => {
                readyMs = ms;
            },
            setMilestoneCooldownSpanMs: ms => {
                spanMs = ms;
            },
            getPatternCatalogMultiplier: () => 1,
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            showComboBubble: () => {},
            pulseCombinationsPageButtonForNewBonus: () => {},
            updateEarnedBonusesUI: () => {},
            updateRateDisplay: () => {},
            playLedgerBeamBonus: vi.fn(),
            getComboDiscoveryMilestoneCooldownMs: () => 100,
            computeComboUiInputDigest: () => "digest-a",
            isCombinationsPageOpen: () => false,
            getActiveCombos: () => [findCombo("Two Pair")],
            getLastComboUiInputDigest: () => lastDigest,
            setLastComboUiInputDigest: v => {
                lastDigest = v;
            },
            getPreviousTickActiveComboNames: () => prevTick,
            setPreviousTickActiveComboNames: s => {
                prevTick = s;
            },
            getComboActivationCounts: () => activationCounts,
            applyAscensionComboTimeWarpDelayReduction: () => {},
            getTurboBoostUnlocked: () => false,
            addTurboBoostMeter: () => {},
            getTurboComboPoints: () => 0,
            refreshCombinationsPanelIfOpen: () => {}
        });

        updateComboUI();
        expect(pendingQueue).toEqual(["Two Pair"]);
        expect(rafScheduled).toBe(false);
        expect(spanMs).toBe(0);
    });

    it("processes one discovery milestone when cooldown is clear", () => {
        const pendingQueue = ["Pair of 1s"];
        let readyMs = 0;
        const earnedComboNames: string[] = [];

        globalThis.requestAnimationFrame = cb => {
            cb();
            return 0;
        };

        let prevTick = new Set<string>();

        let lastDigest = "";
        const combo = findCombo("Pair of 1s");
        const { tryProcessOneComboDiscoveryMilestone } = createComboDiscoveryUiLoop({
            getUnlockedHands: () => 2,
            getEarnedComboNames: () => earnedComboNames,
            getMilestonePendingQueue: () => pendingQueue,
            getMilestoneReadyAtMs: () => readyMs,
            setMilestoneReadyAtMs: ms => {
                readyMs = ms;
            },
            setMilestoneCooldownSpanMs: () => {},
            getPatternCatalogMultiplier: () => 1,
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            showComboBubble: () => {},
            pulseCombinationsPageButtonForNewBonus: () => {},
            updateEarnedBonusesUI: () => {},
            updateRateDisplay: () => {},
            playLedgerBeamBonus: vi.fn(),
            getComboDiscoveryMilestoneCooldownMs: () => 50,
            computeComboUiInputDigest: () => "d",
            isCombinationsPageOpen: () => false,
            getActiveCombos: () => [combo],
            getLastComboUiInputDigest: () => lastDigest,
            setLastComboUiInputDigest: v => {
                lastDigest = v;
            },
            getPreviousTickActiveComboNames: () => prevTick,
            setPreviousTickActiveComboNames: s => {
                prevTick = s;
            },
            getComboActivationCounts: () => ({}),
            applyAscensionComboTimeWarpDelayReduction: () => {},
            getTurboBoostUnlocked: () => false,
            addTurboBoostMeter: () => {},
            getTurboComboPoints: () => 0,
            refreshCombinationsPanelIfOpen: () => {}
        });

        tryProcessOneComboDiscoveryMilestone(10_000);
        expect(earnedComboNames).toEqual(["Pair of 1s"]);
        expect(pendingQueue).toEqual([]);
        expect(readyMs).toBe(10_050);
    });
});
