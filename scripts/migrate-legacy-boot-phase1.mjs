/**
 * Phase 1 migration with string/comment-aware identifier replacement.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bootPath = path.join(__dirname, "../src/game/legacy-boot.js");
let src = fs.readFileSync(bootPath, "utf8");

const MAPPINGS = [
    ["run", ["totalChanges", "handEarnings", "unlockedHands", "unlockedHandsCap", "number1RunPeakTotalCount", "slowdownCompactionUnlockedLatched"]],
    ["ascension", ["number1AscensionEssence", "number1AscensionPendingBonusEssence", "number1AscensionClapEssenceMultiplier", "number1AscensionClapEssenceProcCount", "number1HasAscended", "number1AscensionNodeIds", "ascensionMapCollapseActiveUntilMs", "ascensionMapCollapseTimerId", "ascensionMapCollapsePending", "ascensionNumber1IntroSeen", "ascensionPageActiveNumber"]],
    ["blackHole", ["number1AscensionBlackHoleLevel", "number1BlackHoleState", "number1BlackHoleUxFlags"]],
    ["turbo", ["turboScensionBurnLevel", "turboScensionTankLevel", "turboScensionMultLevel", "turboScensionFillLevel", "turboBoostMeter", "turboBoostUnlocked", "turboBoostEnabled", "turboActivationCount", "turboActivationEarnAccumulator", "turboLevelerBank", "turboLevelerPurchases"]],
    ["session", ["suppressAutosave", "settings", "gamePaused", "devFreezeGame"]]
];

const varToSlice = new Map();
for (const [slice, vars] of MAPPINGS) {
    for (const v of vars) varToSlice.set(v, slice);
}

if (!src.includes("createNumber1Runtime")) {
    src = src.replace(
        'import { syncPhase1TesseractCanvasesInRoot } from "./phase1-tesseract-canvas.js";',
        'import { syncPhase1TesseractCanvasesInRoot } from "./phase1-tesseract-canvas.js";\nimport { createNumber1Runtime } from "./number1/state/n1-runtime.js";\nimport { N1_DEFAULT_SETTINGS } from "./number1/state/n1-session-store.js";'
    );
}

const globalStartRe = /\/\* -+\s*\r?\n\s+GLOBAL STATE/;
const globalEndRe = /let slowdownCompactionUnlockedLatched = false;/;
const startMatch = src.match(globalStartRe);
const endMatch = src.match(globalEndRe);
if (!startMatch || !endMatch) throw new Error("GLOBAL STATE block not found");

const newGlobalBlock = `/* ---------------------------------------------------------
       GLOBAL STATE (number1/state/* via n1Rt)
    --------------------------------------------------------- */
    const n1Rt = createNumber1Runtime({ maxHands: 10 });
    const run = n1Rt.run;
    const ascension = n1Rt.ascension;
    const blackHole = n1Rt.blackHole;
    const turbo = n1Rt.turbo;
    const session = n1Rt.session;
    const maxHands = run.maxHands;
    const ASCENSION_MAP_COLLAPSE_DURATION_MS = 3100;
    let number1TimeWarpBoot = null;
    function isTimeWarpUnlocked() {
        return number1TimeWarpBoot ? number1TimeWarpBoot.isTimeWarpUnlocked() : run.totalChanges >= TIME_WARP_UNLOCK_COUNT;
    }
    function getTimeWarpProductionSecondsBonus() {
        if (number1TimeWarpBoot) return number1TimeWarpBoot.getTimeWarpProductionSecondsBonus();
        return getTimeWarpProductionSecondsBonusFromTotals(computeAscensionGrantTotals());
    }

    `;

const endIdx = endMatch.index + endMatch[0].length;
src = src.slice(0, startMatch.index) + newGlobalBlock + src.slice(endIdx);

for (const [, vars] of MAPPINGS) {
    for (const v of vars) {
        src = src.replace(new RegExp(`^    let ${v} = [^;]+;\\r?\\n`, "gm"), "");
    }
}

src = src.replace(
    /const DEFAULT_SETTINGS = \{ theme: "light", adaptiveTipsEnabled: true, curtainEnabled: true, humorEnabled: true, showClapAnimation: true, offlineCapHours: 8 \};\r?\n    let settings = \{ \.\.\.DEFAULT_SETTINGS \};/,
    "const DEFAULT_SETTINGS = N1_DEFAULT_SETTINGS;"
);

function replaceIdentifiersOutsideStringsAndComments(code, replacements) {
    const names = [...replacements.keys()].sort((a, b) => b.length - a.length);
    let out = "";
    let i = 0;
    while (i < code.length) {
        const ch = code[i];
        const next = code[i + 1];

        if (ch === "/" && next === "/") {
            const end = code.indexOf("\n", i);
            const stop = end === -1 ? code.length : end;
            out += code.slice(i, stop);
            i = stop;
            continue;
        }
        if (ch === "/" && next === "*") {
            const end = code.indexOf("*/", i + 2);
            const stop = end === -1 ? code.length : end + 2;
            out += code.slice(i, stop);
            i = stop;
            continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
            const quote = ch;
            let j = i + 1;
            while (j < code.length) {
                if (code[j] === "\\") {
                    j += 2;
                    continue;
                }
                if (code[j] === quote) {
                    j++;
                    break;
                }
                j++;
            }
            out += code.slice(i, j);
            i = j;
            continue;
        }

        let matched = false;
        for (const name of names) {
            if (!code.startsWith(name, i)) continue;
            const before = i > 0 ? code[i - 1] : "";
            const after = code[i + name.length] ?? "";
            if (/[\w$]/.test(before) || /[\w$]/.test(after)) continue;
            const slice = replacements.get(name);
            out += `${slice}.${name}`;
            i += name.length;
            matched = true;
            break;
        }
        if (!matched) {
            out += ch;
            i++;
        }
    }
    return out;
}

const flat = new Map();
for (const [slice, vars] of MAPPINGS) {
    for (const v of vars) flat.set(v, slice);
}
src = replaceIdentifiersOutsideStringsAndComments(src, flat);

// Fix object shorthand: `run.totalChanges,` -> `totalChanges: run.totalChanges,`
for (const [slice, vars] of MAPPINGS) {
    for (const v of vars) {
        src = src.replace(new RegExp(`(\\{|,)\\s*${slice}\\.${v}\\s*,`, "g"), `$1 ${v}: ${slice}.${v},`);
    }
}

fs.writeFileSync(bootPath, src);
console.log("Phase 1 migration applied (string-safe)");
