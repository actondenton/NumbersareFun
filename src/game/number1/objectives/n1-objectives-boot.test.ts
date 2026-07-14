import { afterEach, describe, expect, it, vi } from "vitest";

import { createNumber1ObjectivesBoot } from "./n1-objectives-boot.js";

describe("createNumber1ObjectivesBoot", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("coalesces multiple scheduleObjectiveDomFlush calls into one rAF", () => {
        const rafQueue: FrameRequestCallback[] = [];
        vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
            rafQueue.push(fn);
            return rafQueue.length;
        });
        vi.stubGlobal("cancelAnimationFrame", vi.fn());

        const flushed: string[] = [];
        const boot = createNumber1ObjectivesBoot({
            flush: () => flushed.push("flush")
        });
        boot.scheduleObjectiveDomFlush();
        boot.scheduleObjectiveDomFlush();
        expect(rafQueue).toHaveLength(1);
        rafQueue[0](0);
        expect(flushed).toEqual(["flush"]);
    });

    it("syncs achievements only while document is hidden", () => {
        vi.stubGlobal("document", { hidden: true });
        const calls: string[] = [];
        const boot = createNumber1ObjectivesBoot({
            flush: () => calls.push("flush"),
            syncAchievementsOnly: () => calls.push("memory")
        });
        boot.scheduleObjectiveDomFlush();
        expect(calls).toEqual(["memory"]);
    });

    it("throttles DOM flush and keeps memory sync on the trailing path", () => {
        vi.useFakeTimers();
        vi.setSystemTime(1_000);
        const rafQueue: FrameRequestCallback[] = [];
        vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
            rafQueue.push(fn);
            return rafQueue.length;
        });
        vi.stubGlobal("document", { hidden: false });

        const calls: string[] = [];
        const boot = createNumber1ObjectivesBoot({
            flush: () => calls.push("flush"),
            syncAchievementsOnly: () => calls.push("memory")
        });

        boot.scheduleObjectiveDomFlush();
        rafQueue.shift()?.(0);
        expect(calls).toEqual(["flush"]);

        vi.setSystemTime(1_100);
        boot.scheduleObjectiveDomFlush();
        rafQueue.shift()?.(0);
        expect(calls).toEqual(["flush", "memory"]);

        vi.advanceTimersByTime(300);
        expect(calls).toEqual(["flush", "memory", "flush"]);
    });
});
