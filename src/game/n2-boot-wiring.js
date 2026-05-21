import { createNumber2Controller, createNumber2State } from "./modules/number2/game.js";

/**
 * Number 2 runtime wiring (isolated economy). Legacy orchestrator supplies DOM/shell callbacks.
 *
 * @param {object} controllerDeps — same shape as {@link createNumber2Controller} second argument.
 */
export function createN2BootWiring(controllerDeps) {
    const number2State = createNumber2State();
    const number2 = createNumber2Controller(number2State, controllerDeps);
    return { number2State, number2 };
}
