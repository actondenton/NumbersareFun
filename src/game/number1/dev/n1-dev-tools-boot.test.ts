import { describe, expect, it } from "vitest";

import { buildN1DevToolsWireDep } from "./n1-dev-tools-boot.js";

describe("buildN1DevToolsWireDep", () => {
    it("wraps gameplay callbacks under n1Gameplay", () => {
        let essence = 0;
        const dep = buildN1DevToolsWireDep({
            devToolsLoadTimeMs: 0,
            els: { devToolsToggle: null },
            displayTotalPlaySeconds: () => 1000,
            getBlackHolePhase: () => 0,
            freeze: { get: () => false, set: () => {} },
            getDevHandsRuntime: () => ({}),
            getAscensionMapNodes: () => [],
            ascending: {},
            setTotalChanges: () => {},
            refreshAfterBhDevJumpAndSelectUpdated: () => {},
            maybeApplyMidPhaseHandFloor: () => {},
            ensureSpeedRows: () => {},
            shrinkSpeedRowsTo: () => {},
            syncAllAutobuyTogglesFromState: () => {},
            setAutoBuyEnabledForHand: () => {},
            autoBuyDelayStandardSeconds: () => 30,
            autoBuyDelayOverrideSeconds: { get: () => null, set: () => {} },
            setAutoBuyUnlockedDev: () => {},
            unlockedHandsGetter: () => 1,
            autoBuyEnabledByHandMutable: [],
            autoBuyCountdownSecondsByHandMutable: [],
            cheapenAutobuyFlag: { get: () => false, set: () => {} },
            slowdownAutobuyFlag: { get: () => false, set: () => {} },
            turboComboMeterGainDisabledFlag: { get: () => false, set: () => {} },
            cheapenAutoBuyCountdownByHand: [],
            slowdownAutoBuyCountdownByHand: [],
            getCheapenLevel: () => [0],
            getMaxCheapenLevel: () => 10,
            getCheapenUpgradeCost: () => 1,
            getHandEarning: () => 0,
            getSlowdownLevel: () => [0],
            getMaxSlowdownLevelCap: () => 4,
            getSlowdownUpgradeCost: () => 1,
            isSlowdownUnlocked: () => false,
            updateSpeedUpgradeUI: () => {},
            onDeleteSaveClick: () => {},
            bumpHand0EarningsDev: () => {},
            addAscensionEssenceDev: (val: number) => { essence += val; },
            addToLog: () => {},
            autosaveNow: () => {}
        });
        dep.n1Gameplay.addAscensionEssenceDev(5);
        expect(essence).toBe(5);
        expect(dep.els.devToolsToggle).toBeNull();
    });
});
