import { NUMBER2_ASCENSION_READY_TOTAL } from "../../number2/number2-rules.js";
import { ASCENSION_1_REQUIRED_TOTAL } from "../ascension/n1-ascension.js";
import { renderNumber1GlobalOverviewHtml } from "./n1-global-overview-render.js";

/**
 * Builds overview card payloads + renders global overview HTML (Phase 21c).
 *
 * @param {object} dep
 */
export function createGlobalOverviewBoot(dep) {
    function buildGlobalOverviewCardsForHtml() {
        return dep.getUnlockedNumberModules().map(entry => {
            const m = entry.module;
            const milestone = m.getMilestone();
            const ascensionReady = m.isAscensionReady();
            const gainPreviewInfo = entry.number === 1 && ascensionReady
                ? dep.computeNumber1AscensionGainBreakdown(dep.getNumber1AscensionEssenceFormulaTotal())
                : null;
            let gainPreview = null;
            if (gainPreviewInfo) {
                gainPreview = {
                    finalGain: gainPreviewInfo.finalGain,
                    blackHoleMultiplierBonus: gainPreviewInfo.blackHoleMultiplierBonus,
                    multiplierBonus: gainPreviewInfo.multiplierBonus,
                    arcEssenceMultiplierBonusTitle: dep.getArcEssenceMultiplierBonusPhraseTitle()
                };
            }
            return {
                number: entry.number,
                label: m.getLabel(),
                milestone,
                ascensionReady,
                ratePerSec: m.getRatePerSec(),
                details: m.getOverviewDetails(),
                number1Ascension: entry.number === 1 ? {
                    ascensionEssence: dep.getNumber1AscensionEssence(),
                    ascensionRequiredTotal: ASCENSION_1_REQUIRED_TOTAL,
                    ascensionRequiredHands: dep.getNumber1AscensionRequiredHands(),
                    hasAscended: dep.getNumber1HasAscended(),
                    gainPreview
                } : null,
                number2Ascension: entry.number === 2 ? {
                    started: dep.getNumber2Started(),
                    luckAscensionEssence: dep.getNumber2AscensionEssence(),
                    ascensionGateTotal: NUMBER2_ASCENSION_READY_TOTAL
                } : null
            };
        });
    }

    function renderGlobalOverview() {
        return renderNumber1GlobalOverviewHtml({
            formatCount: dep.formatCount,
            getOverviewCards: buildGlobalOverviewCardsForHtml
        });
    }

    return { renderGlobalOverview, buildGlobalOverviewCardsForHtml };
}
