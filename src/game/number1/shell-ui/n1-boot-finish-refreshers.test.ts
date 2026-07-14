import { describe, expect, it, vi } from "vitest";

import { buildNumber1BootFinishRefreshers } from "./n1-boot-finish-refreshers.js";

describe("buildNumber1BootFinishRefreshers", () => {
    it("returns refreshers including forced turbo UI update", () => {
        const updateTurboBoostUI = vi.fn();
        const refreshers = buildNumber1BootFinishRefreshers({
            updateObjectives: () => {},
            updateMilestoneUI: () => {},
            updateTurboBoostUI,
            updateRateDisplay: () => {},
            updateSlowdownUpgradeUI: () => {},
            updateTimeWarpAuraUI: () => {},
            updateEarnedBonusesUI: () => {},
            updatePageButtonUnlocks: () => {},
            updateNumber2SidebarUnlockUI: () => {},
            maybeShowFirstAscensionIntroOnUnlock: () => {},
            syncPhase1MassFillCssVars: () => {}
        });
        expect(refreshers).toHaveLength(11);
        refreshers[2]();
        expect(updateTurboBoostUI).toHaveBeenCalledWith({ force: true });
    });
});
