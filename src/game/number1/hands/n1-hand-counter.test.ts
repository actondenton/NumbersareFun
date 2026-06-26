import { afterEach, describe, expect, it, vi } from "vitest";
import { HandCounter } from "./n1-hand-counter.js";

function createFakeElement(id = "") {
    const children: any[] = [];
    const classNames = new Set<string>();
    const el: any = {
        id,
        children,
        textContent: "",
        parentNode: null,
        style: {},
        className: "",
        classList: {
            add: (name: string) => classNames.add(name),
            contains: (name: string) => classNames.has(name)
        },
        appendChild(child: any) {
            child.parentNode = el;
            children.push(child);
            return child;
        }
    };
    return el;
}

describe("Number 1 HandCounter", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("renders hand art and applies ticks modulo ten", () => {
        vi.useFakeTimers();
        const mount = createFakeElement("hands-container");
        const doc = {
            createElement: () => createFakeElement(),
            getElementById: (id: string) => id === "hands-container" ? mount : null
        };
        vi.stubGlobal("document", doc);

        const hand = new HandCounter(1, 1000, null);
        expect(mount.children).toHaveLength(1);
        expect(hand.count).toBe(1);
        expect(hand.el.textContent).toContain("|  1  |");

        hand.applyTicks(9);
        expect(hand.count).toBe(10);
        expect(hand.el.textContent).toContain("|  10 |");

        hand.applyTicks(1n);
        expect(hand.count).toBe(1);

        vi.runAllTimers();
        expect(hand.el.classList.contains("visible")).toBe(true);
    });
});
