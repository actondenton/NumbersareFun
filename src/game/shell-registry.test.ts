import { describe, expect, it, vi } from "vitest";

import { createNumberModule } from "./core/number-module-interface.js";
import { buildNumberModulesRegistry, getUnlockedNumberModules } from "./shell-registry.js";

describe("shell-registry", () => {
    it("buildNumberModulesRegistry returns N1 and N2 keys", () => {
        const registry = buildNumberModulesRegistry({
            n1: {
                createNumberModule,
                getLabel: () => "Number 1",
                getRatePerSec: () => 1,
                getMilestone: () => ({ text: "x", pct: 0 }),
                isAscensionReady: () => false,
                getSaveData: () => ({}),
                applySaveData: () => {},
                getOverviewDetails: () => ""
            },
            n2: {
                controller: { renderAscensionShell: () => "" },
                state: { started: false, ascensionEssence: 0 },
                moduleOpts: { isUnlocked: () => true, formatCount: n => String(n) }
            }
        });
        expect(registry[1].getLabel()).toBe("Number 1");
        expect(registry[2]).toBeTruthy();
        expect(typeof registry[2].getLabel).toBe("function");
    });

    it("getUnlockedNumberModules filters missing modules", () => {
        const mods = {
            1: { getLabel: () => "1" },
            2: undefined
        };
        const out = getUnlockedNumberModules(new Set([1, 2, 3]), mods);
        expect(out).toEqual([{ number: 1, module: mods[1] }]);
    });
});
