/** In-place autobuy array resets (must not reassign arrays held by upgrade UI controller). */

export function resetAutobuyHandArrays(autoBuyEnabledByHand, autoBuyCountdownSecondsByHand, defaultEnabled) {
    autoBuyEnabledByHand.length = 0;
    autoBuyEnabledByHand.push(!!defaultEnabled);
    autoBuyCountdownSecondsByHand.length = 0;
    autoBuyCountdownSecondsByHand.push(0);
}

export function copyAutobuyArraysFromSave(
    autoBuyEnabledByHand,
    autoBuyCountdownSecondsByHand,
    savedEnabled,
    savedCountdown
) {
    autoBuyEnabledByHand.length = 0;
    if (Array.isArray(savedEnabled)) {
        savedEnabled.forEach(v => autoBuyEnabledByHand.push(!!v));
    }
    autoBuyCountdownSecondsByHand.length = 0;
    if (Array.isArray(savedCountdown)) {
        savedCountdown.forEach(v => {
            const n = Number(v);
            autoBuyCountdownSecondsByHand.push(Number.isFinite(n) ? n : 0);
        });
    }
}

/** When ascension grant is owned: unlock autobuy and turn it on for every unlocked hand. */
export function applyAutobuyGrantToUnlockedHands(autoBuyEnabledByHand, unlockedHands, grantActive) {
    if (!grantActive || !(unlockedHands > 0)) return false;
    let changed = false;
    while (autoBuyEnabledByHand.length < unlockedHands) {
        autoBuyEnabledByHand.push(true);
        changed = true;
    }
    for (let i = 0; i < unlockedHands; i++) {
        if (!autoBuyEnabledByHand[i]) {
            autoBuyEnabledByHand[i] = true;
            changed = true;
        }
    }
    return changed;
}
