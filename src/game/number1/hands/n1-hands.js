export const UNLOCK_THRESHOLDS = [
    1e9,   // hand 2: 1 billion
    1e12,  // hand 3: 1 trillion
    1e15,  // hand 4: 1 quadrillion
    1e18,  // hand 5: 1 quintillion
    1e21,  // hand 6: 1 sextillion
    1e24,  // hand 7: 1 septillion
    1e27,  // hand 8: 1 octillion
    1e30,  // hand 9: 1 nonillion
    1e33   // hand 10: 1 decillion
];

export const HAND_BASE_SPEED = 1000;

export function storyTotalCountLead(threshold, formatCount) {
    return "At " + formatCount(threshold) + " total count on your counter, ";
}

export function getEffectiveUnlockedHandsCap(unlockedHandsCap, maxHands) {
    return Math.max(1, Math.min(maxHands, unlockedHandsCap | 0));
}

export function shouldUnlockNextHand(unlockedHands, unlockedHandsCap, totalChanges, maxHands, thresholds = UNLOCK_THRESHOLDS) {
    const cap = getEffectiveUnlockedHandsCap(unlockedHandsCap, maxHands);
    return unlockedHands < cap &&
        unlockedHands - 1 < thresholds.length &&
        totalChanges >= thresholds[unlockedHands - 1];
}
