import { renderComingSoonPoster } from "./n1-coming-soon-poster.js";

/**
 * Right-rail page panel router (achievements, messages, ascension, etc.) — Phase 21c.
 *
 * @param {object} dep
 */
export function createPagePanelBoot(dep) {
    function showPagePanel(pageId) {
        const pagePanelEl = dep.pagePanelEl;
        const pagePanelTitleEl = dep.pagePanelTitleEl;
        const pagePanelBodyEl = dep.pagePanelBodyEl;
        if (!pagePanelEl || !pagePanelTitleEl || !pagePanelBodyEl) return;

        dep.teardownAscensionMapPanZoom();
        dep.closeInlineMainStagePanels({ keep: "page" });

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
                "<li>Turbo Boost at " + dep.formatCount(dep.turboUnlockCount) + "</li>" +
                "<li>More number modules as they are built</li></ul></div>";
        } else if (pageId === "collectibles") {
            title = "Collectibles";
            bodyHtml = renderComingSoonPoster("Collectibles vault", "<p>Collectibles with unique art, benefits, and cross-number synergies are planned. Each will be earned or unlocked through its own path.</p>");
        } else if (pageId === "messages") {
            title = "Message and Story Log";
            bodyHtml = dep.renderMessageAndStoryLogPageHtml();
        } else if (pageId === "combinations") {
            title = "Combinations";
            bodyHtml = dep.comboForward.renderCombinationsPageHtml();
        } else if (pageId === "ascension") {
            title = "Ascension";
            bodyHtml = dep.renderAscensionPageHtml();
        } else if (pageId === "overview") {
            title = "Global Overview";
            bodyHtml = dep.renderGlobalOverview();
        } else {
            title = "Global Overview";
            bodyHtml = dep.renderGlobalOverview();
        }

        pagePanelTitleEl.textContent = title;
        pagePanelBodyEl.innerHTML = bodyHtml;

        if (pageId === "ascension") {
            dep.syncPhase1MassFillCssVars();
            dep.syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
        }

        const pageModalEl = dep.pageModalEl;
        if (pageModalEl) {
            pageModalEl.classList.toggle(
                "page-modal--wide",
                pageId === "overview" || pageId === "combinations" || pageId === "ascension"
            );
        }

        dep.syncMessageLogScrollContainerMode(pageId);
        pagePanelEl.dataset.openPageId = pageId;
        pagePanelEl.style.display = "block";
        dep.syncInlinePanelsVsGameplay();

        if (pageId === "messages") {
            requestAnimationFrame(() => dep.scrollMessageLogPanelToBottom());
        }
        if (pageId === "combinations") {
            dep.comboForward.markCombinationsPanelOpenedClock();
            requestAnimationFrame(() => {
                dep.comboForward.updateEarnedBonusesUI();
                dep.comboForward.updateComboDiscoveryMilestonePanelIfOpen();
            });
        }
        if (pageId === "ascension" && dep.getAscensionPageActiveNumber() === 1 && dep.getNumber1HasAscended()) {
            requestAnimationFrame(() => dep.initAscensionMapPanZoom());
        }
    }

    return { showPagePanel };
}
