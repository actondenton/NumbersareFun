/** Aggregate auto-player session logs into designer-facing reports. */

export const AUTOPLAYER_GAP_THRESHOLD_MS = 10_000;

export const AUTOPLAYER_PLAN_PHASE_TARGETS = {
    1: { ascensions: { target: 3, label: "~2–3 ascensions" }, milestones: [] },
    2: { ascensions: { target: 5, label: "~5 ascensions" }, milestones: [{ total: 1e100, label: "~1e100" }] },
    3: { ascensions: { target: 10, label: "~10 ascensions" }, milestones: [{ total: 1e150, label: "~1e150" }] },
    4: { ascensions: { target: 10, label: "~10 ascensions" }, milestones: [{ total: 1e200, label: "~1e200" }] },
    5: { ascensions: { target: 10, label: "~10 runs above ~1e200" }, milestones: [{ total: 1e200, label: "~1e200" }] },
    6: { ascensions: { target: null, label: "grow to evaporation cap" }, milestones: [] },
    7: { ascensions: { target: null, label: "epilogue" }, milestones: [] }
};

function phaseOfEvent(ev, fallback) {
    if (ev && ev.metrics && Number.isFinite(ev.metrics.blackHolePhase)) {
        return Math.max(0, Math.floor(ev.metrics.blackHolePhase));
    }
    if (ev && Number.isFinite(ev.blackHolePhase)) return Math.max(0, Math.floor(ev.blackHolePhase));
    return fallback != null ? fallback : 0;
}

function incrementClickBreakdown(breakdown, type) {
    if (!type || type === "phase_enter" || type === "dismiss_story") return;
    breakdown[type] = (breakdown[type] || 0) + 1;
}

export function computePlayGaps(events, opts) {
    const options = opts || {};
    const thresholdMs = Number.isFinite(options.thresholdMs) ? options.thresholdMs : AUTOPLAYER_GAP_THRESHOLD_MS;
    const list = Array.isArray(events) ? events : [];
    /** @type {object[]} */
    const gaps = [];
    for (let i = 1; i < list.length; i++) {
        const prev = list[i - 1];
        const cur = list[i];
        const gapMs = Math.max(0, (Number(cur.sessionMs) || 0) - (Number(prev.sessionMs) || 0));
        if (gapMs >= thresholdMs) {
            gaps.push({
                gapMs,
                fromType: prev.type,
                toType: cur.type,
                fromAt: prev.at,
                toAt: cur.at,
                phase: phaseOfEvent(cur, phaseOfEvent(prev, 0))
            });
        }
    }
    const totalGapMs = gaps.reduce((sum, g) => sum + g.gapMs, 0);
    const longest = gaps.reduce((best, g) => (g.gapMs > (best?.gapMs || 0) ? g : best), null);
    return { gaps, gapCount: gaps.length, totalGapMs, longestGap: longest };
}

export function buildAutoplayerReport(sessionExport, opts) {
    const options = opts || {};
    if (!sessionExport || !Array.isArray(sessionExport.events)) {
        return { error: "No session data" };
    }
    const events = sessionExport.events;
    const meta = sessionExport.meta || {};
    const thresholdMs = Number.isFinite(options.gapThresholdMs) ? options.gapThresholdMs : AUTOPLAYER_GAP_THRESHOLD_MS;
    const gapStats = computePlayGaps(events, { thresholdMs });

    const sessionWallMs =
        events.length > 0 ? Math.max(0, Number(events[events.length - 1].sessionMs) || 0) : 0;
    const gapPctGlobal = sessionWallMs > 0 ? (gapStats.totalGapMs / sessionWallMs) * 100 : 0;

    /** @type {Record<number, object>} */
    const byPhase = {};
    /** @type {object[]} */
    const ascensions = [];
    let currentPhase = phaseOfEvent(events[0], 0);
    let phaseEnterMs = 0;
    let ascensionIndex = 0;

    function ensurePhase(p) {
        if (!byPhase[p]) {
            byPhase[p] = {
                phase: p,
                wallTimeMs: 0,
                ascensions: 0,
                clickBreakdown: {},
                peakAtAscend: [],
                gapCount: 0,
                gapMs: 0
            };
        }
        return byPhase[p];
    }

    ensurePhase(currentPhase);

    for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        if (ev.type === "phase_enter") {
            const nextPhase = phaseOfEvent(ev, currentPhase);
            const sliceMs = Math.max(0, (Number(ev.sessionMs) || 0) - phaseEnterMs);
            ensurePhase(currentPhase).wallTimeMs += sliceMs;
            currentPhase = nextPhase;
            phaseEnterMs = Number(ev.sessionMs) || 0;
            ensurePhase(currentPhase);
            continue;
        }

        incrementClickBreakdown(ensurePhase(currentPhase).clickBreakdown, ev.type);

        if (ev.type === "ascend") {
            ascensionIndex += 1;
            ensurePhase(currentPhase).ascensions += 1;
            const peak = Number(ev.peakTotalAtAscend) || 0;
            ensurePhase(currentPhase).peakAtAscend.push(peak);
            ascensions.push({
                index: ascensionIndex,
                at: ev.at,
                sessionMs: ev.sessionMs,
                phase: currentPhase,
                peakTotalAtAscend: peak,
                ascensionGain: ev.ascensionGain
            });
        }
    }
    if (events.length > 0) {
        ensurePhase(currentPhase).wallTimeMs += Math.max(0, sessionWallMs - phaseEnterMs);
    }

    for (const g of gapStats.gaps) {
        const bucket = ensurePhase(g.phase);
        bucket.gapCount += 1;
        bucket.gapMs += g.gapMs;
    }

    /** @type {object[]} */
    const planComparison = [];
    for (const [phaseKey, target] of Object.entries(AUTOPLAYER_PLAN_PHASE_TARGETS)) {
        const phase = Number(phaseKey);
        const stats = byPhase[phase] || { ascensions: 0, peakAtAscend: [], wallTimeMs: 0, gapCount: 0, gapMs: 0 };
        const peaks = stats.peakAtAscend || [];
        const maxPeak = peaks.length ? Math.max(...peaks) : 0;
        const row = {
            phase,
            ascensionsInPhase: stats.ascensions,
            ascensionTarget: target.ascensions.target,
            ascensionTargetLabel: target.ascensions.label,
            maxPeakAtAscend: maxPeak,
            wallTimeSec: Math.round((stats.wallTimeMs || 0) / 1000),
            gapPct: stats.wallTimeMs > 0 ? ((stats.gapMs || 0) / stats.wallTimeMs) * 100 : 0
        };
        for (const m of target.milestones || []) {
            const crossed = peaks.some(p => p >= m.total);
            row["milestone_" + m.label] = crossed ? "crossed" : "not yet";
        }
        planComparison.push(row);
    }

    return {
        meta: {
            sessionId: meta.sessionId,
            personaId: meta.personaId,
            startedAt: meta.startedAt,
            stoppedAt: meta.stoppedAt,
            simulatedClicks: meta.simulatedClicks,
            ascensionCount: meta.ascensionCount
        },
        global: {
            totalAscensions: ascensions.length,
            totalClicks: meta.simulatedClicks || 0,
            clicksPerAscension: ascensions.length > 0 ? (meta.simulatedClicks || 0) / ascensions.length : 0,
            sessionWallSec: Math.round(sessionWallMs / 1000),
            gapCount: gapStats.gapCount,
            totalGapSec: Math.round(gapStats.totalGapMs / 1000),
            gapPctGlobal: Math.round(gapPctGlobal * 10) / 10,
            longestGap: gapStats.longestGap
        },
        byPhase: Object.values(byPhase).sort((a, b) => a.phase - b.phase),
        ascensions,
        gaps: gapStats.gaps,
        planComparison
    };
}

export function formatAutoplayerReportMarkdown(report) {
    if (!report || report.error) return String(report?.error || "No report");
    const lines = [];
    lines.push("# Auto-player session report");
    lines.push("");
    lines.push("- **Persona:** " + (report.meta?.personaId || "—"));
    lines.push("- **Session:** " + (report.meta?.sessionId || "—"));
    lines.push("- **Ascensions:** " + (report.global?.totalAscensions ?? 0));
    lines.push("- **Simulated clicks:** " + (report.global?.totalClicks ?? 0));
    lines.push(
        "- **Session wall time:** " +
            (report.global?.sessionWallSec ?? 0) +
            "s · **Gap time:** " +
            (report.global?.totalGapSec ?? 0) +
            "s (" +
            (report.global?.gapPctGlobal ?? 0) +
            "%)"
    );
    if (report.global?.longestGap) {
        const lg = report.global.longestGap;
        lines.push(
            "- **Longest gap:** " +
                Math.round(lg.gapMs / 1000) +
                "s (" +
                lg.fromType +
                " → " +
                lg.toType +
                ", phase " +
                lg.phase +
                ")"
        );
    }
    lines.push("");
    lines.push("## Plan comparison");
    lines.push("");
    lines.push("| Phase | Ascensions | Target | Max peak at ascend | Wall (s) | Gap % |");
    lines.push("|-------|------------|--------|--------------------|----------|-------|");
    for (const row of report.planComparison || []) {
        lines.push(
            "| " +
                row.phase +
                " | " +
                row.ascensionsInPhase +
                " | " +
                (row.ascensionTargetLabel || "—") +
                " | " +
                (row.maxPeakAtAscend > 0 ? row.maxPeakAtAscend.toExponential(2) : "—") +
                " | " +
                row.wallTimeSec +
                " | " +
                Math.round(row.gapPct * 10) / 10 +
                "% |"
        );
    }
    lines.push("");
    lines.push("## Ascensions");
    lines.push("");
    for (const a of report.ascensions || []) {
        lines.push(
            "- #" +
                a.index +
                " phase " +
                a.phase +
                " · peak " +
                (a.peakTotalAtAscend > 0 ? a.peakTotalAtAscend.toExponential(2) : "0") +
                " · gain " +
                (a.ascensionGain ?? "—")
        );
    }
    return lines.join("\n");
}
