/**
 * Number 1 ascension: digit-5 hand hub, five fingertip branches (data-driven).
 * Loaded before the main inline script; exposes window.ASCENSION_TREE_EXPORT.
 */
(function (global) {
    "use strict";

    var VERSION = 2;

    var ROMAN = [
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
        "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
        "XXI", "XXII", "XXIII", "XXIV", "XXV"
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
    /** Fingertip targets (same space): rays run hub → tip so branches follow the ASCII hand. */
    var FINGERTIP_TARGETS = {
        pinky: { x: 5, y: 30 },
        ring: { x: 15, y: 15 },
        middle: { x: 33, y: 0 },
        index: { x: 44, y: 10 },
        thumb: { x: 85, y: 80 }
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
        if (g.cheapenCap != null) parts.push("+" + g.cheapenCap + " max Cheapen level");
        if (g.autoBuyDelayMult != null) parts.push("Speed autobuy delay \u00d7" + g.autoBuyDelayMult.toFixed(3));
        if (g.slowdownCostMult != null) parts.push("Slowdown upgrades cost " + ((1 - g.slowdownCostMult) * 100).toFixed(1) + "% less (multiplicative)");
        if (g.comboMultAdd != null) parts.push("+" + (g.comboMultAdd * 100).toFixed(2) + "% combo multiplier");
        if (g.comboTriggerProductionFrac != null) parts.push("+" + (g.comboTriggerProductionFrac * 100).toFixed(2) + "% of 1s global CPS on combo pulse (split)");
        if (g.turboScaling != null) parts.push("+25 turbo meter & \u00d71.25 turbo cap stack");
        if (g.comboTurboPointsMult != null) parts.push("+" + (g.comboTurboPointsMult * 100).toFixed(1) + "% turbo points from combos");
        if (g.warpOverflow != null) parts.push("+" + (g.warpOverflow * 5) + "% Time Warp overflow (toward 90% cap)");
        if (g.warpSpawnIntervalMult != null) parts.push("Time Warp aura spawn span \u00d7" + g.warpSpawnIntervalMult.toFixed(3) + " (min 1s)");
        if (g.clapCooldownMult != null) parts.push("Clap cooldown \u00d7" + g.clapCooldownMult.toFixed(3));
        if (g.clapBonusChanceAdd != null) parts.push("+" + (g.clapBonusChanceAdd * 100).toFixed(2) + "% clap bonus chance");
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
            return {
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
        });
    }

    /**
     * Human-editable ascension nodes. Each row needs: id, finger, parents, route, cost, branchIndex, grants.
     * Optional: title, effect, tags (derived from route / effectFromGrants when omitted).
     */

    var ASCENSION_NODES = [
        { id: 'asc_ix_00', finger: 'index', parents: [], route: 'velocity', cost: 5, branchIndex: 0, grants: { speedCostMult: 0.99 } },
        { id: 'asc_ix_01', finger: 'index', parents: ['asc_ix_00'], route: 'velocity', cost: 5, branchIndex: 1, grants: { cheapenCap: 1 } },
        { id: 'asc_ix_02', finger: 'index', parents: ['asc_ix_01'], route: 'velocity', cost: 6, branchIndex: 2, grants: { autoBuyDelayMult: 0.97 } },
        { id: 'asc_ix_03', finger: 'index', parents: ['asc_ix_02'], route: 'velocity', cost: 6, branchIndex: 3, grants: { slowdownCostMult: 0.94 } },
        { id: 'asc_ix_04', finger: 'index', parents: ['asc_ix_03'], route: 'velocity', cost: 7, branchIndex: 4, grants: { speedCostMult: 0.99 } },
        { id: 'asc_ix_05', finger: 'index', parents: ['asc_ix_04'], route: 'velocity', cost: 8, branchIndex: 5, grants: { cheapenCap: 1 } },
        { id: 'asc_ix_06', finger: 'index', parents: ['asc_ix_05'], route: 'velocity', cost: 9, branchIndex: 6, grants: { autoBuyDelayMult: 0.97 } },
        { id: 'asc_ix_07', finger: 'index', parents: ['asc_ix_06'], route: 'velocity', cost: 9, branchIndex: 7, grants: { slowdownCostMult: 0.94 } },
        { id: 'asc_ix_08', finger: 'index', parents: ['asc_ix_07'], route: 'velocity', cost: 11, branchIndex: 8, grants: { speedCostMult: 0.99 } },
        { id: 'asc_ix_09', finger: 'index', parents: ['asc_ix_08'], route: 'velocity', cost: 12, branchIndex: 9, grants: { cheapenCap: 1 } },
        { id: 'asc_ix_10', finger: 'index', parents: ['asc_ix_09'], route: 'velocity', cost: 13, branchIndex: 10, grants: { autoBuyDelayMult: 0.97 } },
        { id: 'asc_ix_11', finger: 'index', parents: ['asc_ix_10'], route: 'velocity', cost: 14, branchIndex: 11, grants: { slowdownCostMult: 0.94 } },
        { id: 'asc_ix_12', finger: 'index', parents: ['asc_ix_11'], route: 'velocity', cost: 16, branchIndex: 12, grants: { speedCostMult: 0.99 } },
        { id: 'asc_ix_13', finger: 'index', parents: ['asc_ix_12'], route: 'velocity', cost: 18, branchIndex: 13, grants: { cheapenCap: 1 } },
        { id: 'asc_ix_14', finger: 'index', parents: ['asc_ix_13'], route: 'velocity', cost: 19, branchIndex: 14, grants: { autoBuyDelayMult: 0.97 } },
        { id: 'asc_ix_15', finger: 'index', parents: ['asc_ix_14'], route: 'velocity', cost: 22, branchIndex: 15, grants: { slowdownCostMult: 0.94 } },
        { id: 'asc_ix_16', finger: 'index', parents: ['asc_ix_15'], route: 'velocity', cost: 24, branchIndex: 16, grants: { speedCostMult: 0.99 } },
        { id: 'asc_ix_17', finger: 'index', parents: ['asc_ix_16'], route: 'velocity', cost: 26, branchIndex: 17, grants: { cheapenCap: 1 } },
        { id: 'asc_ix_18', finger: 'index', parents: ['asc_ix_17'], route: 'velocity', cost: 29, branchIndex: 18, grants: { autoBuyDelayMult: 0.97 } },
        { id: 'asc_ix_19', finger: 'index', parents: ['asc_ix_18'], route: 'velocity', cost: 32, branchIndex: 19, grants: { slowdownCostMult: 0.94 } },
        { id: 'asc_ix_20', finger: 'index', parents: ['asc_ix_19'], route: 'velocity', cost: 36, branchIndex: 20, grants: { speedCostMult: 0.99 } },
        { id: 'asc_ix_21', finger: 'index', parents: ['asc_ix_20'], route: 'velocity', cost: 39, branchIndex: 21, grants: { cheapenCap: 1 } },
        { id: 'asc_ix_22', finger: 'index', parents: ['asc_ix_21'], route: 'velocity', cost: 44, branchIndex: 22, grants: { autoBuyDelayMult: 0.97 } },
        { id: 'asc_ix_23', finger: 'index', parents: ['asc_ix_22'], route: 'velocity', cost: 48, branchIndex: 23, grants: { slowdownCostMult: 0.94 } },
        { id: 'asc_ix_24', finger: 'index', parents: ['asc_ix_23'], route: 'velocity', cost: 53, branchIndex: 24, grants: { speedCostMult: 0.99 } },
        { id: 'asc_md_00', finger: 'middle', parents: [], route: 'combo', cost: 5, branchIndex: 0, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_01', finger: 'middle', parents: ['asc_md_00'], route: 'combo', cost: 5, branchIndex: 1, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_02', finger: 'middle', parents: ['asc_md_01'], route: 'combo', cost: 6, branchIndex: 2, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_03', finger: 'middle', parents: ['asc_md_02'], route: 'combo', cost: 6, branchIndex: 3, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_04', finger: 'middle', parents: ['asc_md_03'], route: 'combo', cost: 7, branchIndex: 4, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_05', finger: 'middle', parents: ['asc_md_04'], route: 'combo', cost: 8, branchIndex: 5, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_06', finger: 'middle', parents: ['asc_md_05'], route: 'combo', cost: 9, branchIndex: 6, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_07', finger: 'middle', parents: ['asc_md_06'], route: 'combo', cost: 9, branchIndex: 7, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_08', finger: 'middle', parents: ['asc_md_07'], route: 'combo', cost: 11, branchIndex: 8, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_09', finger: 'middle', parents: ['asc_md_08'], route: 'combo', cost: 12, branchIndex: 9, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_10', finger: 'middle', parents: ['asc_md_09'], route: 'combo', cost: 13, branchIndex: 10, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_11', finger: 'middle', parents: ['asc_md_10'], route: 'combo', cost: 14, branchIndex: 11, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_12', finger: 'middle', parents: ['asc_md_11'], route: 'combo', cost: 16, branchIndex: 12, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_13', finger: 'middle', parents: ['asc_md_12'], route: 'combo', cost: 18, branchIndex: 13, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_14', finger: 'middle', parents: ['asc_md_13'], route: 'combo', cost: 19, branchIndex: 14, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_15', finger: 'middle', parents: ['asc_md_14'], route: 'combo', cost: 22, branchIndex: 15, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_16', finger: 'middle', parents: ['asc_md_15'], route: 'combo', cost: 24, branchIndex: 16, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_17', finger: 'middle', parents: ['asc_md_16'], route: 'combo', cost: 26, branchIndex: 17, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_18', finger: 'middle', parents: ['asc_md_17'], route: 'combo', cost: 29, branchIndex: 18, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_19', finger: 'middle', parents: ['asc_md_18'], route: 'combo', cost: 32, branchIndex: 19, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_20', finger: 'middle', parents: ['asc_md_19'], route: 'combo', cost: 36, branchIndex: 20, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_21', finger: 'middle', parents: ['asc_md_20'], route: 'combo', cost: 39, branchIndex: 21, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_md_22', finger: 'middle', parents: ['asc_md_21'], route: 'combo', cost: 44, branchIndex: 22, grants: { comboTriggerProductionFrac: 0.004 } },
        { id: 'asc_md_23', finger: 'middle', parents: ['asc_md_22'], route: 'combo', cost: 48, branchIndex: 23, grants: { comboMultAdd: 0.003 } },
        { id: 'asc_md_24', finger: 'middle', parents: ['asc_md_23'], route: 'combo', cost: 53, branchIndex: 24, grants: { comboMultAdd: 0.004 } },
        { id: 'asc_rg_00', finger: 'ring', parents: [], route: 'turbo', cost: 7, branchIndex: 0, grants: { turboScaling: 1 } },
        { id: 'asc_rg_01', finger: 'ring', parents: ['asc_rg_00'], route: 'turbo', cost: 7, branchIndex: 1, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_02', finger: 'ring', parents: ['asc_rg_01'], route: 'turbo', cost: 8, branchIndex: 2, grants: { turboScaling: 1 } },
        { id: 'asc_rg_03', finger: 'ring', parents: ['asc_rg_02'], route: 'turbo', cost: 9, branchIndex: 3, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_04', finger: 'ring', parents: ['asc_rg_03'], route: 'turbo', cost: 10, branchIndex: 4, grants: { turboScaling: 1 } },
        { id: 'asc_rg_05', finger: 'ring', parents: ['asc_rg_04'], route: 'turbo', cost: 11, branchIndex: 5, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_06', finger: 'ring', parents: ['asc_rg_05'], route: 'turbo', cost: 12, branchIndex: 6, grants: { turboScaling: 1 } },
        { id: 'asc_rg_07', finger: 'ring', parents: ['asc_rg_06'], route: 'turbo', cost: 13, branchIndex: 7, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_08', finger: 'ring', parents: ['asc_rg_07'], route: 'turbo', cost: 15, branchIndex: 8, grants: { turboScaling: 1 } },
        { id: 'asc_rg_09', finger: 'ring', parents: ['asc_rg_08'], route: 'turbo', cost: 17, branchIndex: 9, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_10', finger: 'ring', parents: ['asc_rg_09'], route: 'turbo', cost: 18, branchIndex: 10, grants: { turboScaling: 1 } },
        { id: 'asc_rg_11', finger: 'ring', parents: ['asc_rg_10'], route: 'turbo', cost: 20, branchIndex: 11, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_12', finger: 'ring', parents: ['asc_rg_11'], route: 'turbo', cost: 22, branchIndex: 12, grants: { turboScaling: 1 } },
        { id: 'asc_rg_13', finger: 'ring', parents: ['asc_rg_12'], route: 'turbo', cost: 25, branchIndex: 13, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_14', finger: 'ring', parents: ['asc_rg_13'], route: 'turbo', cost: 27, branchIndex: 14, grants: { turboScaling: 1 } },
        { id: 'asc_rg_15', finger: 'ring', parents: ['asc_rg_14'], route: 'turbo', cost: 30, branchIndex: 15, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_16', finger: 'ring', parents: ['asc_rg_15'], route: 'turbo', cost: 34, branchIndex: 16, grants: { turboScaling: 1 } },
        { id: 'asc_rg_17', finger: 'ring', parents: ['asc_rg_16'], route: 'turbo', cost: 37, branchIndex: 17, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_18', finger: 'ring', parents: ['asc_rg_17'], route: 'turbo', cost: 41, branchIndex: 18, grants: { turboScaling: 1 } },
        { id: 'asc_rg_19', finger: 'ring', parents: ['asc_rg_18'], route: 'turbo', cost: 45, branchIndex: 19, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_20', finger: 'ring', parents: ['asc_rg_19'], route: 'turbo', cost: 50, branchIndex: 20, grants: { turboScaling: 1 } },
        { id: 'asc_rg_21', finger: 'ring', parents: ['asc_rg_20'], route: 'turbo', cost: 55, branchIndex: 21, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_22', finger: 'ring', parents: ['asc_rg_21'], route: 'turbo', cost: 61, branchIndex: 22, grants: { turboScaling: 1 } },
        { id: 'asc_rg_23', finger: 'ring', parents: ['asc_rg_22'], route: 'turbo', cost: 68, branchIndex: 23, grants: { comboTurboPointsMult: 0.07 } },
        { id: 'asc_rg_24', finger: 'ring', parents: ['asc_rg_23'], route: 'turbo', cost: 75, branchIndex: 24, grants: { turboScaling: 1 } },
        { id: 'asc_pk_00', finger: 'pinky', parents: [], route: 'warp', cost: 6, branchIndex: 0, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_01', finger: 'pinky', parents: ['asc_pk_00'], route: 'warp', cost: 6, branchIndex: 1, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_02', finger: 'pinky', parents: ['asc_pk_01'], route: 'warp', cost: 7, branchIndex: 2, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_03', finger: 'pinky', parents: ['asc_pk_02'], route: 'warp', cost: 8, branchIndex: 3, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_04', finger: 'pinky', parents: ['asc_pk_03'], route: 'warp', cost: 8, branchIndex: 4, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_05', finger: 'pinky', parents: ['asc_pk_04'], route: 'warp', cost: 9, branchIndex: 5, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_06', finger: 'pinky', parents: ['asc_pk_05'], route: 'warp', cost: 10, branchIndex: 6, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_07', finger: 'pinky', parents: ['asc_pk_06'], route: 'warp', cost: 11, branchIndex: 7, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_08', finger: 'pinky', parents: ['asc_pk_07'], route: 'warp', cost: 13, branchIndex: 8, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_09', finger: 'pinky', parents: ['asc_pk_08'], route: 'warp', cost: 14, branchIndex: 9, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_10', finger: 'pinky', parents: ['asc_pk_09'], route: 'warp', cost: 16, branchIndex: 10, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_11', finger: 'pinky', parents: ['asc_pk_10'], route: 'warp', cost: 17, branchIndex: 11, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_12', finger: 'pinky', parents: ['asc_pk_11'], route: 'warp', cost: 19, branchIndex: 12, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_13', finger: 'pinky', parents: ['asc_pk_12'], route: 'warp', cost: 21, branchIndex: 13, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_14', finger: 'pinky', parents: ['asc_pk_13'], route: 'warp', cost: 23, branchIndex: 14, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_15', finger: 'pinky', parents: ['asc_pk_14'], route: 'warp', cost: 26, branchIndex: 15, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_16', finger: 'pinky', parents: ['asc_pk_15'], route: 'warp', cost: 29, branchIndex: 16, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_17', finger: 'pinky', parents: ['asc_pk_16'], route: 'warp', cost: 32, branchIndex: 17, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_18', finger: 'pinky', parents: ['asc_pk_17'], route: 'warp', cost: 35, branchIndex: 18, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_19', finger: 'pinky', parents: ['asc_pk_18'], route: 'warp', cost: 39, branchIndex: 19, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_20', finger: 'pinky', parents: ['asc_pk_19'], route: 'warp', cost: 43, branchIndex: 20, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_21', finger: 'pinky', parents: ['asc_pk_20'], route: 'warp', cost: 47, branchIndex: 21, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_22', finger: 'pinky', parents: ['asc_pk_21'], route: 'warp', cost: 52, branchIndex: 22, grants: { warpOverflow: 1 } },
        { id: 'asc_pk_23', finger: 'pinky', parents: ['asc_pk_22'], route: 'warp', cost: 58, branchIndex: 23, grants: { warpSpawnIntervalMult: 0.965 } },
        { id: 'asc_pk_24', finger: 'pinky', parents: ['asc_pk_23'], route: 'warp', cost: 64, branchIndex: 24, grants: { warpOverflow: 1 } },
        { id: 'asc_th_00', finger: 'thumb', parents: [], route: 'clap', cost: 5, branchIndex: 0, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_01', finger: 'thumb', parents: ['asc_th_00'], route: 'clap', cost: 5, branchIndex: 1, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_02', finger: 'thumb', parents: ['asc_th_01'], route: 'clap', cost: 6, branchIndex: 2, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_03', finger: 'thumb', parents: ['asc_th_02'], route: 'clap', cost: 6, branchIndex: 3, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_04', finger: 'thumb', parents: ['asc_th_03'], route: 'clap', cost: 7, branchIndex: 4, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_05', finger: 'thumb', parents: ['asc_th_04'], route: 'clap', cost: 8, branchIndex: 5, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_06', finger: 'thumb', parents: ['asc_th_05'], route: 'clap', cost: 9, branchIndex: 6, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_07', finger: 'thumb', parents: ['asc_th_06'], route: 'clap', cost: 9, branchIndex: 7, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_08', finger: 'thumb', parents: ['asc_th_07'], route: 'clap', cost: 11, branchIndex: 8, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_09', finger: 'thumb', parents: ['asc_th_08'], route: 'clap', cost: 12, branchIndex: 9, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_10', finger: 'thumb', parents: ['asc_th_09'], route: 'clap', cost: 13, branchIndex: 10, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_11', finger: 'thumb', parents: ['asc_th_10'], route: 'clap', cost: 14, branchIndex: 11, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_12', finger: 'thumb', parents: ['asc_th_11'], route: 'clap', cost: 16, branchIndex: 12, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_13', finger: 'thumb', parents: ['asc_th_12'], route: 'clap', cost: 18, branchIndex: 13, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_14', finger: 'thumb', parents: ['asc_th_13'], route: 'clap', cost: 19, branchIndex: 14, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_15', finger: 'thumb', parents: ['asc_th_14'], route: 'clap', cost: 22, branchIndex: 15, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_16', finger: 'thumb', parents: ['asc_th_15'], route: 'clap', cost: 24, branchIndex: 16, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_17', finger: 'thumb', parents: ['asc_th_16'], route: 'clap', cost: 26, branchIndex: 17, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_18', finger: 'thumb', parents: ['asc_th_17'], route: 'clap', cost: 29, branchIndex: 18, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_19', finger: 'thumb', parents: ['asc_th_18'], route: 'clap', cost: 32, branchIndex: 19, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_20', finger: 'thumb', parents: ['asc_th_19'], route: 'clap', cost: 36, branchIndex: 20, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_21', finger: 'thumb', parents: ['asc_th_20'], route: 'clap', cost: 39, branchIndex: 21, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_22', finger: 'thumb', parents: ['asc_th_21'], route: 'clap', cost: 44, branchIndex: 22, grants: { clapCooldownMult: 0.987 } },
        { id: 'asc_th_23', finger: 'thumb', parents: ['asc_th_22'], route: 'clap', cost: 48, branchIndex: 23, grants: { clapBonusChanceAdd: 0.006 } },
        { id: 'asc_th_24', finger: 'thumb', parents: ['asc_th_23'], route: 'clap', cost: 53, branchIndex: 24, grants: { clapCooldownMult: 0.987 } }
    ];

    var NODES = finalizeAscensionNodes(ASCENSION_NODES);
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
            if (!tip) return;
            var dx = tip.x - hubX;
            var dy = tip.y - hubY;
            var denom = Math.max(1, list.length - 1);
            list.forEach(function (node, i) {
                var u = denom === 0 ? 0.5 : i / denom;
                var t = t0 + (t1 - t0) * u;
                L[node.id] = {
                    x: hubX + dx * t,
                    y: hubY + dy * t
                };
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
