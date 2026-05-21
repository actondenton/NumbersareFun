# NAF domain reference

**Last updated:** naf-cursor-skills (2026-05-18) — initial seed from skill pack implementation

**Subsystems:** `black-hole` | `combo` | `ascension` | `loop-save` | `turbo-upgrades` | `story-objectives` | `clap-hands` | `number2` | `shell-ui`

**Maintenance:** After every completed `.cursor/plans/*.plan.md` implementation, update paths and **Last updated** in this file.

---

## Subsystem boundaries (2+ files in one subsystem → plan required)

| Subsystem | Typical paths (same subsystem) |
|-----------|--------------------------------|
| `black-hole` | `number1-black-hole.js`, `n1-black-hole-boot.js`, `n1-black-hole-ui.js`, `n1-black-hole-boot-options.js` |
| `combo` | `modules/number1/combo.js`, `combo-discovery.js`, `combinations-panel.js`, `combo-near-miss-access.js`, `n1-combo-boot.js` |
| `ascension` | `modules/number1/ascension.js`, `modules/number1/ascension-run-time.js`, `n1-ascension.js`, `n1-ascension-pages.js`, `data/ascension/*`, `scripts/ascension/*` |
| `loop-save` | `modules/number1/core.js`, `n1-save-offline.js`, `n1-game-loop-wire.js`, `number1-clear-save-and-reload.js`, `number1-legacy-loop-flush.js` |
| `turbo-upgrades` | `modules/number1/upgrades.js`, `rate.js`, `n1-upgrades-rate-turbo-boot.js`, `n1-turbo-meter-boot.js`, `n1-upgrade-scroll-hint.js` |
| `story-objectives` | `modules/number1/story.js`, `objectives.js`, `n1-story-milestone-boot.js` |
| `clap-hands` | `modules/number1/clap.js`, `hands.js`, `detached-cps-progress.js`, `autobuy-burst.js` |
| `number2` | `modules/number2/game.js`, `n2-boot-wiring.js`, `number2-upgrades.js` (repo root) |
| `shell-ui` | `modules/number1/shell-panels.js`, `global-overview-render.js`, `overview-ascension-panels.js`, `n1-page-panel-boot.js`, `index.html`, `style.css` |

Cross-subsystem work (e.g. black-hole + combo) always needs a plan if other plan triggers apply.

---

## File map

| Domain | Rules / logic | Boot / wire | Design / backlog doc |
|--------|---------------|-------------|----------------------|
| **Black hole** | `src/game/number1-black-hole.js` | `n1-black-hole-boot.js`, `n1-black-hole-ui.js`, `n1-black-hole-boot-options.js` | `docs/features/BLACK_HOLE_PLAN.md` |
| **Combo** | `modules/number1/combo.js`, `combo-discovery.js`, `combinations-panel.js`, `combo-near-miss-access.js` | `n1-combo-boot.js` | `docs/features/near-miss-combo.spec.md` |
| **Ascension tree** | `modules/number1/ascension.js`, `n1-ascension.js`, `data/ascension/*` | `n1-ascension-pages.js` | `docs/features/PRD - Number 1 Ascension Skill Trees.md` |
| **Loop / save** | `modules/number1/core.js`, `number1-clear-save-and-reload.js` | `n1-save-offline.js`, `n1-game-loop-wire.js`, `n1-per-tick-boot.js` | `docs/features/Numbers Are Fun (NAF) – basic game loop.md` |
| **Turbo / rate** | `modules/number1/rate.js`, `detached-cps-progress.js`, `top-count-row-fit.js` | `n1-turbo-meter-boot.js`, `n1-upgrades-rate-turbo-boot.js` | — |
| **Upgrades** | `modules/number1/upgrades.js` | `n1-upgrades-rate-turbo-boot.js`, `n1-upgrade-scroll-hint.js` | — |
| **Time warp** | `modules/number1/time-warp.js` | (wired via loop / legacy deps) | — |
| **Story / objectives** | `modules/number1/story.js`, `objectives.js` | `n1-story-milestone-boot.js` | PRDs in `docs/features/` |
| **Clap / hands** | `modules/number1/clap.js`, `hands.js`, `autobuy-burst.js` | `n1-game-loop-wire.js` | `docs/features/Numbers Are Fun (NAF) - Number 1 Clapping feature.md` |
| **VFX / canvas** | `modules/number1/vfx.js`, `tesseract-canvas.js`, `ledger-beam.js` | `n1-black-hole-ui.js` (phase VFX) | — |
| **Dev tools** | `modules/number1/dev-tools.js` | `n1-dev-tools-boot.js` | — |
| **Format / log / tips** | `modules/number1/format.js`, `log.js`, `adaptive-tip-message.js` | — | — |
| **Number 2** | `modules/number2/game.js` | `n2-boot-wiring.js` | `docs/plans/number_2_progression_parity_9353dae6.plan.md` |
| **Orchestrator** | — | `src/game/legacy-boot.js` (deps only) | `docs/plans/legacy_boot_shrink_backlog.md` |
| **Entry** | — | `src/main.ts` (loads data then legacy-boot) | — |
| **Shell / global UI** | `modules/number1/shell-panels.js`, `global-overview-render.js` | `n1-page-panel-boot.js` | `index.html`, `style.css` |

---

## Other `modules/number1/` (misc)

`overview-ascension-panels.js` — ascension hub panels (ties to `ascension` + `shell-ui`)

---

## Changelog

| Date | Plan | Notes |
|------|------|-------|
| 2026-05-18 | naf-cursor-skills | Initial reference seed for Cursor skill pack |
