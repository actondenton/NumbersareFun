import {
    createClosedStoryBannerRecord,
    getNextPendingStoryBanner,
    getStoryBannerById as getStoryBannerByIdFromList,
    hasUnlockedStoryBanner as hasUnlockedStoryBannerFromState,
    renderStoryArchiveHtml as renderStoryArchiveHtmlForState
} from "./n1-story.js";

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
        deps.storyReviewListEl.innerHTML = renderStoryArchiveHtmlForState(
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
