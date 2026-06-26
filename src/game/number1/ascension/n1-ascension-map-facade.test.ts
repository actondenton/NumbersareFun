import { describe, expect, it, vi } from "vitest";

import { createAscensionMapFacade } from "./n1-ascension-map-facade.js";

describe("createAscensionMapFacade", () => {
    it("delegates every method to ascMapUi", () => {
        const ascMapUi = {
            computeAscensionHandLayout: vi.fn(() => ({ hands: [] })),
            renderAscensionMapColumnGuidesSvg: vi.fn(() => "<guides/>"),
            renderAscensionMapEdgesSvg: vi.fn(() => "<edges/>"),
            syncAscensionMapNodeDomPositions: vi.fn(),
            ascensionResolveNodeIdAtClient: vi.fn(() => "n1"),
            updateAscensionMapDetailPanel: vi.fn(),
            setAscensionMapSelectedNode: vi.fn(),
            teardownAscensionMapPanZoom: vi.fn(),
            initAscensionMapPanZoom: vi.fn(),
            renderAscensionMapDebugOverlaySvg: vi.fn(() => "<debug/>"),
            getAscensionMapViewBoxHeight: vi.fn(() => 900),
            getAscensionNodePurchaseCost: vi.fn(() => 5),
            ascensionNodePrereqsMet: vi.fn(() => true)
        };
        const facade = createAscensionMapFacade(ascMapUi, {
            getNumber1AscensionNodeIds: () => ["a", "b"]
        });

        expect(facade.computeAscensionHandLayout()).toEqual({ hands: [] });
        expect(facade.renderAscensionMapColumnGuidesSvg(100)).toBe("<guides/>");
        expect(facade.renderAscensionMapEdgesSvg({})).toBe("<edges/>");
        facade.syncAscensionMapNodeDomPositions();
        expect(facade.ascensionResolveNodeIdAtClient(1, 2)).toBe("n1");
        facade.updateAscensionMapDetailPanel();
        facade.setAscensionMapSelectedNode("x", true);
        facade.teardownAscensionMapPanZoom();
        facade.initAscensionMapPanZoom();
        expect(facade.renderAscensionMapDebugOverlaySvg()).toBe("<debug/>");
        expect(facade.getAscensionMapViewBoxHeight()).toBe(900);
        expect(facade.getAscensionEssenceInvestedInNodes()).toBe(10);

        expect(ascMapUi.renderAscensionMapColumnGuidesSvg).toHaveBeenCalledWith(100);
        expect(ascMapUi.setAscensionMapSelectedNode).toHaveBeenCalledWith("x", true);
    });
});
