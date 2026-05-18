import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as core from "./modules/number1/core.js";
import {
    applyNumber1SnapToRuntime,
    buildNumber1NormalizeSnapshotOptions,
    buildNumber1SavePayload,
    createN1SaveOffline
} from "./n1-save-offline.js";

describe("createN1SaveOffline", () => {
    beforeEach(() => {
        vi.spyOn(core, "writeSaveData").mockImplementation(() => {});
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("autosave skips when suppressed", () => {
        let suppress = true;
        const p = createN1SaveOffline({
            buildSavePayload: () => ({ stub: true }),
            getNormalizeSnapshotOptions: () => ({ maxHands: 10 }),
            applySnapToRuntime: () => {},
            applyOfflineAdvance: () => {},
            getLocalStorage: () => ({}) as unknown as Storage,
            getSuppressAutosave: () => suppress
        });
        p.autosaveNow();
        expect(core.writeSaveData).not.toHaveBeenCalled();
        suppress = false;
        p.autosaveNow();
        expect(core.writeSaveData).toHaveBeenCalledTimes(1);
    });

    it("buildNumber1SavePayload forwards read object fields", () => {
        const payload = buildNumber1SavePayload({
            handEarnings: () => [1, 2],
            unlockedHands: () => 2,
            speedLevel: () => [0, 0],
            speedBonusLevel: () => [0, 0],
            cheapenLevel: () => [0, 0],
            cheapenBonusLevel: () => [0, 0],
            slowdownLevel: () => [0, 0],
            slowdownBonusLevel: () => [0, 0],
            slowdownUnlockLogged: () => false,
            slowdownCompactionUnlockedLatched: () => false,
            timeWarpAuraActiveByHand: () => [false, false],
            timeWarpAuraAppearedAtMsByHand: () => [0, 0],
            timeWarpNextSpawnInSec: () => 0,
            timeWarpUnlockLogged: () => false,
            autoBuyUnlocked: () => false,
            autoBuyEnabledByHand: () => [],
            autoBuyCountdownSecondsByHand: () => [],
            turboBoostMeter: () => 0,
            turboBoostUnlocked: () => false,
            turboBoostEnabled: () => false,
            turboActivationCount: () => 0,
            turboScensionBurnLevel: () => 0,
            turboScensionTankLevel: () => 0,
            turboScensionMultLevel: () => 0,
            turboScensionFillLevel: () => 0,
            turboLevelerBank: () => 0,
            turboLevelerPurchases: () => 0,
            earnedComboNames: () => [],
            comboActivationCounts: () => ({}),
            comboDiscoveryMilestonePendingQueue: () => [],
            comboDiscoveryMilestoneReadyAtMs: () => 0,
            comboDiscoveryMilestoneCooldownSpanMs: () => 0,
            adaptiveLastProgressAtMs: () => 0,
            adaptiveLastHintAtMs: () => 0,
            previousTickActiveComboNames: () => [],
            objectivesAchieved: () => [],
            longTermObjectivesAchieved: () => [],
            shownBannerIds: () => [],
            closedBanners: () => [],
            settings: () => ({ theme: "light" }),
            numberModules: () => ({
                1: { getSaveData: () => ({ a: 1 }) },
                2: { getSaveData: () => ({ b: 2 }) }
            }),
            number1RunPeakTotalCount: () => 1,
            number1AscensionEssence: () => 0,
            number1AscensionPendingBonusEssence: () => 0,
            number1AscensionClapEssenceMultiplier: () => 1,
            number1AscensionClapEssenceProcCount: () => 0,
            number1HasAscended: () => false,
            number1AscensionNodeIds: () => [],
            number1AscensionBlackHoleLevel: () => 0,
            number1BlackHoleState: () => ({ phase: 0 }),
            unlockedHandsCap: () => 10,
            ascensionNumber1IntroSeen: () => false,
            ascensionTreeVersion: () => "t",
            clapCooldownUntilMsByHand: () => [0, 0],
            totalPlayTimeMs: () => 0
        });
        expect(payload.handEarnings).toEqual([1, 2]);
        expect(payload.unlockedHands).toBe(2);
        expect(payload.numberModulesState).toEqual({ 1: { a: 1 }, 2: { b: 2 } });
    });

    it("buildNumber1NormalizeSnapshotOptions passes fixed ascension / BH keys", () => {
        const env = buildNumber1NormalizeSnapshotOptions(
            {
                maxHands: () => 10,
                settings: () => ({ x: 1 }),
                ascensionNumber1IntroSeen: () => false,
                number1AscensionEssence: () => 5,
                autoBuyEnabledByHand: () => [true],
                autoBuyCountdownSecondsByHand: () => [3]
            },
            {
                ascensionTreeVersionExpected: "v1",
                comboActivationEdgeVersion: "e1",
                blackHoleMaxLevel: 9,
                blackHoleEvaporationCap: 1,
                comboDiscoveryCooldownBaseMs: 60000,
                comboDiscoveryCooldownMinMs: 100
            }
        );
        expect(env.maxHands).toBe(10);
        expect(env.ascensionTreeVersionExpected).toBe("v1");
        expect(env.currentEssenceForMerge).toBe(5);
        expect(env.nowMs).toBe(Date.now);
    });

    it("applyNumber1SnapToRuntime updates loop and hand earnings from snap", () => {
        let playMs = 0;
        let reset = 0;
        const handEarnings = [0, 0];
        const twActive = [false];
        const twAppear = [0];
        const hands: unknown[] = [];
        const d = {
            loopRt: {
                setTotalPlayTimeMs(n: number) {
                    playMs = n;
                },
                resetSavePlayWallClock() {
                    reset++;
                }
            },
            maxHands: 2,
            setHandEarnings: (v: number[]) => {
                handEarnings[0] = v[0];
                handEarnings[1] = v[1];
            },
            getHandEarnings: () => handEarnings,
            setSpeedLevel: () => {},
            setSpeedBonusLevel: () => {},
            setClapDigitPrevious: () => {},
            setClapCooldownUntilMsByHand: () => {},
            setCheapenLevel: () => {},
            setCheapenBonusLevel: () => {},
            setSlowdownLevel: () => {},
            setSlowdownBonusLevel: () => {},
            setSlowdownUnlockLogged: () => {},
            setSlowdownCompactionUnlockedLatched: () => {},
            setTimeWarpAuraActiveByHand: (v: boolean[]) => {
                twActive[0] = v[0];
            },
            getTimeWarpAuraActiveByHand: () => twActive,
            setTimeWarpAuraAppearedAtMsByHand: (v: number[]) => {
                twAppear[0] = v[0];
            },
            getTimeWarpAuraAppearedAtMsByHand: () => twAppear,
            setTimeWarpNextSpawnInSec: () => {},
            setTimeWarpUnlockLogged: () => {},
            setUnlockedHandsCap: () => {},
            setUnlockedHands: () => {},
            ensureSpeedRows: () => {},
            getHands: () => hands,
            getSpeedRowRef: () => ({ handMountEl: null }),
            HandCounter: function MockH() {},
            HAND_BASE_SPEED: 1,
            setAutoBuyUnlocked: () => {},
            copyArrayIntoExisting: () => {},
            autoBuyEnabledByHand: [],
            autoBuyCountdownSecondsByHand: [],
            setTurboBoostMeter: () => {},
            getTurboBoostMeter: () => 0,
            setTurboBoostUnlocked: () => {},
            setTurboBoostEnabled: () => {},
            getTurboBoostEnabled: () => false,
            setTurboActivationCount: () => {},
            setTurboScensionBurnLevel: () => {},
            setTurboScensionTankLevel: () => {},
            setTurboScensionMultLevel: () => {},
            setTurboScensionFillLevel: () => {},
            setTurboLevelerBank: () => {},
            setTurboLevelerPurchases: () => {},
            tryTurboLevelerPurchases: () => {},
            logTickerRt: { setAdaptiveTipTimestampsFromSave: () => {} },
            earnedComboNames: [],
            setComboActivationCounts: () => {},
            setComboDiscoveryMilestonePendingQueue: () => {},
            setComboDiscoveryMilestoneReadyAtMs: () => {},
            setComboDiscoveryMilestoneCooldownSpanMs: () => {},
            setPreviousTickActiveComboNames: () => {},
            objectiveLists: { objectives: [], longTermObjectives: [] },
            shownBannerIds: new Set(),
            closedBanners: [],
            getSettings: () => ({}),
            setSettings: () => {},
            NUMBER_MODULES: {},
            setNumber1AscensionEssence: () => {},
            setNumber1AscensionPendingBonusEssence: () => {},
            setNumber1AscensionClapEssenceMultiplier: () => {},
            setNumber1AscensionClapEssenceProcCount: () => {},
            setNumber1HasAscended: () => {},
            reconcileNumber2LockState: () => {},
            updateNumber2SidebarUnlockUI: () => {},
            clearAscensionNodeIds: () => {},
            pushAscensionNodeId: () => {},
            normalizeAscensionNodeIds: () => {},
            setAscensionNumber1IntroSeen: () => {},
            setNumber1AscensionBlackHoleLevel: () => {},
            setNumber1BlackHoleState: () => {},
            isNumber1AscensionTreeFullyPurchased: () => false,
            getBlackHolePhase: () => 0,
            promoteBlackHoleToPhase1IfNeeded: () => {},
            getTurboBoostUnlocked: () => false,
            getTurboMeterMax: () => 1,
            setNumber1RunPeakTotalCount: () => {},
            refreshTotalFromHandEarnings: () => {},
            syncBlackHolePhase1Vfx: () => {},
            updateN1GravityCpsStrip: () => {},
            checkStoryBanners: () => {}
        };
        applyNumber1SnapToRuntime(d, {
            totalPlayTimeMs: 42,
            handEarnings: [9, 8],
            speedBonusLevel: [0, 0],
            clapCooldownUntilMsByHand: [0, 0],
            cheapenBonusLevel: [0, 0],
            slowdownBonusLevel: [0, 0],
            slowdownUnlockLogged: false,
            slowdownCompactionUnlockedLatched: false,
            timeWarpNextSpawnInSec: 0,
            timeWarpUnlockLogged: false,
            unlockedHandsCap: 2,
            unlockedHands: 1,
            autoBuyUnlocked: false,
            turboBoostMeter: 0,
            turboBoostUnlocked: false,
            turboBoostEnabled: false,
            turboActivationCount: 0,
            turboScensionBurnLevel: 0,
            turboScensionTankLevel: 0,
            turboScensionMultLevel: 0,
            turboScensionFillLevel: 0,
            turboLevelerBank: 0,
            turboLevelerPurchases: 0,
            numberModulesState: undefined,
            mergedNumber1AscensionEssence: 0,
            number1AscensionPendingBonusEssence: 0,
            number1AscensionClapEssenceMultiplier: 1,
            number1AscensionClapEssenceProcCount: 0,
            number1HasAscended: false,
            number1AscensionBlackHoleLevel: 0,
            number1BlackHoleState: {},
            number1RunPeakTotalCount: 1
        });
        expect(playMs).toBe(42);
        expect(reset).toBe(1);
        expect(handEarnings[0]).toBe(9);
    });
});
