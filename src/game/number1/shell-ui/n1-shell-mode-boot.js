/**
 * @param {{
 *   isNumber2Unlocked: () => boolean,
 *   number2: { updateStageUI: () => void },
 *   syncBlackHolePhase1Vfx: () => void,
 *   updateN1GravityCpsStrip: () => void,
 *   refreshNumber1CountDisplay?: () => void
 * }} dep
 */
export function createSyncPlayStageForNumberMode(dep) {
    return function syncPlayStageForNumberMode(mode) {
        const n1 = document.getElementById("number1-stage-root");
        const n2 = document.getElementById("number2-stage");
        if (!n1 || !n2) return;
        if (mode === 2 && dep.isNumber2Unlocked()) {
            n1.style.display = "none";
            n2.style.display = "flex";
            n2.setAttribute("aria-hidden", "false");
            dep.number2.updateStageUI();
        } else {
            n1.style.display = "";
            n2.style.display = "none";
            n2.setAttribute("aria-hidden", "true");
            dep.syncBlackHolePhase1Vfx();
            dep.updateN1GravityCpsStrip();
            if (typeof dep.refreshNumber1CountDisplay === "function") dep.refreshNumber1CountDisplay();
        }
    };
}

/**
 * Global shell hooks for number-mode tab switches (Phase 21c).
 *
 * @param {{
 *   closeInlineMainStagePanels: () => void,
 *   syncPlayStageForNumberMode: (mode: number) => void,
 *   number2: { handleModeSwitched: (mode: number) => void },
 *   scheduleFitTopCountRow: () => void,
 *   updateRateDisplay: () => void
 * }} dep
 */
export function wireNumber1ShellModeSwitch(dep) {
    window.onBeforeNumberModeSwitch = function() {
        dep.closeInlineMainStagePanels();
    };
    window.onNumberModeSwitched = function(mode) {
        dep.syncPlayStageForNumberMode(mode);
        dep.number2.handleModeSwitched(mode);
        if (mode === 1) {
            dep.scheduleFitTopCountRow();
            dep.updateRateDisplay();
        }
    };
}
