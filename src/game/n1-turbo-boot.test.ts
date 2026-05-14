import { describe, expect, it, vi } from "vitest";

import { TURBO_UNLOCK_COUNT } from "./n1-turbo.js";
import { createNumber1TurboBoot } from "./n1-turbo-boot.js";

function makeBoot(extra: Partial<Parameters<typeof createNumber1TurboBoot>[0]> = {}) {
    return createNumber1TurboBoot({
        turboScensionUpgradeBtn: null,
        turboBoostEnabledCheckbox: null,
        turboBoostToggleLabelEl: null,
        setTurboBoostEnabled: () => {},
        tryTurboLevelerPurchases: () => {},
        updateTurboBoostUI: () => {},
        updateRateDisplay: () => {},
        tryTurboScensionActivationUpgrade: () => false,
        getTotalChanges: () => 0,
        getTurboBoostUnlocked: () => false,
        onTurboSystemFirstUnlock: () => {},
        turboBoostWrapEl: null,
        addToLog: () => {},
        formatCount: n => String(n),
        checkStoryBanners: () => {},
        ...extra
    });
}

describe("createNumber1TurboBoot", () => {
    it("tryUnlockTurboIfEligible is a no-op below the unlock threshold", () => {
        const onTurboSystemFirstUnlock = vi.fn();
        const checkStoryBanners = vi.fn();
        const boot = makeBoot({
            getTotalChanges: () => TURBO_UNLOCK_COUNT - 1,
            onTurboSystemFirstUnlock,
            checkStoryBanners
        });
        boot.tryUnlockTurboIfEligible();
        expect(onTurboSystemFirstUnlock).not.toHaveBeenCalled();
        expect(checkStoryBanners).not.toHaveBeenCalled();
    });

    it("tryUnlockTurboIfEligible runs first-unlock callbacks and reveals the Turbo wrap", () => {
        let unlocked = false;
        const onTurboSystemFirstUnlock = vi.fn(() => {
            unlocked = true;
        });
        const addToLog = vi.fn();
        const checkStoryBanners = vi.fn();
        const wrap = {
            style: { display: "none" as string },
            setAttribute: vi.fn()
        } as unknown as HTMLElement;
        const boot = makeBoot({
            getTotalChanges: () => TURBO_UNLOCK_COUNT,
            getTurboBoostUnlocked: () => unlocked,
            onTurboSystemFirstUnlock,
            turboBoostWrapEl: wrap,
            addToLog,
            checkStoryBanners
        });
        boot.tryUnlockTurboIfEligible();
        expect(onTurboSystemFirstUnlock).toHaveBeenCalledTimes(1);
        expect(addToLog).toHaveBeenCalledWith(
            "Turbo system unlocked at " + TURBO_UNLOCK_COUNT + ".",
            "milestone"
        );
        expect(checkStoryBanners).toHaveBeenCalledTimes(1);
        expect(wrap.style.display).toBe("");
        expect(wrap.setAttribute).toHaveBeenCalledWith("aria-hidden", "false");
    });

    it("syncTurboBoostToggleDom mirrors enabled state into checkbox + label", () => {
        const checkbox = { checked: true, addEventListener: vi.fn() } as unknown as HTMLInputElement;
        const label = { textContent: "On" } as HTMLSpanElement;
        const boot = makeBoot({
            turboBoostEnabledCheckbox: checkbox,
            turboBoostToggleLabelEl: label
        });
        boot.syncTurboBoostToggleDom(false);
        expect(checkbox.checked).toBe(false);
        expect(label.textContent).toBe("Off");
        boot.syncTurboBoostToggleDom(true);
        expect(checkbox.checked).toBe(true);
        expect(label.textContent).toBe("On");
    });
});
