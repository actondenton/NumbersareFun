import { formatCount } from "./n1-format.js";

export function createNumber1AscensionPerform(deps) {
    function performNumber1Ascension() {
        if (!deps.isNumber1AscensionReady()) return;
        deps.clearActionLogBacklogOnAscension();
        const gainInfo = deps.getAscensionGainBreakdown();
        const baseGain = gainInfo.baseGain;
        const bonusGain = gainInfo.pendingBonus;
        const blackHoleBonusGain = gainInfo.blackHoleMultiplierBonus;
        const multBonusGain = gainInfo.multiplierBonus;
        const gain = gainInfo.finalGain;

        deps.applyAscensionEssenceGrantAndResetWarpClapBonuses(gain);
        deps.shrinkHandsUiToSingleHandKeepingFirst();
        deps.bootstrapLanesArraysAutobuyTimeWarpCheapenFlagsForAscension();
        deps.resetTurboAfterAscension();
        deps.resetCombosDiscoveryAndObjectivesAfterAscension();
        deps.rebindPrimaryHandIntoFirstMountAndRender();
        deps.recalculateTotalsHideUpgradeStripeIfBare();
        deps.refreshAllStaleUiAfterAscension();

        const gainParts =
            bonusGain > 0
                ? formatCount(baseGain) + " base + " + formatCount(bonusGain) + " bonus"
                : formatCount(baseGain) + " base";
        const bhPart =
            blackHoleBonusGain > 0
                ? " + " + formatCount(blackHoleBonusGain) + " " + deps.getArcEssenceMultiplierBonusPhraseTitle()
                : "";
        const multPart = multBonusGain > 0 ? " + " + formatCount(multBonusGain) + " clap multiplier" : "";
        deps.addToLog(
            "Ascended Number 1 — +" +
                formatCount(gain) +
                " Ascension Essence (" +
                gainParts +
                bhPart +
                multPart +
                "; total " +
                formatCount(deps.getNumber1AscensionEssence()) +
                ")",
            "milestone"
        );
        deps.markMeaningfulProgress();
        deps.autosaveNow();
    }
    return { performNumber1Ascension };
}
