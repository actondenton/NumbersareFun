import { describe, expect, it, vi } from "vitest";

import { wireNumber1UpgradeBoots } from "./n1-upgrades-wire.js";

describe("wireNumber1UpgradeBoots", () => {
    it("returns buy/update hooks from all three upgrade boots", () => {
        const shared = {
            getBlackHolePhase: () => 0,
            getUnlockedHands: () => 1,
            getHandEarnings: () => 0,
            markMeaningfulProgress: vi.fn(),
            markAutobuyDeferredTotalsPending: vi.fn(),
            refreshTotalFromHandEarnings: vi.fn(),
            getIncrementalCountEl: () => null,
            formatCount: n => String(n),
            getTotalChanges: () => 1,
            addToLog: vi.fn(),
            setHandEarningBalance: vi.fn(),
            getSpeedRowRefs: () => [],
            sprayConfettiFrom: vi.fn(),
            setUpgradeTooltipText: vi.fn(),
            setUpgradeButtonProgress: vi.fn(),
            formatUpgradeAffordEtaLine: () => "",
            flashSpeedAutobuyToast: vi.fn(),
            setBatchedUpgradeUiFlush: vi.fn(),
            updateSpeedUpgradeUI: vi.fn(),
            updateRateDisplay: vi.fn(),
            getAutoBuyDelaySeconds: () => 30,
            getAutoBuyUnlocked: () => false,
            getAutoBuyEnabledByHand: () => false
        };

        const wire = wireNumber1UpgradeBoots({
            slowdown: {
                ...shared,
                getSlowdownLevel: () => [0],
                getSlowdownBonusLevel: () => [0],
                getSlowdownAutoBuyCountdownByHand: () => [0],
                setSlowdownAutoBuyCountdown: vi.fn(),
                getMaxSlowdownLevelCap: () => 10,
                getSlowdownUpgradeCost: () => 1,
                isSlowdownUnlocked: () => false,
                devSlowdownAutobuyOn: () => false,
                ascensionAutobuyIncludesSlowdown: () => false,
                setSlowdownBaseLevel: vi.fn(),
                resetSpeedLevelForCompaction: vi.fn(),
                getHands: () => [],
                updateHandUpgradeScrollHint: vi.fn(),
                onSlowdownUnlockedFirstUi: vi.fn()
            },
            cheapen: {
                ...shared,
                getCheapenLevel: () => [0],
                getCheapenBonusLevel: () => [0],
                getCheapenSectionUnlocked: () => false,
                setCheapenSectionUnlocked: vi.fn(),
                getCheapenAutoBuyCountdownByHand: () => [0],
                setCheapenAutoBuyCountdown: vi.fn(),
                getMaxCheapenLevel: () => 10,
                getCheapenUpgradeCost: () => 1,
                devCheapenAutobuyOn: () => false,
                ascensionAutobuyIncludesCheapen: () => false,
                getCheapenEffectText: () => "",
                setCheapenBaseLevel: vi.fn(),
                ensureSpeedRows: vi.fn(),
                updateHandUpgradeScrollHint: vi.fn()
            },
            speed: {
                ...shared,
                getSpeedLevel: () => [0],
                getUpgradeCost: () => 1,
                incrementSpeedLevel: vi.fn(),
                getHands: () => [],
                restartAllHandTimers: vi.fn(),
                setSpeedAutobuyCountdown: vi.fn(),
                getAutoBuyCountdownSecondsByHand: () => 0
            }
        });

        expect(typeof wire.buySpeedUpgradeForHand).toBe("function");
        expect(typeof wire.updateCheapenUpgradeUI).toBe("function");
        expect(typeof wire.updateSlowdownUpgradeUI).toBe("function");
    });
});
