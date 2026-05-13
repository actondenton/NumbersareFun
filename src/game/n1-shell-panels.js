/**
 * Inline settings + page panel layout: DOM placement, gameplay column visibility, teardown hooks.
 */

/**
 * @param {{
 *   pagePanelEl: HTMLElement | null | undefined,
 *   settingsPanelEl: HTMLElement | null | undefined,
 *   playStageEl: HTMLElement | null | undefined,
 *   pageModalEl: HTMLElement | null | undefined,
 *   getUpgradeContainer: () => HTMLElement | null | undefined,
 *   teardownAscensionMapPanZoom: () => void,
 * }} deps
 */
export function createShellPanelsUi(deps) {
    const {
        pagePanelEl,
        settingsPanelEl,
        playStageEl,
        pageModalEl,
        getUpgradeContainer,
        teardownAscensionMapPanZoom
    } = deps;

    function isPagePanelOpen() {
        return !!pagePanelEl && pagePanelEl.style.display !== "none";
    }
    function isSettingsPanelOpen() {
        return !!settingsPanelEl && settingsPanelEl.style.display !== "none";
    }
    function syncInlinePanelsVsGameplay() {
        const upgradeContainer = getUpgradeContainer();
        if (!upgradeContainer) return;
        const panelOpen = isPagePanelOpen() || isSettingsPanelOpen();
        upgradeContainer.style.display = panelOpen ? "none" : "";
        const topCountRow = document.querySelector(".top-count-row");
        if (topCountRow) {
            const wideReading = isPagePanelOpen() && pagePanelEl &&
                (pagePanelEl.dataset.openPageId === "overview" || pagePanelEl.dataset.openPageId === "ascension");
            topCountRow.style.display = wideReading ? "none" : "";
        }
    }
    function closeInlineMainStagePanels(opts) {
        const keep = (opts && opts.keep) || "";
        if (settingsPanelEl && keep !== "settings") settingsPanelEl.style.display = "none";
        if (pagePanelEl && keep !== "page") {
            const wasAscension = pagePanelEl.dataset.openPageId === "ascension";
            pagePanelEl.style.display = "none";
            delete pagePanelEl.dataset.openPageId;
            if (wasAscension) teardownAscensionMapPanZoom();
        }
        syncInlinePanelsVsGameplay();
    }
    function initInlineRightPanels() {
        if (!playStageEl) return;
        /** insertBefore(ref) requires ref be a direct child of #play-stage; #upgrade-container lives under #number1-stage-root. */
        function playStageInlineInsertBeforeRef() {
            const upgradeContainer = getUpgradeContainer();
            if (upgradeContainer && upgradeContainer.parentElement === playStageEl) return upgradeContainer;
            const n1 = document.getElementById("number1-stage-root");
            if (n1 && n1.parentElement === playStageEl) return n1;
            const n2 = document.getElementById("number2-stage");
            if (n2 && n2.parentElement === playStageEl) return n2;
            return null;
        }
        const inlinePanelRef = playStageInlineInsertBeforeRef();
        if (settingsPanelEl) {
            settingsPanelEl.classList.add("settings-panel--inline");
            settingsPanelEl.setAttribute("aria-modal", "false");
            if (settingsPanelEl.parentElement !== playStageEl) playStageEl.insertBefore(settingsPanelEl, inlinePanelRef);
        }
        if (pagePanelEl) {
            pagePanelEl.classList.add("page-panel--inline");
            pagePanelEl.setAttribute("aria-modal", "false");
            if (pagePanelEl.parentElement !== playStageEl) playStageEl.insertBefore(pagePanelEl, inlinePanelRef);
        }
        if (pageModalEl) pageModalEl.classList.add("page-modal--inline");
        syncInlinePanelsVsGameplay();
    }

    /** Message log uses a taller modal backdrop for scroll room. */
    function syncMessageLogScrollContainerMode(pageId) {
        if (!pageModalEl) return;
        pageModalEl.classList.toggle("page-modal--messages", pageId === "messages");
    }

    return {
        isPagePanelOpen,
        isSettingsPanelOpen,
        syncInlinePanelsVsGameplay,
        closeInlineMainStagePanels,
        initInlineRightPanels,
        syncMessageLogScrollContainerMode
    };
}
