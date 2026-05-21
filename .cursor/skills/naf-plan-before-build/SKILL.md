---
name: naf-plan-before-build
description: >-
  Requires .cursor/plans/*.plan.md for non-trivial NumbersareFun work. Use for
  features, refactors, balance, multi-file subsystem changes, or diffs over 25 lines.
---

# NAF plan before build

## Small — no plan required

**All** must be true:

- **Test-only, copy, comments, or non-behavioral fix** — no change to player-facing behavior
- Does **not** change: production mults, costs, timings, unlock thresholds, or save fields (even in one file)
- Total diff **≤ 25 lines** (additions, edits, and deletions across all touched files)

Examples: fix vitest expectation; typo in log string; comment-only; rename internal symbol with no behavior change.

## Needs plan — any one triggers

- Any change to **production mults, costs, timings, unlock thresholds, or save fields** (even one file)
- Total diff **> 25 lines** across the change set
- **2+ files in the same subsystem** (subsystem list in `.cursor/skills/naf-game-domains/reference.md`)
- Refactor / extraction / “move X out of legacy”
- New gameplay system, UI panel, or cross-subsystem work
- Any non-trivial touch to `legacy-boot.js` (deps-only wires still count toward the 25-line budget)

**Exception:** User says **“implement the attached plan”** or **“execute plan X”** — proceed without drafting a new plan. Do not edit the plan file unless asked.

## Where plans live

All new implementation plans:

```
.cursor/plans/<short-name>.plan.md
```

Use Cursor plan format (YAML frontmatter: `name`, `overview`, `todos`; markdown body). Do **not** create new agent engineering plans under `docs/plans/`. Use `docs/plans/` and `docs/features/` for **read-before-edit** design/backlog only.

## Workflow when plan is missing

1. Stop implementation; switch to Plan mode
2. Create `.cursor/plans/<short-name>.plan.md` with: goal, files touched, **legacy-boot touch list** (ideally “none”), estimated line budget, test commands (`npm run test:run`, `npm run build`), out-of-scope
3. For legacy shrink, link a milestone from [docs/plans/legacy_boot_shrink_backlog.md](docs/plans/legacy_boot_shrink_backlog.md) (A–G)
4. Implement after user confirms (or explicit “skip plan for this”)

## After completing a plan

Update [`.cursor/skills/naf-game-domains/reference.md`](../naf-game-domains/reference.md): files moved, new modules, subsystem boundaries, and **Last updated** (plan name / date).
