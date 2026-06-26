import { DEV_CHEAPEN_AUTOBUY_DELAY, DEV_SLOWDOWN_AUTOBUY_DELAY } from "../upgrades/n1-upgrades.js";

/** Dev-tools panel DOM refs (browser only). */
export function collectN1DevToolsDomRefs() {
    return {
        devToolsToggle: document.getElementById("dev-tools-toggle"),
        devToolsPanel: document.getElementById("dev-tools-panel"),
        devSecondsElapsed: document.getElementById("dev-seconds-elapsed"),
        devSaveTotalSecondsEl: document.getElementById("dev-save-total-seconds"),
        devAddCountInput: document.getElementById("dev-add-count-input"),
        devAddCountBtn: document.getElementById("dev-add-count-btn"),
        devAddAscensionEssenceInput: document.getElementById("dev-add-ascension-essence-input"),
        devAddAscensionEssenceBtn: document.getElementById("dev-add-ascension-essence-btn"),
        devAllAutobuyCheckbox: document.getElementById("dev-all-autobuy"),
        devAutobuyDelay01Checkbox: document.getElementById("dev-autobuy-delay-01"),
        devAutobuyCheapenCheckbox: document.getElementById("dev-autobuy-cheapen"),
        devAutobuySlowdownCheckbox: document.getElementById("dev-autobuy-slowdown"),
        blackHolePhaseSelect: document.getElementById("dev-black-hole-phase-select"),
        devBlackHolePhaseApplyBtn: document.getElementById("dev-black-hole-phase-apply"),
        devPauseGameCheckbox: document.getElementById("dev-pause-game"),
        devTurboComboMeterOffCheckbox: document.getElementById("dev-turbo-combo-meter-off"),
        devN1StageBgStaticCheckbox: document.getElementById("dev-n1-stage-bg-static"),
        devDeleteSaveBtn: document.getElementById("dev-delete-save")
    };
}

/**
 * Builds the dep object for {@link wireNumber1DevTools}.
 *
 * @param {object} dep
 */
export function buildN1DevToolsWireDep(dep) {
    return {
        devToolsLoadTimeMs: dep.devToolsLoadTimeMs,
        els: dep.els || collectN1DevToolsDomRefs(),
        n1Gameplay: {
            displayTotalPlaySeconds: dep.displayTotalPlaySeconds,
            getBlackHolePhase: dep.getBlackHolePhase,
            freeze: dep.freeze,
            getDevHandsRuntime: dep.getDevHandsRuntime,
            getAscensionMapNodes: dep.getAscensionMapNodes,
            ascending: dep.ascending,
            setTotalChanges: dep.setTotalChanges,
            refreshAfterBhDevJumpAndSelectUpdated: dep.refreshAfterBhDevJumpAndSelectUpdated,
            maybeApplyMidPhaseHandFloor: dep.maybeApplyMidPhaseHandFloor,
            ensureSpeedRows: dep.ensureSpeedRows,
            shrinkSpeedRowsTo: dep.shrinkSpeedRowsTo,
            syncAllAutobuyTogglesFromState: dep.syncAllAutobuyTogglesFromState,
            setAutoBuyEnabledForHand: dep.setAutoBuyEnabledForHand,
            autoBuyDelayStandardSeconds: dep.autoBuyDelayStandardSeconds,
            autoBuyDelayOverrideSeconds: dep.autoBuyDelayOverrideSeconds,
            setAutoBuyUnlockedDev: dep.setAutoBuyUnlockedDev,
            unlockedHandsGetter: dep.unlockedHandsGetter,
            autoBuyEnabledByHandMutable: dep.autoBuyEnabledByHandMutable,
            autoBuyCountdownSecondsByHandMutable: dep.autoBuyCountdownSecondsByHandMutable,
            cheapenAutobuyFlag: dep.cheapenAutobuyFlag,
            slowdownAutobuyFlag: dep.slowdownAutobuyFlag,
            turboComboMeterGainDisabledFlag: dep.turboComboMeterGainDisabledFlag,
            flushCheapenAutobuySeedsDev: () => {
                if (!dep.cheapenAutobuyFlag.get()) return;
                const countdown = dep.cheapenAutoBuyCountdownByHand;
                const unlockedHands = dep.unlockedHandsGetter();
                while (countdown.length < unlockedHands) countdown.push(0);
                for (let i = 0; i < unlockedHands; i++) {
                    const level = dep.getCheapenLevel()[i] ?? 0;
                    if (level >= dep.getMaxCheapenLevel()) continue;
                    const cost = dep.getCheapenUpgradeCost(i, level + 1);
                    if (dep.getHandEarning(i) >= cost) countdown[i] = DEV_CHEAPEN_AUTOBUY_DELAY;
                }
            },
            flushSlowdownAutobuySeedsDev: () => {
                if (!dep.slowdownAutobuyFlag.get() || !dep.isSlowdownUnlocked()) return;
                const countdown = dep.slowdownAutoBuyCountdownByHand;
                const unlockedHands = dep.unlockedHandsGetter();
                while (countdown.length < unlockedHands) countdown.push(0);
                for (let i = 0; i < unlockedHands; i++) {
                    const level = dep.getSlowdownLevel()[i] ?? 0;
                    if (level >= dep.getMaxSlowdownLevelCap()) continue;
                    const cost = dep.getSlowdownUpgradeCost(level + 1);
                    if (cost !== null && dep.getHandEarning(i) >= cost) countdown[i] = DEV_SLOWDOWN_AUTOBUY_DELAY;
                }
            },
            updateSpeedUpgradeUI: dep.updateSpeedUpgradeUI,
            onDeleteSaveClick: dep.onDeleteSaveClick,
            bumpHand0EarningsDev: dep.bumpHand0EarningsDev,
            addAscensionEssenceDev: dep.addAscensionEssenceDev,
            addToLog: dep.addToLog,
            autosaveNow: dep.autosaveNow
        }
    };
}
