import { describe, expect, it, vi } from "vitest";

import { wireNumber1SaveLoad } from "./n1-save-wire.js";
import { createNumber1Runtime } from "./state/n1-runtime.js";

describe("wireNumber1SaveLoad", () => {
    it("registers load tail and returns save helpers", () => {
        const storage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn()
        };
        let loadTail: (snap: object) => void = () => {};
        const n1Boot = {
            registerLiveGameLoad(fn: (snap: object) => void) {
                loadTail = fn;
            },
            applyLoadedSave: vi.fn(() => true)
        };
        const runtime = createNumber1Runtime({ maxHands: 5 });
        const session = runtime.session;
        const wire = wireNumber1SaveLoad(n1Boot, {
            runtime,
            session,
            storage,
            saveExtra: () => ({ extra: 1 }),
            hydrateCtx: {
                maxHands: 5,
                ascensionTreeVersionExpected: 1,
                comboActivationEdgeVersion: 1,
                blackHoleMaxLevel: 10,
                blackHoleEvaporationCap: 100,
                comboDiscoveryCooldownBaseMs: 1000,
                comboDiscoveryCooldownMinMs: 100,
                session,
                ascension: runtime.ascension,
                autobuy: runtime.autobuy
            },
            loadTailCtx: { runtime, maxHands: 5 },
            offline: {
                tickBackgroundNumberModules: vi.fn(),
                updateBlackHolePhaseStep: vi.fn(),
                getBlackHolePhase: () => 1,
                getRawCpsPerHand: () => [1],
                applyDetachedCpsProgress: () => 100,
                run: runtime.run,
                blackHole: runtime.blackHole,
                formatCount: n => String(n),
                syncBlackHolePhase1Vfx: vi.fn(),
                offlineSummaryBodyEl: null,
                offlineSummaryPanelEl: null
            }
        });

        expect(typeof wire.getSaveState).toBe("function");
        expect(typeof wire.autosaveNow).toBe("function");
        wire.autosaveNow();
        expect(storage.setItem).toHaveBeenCalled();
        expect(typeof loadTail).toBe("function");
    });
});
