/**
 * Number 2 — Double or Nothing v1 token upgrades.
 * Loaded before index.html inline script; exposes Number 2 tuning constants + upgrade data.
 */
(function (global) {
    "use strict";

    global.NUMBER2_BASE_P_DOUBLE = 0.48;
    global.NUMBER2_P_DOUBLE_MIN = 0.05;
    global.NUMBER2_P_DOUBLE_MAX = 0.95;

    global.NUMBER2_TOKEN_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

    global.NUMBER2_UPGRADES = [
        {
            id: "in_for_a_pound",
            name: "...in for a Pound",
            description: "Boosts In for a Penny floor by exponent: floor^(Pound level).",
            category: "boom",
            maxLevel: 5,
            cost: [3, 6, 10, 15, 21]
        },
        {
            id: "hot_streak",
            name: "Hot Streak",
            description: "Each level: +1.5% Double chance.",
            category: "boom",
            maxLevel: 12,
            cost: [2, 3, 5, 8, 12, 17, 23, 30, 38, 47, 57, 68],
            pDoublePerLevel: 0.015
        },
        {
            id: "all_i_do_is_win",
            name: "All I Do Is Win",
            description: "On Double, chance to trigger a bonus Double.",
            category: "boom",
            maxLevel: 6,
            cost: [5, 9, 14, 20, 27, 35],
            bonusDoubleChanceByLevel: [0.04, 0.07, 0.10, 0.13, 0.16, 0.20]
        },
        {
            id: "run_the_table",
            name: "Run the Table",
            description: "Active: temporary surge to Double chance. Upgrades improve duration and cooldown.",
            category: "boom",
            maxLevel: 3,
            cost: [12, 20, 32]
        },
        {
            id: "playing_fair",
            name: "Playing Fair",
            description: "Toggle stance: disables chance-modifying upgrades but multiplies token gain.",
            category: "hybrid",
            maxLevel: 3,
            cost: [
                { boom: 15, bust: 10 },
                { boom: 24, bust: 18 },
                { boom: 36, bust: 28 }
            ]
        },
        {
            id: "in_for_a_penny",
            name: "In for a Penny...",
            description: "On Nothing, your total resets to a floor instead of pure zero.",
            category: "bust",
            maxLevel: 6,
            cost: [2, 4, 7, 11, 16, 22],
            nothingFloorByLevel: [2, 4, 8, 16, 32, 64]
        },
        {
            id: "gamblers_paradox",
            name: "Gambler's Paradox",
            description: "Each level: +1.8% Nothing chance.",
            category: "bust",
            maxLevel: 10,
            cost: [2, 3, 5, 8, 11, 15, 20, 26, 33, 41],
            pNothingPerLevel: 0.018
        },
        {
            id: "sandbagging",
            name: "Sandbagging",
            description: "Active: force your next roll to Nothing.",
            category: "bust",
            maxLevel: 4,
            cost: [6, 11, 18, 28]
        },
        {
            id: "cold_hand_insurance",
            name: "Cold Hand Insurance",
            description: "After 3+ Nothings in a row, your next Double grants bonus Boom tokens.",
            category: "bust",
            maxLevel: 4,
            cost: [7, 13, 21, 32],
            boomBonusByLevel: [1, 2, 3, 4]
        }
    ];
})(typeof window !== "undefined" ? window : globalThis);
