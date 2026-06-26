# `src/game` layout

N1 gameplay boots via [`index.js`](index.js) → [`number1/n1-boot.js`](number1/n1-boot.js) → [`number1/n1-boot-body.js`](number1/n1-boot-body.js). Shared save helpers live at the game root: [`n1-save.js`](n1-save.js), [`n1-state-apply.js`](n1-state-apply.js).

## Migration status

| Phase | Status |
|-------|--------|
| 0–13 | done |
| 13b | done (BH glue drain) |
| 14a–c | done (`n1-combinations-boot.js`) |
| 15a–c | done (ascension / BH / shell render modules) |
| 16a–c | done (upgrades, autobuy, timewarp stores) |
| 17 | done (`n1-hands-store.js` + load-orchestration) |
| 18a–c | done (combo, story, objectives stores) |
| 19 | done (persist + load-orchestration tail) |
| 20 | done (session store + shell registry deps) |
| 21a–c | done (`boot-number1.js` deleted; body remains to shrink) |

**Remaining work (post-21c):** drain [`n1-boot-body.js`](number1/n1-boot-body.js) toward domain `*-boot.js` modules so new wiring does not require editing a ~2.7k-line file.

## Line counts (migration gates)

| File | Lines | Target |
|------|------:|--------|
| `number1/n1-boot-body.js` | **~2693** | shrink incrementally (was `boot-number1.js`) |
| `number1/n1-boot.js` | **~262** | 200–400 orchestration spine |

Update this table after every sub-phase PR. Full plan: `.cursor/plans/file_restructure_scaffold_cfe479e0.plan.md`

## Structure

```
src/game/
  index.js                    # shell entry: autosave + exports gameShell
  shell-autosave.js           # autosave interval + beforeunload
  shell-registry.js           # NUMBER_MODULES registry assembly
  core/number-module-interface.js
  n1-save.js, n1-state-apply.js
  number1/
    n1-boot.js                # orchestration spine (wire* delegates)
    n1-boot-body.js           # sequential boot wiring (drain target)
    n1-module-definition.js
    state/, shell-ui/, black-hole/, combos/, ascension/, upgrades/
    loop/, hands/, story/, objectives/, dev/
  number2/
```

## Adding features

- New **logic** → domain module under `number1/<domain>/`
- New **wiring** → domain `*-boot.js`, called from `n1-boot-body.js` (or spine `wire*` in `n1-boot.js`)
- **Do not** add business logic to `n1-boot-body.js`, `n1-boot.js`, or `index.js`
