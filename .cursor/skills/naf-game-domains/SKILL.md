---
name: naf-game-domains
description: >-
  Maps NumbersareFun subsystems to source files. Use when implementing Number 1,
  black hole, combo, ascension, turbo, save, or Number 2.
---

# NAF game domains

Full subsystem → file map: **[reference.md](reference.md)** (update after each completed `.cursor/plans/*.plan.md`).

## Subsystems (for 2-file plan rule)

`black-hole` | `combo` | `ascension` | `loop-save` | `turbo-upgrades` | `story-objectives` | `clap-hands` | `number2` | `shell-ui`

## Read-before-edit

Open the relevant `docs/features/*` PRD or spec for design intent. Do not use `docs/features/` or `docs/plans/` as the location for **new** agent implementation plans.

## Verify

After each milestone: `npm run test:run` and `npm run build`.

## Balance / tuning

Change constants in **rules modules** first (`number1-black-hole.js`, `modules/number1/*`). Legacy and panels should consume existing getters only.

## UI

- Structural markup: `index.html`
- Panel HTML: boot modules / `modules/number1/shell-panels.js`, `n1-ascension-pages.js`
- Styles: `style.css` — reuse `asc-*`, `bh-*`, existing class names

## Ascension tree data

Generate via `scripts/ascension/` → `data/ascension/`. Do not hand-edit large node arrays in legacy-boot.

## Entry / load

`src/main.ts` loads ascension data and Number 2 upgrades before `legacy-boot.js`.
