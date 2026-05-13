import { describe, expect, it } from "vitest";
import {
    UPGRADE_ETA_CPS_SMOOTH_ALPHA,
    createUpgradeEtaSmoother,
    formatUpgradeAffordEtaDuration
} from "./n1-upgrade-eta.js";

describe("n1-upgrade-eta", () => {
    it("formats duration tiers", () => {
        expect(formatUpgradeAffordEtaDuration(-1)).toBe("—");
        expect(formatUpgradeAffordEtaDuration(45)).toBe("~45s at current rate");
        expect(formatUpgradeAffordEtaDuration(90)).toBe("~2 min at current rate");
        expect(formatUpgradeAffordEtaDuration(86400 * 3)).toMatch(/^~\d+ d at current rate$/);
    });

    it("smoothing tracks instant CPS after bump passes", () => {
        let cps = 0;
        const s = createUpgradeEtaSmoother({ getHandEffectiveCps: () => cps });

        s.bumpPass();
        cps = 10;
        s.bumpPass();
        expect(s.getSmoothedHandCpsForUpgradeEta(0)).toBe(10);

        cps = 20;
        s.bumpPass();
        expect(s.getSmoothedHandCpsForUpgradeEta(0)).toBeCloseTo(10 + UPGRADE_ETA_CPS_SMOOTH_ALPHA * 10, 5);

        cps = 0;
        s.bumpPass();
        const afterZero = s.getSmoothedHandCpsForUpgradeEta(0);
        expect(afterZero).toBeGreaterThanOrEqual(0);
        expect(afterZero).toBeLessThan(10 + UPGRADE_ETA_CPS_SMOOTH_ALPHA * 10);
    });

    it("formatAffordEtaLine uses smoothed CPS per hand", () => {
        let cps = 100;
        const s = createUpgradeEtaSmoother({
            getHandEffectiveCps: () => cps
        });
        s.bumpPass();
        cps = 100;
        s.bumpPass();

        const line = s.formatAffordEtaLine(0, 500, 0);
        expect(line).toContain("Est.:");
        expect(line).not.toContain("ready now");

        const lineReady = s.formatAffordEtaLine(500, 500, 0);
        expect(lineReady).toContain("ready now");
    });
});
