# Wave 2 — state bag toward ~1k orchestrator lines

## Why extractions plateau

After moving pillars into `n1-*` modules and `modules/number1/*`, [legacy-boot.js](../../src/game/legacy-boot.js) still holds:

- A wide **import** surface from `core`, ascension, black hole, upgrades, etc.
- Top-level **`let` simulation state** and **stub reassignment** for boot order / TDZ safety.
- **DOM** `getElementById` / `querySelector` preamble and **deps bags** passed into factories.
- **`NUMBER_MODULES`** registry and the **boot tail** sequence.

Those blocks are hundreds of lines even when feature logic lives elsewhere. Reaching **~1000 code lines** (see metric below) realistically needs a **single mutable state object** (state bag) passed through factories instead of dozens of closed-over `let`s, plus optional **import facades** to shrink the import list.

## Line budget metric

Run:

```bash
npm run metrics:legacy-boot
```

This runs [scripts/metrics-legacy-boot.mjs](../../scripts/metrics-legacy-boot.mjs), which prints **approximate** `code`, `commentOnly`, and `blank` line counts for `src/game/legacy-boot.js` (whole-line `//` / `/* */` comments only — inline trailing comments count as code). Use the **`code`** field as the budget for the ~1k orchestrator target, or switch to full **cloc** locally if Perl is available.

Optional CI: add a job step that runs the same command and fails if `code` exceeds a threshold (raise the ceiling gradually as extractions land).

## State bag sketch (non-prescriptive)

- Introduce e.g. `number1Sim` (plain object or class) holding counters, arrays, and flags currently declared as `let` at the top of legacy-boot.
- Legacy-boot **constructs** the bag once, passes `getState()` / `state` into `createN1SaveOffline`, combo boot, loop wire, etc.
- **Risk:** large refactor; do only after save/offline, upgrades/rate/turbo, shell, and BH literal extractions are stable (see [legacy_boot_shrink_backlog.md](legacy_boot_shrink_backlog.md)).

## Acceptance

Wave 2 is “done” when cloc **code** lines for `legacy-boot.js` are near the agreed target without breaking boot order, save/load, or game loop smoke tests.
