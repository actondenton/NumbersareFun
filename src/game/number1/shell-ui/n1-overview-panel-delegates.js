/**
 * Forward-ref holder + hoisted delegates for overview/ascension panel refresh (Phase 21c).
 */
export function createOverviewPanelDelegates() {
    const ref = {
        refreshGlobalOverviewPanelIfOpen() {},
        patchNumber1AscendControlIfOpen() {},
        refreshAscensionPanelIfOpen() {},
        refreshOverviewAndAscensionPanelsIfOpen() {},
        refreshOverviewAndAscensionHubLiveIfOpen() {},
        patchGlobalOverviewLiveDom() {},
        patchAscensionPanelLiveDom() {}
    };

    function refreshGlobalOverviewPanelIfOpen() {
        ref.refreshGlobalOverviewPanelIfOpen();
    }
    function patchNumber1AscendControlIfOpen() {
        ref.patchNumber1AscendControlIfOpen();
    }
    function refreshAscensionPanelIfOpen() {
        ref.refreshAscensionPanelIfOpen();
    }
    function refreshOverviewAndAscensionPanelsIfOpen() {
        ref.refreshOverviewAndAscensionPanelsIfOpen();
    }
    function refreshOverviewAndAscensionHubLiveIfOpen() {
        ref.refreshOverviewAndAscensionHubLiveIfOpen();
    }
    function patchGlobalOverviewLiveDom() {
        ref.patchGlobalOverviewLiveDom();
    }
    function patchAscensionPanelLiveDom() {
        ref.patchAscensionPanelLiveDom();
    }

    return {
        ref,
        refreshGlobalOverviewPanelIfOpen,
        patchNumber1AscendControlIfOpen,
        refreshAscensionPanelIfOpen,
        refreshOverviewAndAscensionPanelsIfOpen,
        refreshOverviewAndAscensionHubLiveIfOpen,
        patchGlobalOverviewLiveDom,
        patchAscensionPanelLiveDom
    };
}
