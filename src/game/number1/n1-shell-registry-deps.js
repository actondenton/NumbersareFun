/**
 * Thin deps builder for `buildNumberModulesRegistry` (Phase 20 shell registry drain).
 *
 * @param {{
 *   createNumberModule: import("../core/number-module-interface.js").createNumberModule,
 *   getRawCpsPerHand: () => number[],
 *   getComboMultiplier: () => number,
 *   getTurboCountMultiplier: () => number,
 *   getNumber1BlackHoleProductionMult: () => number,
 *   longTermObjectives: { achieved?: boolean, text: string }[],
 *   run: { totalChanges: number },
 *   formatCount: (n: number) => string,
 *   getObjectiveProgressForTotal: (obj: unknown, total: number, fmt: (n: number) => string) => { pct: number },
 *   isNumber1AscensionReady: () => boolean,
 *   ascension: { number1AscensionEssence: number, ascensionNumber1IntroSeen: boolean },
 *   getBlackHolePhase: () => number,
 *   formatBlackHoleMultForUi: (n: number) => string,
 *   blackHole: { number1BlackHoleState: { phase2Mass?: number } },
 *   number2: { renderAscensionShell: () => string },
 *   number2State: { started: boolean, ascensionEssence: number },
 *   isNumber2Unlocked: () => boolean
 * }} ctx
 */
export function createNumber1ShellRegistryDeps(ctx) {
    const {
        createNumberModule,
        getRawCpsPerHand,
        getComboMultiplier,
        getTurboCountMultiplier,
        getNumber1BlackHoleProductionMult,
        longTermObjectives,
        run,
        formatCount,
        getObjectiveProgressForTotal,
        isNumber1AscensionReady,
        ascension,
        getBlackHolePhase,
        formatBlackHoleMultForUi,
        blackHole,
        number2,
        number2State,
        isNumber2Unlocked
    } = ctx;

    return {
        n1: {
            createNumberModule,
            getLabel: () => "Number 1",
            getRatePerSec: () => {
                const cpsPerHand = getRawCpsPerHand();
                const rawCps = cpsPerHand.reduce((a, b) => a + b, 0);
                return rawCps * getComboMultiplier() * getTurboCountMultiplier() * getNumber1BlackHoleProductionMult();
            },
            getMilestone: () => {
                const next = longTermObjectives.find(o => !o.achieved) || longTermObjectives[longTermObjectives.length - 1];
                if (!next) return { text: "Complete", pct: 100 };
                const progress = getObjectiveProgressForTotal(next, run.totalChanges, formatCount);
                return { text: next.text, pct: next.achieved ? 100 : progress.pct };
            },
            isAscensionReady: () => isNumber1AscensionReady(),
            getSaveData: () => ({
                ascensionEssence: ascension.number1AscensionEssence,
                ascensionIntroSeen: ascension.ascensionNumber1IntroSeen
            }),
            applySaveData: data => {
                if (!data || typeof data !== "object") return;
                if (typeof data.ascensionIntroSeen === "boolean") {
                    ascension.ascensionNumber1IntroSeen = data.ascensionIntroSeen;
                }
            },
            getOverviewDetails: () => {
                let s = "Essence: " + formatCount(ascension.number1AscensionEssence);
                if (getBlackHolePhase() > 0) {
                    const m = getNumber1BlackHoleProductionMult();
                    const ph = getBlackHolePhase();
                    if (ph === 1) {
                        s += " · Numerical mass · ×" + formatBlackHoleMultForUi(m) + " total run mult";
                    } else {
                        s += " · Black hole P" + ph + " ×" + formatBlackHoleMultForUi(m) + " (mass " + Math.floor(blackHole.number1BlackHoleState.phase2Mass || 0) + ")";
                    }
                }
                return s;
            }
        },
        n2: {
            controller: number2,
            state: number2State,
            moduleOpts: {
                isUnlocked: () => isNumber2Unlocked(),
                formatCount
            }
        }
    };
}
