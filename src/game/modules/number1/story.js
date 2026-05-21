// Number 1 Story Module
// Merged from: n1-story.js, n1-story-banner-boot.js

// ==================== STORY HELPERS (from n1-story.js) ====================

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

// ==================== STORY BANNER BOOT (from n1-story-banner-boot.js) ====================

/** Story banner overlay + review panel wiring; copy rules live in `n1-story.js`. */
export function createNumber1StoryBannerBoot(deps) {
    let currentStoryBanner = null;
    let currentStoryBannerIsReplay = false;
    let currentStoryBannerOnClose = null;
    let replayStoryBannerPreviousPaused = false;

    function getStoryBannerById(id) {
        return getStoryBannerByIdFromList(deps.storyBanners, id);
    }
    function showStoryBannerById(id) {
        const banner = getStoryBannerById(id);
        if (banner) showStoryBanner(banner);
    }
    function hasUnlockedStoryBanner(id) {
        return hasUnlockedStoryBannerFromState(id, deps.shownBannerIds, deps.closedBanners);
    }
    function checkStoryBanners() {
        if (deps.gameplaySimFrozen()) return;
        const toShow = getNextPendingStoryBanner(deps.storyBanners, deps.shownBannerIds);
        if (toShow) showStoryBanner(toShow);
    }

    function showStoryBanner(banner, options) {
        options = options || {};
        currentStoryBanner = banner;
        currentStoryBannerIsReplay = !!options.isReplay;
        currentStoryBannerOnClose = typeof options.onClose === "function" ? options.onClose : null;
        replayStoryBannerPreviousPaused = currentStoryBannerIsReplay ? deps.getGamePaused() : false;
        deps.setGamePaused(true);
        if (deps.storyBannerTitleEl) deps.storyBannerTitleEl.textContent = banner.title;
        if (deps.storyBannerBodyEl) deps.storyBannerBodyEl.textContent = banner.body;
        if (deps.storyBannerOverlayEl) deps.storyBannerOverlayEl.style.display = "flex";
    }

    function renderStoryReviewList() {
        if (!deps.storyReviewListEl) return;
        deps.storyReviewListEl.innerHTML = renderStoryArchiveHtml(
            deps.storyBanners,
            deps.closedBanners,
            deps.shownBannerIds
        );
    }

    function closeStoryBanner() {
        if (!deps.storyBannerOverlayEl || deps.storyBannerOverlayEl.style.display !== "flex") return;
        const wasReplay = currentStoryBannerIsReplay;
        const onClose = currentStoryBannerOnClose;
        const closedBannerId = currentStoryBanner ? currentStoryBanner.id : null;
        if (currentStoryBanner) {
            if (!wasReplay) {
                deps.shownBannerIds.add(currentStoryBanner.id);
                deps.closedBanners.push(createClosedStoryBannerRecord(currentStoryBanner, Date.now()));
            }
            currentStoryBanner = null;
        }
        currentStoryBannerIsReplay = false;
        currentStoryBannerOnClose = null;
        deps.storyBannerOverlayEl.style.display = "none";
        if (!wasReplay &&
            deps.getAscensionMapCollapsePending &&
            deps.getAscensionMapCollapsePending() &&
            !deps.getNumber1BlackHoleState().phase1MapCollapseSeen &&
            closedBannerId === "ascension-map-collapse-ready") {
            deps.startAscensionMapCollapseTransition();
        }
        deps.setGamePaused(wasReplay ? replayStoryBannerPreviousPaused : false);
        replayStoryBannerPreviousPaused = false;
        renderStoryReviewList();
        if (!wasReplay) deps.refreshStoryArchiveSectionIfOpen();
        if (onClose) onClose();
        if (!wasReplay) checkStoryBanners();
    }

    function attachDomListeners() {
        if (deps.storyBannerCloseBtn) deps.storyBannerCloseBtn.addEventListener("click", closeStoryBanner);
        if (deps.storyReviewBtn && deps.storyReviewPanelEl) {
            deps.storyReviewBtn.addEventListener("click", () => {
                deps.storyReviewPanelEl.style.display = deps.storyReviewPanelEl.style.display === "none" ? "block" : "none";
                renderStoryReviewList();
            });
        }
        if (deps.storyReviewCloseBtn && deps.storyReviewPanelEl) {
            deps.storyReviewCloseBtn.addEventListener("click", () => { deps.storyReviewPanelEl.style.display = "none"; });
        }
        if (deps.storyReviewListEl) {
            deps.storyReviewListEl.addEventListener("click", e => {
                const replayBtn = e.target.closest("[data-story-replay-id]");
                if (!replayBtn) return;
                const banner = getStoryBannerById(replayBtn.getAttribute("data-story-replay-id"));
                if (banner && hasUnlockedStoryBanner(banner.id)) showStoryBanner(banner, { isReplay: true });
            });
        }
    }
    attachDomListeners();

    return {
        getStoryBannerById,
        showStoryBannerById,
        hasUnlockedStoryBanner,
        checkStoryBanners,
        showStoryBanner,
        closeStoryBanner,
        renderStoryReviewList
    };
}
