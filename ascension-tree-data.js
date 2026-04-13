/**
 * Number 1 ascension: digit-5 hand hub, five fingertip branches (data-driven).
 * Loaded before the main inline script; exposes window.ASCENSION_TREE_EXPORT.
 */
(function (global) {
    "use strict";

    var VERSION = 3;

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
        if (g.comboEarnedPatternMultAdd != null && g.comboEarnedPatternMultAdd > 0) {
            parts.push("Makes discovered patterns on the Combo branch multiply your bonus a bit harder (+" + (g.comboEarnedPatternMultAdd * 100).toFixed(2) + "% this step; stacks with other middle ranks, with a ceiling for the whole branch)");
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
        if (g.comboTurboPointsMult != null) parts.push("+" + (g.comboTurboPointsMult * 100).toFixed(1) + "% turbo points from combos");
        if (g.warpOverflow != null) parts.push("+" + (g.warpOverflow * 5) + "% Time Warp overflow (toward 90% cap)");
        if (g.warpSpawnIntervalMult != null) parts.push("Time Warp aura spawn span \u00d7" + g.warpSpawnIntervalMult.toFixed(3) + " (min 1s)");
        if (g.clapCooldownMult != null) parts.push("Clap cooldown \u00d7" + g.clapCooldownMult.toFixed(3));
        if (g.clapBonusChanceAdd != null) parts.push("+" + (g.clapBonusChanceAdd * 100).toFixed(2) + "% clap bonus chance");
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

        var i;
        for (i = 0; i < 12; i++) {
            var s = seeds[i];
            var id = tierId(prefix, i);
            var parents = i === 0 ? [] : [tierId(prefix, i - 1)];
            push({
                id: id,
                finger: finger,
                route: route,
                parents: parents,
                cost: s.cost,
                grants: s.grants || {}
            }, i, "sin");
        }

        var lastLinear = tierId(prefix, 11);
        var a12 = prefix + "_a12";
        var b12 = prefix + "_b12";
        push({
            id: a12,
            finger: finger,
            route: route,
            parents: [lastLinear],
            cost: seeds[12].cost,
            grants: seeds[12].grants || {}
        }, 12, "A");
        push({
            id: b12,
            finger: finger,
            route: route,
            parents: [lastLinear],
            cost: seeds[16].cost,
            grants: seeds[16].grants || {}
        }, 12, "B");

        var aPrev = a12;
        var d;
        for (d = 13; d <= 15; d++) {
            var si = d - 1;
            var aid = prefix + "_a" + d;
            push({
                id: aid,
                finger: finger,
                route: route,
                parents: [aPrev],
                cost: seeds[si].cost,
                grants: seeds[si].grants || {}
            }, d, "A");
            aPrev = aid;
        }

        var bPrev = b12;
        for (d = 13; d <= 15; d++) {
            var sj = d + 3;
            var bid = prefix + "_b" + d;
            push({
                id: bid,
                finger: finger,
                route: route,
                parents: [bPrev],
                cost: seeds[sj].cost,
                grants: seeds[sj].grants || {}
            }, d, "B");
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
            push({
                id: tid,
                finger: finger,
                route: route,
                parents: [par],
                cost: t.cost,
                grants: t.grants || {}
            }, 17 + (i - 20), "sin");
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
    /** Minimum Euclidean distance between any two nodes on the same finger (viewBox units). */
    var LAYOUT_MIN_NODE_GAP = 1.5;
    var LAYOUT_SEPARATION_ITERS = 16;
    /** Min Euclidean distance between nodes on different fingers (viewBox); avoids palm-cluster overlap. */
    var LAYOUT_CROSS_FINGER_MIN_GAP = 2.05;
    var LAYOUT_CROSS_FINGER_ITERS = 10;

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
            { cost: 5, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.015, comboSustainFillPerTick: 0.002 } },
            { cost: 5, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.020333, comboActivationLogCoeff: 0.008 } },
            { cost: 6, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.025667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 6, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.031, comboSustainFillPerTick: 0.002 } },
            { cost: 7, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.036333, nearMissToleranceRank: 2, comboActivationLogCoeff: 0.008 } },
            { cost: 8, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.041667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 9, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.047, comboSustainFillPerTick: 0.002 } },
            { cost: 9, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.052333, comboActivationLogCoeff: 0.008 } },
            { cost: 11, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.057667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 12, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.063, nearMissToleranceRank: 4, comboSustainFillPerTick: 0.002 } },
            { cost: 13, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.068333, comboActivationLogCoeff: 0.008 } },
            { cost: 14, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.073667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 16, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.079, comboSustainFillPerTick: 0.002 } },
            { cost: 18, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.084333, nearMissToleranceRank: 6, comboActivationLogCoeff: 0.008 } },
            { cost: 19, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.089667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 22, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.095, comboSustainFillPerTick: 0.002 } },
            { cost: 24, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.100333, comboActivationLogCoeff: 0.008 } },
            { cost: 26, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.105667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 29, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.111, nearMissToleranceRank: 8, comboSustainFillPerTick: 0.002 } },
            { cost: 32, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.116333, comboActivationLogCoeff: 0.008 } },
            { cost: 36, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.121667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 39, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.127, comboSustainFillPerTick: 0.002 } },
            { cost: 44, grants: { comboTriggerProductionFrac: 0.004, comboEarnedPatternMultAdd: 0.132333, comboActivationLogCoeff: 0.008 } },
            { cost: 48, grants: { comboMultAdd: 0.003, comboEarnedPatternMultAdd: 0.137667, comboSustainMaxMultAdd: 0.04 } },
            { cost: 53, grants: { comboMultAdd: 0.004, comboEarnedPatternMultAdd: 0.143, nearMissToleranceRank: 10, comboSustainFillPerTick: 0.002 } },
        ],
        ring: [
            { cost: 7, grants: { turboScaling: 1 } },
            { cost: 7, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 8, grants: { turboScaling: 1 } },
            { cost: 9, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 10, grants: { turboScaling: 1 } },
            { cost: 11, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 12, grants: { turboScaling: 1 } },
            { cost: 13, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 15, grants: { turboScaling: 1 } },
            { cost: 17, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 18, grants: { turboScaling: 1 } },
            { cost: 20, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 22, grants: { turboScaling: 1 } },
            { cost: 25, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 27, grants: { turboScaling: 1 } },
            { cost: 30, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 34, grants: { turboScaling: 1 } },
            { cost: 37, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 41, grants: { turboScaling: 1 } },
            { cost: 45, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 50, grants: { turboScaling: 1 } },
            { cost: 55, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 61, grants: { turboScaling: 1 } },
            { cost: 68, grants: { comboTurboPointsMult: 0.07 } },
            { cost: 75, grants: { turboScaling: 1 } },
        ],
        pinky: [
            { cost: 6, grants: { warpOverflow: 1 } },
            { cost: 6, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 7, grants: { warpOverflow: 1 } },
            { cost: 8, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 8, grants: { warpOverflow: 1 } },
            { cost: 9, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 10, grants: { warpOverflow: 1 } },
            { cost: 11, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 13, grants: { warpOverflow: 1 } },
            { cost: 14, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 16, grants: { warpOverflow: 1 } },
            { cost: 17, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 19, grants: { warpOverflow: 1 } },
            { cost: 21, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 23, grants: { warpOverflow: 1 } },
            { cost: 26, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 29, grants: { warpOverflow: 1 } },
            { cost: 32, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 35, grants: { warpOverflow: 1 } },
            { cost: 39, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 43, grants: { warpOverflow: 1 } },
            { cost: 47, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 52, grants: { warpOverflow: 1 } },
            { cost: 58, grants: { warpSpawnIntervalMult: 0.965 } },
            { cost: 64, grants: { warpOverflow: 1 } },
        ],
        thumb: [
            { cost: 5, grants: { clapCooldownMult: 0.987 } },
            { cost: 5, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 6, grants: { clapCooldownMult: 0.987 } },
            { cost: 6, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 7, grants: { clapCooldownMult: 0.987 } },
            { cost: 8, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 9, grants: { clapCooldownMult: 0.987 } },
            { cost: 9, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 11, grants: { clapCooldownMult: 0.987 } },
            { cost: 12, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 13, grants: { clapCooldownMult: 0.987 } },
            { cost: 14, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 16, grants: { clapCooldownMult: 0.987 } },
            { cost: 18, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 19, grants: { clapCooldownMult: 0.987 } },
            { cost: 22, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 24, grants: { clapCooldownMult: 0.987 } },
            { cost: 26, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 29, grants: { clapCooldownMult: 0.987 } },
            { cost: 32, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 36, grants: { clapCooldownMult: 0.987 } },
            { cost: 39, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 44, grants: { clapCooldownMult: 0.987 } },
            { cost: 48, grants: { clapBonusChanceAdd: 0.006 } },
            { cost: 53, grants: { clapCooldownMult: 0.987 } },
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
