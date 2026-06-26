import { describe, expect, it, vi } from "vitest";

import { createPageButtonUnlocksBoot } from "./n1-page-button-unlocks-boot.js";

describe("createPageButtonUnlocksBoot", () => {
    it("shows combinations nav at two hands and refreshes ascension chrome", () => {
        const combinationsPageBtn = { style: { display: "none" } };
        const updateAscensionReadyChrome = vi.fn();
        const boot = createPageButtonUnlocksBoot({
            combinationsPageBtn,
            getUnlockedHands: () => 2,
            updateAscensionReadyChrome
        });
        boot.updatePageButtonUnlocks();
        expect(combinationsPageBtn.style.display).toBe("");
        expect(updateAscensionReadyChrome).toHaveBeenCalled();
    });

    it("hides combinations nav below two hands", () => {
        const combinationsPageBtn = { style: { display: "" } };
        const boot = createPageButtonUnlocksBoot({
            combinationsPageBtn,
            getUnlockedHands: () => 1,
            updateAscensionReadyChrome: () => {}
        });
        boot.updatePageButtonUnlocks();
        expect(combinationsPageBtn.style.display).toBe("none");
    });
});
