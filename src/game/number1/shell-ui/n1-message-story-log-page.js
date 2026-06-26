/**
 * Message log + story archive page HTML and incremental refresh (Phase 21c).
 *
 * @param {object} dep
 */
export function createMessageStoryLogPageBoot(dep) {
    function renderMessageLogPageHtml() {
        return dep.logTickerRt.renderMessageLogPageHtml(dep.escapeHtml);
    }

    function renderStoryArchiveHtml() {
        return dep.renderStoryArchiveHtmlForState(
            dep.getStoryBanners(),
            dep.story.closedBanners,
            dep.story.shownBannerIds
        );
    }

    function renderMessageAndStoryLogPageHtml() {
        return "<section class=\"message-log-section\" aria-label=\"Message Log\">" +
            "<h4 class=\"story-log-heading\">Message Log</h4>" +
            renderMessageLogPageHtml() +
            "</section>" +
            renderStoryArchiveHtml();
    }

    function refreshStoryArchiveSectionIfOpen() {
        const pagePanelEl = dep.pagePanelEl;
        if (!pagePanelEl || pagePanelEl.style.display === "none" || pagePanelEl.dataset.openPageId !== "messages") {
            return;
        }
        const pagePanelBodyEl = dep.pagePanelBodyEl;
        const section = pagePanelBodyEl ? pagePanelBodyEl.querySelector(".story-log-section") : null;
        if (section) section.outerHTML = renderStoryArchiveHtml();
    }

    function scrollMessageLogPanelToBottom() {
        const body = document.getElementById("message-log-terminal-body");
        if (body) body.scrollTop = body.scrollHeight;
    }

    return {
        renderMessageAndStoryLogPageHtml,
        refreshStoryArchiveSectionIfOpen,
        scrollMessageLogPanelToBottom
    };
}
