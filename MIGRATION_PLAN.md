# Migration Plan: File Structure Reorganization

## Baseline Metrics
- **Files in src/game/**: 113
- **Tests passing**: 182/182
- **Build status**: Successful
- **Backup tag**: pre-refactor
- **Branch**: refactor/file-structure

## Naming Convention Decision
**Chosen**: `number1/`, `number2/`, `ascension/`, `black-hole/`, etc.
**Rationale**: More descriptive than `n1-*` prefixes, clearer module boundaries

## File Grouping by Subsystem

### Number 1 Core (8 files → 1 module)
**Target**: `src/game/modules/number1/core.js`
**Files to merge**:
- n1-game-loop.js (12KB)
- n1-game-loop-step-deps.js (592B)
- n1-tick-apply-step.js (2KB)
- n1-save.js (8KB)
- n1-state-apply.js (10KB)
- n1-format.js (3KB)
- n1-detached-cps-progress.js (781B)
- n1-rate.js (535B)

**Tests to merge**:
- n1-game-loop.test.ts
- n1-game-loop-step-deps.test.ts
- n1-tick-apply-step.test.ts
- n1-save.test.ts
- n1-state-apply.test.ts
- n1-format.test.ts
- n1-detached-cps-progress.test.ts
- n1-rate.test.ts

### Number 1 Hands (3 files → 1 module)
**Target**: `src/game/modules/number1/hands.js`
**Files to merge**:
- n1-hands.js (1KB)
- n1-hand-counter.js (1KB)
- n1-hand-ascii.js (1KB)

**Tests to merge**:
- n1-hands.test.ts
- n1-hand-counter.test.ts

### Number 1 Clap (2 files → 1 module)
**Target**: `src/game/modules/number1/clap.js`
**Files to merge**:
- n1-clap.js (2KB)
- n1-clap-tick.js (13KB)

**Tests to merge**:
- n1-clap.test.ts
- n1-clap-tick.test.ts

### Number 1 Combo (9 files → 1 module)
**Target**: `src/game/modules/number1/combo.js`
**Files to merge**:
- n1-combos.js (11KB)
- n1-combo-ui.js (3KB)
- n1-combo-hand-status-ui.js (2KB)
- n1-combo-feedback-ui.js (8KB)
- n1-combinations-panel-ui.js (6KB)
- n1-combinations-panel-refresh.js (3KB)
- n1-combo-discovery-ui-loop.js (4KB)
- n1-combo-discovery-milestone-ui.js (2KB)
- n1-combo-near-miss-access.js (414B)

**Tests to merge**:
- n1-combos.test.ts
- n1-combo-ui.test.ts
- n1-combo-hand-status-ui.test.ts
- n1-combo-feedback-ui.test.ts
- n1-combinations-panel-ui.test.ts
- n1-combinations-panel-refresh.test.ts
- n1-combo-discovery-ui-loop.test.ts
- n1-combo-discovery-milestone-ui.test.ts
- n1-combo-near-miss-access.test.ts

### Number 1 Ascension (6 files → 1 module)
**Target**: `src/game/modules/number1/ascension.js`
**Files to merge**:
- n1-ascension.js (3KB)
- n1-ascension-perform.js (2KB)
- n1-ascension-flow-ui.js (5KB)
- n1-ascension-map-ui.js (23KB)
- n1-ascension-page-shell.js (1KB)
- n1-overview-ascension-panels.js (10KB)

**Tests to merge**:
- n1-ascension.test.ts
- n1-ascension-perform.test.ts
- n1-ascension-flow-ui.test.ts
- n1-ascension-page-shell.test.ts
- n1-overview-ascension-panels.test.ts

### Number 1 Black Hole (4 files → 1 module)
**Target**: `src/game/modules/number1/black-hole.js`
**Files to merge**:
- n1-black-hole-boot.js (8KB)
- n1-black-hole-controller.js (59KB) - KEEP SEPARATE due to size
- n1-black-hole-ui.js (24KB)
- number1-black-hole.js (22KB)

**Decision**: Keep `n1-black-hole-controller.js` separate (59KB), merge others into `black-hole.js`

**Tests to merge**:
- n1-black-hole-boot.test.ts
- number1-black-hole.test.ts

### Number 1 Time Warp (3 files → 1 module)
**Target**: `src/game/modules/number1/time-warp.js`
**Files to merge**:
- n1-time-warp.js (2KB)
- n1-time-warp-boot.js (17KB)
- n1-adaptive-tip-message.js (1KB)

**Tests to merge**:
- n1-time-warp.test.ts
- n1-time-warp-boot.test.ts
- n1-adaptive-tip-message.test.ts

### Number 1 Turbo (4 files → 1 module)
**Target**: `src/game/modules/number1/turbo.js`
**Files to merge**:
- n1-turbo.js (5KB)
- n1-turbo-boot.js (2KB)
- n1-turbo-game-loop-step.js (2KB)
- n1-cheapen-boot.js (11KB)

**Tests to merge**:
- n1-turbo.test.ts
- n1-turbo-boot.test.ts
- n1-turbo-game-loop-step.test.ts

### Number 1 Upgrades (3 files → 1 module)
**Target**: `src/game/modules/number1/upgrades.js`
**Files to merge**:
- n1-upgrades.js (3KB)
- n1-upgrade-ui-controller.js (32KB) - KEEP SEPARATE due to size
- n1-upgrade-eta.js (3KB)
- n1-speed-upgrade-boot.js (4KB)
- n1-slowdown-boot.js (11KB)

**Decision**: Keep `n1-upgrade-ui-controller.js` separate (32KB), merge others

**Tests to merge**:
- n1-upgrades.test.ts
- n1-upgrade-eta.test.ts
- n1-speed-upgrade-boot.test.ts

### Number 1 Story & Objectives (4 files → 1 module)
**Target**: `src/game/modules/number1/story.js`
**Files to merge**:
- n1-story.js (3KB)
- n1-story-banner-boot.js (5KB)
- n1-objectives.js (1KB)
- n1-objectives-boot.js (445B)

**Tests to merge**:
- n1-story.test.ts
- n1-story-banner-boot.test.ts
- n1-objectives.test.ts
- n1-objectives-boot.test.ts

### Number 1 UI/Rendering (5 files → 1 module)
**Target**: `src/game/modules/number1/ui.js`
**Files to merge**:
- n1-global-overview-render.js (6KB)
- n1-rate-display-ui.js (12KB)
- n1-top-count-row-fit.js (5KB)
- n1-shell-panels.js (4KB)
- n1-dev-tools.js (10KB)

**Tests to merge**:
- n1-global-overview-render.test.ts
- n1-rate-display-ui.test.ts
- n1-top-count-row-fit.test.ts
- n1-dev-tools.test.ts

### Number 1 VFX (2 files → 1 module)
**Target**: `src/game/modules/number1/vfx.js`
**Files to merge**:
- n1-vfx.js (3KB)
- n1-ledger-beam.js (24KB)

**Tests to merge**:
- n1-vfx.test.ts

### Number 1 Log (2 files → 1 module)
**Target**: `src/game/modules/number1/log.js`
**Files to merge**:
- n1-log.js (3KB)
- n1-log-ticker-runtime.js (21KB)

**Tests to merge**:
- n1-log.test.ts

### Number 2 (2 files → 1 module)
**Target**: `src/game/modules/number2/game.js`
**Files to merge**:
- number2-game.js (39KB)
- number2-rules.js (2KB)
- number2-upgrades.js (3KB)

**Tests to merge**:
- number2-game.test.ts

### Phase 1 Tesseract (1 file → keep separate)
**Target**: `src/game/modules/phase1/tesseract.js`
**Files to keep**:
- phase1-tesseract-canvas.js (15KB)

**Tests to keep**:
- phase1-tesseract-canvas.test.ts

### Shell (3 files → move to src/shell/)
**Target**: `src/shell/` (already there)
**Files**:
- curtain.ts (1KB)
- curtain.test.ts (513B)
- mode-switch.ts (1KB)

**No changes needed** - already in correct location

### Legacy Boot (1 file → keep in src/game/)
**Target**: `src/game/legacy-boot.js`
**Files to keep**:
- legacy-boot.js (299KB)

**Decision**: Keep as-is, it's the main bootstrap file. May refactor later.

## File Count Summary

**Before**: 113 files in src/game/
**After**: ~35 files in src/game/modules/

Reduction: ~68% reduction in file count

## Directory Structure

```
src/game/
├── modules/
│   ├── number1/
│   │   ├── core.js
│   │   ├── core.test.ts
│   │   ├── hands.js
│   │   ├── hands.test.ts
│   │   ├── clap.js
│   │   ├── clap.test.ts
│   │   ├── combo.js
│   │   ├── combo.test.ts
│   │   ├── ascension.js
│   │   ├── ascension.test.ts
│   │   ├── black-hole.js
│   │   ├── black-hole-controller.js (separate)
│   │   ├── black-hole.test.ts
│   │   ├── time-warp.js
│   │   ├── time-warp.test.ts
│   │   ├── turbo.js
│   │   ├── turbo.test.ts
│   │   ├── upgrades.js
│   │   ├── upgrade-ui-controller.js (separate)
│   │   ├── upgrades.test.ts
│   │   ├── story.js
│   │   ├── story.test.ts
│   │   ├── ui.js
│   │   ├── ui.test.ts
│   │   ├── vfx.js
│   │   ├── vfx.test.ts
│   │   └── log.js
│   │       └── log.test.ts
│   ├── number2/
│   │   ├── game.js
│   │   └── game.test.ts
│   └── phase1/
│       ├── tesseract.js
│       └── tesseract.test.ts
├── legacy-boot.js
└── NUMBER_MODULE_BOUNDARIES.md
```

## Import Path Updates Required

### legacy-boot.js
Update all imports from:
- `./n1-*.js` → `./modules/number1/*.js`
- `./number2-*.js` → `./modules/number2/*.js`
- `./phase1-*.js` → `./modules/phase1/*.js`

### Test files
Update all imports to match new structure

### index.html
Update script tags if any reference specific files

## Risk Assessment

**High Risk**:
- legacy-boot.js has 60+ imports - high chance of breaking
- Large file merges may introduce bugs

**Mitigation**:
- Update imports systematically
- Test after each module merge
- Keep legacy-boot.js for last

**Low Risk**:
- File movements (data, scripts, docs)
- Test file consolidation

## Execution Order

1. Create directory structure
2. Move data files, scripts, docs
3. Merge and move Number 1 modules (one at a time)
4. Merge and move Number 2 module
5. Update legacy-boot.js imports
6. Update all test imports
7. CSS splitting
8. Cleanup
9. Verification
