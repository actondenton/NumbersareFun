/**
 * Extract legacy-boot body into number1/boot-number1.js; leave thin legacy-boot shim.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gameDir = path.join(__dirname, "../src/game");
const legacyPath = path.join(gameDir, "legacy-boot.js");
const wiringPath = path.join(gameDir, "number1/boot-number1.js");

let src = fs.readFileSync(legacyPath, "utf8");

const importEnd = src.indexOf("    /** Page-load epoch ms");
const exportStart = src.indexOf("/** Shell hooks owned by index.js");
if (importEnd === -1 || exportStart === -1) {
    throw new Error("Could not find extraction boundaries");
}

const imports = src.slice(0, importEnd).trimEnd();
const body = src.slice(importEnd, exportStart);
const gameShellExport = src.slice(exportStart);

const wiringImports = imports
    .replace(/import \{ createNumber1Runtime \} from "\.\/number1\/state\/n1-runtime\.js";\n/, "")
    .replace(/import \{ collectNumber1DomRefs \} from "\.\/number1\/shell-ui\/n1-dom-refs\.js";\n/, "")
    .replace(/import \{ createN1Boot \} from "\.\/number1\/n1-boot\.js";\n\n?/, "");

let wiringBody = body
    .replace(
        /const n1Rt = createNumber1Runtime\(\{ maxHands: 10 \}\);\s*\n\s*const run = n1Rt\.run;[\s\S]*?const dom = collectNumber1DomRefs\(document\);\s*\n\s*const n1Boot = createN1Boot\(\{ runtime: n1Rt, dom \}\);\s*\n/,
        `const n1Rt = runtime;
    const run = n1Rt.run;
    const ascension = n1Rt.ascension;
    const blackHole = n1Rt.blackHole;
    const turbo = n1Rt.turbo;
    const session = n1Rt.session;
    const maxHands = run.maxHands;
`
    )
    .replace("run.run.totalChanges", "run.totalChanges");

const returnBlock = gameShellExport
    .replace(
        /\/\*\* Shell hooks owned by index\.js \(autosave, registry\)\. \*\/\s*export const gameShell = /,
        "    return "
    )
    .replace(/;\s*\n\s*}\s*$/, ";\n");

const wiringFile = `${wiringImports}

/**
 * Number 1 game wiring (orchestration body migrated from legacy-boot.js).
 * Called from legacy-boot shim via createN1Boot spine.
 *
 * @param {{
 *   n1Boot: ReturnType<typeof import("./n1-boot.js").createN1Boot>,
 *   runtime: ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>,
 *   dom: ReturnType<typeof import("./shell-ui/n1-dom-refs.js").collectNumber1DomRefs>
 * }} ctx
 */
export function bootNumber1({ n1Boot, runtime, dom }) {
${wiringBody}${returnBlock}
}
`;

fs.writeFileSync(wiringPath, wiringFile);

const thinLegacy = `import { createNumber1Runtime } from "./number1/state/n1-runtime.js";
import { collectNumber1DomRefs } from "./number1/shell-ui/n1-dom-refs.js";
import { createN1Boot, bootNumber1 } from "./number1/n1-boot.js";

const runtime = createNumber1Runtime({ maxHands: 10 });
const dom = collectNumber1DomRefs(document);
const n1Boot = createN1Boot({ runtime, dom });

/** Thin shim — all N1 wiring lives in number1/boot-number1.js */
export const gameShell = bootNumber1({ n1Boot, runtime, dom });
`;

fs.writeFileSync(legacyPath, thinLegacy);

const n1BootPath = path.join(gameDir, "number1/n1-boot.js");
let n1Boot = fs.readFileSync(n1BootPath, "utf8");
if (!n1Boot.includes("bootNumber1")) {
    n1Boot = n1Boot.trimEnd() + '\nexport { bootNumber1 } from "./boot-number1.js";\n';
    fs.writeFileSync(n1BootPath, n1Boot);
}

console.log("Extracted boot-number1.js; legacy-boot.js is now thin shim");
console.log("legacy-boot lines:", thinLegacy.split("\n").length);
console.log("boot-number1 lines:", wiringFile.split("\n").length);
