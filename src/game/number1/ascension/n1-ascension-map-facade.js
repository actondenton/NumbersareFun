/**
 * Thin delegates from boot to ascension map UI (Phase 21c).
 *
 * @param {ReturnType<typeof import("./n1-ascension-map-ui.js").createAscensionMapUi>} ascMapUi
 * @param {{ getNumber1AscensionNodeIds: () => string[] }} [catalogDep]
 */
export function createAscensionMapFacade(ascMapUi, catalogDep) {
    function getAscensionEssenceInvestedInNodes() {
        if (!catalogDep) return 0;
        let sum = 0;
        catalogDep.getNumber1AscensionNodeIds().forEach(id => {
            const c = ascMapUi.getAscensionNodePurchaseCost(id);
            if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) sum += c;
        });
        return sum;
    }

    return {
        computeAscensionHandLayout() {
            return ascMapUi.computeAscensionHandLayout();
        },
        renderAscensionMapColumnGuidesSvg(vbH) {
            return ascMapUi.renderAscensionMapColumnGuidesSvg(vbH);
        },
        renderAscensionMapEdgesSvg(layout) {
            return ascMapUi.renderAscensionMapEdgesSvg(layout);
        },
        syncAscensionMapNodeDomPositions() {
            ascMapUi.syncAscensionMapNodeDomPositions();
        },
        ascensionResolveNodeIdAtClient(clientX, clientY) {
            return ascMapUi.ascensionResolveNodeIdAtClient(clientX, clientY);
        },
        updateAscensionMapDetailPanel() {
            ascMapUi.updateAscensionMapDetailPanel();
        },
        setAscensionMapSelectedNode(id, skipIfSame) {
            ascMapUi.setAscensionMapSelectedNode(id, skipIfSame);
        },
        teardownAscensionMapPanZoom() {
            ascMapUi.teardownAscensionMapPanZoom();
        },
        initAscensionMapPanZoom() {
            ascMapUi.initAscensionMapPanZoom();
        },
        renderAscensionMapDebugOverlaySvg() {
            return ascMapUi.renderAscensionMapDebugOverlaySvg();
        },
        getAscensionMapViewBoxHeight() {
            return ascMapUi.getAscensionMapViewBoxHeight();
        },
        getAscensionNodePurchaseCost(id) {
            return ascMapUi.getAscensionNodePurchaseCost(id);
        },
        ascensionNodePrereqsMet(id) {
            return ascMapUi.ascensionNodePrereqsMet(id);
        },
        getAscensionEssenceInvestedInNodes
    };
}
