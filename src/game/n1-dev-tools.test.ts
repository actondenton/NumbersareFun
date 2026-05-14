import { describe, expect, it } from "vitest";

import { attachN1DevTools } from "./n1-dev-tools.js";

describe("attachN1DevTools", () => {
    it("runs without throwing when elements are absent", () => {
        attachN1DevTools({
            devToolsLoadTimeMs: Date.now(),
            els: {},
            displayTotalPlaySeconds: () => 0,
            getBlackHolePhase: () => 0,
            freeze: { get: () => false, set: () => {} },
            getDevHandsRuntime: () => ({
                maxHands: 1,
                setUnlockedCapAndHands() {},
                setHandEarning() {},
                getHandEarning() {
                    return 0;
                },
                clearHandSideForDev() {},
                hands: [],
                speedRowRefs: []
            }),
            getAscensionMapNodes: () => [],
            ascending: {
                setHasAscended() {},
                setAscensionNodeIds() {},
                clampEssenceForDevUnlock() {},
                getBlackHoleMutableState() {
                    return {};
                }
            },
            setTotalChanges() {},
            refreshAfterBhDevJumpAndSelectUpdated() {},
            maybeApplyMidPhaseHandFloor() {},
            ensureSpeedRows() {},
            shrinkSpeedRowsTo() {},
            autoBuyDelayStandardSeconds: () => 30,
            autoBuyDelayOverrideSeconds: {
                get: () => null,
                set: () => {}
            },
            setAutoBuyUnlockedDev() {},
            unlockedHandsGetter: () => 0,
            autoBuyEnabledByHandMutable: [],
            autoBuyCountdownSecondsByHandMutable: [],
            cheapenAutobuyFlag: {
                get: () => false,
                set: () => {}
            },
            slowdownAutobuyFlag: {
                get: () => false,
                set: () => {}
            },
            flushCheapenAutobuySeedsDev() {},
            flushSlowdownAutobuySeedsDev() {},
            updateSpeedUpgradeUI() {},
            onDeleteSaveClick() {},
            bumpHand0EarningsDev() {},
            addAscensionEssenceDev() {},
            addToLog() {},
            autosaveNow() {}
        });
        expect(true).toBe(true);
    });

    it("accepts legacy-boot n1Gameplay façade (normalizes to flat deps)", () => {
        attachN1DevTools({
            devToolsLoadTimeMs: Date.now(),
            els: {},
            n1Gameplay: {
                displayTotalPlaySeconds: () => 0,
                getBlackHolePhase: () => 0,
                freeze: { get: () => false, set: () => {} },
                getDevHandsRuntime: () => ({
                    maxHands: 1,
                    setUnlockedCapAndHands() {},
                    setHandEarning() {},
                    getHandEarning() {
                        return 0;
                    },
                    clearHandSideForDev() {},
                    hands: [],
                    speedRowRefs: []
                }),
                getAscensionMapNodes: () => [],
                ascending: {
                    setHasAscended() {},
                    setAscensionNodeIds() {},
                    clampEssenceForDevUnlock() {},
                    getBlackHoleMutableState() {
                        return {};
                    }
                },
                setTotalChanges() {},
                refreshAfterBhDevJumpAndSelectUpdated() {},
                maybeApplyMidPhaseHandFloor() {},
                ensureSpeedRows() {},
                shrinkSpeedRowsTo() {},
                autoBuyDelayStandardSeconds: () => 30,
                autoBuyDelayOverrideSeconds: {
                    get: () => null,
                    set: () => {}
                },
                setAutoBuyUnlockedDev() {},
                unlockedHandsGetter: () => 0,
                autoBuyEnabledByHandMutable: [],
                autoBuyCountdownSecondsByHandMutable: [],
                cheapenAutobuyFlag: {
                    get: () => false,
                    set: () => {}
                },
                slowdownAutobuyFlag: {
                    get: () => false,
                    set: () => {}
                },
                flushCheapenAutobuySeedsDev() {},
                flushSlowdownAutobuySeedsDev() {},
                updateSpeedUpgradeUI() {},
                onDeleteSaveClick() {},
                bumpHand0EarningsDev() {},
                addAscensionEssenceDev() {},
                addToLog() {},
                autosaveNow() {}
            }
        });
        expect(true).toBe(true);
    });
});
