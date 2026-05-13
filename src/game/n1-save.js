export const SAVE_KEY = "naf.save.v2";
export const AUTOSAVE_INTERVAL_MS = 10000;

/** Save/load: activation counts are edge-based (combo appears after being absent); version mismatch clears counts on load. */
export const COMBO_ACTIVATION_EDGE_SAVE_VERSION = 2;

export function readSaveData(storage, key = SAVE_KEY) {
    try {
        const raw = storage?.getItem?.(key);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data && typeof data === "object" ? data : null;
    } catch (_) {
        return null;
    }
}

export function writeSaveData(storage, state, key = SAVE_KEY) {
    try {
        storage?.setItem?.(key, JSON.stringify(state));
        return true;
    } catch (_) {
        return false;
    }
}

export function collectNumberModulesSaveState(numberModules) {
    const numberModulesState = {};
    Object.keys(numberModules || {}).forEach(k => {
        const m = numberModules[k];
        numberModulesState[k] = m.getSaveData();
    });
    return numberModulesState;
}

export function applyNumberModulesSaveState(numberModules, numberModulesState) {
    if (!numberModulesState || typeof numberModulesState !== "object") return;
    Object.keys(numberModulesState).forEach(k => {
        const m = numberModules?.[k];
        if (m) m.applySaveData(numberModulesState[k]);
    });
}

export function createGameSaveState(savedAt, fields) {
    return {
        savedAt: savedAt || Date.now(),
        ...fields,
        comboActivationEdgeVersion: COMBO_ACTIVATION_EDGE_SAVE_VERSION
    };
}

export function normalizeFixedArray(value, length, fillValue, mapValue = v => v) {
    if (!Array.isArray(value)) return null;
    const out = value.slice(0, length).map(mapValue);
    while (out.length < length) out.push(fillValue);
    return out;
}

export function normalizeFixedBooleanArray(value, length, fillValue = false) {
    return normalizeFixedArray(value, length, fillValue, v => !!v);
}

export function normalizePositiveTimestampArray(value, length, fillValue = 0) {
    return normalizeFixedArray(value, length, fillValue, v => {
        const t = Number(v);
        return Number.isFinite(t) && t > 0 ? t : fillValue;
    });
}

export function normalizeFutureTimestampArray(value, length, nowMs, fillValue = 0) {
    return normalizeFixedArray(value, length, fillValue, v => {
        const t = Number(v);
        return Number.isFinite(t) && t > nowMs ? t : fillValue;
    });
}

export function normalizeComboActivationCounts(savedVersion, counts, expectedVersion = COMBO_ACTIVATION_EDGE_SAVE_VERSION) {
    if (Number(savedVersion) !== expectedVersion || !counts || typeof counts !== "object") return {};
    const out = {};
    Object.keys(counts).forEach(k => {
        const v = Number(counts[k]);
        out[k] = Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
    });
    return out;
}

export function normalizeStringQueue(value) {
    return Array.isArray(value) ? value.filter(nm => typeof nm === "string" && nm.length > 0) : [];
}

export function normalizeArrayFromSave(value) {
    return Array.isArray(value) ? value.slice() : null;
}

export function normalizeArrayPrefix(value, length, mapValue = v => v) {
    return Array.isArray(value) ? value.slice(0, length).map(mapValue) : null;
}

export function normalizeStringArrayFromSave(value) {
    return Array.isArray(value) ? value.filter(v => typeof v === "string") : [];
}

export function normalizeStringSetFromSave(value) {
    return Array.isArray(value) ? new Set(value) : null;
}

export function applyAchievementFlags(targets, flags) {
    if (!Array.isArray(flags)) return false;
    targets.forEach((o, i) => { o.achieved = !!flags[i]; });
    return true;
}

export function replaceArrayContents(target, source) {
    if (!Array.isArray(source)) return false;
    target.length = 0;
    source.forEach(v => target.push(v));
    return true;
}

export function normalizeNonNegativeTimestamp(value) {
    const t = Number(value);
    return Number.isFinite(t) && t >= 0 ? t : 0;
}

export function normalizeNonNegativeNumber(value, fallback = 0, max = Number.MAX_VALUE) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(max, n) : fallback;
}

export function normalizePositiveTimestamp(value, fallback = 0) {
    const t = Number(value);
    return Number.isFinite(t) && t > 0 ? t : fallback;
}

export function normalizeNonNegativeInteger(value, fallback = 0, max = Number.MAX_SAFE_INTEGER) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(max, Math.floor(n)) : fallback;
}

export function normalizeNumberAtLeast(value, min, fallback = min) {
    const n = Number(value);
    return Number.isFinite(n) && n >= min ? n : fallback;
}

export function normalizeNumberInRange(value, min, max, fallback) {
    const n = Number(value);
    const safeFallback = fallback ?? min;
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : safeFallback;
}

export function hasPositiveNumberEntry(value) {
    return Array.isArray(value) && value.some(v => (Number(v) || 0) > 0);
}

export function isSaveVersionAtLeast(value, minVersion) {
    const n = Number(value);
    return Number.isFinite(n) && n >= minVersion;
}

export function normalizeBooleanIfSaved(value, currentValue) {
    return typeof value === "boolean" ? value : currentValue;
}

export function normalizeComboDiscoveryCooldownSpan(value, maxMs) {
    const sp = Number(value);
    return Number.isFinite(sp) && sp > 0 ? Math.min(maxMs, Math.floor(sp)) : 0;
}

export function normalizeQueuedComboDiscoveryCooldownSpan(value, pendingQueue, readyAtMs, nowMs, maxMs, minMs) {
    let span = normalizeComboDiscoveryCooldownSpan(value, maxMs);
    if (span <= 0 && Array.isArray(pendingQueue) && pendingQueue.length > 0 && readyAtMs > nowMs) {
        span = Math.max(minMs, readyAtMs - nowMs);
    }
    return span;
}

export function normalizeSettingsFromSave(savedSettings, currentSettings) {
    if (!savedSettings) return null;
    const data = typeof savedSettings === "object" ? savedSettings : {};
    return {
        theme: data.theme === "dark" ? "dark" : "light",
        adaptiveTipsEnabled: data.adaptiveTipsEnabled !== false,
        curtainEnabled: data.curtainEnabled !== false,
        humorEnabled: data.humorEnabled !== false,
        showClapAnimation: data.showClapAnimation !== false,
        offlineCapHours: Number.isFinite(data.offlineCapHours) && data.offlineCapHours >= 0
            ? data.offlineCapHours
            : currentSettings.offlineCapHours
    };
}

/** Non-null only for valid non-negative saved essence (Number 1); avoids losing essence to parse quirks. */
export function parseNumber1AscensionEssenceFromSaveValue(v) {
    if (v == null) return null;
    if (typeof v === "bigint") {
        if (v < 0n) return null;
        const n = Number(v);
        return Number.isFinite(n) ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)) : Number.MAX_SAFE_INTEGER;
    }
    let n;
    if (typeof v === "string") {
        const t = v.trim();
        if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return null;
        n = Number(t);
    } else {
        n = Number(v);
    }
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}

/**
 * Essence is stored top-level and under numberModulesState[1]; use max so 0 in one field cannot wipe the other.
 * The current in-memory value participates as a candidate to preserve already-loaded progress.
 */
export function mergeNumber1AscensionEssenceSaveValue(data, currentEssence) {
    const candidates = [];
    const add = (v) => {
        const p = parseNumber1AscensionEssenceFromSaveValue(v);
        if (p !== null) candidates.push(p);
    };
    add(currentEssence);
    if (data && typeof data === "object") {
        add(data.number1AscensionEssence);
        if (data.numberModulesState && typeof data.numberModulesState === "object") {
            const n1 = data.numberModulesState["1"];
            if (n1 && typeof n1 === "object" && n1.ascensionEssence != null) add(n1.ascensionEssence);
        }
    }
    if (candidates.length === 0) return currentEssence;
    return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.max(...candidates)));
}
