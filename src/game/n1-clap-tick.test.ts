import { describe, expect, it } from "vitest";
import { createNumber1ClapTick } from "./n1-clap-tick.js";

describe("createNumber1ClapTick", () => {
    it("returns safely when clap is locked (fewer than 8 hands)", () => {
        const deps = {
            getUnlockedHands: () => 1,
            getHands: () => [],
            computeAscensionGrantTotals: () => ({}),
            cheapenBonusLevel: [],
            slowdownBonusLevel: [],
            speedLevel: [],
            speedBonusLevel: [],
            clapCooldownUntilMsByHand: [],
            clapDigitPrevious: [],
            gameplaySimFrozen: () => false,
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateRateDisplay: () => {},
            updateMilestoneUI: () => {},
            refreshOverviewAndAscensionHubLiveIfOpen: () => {},
            snapshotHandLedgerBonusDisplays: () => ({}),
            ledgerBeamAfterClapBonuses: () => {},
            settings: {},
            isPagePanelOpen: () => false,
            pagePanelEl: null,
            getNumber1AscensionClapEssenceMultiplier: () => 1,
            applyClapEssenceMultiplierProc: () => {}
        };
        const { processClappingThisTick } = createNumber1ClapTick(deps);
        expect(() => processClappingThisTick()).not.toThrow();
    });
});
