/** Short-term milestone count (goal thresholds in objectives catalog / boot wiring). */
export const N1_SHORT_OBJECTIVES_COUNT = 8;

/**
 * Persisted objective achievement flags. Objective definitions (text, goals, closures)
 * stay in n1-boot-body / objectives boot; `achieved` is bound to these arrays after definitions are built.
 */
export function createN1ObjectivesStore() {
    return {
        objectivesAchieved: [],
        longTermObjectivesAchieved: []
    };
}

/**
 * @param {{ goal?: number, text: string, achieved?: boolean, [key: string]: unknown }[]} objectives
 * @param {{ goal?: number, text: string, achieved?: boolean, [key: string]: unknown }[]} longTermObjectives
 * @param {ReturnType<typeof createN1ObjectivesStore>} store
 */
export function bindObjectiveAchievedToStore(objectives, longTermObjectives, store) {
    while (store.objectivesAchieved.length < objectives.length) {
        store.objectivesAchieved.push(false);
    }
    while (store.longTermObjectivesAchieved.length < longTermObjectives.length) {
        store.longTermObjectivesAchieved.push(false);
    }
    objectives.forEach((obj, i) => {
        Object.defineProperty(obj, "achieved", {
            get: () => !!store.objectivesAchieved[i],
            set: v => { store.objectivesAchieved[i] = !!v; },
            enumerable: true,
            configurable: true
        });
    });
    longTermObjectives.forEach((obj, i) => {
        Object.defineProperty(obj, "achieved", {
            get: () => !!store.longTermObjectivesAchieved[i],
            set: v => { store.longTermObjectivesAchieved[i] = !!v; },
            enumerable: true,
            configurable: true
        });
    });
}

/**
 * @param {ReturnType<typeof import("../n1-state-apply.js").normalizeNumber1SaveSnapshot>} snap
 * @param {ReturnType<typeof createN1ObjectivesStore>} store
 */
export function hydrateObjectiveFlagsFromSnapshot(snap, store) {
    if (Array.isArray(snap.objectivesAchieved)) {
        snap.objectivesAchieved.forEach((v, i) => {
            store.objectivesAchieved[i] = !!v;
        });
    }
    if (Array.isArray(snap.longTermObjectivesAchieved)) {
        snap.longTermObjectivesAchieved.forEach((v, i) => {
            store.longTermObjectivesAchieved[i] = !!v;
        });
    }
}
