/**
 * Builders for `createNumber1BlackHoleBoot` controller/UI deps (keeps legacy-boot thin).
 *
 * @param {object} deps
 */
export function buildBlackHoleControllerDeps(deps, bhUiBridge) {
    return {
        getBlackHoleState: deps.getBlackHoleState,
        isArcUnlocked: deps.isBlackHoleArcUnlocked,
        hasAscended: deps.getNumber1HasAscended,
        addToLog: deps.addToLog,
        formatCount: deps.formatCount,
        queueBlackHoleUiRefresh: () => bhUiBridge.queueBlackHoleUiRefresh?.(),
        autosaveNow: deps.autosaveNow,
        getTurboBoostMeter: deps.getTurboBoostMeter,
        setTurboBoostMeter: deps.setTurboBoostMeter,
        getTurboMeterMax: deps.getTurboMeterMax,
        getTurboBoostUnlocked: deps.getTurboBoostUnlocked,
        getBlackHoleUxFlags: deps.getBlackHoleUxFlags,
        getNumber1StageRootEl: deps.getNumber1StageRootEl,
        playBlackHoleScreenEffect: deps.playBlackHoleScreenEffect,
        syncBlackHolePhase1Vfx: () => bhUiBridge.syncBlackHolePhase1Vfx?.(),
        pulseBlackHoleLensingAutoTick: () => bhUiBridge.pulseBlackHoleLensingAutoTick?.(),
        showStoryBanner: (banner, opts) => deps.showStoryBanner(banner, opts),
        getMaxHands: deps.getMaxHands,
        getNumber1AscensionEssence: deps.getNumber1AscensionEssence,
        setNumber1AscensionEssence: deps.setNumber1AscensionEssence,
        getTotalChanges: deps.getTotalChanges,
        enterBlackHolePhase7GameplayReset: deps.enterBlackHolePhase7GameplayReset,
        formatSeconds: deps.formatSeconds,
        phase5StokeMinRemainingMs: deps.phase5StokeMinRemainingMs,
        updateRateDisplay: opts => deps.updateRateDisplay(opts),
        updateN1GravityCpsStrip: () => deps.updateN1GravityCpsStrip(),
        refreshAscensionPanelIfOpen: deps.refreshAscensionPanelIfOpen,
        triggerBlackHolePhase1CollapseVfx: () => bhUiBridge.triggerBlackHolePhase1CollapseVfx?.(),
        showStoryBannerById: id => deps.showStoryBannerById(id),
        pulseBlackHoleLensingManualBurst: () => bhUiBridge.pulseBlackHoleLensingManualBurst?.(),
        getUnlockedHands: deps.getUnlockedHands,
        applyHandSacrifice: deps.applyHandSacrifice
    };
}

/**
 * @param {object} deps
 * @param {{ ctl: object, syncPhase1MassFillCssVars: Function, getMaxSlowdownLevelCap: Function }} bhUi
 */
export function buildBlackHoleUiDeps(deps, bhUi) {
    return {
        controller: bhUi.ctl,
        getBlackHoleState: deps.getBlackHoleState,
        getStageRoot: deps.getNumber1StageRootEl,
        getPlayStage: deps.getPlayStageEl,
        getIncrementalCountLabel: deps.getIncrementalCountLabelEl,
        syncPhase1MassFillCssVars: bhUi.syncPhase1MassFillCssVars,
        refreshGlobalOverviewPanelIfOpen: deps.refreshGlobalOverviewPanelIfOpen,
        getPagePanelEl: deps.getPagePanelEl,
        getPagePanelBodyEl: deps.getPagePanelBodyEl,
        getAscensionPageActiveNumber: deps.getAscensionPageActiveNumber,
        refreshAscensionPanelIfOpen: deps.refreshAscensionPanelIfOpen,
        patchAscensionHubStatsPillsDomIfChanged: deps.patchAscensionHubStatsPillsDomIfChanged,
        renderNumber1BlackHolePanelHtml: deps.renderNumber1BlackHolePanelHtml,
        isBlackHoleArcUnlocked: deps.isBlackHoleArcUnlocked,
        formatCount: deps.formatCount,
        autosaveNow: deps.autosaveNow,
        getAscensionEssence: deps.getNumber1AscensionEssence,
        getMaxSlowdownLevelCap: bhUi.getMaxSlowdownLevelCap
    };
}
