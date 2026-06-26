import { afterEach, describe, expect, it, vi } from "vitest";

import { createNumber1ObjectivesBoot } from "./n1-objectives-boot.js";

describe("createNumber1ObjectivesBoot", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
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
});
