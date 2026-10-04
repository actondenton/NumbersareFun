import { describe, expect, it } from "vitest";

import { createNumber1Runtime } from "./state/n1-runtime.js";
import { createN1GameContext } from "./n1-game-context.js";

describe("createN1GameContext", () => {
    it("exposes runtime slices and late-binds installed methods", () => {
        const runtime = createNumber1Runtime({ maxHands: 3 });
        const g = createN1GameContext(runtime, null);
        expect(g.run).toBe(runtime.run);
        expect(g.hands).toBe(runtime.hands);

        const call = g.bind("ping", () => "stub");
        expect(call()).toBe("stub");

        g.install({ ping: () => "live" });
        expect(call()).toBe("live");
        expect(g.ping()).toBe("live");
    });
});
