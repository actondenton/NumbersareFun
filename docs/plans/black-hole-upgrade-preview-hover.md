# Black Hole Upgrade Preview on Hover — Revised Plan

**Status:** Draft for review  
**Last updated:** 2026-06-06  
**Related:** Numerical Mass Accumulator (Phase 1), Black hole collapse (Phase 2+), ascension Essence spend UI

---

## Goal

When the player hovers or focuses a **primary Essence action button** on the black-hole ascension panel, show **current vs projected upgrade values** with a slow, theme-aligned crossfade so they can see what they have now and what they would get after spending.

Projected spending must account for:

- Essence **currently held**, and
- Essence the player **would receive from ascending** (when ascend is available at current run totals).

---

## Confirmed scope (from review)

| Decision | Choice |
|----------|--------|
| **Trigger** | Hover / focus on primary action button only (pour, buy, stoke) |
| **Phases** | All black-hole phases that spend Essence (**1–6**). Phase 7 has no spend buttons. |
| **Excluded actions** | Phase 4 manual gravitational wave; Phase 6 jet on/off toggle |

---

## Critical design decisions (revised from critique)

### 1. Essence budget semantics (locked)

```
projectedBudget = heldEssence + (ascendReady ? ascensionGainAtCurrentTotals : 0)
```

| Rule | Detail |
|------|--------|
| **Ascension gain basis** | Use `computeNumber1AscensionGainBreakdown` at **current** run totals and **current** black-hole state (fill ratio, parallel pool, furnace bonus, etc.). Do **not** retroactively apply pour-side effects to the ascend gain estimate. |
| **Spend simulation** | After budget is computed, simulate **one** action for the hovered button: pour-all or buy-until-budget-exhausted on that track. |
| **Player order assumed** | Ascend → receive Essence → pour on ascension page. Preview answers: *“If I ascend (when ready), then click this button with everything I’d have, what changes?”* |
| **Ascend not ready** | Budget = held Essence only. No implied future ascend gain. |
| **No double-counting** | Budget is spent once per preview; partial banks (Phase 2/4) follow existing controller bank rules. |

**Phase 1 nuance:** Pouring increases `phase1EssenceSpent`, which would increase ascend mult if you poured *before* ascending. Preview intentionally does **not** model that loop—it models the typical post-ascend pour. Document this in UI copy (see § UX copy).

### 2. Simulation source of truth (no drift)

**Do not** maintain parallel `simulatePhaseN*` functions that duplicate controller logic.

**Preferred approach:**

1. Extract **pure state-transition helpers** in `number1-black-hole.js` or `n1-black-hole-controller.js` that apply a spend to a **cloned state** and return updated state + derived stats.
2. Reuse those helpers from:
   - real purchase handlers (`tryBuyNumber1BlackHole`, collapse buys, etc.), and
   - preview module (`n1-black-hole-upgrade-preview.js`).

If extraction is too invasive for Phase 1, Phase 1 may use direct rule helpers (`getBlackHolePhase1RunCpsMult`, etc.) on a cloned state, but Phases 2+ **must** share code paths with the controller before merge.

### 3. Phased delivery (revised scope)

| Milestone | Phases | Exit criteria |
|-----------|--------|---------------|
| **M1 — Vertical slice** | Phase 1 only | Pour button hover cycles effect stats + meter + total mult; tests pass; a11y OK |
| **M2 — Row buys** | Phases 2–3 | Per-track Buy buttons preview that track’s tier/effect + shared stats per map below |
| **M3 — Banked pours** | Phases 4 & 6 | Wave pour + P6 track buys |
| **M4 — Stoke extension** | Phase 5 | Extend existing stoke preview budget to include ascend gain; align with crossfade pattern where applicable |

Do **not** ship M2–M4 until M1 UX and math are validated.

---

## Architecture

```
number1-black-hole.js          ← pure rules (existing)
n1-black-hole-controller.js    ← shared apply-spend-to-state helpers (extract/refactor)
n1-black-hole-upgrade-preview.js ← budget + preview dispatch (new, pure)
n1-black-hole-ui.js            ← markup enhancement, hover/focus, live patch compat (extend)
style.css                      ← crossfade tokens + reduced-motion fallbacks
legacy-boot.js                 ← wiring only: pass deps, delegate listener setup
```

**Boot constraint:** No new business logic in `legacy-boot.js`. Prefer `enhanceBlackHolePreviewMarkup(panel)` in UI module over expanding `renderNumber1BlackHolePanelHtml` where possible.

---

## UI pattern

### Markup (dual-value cycle)

```html
<span class="asc-bh-stat-cycle" data-preview-stat="inertial">
  <span class="asc-bh-stat-cycle__current">run CPS ×1.12</span>
  <span class="asc-bh-stat-cycle__future"></span>
</span>
```

- **`__current`** — updated by existing live patches and initial render.
- **`__future`** — populated on hover/focus; cleared on leave.
- Buttons carry **`data-asc-bh-preview-action`** (e.g. `p1-pour`, `p2-mass`, `p2-photon`, `p3-luminosity`, `p4-pour`, `p5-stoke`, `p6-drain`).

Markup may be applied at render time **or** via post-mount enhancement in `n1-black-hole-ui.js` to limit boot churn.

### Interaction

| Event | Behavior |
|-------|----------|
| `pointerenter` / `focusin` on `[data-asc-bh-preview-action]` | Compute preview → fill `__future` → add `asc-black-hole--upgrade-preview-active` on panel |
| `pointerleave` / `focusout` | Remove class, clear `__future` |
| Live patch while hover active | Update `__current` only, then re-run preview for active button |

Move Phase 5 stoke pointer listeners from `legacy-boot.js` into `n1-black-hole-ui.js` as part of M4 (or M1 if touching that file anyway).

### CSS

| Token / class | Purpose |
|---------------|---------|
| `--asc-bh-stat-current` | Warm gold (matches `.asc-black-hole__effect-val`) |
| `--asc-bh-stat-future` | Soft violet/teal accent, same theme family |
| `asc-bh-stat-cycle__future` | Slightly distinct font stack (tabular / monospace) |
| `@keyframes asc-bh-stat-crossfade` | ~3.5s ease-in-out infinite **alternate** opacity crossfade |
| `prefers-reduced-motion: reduce` | **No animation** — show `current → future` side-by-side or stacked with labels |
| Light theme | Mirror existing `.asc-black-hole__*` light overrides |

Panel class **`asc-black-hole--upgrade-preview-active`** gates animation (same pattern as `--stoke-preview-active`).

### UX copy

Add a short hint visible on preview (near purse line or button `title`):

> Preview assumes Essence on hand plus what you’d earn from ascending now, then spending all of it on this action.

When `ascendReady` is false, soften to:

> Preview uses Essence on hand only (ascend not ready yet).

---

## Per-button stat map

Defines which nodes cycle when each action is hovered.

### Phase 1 — `p1-pour` (Pour in all Essence)

| Stat node | Current source | Future source |
|-----------|----------------|---------------|
| Mass meter fill % | `phase1EssenceSpent / TARGET` | After simulated pour |
| Inertial counting | `getBlackHolePhase1RunCpsMult` | Cloned state after pour |
| Essence coupling | `getBlackHolePhase1AscensionEssenceMult` | Same |
| Drag ceiling | `getMaxSlowdownLevelCap` (includes P1 bonus) | Same |
| Total run mult | `getNumber1BlackHoleProductionMult` | Same |

### Phase 2 — collapse tracks (`p2-mass`, `p2-photon`, `p2-ergosphere`)

| Stat node | Future source |
|-----------|---------------|
| Hovered row tier + effect text | After buy-until-broke on that track |
| Parallel pool meter | After Essence spent on that track (parallel pool increment) |
| Total mult | If affected by photon tier |

### Phase 2 — `p2-pour-mass` (Pour all into mass)

| Stat node | Future source |
|-----------|---------------|
| Mass level + bank progress | After mass pour simulation |
| Total mult | After pour |

### Phase 3 — `p3-{track}` (Buy per disk track)

| Stat node | Future source |
|-----------|---------------|
| Hovered row tier + pips + effect | After buy-until-broke on track |
| Phase stats line (L/V/C) | Updated tiers |
| Total mult | If disk frac affects production |

### Phase 4 — `p4-pour` (Pour into wave)

| Stat node | Future source |
|-----------|---------------|
| Wave level | After bank/pour simulation |
| Wave interval | Derived from mass + wave level |
| Bank progress line | After pour |

### Phase 5 — `p5-stoke` (extend existing)

| Stat node | Change |
|-----------|--------|
| Digest time % / power % / remaining | Use **`projectedBudget`** instead of held-only in `getBlackHolePhase5StokePreview` |
| Furnace meter preview bar | Already exists — align budget rule |

Optional: apply crossfade to stoke stat line if it improves consistency with M1 pattern.

### Phase 6 — `p6-{track}` (Buy per jet track)

| Stat node | Future source |
|-----------|---------------|
| Hovered row tier + effect | After buy on track |
| Jet fuel cap (if `bank` track) | Updated cap |
| Phase 6 stats line | Updated tiers |

---

## Live DOM patch audit (required)

Every patch function that touches previewable stats **must** target `.asc-bh-stat-cycle__current` (or call a shared `setBlackHoleStatCurrent(key, text)` helper).

| File / function | Action |
|-----------------|--------|
| `patchBlackHolePhase1PanelLiveDom` | Update `__current` spans by `data-preview-stat` |
| `patchBlackHolePhase2PanelLiveDom` | Re-render or patch `__current` only |
| `patchBlackHolePhase3PanelLiveDom` | Same |
| Initial `renderNumber1BlackHolePanelHtml` | Emit or enhance cycle wrappers |

If hover is active when a live patch runs, **re-invoke preview** for the active button.

---

## Module API (draft)

### `n1-black-hole-upgrade-preview.js`

```js
/** @returns {number} */
export function getProjectedEssenceBudget(deps)

/**
 * @returns {{ current: Record<string, string>, future: Record<string, string> } | null}
 */
export function getBlackHoleUpgradePreview(actionKey, deps)
```

`deps` includes: cloned black-hole state factory, ascend readiness, gain breakdown, controller apply helpers, formatters.

### Tests — `n1-black-hole-upgrade-preview.test.ts`

| Case | Assert |
|------|--------|
| P1 pour, held only | Future fill ratio increases correctly |
| P1 pour, held + ascend gain | Budget sums correctly; pour capped at remaining target |
| P1, ascend not ready | Budget excludes gain |
| P2 track buy | Tier stops at max; costs match controller |
| P2 parallel pool | Increments with spend |
| Zero budget | Preview null or future === current |
| Maxed track | Future === current |

---

## Implementation steps (revised order)

### M1 — Phase 1 vertical slice

1. Add `getProjectedEssenceBudget` + P1 preview using rule helpers on cloned state.
2. Add CSS tokens + crossfade + reduced-motion fallback.
3. Add markup enhancement + `data-asc-bh-preview-action="p1-pour"` on pour button.
4. Bind hover/focus in `n1-black-hole-ui.js`; wire deps from boot (minimal).
5. Fix `patchBlackHolePhase1PanelLiveDom` for dual-span + hover refresh.
6. Unit tests for P1 budget + pour math.
7. **Review checkpoint** — UX, math, a11y before M2.

### M2 — Phases 2–3

1. Extract shared apply-spend helpers from controller (or confirm reuse path).
2. Implement P2/P3 preview dispatch + per-button stat map.
3. Markup / enhancement for P2/P3 rows.
4. Patch functions + tests.

### M3 — Phases 4 & 6

1. Wave pour + jet track previews with bank semantics.
2. Markup, patches, tests.

### M4 — Phase 5

1. Extend stoke preview budget to `getProjectedEssenceBudget`.
2. Move stoke pointer listeners from boot to UI module.
3. Align hint copy and optional crossfade.

---

## Accessibility acceptance criteria

- [ ] `focus-visible` on action buttons triggers same preview as hover.
- [ ] `prefers-reduced-motion`: no infinite animation; readable static comparison.
- [ ] Future values not `aria-hidden` when shown in reduced-motion mode.
- [ ] Optional `aria-describedby` linking button to preview hint element.
- [ ] Preview does not replace button label; stat crossfade is supplementary.

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Preview math diverges from real buys | Shared apply-spend helpers; controller tests + preview tests |
| Live patch breaks dual-span | Audit table above; shared setter helper |
| Boot file growth | Post-mount markup enhancement in UI module |
| Phase 1 ascend/pour order confusion | Locked budget rule + UI hint copy |
| Large single PR | Milestones M1–M4; do not merge M2+ until M1 approved |

---

## Out of scope

- Phase 7 (no Essence spend UI).
- Manual gravitational wave button (Phase 4).
- Jet on/off toggle (Phase 6).
- Preview on non-primary controls (effect list rows, panel background).
- Persisting preview state across panel re-renders beyond active hover/focus.

---

## Open questions for reviewer

1. **Phase 1 ascend/pour order:** Is “ascend gain at current fill, then pour all” the intended mental model, or should we offer a toggle for “pour first, then ascend”?
2. **M1 approval gate:** OK to ship Phase 1 preview alone before Phases 2–6?
3. **Markup strategy:** Prefer post-mount enhancement (less boot diff) or inline dual spans in `renderNumber1BlackHolePanelHtml` (simpler patches)?

---

## Approval

- [ ] Budget semantics approved  
- [ ] Milestone phasing approved  
- [ ] Per-button stat map approved  
- [ ] Ready to implement M1  

**Reviewer notes:**

_(space for comments)_
