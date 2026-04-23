/**
 * Number 1 ascension: digit-5 hand hub, five fingertip branches (data-driven).
 * Loaded before the main inline script; exposes window.ASCENSION_TREE_EXPORT.
 */
(function (global) {
    "use strict";

    var VERSION = 13;

    var ROMAN = [
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
        "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
        "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI"
    ];

    var FINGER_META = {
        index: { route: "velocity", prefix: "asc_ix" },
        middle: { route: "combo", prefix: "asc_md" },
        ring: { route: "turbo", prefix: "asc_rg" },
        pinky: { route: "warp", prefix: "asc_pk" },
        thumb: { route: "clap", prefix: "asc_th" }
    };

    /** Palm / Essence hub — align with HUB_HAND_ART wrist center in 0–100 viewBox space. */
    var HUB_CENTER = { x: 50, y: 51 };
    /** Fingertip targets (same space): rays run hub → tip. Thumb aims top-right to use map space (was bottom-right). */
    var FINGERTIP_TARGETS = {
        pinky: { x: 5, y: 30 },
        ring: { x: 15, y: 15 },
        middle: { x: 33, y: 0 },
        index: { x: 44, y: 10 },
        thumb: { x: 90, y: 10 }
    };
    var LAYOUT_T_START = 0.09;
    var LAYOUT_T_END = 0.93;

    /**
     * Full open-hand ASCII hub (pinky → index + thumb), with wrist "5" labels — used only on the
     * ascension map backdrop (clap VFX still uses the compact digit tile from hands1[4]).
     */
    var HUB_HAND_ART = [
`     _  
   _| |_	
 _| | | |
| | | | |
| | | | |
| | | | |    _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  5  |  
  `, // 5
    ].join("\n");

    function effectFromGrants(g) {
        var parts = [];
        if (g.speedCostMult != null) parts.push("Speed upgrades cost " + ((1 - g.speedCostMult) * 100).toFixed(1) + "% less (multiplicative)");
        if (g.autoBuyDefaultOnForNewHands) parts.push("Hands unlocked after this purchase default to Speed autobuy On");
        if (g.autoBuyAlsoCheapen) parts.push("While Speed autobuy is on for a hand, also autobuy Cheapen there (same cadence as Speed)");
        if (g.autoBuyAlsoSlowdown) parts.push("While Speed autobuy is on for a hand, also autobuy Slowdown there (same cadence as Speed)");
        if (g.cheapenCap != null) parts.push("+" + g.cheapenCap + " max Cheapen level");
        if (g.autoBuyDelayMult != null) parts.push("Speed autobuy delay \u00d7" + g.autoBuyDelayMult.toFixed(3));
        if (g.slowdownCostMult != null) parts.push("Slowdown upgrades cost " + ((1 - g.slowdownCostMult) * 100).toFixed(1) + "% less (multiplicative)");
        if (g.comboMultAdd != null) {
            parts.push("Adds +" + (g.comboMultAdd * 100).toFixed(2) + "% to your overall combo bonus on Number 1");
        }
        if (g.comboRunBonusAddPerTick != null && g.comboRunBonusAddPerTick > 0) {
            parts.push("Increases bonus for this ascension run by +" + (g.comboRunBonusAddPerTick * 100).toFixed(2) + "% each tick while a combo bonus is active; never decreases until you Ascend");
        }
        if (g.comboEarnedPatternMultAdd != null && g.comboEarnedPatternMultAdd > 0) {
            parts.push("Makes discovered patterns on the Combo branch multiply your bonus a bit harder (+" + (g.comboEarnedPatternMultAdd * 100).toFixed(2) + "% this step; compounds across middle ranks as successive ×(1+step) with a branch cap — not as a sum of these %)");
        }
        if (g.comboSustainMaxMultAdd != null && g.comboSustainMaxMultAdd > 0) {
            parts.push("Raises how high your rhythm bonus can climb when you keep the same main combo—about +" + (g.comboSustainMaxMultAdd * 100).toFixed(1) + "% more headroom (stacks with other middle ranks, within a cap)");
        }
        if (g.comboSustainFillPerTick != null && g.comboSustainFillPerTick > 0) {
            parts.push("Your rhythm bonus builds a little faster while your main combo stays the same (+" + (g.comboSustainFillPerTick * 100).toFixed(2) + "% from this rank; stacks with other middle unlocks, within a cap)");
        }
        if (g.comboActivationLogCoeff != null && g.comboActivationLogCoeff > 0) {
            parts.push("Each time a pattern comes back after a short gap, it gently strengthens that pattern’s slice of your bonus; repeats help more but taper off (+" + (g.comboActivationLogCoeff * 100).toFixed(2) + "% to that scaling this step; stacks with other middle ranks, within a cap)");
        }
        if (g.nearMissToleranceRank != null && g.nearMissToleranceRank >= 1 && g.nearMissToleranceRank <= 10) {
            var nn = g.nearMissToleranceRank;
            var nearMissWays = [];
            if (nn < 10) nearMissWays.push(nn + " on one hand and " + (nn + 1) + " on the other");
            if (nn > 1) nearMissWays.push((nn - 1) + " on one hand and " + nn + " on the other");
            parts.push("Pair of " + nn + "s gets easier: besides two " + nn + "s, your first two hands also count if they show " + nearMissWays.join(", or ") + " (only for this pair’s number; you can earn up to five different “almost there” ranks from the Combo branch)");
        }
        if (g.comboTriggerProductionFrac != null) {
            parts.push("When a combo appears fresh, matching hands get a splash of extra count—about " + (g.comboTriggerProductionFrac * 100).toFixed(2) + "% of your total count per second, split across those hands");
        }
        if (g.turboScaling != null) parts.push("+25 turbo meter & \u00d71.25 turbo cap stack");
        if (g.turboTankSizeMultAdd != null && g.turboTankSizeMultAdd > 0) {
            parts.push("Tank Growth: turbo meter max +" + (g.turboTankSizeMultAdd * 100).toFixed(0) + "% (\u00d7" + (1 + g.turboTankSizeMultAdd).toLocaleString("en-US") + "; multiplicative with other ring Tank Growth)");
        }
        if (g.turboScensionUnlock === true) {
            parts.push("Turbo-scension: spend Turbo activations (base 10,000; reduced by some ring nodes) for a random Burn Rate, Boost Tank, Boost Multiplier, or Meter Fill level (each level doubles that stat for this run; Fill doubles combo→meter points and passive sustain meter/sec)");
        }
        if (g.turboScensionActivationCostMult != null && g.turboScensionActivationCostMult > 0 && g.turboScensionActivationCostMult < 1) {
            parts.push("Turbo-scension Upgrade activation cost \u00d7" + g.turboScensionActivationCostMult + " (50% less; stacks multiplicatively with other ring nodes of this type)");
        }
        if (g.turboScensionUpgradeAutobuy === true) {
            parts.push("Turbo-scension Upgrade autobuy: spends activations for random Burn/Tank/Mult/Fill levels automatically whenever you can afford it (no toggle)");
        }
        if (g.turboScensionDoubleUpgrade === true) {
            parts.push("Turbo-scension Upgrade: +1 extra random Burn/Tank/Mult/Fill roll per purchase (same activation cost; each roll is independent; stacks with other nodes of this type)");
        }
        if (g.turboScensionAllAxesUpgrade === true) {
            parts.push("Turbo-scension Upgrade: each activation adds +1 Burn, +1 Tank, +1 Mult, and +1 Fill (no random picks; if you have Upgrade Upgrade!, each extra wave applies the full quadruple again)");
        }
        if (g.turboMeterFromComboMultAdd != null && g.turboMeterFromComboMultAdd > 0) {
            parts.push("Turbo meter from combos +" + (g.turboMeterFromComboMultAdd * 100).toFixed(0) + "% (\u00d7" + (1 + g.turboMeterFromComboMultAdd).toLocaleString("en-US") + " on combo fill; multiplicative with other ring nodes of this type)");
        }
        if (g.turboMeterDrainMult != null && g.turboMeterDrainMult > 0 && g.turboMeterDrainMult < 1) {
            parts.push("Turbo drain \u00d7" + g.turboMeterDrainMult + " (slower meter loss while Turbo is on; multiplicative with other ring nodes of this type)");
        }
        if (g.turboOffMeterFillMultAdd != null && g.turboOffMeterFillMultAdd > 0) {
            parts.push("Turbo meter from combos +" + (g.turboOffMeterFillMultAdd * 100).toFixed(0) + "% extra while Turbo is Off (\u00d7" + (1 + g.turboOffMeterFillMultAdd).toLocaleString("en-US") + "; multiplicative with other ring Off-fill nodes)");
        }
        if (g.turboPassiveMeterPerSec != null && g.turboPassiveMeterPerSec > 0) {
            parts.push("While Turbo is On with meter charge, +" + g.turboPassiveMeterPerSec + " meter per second (flat; stacks additively with other ring nodes of this type)");
        }
        if (g.turboLeveler === true) {
            parts.push("Turbo Leveler: while Turbo is off and the meter is full, combo fill that would overflow pays toward random Burn/Tank/Mult/Fill levels (cost doubles each time; bank spends only while Turbo stays off)");
        }
        if (g.turboBurnEfficiencyReduce != null && g.turboBurnEfficiencyReduce > 0) {
            parts.push("Burn Efficiency: total Turbo meter drain \u2212" + (g.turboBurnEfficiencyReduce * 100).toFixed(0) + "% (additive with other ring Burn Efficiency, max 99%; same multiplier curve, slower drain)");
        }
        if (g.turboBurnRateMultAdd != null && g.turboBurnRateMultAdd > 0) {
            parts.push("Turbo burn rate +" + (g.turboBurnRateMultAdd * 100).toFixed(0) + "% (\u00d7" + (1 + g.turboBurnRateMultAdd).toLocaleString("en-US") + "; multiplicative with other ring burn-rate nodes)");
        }
        if (g.comboTurboPointsMult != null) parts.push("+" + (g.comboTurboPointsMult * 100).toFixed(1) + "% turbo points from combos");
        if (g.turboBoostComboFillAdd != null && g.turboBoostComboFillAdd > 0) {
            parts.push("Increases the turbo boost fill for each combo by " + (g.turboBoostComboFillAdd === 1 ? "1" : String(g.turboBoostComboFillAdd)));
        }
        if (g.warpOverflow != null) parts.push("+" + (g.warpOverflow * 5) + "% Time Warp overflow (toward 90% cap)");
        if (g.warpSpawnIntervalMult != null) parts.push("Time Warp aura spawn span \u00d7" + g.warpSpawnIntervalMult.toFixed(3) + " (min 1s)");
        if (g.warpAutoBuyAssist === true) {
            parts.push("When you manually click a Time Warp aura on a hand, after the normal warp grant that hand also buys every Speed, Cheapen, and Slowdown upgrade it can afford (repeats until nothing left; Slowdown still resets Speed on that hand)");
        }
        if (g.warpManualGrantSeconds != null && Number.isFinite(g.warpManualGrantSeconds) && g.warpManualGrantSeconds >= 60) {
            parts.push("Manual Time Warp burst uses " + g.warpManualGrantSeconds + " seconds of that hand's effective rate at the usual click multiplier (base 60s without this; highest purchased seconds value wins)");
        }
        if (g.warpFactor36AllHandsOverflow === true) {
            parts.push("Time Warp overflow uses \u00be of the usual overflow strength, but when it fires it hits every unlocked hand at once (instead of one random hand)");
        }
        if (g.warpPotencyMaxTiers != null && Number.isFinite(g.warpPotencyMaxTiers) && g.warpPotencyMaxTiers > 0) {
            parts.push("+" + Math.floor(g.warpPotencyMaxTiers) + " Warp Potency tier cap (manual Time Warp auras only): each tier unlocks the next idle charge step\u2014after 10s unclicked the burst is \u00d72; with 2+ total tiers from Pinky, after 100s it is \u00d74; with 3+ total tiers, after 1000s it is \u00d78. Overflow warps unchanged.");
        }
        if (g.warpClickAscensionEssenceChance != null && Number.isFinite(g.warpClickAscensionEssenceChance) && g.warpClickAscensionEssenceChance > 0) {
            parts.push("Manual Time Warp click has +" + (g.warpClickAscensionEssenceChance * 100).toFixed(1) + "% chance to bank +1 bonus Ascension Essence for your next ascend");
        }
        if (g.warpOverflowAscensionEssenceChance != null && Number.isFinite(g.warpOverflowAscensionEssenceChance) && g.warpOverflowAscensionEssenceChance > 0) {
            parts.push("Time Warp overflow trigger has +" + (g.warpOverflowAscensionEssenceChance * 100).toFixed(2) + "% chance to bank +1 bonus Ascension Essence for your next ascend");
        }
        if (g.clapCooldownMult != null) parts.push("Clap cooldown \u00d7" + g.clapCooldownMult.toFixed(3));
        if (g.clapBonusChanceAdd != null) parts.push("+" + (g.clapBonusChanceAdd * 100).toFixed(2) + "% clap bonus chance");
        if (g.clapCheapenBonusChanceAdd != null && g.clapCheapenBonusChanceAdd > 0) {
            parts.push("Each clap roll has +" + (g.clapCheapenBonusChanceAdd * 100).toFixed(2) + "% chance to grant a bonus Cheapen level on that hand (bonus levels do not consume balance)");
        }
        if (g.clapCheapenExtraRoll === true) {
            parts.push("Cheapen Clap Echo: when a cheapen clap bonus procs, 10% chance for an immediate extra bonus roll on that same hand");
        }
        if (g.clapCheapenChainRolls === true) {
            parts.push("Cheapen Clap Echo chain: each cheapen echo roll can continue chaining at 10% per wave");
        }
        if (g.clapSlowdownBonusChanceAdd != null && g.clapSlowdownBonusChanceAdd > 0) {
            parts.push("Each clap roll has +" + (g.clapSlowdownBonusChanceAdd * 100).toFixed(2) + "% chance to grant a bonus Slowdown level on that hand (uses normal slowdown behavior: resets purchased Speed levels only)");
        }
        if (g.clapSlowdownExtraRoll === true) {
            parts.push("Slowdown Clap Echo: when a slowdown clap bonus procs, 10% chance for an immediate extra bonus roll on that same hand");
        }
        if (g.clapSlowdownChainRolls === true) {
            parts.push("Slowdown Clap Echo chain: each slowdown echo roll can continue chaining at 10% per wave");
        }
        if (g.clapEssenceProcChanceAdd != null && g.clapEssenceProcChanceAdd > 0) {
            parts.push("Each clap roll has +" + (g.clapEssenceProcChanceAdd * 100).toFixed(2) + "% chance to strengthen this run's Ascension Essence multiplier");
        }
        if (g.clapEssenceMultiplierStepAdd != null && g.clapEssenceMultiplierStepAdd > 0) {
            parts.push("Each essence clap proc multiplies your next Ascension Essence gain by an extra \u00d7" + (1 + g.clapEssenceMultiplierStepAdd).toFixed(4) + " this run (uncapped; resets after you Ascend)");
        }
        if (g.comboClapExtraRoll === true) {
            parts.push("Combo Claps: 10% chance on each clap that the same pair immediately claps again (bonus speed rolls only; no extra clap cooldown)");
        }
        if (g.comboClapChainRolls === true) {
            parts.push("Combo Claps chain: after each Combo Clap bonus wave, 10% chance for another (repeats while it succeeds; needs the first Combo Claps node)");
        }
        if (g.comboTimeWarpDelayReduceSec != null && g.comboTimeWarpDelayReduceSec > 0) {
            var ctw = g.comboTimeWarpDelayReduceSec;
            parts.push("Combos reduce the next Time Warp delay by " + ctw + " second" + (ctw === 1 ? "" : "s") + ".");
        }
        if (g.comboTimeWarpDelayReduceMult != null && g.comboTimeWarpDelayReduceMult > 1) {
            parts.push("Increase the previous Combo Time Warp nodes by " + g.comboTimeWarpDelayReduceMult + "x!");
        }
        if (g.handUnlockStartingCount != null && g.handUnlockStartingCount !== 0 && g.handUnlockStartingCount !== "0") {
            var huscStr;
            if (typeof g.handUnlockStartingCount === "string" && /^[0-9]+$/.test(g.handUnlockStartingCount)) {
                try {
                    huscStr = BigInt(g.handUnlockStartingCount).toLocaleString("en-US");
                } catch (e1) {
                    huscStr = String(g.handUnlockStartingCount);
                }
            } else {
                var husc = Number(g.handUnlockStartingCount);
                huscStr = (typeof g.handUnlockStartingCount === "number" && isFinite(husc))
                    ? husc.toLocaleString("en-US")
                    : String(g.handUnlockStartingCount);
            }
            parts.push("Milestone-unlocked hands start with " + huscStr + " count (your highest purchased tier of this bonus applies)");
        }
        return parts.length ? parts.join(" \u00b7 ") : "Minor resonance";
    }

    function inferBranchLen(nodes) {
        var m = 0;
        (nodes || []).forEach(function (n) {
            var bi = n.branchIndex;
            if (typeof bi === "number" && !isNaN(bi) && bi + 1 > m) m = bi + 1;
        });
        return m || 1;
    }

    /** Longest-path depth (hub→fingertip) for layoutT after braid + confluence (same each finger). */
    var BRAID_MAX_GRAPH_DEPTH = 21;

    /** Max lateral scale (viewBox) per finger — keeps braids inside the digit corridor. */
    var FINGER_BRAID_LATERAL = {
        index: 1.05,
        middle: 1.25,
        ring: 1.15,
        pinky: 1.3,
        thumb: 0.95
    };

    var BRAID_FINGER_ORDER = ["index", "middle", "ring", "pinky", "thumb"];

    function tierId(prefix, idx) {
        return prefix + "_" + (idx < 10 ? "0" + idx : String(idx));
    }

    /**
     * Idea A: linear 00–11, mirrored arms a12–a15 / b12–b15 (grants from seeds[12]–seeds[19]), confluence m16, tail 20–24.
     * layoutT = depth / BRAID_MAX_GRAPH_DEPTH; lateral = weave or fixed arm offset.
     */
    function buildOneFingerBraided(finger, route, prefix, seeds) {
        var W = FINGER_BRAID_LATERAL[finger] || 1.15;
        var D = BRAID_MAX_GRAPH_DEPTH;
        var nodes = [];
        var bi = 0;

        function push(node, depth, latKind) {
            var lat;
            if (latKind === "A") {
                lat = W * 1.38;
            } else if (latKind === "B") {
                lat = -W * 1.38;
            } else {
                lat = W * Math.sin(depth * 0.62);
            }
            node.branchIndex = bi++;
            node.layoutT = D <= 0 ? 0.5 : Math.max(0, Math.min(1, depth / D));
            node.lateral = lat;
            nodes.push(node);
        }

        function augFromSeed(node, seed) {
            if (seed && seed.title) node.title = seed.title;
            if (seed && seed.effect) node.effect = seed.effect;
            return node;
        }

        var i;
        for (i = 0; i < 12; i++) {
            var s = seeds[i];
            var id = tierId(prefix, i);
            var parents = i === 0 ? [] : [tierId(prefix, i - 1)];
            var lin = {
                id: id,
                finger: finger,
                route: route,
                parents: parents,
                cost: s.cost,
                grants: s.grants || {}
            };
            if (s.title) lin.title = s.title;
            if (s.effect) lin.effect = s.effect;
            push(lin, i, "sin");
        }

        var lastLinear = tierId(prefix, 11);
        var a12 = prefix + "_a12";
        var b12 = prefix + "_b12";
        push(augFromSeed({
            id: a12,
            finger: finger,
            route: route,
            parents: [lastLinear],
            cost: seeds[12].cost,
            grants: seeds[12].grants || {}
        }, seeds[12]), 12, "A");
        push(augFromSeed({
            id: b12,
            finger: finger,
            route: route,
            parents: [lastLinear],
            cost: seeds[16].cost,
            grants: seeds[16].grants || {}
        }, seeds[16]), 12, "B");

        var aPrev = a12;
        var d;
        for (d = 13; d <= 15; d++) {
            var si = d - 1;
            var aid = prefix + "_a" + d;
            push(augFromSeed({
                id: aid,
                finger: finger,
                route: route,
                parents: [aPrev],
                cost: seeds[si].cost,
                grants: seeds[si].grants || {}
            }, seeds[si]), d, "A");
            aPrev = aid;
        }

        var bPrev = b12;
        for (d = 13; d <= 15; d++) {
            var sj = d + 3;
            var bid = prefix + "_b" + d;
            push(augFromSeed({
                id: bid,
                finger: finger,
                route: route,
                parents: [bPrev],
                cost: seeds[sj].cost,
                grants: seeds[sj].grants || {}
            }, seeds[sj]), d, "B");
            bPrev = bid;
        }

        var mergeId = prefix + "_m16";
        push({
            id: mergeId,
            finger: finger,
            route: route,
            parents: [prefix + "_a15", prefix + "_b15"],
            cost: 1,
            grants: {},
            title: "Confluence",
            effect: "Both arms of this branch mastered — paths rejoin toward the fingertip."
        }, 16, "sin");

        for (i = 20; i <= 24; i++) {
            var t = seeds[i];
            var tid = tierId(prefix, i);
            var par = i === 20 ? mergeId : tierId(prefix, i - 1);
            push(augFromSeed({
                id: tid,
                finger: finger,
                route: route,
                parents: [par],
                cost: t.cost,
                grants: t.grants || {}
            }, t), 17 + (i - 20), "sin");
        }

        return nodes;
    }

    /** @param {Object.<string, Array<{cost:number, grants:Object}>>} seedMap one array of 25 tiers per finger (BRAID_FINGER_ORDER). */
    function expandBraidedFromFingerSeeds(seedMap) {
        var out = [];
        BRAID_FINGER_ORDER.forEach(function (finger) {
            var meta = FINGER_META[finger];
            if (!meta) return;
            var seeds = seedMap && seedMap[finger];
            if (!seeds || seeds.length !== 25) {
                if (typeof console !== "undefined" && console.error) {
                    console.error("[ascension-tree-data] finger " + finger + " expected 25 route seeds, got " + (seeds ? seeds.length : 0));
                }
                return;
            }
            out = out.concat(buildOneFingerBraided(finger, meta.route, meta.prefix, seeds));
        });
        return out;
    }

    function finalizeAscensionNodes(rows) {
        return rows.map(function (n) {
            var route = n.route || "";
            var bi = n.branchIndex != null ? n.branchIndex : 0;
            var grants = n.grants || {};
            var title = n.title;
            if (title == null || title === "") {
                title = route.charAt(0).toUpperCase() + route.slice(1) + " " + ROMAN[bi + 1];
            }
            var effect = n.effect != null && n.effect !== "" ? n.effect : effectFromGrants(grants);
            var tags = n.tags;
            if (!tags || !tags.length) {
                tags = [route, n.finger].filter(Boolean);
            }
            var nx = n.x;
            var ny = n.y;
            var hasPos = typeof nx === "number" && typeof ny === "number" && isFinite(nx) && isFinite(ny);
            var layoutT = n.layoutT;
            var lateral = n.lateral;
            var hasLayoutRay = typeof layoutT === "number" && isFinite(layoutT) && n.finger && FINGERTIP_TARGETS[n.finger];
            var out = {
                id: n.id,
                finger: n.finger,
                parents: Array.isArray(n.parents) ? n.parents.slice() : [],
                route: route,
                tags: tags,
                title: title,
                effect: effect,
                cost: n.cost,
                grants: grants,
                branchIndex: bi
            };
            if (hasPos) {
                out.x = nx;
                out.y = ny;
            } else if (hasLayoutRay) {
                var tip = FINGERTIP_TARGETS[n.finger];
                var hubX = HUB_CENTER.x;
                var hubY = HUB_CENTER.y;
                var rdx = tip.x - hubX;
                var rdy = tip.y - hubY;
                var rlen = Math.hypot(rdx, rdy) || 1;
                var px = -rdy / rlen;
                var py = rdx / rlen;
                var u = Math.max(0, Math.min(1, layoutT));
                var t = LAYOUT_T_START + (LAYOUT_T_END - LAYOUT_T_START) * u;
                var bx = hubX + rdx * t;
                var by = hubY + rdy * t;
                var lat = typeof lateral === "number" && isFinite(lateral) ? lateral : 0;
                out.x = bx + px * lat;
                out.y = by + py * lat;
            }
            return out;
        });
    }

    /** ViewBox Y delta for non-thumb fingers (negative = move up on screen). */
    var LAYOUT_NON_THUMB_Y_SHIFT = -5;
    /** Minimum Euclidean distance between any two nodes on the same finger (viewBox units). ~5+ reads as non-overlapping 32px pins at typical map scale. */
    var LAYOUT_MIN_NODE_GAP = 4.85;
    var LAYOUT_SEPARATION_ITERS = 28;
    /** Min Euclidean distance between nodes on different fingers (viewBox); avoids palm-cluster overlap. */
    var LAYOUT_CROSS_FINGER_MIN_GAP = 3.75;
    var LAYOUT_CROSS_FINGER_ITERS = 16;

    /**
     * Post-finalize: shift non-thumb routes up; then nudge same-finger pairs apart if closer than LAYOUT_MIN_NODE_GAP
     * (small iterative pushes along the segment between nodes — keeps branch shapes, uses free vertical space).
     */
    function refineAscensionLayoutPositions(nodes) {
        if (!nodes || !nodes.length) return;
        var i;
        for (i = 0; i < nodes.length; i++) {
            var nn = nodes[i];
            if (nn.finger !== "thumb" && typeof nn.x === "number" && typeof nn.y === "number" &&
                    isFinite(nn.x) && isFinite(nn.y)) {
                nn.y += LAYOUT_NON_THUMB_Y_SHIFT;
            }
        }
        var byFinger = {};
        nodes.forEach(function (n) {
            if (!byFinger[n.finger]) byFinger[n.finger] = [];
            byFinger[n.finger].push(n);
        });
        var fingerKeys = Object.keys(byFinger);
        var iter;
        for (iter = 0; iter < LAYOUT_SEPARATION_ITERS; iter++) {
            var moved = false;
            fingerKeys.forEach(function (finger) {
                var list = byFinger[finger];
                var a;
                var b;
                for (a = 0; a < list.length; a++) {
                    for (b = a + 1; b < list.length; b++) {
                        var na = list[a];
                        var nb = list[b];
                        if (typeof na.x !== "number" || typeof na.y !== "number" ||
                                !isFinite(na.x) || !isFinite(na.y)) continue;
                        if (typeof nb.x !== "number" || typeof nb.y !== "number" ||
                                !isFinite(nb.x) || !isFinite(nb.y)) continue;
                        var dx = nb.x - na.x;
                        var dy = nb.y - na.y;
                        var dist = Math.hypot(dx, dy);
                        if (dist >= LAYOUT_MIN_NODE_GAP || dist < 1e-9) continue;
                        var push = (LAYOUT_MIN_NODE_GAP - dist) * 0.5 * 0.9;
                        var ux = dx / dist;
                        var uy = dy / dist;
                        na.x -= ux * push;
                        na.y -= uy * push;
                        nb.x += ux * push;
                        nb.y += uy * push;
                        moved = true;
                    }
                }
            });
            if (!moved) break;
        }
    }

    /**
     * After same-finger separation: nudge different-finger pairs apart if still closer than LAYOUT_CROSS_FINGER_MIN_GAP
     * (index/middle rays can otherwise land nearly on top of each other near the hub).
     */
    function refineCrossFingerLayoutPositions(nodes) {
        if (!nodes || !nodes.length) return;
        var n = nodes.length;
        var iter;
        for (iter = 0; iter < LAYOUT_CROSS_FINGER_ITERS; iter++) {
            var moved = false;
            var i;
            var j;
            for (i = 0; i < n; i++) {
                var na = nodes[i];
                if (typeof na.x !== "number" || typeof na.y !== "number" || !isFinite(na.x) || !isFinite(na.y)) continue;
                for (j = i + 1; j < n; j++) {
                    var nb = nodes[j];
                    if (na.finger === nb.finger) continue;
                    if (typeof nb.x !== "number" || typeof nb.y !== "number" || !isFinite(nb.x) || !isFinite(nb.y)) continue;
                    var dx = nb.x - na.x;
                    var dy = nb.y - na.y;
                    var dist = Math.hypot(dx, dy);
                    if (dist >= LAYOUT_CROSS_FINGER_MIN_GAP || dist < 1e-9) continue;
                    var push = (LAYOUT_CROSS_FINGER_MIN_GAP - dist) * 0.5 * 0.85;
                    var ux = dx / dist;
                    var uy = dy / dist;
                    na.x -= ux * push;
                    na.y -= uy * push;
                    nb.x += ux * push;
                    nb.y += uy * push;
                    moved = true;
                }
            }
            if (!moved) break;
        }
    }

    /**
     * Route seeds for Idea A (25 tiers per finger: cost + grants only). Graph topology and x,y come from
     * expandBraidedFromFingerSeeds, finalizeAscensionNodes, and refine — not from this table.
     */
    var ASCENSION_ROUTE_SEEDS = {
        index: [
            { cost: 5, grants: { speedCostMult: 0.99, autoBuyDefaultOnForNewHands: true } },
            { cost: 5, grants: { cheapenCap: 1, handUnlockStartingCount: 1000 } },
            { cost: 6, grants: { autoBuyDelayMult: 0.386, handUnlockStartingCount: 10000 } },
            { cost: 6, grants: { slowdownCostMult: 0.94, handUnlockStartingCount: 100000 } },
            { cost: 7, grants: { speedCostMult: 0.99, handUnlockStartingCount: 1000000 } },
            { cost: 8, grants: { cheapenCap: 1, handUnlockStartingCount: 10000000, autoBuyAlsoCheapen: true } },
            { cost: 9, grants: { autoBuyDelayMult: 0.386 } },
            { cost: 9, grants: { slowdownCostMult: 0.94 } },
            { cost: 11, grants: { speedCostMult: 0.99 } },
            { cost: 12, grants: { cheapenCap: 1, handUnlockStartingCount: 1000000000 } },
            { cost: 13, grants: { autoBuyDelayMult: 0.386, autoBuyAlsoSlowdown: true } },
            { cost: 14, grants: { slowdownCostMult: 0.94 } },
            { cost: 16, grants: { speedCostMult: 0.99 } },
            { cost: 18, grants: { cheapenCap: 1, handUnlockStartingCount: 1000000000000 } },
            { cost: 19, grants: { autoBuyDelayMult: 0.386 } },
            { cost: 22, grants: { slowdownCostMult: 0.94 } },
            { cost: 24, grants: { speedCostMult: 0.99 } },
            { cost: 26, grants: { cheapenCap: 1, handUnlockStartingCount: 1000000000000000 } },
            { cost: 29, grants: { autoBuyDelayMult: 0.386 } },
            { cost: 32, grants: { slowdownCostMult: 0.94 } },
            { cost: 36, grants: { speedCostMult: 0.99 } },
            { cost: 39, grants: { cheapenCap: 1, handUnlockStartingCount: "1000000000000000000" } },
            { cost: 44, grants: { autoBuyDelayMult: 0.386, handUnlockStartingCount: "1000000000000000000000" } },
            { cost: 48, grants: { slowdownCostMult: 0.94, handUnlockStartingCount: "1000000000000000000000000" } },
            { cost: 53, grants: { speedCostMult: 0.99, handUnlockStartingCount: "1000000000000000000000000000" } },
        ],
        middle: [
            { cost: 5, grants: { comboSustainMaxMultAdd: 0.08, comboTriggerProductionFrac: 0.008, comboActivationLogCoeff: 0.016 } },
            { cost: 5, grants: { comboMultAdd: 0.015 } },
            { cost: 6, grants: { comboRunBonusAddPerTick: 0.001 } },
            { cost: 6, grants: { comboEarnedPatternMultAdd: 0.46, nearMissToleranceRank: 2, comboSustainFillPerTick: 0.006 } },
            { cost: 7, grants: { turboBoostComboFillAdd: 1 }, title: "Combo Fill Boost" },
            { cost: 8, grants: { comboTimeWarpDelayReduceSec: 0.25 } },
            { cost: 9, grants: { comboTimeWarpDelayReduceSec: 0.25 } },
            { cost: 9, grants: { comboMultAdd: 0.015, turboBoostComboFillAdd: 1 } },
            { cost: 11, grants: { comboSustainMaxMultAdd: 0.08, comboTriggerProductionFrac: 0.008, comboActivationLogCoeff: 0.016 } },
            { cost: 12, grants: { comboEarnedPatternMultAdd: 0.46, nearMissToleranceRank: 4, comboSustainFillPerTick: 0.006 } },
            { cost: 13, grants: { comboRunBonusAddPerTick: 0.001, turboBoostComboFillAdd: 1 } },
            { cost: 14, grants: { comboTimeWarpDelayReduceSec: 0.25 } },
            { cost: 16, grants: { comboTimeWarpDelayReduceSec: 0.25 } },
            { cost: 18, grants: { comboTimeWarpDelayReduceSec: 1 } },
            { cost: 19, grants: { comboSustainMaxMultAdd: 0.08, comboTriggerProductionFrac: 0.008, comboActivationLogCoeff: 0.016 } },
            { cost: 22, grants: { comboEarnedPatternMultAdd: 0.46, nearMissToleranceRank: 6, comboSustainFillPerTick: 0.006 } },
            { cost: 24, grants: { comboMultAdd: 0.015 } },
            { cost: 26, grants: { comboTimeWarpDelayReduceMult: 3 } },
            { cost: 29, grants: { comboRunBonusAddPerTick: 0.001 } },
            { cost: 32, grants: { comboClapExtraRoll: true }, title: "Combo Clap" },
            { cost: 36, grants: { comboEarnedPatternMultAdd: 0.46, nearMissToleranceRank: 8 } },
            { cost: 39, grants: { comboSustainMaxMultAdd: 0.08, comboTriggerProductionFrac: 0.008, comboActivationLogCoeff: 0.016 } },
            { cost: 44, grants: { comboMultAdd: 0.015 } },
            { cost: 48, grants: { comboClapChainRolls: true }, title: "Combo Chain Clap" },
            { cost: 53, grants: { comboEarnedPatternMultAdd: 0.46, nearMissToleranceRank: 10 } },
        ],
        ring: [
            { cost: 7, grants: { turboScensionUnlock: true }, title: "Turbo-scension" },
            { cost: 7, grants: { turboScensionActivationCostMult: 0.5 } },
            { cost: 8, grants: { turboScensionActivationCostMult: 0.5 } },
            { cost: 9, grants: { turboScaling: 3 } },
            { cost: 10, grants: { turboBurnEfficiencyReduce: 0.25 } },
            { cost: 11, grants: { comboTurboPointsMult: 0.25 } },
            { cost: 12, grants: { turboLeveler: true }, title: "Turbo Leveler" },
            { cost: 13, grants: { turboTankSizeMultAdd: 10 }, title: "Tank Growth" },
            { cost: 15, grants: { turboScaling: 3 } },
            { cost: 17, grants: {turboBurnEfficiencyReduce: 0.25} },
            { cost: 18, grants: { comboTurboPointsMult: 0.25 } },
            { cost: 20, grants: {turboBurnEfficiencyReduce: 0.24} },
            { cost: 22, grants: { turboBurnRateMultAdd: 1 }, title: "Burn baby Burn" },
            { cost: 25, grants: { turboScensionDoubleUpgrade: true }, title: "Upgrade Upgrade!" },
            { cost: 27, grants: { turboScaling: 3 } },
            { cost: 30, grants: {turboBurnEfficiencyReduce: 0.25} },
            { cost: 34, grants: { comboTurboPointsMult: 1.25 } },
            { cost: 37, grants: { turboMeterFromComboMultAdd: 0.28 }, title: "Reservoir I" },
            { cost: 41, grants: { turboMeterFromComboMultAdd: 0.24 }, title: "Reservoir II" },
            { cost: 45, grants: { turboMeterDrainMult: 0.91 }, title: "Slow Burn I" },
            { cost: 50, grants: { turboScaling: 4 } },
            { cost: 55, grants: { turboMeterDrainMult: 0.91 }, title: "Slow Burn II" },
            { cost: 61, grants: { turboOffMeterFillMultAdd: 0.55, turboPassiveMeterPerSec: 5 }, title: "Steady State" },
            { cost: 68, grants: { comboTurboPointsMult: 10, turboScensionAllAxesUpgrade: true }, title: "Turbo-scension Upgrade All"},
            { cost: 75, grants: { turboScensionUpgradeAutobuy: true }, title: "Turbo-scension Upgrade Autobuy"},
        ],
        pinky: [
            { cost: 6, grants: { warpOverflow: 3 } },
            { cost: 6, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 7, grants: { warpAutoBuyAssist: true }, title: "Warp auto buy assist" },
            { cost: 8, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 8, grants: { warpManualGrantSeconds: 90 }, title: "Warp Factor 9" },
            { cost: 9, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 10, grants: { warpOverflow: 3 } },
            { cost: 11, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 13, grants: { warpPotencyMaxTiers: 1 }, title: "Warp Potency" },
            { cost: 14, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 16, grants: { warpPotencyMaxTiers: 1 }, title: "Warp Potency — Surge" },
            { cost: 17, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 19, grants: { warpClickAscensionEssenceChance: 0.05 }, title: "Essence Echo (Warp Click)" },
            { cost: 21, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 23, grants: { warpPotencyMaxTiers: 1 }, title: "Warp Potency — Surge Dos" },
            { cost: 26, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 29, grants: { warpOverflow: 3 } },
            { cost: 32, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 35, grants: { warpOverflowAscensionEssenceChance: 0.005 }, title: "Essence Drift (Overflow)" },
            { cost: 39, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 43, grants: { warpClickAscensionEssenceChance: 0.05 }, title: "Essence Echo II (Warp Click)" },
            { cost: 47, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 52, grants: { warpOverflowAscensionEssenceChance: 0.005 }, title: "Essence Drift II (Overflow)" },
            { cost: 58, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 64, grants: { warpFactor36AllHandsOverflow: true }, title: "Warp Factor 36" },
        ],
        thumb: [
            { cost: 5, grants: { clapCheapenBonusChanceAdd: 0.01 }, title: "Cheapen Clap I" },
            { cost: 5, grants: { clapBonusChanceAdd: 0.012 } },
            { cost: 6, grants: { clapCooldownMult: 0.97 } },
            { cost: 6, grants: { clapEssenceProcChanceAdd: 0.007, clapEssenceMultiplierStepAdd: 0.0012 }, title: "Essence Echo I" },
            { cost: 7, grants: { clapCheapenBonusChanceAdd: 0.006 }, title: "Cheapen Clap II" },
            { cost: 8, grants: { clapBonusChanceAdd: 0.012 } },
            { cost: 9, grants: { clapSlowdownBonusChanceAdd: 0.004 }, title: "Slowdown Clap I" },
            { cost: 9, grants: { clapCheapenExtraRoll: true }, title: "Cheapen Echo" },
            { cost: 11, grants: { clapEssenceProcChanceAdd: 0.007, clapEssenceMultiplierStepAdd: 0.0012 }, title: "Essence Echo II" },
            { cost: 12, grants: { clapBonusChanceAdd: 0.012 } },
            { cost: 13, grants: { clapCooldownMult: 0.97 } },
            { cost: 14, grants: { clapSlowdownBonusChanceAdd: 0.004 }, title: "Slowdown Clap II" },
            { cost: 16, grants: { clapCheapenBonusChanceAdd: 0.007 }, title: "Cheapen Clap III" },
            { cost: 18, grants: { clapCheapenChainRolls: true }, title: "Cheapen Echo Chain" },
            { cost: 19, grants: { clapEssenceProcChanceAdd: 0.008, clapEssenceMultiplierStepAdd: 0.0014 }, title: "Essence Echo III" },
            { cost: 22, grants: { clapSlowdownExtraRoll: true }, title: "Slowdown Echo" },
            { cost: 24, grants: { clapCooldownMult: 0.97 } },
            { cost: 26, grants: { clapBonusChanceAdd: 0.012 } },
            { cost: 29, grants: { clapSlowdownBonusChanceAdd: 0.005 }, title: "Slowdown Clap III" },
            { cost: 32, grants: { clapEssenceProcChanceAdd: 0.01, clapEssenceMultiplierStepAdd: 0.0018 }, title: "Essence Echo IV" },
            { cost: 36, grants: { clapCheapenBonusChanceAdd: 0.008 }, title: "Cheapen Clap IV" },
            { cost: 39, grants: { clapSlowdownChainRolls: true }, title: "Slowdown Echo Chain" },
            { cost: 44, grants: { clapEssenceProcChanceAdd: 0.012, clapEssenceMultiplierStepAdd: 0.0024 }, title: "Essence Surge I" },
            { cost: 48, grants: { clapBonusChanceAdd: 0.012, clapCooldownMult: 0.96 } },
            { cost: 53, grants: { clapCheapenBonusChanceAdd: 0.01, clapSlowdownBonusChanceAdd: 0.006, clapEssenceProcChanceAdd: 0.014, clapEssenceMultiplierStepAdd: 0.003 }, title: "Essence Surge II" },
        ],
    };

    var ASCENSION_NODES = expandBraidedFromFingerSeeds(ASCENSION_ROUTE_SEEDS);

    var NODES = finalizeAscensionNodes(ASCENSION_NODES);
    refineAscensionLayoutPositions(NODES);
    refineCrossFingerLayoutPositions(NODES);
    var BRANCH_LEN = inferBranchLen(NODES);


    function validateAscensionGraph(nodes) {
        var errors = [];
        var byId = {};
        (nodes || []).forEach(function (n) {
            if (!n || typeof n.id !== "string") {
                errors.push("node missing id");
                return;
            }
            if (byId[n.id]) errors.push("duplicate id: " + n.id);
            byId[n.id] = n;
        });
        (nodes || []).forEach(function (n) {
            if (!n) return;
            var ps = n.parents;
            if (!Array.isArray(ps)) {
                errors.push(n.id + ": parents must be array");
                return;
            }
            if (ps.length > 3) errors.push(n.id + ": more than 3 parents");
            ps.forEach(function (p) {
                if (p === n.id) errors.push(n.id + ": self parent");
                if (!byId[p]) errors.push(n.id + ": missing parent " + p);
                else if (byId[p].finger !== n.finger) errors.push(n.id + ": cross-finger parent " + p + " (v1 disallowed)");
            });
        });
        var visiting = {};
        var visited = {};
        function dfs(u) {
            if (visiting[u]) {
                errors.push("cycle involving " + u);
                return;
            }
            if (visited[u]) return;
            visiting[u] = true;
            var node = byId[u];
            if (node && node.parents) node.parents.forEach(dfs);
            visiting[u] = false;
            visited[u] = true;
        }
        Object.keys(byId).forEach(dfs);
        return errors;
    }

    function computeAscensionHandLayout(nodes, opts) {
        var o = opts || {};
        var hubX = o.hubX != null ? o.hubX : HUB_CENTER.x;
        var hubY = o.hubY != null ? o.hubY : HUB_CENTER.y;
        var t0 = o.tStart != null ? o.tStart : LAYOUT_T_START;
        var t1 = o.tEnd != null ? o.tEnd : LAYOUT_T_END;
        var tips = o.fingertips || FINGERTIP_TARGETS;
        var byFinger = {};
        (nodes || []).forEach(function (n) {
            if (!byFinger[n.finger]) byFinger[n.finger] = [];
            byFinger[n.finger].push(n);
        });
        var L = {};
        Object.keys(byFinger).forEach(function (finger) {
            var list = byFinger[finger].slice().sort(function (a, b) {
                return (a.branchIndex || 0) - (b.branchIndex || 0);
            });
            var tip = tips[finger];
            var dx = 0;
            var dy = 0;
            if (tip) {
                dx = tip.x - hubX;
                dy = tip.y - hubY;
            }
            var denom = Math.max(1, list.length - 1);
            list.forEach(function (node, i) {
                var nx = node.x;
                var ny = node.y;
                if (typeof nx === "number" && typeof ny === "number" &&
                        isFinite(nx) && isFinite(ny)) {
                    L[node.id] = { x: nx, y: ny };
                } else if (tip) {
                    var u = denom === 0 ? 0.5 : i / denom;
                    var t = t0 + (t1 - t0) * u;
                    L[node.id] = {
                        x: hubX + dx * t,
                        y: hubY + dy * t
                    };
                } else {
                    L[node.id] = { x: hubX, y: hubY };
                }
            });
        });
        return L;
    }

    var ANCHORS = {};
    Object.keys(FINGER_META).forEach(function (finger) {
        ANCHORS[finger] = {
            hub: HUB_CENTER,
            fingertip: FINGERTIP_TARGETS[finger] || HUB_CENTER,
            tStart: LAYOUT_T_START,
            tEnd: LAYOUT_T_END
        };
    });

    var validationErrors = validateAscensionGraph(NODES);
    if (typeof console !== "undefined" && console.warn && validationErrors.length) {
        console.warn("[ascension-tree-data] validateAscensionGraph:", validationErrors);
    }

    global.ASCENSION_TREE_EXPORT = {
        VERSION: VERSION,
        BRANCH_LEN: BRANCH_LEN,
        ASCENSION_NODES: ASCENSION_NODES,
        NODES: NODES,
        ANCHORS: ANCHORS,
        FINGER_META: FINGER_META,
        HUB_HAND_ART: HUB_HAND_ART,
        HUB_CENTER: HUB_CENTER,
        FINGERTIP_TARGETS: FINGERTIP_TARGETS,
        LAYOUT_T_START: LAYOUT_T_START,
        LAYOUT_T_END: LAYOUT_T_END,
        validateAscensionGraph: validateAscensionGraph,
        computeAscensionHandLayout: computeAscensionHandLayout
    };
})(typeof window !== "undefined" ? window : globalThis);
