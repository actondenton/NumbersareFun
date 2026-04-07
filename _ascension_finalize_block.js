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

    /**
     * Human-editable ascension nodes. Each row needs: id, finger, parents, route, cost, branchIndex, x, y, grants.
     * x,y in 0–100 viewBox space (same as map). Optional: layoutT (0–1 along hub→fingertip), lateral (perpendicular offset).
     * Optional: title, effect, tags.
     */

