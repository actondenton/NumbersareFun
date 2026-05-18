import { describe, expect, it } from "vitest";
import { createConfettiSprayer, fillConfettiParticles } from "./modules/number1/vfx.js";

function createFakeDocument() {
    const body = createFakeElement();
    return {
        body,
        createElement: () => createFakeElement()
    };
}

function createFakeElement() {
    const children: any[] = [];
    const el: any = {
        children,
        className: "",
        parentNode: null,
        style: {
            setProperty(name: string, value: string) {
                this[name] = value;
            }
        },
        appendChild(child: any) {
            child.parentNode = el;
            children.push(child);
            return child;
        },
        replaceChildren() {
            children.length = 0;
        },
        remove() {
            if (!el.parentNode) return;
            const idx = el.parentNode.children.indexOf(el);
            if (idx >= 0) el.parentNode.children.splice(idx, 1);
            el.parentNode = null;
        },
        getBoundingClientRect() {
            return { left: 10, top: 20, width: 100, height: 50 };
        }
    };
    return el;
}

describe("Number 1 VFX helpers", () => {
    it("fills confetti particles around an origin element", () => {
        const doc = createFakeDocument();
        const container = createFakeElement();
        const origin = createFakeElement();

        fillConfettiParticles(container, origin, { document: doc as any, random: () => 0.5 });

        expect(container.children).toHaveLength(18);
        expect(container.children[0].className).toBe("confetti-particle");
        expect(container.children[0].style.background).toBe("#E91E63");
    });

    it("creates a sprayer that supports regular and coalesced bursts", () => {
        const doc = createFakeDocument();
        const origin = createFakeElement();
        const timers: Function[] = [];
        const spray = createConfettiSprayer({
            document: doc as any,
            body: doc.body,
            defaultOriginEl: origin,
            random: () => 0.5,
            setTimeoutFn: (fn: Function) => {
                timers.push(fn);
                return timers.length;
            },
            clearTimeoutFn: () => {}
        });

        spray();
        expect(doc.body.children).toHaveLength(1);

        spray(origin, { holdRepeatCoalesce: true });
        spray(origin, { holdRepeatCoalesce: true });
        expect(doc.body.children).toHaveLength(2);

        timers.forEach(fn => fn());
        expect(doc.body.children).toHaveLength(0);
    });
});
