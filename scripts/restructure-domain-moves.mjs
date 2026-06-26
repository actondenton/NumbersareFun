/**
 * Phases 5–9: move n1 modules into number1/<domain>/ and rewrite relative imports.
 * Run: node scripts/restructure-domain-moves.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(__dirname, "../src/game");

/** @type {Record<string, string>} basename -> path relative to src/game */
const MOVES = {
    // Phase 5 — black-hole
    "number1-black-hole.js": "number1/black-hole/number1-black-hole.js",
    "number1-black-hole.test.ts": "number1/black-hole/number1-black-hole.test.ts",
    "n1-black-hole-boot.js": "number1/black-hole/n1-black-hole-boot.js",
    "n1-black-hole-boot.test.ts": "number1/black-hole/n1-black-hole-boot.test.ts",
    "n1-black-hole-tier-accent.js": "number1/black-hole/n1-black-hole-tier-accent.js",
    "n1-black-hole-tier-accent.test.ts": "number1/black-hole/n1-black-hole-tier-accent.test.ts",
    "n1-black-hole-upgrade-preview.js": "number1/black-hole/n1-black-hole-upgrade-preview.js",
    "n1-black-hole-upgrade-preview.test.ts": "number1/black-hole/n1-black-hole-upgrade-preview.test.ts",
    "n1-black-hole-ui.js": "number1/black-hole/n1-black-hole-ui.js",
    "n1-black-hole-controller.js": "number1/black-hole/n1-black-hole-controller.js",
    "n1-black-hole-spend-sim.js": "number1/black-hole/n1-black-hole-spend-sim.js",
    "n1-black-hole-preview-ui.js": "number1/black-hole/n1-black-hole-preview-ui.js",

    // Phase 6 — combos
    "n1-combos.js": "number1/combos/n1-combos.js",
    "n1-combos.test.ts": "number1/combos/n1-combos.test.ts",
    "n1-combo-discovery-ui-loop.js": "number1/combos/n1-combo-discovery-ui-loop.js",
    "n1-combo-discovery-ui-loop.test.ts": "number1/combos/n1-combo-discovery-ui-loop.test.ts",
    "n1-combo-discovery-milestone-ui.js": "number1/combos/n1-combo-discovery-milestone-ui.js",
    "n1-combo-discovery-milestone-ui.test.ts": "number1/combos/n1-combo-discovery-milestone-ui.test.ts",
    "n1-combo-feedback-ui.js": "number1/combos/n1-combo-feedback-ui.js",
    "n1-combo-feedback-ui.test.ts": "number1/combos/n1-combo-feedback-ui.test.ts",
    "n1-combo-hand-status-ui.js": "number1/combos/n1-combo-hand-status-ui.js",
    "n1-combo-hand-status-ui.test.ts": "number1/combos/n1-combo-hand-status-ui.test.ts",
    "n1-combo-near-miss-access.js": "number1/combos/n1-combo-near-miss-access.js",
    "n1-combo-near-miss-access.test.ts": "number1/combos/n1-combo-near-miss-access.test.ts",
    "n1-combo-ui.js": "number1/combos/n1-combo-ui.js",
    "n1-combo-ui.test.ts": "number1/combos/n1-combo-ui.test.ts",
    "n1-combinations-panel-refresh.js": "number1/combos/n1-combinations-panel-refresh.js",
    "n1-combinations-panel-refresh.test.ts": "number1/combos/n1-combinations-panel-refresh.test.ts",
    "n1-combinations-panel-ui.js": "number1/combos/n1-combinations-panel-ui.js",
    "n1-combinations-panel-ui.test.ts": "number1/combos/n1-combinations-panel-ui.test.ts",

    // Phase 7 — ascension (grant-totals already in ascension/)
    "n1-ascension.js": "number1/ascension/n1-ascension.js",
    "n1-ascension.test.ts": "number1/ascension/n1-ascension.test.ts",
    "n1-ascension-flow-ui.js": "number1/ascension/n1-ascension-flow-ui.js",
    "n1-ascension-flow-ui.test.ts": "number1/ascension/n1-ascension-flow-ui.test.ts",
    "n1-ascension-map-ui.js": "number1/ascension/n1-ascension-map-ui.js",
    "n1-ascension-page-shell.js": "number1/ascension/n1-ascension-page-shell.js",
    "n1-ascension-page-shell.test.ts": "number1/ascension/n1-ascension-page-shell.test.ts",
    "n1-ascension-perform.js": "number1/ascension/n1-ascension-perform.js",
    "n1-ascension-perform.test.ts": "number1/ascension/n1-ascension-perform.test.ts",
    "n1-overview-ascension-panels.js": "number1/ascension/n1-overview-ascension-panels.js",
    "n1-overview-ascension-panels.test.ts": "number1/ascension/n1-overview-ascension-panels.test.ts",

    // Phase 8 — upgrades
    "n1-upgrades.js": "number1/upgrades/n1-upgrades.js",
    "n1-upgrades.test.ts": "number1/upgrades/n1-upgrades.test.ts",
    "n1-autobuy-state.js": "number1/upgrades/n1-autobuy-state.js",
    "n1-autobuy-state.test.ts": "number1/upgrades/n1-autobuy-state.test.ts",
    "n1-cheapen-boot.js": "number1/upgrades/n1-cheapen-boot.js",
    "n1-slowdown-boot.js": "number1/upgrades/n1-slowdown-boot.js",
    "n1-speed-upgrade-boot.js": "number1/upgrades/n1-speed-upgrade-boot.js",
    "n1-speed-upgrade-boot.test.ts": "number1/upgrades/n1-speed-upgrade-boot.test.ts",
    "n1-turbo.js": "number1/upgrades/n1-turbo.js",
    "n1-turbo.test.ts": "number1/upgrades/n1-turbo.test.ts",
    "n1-turbo-boot.js": "number1/upgrades/n1-turbo-boot.js",
    "n1-turbo-boot.test.ts": "number1/upgrades/n1-turbo-boot.test.ts",
    "n1-turbo-game-loop-step.js": "number1/upgrades/n1-turbo-game-loop-step.js",
    "n1-turbo-game-loop-step.test.ts": "number1/upgrades/n1-turbo-game-loop-step.test.ts",
    "n1-time-warp.js": "number1/upgrades/n1-time-warp.js",
    "n1-time-warp.test.ts": "number1/upgrades/n1-time-warp.test.ts",
    "n1-time-warp-boot.js": "number1/upgrades/n1-time-warp-boot.js",
    "n1-time-warp-boot.test.ts": "number1/upgrades/n1-time-warp-boot.test.ts",
    "n1-upgrade-eta.js": "number1/upgrades/n1-upgrade-eta.js",
    "n1-upgrade-eta.test.ts": "number1/upgrades/n1-upgrade-eta.test.ts",
    "n1-upgrade-ui-controller.js": "number1/upgrades/n1-upgrade-ui-controller.js",

    // Phase 9 — loop / hands / story / objectives / shell
    "n1-game-loop.js": "number1/loop/n1-game-loop.js",
    "n1-game-loop.test.ts": "number1/loop/n1-game-loop.test.ts",
    "n1-game-loop-step-deps.js": "number1/loop/n1-game-loop-step-deps.js",
    "n1-game-loop-step-deps.test.ts": "number1/loop/n1-game-loop-step-deps.test.ts",
    "n1-tick-apply-step.js": "number1/loop/n1-tick-apply-step.js",
    "n1-tick-apply-step.test.ts": "number1/loop/n1-tick-apply-step.test.ts",
    "n1-detached-cps-progress.js": "number1/loop/n1-detached-cps-progress.js",
    "n1-detached-cps-progress.test.ts": "number1/loop/n1-detached-cps-progress.test.ts",
    "n1-rate-tick-boot.js": "number1/loop/n1-rate-tick-boot.js",
    "n1-rate-tick-boot.test.ts": "number1/loop/n1-rate-tick-boot.test.ts",
    "n1-clap.js": "number1/loop/n1-clap.js",
    "n1-clap.test.ts": "number1/loop/n1-clap.test.ts",
    "n1-clap-tick.js": "number1/loop/n1-clap-tick.js",
    "n1-clap-tick.test.ts": "number1/loop/n1-clap-tick.test.ts",
    "n1-hand-ascii.js": "number1/hands/n1-hand-ascii.js",
    "n1-hand-counter.js": "number1/hands/n1-hand-counter.js",
    "n1-hand-counter.test.ts": "number1/hands/n1-hand-counter.test.ts",
    "n1-hands.js": "number1/hands/n1-hands.js",
    "n1-hands.test.ts": "number1/hands/n1-hands.test.ts",
    "n1-story.js": "number1/story/n1-story.js",
    "n1-story.test.ts": "number1/story/n1-story.test.ts",
    "n1-story-banner-boot.js": "number1/story/n1-story-banner-boot.js",
    "n1-story-banner-boot.test.ts": "number1/story/n1-story-banner-boot.test.ts",
    "n1-objectives.js": "number1/objectives/n1-objectives.js",
    "n1-objectives.test.ts": "number1/objectives/n1-objectives.test.ts",
    "n1-objectives-boot.js": "number1/objectives/n1-objectives-boot.js",
    "n1-objectives-boot.test.ts": "number1/objectives/n1-objectives-boot.test.ts",
    "n1-shell-panels.js": "number1/shell-ui/n1-shell-panels.js",
    "n1-format.js": "number1/shell-ui/n1-format.js",
    "n1-format.test.ts": "number1/shell-ui/n1-format.test.ts",
    "n1-log.js": "number1/shell-ui/n1-log.js",
    "n1-log.test.ts": "number1/shell-ui/n1-log.test.ts",
    "n1-log-ticker-runtime.js": "number1/shell-ui/n1-log-ticker-runtime.js",
    "n1-rate.js": "number1/shell-ui/n1-rate.js",
    "n1-rate.test.ts": "number1/shell-ui/n1-rate.test.ts",
    "n1-rate-display-ui.js": "number1/shell-ui/n1-rate-display-ui.js",
    "n1-rate-display-ui.test.ts": "number1/shell-ui/n1-rate-display-ui.test.ts",
    "n1-global-overview-render.js": "number1/shell-ui/n1-global-overview-render.js",
    "n1-global-overview-render.test.ts": "number1/shell-ui/n1-global-overview-render.test.ts",
    "n1-adaptive-tip-message.js": "number1/shell-ui/n1-adaptive-tip-message.js",
    "n1-adaptive-tip-message.test.ts": "number1/shell-ui/n1-adaptive-tip-message.test.ts",
    "n1-top-count-row-fit.js": "number1/shell-ui/n1-top-count-row-fit.js",
    "n1-top-count-row-fit.test.ts": "number1/shell-ui/n1-top-count-row-fit.test.ts",
    "n1-vfx.js": "number1/shell-ui/n1-vfx.js",
    "n1-vfx.test.ts": "number1/shell-ui/n1-vfx.test.ts",
    "n1-ledger-beam.js": "number1/shell-ui/n1-ledger-beam.js",

    // Stale root duplicates (phase 4/12 cleanup)
    "n1-dev-tools.js": "number1/dev/n1-dev-tools.js",
    "n1-dev-tools.test.ts": "number1/dev/n1-dev-tools.test.ts",
    "number2-game.js": "number2/number2-game.js",
    "number2-rules.js": "number2/number2-rules.js",
    "number2-game.test.ts": "number2/number2-game.test.ts"
};

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, out);
        else if (/\.(js|ts)$/.test(ent.name)) out.push(p);
    }
    return out;
}

function moveFiles() {
    let moved = 0;
    let skipped = 0;
    for (const [base, destRel] of Object.entries(MOVES)) {
        const src = path.join(GAME, base);
        const dest = path.join(GAME, destRel);
        if (!fs.existsSync(src)) {
            skipped++;
            continue;
        }
        if (path.resolve(src) === path.resolve(dest)) {
            skipped++;
            continue;
        }
        if (fs.existsSync(dest)) {
            fs.unlinkSync(src);
            skipped++;
            continue;
        }
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.renameSync(src, dest);
        moved++;
    }
    console.log(`Moved ${moved} files, skipped ${skipped}`);
}

/** @type {Map<string, string>} absolute normalized path -> game-relative path */
function buildLocationIndex() {
    const index = new Map();
    for (const f of walk(GAME)) {
        const rel = path.relative(GAME, f).replace(/\\/g, "/");
        index.set(path.normalize(f), rel);
        index.set(path.basename(f), rel);
    }
    return index;
}

function resolveImport(fromFile, spec, index) {
    if (!spec.startsWith(".")) return spec;
    const fromDir = path.dirname(fromFile);
    const abs = path.normalize(path.resolve(fromDir, spec));
    const base = path.basename(abs);
    const movedRel = MOVES[base];
    let targetRel;
    if (movedRel && fs.existsSync(path.join(GAME, movedRel))) {
        targetRel = movedRel;
    } else if (index.has(abs)) {
        targetRel = index.get(abs);
    } else if (index.has(base)) {
        targetRel = index.get(base);
    } else {
        return spec;
    }
    const fromRel = path.relative(GAME, fromFile).replace(/\\/g, "/");
    const fromDirRel = path.dirname(fromRel);
    let rel = path.relative(fromDirRel, targetRel).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    return rel;
}

function fixImports() {
    const index = buildLocationIndex();
    const files = walk(GAME);
    let changes = 0;
    for (const file of files) {
        let src = fs.readFileSync(file, "utf8");
        const next = src.replace(
            /from\s+["'](\.[^"']+)["']/g,
            (m, spec) => {
                const fixed = resolveImport(file, spec, index);
                if (fixed === spec) return m;
                changes++;
                return `from "${fixed}"`;
            }
        );
        if (next !== src) fs.writeFileSync(file, next);
    }
    console.log(`Rewrote ${changes} import specifiers`);
}

moveFiles();
fixImports();
console.log("Domain restructure complete");
