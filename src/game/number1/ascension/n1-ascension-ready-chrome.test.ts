import { describe, expect, it, vi } from "vitest";

import { createAscensionReadyChrome } from "./n1-ascension-ready-chrome.js";

describe("createAscensionReadyChrome", () => {
    it("hides ascension nav until ready or post-ascend", () => {
        const ascensionPageBtn = {
            style: { display: "" },
            classList: { toggle: vi.fn() },
            textContent: "",
            setAttribute: vi.fn(),
            removeAttribute: vi.fn()
        };
        const chrome = createAscensionReadyChrome({
            isNumber1AscensionReady: () => false,
            computeNumber1AscensionGainBreakdown: () => ({
                finalGain: 0,
                baseGain: 0,
                pendingBonus: 0,
                blackHoleMultiplierBonus: 0,
                blackHolePhaseMult: 1,
                multiplierBonus: 0,
                clapMult: 1
            }),
            getNumber1AscensionEssenceFormulaTotal: () => 1,
            formatCount: (n: number) => String(n),
            getArcEssenceMultiplierBonusPhraseTitle: () => "BH",
            ascensionReadyBannerEssenceSuffixEl: { textContent: "" },
            ascensionReadyBannerEl: { hidden: false, setAttribute: vi.fn() },
            ascensionPageBtn,
            getNumber1HasAscended: () => false
        });
        chrome.updateAscensionReadyChrome();
        expect(ascensionPageBtn.style.display).toBe("none");
    });

    it("shows ready label and gain on ascension nav when ready", () => {
        const ascensionPageBtn = {
            style: { display: "" },
            classList: { toggle: vi.fn() },
            textContent: "",
            setAttribute: vi.fn(),
            removeAttribute: vi.fn()
        };
        const chrome = createAscensionReadyChrome({
            isNumber1AscensionReady: () => true,
            computeNumber1AscensionGainBreakdown: () => ({
                finalGain: 1000,
                baseGain: 900,
                pendingBonus: 0,
                blackHoleMultiplierBonus: 0,
                blackHolePhaseMult: 1,
                multiplierBonus: 0,
                clapMult: 1
            }),
            getNumber1AscensionEssenceFormulaTotal: () => 500,
            formatCount: (n: number) => `§${n}`,
            getArcEssenceMultiplierBonusPhraseTitle: () => "BH",
            ascensionReadyBannerEssenceSuffixEl: { textContent: "" },
            ascensionReadyBannerEl: { hidden: false, setAttribute: vi.fn() },
            ascensionPageBtn,
            getNumber1HasAscended: () => false
        });
        chrome.updateAscensionReadyChrome();
        expect(ascensionPageBtn.style.display).toBe("");
        expect(ascensionPageBtn.textContent).toBe("Ascension: §1000");
        expect(ascensionPageBtn.classList.toggle).toHaveBeenCalledWith("page-btn--ascension-ready", true);
    });
});
