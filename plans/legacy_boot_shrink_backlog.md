# Legacy boot shrink backlog

Global rules every step MUST follow

- **Exports:** Prefer **`create*` factory + `deps` object**, or **`export function`** pure helpers, matching existing patterns (`n1-clap-tick`, etc.).
- **Hoisting/order:** If boot registers listeners early, use **`let fn = () => {}`** stubs or move registration after the factory, as done for ascend flow.
- **Verify:** **`npm run test:run`** and **`npm run build`** after **each** step.
- **Tests:** Prefer small **unit** coverage for extracted pure logic; reuse **fixture-style** mocks for factories (see existing `*.test.ts`).
- **Proceed:** Proceed to next steps.

Step 14 — Black Hole boot façade (thin wrapper collapse)

- **Goal:** Fold the long tail of **`getBlackHole*` / `tryBuyBlackHole*`** boot functions into **`n1-black-hole-boot.js`** exposing grouped **`deps`** batches to **`createNumber1BlackHoleController`** / UI—**preserve** semantics; start with mechanical move, then prune duplicates vs controller.

---

## Step 15 — Combo cluster remainder

- **Locate:** Marker **“HAND COMBOS”** onward.
- **Goal:** Identify any **remainders** outside **`createComboDiscoveryUiLoop`/`createCombinationsPanelUi`/`createComboFeedbackUi`** worth moving (e.g. **`getNearMissToleranceRanks`** glue only).

---

## Step 16 — Dev/test harness cleanup hardening

- **Goal:** After extractions plateau, **`attachN1DevTools`** deps object can shrink by pointing to **`n1-*` facades}; add **one** sanity test guarding **devtools attach**.

---

## Step 17 — Repo artifact: backlog file (optional housekeeping)

- **Goal:** Persist this checklist verbatim at **`plans/legacy_boot_shrink_backlog.md`** (or beside existing plans under **`plans/`**) so future chats don't need conversation context.
