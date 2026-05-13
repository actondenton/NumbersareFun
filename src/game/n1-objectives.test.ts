import { describe, expect, it } from "vitest";
import {
    getObjectiveProgress,
    isObjectiveComplete,
    renderObjective
} from "./n1-objectives.js";

const formatCount = (n: number) => String(n);

function fakeDocument() {
    return {
        createElement: (tagName: string) => ({
            tagName,
            textContent: "",
            style: {} as Record<string, string>
        })
    };
}

describe("Number 1 objective helpers", () => {
    it("computes goal progress and completion from total changes", () => {
        const obj = { goal: 100, text: "Reach a hundred", achieved: false };

        expect(getObjectiveProgress(obj, 25, formatCount)).toEqual({
            pct: 25,
            label: "25 / 100"
        });
        expect(isObjectiveComplete(obj, 99)).toBe(false);
        expect(isObjectiveComplete(obj, 100)).toBe(true);
    });

    it("uses custom progress and completion functions defensively", () => {
        expect(getObjectiveProgress({
            text: "Custom",
            getProgress: () => ({ pct: 150, label: "done" })
        }, 0, formatCount)).toEqual({ pct: 100, label: "done" });

        expect(isObjectiveComplete({
            text: "Throws",
            isComplete: () => { throw new Error("bad objective"); }
        }, 0)).toBe(false);
    });

    it("renders objective list items and marks completed objectives", () => {
        const obj = { goal: 10, text: "Unlock something", achieved: false };
        const li = renderObjective(obj, 10, formatCount, fakeDocument() as unknown as Document) as unknown as {
            textContent: string;
            style: Record<string, string>;
        };

        expect(obj.achieved).toBe(true);
        expect(li.textContent).toBe("Reach 10 — Unlock something (10 / 10)");
        expect(li.style.textDecoration).toBe("line-through");
        expect(li.style.color).toBe("#4CAF50");
    });
});
