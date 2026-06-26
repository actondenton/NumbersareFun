export const LOG_CATEGORIES = ["tip", "fact", "milestone", "warning", "humor", "system"];

export function normalizeLogCategory(category) {
    if (LOG_CATEGORIES.indexOf(category) !== -1) return category;
    if (category === "action") return "milestone";
    if (category === "message") return "fact";
    return "fact";
}

export function isLogCategoryVisible(category, humorEnabled) {
    const cat = normalizeLogCategory(category);
    if (cat === "humor" && !humorEnabled) return false;
    return true;
}

export function logCategoryTag(category) {
    const c = normalizeLogCategory(category);
    if (c === "tip") return "TIP";
    if (c === "fact") return "FACT";
    if (c === "milestone") return "MILESTONE";
    if (c === "warning") return "WARN";
    if (c === "humor") return "JOKE";
    if (c === "system") return "SYSTEM";
    return "LOG";
}

export function getVisibleLogEntries(entries, humorEnabled) {
    return entries.filter(entry => isLogCategoryVisible(entry.category, humorEnabled));
}

export function getLogEntrySig(entry) {
    return entry ? entry.category + "\n" + entry.text : "";
}

export function renderMessageLogLineHtml(entry, escapeHtml) {
    return "<div class=\"message-log-line message-log-cat-" + entry.category + "\" data-log-category=\"" + entry.category + "\">" +
        "<span class=\"message-log-tag\">[" + logCategoryTag(entry.category) + "]</span>" +
        "<span class=\"message-log-text\">" + escapeHtml(entry.text) + "</span></div>";
}

export function renderMessageLogPageHtml(visibleEntries, escapeHtml) {
    if (visibleEntries.length === 0) {
        return "<div class=\"message-log-terminal message-log-terminal--empty\" role=\"log\" aria-relevant=\"additions\">" +
            "<div class=\"message-log-terminal-header\" id=\"message-log-terminal-header\">message_feed // 0 line(s) visible</div>" +
            "<div class=\"message-log-terminal-body message-log-terminal-body--empty\" id=\"message-log-terminal-body\">" +
            "<p class=\"message-log-empty\">No messages yet. Tips, facts, milestones, and system notices will appear here as you play. Humor lines respect Settings → Humor messages.</p>" +
            "<p class=\"coming-soon-note coming-soon-note--compact\">Filters, search, and save export for this log — <span class=\"coming-soon-inline\">coming soon</span>.</p>" +
            "</div></div>" +
            "<p class=\"message-log-footnote\">Bottom ticker shows the latest lines; this panel is the full scrollback (oldest → newest).</p>";
    }
    const lines = visibleEntries.map(entry => renderMessageLogLineHtml(entry, escapeHtml)).join("");
    return "<div class=\"message-log-terminal\" role=\"log\" aria-relevant=\"additions\">" +
        "<div class=\"message-log-terminal-header\" id=\"message-log-terminal-header\">message_feed // " + visibleEntries.length + " line(s) visible</div>" +
        "<div class=\"message-log-terminal-body\" id=\"message-log-terminal-body\">" + lines + "</div></div>" +
        "<p class=\"message-log-footnote\">Bottom ticker shows the latest lines; this panel is the full scrollback (oldest → newest).</p>";
}
