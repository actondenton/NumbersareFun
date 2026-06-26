import { describe, expect, it, vi } from "vitest";

import { wireNumber1AscensionPerform } from "./n1-ascension-perform-boot.js";

describe("wireNumber1AscensionPerform", () => {
    it("resets upgrade lane arrays in-place on bootstrap", () => {
        const upgrades = {
            cheapenLevel: [9, 8],
            cheapenBonusLevel: [1, 2],
            slowdownLevel: [3, 4],
            slowdownBonusLevel: [5, 6],
            slowdownUnlockLogged: true
        };
        const run = {
            unlockedHands: 4,
            handEarnings: [10, 20, 30, 40],
            slowdownCompactionUnlockedLatched: true,
            number1RunPeakTotalCount: 99,
            totalChanges: 50
        };
        const handsRt = {
            hands: [{ count: 5, tickAccBig: 9n, render: vi.fn() }],
            speedLevel: [1],
            speedBonusLevel: [2],
            clapDigitPrevious: [3],
            clapCooldownUntilMsByHand: [4]
        };
        const perform = wireNumber1AscensionPerform({
            isNumber1AscensionReady: () => true,
            clearActionLogBacklogOnAscension: () => {},
            getAscensionGainBreakdown: () => ({
                baseGain: 1,
                pendingBonus: 0,
                blackHoleMultiplierBonus: 0,
                multiplierBonus: 0,
                finalGain: 1
            }),
            getNumber1AscensionEssence: () => 0,
            getArcEssenceMultiplierBonusPhraseTitle: () => "BH",
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            autosaveNow: () => {},
            getAscension: () => ({
                number1AscensionEssence: 0,
                number1AscensionPendingBonusEssence: 1,
                number1AscensionClapEssenceMultiplier: 2,
                number1AscensionClapEssenceProcCount: 3,
                number1HasAscended: false
            }),
            getBlackHole: () => ({ number1BlackHoleState: { phase6JetBestAscensionEssence: 0 } }),
            updateNumber2SidebarUnlockUI: () => {},
            shrinkSpeedRowsTo: () => {},
            getHandsRt: () => handsRt,
            getRun: () => run,
            getMaxHands: () => 3,
            getAscensionHandUnlockStartingCountFloor: () => 0,
            getUpgrades: () => upgrades,
            getTimewarp: () => ({
                timeWarpAuraActiveByHand: [1],
                timeWarpAuraAppearedAtMsByHand: [2],
                timeWarpNextSpawnInSec: 5,
                timeWarpUnlockLogged: true
            }),
            getAutobuy: () => ({ autoBuyUnlocked: false }),
            ascensionAutobuyDefaultOnForNewHands: () => false,
            getAutoBuyEnabledByHand: () => [],
            getAutoBuyCountdownSecondsByHand: () => [],
            setCheapenSectionUnlocked: vi.fn(),
            getCheapenAutoBuyCountdownByHand: () => [1],
            getSlowdownAutoBuyCountdownByHand: () => [2],
            getTurbo: () => ({
                turboBoostMeter: 1,
                turboBoostUnlocked: true,
                turboBoostEnabled: false,
                turboActivationCount: 1,
                turboActivationEarnAccumulator: 1,
                turboScensionBurnLevel: 1,
                turboScensionTankLevel: 1,
                turboScensionMultLevel: 1,
                turboScensionFillLevel: 1,
                turboLevelerBank: 1,
                turboLevelerPurchases: 1
            }),
            turboBoostEnabledCheckbox: null,
            turboBoostToggleLabelEl: null,
            turboBoostWrapEl: null,
            getCombo: () => ({
                earnedComboNames: ["a"],
                comboActivationCounts: { a: 1 },
                comboDiscoveryMilestonePendingQueue: [1],
                comboDiscoveryMilestoneReadyAtMs: 1,
                comboDiscoveryMilestoneCooldownSpanMs: 1,
                previousTickActiveComboNames: new Set(["a"])
            }),
            getObjectivesRt: () => ({ objectivesAchieved: [true, false] }),
            getComboForward: () => ({
                resetComboIndexFilters: vi.fn(),
                updateComboUI: vi.fn(),
                updateEarnedBonusesUI: vi.fn()
            }),
            getSpeedRowRefs: () => [{ handMountEl: { appendChild: vi.fn() } }],
            refreshTotalFromHandEarnings: () => {},
            upgradeContainer: null,
            incrementalEl: { textContent: "" },
            formatCount: (n: number) => String(n),
            ensureSpeedRows: () => {},
            applyAscensionAutobuyGrantToUnlockedHands: () => {},
            syncAllAutobuyTogglesFromState: () => {},
            updateObjectives: () => {},
            updateMilestoneUI: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateTimeWarpAuraUI: () => {},
            updateRateDisplay: () => {},
            updateTurboBoostUI: () => {},
            updatePageButtonUnlocks: () => {},
            refreshOverviewAndAscensionPanelsIfOpen: () => {}
        });

        perform.performNumber1Ascension();

        expect(run.unlockedHands).toBe(1);
        expect(upgrades.cheapenLevel).toEqual([0, 0, 0]);
        expect(upgrades.slowdownBonusLevel).toEqual([0, 0, 0]);
        expect(handsRt.hands[0].count).toBe(1);
    });
});
