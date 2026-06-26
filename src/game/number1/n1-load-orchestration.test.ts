import { describe, expect, it, vi } from "vitest";
import { createN1HandsStore } from "./state/n1-hands-store.js";
import { createNumber1Runtime } from "./state/n1-runtime.js";
import { applyLiveGameLoadTail, restoreHandsFromSaveSnapshot } from "./n1-load-orchestration.js";

describe("restoreHandsFromSaveSnapshot", () => {
    it("restores lane arrays and creates hand counters for unlocked hands", () => {
        const handsRt = createN1HandsStore({ maxHands: 3 });
        const run = { unlockedHands: 2 };
        const speedRowRefs = [{ handMountEl: null }, { handMountEl: null }];
        const created: number[] = [];

        restoreHandsFromSaveSnapshot(
            {
                speedLevel: [2, 1, 0],
                speedBonusLevel: [0, 1, 0],
                clapCooldownUntilMsByHand: [0, 100, 0]
            },
            {
                handsRt,
                run,
                maxHands: 3,
                getSpeedRowRefs: () => speedRowRefs,
                ensureSpeedRows: () => {},
                createHandCounter: handNum => {
                    created.push(handNum);
                    return { id: handNum };
                }
            }
        );

        expect(handsRt.speedLevel).toEqual([2, 1, 0]);
        expect(handsRt.speedBonusLevel).toEqual([0, 1, 0]);
        expect(handsRt.clapDigitPrevious).toEqual([-1, -1, -1]);
        expect(handsRt.clapCooldownUntilMsByHand).toEqual([0, 100, 0]);
        expect(handsRt.hands).toHaveLength(2);
        expect(created).toEqual([1, 2]);
    });
});

describe("applyLiveGameLoadTail", () => {
    it("runs hand restore, play time, and UI refresh hooks", () => {
        const rt = createNumber1Runtime({ maxHands: 3 });
        rt.run.unlockedHands = 1;
        const handsRestore = vi.fn();
        const setTotalPlayTimeMs = vi.fn();
        const refreshTotal = vi.fn();
        const checkStoryBanners = vi.fn();

        applyLiveGameLoadTail(
            {
                totalPlayTimeMs: 12000,
                timeWarpAuraActiveByHand: [false, false, false],
                timeWarpAuraAppearedAtMsByHand: [0, 0, 0],
                timeWarpNextSpawnInSec: 0,
                timeWarpUnlockLogged: false,
                ascensionNodesLoadedFromSave: false,
                number1AscensionNodeIds: [],
                adaptiveLastProgressAtMs: 0,
                adaptiveLastHintAtMs: 0
            },
            {
                runtime: rt,
                maxHands: 3,
                handsBoot: { restoreFromSaveSnapshot: handsRestore },
                loopRuntime: { setTotalPlayTimeMs, resetSavePlayWallClock: vi.fn() },
                logTickerRt: { setAdaptiveTipTimestampsFromSave: vi.fn() },
                numberModules: {},
                tryTurboLevelerPurchases: vi.fn(),
                reconcileNumber2LockState: vi.fn(),
                updateNumber2SidebarUnlockUI: vi.fn(),
                normalizeAscensionNodeIds: vi.fn(),
                ascensionAutobuyDefaultOnForNewHands: () => false,
                syncAllAutobuyTogglesFromState: vi.fn(),
                isNumber1AscensionTreeFullyPurchased: () => false,
                getBlackHolePhase: () => 0,
                getTurboMeterMax: () => 100,
                refreshTotalFromHandEarnings: refreshTotal,
                syncBlackHolePhase1Vfx: vi.fn(),
                updateN1GravityCpsStrip: vi.fn(),
                checkStoryBanners
            }
        );

        expect(setTotalPlayTimeMs).toHaveBeenCalledWith(12000);
        expect(handsRestore).toHaveBeenCalled();
        expect(refreshTotal).toHaveBeenCalled();
        expect(checkStoryBanners).toHaveBeenCalled();
    });
});
