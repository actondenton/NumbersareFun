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

    it("enables every hand autobuyer when dev all-autobuy is checked", () => {
        const autoEn = [false, false, true];
        const checkbox = {
            checked: false,
            addEventListener(type, fn) {
                if (type === "change") this._onChange = fn;
                if (type === "click") this._onClick = fn;
            }
        };
        attachN1DevTools({
            devToolsLoadTimeMs: Date.now(),
            els: { devAllAutobuyCheckbox: checkbox },
            displayTotalPlaySeconds: () => 0,
            getBlackHolePhase: () => 0,
            freeze: { get: () => false, set: () => {} },
            getDevHandsRuntime: () => ({
                maxHands: 3,
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
            syncAllAutobuyTogglesFromState() {},
            setAutoBuyEnabledForHand(i, enabled) {
                autoEn[i] = enabled;
            },
            autoBuyDelayStandardSeconds: () => 30,
            autoBuyDelayOverrideSeconds: { get: () => null, set: () => {} },
            setAutoBuyUnlockedDev() {},
            unlockedHandsGetter: () => 3,
            autoBuyEnabledByHandMutable: autoEn,
            autoBuyCountdownSecondsByHandMutable: [],
            cheapenAutobuyFlag: { get: () => false, set: () => {} },
            slowdownAutobuyFlag: { get: () => false, set: () => {} },
            flushCheapenAutobuySeedsDev() {},
            flushSlowdownAutobuySeedsDev() {},
            updateSpeedUpgradeUI() {},
            onDeleteSaveClick() {},
            bumpHand0EarningsDev() {},
            addAscensionEssenceDev() {},
            addToLog() {},
            autosaveNow() {}
        });
        checkbox.checked = true;
        checkbox._onChange();
        expect(autoEn).toEqual([true, true, true]);
    });

    it("re-enables all hand autobuyers when dev all-autobuy is clicked while already checked", async () => {
        const autoEn = [false, true, false];
        const checkbox = {
            checked: true,
            addEventListener(type, fn) {
                if (type === "change") this._onChange = fn;
                if (type === "click") this._onClick = fn;
            }
        };
        attachN1DevTools({
            devToolsLoadTimeMs: Date.now(),
            els: { devAllAutobuyCheckbox: checkbox },
            displayTotalPlaySeconds: () => 0,
            getBlackHolePhase: () => 0,
            freeze: { get: () => false, set: () => {} },
            getDevHandsRuntime: () => ({
                maxHands: 3,
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
            syncAllAutobuyTogglesFromState() {},
            setAutoBuyEnabledForHand(i, enabled) {
                autoEn[i] = enabled;
            },
            autoBuyDelayStandardSeconds: () => 30,
            autoBuyDelayOverrideSeconds: { get: () => null, set: () => {} },
            setAutoBuyUnlockedDev() {},
            unlockedHandsGetter: () => 3,
            autoBuyEnabledByHandMutable: autoEn,
            autoBuyCountdownSecondsByHandMutable: [],
            cheapenAutobuyFlag: { get: () => false, set: () => {} },
            slowdownAutobuyFlag: { get: () => false, set: () => {} },
            flushCheapenAutobuySeedsDev() {},
            flushSlowdownAutobuySeedsDev() {},
            updateSpeedUpgradeUI() {},
            onDeleteSaveClick() {},
            bumpHand0EarningsDev() {},
            addAscensionEssenceDev() {},
            addToLog() {},
            autosaveNow() {}
        });
        checkbox._onClick();
        await Promise.resolve();
        expect(autoEn).toEqual([true, true, true]);
    });
});
