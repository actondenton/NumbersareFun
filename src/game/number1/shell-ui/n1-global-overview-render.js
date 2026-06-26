/**
 * @typedef {object} GlobalOverviewNumber1GainPreview
 * @property {number} finalGain
 * @property {number} blackHoleMultiplierBonus
 * @property {number} multiplierBonus
 * @property {string} arcEssenceMultiplierBonusTitle
 */

/**
 * @typedef {object} GlobalOverviewNumber1Ascension
 * @property {number} ascensionEssence
 * @property {number} ascensionRequiredTotal
 * @property {number} ascensionRequiredHands
 * @property {boolean} hasAscended
 * @property {GlobalOverviewNumber1GainPreview | null} gainPreview
 */

/**
 * @typedef {object} GlobalOverviewNumber2Ascension
 * @property {boolean} started
 * @property {number} luckAscensionEssence
 * @property {number} ascensionGateTotal
 */

/**
 * @typedef {object} GlobalOverviewCard
 * @property {number} number
 * @property {string} label
 * @property {{ text: string, pct: number }} milestone
 * @property {boolean} ascensionReady
 * @property {number} ratePerSec
 * @property {string} details
 * @property {GlobalOverviewNumber1Ascension | null} number1Ascension
 * @property {GlobalOverviewNumber2Ascension | null} number2Ascension
 */

/**
 * Build the Global Overview panel HTML from pre-resolved card rows (no DOM).
 *
 * @param {object} deps
 * @param {(n: number) => string} deps.formatCount
 * @param {() => GlobalOverviewCard[]} deps.getOverviewCards
 */
export function renderNumber1GlobalOverviewHtml(deps) {
    const { formatCount, getOverviewCards } = deps;
    const rows = getOverviewCards().map(card => {
        const {
            number,
            label,
            milestone,
            ascensionReady,
            ratePerSec,
            details,
            number1Ascension,
            number2Ascension
        } = card;
        const gainPreviewInfo = number === 1 && ascensionReady && number1Ascension ? number1Ascension.gainPreview : null;
        const gainPreview = gainPreviewInfo ? gainPreviewInfo.finalGain : 0;
        let ascPart = "Ascension: " + (ascensionReady ? "<span class=\"overview-asc-ready\">Ready</span>" : "Not ready");
        if (number === 1 && number1Ascension) {
            ascPart += " · Essence: " + formatCount(number1Ascension.ascensionEssence);
        }
        if (number === 1 && number1Ascension && !ascensionReady) {
            ascPart += " · Requirement: " + formatCount(number1Ascension.ascensionRequiredTotal) + " total and " +
                number1Ascension.ascensionRequiredHands + " hands";
        }
        if (number === 1 && number1Ascension && ascensionReady) {
            ascPart += " · Next gain: " + formatCount(gainPreview);
            if (gainPreviewInfo && gainPreviewInfo.blackHoleMultiplierBonus > 0) {
                ascPart += " (" + gainPreviewInfo.arcEssenceMultiplierBonusTitle + " +" +
                    formatCount(gainPreviewInfo.blackHoleMultiplierBonus) + ")";
            }
            if (gainPreviewInfo && gainPreviewInfo.multiplierBonus > 0) {
                ascPart += " (clap mult +" + formatCount(gainPreviewInfo.multiplierBonus) + ")";
            }
            ascPart += " <button type=\"button\" class=\"ascend-number-btn\" data-number=\"1\">Ascend Number 1</button>";
        }
        if (number === 1 && number1Ascension && number1Ascension.hasAscended) {
            ascPart += " <button type=\"button\" class=\"page-btn overview-open-ascension-btn\" data-open-ascension>Skill tree</button>";
        }
        if (number === 2 && number2Ascension) {
            if (!number2Ascension.started) {
                ascPart = "Ascension: inactive — switch to Number 2 in the sidebar to begin.";
            }
            ascPart += " · Luck essence: " + formatCount(number2Ascension.luckAscensionEssence);
            if (number2Ascension.started) {
                if (ascensionReady) {
                    ascPart += " <button type=\"button\" class=\"page-btn overview-open-ascension-n2-btn\" data-open-ascension-n2>Luck table</button>";
                } else {
                    ascPart += " · Gate: Number 2 total ≥ " + formatCount(number2Ascension.ascensionGateTotal) + ".";
                }
            }
        }
        const isLive = number === 1;
        const badgeLabel = isLive ? "Main stage · live" : "Background · summarized";
        const badgeMod = isLive ? "overview-card-badge--live" : "overview-card-badge--bg";
        const pct = Math.max(0, Math.min(100, milestone.pct));
        const rateStr = formatCount(Math.round(ratePerSec * 100) / 100) + "/s";
        return (
            "<article class=\"overview-card overview-card--n" + number + "\" data-overview-number=\"" + number + "\">" +
            "<header class=\"overview-card-header\">" +
            "<span class=\"overview-card-poster-glyph\" aria-hidden=\"true\">" + number + "</span>" +
            "<div class=\"overview-card-heading\">" +
            "<h3 class=\"overview-card-title\">" + label + "</h3>" +
            "<span class=\"overview-card-badge " + badgeMod + "\">" + badgeLabel + "</span>" +
            "</div></header>" +
            "<div class=\"overview-card-body\">" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Progress rate</span>" +
            "<span class=\"overview-stat-value\">" + rateStr + "</span></div>" +
            "<div class=\"overview-stat overview-stat--milestone\">" +
            "<span class=\"overview-stat-label\">Next milestone</span>" +
            "<span class=\"overview-stat-value overview-stat-milestone-text\">" + milestone.text + " · " + pct.toFixed(1) + "%</span>" +
            "<div class=\"overview-mini-progress\" role=\"progressbar\" aria-valuenow=\"" + pct.toFixed(1) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\">" +
            "<div class=\"overview-mini-fill\" style=\"width:" + pct + "%\"></div></div></div>" +
            "<div class=\"overview-stat\">" +
            "<span class=\"overview-stat-label\">Module details</span>" +
            "<span class=\"overview-stat-value\">" + details + "</span></div>" +
            (number === 2 ? "<p class=\"overview-coming-soon-note\">Switch to <strong>Number 2</strong> in the sidebar for Double or Nothing.</p>" :
                (number !== 1 ? "<p class=\"overview-coming-soon-note\">Full playable stage for this number — <span class=\"coming-soon-inline\">coming soon</span>.</p>" : "")) +
            "<div class=\"overview-ascension-cell\">" + ascPart + "</div></div></article>"
        );
    });
    return rows.join("") ||
        "<div class=\"overview-empty\">No unlocked numbers on this save. Additional number modules — <span class=\"coming-soon-inline\">coming soon</span>.</div>";
}
