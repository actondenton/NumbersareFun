import { describe, expect, it, vi } from "vitest";

import { createPagePanelBoot } from "./n1-page-panel-boot.js";

function panelDep(overrides: Record<string, unknown> = {}) {
    const pagePanelEl = { style: { display: "" }, dataset: {} as Record<string, string> };
    const pagePanelTitleEl = { textContent: "" };
    const pagePanelBodyEl = { innerHTML: "" };
    const pageModalEl = { classList: { toggle: vi.fn() } };
    return {
        pagePanelEl,
        pagePanelTitleEl,
        pagePanelBodyEl,
        pageModalEl,
        teardownAscensionMapPanZoom: vi.fn(),
        closeInlineMainStagePanels: vi.fn(),
        renderMessageAndStoryLogPageHtml: () => "<messages/>",
        comboForward: {
            renderCombinationsPageHtml: () => "<combo/>",
            markCombinationsPanelOpenedClock: vi.fn(),
            updateEarnedBonusesUI: vi.fn(),
            updateComboDiscoveryMilestonePanelIfOpen: vi.fn()
        },
        renderAscensionPageHtml: () => "<asc/>",
        renderGlobalOverview: () => "<overview/>",
        formatCount: (n: number) => String(n),
        turboUnlockCount: 5000,
        syncPhase1MassFillCssVars: vi.fn(),
        syncPhase1TesseractCanvasesInRoot: vi.fn(),
        syncMessageLogScrollContainerMode: vi.fn(),
        syncInlinePanelsVsGameplay: vi.fn(),
        scrollMessageLogPanelToBottom: vi.fn(),
        getAscensionPageActiveNumber: () => 1,
        getNumber1HasAscended: () => true,
        initAscensionMapPanZoom: vi.fn(),
        ...overrides
    };
}

describe("createPagePanelBoot", () => {
    it("routes overview page to global overview html", () => {
        const dep = panelDep();
        const { showPagePanel } = createPagePanelBoot(dep);
        showPagePanel("overview");
        expect(dep.pagePanelTitleEl.textContent).toBe("Global Overview");
        expect(dep.pagePanelBodyEl.innerHTML).toBe("<overview/>");
        expect(dep.pagePanelEl.dataset.openPageId).toBe("overview");
        expect(dep.pagePanelEl.style.display).toBe("block");
    });

    it("renders coming-soon unlocks sneak peek with turbo threshold", () => {
        const dep = panelDep({ formatCount: (n: number) => `§${n}` });
        const { showPagePanel } = createPagePanelBoot(dep);
        showPagePanel("unlocks");
        expect(dep.pagePanelBodyEl.innerHTML).toContain("Turbo Boost at §5000");
        expect(dep.pagePanelBodyEl.innerHTML).toContain("coming-soon-poster");
    });

    it("runs ascension page mount hooks", () => {
        const dep = panelDep({ getNumber1HasAscended: () => false });
        const { showPagePanel } = createPagePanelBoot(dep);
        showPagePanel("ascension");
        expect(dep.pagePanelBodyEl.innerHTML).toBe("<asc/>");
        expect(dep.syncPhase1MassFillCssVars).toHaveBeenCalled();
        expect(dep.syncPhase1TesseractCanvasesInRoot).toHaveBeenCalledWith(dep.pagePanelBodyEl);
    });
});
