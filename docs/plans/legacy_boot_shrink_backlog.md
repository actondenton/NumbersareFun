# Legacy boot shrink backlog

Revised to **minimize new `n1-*-boot.js` files**: extend existing boot/wire/shell modules first; add a new top-level boot file only if size forces it.

Global rules every step MUST follow

- **Exports:** Prefer **`create*` factory + `deps` object**, or **`export function`** pure helpers, matching existing patterns.
- **Hoisting/order:** If boot registers listeners early, use **`let fn = () => {}`** stubs or move registration after the factory.
- **Verify:** **`npm run test:run`** and **`npm run build`** after **each** milestone.
- **Tests:** Prefer small **unit** coverage; reuse **fixture-style** mocks for factories.
- **No cycles:** `legacy-boot.js` → `n1-*` / `modules/number1/*`; nothing imports `legacy-boot.js`.
- **Orchestrator keeps (until state bag):** `NUMBER_MODULES` / `createNumberModule` registry, boot **tail** ordering, top-level sim `let` where TDZ requires it.

---

## Milestone A — Finish upgrades / rate / turbo (highest line win)

- **Target:** Extend [`src/game/n1-upgrades-rate-turbo-boot.js`](../../src/game/n1-upgrades-rate-turbo-boot.js) only. Do **not** add `n1-rate-display-boot.js` until this file is clearly too large; if split is needed later, prefer **`modules/number1/`** slices over another `n1-*-boot.js`.
- **Scope:** Speed UI + `createNumber1RateTickBoot` + ETA smoother + top count row fit + combo hand status + rate display UI + turbo stack + `syncUnlocksWithTotalCount` (as deps allow).
- **Tests:** [`src/game/n1-upgrades-rate-turbo-boot.test.ts`](../../src/game/n1-upgrades-rate-turbo-boot.test.ts).

---

## Milestone B — Save / load / offline (first-class)

- **Target:** [`src/game/n1-save-offline.js`](../../src/game/n1-save-offline.js) — move **`applySnapToRuntime`**, **`buildSavePayload`**, and **`applyOfflineAdvance`** bodies here via explicit **`deps`** bags (setters/getters); legacy passes live closures or a assembled deps object.
- **Tests:** [`src/game/n1-save-offline.test.ts`](../../src/game/n1-save-offline.test.ts) with snapshot/fixture coverage where safe.

---

## Milestone C — Per-tick + loop wiring

- **Target (default):** Extend [`src/game/n1-game-loop-wire.js`](../../src/game/n1-game-loop-wire.js) — clap tick, turbo game-loop step, tick-apply, align helper, autobuy flush bindings, coherent `assembleNumber1GameLoopStepDeps` wiring.
- **Avoid:** New `n1-per-tick-boot.js` unless `n1-game-loop-wire.js` becomes unmaintainable.

---

## Milestone D — Shell / page panel + residual ascension HTML

- **Target (default):** Extend [`src/game/modules/number1/shell-panels.js`](../../src/game/modules/number1/shell-panels.js) for `showPagePanel`, modal width, message log scroll, combinations/ascension navigation.
- **Also:** Move remaining **ascension HTML/SVG** render helpers from legacy into [`src/game/n1-ascension-pages.js`](../../src/game/n1-ascension-pages.js) (or `n1-ascension.js`) behind the existing factory surface.

---

## Milestone E — Black hole boot literal

- **Target (only):** [`src/game/n1-black-hole-boot.js`](../../src/game/n1-black-hole-boot.js) — `getBlackHoleControllerDeps` / `getBlackHoleUiDeps` builders; legacy stays a thin caller.
- **Avoid:** `n1-black-hole-boot-options.js` unless file size forces a split.

---

## Milestone F — Dev tools payload

- **Target (default):** [`src/game/modules/number1/dev-tools.js`](../../src/game/modules/number1/dev-tools.js) — e.g. `createN1DevToolsBoot(deps)` colocated with `attachN1DevTools`; legacy one-line factory call.
- **Avoid:** `n1-dev-tools-boot.js` unless boot code must not live under `modules/`.

---

## Milestone G — Story / objectives (optional)

- Bundle milestone chrome into one module under `modules/number1/` or a single `n1-*` file only if needed; keep orthogonal to progression spine.

---

## Line budget (~1k orchestrator, code lines)

- **Metric:** Track **`legacy-boot.js`** with **`npm run metrics:legacy-boot`** (see [scripts/metrics-legacy-boot.mjs](../../scripts/metrics-legacy-boot.mjs); use the printed `code` count as the ~1k budget). See [legacy_boot_state_bag_wave2.md](legacy_boot_state_bag_wave2.md).
- **Reality check:** ~1k **code** lines likely needs **state bag** (wave 2) after A–F; see [`docs/plans/legacy_boot_state_bag_wave2.md`](legacy_boot_state_bag_wave2.md).

---

## Legacy steps (black hole / combo / harness)

Step 14 — Black Hole boot façade (thin wrapper collapse)

- **Goal:** Fold **`getBlackHole*` / `tryBuyBlackHole*`** boot functions into **`n1-black-hole-boot.js`** exposing grouped **`deps`** batches — preserve semantics.

## Step 15 — Combo cluster remainder

- **Locate:** Marker **“HAND COMBOS”** onward.
- **Goal:** Identify **remainders** outside combo factories worth moving.

## Step 16 — Dev/test harness cleanup hardening

- **Goal:** **`attachN1DevTools`** deps shrink via facades; sanity test for devtools attach.

## Step 17 — Repo artifact

- **Goal:** This file is the canonical backlog under **`docs/plans/`**.
