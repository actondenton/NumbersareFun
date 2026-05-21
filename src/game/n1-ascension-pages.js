/**
 * Ascension hub header HTML (grants summary + stat pills + live DOM patch).
 * Keeps orchestration in legacy-boot; simulation state is read via deps getters only.
 */

/** Finger labels for per-finger respec log lines (shared with legacy respec handlers). */
export const ASCENSION_FINGER_RESPEC_LABELS = {
    index: "Index (velocity)",
    middle: "Middle (combo)",
    ring: "Ring (turbo)",
    pinky: "Pinky (warp)",
    thumb: "Thumb (clap)"
};

/**
 * @param {object} deps
 * @param {() => boolean} deps.getHasAscended
 * @param {() => string[]} deps.getAscensionNodeIds
 * @param {(id: string) => object | undefined} deps.getAscensionNodeById
 * @param {() => import("./n1-ascension.js").AscensionGrantTotals} deps.computeAscensionGrantTotals
 * @param {() => number[]} deps.getNearMissToleranceRanks
 * @param {() => number} deps.getUnlockedHands
 * @param {() => number} deps.getPatternCatalogMultiplier
 * @param {() => number} deps.getAscensionComboPatternMult
 * @param {() => number} deps.getTimeWarpComboMultiplier
 * @param {() => number} deps.getTurboCountMultiplierMax
 * @param {() => number} deps.getTurboMeterMax
 * @param {() => number} deps.getTimeWarpOverflowRatio
 * @param {() => number} deps.getTimeWarpAuraSpawnSpanMaxSec
 * @param {() => number} deps.getMaxCheapenLevel
 * @param {(n: number) => string} deps.formatCount
 * @param {number} deps.BLACK_HOLE_PHASE1_ESSENCE_TARGET
 * @param {() => number} deps.getAscensionEssenceInvestedInNodes
 * @param {() => number} deps.getNumber1AscensionPendingBonusEssence
 * @param {() => number} deps.getNumber1AscensionEssence
 * @param {() => object} deps.getNumber1BlackHoleState
 * @param {() => number} deps.getBlackHolePhase
 * @param {() => boolean} deps.isBlackHoleArcUnlocked
 * @param {() => number} deps.getNumber1BlackHoleProductionMult
 * @param {(m: number) => string} deps.formatBlackHolePhase1CpsMultForUi
 * @param {() => number} deps.getBlackHolePhase1RunCpsMult
 * @param {() => number} deps.getAscensionMapNodeCount
 */
export function createN1AscensionHubHeaderHtmlBoot(deps) {
    function escapeAscensionHtml(t) {
        return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    /** Grants not folded into `computeAscensionGrantTotals` — scan owned nodes for one-way unlock flags. */
    function collectPurchasedAscensionGrantFlags() {
        let autoBuyDefaultOnForNewHands = false;
        let autoBuyAlsoCheapen = false;
        let autoBuyAlsoSlowdown = false;
        let turboScensionUnlock = false;
        let turboScensionUpgradeAutobuy = false;
        const ids = deps.getAscensionNodeIds();
        for (let i = 0; i < ids.length; i++) {
            const def = deps.getAscensionNodeById(ids[i]);
            if (!def || !def.grants) continue;
            const g = def.grants;
            if (g.autoBuyDefaultOnForNewHands === true) autoBuyDefaultOnForNewHands = true;
            if (g.autoBuyAlsoCheapen === true) autoBuyAlsoCheapen = true;
            if (g.autoBuyAlsoSlowdown === true) autoBuyAlsoSlowdown = true;
            if (def.finger === "ring" && g.turboScensionUnlock === true) turboScensionUnlock = true;
            if (def.finger === "ring" && g.turboScensionUpgradeAutobuy === true) turboScensionUpgradeAutobuy = true;
        }
        return {
            autoBuyDefaultOnForNewHands,
            autoBuyAlsoCheapen,
            autoBuyAlsoSlowdown,
            turboScensionUnlock,
            turboScensionUpgradeAutobuy
        };
    }
    /**
     * Full, grouped summary of purchased ascension benefits for the hub header.
     * Uses `computeAscensionGrantTotals()` plus a small set of flags from owned nodes (near-miss, autobuy, turbo-scension unlocks).
     */
    function renderAscensionHubGrantsHtml() {
        if (!deps.getHasAscended()) return "";
        const esc = escapeAscensionHtml;
        const owned = deps.getAscensionNodeIds().length;
        if (!owned) {
            return "<p class=\"asc-hub-grants-empty\">No gems purchased yet. Unlock nodes on the map to see your benefits listed here.</p>";
        }
        const t = deps.computeAscensionGrantTotals();
        const gf = collectPurchasedAscensionGrantFlags();
        const groups = [];
        function push(title, lines) {
            const L = (lines || []).filter(Boolean);
            if (L.length) groups.push({ title, lines: L });
        }
        const economy = [];
        if ((t.cheapenCap || 0) > 0) economy.push("+" + t.cheapenCap + " bonus Cheapen cap tiers (on top of the base 10)");
        if ((t.speedMult || 1) < 0.999) economy.push("Speed upgrade costs " + ((1 - t.speedMult) * 100).toFixed(1) + "% less (index gems stack multiplicatively)");
        if ((t.slowdownCostMult || 1) < 0.999) economy.push("Compaction upgrade costs " + ((1 - t.slowdownCostMult) * 100).toFixed(1) + "% less (index gems stack multiplicatively)");
        if ((t.autoBuyDelayMult || 1) < 0.999) economy.push("Speed (and linked) autobuy countdown runs " + ((1 / t.autoBuyDelayMult)).toFixed(2) + "× faster (\u00d7" + t.autoBuyDelayMult.toFixed(3) + " delay)");
        if ((t.handUnlockStartingCount || 0n) > 0n) {
            try {
                economy.push("Hands first unlocked via milestones start at count " + t.handUnlockStartingCount.toLocaleString("en-US") + " (highest purchased tier wins)");
            } catch (e) {
                economy.push("Hands first unlocked via milestones start at a higher count (highest purchased tier wins)");
            }
        }
        if (gf.autoBuyDefaultOnForNewHands) economy.push("New hands default to Speed autobuy On");
        if (gf.autoBuyAlsoCheapen) economy.push("With Speed autobuy on a hand, Cheapen autobuys on the same cadence");
        if (gf.autoBuyAlsoSlowdown) economy.push("With Speed autobuy on a hand, Compaction autobuys on the same cadence");
        push("Economy, autobuy & hand unlocks", economy);
        const combo = [];
        if ((t.comboMultAdd || 0) > 0.0001) {
            combo.push("Time Warp burst stack from index-finger digit combos: +" + (t.comboMultAdd * 100).toFixed(2) + "% (additive across index nodes; does not multiply tick CPS)");
        }
        if ((t.comboEarnedPatternMult || 1) > 1.001) {
            combo.push("Ascended Combo (middle): \u00d7" + t.comboEarnedPatternMult.toFixed(2) + " to tick CPS and bursts (successive middle ranks compound as \u00d7(1+step); branch cap applies)");
        }
        if ((t.comboDiscoveryMilestoneCooldownMult || 1) < 0.999) {
            combo.push("Combo Catalog discovery milestones: cooldown \u00d7" + t.comboDiscoveryMilestoneCooldownMult.toFixed(3) + " of the default 60s (middle nodes; floor 0.1s)");
        }
        if ((t.turboBoostComboFillAdd || 0) > 0) {
            combo.push("Extra Turbo Boost meter fill from each qualifying combo: +" + t.turboBoostComboFillAdd);
        }
        if ((t.comboTimeWarpDelayReduceSec || 0) > 0.0001) {
            combo.push("Active combos reduce the next Time Warp aura delay by " + String(+t.comboTimeWarpDelayReduceSec.toFixed(3)) + " s in total (middle)");
        }
        if ((t.comboTimeWarpDelayReduceMult || 1) > 1.001) {
            combo.push("Multiplier on the above combo \u2192 Time Warp delay reduction: \u00d7" + t.comboTimeWarpDelayReduceMult.toFixed(2));
        }
        if (t.comboClapExtraRoll) combo.push("Combo Claps: chance for an immediate extra clap on the same pair (middle)");
        if (t.comboClapChainRolls) combo.push("Combo Claps can chain further bonus claps (middle)");
        const nr = deps.getNearMissToleranceRanks();
        if (nr.length) combo.push("Pair-of-n combos count \u201calmost pairs\u201d for digit ranks: " + nr.join(", ") + " (middle near-miss tolerance; up to 5 ranks)");
        push("Combos, catalog & clap synergy", combo);
        const warp = [];
        if ((t.warpOverflow || 0) > 0.0001) warp.push("Time Warp overflow strength +" + (t.warpOverflow * 5).toFixed(0) + "% toward the 90% cap (pinky)");
        if ((t.warpSpawnIntervalMult || 1) < 0.999) warp.push("Time Warp aura spawn span \u00d7" + t.warpSpawnIntervalMult.toFixed(3) + " (lower = faster auras)");
        if ((t.warpManualGrantSeconds || 60) > 60.5) warp.push("Manual Time Warp aura: up to " + Math.round(t.warpManualGrantSeconds) + " s of that hand\u2019s effective rate per click (base 60s without pinky upgrades)");
        if (t.warpAutoBuyAssist) warp.push("Manual aura click, after the warp, also buys every Speed, Cheapen, and Compaction upgrade that hand can afford until none remain");
        if (t.warpFactor36AllHandsOverflow) warp.push("Overflow bursts use \u00be strength but hit every unlocked hand at once");
        if ((t.warpPotencyMaxTiers || 0) >= 1) warp.push("Warp Potency: +" + Math.floor(t.warpPotencyMaxTiers) + " manual-aura potency tiers (idle charge steps)");
        if ((t.warpClickAscensionEssenceChance || 0) > 0.0001) warp.push("Manual aura: +" + (t.warpClickAscensionEssenceChance * 100).toFixed(2) + "% chance per click to bank +1 bonus Essence for your next ascend");
        if ((t.warpOverflowAscensionEssenceChance || 0) > 0.0001) warp.push("Overflow trigger: +" + (t.warpOverflowAscensionEssenceChance * 100).toFixed(2) + "% chance to bank +1 bonus Essence for your next ascend");
        push("Time Warp & overflow", warp);
        const turbo = [];
        if ((t.turboScaling || 0) > 0) turbo.push("Turbo scaling stacks: " + t.turboScaling + " (each +25 meter max and \u00d71.25 Turbo Boost count multiplier cap)");
        if ((t.comboTurboPointsMult || 1) > 1.001) {
            turbo.push("Turbo-scension upgrade points from combos: \u00d7" + t.comboTurboPointsMult.toFixed(2) + " (from ring gems; multiplicative as \u00d7(1+bonus) per node)");
        }
        if (gf.turboScensionUnlock) turbo.push("Turbo-scension unlocked: spend Turbo activations for random Burn / Boost Tank / Boost Multiplier / Meter Fill levels");
        if (gf.turboScensionUpgradeAutobuy) turbo.push("Turbo-scension Upgrade autobuy: spends activations for random levels whenever affordable");
        if ((t.turboScensionActivationCostMult || 1) < 0.999) turbo.push("Turbo-scension Upgrade activation cost \u00d7" + t.turboScensionActivationCostMult.toFixed(3) + " (multiplicative)");
        if ((t.turboBurnEfficiencyReduceSum || 0) > 0.0001) turbo.push("Burn efficiency: total meter drain \u2212" + (t.turboBurnEfficiencyReduceSum * 100).toFixed(0) + "% while Turbo is on (additive across ring nodes, capped)");
        if ((t.turboTankSizeMult || 1) > 1.001) turbo.push("Turbo meter max (tank growth): \u00d7" + t.turboTankSizeMult.toFixed(2));
        if ((t.turboBurnRateMult || 1) > 1.001) turbo.push("Turbo burn rate: \u00d7" + t.turboBurnRateMult.toFixed(2));
        if ((t.turboScensionExtraUpgradeRolls || 0) >= 1) turbo.push("Turbo-scension Upgrade: +" + t.turboScensionExtraUpgradeRolls + " extra random axis roll(s) per purchase (stacks)");
        if (t.turboScensionAllAxesUpgrade) turbo.push("Turbo-scension Upgrade: each activation grants +1 Burn, Tank, Mult, and Fill (no random picks)");
        if (t.turboLeveler) turbo.push("Turbo Leveler: overflow combo fill while Turbo is off can buy random Turbo-scension levels");
        if ((t.turboMeterFromComboMult || 1) > 1.001) turbo.push("Combo \u2192 meter fill while Turbo is on: \u00d7" + t.turboMeterFromComboMult.toFixed(2));
        if ((t.turboMeterDrainMult || 1) < 0.999) turbo.push("Turbo meter drain while on: \u00d7" + t.turboMeterDrainMult.toFixed(3) + " (slower drain)");
        if ((t.turboOffMeterFillMult || 1) > 1.001) turbo.push("Combo \u2192 meter fill while Turbo is off: \u00d7" + t.turboOffMeterFillMult.toFixed(2));
        if ((t.turboPassiveMeterPerSec || 0) > 0.0001) turbo.push("Passive Turbo meter while On (with charge): +" + (+t.turboPassiveMeterPerSec).toFixed(2) + "/s");
        push("Turbo Boost, meter & Turbo-scension", turbo);
        const clap = [];
        if ((t.clapCooldownMult || 1) < 0.999) clap.push("Clap cooldown: \u00d7" + t.clapCooldownMult.toFixed(3) + " (shorter wait)");
        if ((t.clapBonusChanceAdd || 0) > 0.0001) clap.push("Base clap bonus chance: +" + (t.clapBonusChanceAdd * 100).toFixed(2) + "%");
        if ((t.clapCheapenBonusChanceAdd || 0) > 0.0001) clap.push("Clap \u2192 bonus Cheapen tier: +" + (t.clapCheapenBonusChanceAdd * 100).toFixed(2) + "% per roll");
        if ((t.clapSlowdownBonusChanceAdd || 0) > 0.0001) clap.push("Clap \u2192 bonus Compaction tier: +" + (t.clapSlowdownBonusChanceAdd * 100).toFixed(2) + "% per roll");
        if ((t.clapEssenceProcChanceAdd || 0) > 0.0001) clap.push("Clap \u2192 strengthen this run\u2019s Ascension Essence multiplier: +" + (t.clapEssenceProcChanceAdd * 100).toFixed(2) + "% per roll");
        if ((t.clapEssenceMultiplierStepAdd || 0) > 0.0001) clap.push("Each essence clap proc: next ascend Essence \u00d7(1+" + t.clapEssenceMultiplierStepAdd.toFixed(4) + ") extra (resets on ascend)");
        if (t.clapCheapenExtraRoll) clap.push("Cheapen Clap Echo: extra 10% chance for another cheapen-bonus roll on the same hand");
        if (t.clapCheapenChainRolls) clap.push("Cheapen Clap Echo can chain further bonus rolls");
        if (t.clapSlowdownExtraRoll) clap.push("Compaction Clap Echo: extra 10% chance for another compaction-bonus roll on the same hand");
        if (t.clapSlowdownChainRolls) clap.push("Compaction Clap Echo can chain further bonus rolls");
        push("Clap & essence", clap);
        const live = [];
        if (deps.getUnlockedHands() >= 2) {
            const cat = deps.getPatternCatalogMultiplier();
            const pat = deps.getAscensionComboPatternMult();
            live.push("Combo CPS right now (Combo Catalog \u00d7 Ascended Combo): \u00d7" + (cat * pat).toFixed(2) + " (needs 2+ hands)");
            live.push("Time Warp burst combo multiplier (with your stacks): \u00d7" + deps.getTimeWarpComboMultiplier().toFixed(2));
        } else {
            live.push("Unlock a second hand to enable combo CPS and live warp-stack multipliers.");
        }
        live.push("Turbo Boost count multiplier cap (this run): \u00d7" + (Math.round(deps.getTurboCountMultiplierMax() * 100) / 100).toLocaleString("en-US"));
        live.push("Turbo meter max (this run): " + deps.formatCount(deps.getTurboMeterMax()));
        live.push("Time Warp overflow ratio toward cap: " + (deps.getTimeWarpOverflowRatio() * 100).toFixed(0) + "% · max aura spawn span: \u2264" + deps.formatCount(Math.round(deps.getTimeWarpAuraSpawnSpanMaxSec())) + "s");
        live.push("Cheapen level cap (base + gems): " + deps.getMaxCheapenLevel());
        push("How strong you are right now", live);
        if (!groups.length) {
            return "<p class=\"asc-hub-grants-empty\">No aggregate bonuses detected. Hover individual gems on the map for exact effects.</p>";
        }
        return (
            "<div class=\"asc-hub-grants-inner\">" +
            groups.map(function (g) {
                return (
                    "<section class=\"asc-hub-grant-section\" aria-label=\"" + esc(g.title) + "\">" +
                    (g.title ? "<h5 class=\"asc-hub-grant-section-title\">" + esc(g.title) + "</h5>" : "") +
                    "<ul class=\"asc-hub-grant-list\">" +
                    g.lines.map(function (line) { return "<li class=\"asc-hub-grant-item\">" + esc(line) + "</li>"; }).join("") +
                    "</ul></section>"
                );
            }).join("") +
            "</div>"
        );
    }
    /** Compact account / arc row — detailed benefits live in `#ascension-hub-grants`. */
    function renderAscensionHubStatsPillsHtml() {
        if (!deps.getHasAscended()) return "";
        const totalNodes = deps.getAscensionMapNodeCount();
        const ownedCount = deps.getAscensionNodeIds().length;
        const invested = deps.getAscensionEssenceInvestedInNodes();
        const pendingBonusEss = deps.getNumber1AscensionPendingBonusEssence();
        const pendingBonusPill = pendingBonusEss > 0
            ? "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Next bonus</span> <span class=\"asc-stat-pill-v\">+" + deps.formatCount(pendingBonusEss) + " Essence</span></span>"
            : "";
        const bhMultStat = deps.getNumber1BlackHoleProductionMult();
        const bhPhase = deps.getBlackHolePhase();
        const st = deps.getNumber1BlackHoleState();
        const p1Spent = Math.floor(Number(st.phase1EssenceSpent) || 0);
        const bhParallel = Math.max(0, Number(st.phase2ParallelBonusPool) || 0);
        const blackHolePill = (deps.isBlackHoleArcUnlocked() || bhPhase > 0)
            ? (bhPhase === 1
                ? "<span class=\"asc-stat-pill asc-stat-pill--wide asc-stat-pill--mass\"><span class=\"asc-stat-pill-k\">Mass accumulator</span> <span class=\"asc-stat-pill-v\">charge " + p1Spent + " / " + deps.BLACK_HOLE_PHASE1_ESSENCE_TARGET + " · inertial ×" + deps.formatBlackHolePhase1CpsMultForUi(deps.getBlackHolePhase1RunCpsMult()) + "</span></span>"
                : bhPhase === 7
                    ? "<span class=\"asc-stat-pill asc-stat-pill--wide asc-stat-pill--epilogue\"><span class=\"asc-stat-pill-k\">Evaporation</span> <span class=\"asc-stat-pill-v\">P7 · epilogue</span></span>"
                    : "<span class=\"asc-stat-pill asc-stat-pill--wide asc-stat-pill--void\"><span class=\"asc-stat-pill-k\">Black hole</span> <span class=\"asc-stat-pill-v\">P" + bhPhase + " · ×" + (bhMultStat >= 10 ? bhMultStat.toFixed(2) : bhMultStat.toFixed(3)) + " · mass " + Math.floor(Number(st.phase2Mass) || 0) + "</span></span>")
            : "";
        const blackHoleParallelPill = bhParallel > 0
            ? "<span class=\"asc-stat-pill asc-stat-pill--bh-parallel\"><span class=\"asc-stat-pill-k\">Parallel pool</span> <span class=\"asc-stat-pill-v\">+" + (bhParallel * 100).toFixed(1) + "% Essence</span></span>"
            : "";
        return (
            "<span class=\"asc-stat-pill asc-stat-pill--wide\"><span class=\"asc-stat-pill-k\">Gems</span> <span class=\"asc-stat-pill-v\">" + ownedCount + " / " + totalNodes + "</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Spent in tree</span> <span class=\"asc-stat-pill-v\">" + deps.formatCount(invested) + " Essence</span></span>" +
            "<span class=\"asc-stat-pill\"><span class=\"asc-stat-pill-k\">Pool</span> <span class=\"asc-stat-pill-v\">" + deps.formatCount(deps.getNumber1AscensionEssence()) + "</span></span>" +
            pendingBonusPill +
            blackHolePill +
            blackHoleParallelPill
        );
    }
    /** Live-update hub header: compact pills + full grant summary (no map rebuild). */
    function patchAscensionHubStatsPillsDomIfChanged() {
        const statsEl = document.getElementById("ascension-hub-stats");
        const grantsEl = document.getElementById("ascension-hub-grants");
        if (!statsEl && !grantsEl) return;
        if (statsEl) {
            const nextStats = renderAscensionHubStatsPillsHtml();
            if (statsEl.dataset.ascHubPillsSnap !== nextStats) {
                statsEl.dataset.ascHubPillsSnap = nextStats;
                statsEl.innerHTML = nextStats;
            }
        }
        if (grantsEl) {
            const nextGrants = renderAscensionHubGrantsHtml();
            if (grantsEl.dataset.ascHubGrantsSnap !== nextGrants) {
                grantsEl.dataset.ascHubGrantsSnap = nextGrants;
                grantsEl.innerHTML = nextGrants;
            }
        }
    }
    return {
        escapeAscensionHtml,
        collectPurchasedAscensionGrantFlags,
        renderAscensionHubGrantsHtml,
        renderAscensionHubStatsPillsHtml,
        patchAscensionHubStatsPillsDomIfChanged
    };
}

/** Plan alias: ascension hub header HTML + live hub patch (first cut vs full page glue). */
export function createN1AscensionBootUi(deps) {
    return createN1AscensionHubHeaderHtmlBoot(deps);
}

/**
 * Map SVG / pan-zoom delegates — keeps legacy-boot from duplicating `ascMapUi.*` one-liners.
 * @param {object} ascMapApi — e.g. `ascMapUi` from {@link createN1AscensionTreeRuntime}
 */
export function createN1AscensionMapDomDelegates(ascMapApi) {
    return {
        computeAscensionHandLayout: () => ascMapApi.computeAscensionHandLayout(),
        renderAscensionMapColumnGuidesSvg: vbH => ascMapApi.renderAscensionMapColumnGuidesSvg(vbH),
        renderAscensionMapEdgesSvg: layout => ascMapApi.renderAscensionMapEdgesSvg(layout),
        syncAscensionMapNodeDomPositions: () => ascMapApi.syncAscensionMapNodeDomPositions(),
        ascensionResolveNodeIdAtClient: (clientX, clientY) =>
            ascMapApi.ascensionResolveNodeIdAtClient(clientX, clientY),
        updateAscensionMapDetailPanel: () => ascMapApi.updateAscensionMapDetailPanel(),
        setAscensionMapSelectedNode: (id, skipIfSame) => ascMapApi.setAscensionMapSelectedNode(id, skipIfSame),
        teardownAscensionMapPanZoom: () => ascMapApi.teardownAscensionMapPanZoom(),
        initAscensionMapPanZoom: () => ascMapApi.initAscensionMapPanZoom(),
        renderAscensionMapDebugOverlaySvg: () => ascMapApi.renderAscensionMapDebugOverlaySvg()
    };
}

/** Vogel (golden-angle) spiral from disk center; glyphs follow the Fibonacci sequence. */
function renderAccretionDiskSpiralNumeralsHtml() {
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const SCALE_REM = 1.02;
    const RADIAL_EXP = 0.63;
    const DURATION_SEC = 180;
    const MAX_TERMS = 12;
    const fib = [1];
    let prev = 1;
    let cur = 1;
    while (fib.length < MAX_TERMS) {
        const next = prev + cur;
        prev = cur;
        cur = next;
        fib.push(next);
    }
    const n = fib.length;
    const arms = [];
    for (let i = 0; i < n; i++) {
        let dx = 0;
        let dy = 0;
        if (i > 0) {
            const r = SCALE_REM * Math.pow(i, RADIAL_EXP);
            const ang = (i - 1) * GOLDEN_ANGLE;
            dx = r * Math.cos(ang);
            dy = r * Math.sin(ang);
        }
        const fadeDelay = -(i * DURATION_SEC / n);
        const wideClass = fib[i] >= 100 ? " asc-black-hole__disk-number-glyph--wide" : "";
        arms.push(
            "<span class=\"asc-black-hole__disk-spiral-arm\" style=\"--sdx:" +
                dx.toFixed(3) +
                "rem;--sdy:" +
                dy.toFixed(3) +
                "rem;--spiral-anim-delay:" +
                fadeDelay.toFixed(2) +
                "s\">" +
                "<span class=\"asc-black-hole__disk-number\"><span class=\"asc-black-hole__disk-number-glyph" +
                wideClass +
                "\">" +
                fib[i] +
                "</span></span></span>"
        );
    }
    return "<span class=\"asc-black-hole__disk-spiral\" aria-hidden=\"true\">" + arms.join("") + "</span>";
}

/** Inner hero markup for the Number 1 stage accretion disk (pure HTML string). */
export function renderAccretionDiskHeroInnerHtml() {
    return (
        "<span class=\"asc-black-hole__disk-glow\"></span>" +
        "<span class=\"asc-black-hole__disk-band asc-black-hole__disk-band--outer\"></span>" +
        "<span class=\"asc-black-hole__disk-band asc-black-hole__disk-band--inner\"></span>" +
        "<span class=\"asc-black-hole__disk-core\"></span>" +
        renderAccretionDiskSpiralNumeralsHtml()
    );
}

/** One-shot init for `#number1-stage-disk-bg` hero (idempotent via `data-disk-bg-init`). */
export function initNumber1StageAccretionDiskBg() {
    const wrap = document.getElementById("number1-stage-disk-bg");
    if (!wrap || wrap.dataset.diskBgInit === "1") return;
    wrap.dataset.diskBgInit = "1";
    wrap.innerHTML =
        "<div class=\"asc-black-hole__disk-hero number1-stage-disk-hero\" aria-hidden=\"true\">" +
        renderAccretionDiskHeroInnerHtml() +
        "</div>";
}
