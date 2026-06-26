import { describe, expect, it } from "vitest";

import { createNumberModule } from "../core/number-module-interface.js";
import { buildNumberModulesRegistry } from "../shell-registry.js";
import { createNumber1ShellRegistryDeps } from "./n1-shell-registry-deps.js";

describe("createNumber1ShellRegistryDeps", () => {
    it("builds a registry with N1 rate and milestone accessors", () => {
        const registry = buildNumberModulesRegistry(createNumber1ShellRegistryDeps({
            createNumberModule,
            getRawCpsPerHand: () => [2, 3],
            getComboMultiplier: () => 2,
            getTurboCountMultiplier: () => 1,
            getNumber1BlackHoleProductionMult: () => 1,
            longTermObjectives: [{ text: "Reach 1e6", achieved: false }],
            run: { totalChanges: 100 },
            formatCount: n => String(n),
            getObjectiveProgressForTotal: () => ({ pct: 50 }),
            isNumber1AscensionReady: () => false,
            ascension: { number1AscensionEssence: 7, ascensionNumber1IntroSeen: false },
            getBlackHolePhase: () => 0,
            formatBlackHoleMultForUi: n => String(n),
            blackHole: { number1BlackHoleState: { phase2Mass: 0 } },
            number2: { renderAscensionShell: () => "" },
            number2State: { started: false, ascensionEssence: 0 },
            isNumber2Unlocked: () => true
        }));

        expect(registry[1].getLabel()).toBe("Number 1");
        expect(registry[1].getRatePerSec()).toBe(10);
        expect(registry[1].getMilestone()).toEqual({ text: "Reach 1e6", pct: 50 });
        expect(registry[2]).toBeTruthy();
    });
});
