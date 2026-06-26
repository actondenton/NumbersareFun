/**
 * Game shell entry: boot Number 1, install autosave, expose NUMBER_MODULES registry.
 */
import { createN1Boot } from "./number1/n1-boot.js";
import { createNumber1Runtime } from "./number1/state/n1-runtime.js";
import { collectNumber1DomRefs } from "./number1/shell-ui/n1-dom-refs.js";
import { installGameShellAutosave } from "./shell-autosave.js";
import { AUTOSAVE_INTERVAL_MS } from "./n1-save.js";

const runtime = createNumber1Runtime({ maxHands: 10 });
const dom = collectNumber1DomRefs(document);
const n1Boot = createN1Boot({ runtime, dom });

export const gameShell = n1Boot.boot();

installGameShellAutosave({
    autosaveNow: () => gameShell.autosaveNow(),
    intervalMs: AUTOSAVE_INTERVAL_MS
});

export {
    buildNumberModulesRegistry,
    getUnlockedNumberModules,
    tickBackgroundNumberModules
} from "./shell-registry.js";
