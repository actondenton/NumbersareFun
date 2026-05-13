export function getObjectiveProgress(obj, totalChanges, formatCount) {
    if (!obj) return { pct: 100, label: "Complete" };
    if (typeof obj.getProgress === "function") {
        try {
            const p = obj.getProgress() || {};
            return {
                pct: Math.max(0, Math.min(100, Number(p.pct) || 0)),
                label: p.label || ""
            };
        } catch (_) {
            return { pct: 0, label: "" };
        }
    }
    if (Number.isFinite(obj.goal)) {
        return {
            pct: Math.max(0, Math.min(100, (totalChanges / obj.goal) * 100)),
            label: formatCount(totalChanges) + " / " + formatCount(obj.goal)
        };
    }
    return { pct: 0, label: "" };
}

export function isObjectiveComplete(obj, totalChanges) {
    if (!obj) return false;
    if (typeof obj.isComplete === "function") {
        try {
            return !!obj.isComplete();
        } catch (_) {
            return false;
        }
    }
    return Number.isFinite(obj.goal) && totalChanges >= obj.goal;
}

export function renderObjective(obj, totalChanges, formatCount, doc = document) {
    const li = doc.createElement("li");
    const progress = getObjectiveProgress(obj, totalChanges, formatCount);
    const prefix = Number.isFinite(obj.goal) ? ("Reach " + formatCount(obj.goal) + " — ") : "";
    li.textContent = prefix + obj.text + (progress.label ? " (" + progress.label + ")" : "");
    if (isObjectiveComplete(obj, totalChanges)) obj.achieved = true;
    if (obj.achieved) {
        li.style.textDecoration = "line-through";
        li.style.color = "#4CAF50";
    }
    return li;
}
