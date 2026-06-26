export function buildComboIndexLiveSummaryText(ctx) {
    return "Discovered " + ctx.discoveredCount + " / " + ctx.available.length + ". Currently active: " + (ctx.activeNow.size > 0 ? Array.from(ctx.activeNow).join(", ") : "None") + ".";
}

export function buildComboIndexListItemsHtml(ctx, formatCount) {
    const listItems = ctx.rows.map(combo => {
        const found = ctx.discovered.has(combo.name);
        const css = found ? "earned-bonus-item-earned" : "earned-bonus-undiscovered";
        const activeBadge = ctx.activeNow.has(combo.name) ? " <span class=\"overview-card-badge overview-card-badge--live\">Active</span>" : "";
        const pulseEdges = (ctx.comboActivationCounts && ctx.comboActivationCounts[combo.name]) || 0;
        return "<li class=\"" + css + "\"><strong>" + combo.name + "</strong>" + activeBadge + "<div>Hands: " + combo.minHands + " · Effect: x" + combo.bonus.toFixed(2) + " · Pulse count (edges): " + formatCount(pulseEdges) + "</div></li>";
    }).join("");
    return listItems || "<li class=\"earned-bonuses-placeholder\">No combinations match the current filters.</li>";
}

export function buildComboHandStatusCardsHtml(rows, formatters) {
    if (!Array.isArray(rows) || rows.length < 1) return "<li class=\"combo-hand-status-empty\">No hands.</li>";
    const formatCount = formatters.formatCount;
    const formatCps = formatters.formatCps;
    return rows.map(row => {
        const handNumber = row.handIndex + 1;
        const formula = "base × combo × turbo × Compaction: " + formatCps(row.baseCps) + " × " +
            row.comboFactor.toFixed(2) + " × " + row.turboFactor.toFixed(2) + " × " + row.slowdownFactor.toFixed(2) + " = " + formatCps(row.effectiveCps);
        return "<li class=\"combo-hand-status-card\" data-hand-index=\"" + row.handIndex + "\">" +
            "<div class=\"combo-hand-status-card-title\">Hand " + handNumber + "</div>" +
            "<div class=\"combo-hand-status-line\"><span class=\"hand-status-k\">Count</span> <span class=\"hand-status-v\">" + formatCount(row.balance) + "</span></div>" +
            "<div class=\"combo-hand-status-line\"><span class=\"hand-status-k\">Base CPS</span> <span class=\"hand-status-v\">" + formatCps(row.baseCps) + "</span></div>" +
            "<div class=\"combo-hand-status-line\"><span class=\"hand-status-k\">Effective CPS</span> <span class=\"hand-status-v\">" + formatCps(row.effectiveCps) + "</span></div>" +
            "<div class=\"combo-hand-status-formula\">" + formula + "</div>" +
            "<div class=\"combo-hand-status-compact\">Hand " + handNumber + ": " + formatCount(row.balance) + " · " + formatCps(row.rawCps) + " → " + formatCps(row.effectiveCps) + "</div>" +
            "</li>";
    }).join("");
}

export function renderComboPagePerHandStatusSectionHtml(rows, formatters) {
    return "<div class=\"combo-per-hand-status\" role=\"region\" aria-label=\"Per-hand production\">" +
        "<p class=\"combo-per-hand-status-title\">Per-hand production</p>" +
        "<p class=\"combo-per-hand-status-note\">These values use the same throttled refresh as the main hand rows (typically a few times per second) so the tab stays responsive.</p>" +
        "<ul id=\"combo-per-hand-status-list\" class=\"combo-hand-status-grid\">" + buildComboHandStatusCardsHtml(rows, formatters) + "</ul></div>";
}
