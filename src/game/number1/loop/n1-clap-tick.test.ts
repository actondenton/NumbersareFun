import { afterEach, describe, expect, it, vi } from "vitest";

import { createNumber1ClapTick } from "./n1-clap-tick.js";

function makeHands(counts: number[]) {
    return counts.map(count => ({ count, tickAccBig: 0n }));
}

function makeClapDeps(overrides: Record<string, unknown> = {}) {
    const unlocked = 8;
    const speedBonusLevel = Array(unlocked).fill(0);
    const speedLevel = Array(unlocked).fill(1);
    const clapDigitPrevious = Array(unlocked).fill(-1);
    const clapCooldownUntilMsByHand = Array(unlocked).fill(0);
    const cheapenBonusLevel = Array(unlocked).fill(0);
    const slowdownBonusLevel = Array(unlocked).fill(0);
    const logs: string[] = [];
    const handsRt = {
        speedLevel,
        speedBonusLevel,
        clapDigitPrevious,
        clapCooldownUntilMsByHand
    };
    const deps = {
        getUnlockedHands: () => unlocked,
        getHands: () => makeHands([5, 5, 1, 1, 1, 1, 1, 1]),
        computeAscensionGrantTotals: () => ({}),
        getCheapenBonusLevel: () => cheapenBonusLevel,
        getSlowdownBonusLevel: () => slowdownBonusLevel,
        getSpeedLevel: () => handsRt.speedLevel,
        getSpeedBonusLevel: () => handsRt.speedBonusLevel,
        getClapCooldownUntilMsByHand: () => handsRt.clapCooldownUntilMsByHand,
        getClapDigitPrevious: () => handsRt.clapDigitPrevious,
        gameplaySimFrozen: () => false,
        addToLog: (msg: string) => logs.push(msg),
        markMeaningfulProgress: () => {},
        updateSpeedUpgradeUI: () => {},
        updateCheapenUpgradeUI: () => {},
        updateSlowdownUpgradeUI: () => {},
        updateRateDisplay: () => {},
        updateMilestoneUI: () => {},
        refreshOverviewAndAscensionHubLiveIfOpen: () => {},
        snapshotHandLedgerBonusDisplays: () => ({}),
        ledgerBeamAfterClapBonuses: () => {},
        settings: { showClapAnimation: false },
        isPagePanelOpen: () => false,
        pagePanelEl: null,
        getNumber1AscensionClapEssenceMultiplier: () => 1,
        applyClapEssenceMultiplierProc: () => {},
        ...overrides
    };
    return { deps, handsRt, speedBonusLevel, speedLevel, clapDigitPrevious, clapCooldownUntilMsByHand, logs };
}

describe("createNumber1ClapTick speed bonus", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("grants speedBonusLevel (not purchased speedLevel) when clap bonus roll succeeds", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.05); // < base 10% clap bonus chance
        const { deps, speedBonusLevel, speedLevel, logs } = makeClapDeps();
        const { processClappingThisTick } = createNumber1ClapTick(deps);

        processClappingThisTick();

        expect(speedBonusLevel[0]).toBe(1);
        expect(speedBonusLevel[1]).toBe(1);
        expect(speedLevel[0]).toBe(1);
        expect(speedLevel[1]).toBe(1);
        expect(logs.some(l => l.includes("bonus speed"))).toBe(true);
    });

    it("does not grant speed bonus when both rolls miss (clap still happens)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.99); // miss 10% speed roll
        const { deps, speedBonusLevel, logs } = makeClapDeps();
        const { processClappingThisTick } = createNumber1ClapTick(deps);

        processClappingThisTick();

        expect(speedBonusLevel[0]).toBe(0);
        expect(speedBonusLevel[1]).toBe(0);
        expect(logs.some(l => l.includes("no bonus this time"))).toBe(true);
    });

    it("does not re-clap while both hands remain on digit 5 (rising-edge only)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.05);
        const { deps, speedBonusLevel, clapCooldownUntilMsByHand } = makeClapDeps();
        const { processClappingThisTick } = createNumber1ClapTick(deps);

        processClappingThisTick();
        expect(speedBonusLevel[0]).toBe(1);
        // Clear cooldown so the only gate left is heldFromLastFrame
        clapCooldownUntilMsByHand[0] = 0;
        clapCooldownUntilMsByHand[1] = 0;

        processClappingThisTick();
        expect(speedBonusLevel[0]).toBe(1);
        expect(speedBonusLevel[1]).toBe(1);
    });

    it("does nothing before 8 hands are unlocked", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.05);
        const { deps, speedBonusLevel } = makeClapDeps({ getUnlockedHands: () => 7 });
        const { processClappingThisTick } = createNumber1ClapTick(deps);

        processClappingThisTick();
        expect(speedBonusLevel.every(v => v === 0)).toBe(true);
    });

    it("mutates replaced handsRt arrays after save-style array swap (getters, not boot-time refs)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.05);
        const { deps, handsRt, speedBonusLevel: staleBonus } = makeClapDeps();
        const { processClappingThisTick } = createNumber1ClapTick(deps);

        // Simulate load/ascension replacing handsRt arrays while clap tick is already wired.
        const liveBonus = Array(8).fill(0);
        handsRt.speedBonusLevel = liveBonus;
        handsRt.speedLevel = Array(8).fill(1);
        handsRt.clapDigitPrevious = Array(8).fill(-1);
        handsRt.clapCooldownUntilMsByHand = Array(8).fill(0);

        processClappingThisTick();

        expect(liveBonus[0]).toBe(1);
        expect(liveBonus[1]).toBe(1);
        expect(staleBonus[0]).toBe(0);
        expect(staleBonus[1]).toBe(0);
    });
});
