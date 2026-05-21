import { describe, expect, it } from "vitest";
import { formatComboDiscoveryMilestoneCountdown } from "./modules/number1/combo-discovery.js";

describe("n1-combo-discovery-milestone-ui", () => {
    it("formats countdown as m:ss with zero padding", () => {
        expect(formatComboDiscoveryMilestoneCountdown(0)).toBe("0:00");
        expect(formatComboDiscoveryMilestoneCountdown(59000)).toBe("0:59");
        expect(formatComboDiscoveryMilestoneCountdown(60500)).toBe("1:01");
        expect(formatComboDiscoveryMilestoneCountdown(-1000)).toBe("0:00");
    });
});
