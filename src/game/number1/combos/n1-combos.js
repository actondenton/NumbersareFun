const BONUS_BY_COUNT = { 2: 1.10, 3: 1.20, 4: 1.35, 5: 1.40, 6: 1.45, 7: 1.50, 8: 1.55, 9: 1.60, 10: 1.65 };
const COUNT_NAMES = ["", "", "Pair of", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

export const NEAR_MISS_TOLERANCE_RANK_MAX = 5;

export function countValues(values) {
    const counts = {};
    for (let i = 1; i <= 10; i++) counts[i] = 0;
    values.forEach(value => {
        const key = Number(value);
        if (key >= 1 && key <= 10) counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
}

export const COMBOS = [];
for (let n = 1; n <= 10; n++) {
    for (let k = 2; k <= 10; k++) {
        const name = (k === 2 ? "Pair of " + n + "s" : COUNT_NAMES[k] + " " + n + "s");
        let check;
        if (k === 2) {
            ((nn) => { check = values => values[0] === nn && values[1] === nn; })(n);
        } else if (k === 3) {
            ((nn) => { check = values => values[0] === nn && values[1] === nn && values[2] === nn; })(n);
        } else {
            ((nn, kk) => { check = values => countValues(values)[nn] >= kk; })(n, k);
        }
        COMBOS.push({ name, minHands: k, check, bonus: BONUS_BY_COUNT[k] });
    }
}
COMBOS.push(
    {
        name: "Two Pair",
        minHands: 4,
        check: values => {
            const counts = countValues(values);
            let ranksWithPair = 0;
            for (let rank = 1; rank <= 10; rank++) {
                if (counts[rank] >= 2) ranksWithPair++;
            }
            return ranksWithPair >= 2;
        },
        bonus: 1.15
    },
    {
        name: "Full House",
        minHands: 5,
        check: values => {
            const counts = countValues(values);
            const byCount = Object.values(counts).filter(n => n > 0).sort((a, b) => b - a);
            return byCount[0] >= 3 && byCount[1] >= 2;
        },
        bonus: 1.30
    }
);

export const COMBOS_BY_MIN_HANDS = (() => {
    const byMinHands = {};
    COMBOS.forEach(combo => {
        if (!byMinHands[combo.minHands]) byMinHands[combo.minHands] = [];
        byMinHands[combo.minHands].push(combo);
    });
    return byMinHands;
})();

export function getNearMissToleranceRanksFromNodes(nodeIds, nodeById) {
    const seen = new Set();
    const out = [];
    const ids = Array.isArray(nodeIds) ? nodeIds.slice().sort() : [];
    for (let i = 0; i < ids.length; i++) {
        const def = nodeById && nodeById[ids[i]];
        if (!def || def.finger !== "middle" || !def.grants) continue;
        const rank = def.grants.nearMissToleranceRank;
        if (typeof rank !== "number" || !Number.isInteger(rank) || rank < 1 || rank > 10) continue;
        if (seen.has(rank)) continue;
        seen.add(rank);
        out.push(rank);
        if (out.length >= NEAR_MISS_TOLERANCE_RANK_MAX) break;
    }
    return out;
}

export function getComboAscensionNodeSetFingerprint(nodeIds) {
    const ids = Array.isArray(nodeIds) ? nodeIds : [];
    const count = ids.length;
    if (count === 0) return "0";
    const sorted = ids.slice();
    sorted.sort();
    return count + ":" + sorted.join(",");
}

export function computeComboUiInputDigest(values, unlockedHands, nodeIds) {
    let digest = String(unlockedHands);
    for (let i = 0; i < unlockedHands; i++) {
        digest += "," + (values[i] || 0);
    }
    return digest + "|" + getComboAscensionNodeSetFingerprint(nodeIds);
}

export function pairOfNMatchesStrictOrRelaxed(rank, values, nearMissRanks) {
    if (!values || values.length < 2) return false;
    const a = values[0];
    const b = values[1];
    if (a === rank && b === rank) return true;
    if (!Array.isArray(nearMissRanks) || !nearMissRanks.includes(rank)) return false;
    const opts = [[rank, rank]];
    if (rank < 10) opts.push([rank, rank + 1]);
    if (rank > 1) opts.push([rank - 1, rank]);
    for (let i = 0; i < opts.length; i++) {
        const x = opts[i][0];
        const y = opts[i][1];
        if ((a === x && b === y) || (a === y && b === x)) return true;
    }
    return false;
}

export function comboMatchesActive(combo, values, nearMissRanks) {
    if (!combo || !values || values.length < (combo.minHands || 0)) return false;
    const pairOf = combo.name.match(/^Pair of (\d+)s$/);
    if (pairOf && combo.minHands === 2) {
        const rank = parseInt(pairOf[1], 10);
        return pairOfNMatchesStrictOrRelaxed(rank, values, nearMissRanks);
    }
    return combo.check(values);
}

export function getActiveCombosForValues(values, nearMissRanks) {
    return COMBOS.filter(combo => values.length >= combo.minHands && comboMatchesActive(combo, values, nearMissRanks));
}

export function getComboParticipatingHandIndicesForValues(combo, values, unlockedHands, nearMissRanks) {
    const uh = Math.min(values.length, unlockedHands);
    if (uh <= 0) return [];
    const all = () => Array.from({ length: uh }, (_, i) => i);
    if (combo.name === "Two Pair") {
        const counts = countValues(values);
        const ranks = [];
        for (let rank = 1; rank <= 10; rank++) if (counts[rank] >= 2) ranks.push(rank);
        const out = [];
        for (let i = 0; i < uh; i++) if (ranks.indexOf(values[i]) >= 0) out.push(i);
        return out.length ? out : all();
    }
    if (combo.name === "Full House") {
        const counts = countValues(values);
        let triplet = 0;
        let pair = 0;
        for (let rank = 1; rank <= 10; rank++) if (counts[rank] >= 3) { triplet = rank; break; }
        for (let rank = 1; rank <= 10; rank++) if (counts[rank] >= 2 && rank !== triplet) { pair = rank; break; }
        if (!triplet) return all();
        const out = [];
        for (let i = 0; i < uh; i++) if (values[i] === triplet || values[i] === pair) out.push(i);
        return out.length ? out : all();
    }
    const pairOf = combo.name.match(/^Pair of (\d+)s$/);
    if (pairOf) {
        const digit = parseInt(pairOf[1], 10);
        if (uh >= 2 && pairOfNMatchesStrictOrRelaxed(digit, values, nearMissRanks)) {
            return [0, 1];
        }
        const out = [];
        for (let i = 0; i < uh; i++) if (values[i] === digit) out.push(i);
        return out.length ? out : all();
    }
    const namedKind = combo.name.match(/^(?:Three|Four|Five|Six|Seven|Eight|Nine|Ten) (\d+)s$/);
    if (namedKind) {
        const digit = parseInt(namedKind[1], 10);
        const out = [];
        for (let i = 0; i < uh; i++) if (values[i] === digit) out.push(i);
        return out.length ? out : all();
    }
    return all().slice(0, Math.min(combo.minHands || uh, uh));
}

export function comboDiscoverySortCombos(a, b) {
    if (b.minHands !== a.minHands) return b.minHands - a.minHands;
    if (b.bonus !== a.bonus) return b.bonus - a.bonus;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

export function computeEarnedCatalogComboTierProducts(earnedComboNames, unlockedHands) {
    const earnedSet = new Set(Array.isArray(earnedComboNames) ? earnedComboNames : []);
    const tier = {};
    for (let n = 2; n <= 10; n++) {
        if (unlockedHands < n) {
            tier[n] = null;
            continue;
        }
        const group = COMBOS_BY_MIN_HANDS[n] || [];
        const earnedInGroup = group.filter(combo => earnedSet.has(combo.name));
        if (earnedInGroup.length === 0) {
            tier[n] = null;
            continue;
        }
        tier[n] = earnedInGroup.reduce((mult, combo) => mult * combo.bonus, 1);
    }
    return tier;
}

export function getPatternCatalogMultiplierFromEarned(earnedComboNames, unlockedHands) {
    if (unlockedHands < 2) return 1;
    const tier = computeEarnedCatalogComboTierProducts(earnedComboNames, unlockedHands);
    let sum = 0;
    for (let n = 2; n <= 10; n++) {
        const product = tier[n];
        if (product == null) continue;
        sum += product;
    }
    return sum > 0 ? sum : 1;
}

export function getComboIndexListContext(opts) {
    const combos = Array.isArray(opts.combos) ? opts.combos : COMBOS;
    const unlockedHands = opts.unlockedHands || 0;
    const discovered = new Set(Array.isArray(opts.earnedComboNames) ? opts.earnedComboNames : []);
    const activeNow = new Set(Array.isArray(opts.activeComboNames) ? opts.activeComboNames : []);
    const available = combos.filter(combo => unlockedHands >= combo.minHands);
    let rows = available.slice();
    if (opts.statusFilter === "discovered") rows = rows.filter(combo => discovered.has(combo.name));
    if (opts.statusFilter === "undiscovered") rows = rows.filter(combo => !discovered.has(combo.name));
    if (opts.handsFilter && opts.handsFilter !== "all") rows = rows.filter(combo => String(combo.minHands) === opts.handsFilter);
    const discoveredCount = available.filter(combo => discovered.has(combo.name)).length;
    return { discovered, activeNow, available, rows, discoveredCount };
}

export function computeEarnedBonusesUiDigestFromState(opts) {
    const unlockedHands = opts.unlockedHands || 0;
    if (unlockedHands < 2) {
        return "u" + unlockedHands;
    }
    const earnedComboNames = Array.isArray(opts.earnedComboNames) ? opts.earnedComboNames : [];
    const pendingComboNames = Array.isArray(opts.pendingComboNames) ? opts.pendingComboNames : [];
    const earnedSet = new Set(earnedComboNames);
    const pendingDiscovery = new Set(pendingComboNames);
    const totals = opts.totals || {};
    const catalogMult = Number(opts.catalogMult) || 1;
    const flatAdd = 1 + (totals.comboMultAdd || 0);
    const ascPatternMult = Number(opts.ascPatternMult) || 1;
    const cpsComboMult = Number(opts.cpsComboMult) || 1;
    const warpComboMult = Number(opts.warpComboMult) || 1;
    const head = [
        catalogMult.toFixed(2),
        cpsComboMult.toFixed(2),
        warpComboMult.toFixed(2),
        flatAdd.toFixed(2),
        ascPatternMult.toFixed(2),
        earnedComboNames.join("\n"),
        pendingComboNames.join("\n")
    ].join("#");
    let tierPart = "";
    for (let n = 2; n <= 10; n++) {
        if (unlockedHands < n) continue;
        const group = COMBOS_BY_MIN_HANDS[n] || [];
        if (group.length === 0) continue;
        const earnedInGroup = group.filter(combo => earnedSet.has(combo.name));
        const allEarned = earnedInGroup.length === group.length;
        if (allEarned) {
            const totalMult = earnedInGroup.reduce((mult, combo) => mult * combo.bonus, 1);
            tierPart += n + ":A:" + totalMult.toFixed(2) + "|";
        } else {
            tierPart += n + ":P:" + group.map(combo => {
                const state = earnedSet.has(combo.name) ? "1" : (pendingDiscovery.has(combo.name) ? "q" : "0");
                return combo.name + "_" + state;
            }).join(",") + "|";
        }
    }
    return head + "|" + tierPart;
}
