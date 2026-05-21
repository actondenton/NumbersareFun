/**
 * Number 2 ascension — isolated “Luck table” nodes (no Number 1 grant keys).
 * Pattern mirrors ascension-tree-data.js but is a separate export.
 */
(function (global) {
    "use strict";

    var VERSION = 1;

    var NODES = [
        {
            id: "asc2_felt_edge",
            title: "Felt edge",
            cost: 8,
            parentIds: [],
            grants: { pDoubleAdd: 0.004 }
        },
        {
            id: "asc2_chip_stack",
            title: "Chip stack",
            cost: 20,
            parentIds: ["asc2_felt_edge"],
            grants: { luckPerDouble: 1 }
        },
        {
            id: "asc2_high_roller",
            title: "High roller",
            cost: 45,
            parentIds: ["asc2_chip_stack"],
            grants: { pDoubleAdd: 0.006, activeRollMult: 0.15 }
        }
    ];

    function computeAscension2GrantTotals(ownedIds) {
        var set = {};
        (ownedIds || []).forEach(function (id) {
            set[id] = true;
        });
        var totals = {
            pDoubleAdd: 0,
            luckPerDouble: 0,
            activeRollMult: 0
        };
        NODES.forEach(function (n) {
            if (!set[n.id]) return;
            var g = n.grants || {};
            if (g.pDoubleAdd != null) totals.pDoubleAdd += g.pDoubleAdd;
            if (g.luckPerDouble != null) totals.luckPerDouble += g.luckPerDouble;
            if (g.activeRollMult != null) totals.activeRollMult += g.activeRollMult;
        });
        return totals;
    }

    function describeGrants(g) {
        var parts = [];
        if (g.pDoubleAdd != null) parts.push("Double chance +" + (g.pDoubleAdd * 100).toFixed(2) + "%");
        if (g.luckPerDouble != null) parts.push("+" + g.luckPerDouble + " Luck each Double");
        if (g.activeRollMult != null) parts.push("Active auto-roll speed +" + (g.activeRollMult * 100).toFixed(0) + "%");
        return parts.join(" · ");
    }

    global.ASCENSION2_TREE_EXPORT = {
        VERSION: VERSION,
        NODES: NODES,
        computeAscension2GrantTotals: computeAscension2GrantTotals,
        describeGrants: describeGrants
    };
})(typeof window !== "undefined" ? window : globalThis);
