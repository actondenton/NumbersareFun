import { describe, expect, it } from "vitest";
import { createTopCountRowFit } from "./modules/number1/top-count-row-fit.js";

describe("n1-top-count-row-fit", () => {
    it("exposes scheduler and observer init", () => {
        const { scheduleFitTopCountRow, initTopCountRowFitObservers } = createTopCountRowFit({
            getTurboFitEl: () => null,
            incrementalEl: null,
            incrementalRateEl: null
        });
        expect(typeof scheduleFitTopCountRow).toBe("function");
        expect(typeof initTopCountRowFitObservers).toBe("function");
    });
});
