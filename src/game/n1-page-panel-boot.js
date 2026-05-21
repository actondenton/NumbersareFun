/**
 * Page modal routing (achievements, unlocks, messages, combinations, ascension, overview).
 *
 * @param {object} deps
 */
export function createN1PagePanelBoot(deps) {
    const {
        getPagePanelEl,
        getPagePanelTitleEl,
        getPagePanelBodyEl,
        getPageModalEl,
        teardownAscensionMapPanZoom,
        closeInlineMainStagePanels,
        renderComingSoonPoster,
        formatCount,
        TURBO_UNLOCK_COUNT,
        renderMessageAndStoryLogPageHtml,
        renderCombinationsPageHtml,
        renderAscensionPageHtml,
        renderGlobalOverview,
        syncPhase1MassFillCssVars,
        syncPhase1TesseractCanvasesInRoot,
        syncMessageLogScrollContainerMode,
        syncInlinePanelsVsGameplay,
        scrollMessageLogPanelToBottom,
        markCombinationsPanelOpenedClock,
        updateEarnedBonusesUI,
        updateComboDiscoveryMilestonePanelIfOpen,
        getAscensionPageActiveNumber,
        getNumber1HasAscended,
        initAscensionMapPanZoom
    } = deps;

    function showPagePanel(pageId) {
        const pagePanelEl = getPagePanelEl();
        const pagePanelTitleEl = getPagePanelTitleEl();
        const pagePanelBodyEl = getPagePanelBodyEl();
        if (!pagePanelEl || !pagePanelTitleEl || !pagePanelBodyEl) return;
        teardownAscensionMapPanZoom();
        closeInlineMainStagePanels({ keep: "page" });
        let title = "";
        let bodyHtml = "";
        if (pageId === "achievements") {
            title = "Achievements";
            bodyHtml = renderComingSoonPoster("Achievement boards", "<p>Global and per-number achievement lists, filters, and rewards will live here.</p>" +
                "<p class=\"coming-soon-note\">Until then, <strong>Combo Catalog</strong> details and combo multipliers are on the <strong>Combinations</strong> page.</p>");
        } else if (pageId === "unlocks") {
            title = "Unlocks";
            bodyHtml = renderComingSoonPoster("Unlock atlas", "<p>A full unlock tree (hands, turbo, numbers, and cross-number gates) will be mapped here with clearer progress links.</p>") +
                "<div class=\"coming-soon-sneak-peek\"><p class=\"coming-soon-sneak-title\">Preview — current progression hooks</p><ul>" +
                "<li>Hands 2–10 via total count milestones</li>" +
                "<li>Turbo Boost at " + formatCount(TURBO_UNLOCK_COUNT) + "</li>" +
                "<li>More number modules as they are built</li></ul></div>";
        } else if (pageId === "collectibles") {
            title = "Collectibles";
            bodyHtml = renderComingSoonPoster("Collectibles vault", "<p>Collectibles with unique art, benefits, and cross-number synergies are planned. Each will be earned or unlocked through its own path.</p>");
        } else if (pageId === "messages") {
            title = "Message and Story Log";
            bodyHtml = renderMessageAndStoryLogPageHtml();
        } else if (pageId === "combinations") {
            title = "Combinations";
            bodyHtml = renderCombinationsPageHtml();
        } else if (pageId === "ascension") {
            title = "Ascension";
            bodyHtml = renderAscensionPageHtml();
        } else if (pageId === "overview") {
            title = "Global Overview";
            bodyHtml = renderGlobalOverview();
        } else {
            title = "Global Overview";
            bodyHtml = renderGlobalOverview();
        }
        pagePanelTitleEl.textContent = title;
        pagePanelBodyEl.innerHTML = bodyHtml;
        if (pageId === "ascension") {
            syncPhase1MassFillCssVars();
            syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
        }
        const pageModalEl = getPageModalEl();
        if (pageModalEl) pageModalEl.classList.toggle("page-modal--wide", pageId === "overview" || pageId === "combinations" || pageId === "ascension");
        syncMessageLogScrollContainerMode(pageId);
        pagePanelEl.dataset.openPageId = pageId;
        pagePanelEl.style.display = "block";
        syncInlinePanelsVsGameplay();
        if (pageId === "messages") {
            requestAnimationFrame(() => scrollMessageLogPanelToBottom());
        }
        if (pageId === "combinations") {
            markCombinationsPanelOpenedClock();
            requestAnimationFrame(() => {
                updateEarnedBonusesUI();
                updateComboDiscoveryMilestonePanelIfOpen();
            });
        }
        if (pageId === "ascension" && getAscensionPageActiveNumber() === 1 && getNumber1HasAscended()) {
            requestAnimationFrame(() => initAscensionMapPanZoom());
        }
    }

    return { showPagePanel };
}
