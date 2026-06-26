import { createNumberModule } from "./core/number-module-interface.js";
import { createNumber1ModuleDefinition } from "./number1/n1-module-definition.js";
import { createNumber2ModuleDefinition } from "./number2/number2-game.js";

/**
 * Assembles NUMBER_MODULES registry (shell-level; N1/N2 isolated).
 *
 * @param {{
 *   n1: Parameters<typeof createNumber1ModuleDefinition>[0],
 *   n2: { controller: unknown, state: unknown, moduleOpts: Parameters<typeof createNumber2ModuleDefinition>[2] }
 * }} deps
 */
export function buildNumberModulesRegistry(deps) {
    return {
        1: createNumber1ModuleDefinition(deps.n1),
        2: createNumberModule(createNumber2ModuleDefinition(deps.n2.controller, deps.n2.state, deps.n2.moduleOpts))
    };
}

export function getUnlockedNumberModules(unlockedNumbers, numberModules) {
    return Array.from(unlockedNumbers)
        .map(n => ({ number: n, module: numberModules[n] }))
        .filter(x => !!x.module);
}

/**
 * @param {number} dtSec
 * @param {Set<number>} unlockedNumbers
 * @param {Record<number, { tickBackground: (dt: number) => void }>} numberModules
 * @param {{ getMode: () => number, tickNumber1BackgroundCps: (dt: number) => void }} ctx
 */
export function tickBackgroundNumberModules(dtSec, unlockedNumbers, numberModules, ctx) {
    const mode = ctx.getMode();
    getUnlockedNumberModules(unlockedNumbers, numberModules).forEach(entry => {
        if (entry.number === 1) {
            if (mode !== 1) ctx.tickNumber1BackgroundCps(dtSec);
            return;
        }
        if (entry.number === 2 && mode === 2) return;
        entry.module.tickBackground(dtSec);
    });
}
