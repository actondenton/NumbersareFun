import { describe, expect, it } from "vitest";

import { createNumber1SpeedUpgradeBoot } from "./n1-speed-upgrade-boot.js";

describe("createNumber1SpeedUpgradeBoot", () => {
    it("maybeAutoBuySpeedUpgrade purchases when countdown elapses", () => {
        const speedLevel = [0];
        const handEarnings = [999];
        const countdown = [0];
        const buys: number[] = [];
        const boot = createNumber1SpeedUpgradeBoot({
            getBlackHolePhase: () => 0,
            getUnlockedHands: () => 1,
            getSpeedLevel: () => speedLevel,
            getUpgradeCost: () => 10,
            getHandEarnings: i => handEarnings[i] || 0,
            setHandEarningBalance: (i, b) => { handEarnings[i] = b; },
            markMeaningfulProgress: () => {},
            markAutobuyDeferredTotalsPending: () => {},
            refreshTotalFromHandEarnings: () => {},
            incrementSpeedLevel: i => { speedLevel[i]++; },
            getHands: () =>
                [{ restartTimer: () => {} }] as unknown as { restartTimer: () => void }[],
            addToLog: () => {},
            getIncrementalCountEl: () => ({ textContent: "" }) as unknown as HTMLElement,
            formatCount: (n: number) => String(n),
            getTotalChanges: () => 0,
            restartAllHandTimers: () => {},
            getAutoBuyUnlocked: () => true,
            setSpeedAutobuyCountdown: (i, v) => { countdown[i] = v; },
            getAutoBuyEnabledByHand: () => true,
            getAutoBuyCountdownSecondsByHand: i => countdown[i] || 0,
            getAutoBuyDelaySeconds: () => 1,
            getSpeedRowRefs: () => [] as never[],
            sprayConfettiFrom: () => {},
            setBatchedUpgradeUiFlush: () => {},
            updateSpeedUpgradeUI: () => {},
            updateCheapenUpgradeUI: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateRateDisplay: () => {},
            flashSpeedAutobuyToast: (i: number) => buys.push(i)
        });
        countdown[0] = 0.02;
        boot.maybeAutoBuySpeedUpgrade();
        expect(speedLevel[0]).toBe(1);
        expect(buys).toEqual([0]);
    });
});
