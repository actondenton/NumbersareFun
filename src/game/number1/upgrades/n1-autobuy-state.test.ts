import { describe, expect, it } from "vitest";
import {
    applyAutobuyGrantToUnlockedHands,
    copyAutobuyArraysFromSave,
    resetAutobuyHandArrays
} from "./n1-autobuy-state.js";

describe("n1-autobuy-state", () => {
    it("resetAutobuyHandArrays mutates arrays in place", () => {
        const enabled = [false, true, false];
        const countdown = [5, 10];
        const enabledRef = enabled;
        const countdownRef = countdown;
        resetAutobuyHandArrays(enabled, countdown, true);
        expect(enabled).toBe(enabledRef);
        expect(countdown).toBe(countdownRef);
        expect(enabled).toEqual([true]);
        expect(countdown).toEqual([0]);
    });

    it("copyAutobuyArraysFromSave mutates arrays in place", () => {
        const enabled = [true];
        const countdown = [0];
        const enabledRef = enabled;
        copyAutobuyArraysFromSave(enabled, countdown, [false, true, true], [3, 0]);
        expect(enabled).toBe(enabledRef);
        expect(enabled).toEqual([false, true, true]);
        expect(countdown).toEqual([3, 0]);
    });

    it("applyAutobuyGrantToUnlockedHands enables every unlocked hand", () => {
        const enabled = [false, false];
        applyAutobuyGrantToUnlockedHands(enabled, 3, true);
        expect(enabled).toEqual([true, true, true]);
    });

    it("applyAutobuyGrantToUnlockedHands is a no-op without grant", () => {
        const enabled = [false, true];
        applyAutobuyGrantToUnlockedHands(enabled, 2, false);
        expect(enabled).toEqual([false, true]);
    });
});
