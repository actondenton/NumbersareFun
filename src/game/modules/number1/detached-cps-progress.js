import { calculateDetachedCpsProgress } from "./core.js";

export function accumulateNumber1DetachedCps(dtSec, deps) {
    if (!(Number(dtSec) > 0)) return 0;
    if (deps.getBlackHolePhase() === 7) return 0;
    const unlockedHands = deps.getUnlockedHands();
    const progress = calculateDetachedCpsProgress({
        dtSec,
        cpsPerHand: deps.getRawCpsPerHand(),
        unlockedHands,
        comboMultiplier: deps.getComboMultiplier(),
        turboMultiplier: deps.getTurboMultiplier(),
        blackHoleMultiplier: deps.getBlackHoleOfflineProductionMult(dtSec)
    });
    if (progress.gained <= 0) return 0;
    deps.mergeHandEarningsFromDetachedSlice(progress.gainsByHand);
    deps.refreshTotalsFromHands();
    return progress.gained;
}
