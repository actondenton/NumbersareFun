# Number Module Boundaries

This game should keep each number's simulation isolated. Number modules may coordinate through the shell, but they should not read or mutate each other's progression state.

## Ownership

- `n1-*` files own Number 1 rules, save helpers, visual effects, and engine helpers.
- `number2-*` files own Number 2 state, rules, controller behavior, and save shape.
- Future `n3-*` files should follow the same pattern: own their state and expose a small controller API.
- Shell code owns mode selection, curtain transitions, shared chrome, global settings, and combined save envelopes.

## Allowed Dependencies

- A number module may import its own `nX-*` files and narrow shared shell helpers.
- A number controller may receive callbacks such as `addToLog`, `autosaveNow`, `getCurrentNumberMode`, or DOM refs from the shell/bootstrap layer.
- A number save module may expose namespaced state for the shell to aggregate.

## Disallowed Dependencies

- `n1-*` must not import Number 2 simulation modules or mutate Number 2 state.
- `number2-*` must not import Number 1 simulation modules or mutate Number 1 state.
- Feature modules should not become shared god modules for multiple number rules.
- Dynamic imports must stay behind mode switches or curtain transitions, never inside the 50ms tick path.

## Performance Rules

- Keep per-tick helpers allocation-light and free of `await`.
- Preserve batching and throttling for autobuy, upgrade DOM refreshes, logs, and VFX.
- Prefer pure helpers for formulas and DTO normalization; keep DOM wiring in bootstrap or injected VFX/UI modules.
- If a hot loop moves modules, move a cohesive block and verify build, tests, and manual smoke paths.

## Manual Smoke Checklist

- Number 1: tick production, hand unlocks, Speed/Cheapen/Compaction purchases, autosave/load.
- Combo path: discover a combo, catalog milestone, Turbo meter fill, clap bonus if unlocked.
- Turbo path: unlock, toggle on/off, drain, Turbo-scension purchase/autobuy if available.
- Time Warp path: aura spawn/click, overflow, auto-buy assist.
- Mode switch: N1 to N2 and back, including curtain transition and no leaked simulation state.
