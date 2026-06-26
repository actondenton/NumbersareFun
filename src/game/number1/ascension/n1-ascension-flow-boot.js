import { createNumber1AscensionFlowUi } from "./n1-ascension-flow-ui.js";

/**
 * Ascension intro/confirm overlays + flow listeners (Phase 21c).
 *
 * @param {Omit<Parameters<typeof createNumber1AscensionFlowUi>[0], keyof ReturnType<typeof collectAscensionFlowDomRefs>> & {
 *   ascensionReadyCtaEl: Element | null
 * }} dep
 */
export function wireNumber1AscensionFlow(dep) {
    const els = collectAscensionFlowDomRefs();
    const flow = createNumber1AscensionFlowUi({
        ...els,
        ascensionReadyCtaEl: dep.ascensionReadyCtaEl,
        getAscensionGainBreakdown: dep.getAscensionGainBreakdown,
        getTotalChanges: dep.getTotalChanges,
        getNumber1AscensionEssence: dep.getNumber1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle: dep.getArcEssenceMultiplierBonusPhraseTitle,
        isNumber1AscensionReady: dep.isNumber1AscensionReady,
        setGamePaused: dep.setGamePaused,
        gameplaySimFrozen: dep.gameplaySimFrozen,
        hasSeenAscNumber1Intro: dep.hasSeenAscNumber1Intro,
        markAscNumber1IntroSeen: dep.markAscNumber1IntroSeen,
        autosaveNow: dep.autosaveNow,
        performNumber1Ascension: dep.performNumber1Ascension
    });
    flow.attachAscensionFlowDomListeners();
    return {
        beginNumber1AscensionFlow: flow.beginNumber1AscensionFlow,
        maybeShowFirstAscensionIntroOnUnlock: flow.maybeShowFirstAscensionIntroOnUnlock,
        ascensionConfirmOverlayEl: els.ascensionConfirmOverlayEl
    };
}

function collectAscensionFlowDomRefs() {
    return {
        ascensionConfirmOverlayEl: document.getElementById("ascension-confirm-overlay"),
        ascensionConfirmBodyEl: document.getElementById("ascension-confirm-body"),
        ascensionIntroOverlayEl: document.getElementById("ascension-intro-overlay"),
        ascensionIntroContinueBtn: document.getElementById("ascension-intro-continue"),
        ascensionConfirmCancelBtn: document.getElementById("ascension-confirm-cancel"),
        ascensionConfirmAscendBtn: document.getElementById("ascension-confirm-ascend")
    };
}
