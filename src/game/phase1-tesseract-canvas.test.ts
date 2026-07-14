import { describe, expect, it } from "vitest";
import {
    disposePhase1TesseractCanvasesInRoot,
    syncPhase1MassFillCssVarsInRoot,
    unmountPhase1TesseractCanvas
} from "./phase1-tesseract-canvas.js";

function createFakeElement() {
    const props = new Map<string, string>();
    return {
        props,
        style: {
            setProperty(name: string, value: string) {
                props.set(name, value);
            }
        }
    };
}

describe("Phase 1 tesseract canvas helpers", () => {
    it("syncs clamped mass fill CSS variables onto geometry hosts", () => {
        const a = createFakeElement();
        const b = createFakeElement();
        const root = {
            querySelectorAll: (selector: string) => selector === ".asc-black-hole__mass-geometry" ? [a, b] : []
        };

        syncPhase1MassFillCssVarsInRoot(root as unknown as ParentNode, 1.25);

        expect(a.props.get("--asc-p1-mass-fill")).toBe("1.00000000");
        expect(b.props.get("--asc-p1-mass-fill")).toBe("1.00000000");
    });

    it("treats invalid fill ratios as empty", () => {
        const el = createFakeElement();
        const root = {
            querySelectorAll: () => [el]
        };

        syncPhase1MassFillCssVarsInRoot(root as unknown as ParentNode, Number.NaN);

        expect(el.props.get("--asc-p1-mass-fill")).toBe("0.00000000");
    });

    it("unmount removes canvas child and dispose walks tesseract hosts", () => {
        const canvas = {
            className: "asc-black-hole__tesseract-canvas",
            parentNode: null as { removeChild: (n: unknown) => void } | null
        };
        const host = {
            querySelector(sel: string) {
                return sel.includes("canvas") ? canvas : null;
            }
        };
        canvas.parentNode = {
            removeChild(n: unknown) {
                expect(n).toBe(canvas);
                canvas.parentNode = null;
            }
        };

        unmountPhase1TesseractCanvas(host as unknown as Element);
        expect(canvas.parentNode).toBeNull();

        const root = {
            querySelectorAll: (selector: string) =>
                selector === ".asc-black-hole__tesseract" ? [host] : []
        };
        canvas.parentNode = {
            removeChild(n: unknown) {
                expect(n).toBe(canvas);
                canvas.parentNode = null;
            }
        };
        disposePhase1TesseractCanvasesInRoot(root as unknown as ParentNode);
        expect(canvas.parentNode).toBeNull();
    });
});
