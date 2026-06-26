const NUMBER_MODULE_INTERFACE_METHODS = [
    "getLabel",
    "getRatePerSec",
    "getMilestone",
    "isAscensionReady",
    "tickBackground",
    "getSaveData",
    "applySaveData",
    "getOverviewDetails"
];

/** Validates and returns a Number tab module (N1, N2, …). */
export function createNumberModule(definition) {
    const module = {
        getLabel: () => "Unknown Number",
        getRatePerSec: () => 0,
        getMilestone: () => ({ text: "No milestone", pct: 0 }),
        isAscensionReady: () => false,
        tickBackground: () => {},
        getSaveData: () => ({}),
        applySaveData: () => {},
        getOverviewDetails: () => "",
        ...definition
    };
    NUMBER_MODULE_INTERFACE_METHODS.forEach(method => {
        if (typeof module[method] !== "function") {
            throw new Error("Number module missing method: " + method);
        }
    });
    return module;
}
