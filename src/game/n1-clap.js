export const CLAP_UNLOCK_HANDS = 8;
export const CLAP_BONUS_CHANCE = 0.1;
export const CLAP_MAX_PAIRS_PER_TICK = 2;
export const CLAP_ANIM_STAGGER_MS = 220;
export const CLAP_COOLDOWN_MS = 10000;
/** Middle-branch Combo Claps: fixed 10% per roll (ascension nodes gate which rolls exist). */
export const COMBO_CLAP_INSTANT_CHANCE = 0.1;
export const COMBO_CLAP_CHAIN_MAX_WAVES = 64;
export const CLAP_BONUS_CHEAPEN_CHAIN_MAX_WAVES = 64;
export const CLAP_BONUS_SLOWDOWN_CHAIN_MAX_WAVES = 64;

export function isClappingUnlockedForHands(unlockedHands) {
    return unlockedHands >= CLAP_UNLOCK_HANDS;
}

export function getClapCooldownMsFromTotals(totals) {
    const mult = (totals && totals.clapCooldownMult) || 1;
    return Math.max(2500, Math.floor(CLAP_COOLDOWN_MS * mult));
}

export function getClapBonusChanceFromTotals(totals) {
    return Math.min(0.95, CLAP_BONUS_CHANCE + ((totals && totals.clapBonusChanceAdd) || 0));
}

export function getClapCheapenBonusChanceFromTotals(totals) {
    return Math.min(0.95, Math.max(0, (totals && totals.clapCheapenBonusChanceAdd) || 0));
}

export function getClapSlowdownBonusChanceFromTotals(totals) {
    return Math.min(0.95, Math.max(0, (totals && totals.clapSlowdownBonusChanceAdd) || 0));
}

export function getClapEssenceProcChanceFromTotals(totals) {
    return Math.min(0.95, Math.max(0, (totals && totals.clapEssenceProcChanceAdd) || 0));
}

export function getClapEssenceProcMultiplierStepFromTotals(totals) {
    const step = Number((totals && totals.clapEssenceMultiplierStepAdd) || 0);
    return Math.max(0, step);
}

export function runChanceChain(extraUnlocked, chainUnlocked, maxWaves, onWave, rng) {
    if (!extraUnlocked || typeof onWave !== "function") return 0;
    const random = typeof rng === "function" ? rng : Math.random;
    if (random() >= COMBO_CLAP_INSTANT_CHANCE) return 0;
    let waves = 0;
    while (waves < maxWaves) {
        onWave();
        waves++;
        if (!chainUnlocked || random() >= COMBO_CLAP_INSTANT_CHANCE) break;
    }
    return waves;
}
