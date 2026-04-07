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

