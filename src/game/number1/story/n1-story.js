export function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function getStoryBannerById(banners, id) {
    return banners.find(b => b.id === id) || null;
}

export function hasUnlockedStoryBanner(id, shownBannerIds, closedBanners) {
    return shownBannerIds.has(id) || closedBanners.some(b => b && b.id === id);
}

export function getNextPendingStoryBanner(banners, shownBannerIds) {
    const pending = banners.filter(b => !shownBannerIds.has(b.id) && b.trigger());
    pending.sort((a, b) => a.order - b.order);
    return pending[0] || null;
}

export function silentlyAcknowledgeStoryBanner(banner, shownBannerIds, closedBanners, closedAt) {
    if (!banner || shownBannerIds.has(banner.id)) return false;
    shownBannerIds.add(banner.id);
    closedBanners.push(createClosedStoryBannerRecord(banner, closedAt));
    return true;
}

export function silentlyAcknowledgeEligibleStoryBanners(banners, shownBannerIds, closedBanners, closedAt) {
    let count = 0;
    let next = getNextPendingStoryBanner(banners, shownBannerIds);
    while (next) {
        if (silentlyAcknowledgeStoryBanner(next, shownBannerIds, closedBanners, closedAt)) count++;
        next = getNextPendingStoryBanner(banners, shownBannerIds);
    }
    return count;
}

/** Story banner ids to auto-acknowledge when dev-jumping to a black-hole phase (skip past arc beats). */
export function getBlackHoleDevJumpStoryBannerIdsForPhase(phase) {
    const p = Math.max(0, Math.min(7, Math.floor(Number(phase) || 0)));
    if (p <= 0) return [];
    const ids = ["black-hole-mass-accumulator-intro", "ascension-map-collapse-ready"];
    if (p >= 2) ids.push("black-hole-phase-1-collapse");
    if (p >= 3) ids.push("black-hole-phase-2-disk");
    if (p >= 4) ids.push("black-hole-phase-3-wave");
    if (p >= 5) ids.push("black-hole-phase-4-furnace");
    if (p >= 6) {
        ids.push("black-hole-phase-5-jets");
        ids.push("black-hole-first-digest");
    }
    if (p >= 7) ids.push("black-hole-phase-6-evaporation");
    return ids;
}

export function silentlyAcknowledgeStoryBannerIds(bannerIds, banners, shownBannerIds, closedBanners, closedAt) {
    let count = 0;
    for (const id of bannerIds) {
        const banner = getStoryBannerById(banners, id);
        if (silentlyAcknowledgeStoryBanner(banner, shownBannerIds, closedBanners, closedAt)) count++;
    }
    return count;
}

export function createClosedStoryBannerRecord(banner, closedAt) {
    return {
        id: banner.id,
        order: banner.order,
        title: banner.title,
        body: banner.body,
        closedAt
    };
}

export function getStoryArchiveChapters(banners, closedBanners) {
    const canonicalIds = new Set(banners.map(b => b.id));
    const legacyClosed = closedBanners.filter(b => b && b.id && !canonicalIds.has(b.id));
    return [...banners, ...legacyClosed].sort((a, b) => a.order - b.order);
}

export function renderStoryArchiveHtml(banners, closedBanners, shownBannerIds) {
    const chapters = getStoryArchiveChapters(banners, closedBanners);
    const unlockedCount = chapters.filter(b => hasUnlockedStoryBanner(b.id, shownBannerIds, closedBanners)).length;
    let html = "<section class=\"story-log-section\" aria-label=\"Story Archive\">" +
        "<h4 class=\"story-log-heading\">Story Archive</h4>" +
        "<p class=\"story-review-summary\">" + unlockedCount + " / " + chapters.length + " transmissions recovered.</p>" +
        "<div class=\"story-review-list story-review-list--embedded\">";
    chapters.forEach((b, index) => {
        const unlocked = hasUnlockedStoryBanner(b.id, shownBannerIds, closedBanners);
        html += "<div class=\"story-review-item" + (unlocked ? " story-review-item--unlocked" : " story-review-item--locked") + "\">";
        if (unlocked) {
            html += "<div class=\"story-review-item-head\"><span class=\"story-review-item-kicker\">Transmission " + (index + 1) + "</span><button type=\"button\" class=\"story-review-replay\" data-story-replay-id=\"" + escapeHtml(b.id) + "\">Replay</button></div><strong class=\"story-review-item-title\">" + escapeHtml(b.title) + "</strong><p class=\"story-review-item-body\">" + escapeHtml(b.body) + "</p>";
        } else {
            html += "<div class=\"story-review-item-head\"><span class=\"story-review-item-kicker\">Transmission " + (index + 1) + "</span><span class=\"story-review-locked-tag\">Locked</span></div><strong class=\"story-review-item-title\">???</strong><p class=\"story-review-item-body\">Signal not yet recovered. Keep counting to unlock this story beat.</p>";
        }
        html += "</div>";
    });
    html += "</div></section>";
    return html;
}
