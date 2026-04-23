import { describe, expect, it, vi } from "vitest";
import { CURTAIN_DURATION_MS, isCurtainEnabled } from "./curtain.js";

describe("curtain", () => {
  it("uses stable curtain duration (legacy parity)", () => {
    expect(CURTAIN_DURATION_MS).toBe(900);
  });

  it("defaults curtain on when settings missing", () => {
    const getItem = vi.fn().mockReturnValue(null);
    vi.stubGlobal("localStorage", { getItem });
    expect(isCurtainEnabled()).toBe(true);
    vi.unstubAllGlobals();
  });
});
