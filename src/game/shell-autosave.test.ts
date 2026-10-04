import { afterEach, describe, expect, it, vi } from "vitest";

import { installGameShellAutosave } from "./shell-autosave.js";

describe("installGameShellAutosave", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("idle-defers interval autosave with yieldWrite and keeps beforeunload sync", () => {
        vi.useFakeTimers();
        const autosaveNow = vi.fn();
        const idleCbs: Array<() => void> = [];
        const listeners = new Map<string, () => void>();
        vi.stubGlobal("requestIdleCallback", (cb: () => void) => {
            idleCbs.push(cb);
            return 1;
        });
        vi.stubGlobal("window", {
            addEventListener: (type: string, fn: () => void) => {
                listeners.set(type, fn);
            }
        });

        installGameShellAutosave({ autosaveNow, intervalMs: 10000 });

        expect(listeners.has("beforeunload")).toBe(true);

        vi.advanceTimersByTime(10000);
        expect(autosaveNow).not.toHaveBeenCalled();
        expect(idleCbs).toHaveLength(1);

        idleCbs[0]();
        expect(autosaveNow).toHaveBeenCalledWith({ background: true });

        autosaveNow.mockClear();
        listeners.get("beforeunload")!();
        expect(autosaveNow).toHaveBeenCalledWith();
    });
});
