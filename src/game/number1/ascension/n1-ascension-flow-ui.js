import { formatCount } from "../shell-ui/n1-format.js";

export function consumeAscendNumber1Button(eventTarget, beginNumber1AscensionFlow) {
    const btn =
        eventTarget && typeof eventTarget.closest === "function"
            ? eventTarget.closest(".ascend-number-btn")
            : null;
    if (!btn || typeof beginNumber1AscensionFlow !== "function") return false;
    if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return false;
    const n = parseInt(btn.getAttribute("data-number"), 10);
    if (n !== 1) return false;
    beginNumber1AscensionFlow();
    return true;
}

export function createNumber1AscensionFlowUi(deps) {
    const {
        ascensionConfirmOverlayEl,
        ascensionConfirmBodyEl,
        ascensionIntroOverlayEl,
        ascensionIntroContinueBtn,
        ascensionConfirmCancelBtn,
        ascensionConfirmAscendBtn,
        ascensionReadyCtaEl,
        getAscensionGainBreakdown,
        getTotalChanges,
        getNumber1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle,
        isNumber1AscensionReady,
        setGamePaused,
        gameplaySimFrozen,
        hasSeenAscNumber1Intro,
        markAscNumber1IntroSeen,
        autosaveNow,
        performNumber1Ascension
    } = deps;

    function showAscensionConfirmDialog() {
        if (!ascensionConfirmOverlayEl || !ascensionConfirmBodyEl) return;
        const gainInfo = getAscensionGainBreakdown();
        const baseGain = gainInfo.baseGain;
        const bonusGain = gainInfo.pendingBonus;
        const blackHoleBonusGain = gainInfo.blackHoleMultiplierBonus;
        const multBonusGain = gainInfo.multiplierBonus;
        const gain = gainInfo.finalGain;
        const nextTotal = getNumber1AscensionEssence() + gain;
        const gainBits = ["base " + formatCount(baseGain)];
        if (bonusGain > 0) gainBits.push("warp bonus " + formatCount(bonusGain));
        if (blackHoleBonusGain > 0) {
            gainBits.push(
                getArcEssenceMultiplierBonusPhraseTitle() +
                    " +" +
                    formatCount(blackHoleBonusGain) +
                    " (" +
                    gainInfo.blackHolePhaseMult.toFixed(3) +
                    "x)"
            );
        }
        if (gainInfo.blackHoleFurnaceBonus > 0) {
            gainBits.push("furnace +" + gainInfo.blackHoleFurnaceBonus.toFixed(2) + "x");
        }
        if (multBonusGain > 0) {
            gainBits.push(
                "clap mult +" + formatCount(multBonusGain) + " (" + gainInfo.clapMult.toFixed(3) + "x)"
            );
        }
        const bonusLine = gainBits.length > 1 ? " (" + gainBits.join(" + ") + ")" : "";
        ascensionConfirmBodyEl.textContent =
            "Your total count is " +
            formatCount(getTotalChanges()) +
            ". Ascending now grants " +
            formatCount(gain) +
            " Ascension Essence" +
            bonusLine +
            " (you will have " +
            formatCount(nextTotal) +
            " total).\n\nThis resets Number 1 only: one hand, no upgrades, no combo bonuses, objectives unchecked, turbo reset.\n\nSpend Essence on permanent skill branches in Ascension. Respec is always free.";
        ascensionConfirmOverlayEl.style.display = "flex";
    }

    function beginNumber1AscensionFlow() {
        if (!isNumber1AscensionReady()) return;
        setGamePaused(true);
        showAscensionConfirmDialog();
    }

    function maybeShowFirstAscensionIntroOnUnlock() {
        if (hasSeenAscNumber1Intro()) return;
        if (!isNumber1AscensionReady()) return;
        if (!ascensionIntroOverlayEl) return;
        if (gameplaySimFrozen()) return;
        markAscNumber1IntroSeen();
        setGamePaused(true);
        ascensionIntroOverlayEl.style.display = "flex";
        autosaveNow();
    }

    function attachAscensionFlowDomListeners() {
        if (ascensionReadyCtaEl) {
            ascensionReadyCtaEl.addEventListener("click", () => beginNumber1AscensionFlow());
        }
        if (ascensionIntroContinueBtn && ascensionIntroOverlayEl) {
            ascensionIntroContinueBtn.addEventListener("click", () => {
                ascensionIntroOverlayEl.style.display = "none";
                setGamePaused(false);
            });
        }
        if (ascensionConfirmCancelBtn && ascensionConfirmOverlayEl) {
            ascensionConfirmCancelBtn.addEventListener("click", () => {
                ascensionConfirmOverlayEl.style.display = "none";
                setGamePaused(false);
            });
        }
        if (ascensionConfirmAscendBtn && ascensionConfirmOverlayEl) {
            ascensionConfirmAscendBtn.addEventListener("click", () => {
                ascensionConfirmOverlayEl.style.display = "none";
                performNumber1Ascension();
                setGamePaused(false);
            });
        }
    }

    return {
        showAscensionConfirmDialog,
        beginNumber1AscensionFlow,
        maybeShowFirstAscensionIntroOnUnlock,
        attachAscensionFlowDomListeners
    };
}
