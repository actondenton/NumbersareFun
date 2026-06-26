import { describe, expect, it, vi } from "vitest";
import { consumeAscendNumber1Button, createNumber1AscensionFlowUi } from "./n1-ascension-flow-ui.js";

function ascendBtnStub(
    attrs: { dataNumber?: string; ariaDisabled?: string | null; disabledProp?: boolean } = {}
) {
    const btn = {
        disabled: attrs.disabledProp ?? false,
        getAttribute(key: string) {
            if (key === "data-number") return attrs.dataNumber ?? "";
            if (key === "aria-disabled") return attrs.ariaDisabled ?? null;
            return null;
        }
    };
    return {
        closest(sel: string) {
            if (sel !== ".ascend-number-btn") return null;
            return btn;
        }
    } as unknown as HTMLElement;
}

describe("consumeAscendNumber1Button", () => {
    it("invokes flow only for enabled data-number 1 buttons", () => {
        const target = ascendBtnStub({ dataNumber: "1" });
        const spy = vi.fn();
        expect(consumeAscendNumber1Button(target, spy)).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("ignores other numbers and disabled buttons", () => {
        let target = ascendBtnStub({ dataNumber: "2" });
        const spy = vi.fn();
        expect(consumeAscendNumber1Button(target, spy)).toBe(false);
        expect(spy).not.toHaveBeenCalled();

        target = ascendBtnStub({ dataNumber: "1", ariaDisabled: "true" });
        expect(consumeAscendNumber1Button(target, spy)).toBe(false);
    });

    it("returns false without a usable callback", () => {
        expect(consumeAscendNumber1Button(ascendBtnStub({ dataNumber: "1" }), undefined as unknown as () => void)).toBe(false);
    });
});

describe("createNumber1AscensionFlowUi", () => {
    it("wires overlays without throwing when elements missing", () => {
        const deps = {
            ascensionConfirmOverlayEl: null,
            ascensionConfirmBodyEl: null,
            ascensionIntroOverlayEl: null,
            ascensionIntroContinueBtn: null,
            ascensionConfirmCancelBtn: null,
            ascensionConfirmAscendBtn: null,
            ascensionReadyCtaEl: null,
            getAscensionGainBreakdown: () => ({
                baseGain: 1,
                pendingBonus: 0,
                blackHoleMultiplierBonus: 0,
                multiplierBonus: 0,
                finalGain: 1,
                blackHolePhaseMult: 1,
                blackHoleFurnaceBonus: 0,
                clapMult: 1
            }),
            getTotalChanges: () => 10,
            getNumber1AscensionEssence: () => 0,
            getArcEssenceMultiplierBonusPhraseTitle: () => "",
            isNumber1AscensionReady: () => false,
            setGamePaused: () => {},
            gameplaySimFrozen: () => false,
            hasSeenAscNumber1Intro: () => true,
            markAscNumber1IntroSeen: () => {},
            autosaveNow: () => {},
            performNumber1Ascension: () => {}
        };
        const ui = createNumber1AscensionFlowUi(deps);
        expect(() => ui.attachAscensionFlowDomListeners()).not.toThrow();
        expect(() => ui.beginNumber1AscensionFlow()).not.toThrow();
        expect(() => ui.maybeShowFirstAscensionIntroOnUnlock()).not.toThrow();
        expect(() => ui.showAscensionConfirmDialog()).not.toThrow();
    });
});
