import { afterEach, describe, expect, it, vi } from "vitest";
import {
    applyNumber2SaveData,
    createNumber2Controller,
    createNumber2ModuleDefinition,
    createNumber2State,
    getNumber2SaveData
} from "./number2-game.js";

function formatCount(n: number): string {
    return String(n);
}

function makeController(state: ReturnType<typeof createNumber2State>, deps = {}) {
    return createNumber2Controller(state, {
        formatCount,
        addToLog: vi.fn(),
        autosaveNow: vi.fn(),
        refreshOverviewAndAscensionPanelsIfOpen: vi.fn(),
        refreshGlobalOverviewPanelIfOpen: vi.fn(),
        getCurrentNumberMode: () => 1,
        isUnlocked: () => true,
        getUpgrades: () => [],
        ...deps
    });
}

function stubDocument() {
    vi.stubGlobal("document", {
        getElementById: vi.fn(() => null)
    });
}

describe("number2 game state", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("round-trips save data and clamps loaded dice values", () => {
        const state = createNumber2State();
        state.totalStr = "1024";
        state.luck = 9;
        state.boomTokens = 3;
        state.bustTokens = 4;
        state.upgradeLevels = { hot_streak: 2 };
        state.started = true;
        state.ascensionEssence = 5;
        state.ascensionNodeIds = ["root", "left"];
        state.lastDieA = 6;
        state.lastDieB = 5;
        state.lastOutcome = "double";

        const saved = getNumber2SaveData(state);
        const loaded = createNumber2State();
        applyNumber2SaveData(loaded, { ...saved, lastDieA: 99, lastDieB: -7 });

        expect(loaded.totalStr).toBe("1024");
        expect(loaded.luck).toBe(9);
        expect(loaded.boomTokens).toBe(3);
        expect(loaded.bustTokens).toBe(4);
        expect(loaded.upgradeLevels).toEqual({ hot_streak: 2 });
        expect(loaded.started).toBe(true);
        expect(loaded.ascensionEssence).toBe(5);
        expect(loaded.ascensionNodeIds).toEqual(["root", "left"]);
        expect(loaded.lastDieA).toBe(6);
        expect(loaded.lastDieB).toBe(1);
        expect(loaded.lastOutcome).toBe("double");
    });
});

describe("number2 controller", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("applies Double outcomes to total, streaks, luck, and prime-streak Boom tokens", () => {
        const state = createNumber2State();
        const controller = makeController(state);

        controller.applyRollOutcome({ isDouble: true, dieA: 2, dieB: 2 }, { silent: true });
        controller.applyRollOutcome({ isDouble: true, dieA: 3, dieB: 3 }, { silent: true });

        expect(controller.totalBig()).toBe(8n);
        expect(state.lastOutcome).toBe("double");
        expect(state.streakDouble).toBe(2);
        expect(state.streakNothing).toBe(0);
        expect(state.lifetimeDoubles).toBe(2);
        expect(state.luck).toBe(4);
        expect(state.boomTokens).toBe(1);
    });

    it("applies Nothing outcomes with the In for a Penny floor", () => {
        const state = createNumber2State();
        state.totalStr = "128";
        state.upgradeLevels = { in_for_a_penny: 2 };
        const controller = makeController(state, {
            getUpgrades: () => [
                {
                    id: "in_for_a_penny",
                    category: "bust",
                    maxLevel: 6,
                    cost: [2, 4, 7, 11, 16, 22],
                    nothingFloorByLevel: [2, 4, 8, 16, 32, 64]
                }
            ]
        });

        controller.applyRollOutcome({ isDouble: false, dieA: 1, dieB: 2 }, { silent: true });

        expect(controller.totalBig()).toBe(4n);
        expect(state.lastOutcome).toBe("nothing");
        expect(state.streakNothing).toBe(1);
        expect(state.streakDouble).toBe(0);
        expect(state.lifetimeNothings).toBe(1);
        expect(state.luck).toBe(1);
    });

    it("buys upgrades through injected upgrade definitions", () => {
        stubDocument();
        const addToLog = vi.fn();
        const autosaveNow = vi.fn();
        const state = createNumber2State();
        state.boomTokens = 3;
        const controller = makeController(state, {
            addToLog,
            autosaveNow,
            getUpgrades: () => [
                {
                    id: "hot_streak",
                    name: "Hot Streak",
                    category: "boom",
                    maxLevel: 2,
                    cost: [2, 3]
                }
            ]
        });

        controller.tryBuyUpgrade("hot_streak");

        expect(state.upgradeLevels.hot_streak).toBe(1);
        expect(state.boomTokens).toBe(1);
        expect(autosaveNow).toHaveBeenCalledOnce();
        expect(addToLog).toHaveBeenCalledWith(expect.stringContaining("Hot Streak"), "milestone");
    });

    it("starts Number 2 once when switching to its mode", () => {
        const addToLog = vi.fn();
        const autosaveNow = vi.fn();
        const refreshOverviewAndAscensionPanelsIfOpen = vi.fn();
        const state = createNumber2State();
        const controller = makeController(state, {
            addToLog,
            autosaveNow,
            refreshOverviewAndAscensionPanelsIfOpen
        });

        expect(controller.handleModeSwitched(1)).toBe(false);
        expect(state.started).toBe(false);

        expect(controller.handleModeSwitched(2)).toBe(true);
        expect(state.started).toBe(true);
        expect(addToLog).toHaveBeenCalledOnce();
        expect(refreshOverviewAndAscensionPanelsIfOpen).toHaveBeenCalledOnce();
        expect(autosaveNow).toHaveBeenCalledOnce();

        expect(controller.handleModeSwitched(2)).toBe(false);
        expect(addToLog).toHaveBeenCalledOnce();
    });

    it("reconciles locked and unstarted Number 2 state without leaking progress", () => {
        const lockedState = createNumber2State();
        lockedState.started = true;
        lockedState.totalStr = "1024";
        lockedState.luck = 9;
        const lockedController = makeController(lockedState, {
            isUnlocked: () => false
        });

        lockedController.reconcileLockState();

        expect(lockedState.started).toBe(false);
        expect(lockedState.totalStr).toBe("2");
        expect(lockedState.luck).toBe(0);

        const unstartedState = createNumber2State();
        unstartedState.totalStr = "2048";
        unstartedState.luck = 10;
        const unstartedController = makeController(unstartedState);

        unstartedController.reconcileLockState();

        expect(unstartedState.started).toBe(false);
        expect(unstartedState.totalStr).toBe("2");
        expect(unstartedState.luck).toBe(0);
    });
});

describe("number2 module definition", () => {
    it("reports overview, ascension readiness, and save/load through the controller", () => {
        const state = createNumber2State();
        state.started = true;
        state.totalStr = "1024";
        state.boomTokens = 1;
        state.bustTokens = 2;
        state.luck = 3;
        const controller = makeController(state);
        const module = createNumber2ModuleDefinition(controller, state, {
            isUnlocked: () => true,
            formatCount
        });

        expect(module.getLabel()).toBe("Number 2 — Double or Nothing");
        expect(module.isAscensionReady()).toBe(true);
        expect(module.getOverviewDetails()).toBe("Total 1024 · Boom 1 · Bust 2 · Luck 3");

        module.applySaveData({ number2SaveVersion: 4, totalStr: "256", started: true, luck: 7 });

        expect(module.getSaveData().totalStr).toBe("256");
        expect(module.getSaveData().luck).toBe(7);
    });
});
