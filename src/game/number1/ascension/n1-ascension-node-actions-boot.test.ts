import { describe, expect, it, vi } from "vitest";

import { wireNumber1AscensionNodeActions } from "./n1-ascension-node-actions-boot.js";

function baseDep(overrides: Record<string, unknown> = {}) {
    let nodeIds: string[] = [];
    let essence = 100;
    return {
        getNumber1HasAscended: () => true,
        getNumber1AscensionNodeIds: () => nodeIds,
        setNumber1AscensionNodeIds: (ids: string[]) => { nodeIds = ids; },
        getNumber1AscensionEssence: () => essence,
        addNumber1AscensionEssence: (delta: number) => { essence += delta; },
        getAscensionMapNodeById: () => ({
            asc_ix_00: { id: "asc_ix_00", finger: "index", grants: {} }
        }),
        getAscensionPurchaseChainInfoToNode: () => ({
            targetOwned: false,
            missingCost: 50,
            missingOrdered: ["asc_ix_00"]
        }),
        ascensionNodeDisplayName: (id: string) => id,
        getAscensionNodePurchaseCost: () => 10,
        addToLog: vi.fn(),
        formatCount: (n: number) => String(n),
        autosaveNow: vi.fn(),
        applyAscensionHandUnlockStartingCountFloorToUnlockedHands: vi.fn(),
        applyAscensionAutobuyGrantToUnlockedHands: vi.fn(),
        updateCheapenUpgradeUI: vi.fn(),
        updateTurboBoostUI: vi.fn(),
        updateRateDisplay: vi.fn(),
        updateTimeWarpAuraUI: vi.fn(),
        getPhase1MapCollapseSeen: () => true,
        isNumber1AscensionTreeFullyPurchased: () => false,
        refreshOverviewAndAscensionPanelsIfOpen: vi.fn(),
        tryTurboLevelerPurchases: vi.fn(),
        checkStoryBanners: vi.fn(),
        hasBlackHoleProgressLockingRespec: () => false,
        isBlackHoleArcUnlocked: () => false,
        resetBlackHolePhaseToZero: vi.fn(),
        resetTurboLevelerBank: vi.fn(),
        getAscensionMapCollapseActiveUntilMs: () => 0,
        setAscensionMapCollapseActiveUntilMs: vi.fn(),
        getAscensionMapCollapsePending: () => false,
        setAscensionMapCollapsePending: vi.fn(),
        getAscensionMapCollapseTimerId: () => 0,
        setAscensionMapCollapseTimerId: vi.fn(),
        getStoryBannerOverlayEl: () => null,
        getStoryBannerById: () => null,
        showStoryBanner: vi.fn(),
        ensureBlackHoleArcStarted: vi.fn(),
        refreshAscensionPanelIfOpen: vi.fn(),
        ...overrides
    };
}

describe("wireNumber1AscensionNodeActions", () => {
    it("no-ops buy when not ascended", () => {
        const dep = baseDep({ getNumber1HasAscended: () => false });
        const actions = wireNumber1AscensionNodeActions(dep);
        actions.tryBuyAscensionNode("asc_ix_00");
        expect(dep.addToLog).not.toHaveBeenCalled();
    });

    it("dedupes invalid ascension node ids", () => {
        const dep = baseDep();
        dep.setNumber1AscensionNodeIds(["asc_ix_00", "asc_ix_00", "missing"]);
        const actions = wireNumber1AscensionNodeActions(dep);
        actions.normalizeAscensionNodeIds();
        expect(dep.getNumber1AscensionNodeIds()).toEqual(["asc_ix_00"]);
    });

    it("refunds essence on full respec", () => {
        const dep = baseDep();
        dep.setNumber1AscensionNodeIds(["asc_ix_00"]);
        const actions = wireNumber1AscensionNodeActions(dep);
        actions.respecNumber1AscensionSkillTrees();
        expect(dep.getNumber1AscensionNodeIds()).toEqual([]);
        expect(dep.getNumber1AscensionEssence()).toBe(110);
        expect(dep.resetTurboLevelerBank).toHaveBeenCalled();
    });
});
