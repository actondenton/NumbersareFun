/**
 * Turbo meter, scension levels, and leveler bank (run-scoped; partial reset on ascend).
 */
export function createN1TurboStore() {
    return {
        turboScensionBurnLevel: 0,
        turboScensionTankLevel: 0,
        turboScensionMultLevel: 0,
        turboScensionFillLevel: 0,
        turboBoostMeter: 0,
        turboBoostUnlocked: false,
        turboBoostEnabled: false,
        turboActivationCount: 0,
        turboActivationEarnAccumulator: 0,
        turboLevelerBank: 0,
        turboLevelerPurchases: 0
    };
}
