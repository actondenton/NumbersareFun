import { TURBO_UNLOCK_COUNT } from "./n1-turbo.js";

/** Turbo Boost DOM listeners + gated reveal (meter burn/regen stays in legacy / game-loop slice). Rules stay pure in `n1-turbo.js`. */
export function createNumber1TurboBoot(deps) {
    const {
        turboScensionUpgradeBtn,
        turboBoostEnabledCheckbox,
        turboBoostToggleLabelEl,
        setTurboBoostEnabled,
        tryTurboLevelerPurchases,
        updateTurboBoostUI,
        updateRateDisplay,
        tryTurboScensionActivationUpgrade,
        getTotalChanges,
        getTurboBoostUnlocked,
        onTurboSystemFirstUnlock,
        turboBoostWrapEl,
        addToLog,
        formatCount,
        checkStoryBanners
    } = deps;

    function syncTurboBoostToggleDom(enabled) {
        const on = !!enabled;
        if (turboBoostEnabledCheckbox) turboBoostEnabledCheckbox.checked = on;
        if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = on ? "On" : "Off";
    }

    /** Called from update UI + sync pathways so milestone gates surface the Turbo cluster reliably. */
    function tryUnlockTurboIfEligible() {
        if (getTotalChanges() < TURBO_UNLOCK_COUNT) return;
        if (!getTurboBoostUnlocked()) {
            onTurboSystemFirstUnlock();
            syncTurboBoostToggleDom(false);
            addToLog("Turbo system unlocked at " + formatCount(TURBO_UNLOCK_COUNT) + ".", "milestone");
            checkStoryBanners();
        }
        if (turboBoostWrapEl) {
            turboBoostWrapEl.style.display = "";
            turboBoostWrapEl.setAttribute("aria-hidden", "false");
        }
    }

    if (turboScensionUpgradeBtn) {
        turboScensionUpgradeBtn.addEventListener("click", () => { tryTurboScensionActivationUpgrade(); });
    }
    if (turboBoostEnabledCheckbox) {
        turboBoostEnabledCheckbox.addEventListener("change", () => {
            const on = turboBoostEnabledCheckbox.checked;
            setTurboBoostEnabled(on);
            if (turboBoostToggleLabelEl) turboBoostToggleLabelEl.textContent = on ? "On" : "Off";
            if (!on) tryTurboLevelerPurchases();
            updateTurboBoostUI({ force: true });
            updateRateDisplay();
        });
    }

    return { tryUnlockTurboIfEligible, syncTurboBoostToggleDom };
}
