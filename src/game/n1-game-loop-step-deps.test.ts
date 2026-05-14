import { describe, expect, it } from "vitest";

import { BLACK_HOLE_EVAPORATION_CAP } from "./number1-black-hole.js";
import { HAND_BASE_SPEED } from "./n1-hands.js";

import { assembleNumber1GameLoopStepDeps } from "./n1-game-loop-step-deps.js";

describe("assembleNumber1GameLoopStepDeps", () => {
    it("pins handBaseSpeed / tickCap and folds injected fields", () => {
        const d = assembleNumber1GameLoopStepDeps({
            foo: "bar",
            handBaseSpeed: 99999,
            tickCap: -1,
            empty: ""
        }) as Record<string, unknown>;

        expect(d.handBaseSpeed).toBe(HAND_BASE_SPEED);
        expect(d.tickCap).toBe(BLACK_HOLE_EVAPORATION_CAP);
        expect(d.foo).toBe("bar");
    });
});
