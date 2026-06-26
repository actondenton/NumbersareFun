import { describe, expect, it, vi } from "vitest";

import { createNumber1BlackHoleBoot } from "./n1-black-hole-boot.js";

vi.mock("./n1-black-hole-controller.js", () => ({
    createNumber1BlackHoleController: () => ({
        getBlackHolePhase: () => 1,
        getBlackHolePhase1FillRatio: () => 0.5,
        getBlackHolePhase1SlowdownCapBonus: () => 2,
        completeBlackHolePhaseTransition: vi.fn(),
        tryBuyBlackHolePhase2CollapseUpgrade: vi.fn(),
        updateBlackHolePhaseStep: vi.fn()
    })
}));

vi.mock("./n1-black-hole-ui.js", () => ({
    createNumber1BlackHoleUi: () => ({
        queueBlackHoleUiRefresh: vi.fn(),
        syncBlackHolePhase4LensingRipples: vi.fn()
    })
}));

describe("createNumber1BlackHoleBoot", () => {
    it("wires controller + UI bridge and exposes aligned slowdown cap + phase readout", () => {
        const boot = createNumber1BlackHoleBoot({
            maxSlowdownLevelBase: 100,
            rootDocument: null,
            getBlackHoleControllerDeps() {
                return {
                    getBlackHoleState: () => ({}),
                    isArcUnlocked: () => false,
                    hasAscended: () => false,
                    addToLog: () => {},
                    formatCount: n => String(n),
                    queueBlackHoleUiRefresh: () => {},
                    autosaveNow: () => {},
                    getTurboBoostMeter: () => 0,
                    setTurboBoostMeter: () => {},
                    getTurboMeterMax: () => 1,
                    getTurboBoostUnlocked: () => false,
                    getBlackHoleUxFlags: () => ({}),
                    getNumber1StageRootEl: () => null,
                    playBlackHoleScreenEffect: () => {},
                    syncBlackHolePhase1Vfx: () => {},
                    pulseBlackHoleLensingAutoTick: () => {},
                    showStoryBanner: () => {},
                    getMaxHands: () => 10,
                    getNumber1AscensionEssence: () => 0,
                    setNumber1AscensionEssence: () => {},
                    getTotalChanges: () => 0,
                    enterBlackHolePhase7GameplayReset: () => {},
                    formatSeconds: () => "",
                    phase5StokeMinRemainingMs: 8000,
                    updateRateDisplay: () => {},
                    updateN1GravityCpsStrip: () => {},
                    refreshAscensionPanelIfOpen: () => {},
                    triggerBlackHolePhase1CollapseVfx: () => {},
                    showStoryBannerById: () => {},
                    pulseBlackHoleLensingManualBurst: () => {},
                    getUnlockedHands: () => 1,
                    applyHandSacrifice: () => false
                };
            },
            getBlackHoleUiDeps({ syncPhase1MassFillCssVars, getMaxSlowdownLevelCap }) {
                return {
                    controller: {},
                    getBlackHoleState: () => ({}),
                    getStageRoot: () => null,
                    getPlayStage: () => null,
                    getIncrementalCountLabel: () => null,
                    syncPhase1MassFillCssVars,
                    refreshGlobalOverviewPanelIfOpen: () => {},
                    getPagePanelEl: () => null,
                    getPagePanelBodyEl: () => null,
                    getAscensionPageActiveNumber: () => 1,
                    refreshAscensionPanelIfOpen: () => {},
                    patchAscensionHubStatsPillsDomIfChanged: () => {},
                    renderNumber1BlackHolePanelHtml: () => "",
                    isBlackHoleArcUnlocked: () => false,
                    formatCount: n => String(n),
                    autosaveNow: () => {},
                    getAscensionEssence: () => 0,
                    getMaxSlowdownLevelCap
                };
            }
        });
        expect(boot.getBlackHolePhase()).toBe(1);
        expect(boot.getMaxSlowdownLevelCap()).toBe(102);
        expect(typeof boot.queueBlackHoleUiRefresh).toBe("function");
    });
});
