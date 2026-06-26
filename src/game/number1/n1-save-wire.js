import { writeSaveData } from "../n1-save.js";
import { applyLiveGameLoadTail } from "./n1-load-orchestration.js";
import { createNumber1HydrateEnv, createNumber1SaveState } from "./n1-persist.js";

/**
 * Save envelope, autosave, hydrate env, load tail registration (Phase 21c).
 *
 * @param {ReturnType<typeof import("./n1-boot.js").createN1Boot>} n1Boot
 * @param {{
 *   runtime: ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>,
 *   session: { suppressAutosave: boolean, settings: { offlineCapHours: number } },
 *   storage?: Storage,
 *   saveExtra: () => Record<string, unknown>,
 *   hydrateCtx: Parameters<typeof createNumber1HydrateEnv>[0],
 *   loadTailCtx: Parameters<typeof applyLiveGameLoadTail>[1],
 *   offline: {
 *     tickBackgroundNumberModules: (dtSec: number) => void,
 *     updateBlackHolePhaseStep: (dtSec: number) => void,
 *     getBlackHolePhase: () => number,
 *     getRawCpsPerHand: () => number[],
 *     applyDetachedCpsProgress: (offlineSec: number) => number,
 *     run: { totalChanges: number, handEarnings: number[], number1RunPeakTotalCount: number },
 *     blackHole: { number1BlackHoleState: { phase7EpilogueCounter?: number } },
 *     formatCount: (n: number) => string,
 *     syncBlackHolePhase1Vfx: () => void,
 *     offlineSummaryBodyEl: Element | null,
 *     offlineSummaryPanelEl: Element | null
 *   }
 * }} dep
 */
export function wireNumber1SaveLoad(n1Boot, dep) {
    const storage = dep.storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

    function buildNumber1HydrateEnv() {
        return createNumber1HydrateEnv(dep.hydrateCtx);
    }

    function getSaveState(savedAt) {
        return createNumber1SaveState(savedAt, dep.runtime, dep.saveExtra());
    }

    function autosaveNow() {
        if (dep.session.suppressAutosave || !storage) return;
        writeSaveData(storage, getSaveState(Date.now()));
    }

    n1Boot.registerLiveGameLoad(snap => applyLiveGameLoadTail(snap, dep.loadTailCtx));

    function applyLoadedState(data) {
        return n1Boot.applyLoadedSave(data, buildNumber1HydrateEnv());
    }

    function applyOfflineProgress(offlineMs, opts) {
        const options = opts || {};
        const showSummary = options.showSummary !== false;
        const capMs = Math.max(0, dep.session.settings.offlineCapHours * 3600 * 1000);
        const effectiveMs = Math.min(Math.max(0, offlineMs), capMs);
        if (effectiveMs <= 0) return;
        const offlineSec = effectiveMs / 1000;
        const { offline } = dep;
        offline.tickBackgroundNumberModules(offlineSec);
        offline.updateBlackHolePhaseStep(offlineSec);
        try {
            if (offline.getBlackHolePhase() === 7) {
                offline.run.totalChanges = Math.floor(offline.blackHole.number1BlackHoleState.phase7EpilogueCounter || 0);
                offline.run.handEarnings[0] = offline.run.totalChanges;
                if (offline.run.totalChanges > offline.run.number1RunPeakTotalCount) {
                    offline.run.number1RunPeakTotalCount = offline.run.totalChanges;
                }
                return;
            }
            const cpsPerHandProbe = offline.getRawCpsPerHand();
            const rawCpsProbe = cpsPerHandProbe.reduce((a, b) => a + b, 0);
            if (rawCpsProbe <= 0) return;
            const gained = offline.applyDetachedCpsProgress(offlineSec);
            if (showSummary && offline.offlineSummaryBodyEl && offline.offlineSummaryPanelEl) {
                const capped = offlineMs > capMs;
                offline.offlineSummaryBodyEl.textContent =
                    "Simulated " + (effectiveMs / 1000).toFixed(1) + "s offline and gained " +
                    offline.formatCount(gained) + (capped ? " (capped)." : ".");
                offline.offlineSummaryPanelEl.style.display = "flex";
            }
        } finally {
            offline.syncBlackHolePhase1Vfx();
        }
    }

    return {
        buildNumber1HydrateEnv,
        getSaveState,
        autosaveNow,
        applyLoadedState,
        applyOfflineProgress
    };
}
