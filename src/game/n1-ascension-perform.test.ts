import { describe, expect, it } from "vitest";
import { createNumber1AscensionPerform } from "./n1-ascension-perform.js";

describe("createNumber1AscensionPerform", () => {
    it("runs ascend hooks in deterministic order when ready", () => {
        const order: string[] = [];
        let essence = 100;
        const gainInfo = {
            baseGain: 3,
            pendingBonus: 0,
            blackHoleMultiplierBonus: 0,
            multiplierBonus: 0,
            finalGain: 7
        };
        const deps = {
            isNumber1AscensionReady: () => true,
            clearActionLogBacklogOnAscension: () => order.push("clear"),
            getAscensionGainBreakdown: () => ({ ...gainInfo }),
            applyAscensionEssenceGrantAndResetWarpClapBonuses: (gain: number) => {
                essence += gain;
                order.push("economy");
            },
            shrinkHandsUiToSingleHandKeepingFirst: () => order.push("hands"),
            bootstrapLanesArraysAutobuyTimeWarpCheapenFlagsForAscension: () => order.push("lanes"),
            resetTurboAfterAscension: () => order.push("turbo"),
            resetCombosDiscoveryAndObjectivesAfterAscension: () => order.push("combos"),
            rebindPrimaryHandIntoFirstMountAndRender: () => order.push("h0"),
            recalculateTotalsHideUpgradeStripeIfBare: () => order.push("totals"),
            refreshAllStaleUiAfterAscension: () => order.push("ui"),
            getNumber1AscensionEssence: () => essence,
            getArcEssenceMultiplierBonusPhraseTitle: () => "BH phrase",
            addToLog: () => order.push("log"),
            markMeaningfulProgress: () => order.push("mark"),
            autosaveNow: () => order.push("save")
        };

        const { performNumber1Ascension } = createNumber1AscensionPerform(deps);
        performNumber1Ascension();

        expect(order).toEqual([
            "clear",
            "economy",
            "hands",
            "lanes",
            "turbo",
            "combos",
            "h0",
            "totals",
            "ui",
            "log",
            "mark",
            "save"
        ]);
        expect(essence).toBe(107);
    });

    it("no-op when not ready", () => {
        const deps = {
            isNumber1AscensionReady: () => false,
            clearActionLogBacklogOnAscension: () => {},
            getAscensionGainBreakdown: () => ({
                baseGain: 0,
                pendingBonus: 0,
                blackHoleMultiplierBonus: 0,
                multiplierBonus: 0,
                finalGain: 0
            }),
            applyAscensionEssenceGrantAndResetWarpClapBonuses: () => {
                throw new Error("should not run");
            },
            shrinkHandsUiToSingleHandKeepingFirst: () => {},
            bootstrapLanesArraysAutobuyTimeWarpCheapenFlagsForAscension: () => {},
            resetTurboAfterAscension: () => {},
            resetCombosDiscoveryAndObjectivesAfterAscension: () => {},
            rebindPrimaryHandIntoFirstMountAndRender: () => {},
            recalculateTotalsHideUpgradeStripeIfBare: () => {},
            refreshAllStaleUiAfterAscension: () => {},
            getNumber1AscensionEssence: () => 0,
            getArcEssenceMultiplierBonusPhraseTitle: () => "",
            addToLog: () => {},
            markMeaningfulProgress: () => {},
            autosaveNow: () => {}
        };

        const { performNumber1Ascension } = createNumber1AscensionPerform(deps);
        expect(() => performNumber1Ascension()).not.toThrow();
    });
});
