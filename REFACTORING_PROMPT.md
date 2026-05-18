# Refactoring Prompt: NumbersareFun File Structure Reorganization

## Context
The NumbersareFun project has been over-modularized with 113 files in `src/game/`, many of which are tiny single-purpose modules. While testing practices are excellent (every file has a corresponding test), the granularity creates unnecessary cognitive overhead and makes navigation difficult.

## Objectives
1. Consolidate related functionality into logical modules
2. Standardize naming conventions
3. Organize data files and scripts properly
4. Reduce file count while maintaining test coverage
5. Improve project navigability

## Pre-Refactoring Checklist

- [ ] Backup entire project (including node_modules if needed)
- [ ] Verify all tests currently pass
- [ ] Verify game currently runs without errors
- [ ] Document current bundle size and load time
- [ ] Check CI/CD pipeline status
- [ ] Notify all team members of upcoming refactoring
- [ ] Identify rollback point (commit hash or tag)
- [ ] Review .github/workflows/ for any hardcoded paths

**Timing Assessment:**
- Team is not under deadline pressure ✓
- No known bugs to fix first ✓
- No major features in development that conflict ✓
→ **This is a good time to proceed with refactoring**

## Phase 0: Preparation (Do First)

1. **Create feature branch**
   ```bash
   git checkout -b refactor/file-structure
   ```

2. **Establish baseline**
   - Run full test suite: `npm test` (document pass rate)
   - Build project: `npm run build` (document bundle size)
   - Document current file count: `find src/game -type f | wc -l`
   - Create backup tag: `git tag pre-refactor`

3. **Review unaccounted directories**
   - Check `src/shell/` contents (3 items) - determine placement in new structure
   - Check `Test_files/` contents - should this move to `tests/`?
   - Check `public/` contents - may need reorganization
   - Check `dist/` - clean before refactoring

4. **Install dependency analysis tools**
   ```bash
   npm install --save-dev madge dependency-cruiser
   ```

## Phase 1: Analysis & Planning

1. **Map current file relationships**
   - Run dependency visualization: `npx madge --image deps.svg src/game/`
   - Identify which `n1-*` files belong to which subsystems (clap, combo, ascension, etc.)
   - Document dependencies between files using dependency graph
   - Identify files that can be safely merged based on functional cohesion
   - Check `legacy-boot.js` usage: `grep -r "legacy-boot" . --exclude-dir=node_modules`

2. **Choose naming convention**
   - Decide between: `number1/`, `number2/`, `ascension/`, etc. OR keep `n1-*` but organize in subdirectories
   - Apply consistently across all modules

3. **Create migration plan**
   - List all files to be moved/merged
   - Identify any import statements that need updating
   - Note any HTML references that need updating
   - Document any hardcoded file paths in game logic (save files, localStorage keys)

## Phase 2: Directory Structure Creation

Create the following directory structure:

```
NumbersareFun/
├── src/
│   ├── game/
│   │   ├── modules/
│   │   │   ├── number1/
│   │   │   ├── number2/
│   │   │   ├── ascension/
│   │   │   └── black-hole/
│   │   ├── ui/
│   │   ├── core/
│   │   └── utils/
│   ├── styles/
│   │   ├── global.css
│   │   ├── components/
│   │   └── modules/
│   └── main.ts
├── data/
│   └── ascension/
├── scripts/
│   └── ascension/
├── tests/
│   └── unit/
├── docs/
│   ├── features/
│   └── plans/
└── public/
```

## Phase 3: File Consolidation Rules

### Merge Criteria (Functional, Not Size-Based)
Merge files into single modules when:
- Files share the same functional domain (e.g., all clap-related functionality)
- Files are always imported together (check dependency graph)
- Files have circular dependencies with each other
- Files represent different aspects of a single cohesive feature
- Test files can be consolidated into one test file per module

**Do NOT merge based solely on file size** - use functional cohesion as the primary criterion.

### Example Merges
- **Clap system**: Merge `n1-clap.js`, `n1-clap-tick.js`, `n1-clap-tick.test.ts` → `modules/number1/clap-system.js` + `clap-system.test.ts`
- **Combo system**: Merge all `n1-combo-*.js` files → `modules/number1/combo-system.js` + test
- **Rate system**: Merge `n1-rate.js`, `n1-rate-tick-boot.js`, `n1-rate-display-ui.js` → `modules/number1/rate-system.js` + test

### Keep Separate
- Files > 10KB with distinct responsibilities (e.g., `n1-black-hole-controller.js` = 59KB)
- UI components that are reused across modules
- Core game loop and save system
- Files that are lazy-loaded or code-split for performance reasons
- Consult with original developer or git history if uncertain about merge decisions

## Phase 4: File Movement

### Move Data Files
```
FROM root level:
- _ascension_nodes_array.txt → data/ascension/
- _ascension_route_seeds.txt → data/ascension/
- ascension-tree-data.js → data/ascension/
- ascension-tree.design.json → data/ascension/
- ascension2-tree-data.js → data/ascension/
```

### Move Scripts
```
FROM root level:
- _gen_ascension_nodes.py → scripts/ascension/
- _gen_ascension_nodes.ps1 → scripts/ascension/
- _refresh_ascension_array.ps1 → scripts/ascension/
- _splice_ascension.ps1 → scripts/ascension/
```

### Move Documentation
```
FROM root level:
- BLACK_HOLE_PLAN.md → docs/features/
- Numbers Are Fun (NAF) - Number 1 Clapping feature.md → docs/features/
- Numbers Are Fun (NAF) – basic game loop.md → docs/features/
- Numbers Are Fun (NAF) – basic game loopnumber 1 module.md → docs/features/
- PRD - Number 1 Ascension Skill Trees.md → docs/features/
- near-miss-combo.spec.md → docs/features/
- plans/legacy_boot_shrink_backlog.md → docs/plans/
- plans/number_2_progression_parity_9353dae6.plan.md → docs/plans/
```

### Move Tests
```
FROM src/game/:
- All *.test.ts files → tests/unit/ (mirror the new src structure)
```

## Phase 5: CSS Splitting

**Methodology for identifying component-specific styles:**
1. Use Chrome DevTools Coverage tool to identify unused CSS rules
2. Use browser DevTools to identify which CSS rules affect which UI elements
3. Test CSS split by temporarily commenting out sections and checking for visual breakage
4. Consider using PurgeCSS or similar tool to identify component-specific styles

Split `style.css` (252KB) into:
```
src/styles/
├── global.css           # Base styles, reset, variables, shared utilities
├── components/
│   ├── buttons.css
│   ├── panels.css
│   ├── modals.css
│   ├── forms.css
│   └── ...
└── modules/
    ├── number1.css
    ├── number2.css
    ├── ascension.css
    └── black-hole.css
```

Update `index.html` to import all CSS files in correct order (global first, then components, then modules).

## Phase 6: Import Path Updates

**Automated update process:**
1. Use IDE refactoring tools or automated find/replace with regex
2. Search for all import patterns: `grep -r "from.*n1-" src/` and `grep -r "require.*n1-" src/`
3. Update ES6 imports, CommonJS requires, and dynamic imports
4. Update script tags in `index.html`
5. Update path references in configuration files

**Configuration updates needed:**
- `vite.config.ts` - update path aliases or resolve configuration
- `tsconfig.json` - update path mappings if using module aliases
- `vitest.config.ts` - update test path configurations
- `package.json` - update any script path references

**Runtime considerations:**
- Check for hardcoded file paths in game logic (save files, localStorage keys)
- Verify asset loading (images, fonts) still works with new paths
- Check for any dynamic imports that may have broken

## Phase 7: Cleanup

- Remove empty directories: `src/numbers/`, `src/vendor/`, `scripts/` (if still empty after moves)
- Remove `legacy-boot.js` ONLY if verified unused in Phase 1 (do not remove if still referenced)
- Update `NUMBER_MODULE_BOUNDARIES.md` to reflect new structure
- Update any README or documentation that references old paths
- Clean `dist/` directory: `rm -rf dist/` then rebuild
- Determine placement for `src/shell/` contents (3 items) based on their purpose
- Move or consolidate `Test_files/` contents into `tests/` if appropriate

## Phase 8: Verification

1. **Run all tests** to ensure nothing broke: `npm test`
2. **Build the project** to verify no import errors: `npm run build`
3. **Check bundle size** - compare to baseline to ensure no significant regression
4. **Run the game** to ensure functionality is preserved
5. **Check browser console** for any missing file references or 404 errors
6. **Verify save/load functionality** works with existing save files
7. **Check asset loading** - verify images, fonts, and other assets load correctly
8. **Performance test** - check load time and frame rate haven't degraded
9. **Review dependency graph** - ensure no circular dependencies were introduced
10. **Test hot-reload** during development if applicable

## Post-Refactoring Tasks

1. **Merge to main** after team review and approval
2. **Deploy to staging** (if applicable) for additional testing
3. **Monitor for issues** for 1-2 weeks after merge
4. **Update team documentation** (CONTRIBUTING.md, onboarding docs)
5. **Archive old structure documentation** for reference
6. **Create migration guide** for other developers adapting to new structure
7. **Update CHANGELOG** with structural changes
8. **Delete pre-refactor tag** after successful deployment (optional)

## Success Criteria

- File count in `src/game/` reduced from 113 to ~30-40
- All tests still pass
- Game runs without errors
- Clear, consistent naming convention applied
- Data files properly organized in `data/`
- Scripts properly organized in `scripts/`
- Documentation consolidated in `docs/`
- CSS split into manageable, logical files

## Important Notes

- **Preserve test coverage**: Every merged module should have comprehensive tests
- **Don't break the game**: Test after each major move/merge
- **Commit frequently**: Create git commits after each phase for easy rollback
- **Update documentation**: Keep docs in sync with structure changes
- **Communicate changes**: If other devs are working on this, coordinate with them
- **Create migration guide**: Document the changes for other developers
- **Update onboarding docs**: Ensure new developers understand the new structure
- **Performance consideration**: Current granularity may have been intentional for code splitting - verify before merging
- **Domain knowledge**: If uncertain about merge decisions, consult git history or original developer
- **Rollback strategy**: If commits are pushed, use `git revert` instead of just branch switching

## Questions to Answer Before Starting

1. Is `legacy-boot.js` actually used? If so, what does it does? (Check in Phase 1)
2. Are there any external tools or scripts that reference specific file paths?
3. What naming convention do you prefer: `number1/` or `n1-*` in subdirectories?
4. Are there any files that should NOT be moved/merged for specific reasons?
5. What's in `src/shell/` and where should it go in the new structure?
6. What's in `Test_files/` and should it be integrated into `tests/`?
7. Are there any lazy-loaded modules that should remain separate for performance?
8. Who else is working on this codebase that needs to be notified of the changes?

## Additional Technical Considerations

**Save Game Compatibility**
- This is a game - verify existing save files work after refactoring
- Test: Load an existing save file, play for 5 minutes, save again, reload
- If save format changes, consider migration logic

**CI/CD Pipeline Impact**
- Review `.github/workflows/` for hardcoded file paths
- Update any build scripts that reference old structure
- Test CI pipeline on feature branch before merging

**Asset Bundling Strategy**
- Review `vite.config.ts` build.rollupOptions configuration
- May need to update entry points for new structure
- Check if dynamic imports need path updates

**TypeScript Path Mappings**
- Review `tsconfig.json` for path aliases
- Consider adding new aliases for cleaner imports (e.g., `@/game/modules/*`)
- Update if needed

**Environment-Specific Configs**
- Check for `.env`, `.env.local`, environment-specific configs
- Ensure all environments work after refactoring

## Approach Options

**Option A: Big Bang (Current Plan)**
- Refactor entire structure at once
- Pros: Clean break, consistent structure throughout
- Cons: Higher risk, harder to debug if issues arise
- Estimated time: 2-3 days

**Option B: Gradual Module-by-Module**
- Refactor one module at a time (e.g., start with number1, then number2)
- Pros: Lower risk, test incrementally, easier to rollback
- Cons: Mixed structure during transition, longer overall timeline
- Estimated time: 1-2 weeks

**Recommendation:** Given no deadline pressure and no bugs, Option A is acceptable. If you prefer lower risk, choose Option B.

## Rollback Procedures

**If tests fail during refactoring:**
- Minor failures: Fix immediately, continue
- Major failures (>20% test failure): Rollback to last commit, investigate
- Critical failures (game won't build/run): Rollback immediately

**Rollback commands:**
```bash
# Rollback to last known good state
git reset --hard <commit-hash>
# Or revert specific commits if already pushed
git revert <commit-hash>
```

**If circular dependencies discovered:**
- If mergeable: Merge the circular files
- If not mergeable: Consider dependency injection or architectural refactoring
- Document as technical debt if can't resolve immediately

**If CSS splitting breaks visual appearance:**
- Keep problematic CSS in global.css
- Consider CSS modules or CSS-in-JS as alternative
- Test each CSS split incrementally

## Communication Protocol

**Team notification template:**
```
Subject: Upcoming File Structure Refactoring

What: Reorganizing src/game/ from 113 files to ~30-40 modules
Why: Improve navigability and reduce cognitive overhead
When: Starting [date], estimated completion [date]
Impact: No functional changes, only file structure changes
Action needed: Please avoid merging to main during this period
Questions: Contact [person]
```

## Time Estimates

- Phase 0 (Preparation): 2-3 hours
- Phase 1 (Analysis): 3-4 hours
- Phase 2-4 (Structure & Movement): 1 day
- Phase 5 (CSS Splitting): 0.5-1 day
- Phase 6 (Import Updates): 0.5 day
- Phase 7 (Cleanup): 0.5 day
- Phase 8 (Verification): 0.5 day
- **Total: 2-3 days** (Option A) or **1-2 weeks** (Option B gradual)
